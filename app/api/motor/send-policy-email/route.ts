import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId, isSameOriginRequest } from "@/lib/auth";
import { sendPolicyEmail } from "@/lib/email";

interface PolicyEmailData {
  policyNo: string;
  clientCode: string;
  fullName: string;
  email: string;
  ubo: string;
}

export async function POST(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  if (!isSameOriginRequest(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });

  let body: PolicyEmailData;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { policyNo, clientCode, fullName, email, ubo } = body;

  if (!email) {
    return NextResponse.json({ error: "Email address is required." }, { status: 400 });
  }

  if (!policyNo) {
    return NextResponse.json({ error: "Policy number is required." }, { status: 400 });
  }

  try {
    const titleMatch = fullName.match(/^(Mr|Mrs|Ms|Dr|Prof)\.?\s+/i);
    const title = titleMatch ? titleMatch[0].trim() : "Mr.";
    const nameWithoutTitle = fullName.replace(/^(Mr|Mrs|Ms|Dr|Prof)\.?\s+/i, "").trim();
    const nameParts = nameWithoutTitle.split(/\s+/);
    const firstName = nameParts[0] || "";
    const surname = nameParts.slice(1).join(" ") || "";

    const result = await sendPolicyEmail({
      title,
      firstName,
      surname,
      policyNo,
      clientCode,
      email,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Failed to send email" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("Send policy email error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}