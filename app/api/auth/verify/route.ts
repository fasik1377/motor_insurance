import { NextResponse } from "next/server";
import { normalizeContact } from "@/lib/contact";
import { createSession, getCurrentUserId, isSameOriginRequest } from "@/lib/auth";
import { getDb, sql } from "@/lib/db";
import { hashOtp } from "@/lib/otp";
export async function POST(request:Request){
 if(!isSameOriginRequest(request))return NextResponse.json({error:"Invalid request origin."},{status:403});
 const body=await request.json().catch(()=>null) as {contact?:unknown,type?:unknown,code?:unknown}|null;
 const type: "email" | "mobile" | ""=body?.type==="email"?"email":body?.type==="mobile"?"mobile":"";
 const normalized=type ? normalizeContact(type,body?.contact) : null;
 const contact=normalized?.value??"";
 const code=typeof body?.code==="string"?body.code.trim():"";
 if(!contact||!type||!/^\d{6}$/.test(code))return NextResponse.json({error:"Enter the six-digit verification code."},{status:400});
 try { const pool=await getDb(); let userId=await getCurrentUserId();
  const otp=await pool.request().input("contact",sql.NVarChar(254),contact).input("type",sql.VarChar(10),type).query("SELECT TOP (1) OtpId,CodeHash,ExpiresAt,AttemptCount,UsedAt FROM dbo.WebOtpCodes WHERE Contact=@contact AND ContactType=@type ORDER BY CreatedAt DESC");
  const row=otp.recordset[0];
  if(!row||row.UsedAt||new Date(row.ExpiresAt).getTime()<Date.now()||row.AttemptCount>=5)return NextResponse.json({error:"This code has expired. Request a new code."},{status:400});
  if(row.CodeHash!==hashOtp(contact,code)){await pool.request().input("otpId",sql.UniqueIdentifier,row.OtpId).query("UPDATE dbo.WebOtpCodes SET AttemptCount=AttemptCount+1 WHERE OtpId=@otpId");return NextResponse.json({error:"The verification code is incorrect."},{status:400});}
  const used=await pool.request().input("otpId",sql.UniqueIdentifier,row.OtpId).input("hash",sql.Char(64),hashOtp(contact,code)).query("UPDATE dbo.WebOtpCodes SET UsedAt=SYSUTCDATETIME() WHERE OtpId=@otpId AND UsedAt IS NULL AND ExpiresAt>SYSUTCDATETIME() AND AttemptCount<5 AND CodeHash=@hash");
  if(used.rowsAffected[0]!==1)return NextResponse.json({error:"This code has expired. Request a new code."},{status:400});
  if(userId){await pool.request().input("userId",sql.UniqueIdentifier,userId).input("contact",sql.NVarChar(type==="email"?254:30),contact).query(type==="email"?"UPDATE dbo.WebUsers SET Email=@contact,EmailVerified=1,UpdatedAt=SYSUTCDATETIME() WHERE UserId=@userId":"UPDATE dbo.WebUsers SET Mobile=@contact,MobileVerified=1,UpdatedAt=SYSUTCDATETIME() WHERE UserId=@userId");}
  else {const found=await pool.request().input("contact",sql.NVarChar(type==="email"?254:30),contact).query(type==="email"?"SELECT TOP (1) UserId FROM dbo.WebUsers WHERE Email=@contact":"SELECT TOP (1) UserId FROM dbo.WebUsers WHERE Mobile=@contact"); userId=found.recordset[0]?.UserId;
   if(!userId){const made=await pool.request().input("contact",sql.NVarChar(type==="email"?254:30),contact).query(type==="email"?"INSERT dbo.WebUsers (Email,EmailVerified) OUTPUT inserted.UserId VALUES (@contact,1)":"INSERT dbo.WebUsers (Mobile,MobileVerified) OUTPUT inserted.UserId VALUES (@contact,1)");userId=made.recordset[0].UserId;}
   if (!userId) throw new Error("The account could not be created.");
   await createSession(userId);
  }
  return NextResponse.json({ok:true});
 }catch(error){console.error("Authentication verification failed",error);return NextResponse.json({error:"Unable to save the verified account."},{status:500});}
}
