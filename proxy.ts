import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const sessionCookieName = "motor_session";

export function proxy(request: NextRequest) {
  const token = request.cookies.get(sessionCookieName)?.value;
  // Reject malformed values early. The protected layouts still validate the
  // token against the database, including server-side expiry checks.
  if (token && /^[a-f0-9]{64}$/.test(token)) return NextResponse.next();
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("returnTo", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dashboard/:path*", "/buy-online/:path*", "/renew-online/:path*", "/profile/:path*", "/mobile/:path*"],
};
