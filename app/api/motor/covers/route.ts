import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const result = await (await getDb()).request().query(
      "SELECT Name, Code, YngExcess FROM dbo.Cover WHERE Department = 'MOTOR' ORDER BY Name"
    );
    return NextResponse.json({
      covers: result.recordset.map((row: { Name: string; Code: number; YngExcess: number }) => ({
        name: row.Name,
        code: row.Code,
        youngDriverExcess: row.YngExcess === 1,
      })),
    });
  } catch (error) {
    console.error("Motor covers lookup failed", error);
    return NextResponse.json({ covers: [] }, { status: 200 });
  }
}