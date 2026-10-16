import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const db = await getDb();
    const result = await db
      .request()
      .query("SELECT * FROM dbo.Bank WHERE Active = 1 ORDER BY Name");
    return NextResponse.json({ banks: result.recordset });
  } catch (error) {
    console.error("Banks lookup failed", error);
    return NextResponse.json({ banks: [] }, { status: 200 });
  }
}