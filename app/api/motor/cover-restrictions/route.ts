import { NextRequest, NextResponse } from "next/server";

import { getCurrentUserId } from "@/lib/auth";
import { loadCoverRestrictions } from "@/lib/cover-restrictions";

// GET ?vehicleClass=&country= : covers that cannot be selected for this vehicle class (usp_CurCoverinfo).
export async function GET(request: NextRequest) {
  if (!(await getCurrentUserId())) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  const vehicleClass = request.nextUrl.searchParams.get("vehicleClass") || "";
  const country = request.nextUrl.searchParams.get("country") || "Mauritius";
  try {
    return NextResponse.json(await loadCoverRestrictions(vehicleClass, country));
  } catch (error) {
    console.error("Cover restriction lookup failed", error);
    return NextResponse.json({ available: false, coverNames: [], restrictedRates: [], error: "Cover restrictions could not be loaded." }, { status: 200 });
  }
}
