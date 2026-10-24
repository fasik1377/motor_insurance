import { NextRequest, NextResponse } from "next/server";

import { priceAddOns } from "@/lib/addon-premium";
import { getCurrentUserId, isSameOriginRequest } from "@/lib/auth";

const text = (value: unknown, max = 100) => (typeof value === "string" ? value.trim().slice(0, max) : "");

// POST: tariff amount of each selected add-on cover (usp_GetAdditionalPremium / dbo.MotTariffOthersMast).
export async function POST(request: NextRequest) {
  if (!(await getCurrentUserId())) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  if (!isSameOriginRequest(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const covers = (Array.isArray(body.covers) ? body.covers : []).slice(0, 30)
    .map((c) => ({ rate: Number((c as Record<string, unknown>)?.rate) || 0, count: Math.trunc(Number((c as Record<string, unknown>)?.count) || 0) }))
    .filter((c) => c.rate > 0);
  try {
    const results = await priceAddOns({
      vehicleType: text(body.vehicleType, 50), vehicleClass: text(body.vehicleClass, 50), country: text(body.country, 50) || "Mauritius",
      cover: text(body.cover), issueDate: text(body.issueDate, 10), fromDate: text(body.fromDate, 10), manufactureDate: text(body.manufactureDate, 10),
      cc: Number(String(body.cc ?? "").replace(/[^0-9.]/g, "")) || 0, covers,
    });
    return NextResponse.json({ results });
  } catch (error) {
    console.error("Add-on premium lookup failed", error);
    return NextResponse.json({ error: "Add-on premiums could not be calculated." }, { status: 500 });
  }
}
