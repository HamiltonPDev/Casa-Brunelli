import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// ─── Route Protection Proxy ────────────────────────────────────
// Next.js 16 proxy: Runs in Node.js runtime (not Edge).
// Manually checks JWT token to avoid NextAuth's automatic redirect.
// Protects all /admin/* routes except /admin/login.

const secret = process.env.AUTH_SECRET;

export default async function proxy(req: NextRequest) {
  const { nextUrl } = req;
  const isLoginPage = nextUrl.pathname === "/admin/login";
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");

  // Allow login page to pass through without auth check
  if (isLoginPage) {
    return NextResponse.next();
  }

  // Check if user is authenticated via JWT
  const token = await getToken({ req, secret });
  const isLoggedIn = !!token;

  // Redirect unauthenticated users to login
  if (isAdminRoute && !isLoggedIn) {
    const loginUrl = new URL("/admin/login", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
