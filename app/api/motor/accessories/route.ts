import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const result = await (await getDb()).request().query(
      "SELECT Name, Rate FROM dbo.AccMast WHERE Rate > 0 ORDER BY Name"
    );
    return NextResponse.json({
      accessories: result.recordset.map((row: { Name: string; Rate: number }) => ({
        name: row.Name,
        rate: row.Rate,
      })),
    });
  } catch (error) {
    console.error("Accessories lookup failed", error);
    return NextResponse.json({ accessories: [] }, { status: 200 });
  }
}