import { NextRequest, NextResponse } from "next/server";
import { getDb, sql } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vehicleClass = searchParams.get("vehicleClass");
    const coverRequired = searchParams.get("coverRequired");
    const fromDate = searchParams.get("fromDate");
    
    const db = await getDb();
    
    // Determine financial year based on fromDate (or current date)
    const date = fromDate ? new Date(fromDate) : new Date();
    const year = date.getMonth() < 3 ? date.getFullYear() - 1 : date.getFullYear();
    
    // Determine department based on cover type
    const department = coverRequired?.toUpperCase().includes("THIRD") ? "MOTOR TP" : "MOTOR";
    
    // Query to get all components for policy number generation
    const metaRequest = new sql.Request(db)
      .input("year", sql.Int, year)
      .input("class", sql.VarChar(100), vehicleClass || "")
      .input("department", sql.VarChar(20), department);
    
    let meta;
    try {
      meta = await metaRequest.query(`
        SELECT ISNULL(dbo.GetLatestPolicyCode(@year, 'MotorMaster'), 1) AS NextCode;
        SELECT TOP(1) Code FROM dbo.Department WHERE Name = @department;
        SELECT TOP(1) Branch FROM dbo.[System];
        SELECT TOP(1) PolicyCode FROM dbo.VehicleType WHERE Name = @class
      `);
    } catch (error) {
      // Fallback if GetLatestPolicyCode function doesn't exist
      if (!(error instanceof Error) || !/GetLatestPolicyCode/i.test(error.message)) throw error;
      
      meta = await new sql.Request(db)
        .input("year", sql.Int, year)
        .input("class", sql.VarChar(100), vehicleClass || "")
        .input("department", sql.VarChar(20), department)
        .query(`
          SELECT ISNULL(MAX(PolicyCode), 0) + 1 AS NextCode FROM dbo.MotorMaster WHERE FinYear = @year;
          IF OBJECT_ID('dbo.Department', 'U') IS NOT NULL SELECT TOP(1) Code FROM dbo.Department WHERE Name = @department ELSE SELECT CAST(NULL AS varchar(20)) AS Code;
          IF OBJECT_ID('dbo.System', 'U') IS NOT NULL SELECT TOP(1) Branch FROM dbo.[System] ELSE SELECT CAST(NULL AS varchar(20)) AS Branch;
          IF OBJECT_ID('dbo.VehicleType', 'U') IS NOT NULL SELECT TOP(1) PolicyCode FROM dbo.VehicleType WHERE Name = @class ELSE SELECT CAST(NULL AS int) AS PolicyCode
        `);
    }
    
    const policyCode = Number(meta.recordsets[0][0]?.NextCode || 1);
    const departmentCode = meta.recordsets[1][0]?.Code || (department === "MOTOR TP" ? "2" : "1");
    const branch = meta.recordsets[2][0]?.Branch || "WEB";
    const vehicleCode = meta.recordsets[3][0]?.PolicyCode || 1;
    
    if (!departmentCode || !branch || !vehicleCode) {
      return NextResponse.json({ error: "Policy numbering configuration is incomplete for this vehicle class." }, { status: 500 });
    }
    
    const policyNo = `${departmentCode}/${branch}/${vehicleCode}/${String(policyCode).padStart(5, "0")}/${year}`;
    
    return NextResponse.json({ policyNo });
  } catch (error) {
    console.error("Policy number lookup failed", error);
    const today = new Date();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formatDate = (date: Date) => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    };
    // Fallback to generated format
    return NextResponse.json({ policyNo: `MOT/${formatDate(today).replace(/-/g, '')}/0001` }, { status: 200 });
  }
}