import { auth } from "@/lib/auth";

// ─── Route Protection Middleware ───────────────────────────────
// NextAuth v5: export `auth` directly as middleware.
// The callback receives (req) with req.auth attached.
// Protects all /admin/* routes except /admin/login.

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isLoginPage = nextUrl.pathname === "/admin/login";
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");

  // Redirect unauthenticated users to login
  if (isAdminRoute && !isLoginPage && !isLoggedIn) {
    const loginUrl = new URL("/admin/login", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return Response.redirect(loginUrl);
  }

  // Redirect already-authenticated users away from login page
  if (isLoginPage && isLoggedIn) {
    return Response.redirect(new URL("/admin", nextUrl.origin));
  }
});

export const config = {
  matcher: ["/admin/:path*"],
};
