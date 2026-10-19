import "server-only";

import { getDb, sql } from "@/lib/db";
import { restrictedRatesFromNames } from "@/lib/additional-risk";

export type CoverRestrictions = { available: boolean; coverNames: string[]; restrictedRates: number[] };

// Covers not available for a vehicle class and country (usp_CurCoverinfo / dbo.MotCoverDecListforVehType).
// When neither the procedure nor the table exists yet, nothing is restricted and available is false.
export async function loadCoverRestrictions(vehicleClass: string, country: string): Promise<CoverRestrictions> {
  const empty: CoverRestrictions = { available: false, coverNames: [], restrictedRates: [] };
  if (!vehicleClass.trim()) return empty;
  const pool = await getDb();
  const objects = (await pool.request().query("SELECT OBJECT_ID('dbo.usp_CurCoverinfo', 'P') AS proc_id, OBJECT_ID('dbo.MotCoverDecListforVehType', 'U') AS table_id")).recordset[0];
  let names: string[];
  if (objects?.proc_id) {
    const result = await pool.request()
      .input("VehicleClass", sql.VarChar(50), vehicleClass.trim().slice(0, 50))
      .input("Country", sql.VarChar(50), (country || "Mauritius").trim().slice(0, 50))
      .execute("dbo.usp_CurCoverinfo");
    names = result.recordset.map((row: { CoverName: string }) => row.CoverName);
  } else if (objects?.table_id) {
    const result = await pool.request()
      .input("vehicleClass", sql.VarChar(50), vehicleClass.trim().slice(0, 50))
      .input("country", sql.VarChar(50), (country || "Mauritius").trim().slice(0, 50))
      .query("SELECT DISTINCT CoverName FROM dbo.MotCoverDecListforVehType WHERE VehicleType = @vehicleClass AND Country = @country ORDER BY CoverName");
    names = result.recordset.map((row: { CoverName: string }) => row.CoverName);
  } else {
    return empty;
  }
  return { available: true, coverNames: names, restrictedRates: restrictedRatesFromNames(names) };
}
