import { NextRequest, NextResponse } from "next/server";

import { getCurrentUserId, isSameOriginRequest } from "@/lib/auth";
import { getDb, sql } from "@/lib/db";

type Input = Record<string, unknown>;
const clean = (value: unknown, max = 200) => typeof value === "string" ? value.trim().slice(0, max) : "";
const number = (value: unknown) => Number.isFinite(Number(value)) ? Number(value) : 0;
const parseDate = (value: unknown) => { const result = new Date(clean(value, 40)); return Number.isNaN(result.valueOf()) ? null : result; };

function validate(body: Input) {
  const proposal = {
    clientCode: clean(body.clientCode, 20), agentCode: clean(body.agentCode, 20), country: clean(body.country, 50) || "Mauritius",
    vehicleType: clean(body.vehicleType, 100), fuelType: clean(body.fuelType, 30), vehicleClass: clean(body.vehicleClass, 100), vehicleStatus: clean(body.vehicleStatus, 20),
    issueDate: parseDate(body.issueDate), fromDate: parseDate(body.fromDate), toDate: parseDate(body.toDate), vehicleNo: clean(body.vehicleNo, 50).toUpperCase().replace(/[^A-Z0-9]/g, "").replace(/^([A-Z]+)(\d+)$/, "$1-$2"),
    make: clean(body.make, 100), model: clean(body.model, 100), engineNo: clean(body.engineNo, 100), chassisNo: clean(body.chassisNo, 100), colour: clean(body.colour, 50),
    seating: number(body.seating), cc: Number(String(body.cc ?? "").replace(/[^0-9.]/g, "")) || 0, gvw: number(body.gvw), trailerFeet: number(body.trailerFeet), coverRequired: clean(body.coverRequired, 100), sumInsured: number(body.sumInsured), pricePaid: number(body.pricePaid),
    voluntaryExcess: number(body.voluntaryExcess), compulsoryExcess: number(body.compulsoryExcess), youngDriverExcess: number(body.youngDriverExcess),
    lien: body.lien === true || clean(body.lien, 10).toLowerCase() === "true", lienType: clean(body.lienType, 50), lienholder: clean(body.lienholder, 100),
    tpfExcess: number(body.tpfExcess), tppdExcess: number(body.tppdExcess), theftExcess: number(body.theftExcess), totalLossExcess: number(body.totalLossExcess),
    additionalExcess: number(body.additionalExcess), premium: number(body.premium), invoiceAmount: number(body.invoiceAmount), remarks: clean(body.remarks, 1000),
  };
  const errors: Record<string, string> = {};
  
  if (!proposal.vehicleType) errors.vehicleType = "Select the vehicle type.";
  if (!proposal.vehicleClass) errors.vehicleClass = "Select the vehicle class.";
  if (!proposal.vehicleStatus) errors.vehicleStatus = "Select the vehicle status.";
  if (!proposal.issueDate) errors.issueDate = "Enter a valid issue date.";
  if (!proposal.fromDate) errors.fromDate = "Enter a valid cover start date.";
  if (!proposal.toDate) errors.toDate = "Enter a valid cover end date.";
  if (proposal.fromDate && proposal.toDate && proposal.toDate <= proposal.fromDate) errors.toDate = "Cover end date must be after its start date.";
  if (!proposal.vehicleNo) errors.vehicleNo = "Enter the registration number.";
  if (!proposal.make) errors.make = "Select the vehicle make.";
  if (!proposal.model) errors.model = "Select the vehicle model.";
  if (!proposal.engineNo) errors.engineNo = "Enter the engine number.";
  if (!proposal.chassisNo) errors.chassisNo = "Enter the chassis number.";
  if (!proposal.coverRequired) errors.coverRequired = "Select the required cover.";
  if (String(body.seating ?? "").replace(/\D/g, "").length > 2) errors.seating = "Seating must be at most two digits.";
  if (["GOODS VEHICLE(PRIVATE)", "GOODS VEHICLE(PUBLIC)"].includes(proposal.vehicleType.toUpperCase()) && proposal.gvw <= 0) errors.gvw = "Gross vehicle weight is required for this vehicle type.";
  if (["TANKER", "TRAILER", "TRACTOR"].includes(proposal.vehicleType.toUpperCase()) && proposal.trailerFeet <= 0) errors.trailerFeet = "Trailer feet is required for this vehicle type.";
  if (!proposal.lien) errors.lien = "Lien is mandatory.";
  if (proposal.lien && !proposal.lienType) errors.lienType = "Select the lien type.";
  if (proposal.lien && !proposal.lienholder) errors.lienholder = "Enter the lienholder.";
  if (proposal.coverRequired.toUpperCase().includes("COMP") && proposal.sumInsured <= 0) errors.sumInsured = "Enter the sum insured for comprehensive cover.";
  if (proposal.premium <= 0) errors.premium = "Calculate and enter the basic premium.";
  if (proposal.invoiceAmount <= 0) errors.invoiceAmount = "Enter the invoice amount.";
  if (proposal.pricePaid <= 0) errors.pricePaid = "Enter the price paid for the vehicle.";
  return { proposal, errors };
}

