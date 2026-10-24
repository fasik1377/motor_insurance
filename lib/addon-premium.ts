import "server-only";

import { getDb, sql } from "@/lib/db";
import { ADDON_TARIFF_NAMES, PER_PERSON_COVERS } from "@/lib/additional-risk";

export type AddOnQuote = { amount: number; unitAmount: number; isFree: boolean; success: boolean; errorMsg: string };
export type AddOnRequest = {
  vehicleType: string; vehicleClass: string; country: string; cover: string;
  issueDate: string; fromDate: string; manufactureDate: string; cc: number;
  covers: { rate: number; count: number }[];
};

// Vehicle age in years (2 decimals) at the start of cover, as passed to usp_GetAdditionalPremium.
export function vehicleAge(manufactureDate: string, fromDate: string): number {
  const made = new Date(manufactureDate), from = new Date(fromDate);
  if (Number.isNaN(made.valueOf()) || Number.isNaN(from.valueOf()) || from < made) return 0;
  return Math.floor(((from.valueOf() - made.valueOf()) / (365.25 * 24 * 3600 * 1000)) * 100) / 100;
}

type Lookup = { coverType: string; name: string; age: number; cc: number; number: number; isNew: boolean; isPrivateCar: boolean; country: string; vehType: string; vClass: string; issDate: string };
type Pool = Awaited<ReturnType<typeof getDb>>;

// Port of usp_GetAdditionalPremium (the procedure itself is used when it exists in the database).
async function additionalPremium(pool: Pool, hasProc: boolean, l: Lookup): Promise<{ amountOrRate: number; isFree: boolean; success: boolean }> {
  if (hasProc) {
    const r = await pool.request()
      .input("CoverType", sql.VarChar(30), l.coverType).input("AddOnCoverName", sql.VarChar(100), l.name)
      .input("Age", sql.Decimal(9, 2), l.age).input("CC", sql.Int, Math.trunc(l.cc)).input("AddOnCoverNumber", sql.Decimal(18, 4), l.number)
      .input("IsNewBusinessTariff", sql.Bit, l.isNew ? 1 : 0).input("IsPrivateCar", sql.Bit, l.isPrivateCar ? 1 : 0).input("Country", sql.VarChar(50), l.country)
      .input("VehType", sql.VarChar(50), l.vehType).input("VClass", sql.VarChar(50), l.vClass).input("IssDate", sql.Date, l.issDate)
      .output("AmountOrRate", sql.Decimal(18, 4)).output("IsFree", sql.Bit).output("Success", sql.Bit).output("ErrorMsg", sql.VarChar(500))
      .execute("dbo.usp_GetAdditionalPremium");
    return { amountOrRate: Number(r.output.AmountOrRate) || 0, isFree: Boolean(r.output.IsFree), success: Boolean(r.output.Success) };
  }
  const name = l.name.trim().toUpperCase();
  // 1) Free covers (no tariff lookup).
  if (name === "STRIKE,RIOT AND CIVIL COMMO.") return { amountOrRate: 0, isFree: true, success: true };
  if (name === "CYCLONE" && l.isPrivateCar && l.coverType.trim().toUpperCase() === "COMP") return { amountOrRate: 0, isFree: true, success: true };
  // 2) Tariff lookup: Loss of Use by CC range and number of days; other covers without a CC range
  //    for non-private vehicles, and with no CC filter for private cars.
  const rows = (await pool.request()
    .input("vehType", sql.VarChar(50), l.vehType.trim()).input("vClass", sql.VarChar(50), l.vClass.trim()).input("issDate", sql.Date, l.issDate)
    .input("age", sql.Decimal(9, 2), Math.round(l.age * 100) / 100).input("name", sql.VarChar(100), name).input("country", sql.VarChar(50), l.country.trim())
    .input("isLossOfUse", sql.Bit, name === "LOSS OF USE" ? 1 : 0).input("number", sql.Decimal(18, 4), l.number).input("cc", sql.Int, Math.trunc(l.cc))
    .input("isPrivateCar", sql.Bit, l.isPrivateCar ? 1 : 0).input("isNew", sql.Bit, l.isNew ? 1 : 0)
    .query(`SELECT TOP (1) ISNULL(CASE WHEN @isNew = 1 THEN t.AmountNew ELSE t.AmountRen END, 0) AS AmountOrRate
            FROM dbo.MotTariffOthersMast AS t
            WHERE LTRIM(RTRIM(t.VehType)) = @vehType AND LTRIM(RTRIM(t.VehSType)) = @vClass
              AND @issDate BETWEEN t.EffFrom AND t.EffTo AND @age BETWEEN t.VAgefrom AND t.VAgeto
              AND UPPER(LTRIM(RTRIM(t.Name))) = @name AND LTRIM(RTRIM(t.Country)) = @country
              AND ((@isLossOfUse = 1 AND t.Rate = @number AND @cc BETWEEN t.CCfrom AND t.CCto)
                OR (@isLossOfUse = 0 AND @isPrivateCar = 0 AND (t.CCfrom IS NULL OR t.CCfrom = 0))
                OR (@isLossOfUse = 0 AND @isPrivateCar = 1))`)).recordset;
  if (!rows.length) return { amountOrRate: 0, isFree: false, success: false };
  return { amountOrRate: Number(rows[0].AmountOrRate) || 0, isFree: false, success: true };
}

// Prices every selected add-on cover. Per-person covers are the tariff amount x number of persons.
export async function priceAddOns(request: AddOnRequest): Promise<Record<number, AddOnQuote>> {
  const pool = await getDb();
  const hasProc = Boolean((await pool.request().query("SELECT OBJECT_ID('dbo.usp_GetAdditionalPremium', 'P') AS id")).recordset[0]?.id);
  const isComprehensive = /COMP/i.test(request.cover);
  const isPrivateCar = request.vehicleClass.toUpperCase().includes("PRIVATE CAR");
  const age = vehicleAge(request.manufactureDate, request.fromDate || request.issueDate);
  const issDate = request.issueDate || new Date().toISOString().slice(0, 10);
  const results: Record<number, AddOnQuote> = {};
  for (const cover of request.covers) {
    const name = ADDON_TARIFF_NAMES[cover.rate];
    if (!name) continue;
    const r = await additionalPremium(pool, hasProc, {
      coverType: isComprehensive ? "COMP" : "TP", name, age, cc: request.cc, number: cover.count, isNew: true, isPrivateCar,
      country: request.country || "Mauritius", vehType: request.vehicleType, vClass: request.vehicleClass, issDate,
    });
    const quantity = PER_PERSON_COVERS.has(cover.rate) ? Math.max(cover.count, 0) : 1;
    results[cover.rate] = {
      unitAmount: r.amountOrRate,
      amount: r.isFree ? 0 : Math.round(r.amountOrRate * quantity * 100) / 100,
      isFree: r.isFree,
      success: r.success,
      errorMsg: r.success ? "" : "No tariff is set up for this cover and vehicle, so it cannot be added online. Please contact Head Office.",
    };
  }
  return results;
}
