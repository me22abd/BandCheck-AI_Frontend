import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) return NextResponse.next();

  // Allow the login page through
  if (pathname === "/admin/login") return NextResponse.next();

  const token = request.cookies.get("admin_token")?.value;
  const secret = process.env.ADMIN_SECRET?.trim();

  if (!secret || token !== secret) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
