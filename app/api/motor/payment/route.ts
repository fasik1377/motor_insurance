import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId, isSameOriginRequest } from "@/lib/auth";
import { getDb, sql } from "@/lib/db";
import { sendPolicyEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  if (!await getCurrentUserId()) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  if (!isSameOriginRequest(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const clientCode = typeof body?.clientCode === "string" ? body.clientCode.trim() : "";
  const policyNo = typeof body?.policyNo === "string" ? body.policyNo.trim() : "";
  const method = typeof body?.method === "string" ? body.method : "card";
  const amount = Number(body?.amount || 0);
  const title = typeof body?.title === "string" ? body.title : "";
  const firstName = typeof body?.firstName === "string" ? body.firstName : "";
  const surname = typeof body?.surname === "string" ? body.surname : "";
  const email = typeof body?.email === "string" ? body.email : "";
  if (!amount || !["card", "bank"].includes(method)) return NextResponse.json({ error: "Payment details are incomplete." }, { status: 400 });
  const invoiceClientCode = clientCode || "WEB";
  try {
    const pool = await getDb();
    const columns = await pool.request().query("SELECT name, system_type_id FROM sys.columns WHERE object_id=OBJECT_ID('dbo.Invoice')");
    if (!columns.recordset.length) throw new Error("Invoice table is unavailable.");
    const metadata = new Map(columns.recordset.map((r: { name: string; system_type_id: number }) => [r.name, r.system_type_id]));
    const available = new Set(metadata.keys());
    const invoiceNo = Date.now() % 2000000000;
    const pairs: [string, unknown][] = [["InvNo", invoiceNo], ["ClientCode", invoiceClientCode], ["PolicyNo", policyNo || null], ["Amount", amount], ["PaymentMethod", method], ["Status", "Paid"], ["Idate", new Date()], ["Iuser", "motor-insurance-web"]];
    const numericTypes = new Set([48, 52, 56, 59, 60, 62, 106, 108, 127]);
    const selected = pairs.filter(([name, value]) => {
      if (!available.has(name)) return false;
      const typeId = metadata.get(name);
      return !numericTypes.has(typeId || 0) || value === null || typeof value === "number";
    });
    if (!selected.length) throw new Error("Invoice table has no compatible payment columns.");
    const req = pool.request();
    const names = selected.map(([name], i) => { req.input(`v${i}`, selected[i][1]); return `[${name}]`; });
    await req.query(`INSERT INTO dbo.Invoice (${names.join(",")}) VALUES (${selected.map((_, i) => `@v${i}`).join(",")})`);

    if (email && policyNo && (title || firstName || surname)) {
      const emailResult = await sendPolicyEmail({ title, firstName, surname, policyNo, clientCode: invoiceClientCode, email });
      if (!emailResult.success) {
        console.warn("Policy email failed to send:", emailResult.error);
      }
    }

    // Validate clientCode after email is generated
    if (!clientCode) {
      return NextResponse.json({ 
        error: "Search and select a client in KYC.", 
        paymentProcessed: true,
        invoiceNo 
      }, { status: 400 });
    }

    return NextResponse.json({ message: "Payment submitted successfully.", clientCode, invoiceNo }, { status: 201 });
  } catch (error) {
    console.error("Payment save failed", error);
    return NextResponse.json({ error: process.env.NODE_ENV === "development" && error instanceof Error ? error.message : "Payment could not be saved." }, { status: 500 });
  }
}