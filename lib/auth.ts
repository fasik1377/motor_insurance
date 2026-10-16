import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";

import { getDb, sql } from "@/lib/db";

export const sessionCookieName = "motor_session";
// Sessions are intentionally short-lived; users must verify again after one hour.
const sessionDurationMs = 60 * 60 * 1000;
const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

function sessionCookieOptions(expires: Date) {
  return { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", expires, maxAge: Math.max(0, Math.floor((expires.getTime() - Date.now()) / 1000)), priority: "high" as const };
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + sessionDurationMs);
  const transaction = new sql.Transaction(await getDb());
  await transaction.begin(sql.ISOLATION_LEVEL.READ_COMMITTED);
  try {
    await new sql.Request(transaction)
      .input("userId", sql.UniqueIdentifier, userId)
      .input("tokenHash", sql.Char(64), hashToken(token))
      .input("expiresAt", sql.DateTime2, expiresAt)
      .query("DELETE FROM dbo.WebUserSessions WHERE ExpiresAt <= SYSUTCDATETIME() OR UserId = @userId; INSERT dbo.WebUserSessions (UserId, TokenHash, ExpiresAt) VALUES (@userId, @tokenHash, @expiresAt);");
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
  (await cookies()).set(sessionCookieName, token, sessionCookieOptions(expiresAt));
}

export async function getCurrentUserId(): Promise<string | null> {
  const token = (await cookies()).get(sessionCookieName)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const result = await (await getDb()).request().input("tokenHash", sql.Char(64), hashToken(token)).query("SELECT TOP (1) UserId FROM dbo.WebUserSessions WHERE TokenHash = @tokenHash AND ExpiresAt > SYSUTCDATETIME()");
  return result.recordset[0]?.UserId ?? null;
}

export async function deleteCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;
  try {
    if (token && /^[a-f0-9]{64}$/.test(token)) {
      await (await getDb()).request().input("tokenHash", sql.Char(64), hashToken(token)).query("DELETE FROM dbo.WebUserSessions WHERE TokenHash = @tokenHash");
    }
  } finally {
    cookieStore.set(sessionCookieName, "", sessionCookieOptions(new Date(0)));
  }
}

export function isSameOriginRequest(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try { return new URL(origin).origin === new URL(request.url).origin; } catch { return false; }
}
