import { NextResponse } from "next/server";
import { isSameOriginRequest } from "@/lib/auth";
import { normalizeContact } from "@/lib/contact";
import { getDb, sql } from "@/lib/db";
import { deliverOtp, generateOtp, hashOtp, logOtpForDevelopment, type ContactType } from "@/lib/otp";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const body=await request.json().catch(()=>null) as {contact?:unknown,type?:unknown}|null;
  const type:ContactType|""=body?.type==="email"?"email":body?.type==="mobile"?"mobile":"";
  if(!type)return NextResponse.json({error:"Enter a valid email address or mobile number."},{status:400});
  const normalized=normalizeContact(type,body?.contact);
  if(!normalized)return NextResponse.json({error:type==="mobile"?"Use an international mobile number such as +254712345678.":"Enter a valid email address."},{status:400});
  const contact=normalized.value;
  try {
    const pool=await getDb();
    const recent=await pool.request().input("contact",sql.NVarChar(254),contact).input("type",sql.VarChar(10),type).query("SELECT TOP (1) CreatedAt FROM dbo.WebOtpCodes WHERE Contact=@contact AND ContactType=@type ORDER BY CreatedAt DESC");
    if(recent.recordset[0]&&Date.now()-new Date(recent.recordset[0].CreatedAt).getTime()<30000)return NextResponse.json({error:"Please wait 30 seconds before requesting another code."},{status:429});
    const code=generateOtp(), expiresAt=new Date(Date.now()+10*60000);
    await pool.request().input("contact",sql.NVarChar(254),contact).input("type",sql.VarChar(10),type).input("hash",sql.Char(64),hashOtp(contact,code)).input("expires",sql.DateTime2,expiresAt).query("INSERT dbo.WebOtpCodes (Contact,ContactType,CodeHash,ExpiresAt) VALUES (@contact,@type,@hash,@expires)");
    logOtpForDevelopment(type,contact,code);
    await deliverOtp(type,contact,code);
    return NextResponse.json({ok:true});
  } catch(error) { console.error("OTP delivery failed",error); const message=process.env.NODE_ENV==="development"&&error instanceof Error?error.message:"Unable to send the verification code."; return NextResponse.json({error:message},{status:500}); }
}
