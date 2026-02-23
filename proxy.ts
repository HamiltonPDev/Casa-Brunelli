import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// ─── Route Protection Proxy ────────────────────────────────────
// Next.js 16 proxy: Runs in Node.js runtime (not Edge).
// Manually checks JWT token to avoid NextAuth's automatic redirect.
// Protects all /admin/* routes except /admin/login.

const secret = process.env.AUTH_SECRET;

if (!secret) {
  throw new Error(
    "AUTH_SECRET is not defined. Set it in your .env file (at least 32 characters)."
  );
}

export default async function proxy(req: NextRequest) {
  const { nextUrl } = req;
  const isLoginPage = nextUrl.pathname === "/admin/login";
  const isAdminApiRoute = nextUrl.pathname.startsWith("/api/admin");
  const isAdminRoute =
    nextUrl.pathname.startsWith("/admin") || isAdminApiRoute;

  // Allow login page to pass through without auth check
  if (isLoginPage) {
    return NextResponse.next();
  }

  // Check if user is authenticated via JWT
  const token = await getToken({ req, secret });
  const isLoggedIn = !!token;

  // Block unauthenticated access to admin routes
  if (isAdminRoute && !isLoggedIn) {
    // API routes get JSON 401 (not a redirect to login page)
    if (isAdminApiRoute) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Page routes redirect to login
    const loginUrl = new URL("/admin/login", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname + nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