const aliases: Record<string, string[]> = {
  PolicyNo: ["PolicyNo", "PolicyNumber"], PolicyCode: ["PolicyCode"], CertificateNo: ["CertificateNo"], FinYear: ["FinYear"], IssDate: ["IssDate", "IssueDate"],
  Status: ["Status", "VehicleStatus"], Type: ["Type", "VehicleType"], Class: ["Class", "VehicleClass"], FromDate: ["FromDate", "StartDate"], ToDate: ["ToDate", "EndDate", "ExpiryDate"],
  AgentCode: ["AgentCode", "Agent"], ClientCode: ["ClientCode", "Client"], VehicleNo: ["VehicleNo", "RegNo", "RegistrationNo"], CoverRequired: ["CoverRequired", "Cover"],
  SumInsured: ["SumInsured"], Tlexcess: ["Tlexcess", "TotalLossExcess"], CompExcess: ["CompExcess", "CompulsoryExcess"], VolExcess: ["VolExcess", "VoluntaryExcess"],
  YDExcess: ["YDExcess", "YoungDriverExcess"], TPPDExcess: ["TPPDExcess", "TPPDEx"], TPFExcess: ["TPFExcess"], TheftExcess: ["TheftExcess"], AddExcess: ["AddExcess", "AdditionalExcess"],
  Make: ["Make"], Model: ["Model"], EngineNo: ["EngineNo", "EngNo"], ChassisNo: ["ChassisNo"], Colour: ["Colour", "Color"], Seating: ["Seating", "NoofPass"], PricePaid: ["PricePaid", "pricePaid"],
  CC: ["CC", "CylCapacity", "KW"], GVW: ["GVW", "Gvw"], Premium: ["Premium", "BasicPremium"], InvAmount: ["InvAmount", "InvoiceAmount"], Remarks: ["Remarks"],
  Country: ["Country"], FuelType: ["FuelType"], Iuser: ["Iuser"], Idate: ["Idate"],
};
const quote = (name: string) => `[${name.replaceAll("]", "]]" )}]`;

async function insertMapped(transaction: InstanceType<typeof sql.Transaction>, table: string, values: Record<string, unknown>) {
  const schema = await new sql.Request(transaction).input("table", sql.NVarChar(128), table).query("SELECT c.name FROM sys.columns c JOIN sys.tables t ON t.object_id=c.object_id JOIN sys.schemas s ON s.schema_id=t.schema_id WHERE s.name='dbo' AND t.name=@table");
  const available = new Set(schema.recordset.map((row: { name: string }) => row.name));
  if (!available.size) throw new Error(`dbo.${table} is not available.`);
  const request = new sql.Request(transaction); const columns: string[] = []; const parameters: string[] = []; let index = 0;
  for (const [key, value] of Object.entries(values)) {
    const column = aliases[key]?.find((candidate) => available.has(candidate));
    if (!column || value === undefined) continue;
    const parameter = `value${index++}`; columns.push(quote(column)); parameters.push(`@${parameter}`); request.input(parameter, value);
  }
  await request.query(`INSERT INTO dbo.${quote(table)} (${columns.join(",")}) VALUES (${parameters.join(",")})`);
}

