import { NextResponse } from "next/server";

import { getCurrentUserId } from "@/lib/auth";
import { getDb } from "@/lib/db";

type ColumnMap = Record<string, string[]>;

const columns: ColumnMap = {
  policyNumber: ["PolicyNo", "PolicyNumber", "PolicyCode", "Code"],
  registrationNumber: ["RegNo", "RegistrationNo", "VehicleNo", "VehicleRegistrationNo"],
  cover: ["CoverRequired", "Cover", "PolicyType", "Class"],
  status: ["Status", "PolicyStatus", "Approved"],
  startDate: ["FromDate", "From", "StartDate", "EffectiveDate"],
  endDate: ["ToDate", "To", "EndDate", "ExpiryDate"],
  clientCode: ["ClientCode", "Client", "CodeClient"],
};

function quoteIdentifier(identifier: string) {
  return `[${identifier.replaceAll("]", "]] ").replace("]] ", "]] ")}]`;
}

export async function GET() {
  try {
    if (!await getCurrentUserId()) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
    const pool = await getDb();
    const schema = await pool.request().query(`
      SELECT c.name
      FROM sys.columns AS c
      INNER JOIN sys.tables AS t ON t.object_id = c.object_id
      INNER JOIN sys.schemas AS s ON s.schema_id = t.schema_id
      WHERE s.name = 'dbo' AND t.name = 'MotorPro'
    `);
    const available = new Set(schema.recordset.map((row: { name: string }) => row.name));

    if (available.size === 0) {
      return NextResponse.json({ policies: [], warning: "The MotorPro table is not available." });
    }

    const selectList = Object.entries(columns).map(([alias, candidates]) => {
      const column = candidates.find((candidate) => available.has(candidate));
      return column ? `${quoteIdentifier(column)} AS ${quoteIdentifier(alias)}` : `NULL AS ${quoteIdentifier(alias)}`;
    });
    const orderColumn = ["ToDate", "ExpiryDate", "Idate", "IssueDate"].find((candidate) => available.has(candidate));
    const orderBy = orderColumn ? ` ORDER BY ${quoteIdentifier(orderColumn)} DESC` : "";
    const result = await pool.request().query(`SELECT TOP (6) ${selectList.join(", ")} FROM dbo.MotorPro${orderBy}`);

    return NextResponse.json({ policies: result.recordset });
  } catch (error) {
    console.error("Motor policy lookup failed", error);
    return NextResponse.json({ error: "Unable to load current motor policies." }, { status: 500 });
  }
}