export async function POST(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  if (!isSameOriginRequest(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  let body: Input; try { body = await request.json() as Input; } catch { return NextResponse.json({ error: "The request body must be valid JSON." }, { status: 400 }); }
  const { proposal, errors } = validate(body);
  if (Object.keys(errors).length) return NextResponse.json({ error: "Complete the required new-business fields.", errors }, { status: 400 });
  const transaction = new sql.Transaction(await getDb());
  try {
    await transaction.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);
    const duplicate = await new sql.Request(transaction).input("vehicleNo", sql.VarChar(50), proposal.vehicleNo).input("issueDate", sql.DateTime, proposal.issueDate).query("SELECT TOP (1) PolicyNo FROM dbo.MotorPro WITH (UPDLOCK,HOLDLOCK) WHERE VehicleNo=@vehicleNo AND (Cancel<>1 OR Cancel IS NULL) AND ToDate>@issueDate");
    if (duplicate.recordset[0]) { await transaction.rollback(); return NextResponse.json({ error: `Vehicle ${proposal.vehicleNo} already has an active policy.` }, { status: 409 }); }
    const year = proposal.fromDate!.getMonth() < 3 ? proposal.fromDate!.getFullYear() - 1 : proposal.fromDate!.getFullYear();
    const department = proposal.coverRequired.toUpperCase().includes("THIRD") ? "MOTOR TP" : "MOTOR";
    const metaRequest = new sql.Request(transaction).input("year", sql.Int, year).input("class", sql.VarChar(100), proposal.vehicleClass).input("department", sql.VarChar(20), department);
    let meta;
    try {
      meta = await metaRequest.query("SELECT ISNULL(dbo.GetLatestPolicyCode(@year,'MotorMaster'),1) AS NextCode; SELECT TOP(1) Code FROM dbo.Department WHERE Name=@department; SELECT TOP(1) Branch FROM dbo.[System]; SELECT TOP(1) PolicyCode FROM dbo.VehicleType WHERE Name=@class");
    } catch (error) {
      // Older installations do not have the helper scalar function. Keep numbering
      // compatible by deriving the next number from the current financial year.
      if (!(error instanceof Error) || !/GetLatestPolicyCode/i.test(error.message)) throw error;
      meta = await new sql.Request(transaction).input("year", sql.Int, year).input("class", sql.VarChar(100), proposal.vehicleClass).input("department", sql.VarChar(20), department).query("SELECT ISNULL(MAX(PolicyCode),0)+1 AS NextCode FROM dbo.MotorMaster WHERE FinYear=@year; IF OBJECT_ID('dbo.Department','U') IS NOT NULL SELECT TOP(1) Code FROM dbo.Department WHERE Name=@department ELSE SELECT CAST(NULL AS varchar(20)) AS Code; IF OBJECT_ID('dbo.System','U') IS NOT NULL SELECT TOP(1) Branch FROM dbo.[System] ELSE SELECT CAST(NULL AS varchar(20)) AS Branch; IF OBJECT_ID('dbo.VehicleType','U') IS NOT NULL SELECT TOP(1) PolicyCode FROM dbo.VehicleType WHERE Name=@class ELSE SELECT CAST(NULL AS int) AS PolicyCode");
    }
    const policyCode = Number(meta.recordsets[0][0]?.NextCode || 1); const departmentCode = meta.recordsets[1][0]?.Code || (department === "MOTOR TP" ? "2" : "1"); const branch = meta.recordsets[2][0]?.Branch || "WEB"; const vehicleCode = meta.recordsets[3][0]?.PolicyCode || 1;
    if (!departmentCode || !branch || !vehicleCode) throw new Error("Policy numbering configuration is incomplete for this vehicle class.");
    const policyNo = `${departmentCode}/${branch}/${vehicleCode}/${String(policyCode).padStart(5, "0")}/${year}`;
    const certificateNo = `NIA/${proposal.agentCode || "WEB"}/${String(policyCode).padStart(5, "0")}/${year}`;
    const values = { PolicyNo: policyNo, PolicyCode: policyCode, CertificateNo: certificateNo, FinYear: year, IssDate: proposal.issueDate, Status: proposal.vehicleStatus, Type: proposal.vehicleType, Class: proposal.vehicleClass, FromDate: proposal.fromDate, ToDate: proposal.toDate, AgentCode: proposal.agentCode, ClientCode: proposal.clientCode, VehicleNo: proposal.vehicleNo, CoverRequired: proposal.coverRequired, SumInsured: proposal.sumInsured, Tlexcess: proposal.totalLossExcess, CompExcess: proposal.compulsoryExcess, VolExcess: proposal.voluntaryExcess, YDExcess: proposal.youngDriverExcess, TPPDExcess: proposal.tppdExcess, TPFExcess: proposal.tpfExcess, TheftExcess: proposal.theftExcess, AddExcess: proposal.additionalExcess, Make: proposal.make, Model: proposal.model, EngineNo: proposal.engineNo, ChassisNo: proposal.chassisNo, Colour: proposal.colour, Seating: proposal.seating, CC: proposal.cc, GVW: proposal.gvw, Premium: proposal.premium, InvAmount: proposal.invoiceAmount, PricePaid: proposal.pricePaid, Remarks: proposal.remarks, Country: proposal.country, FuelType: proposal.fuelType, Iuser: `web:${userId}`, Idate: new Date() };
    await insertMapped(transaction, "MotorMaster", values); await insertMapped(transaction, "MotorPro", values); await transaction.commit();
    return NextResponse.json({ message: "New business policy saved successfully.", policyNo, certificateNo }, { status: 201 });
  } catch (error) {
    try { await transaction.rollback(); } catch { /* already closed */ }
    console.error("New business save failed", error);
    return NextResponse.json({ error: process.env.NODE_ENV === "development" && error instanceof Error ? error.message : "The new business policy could not be saved." }, { status: 500 });
  }
}
