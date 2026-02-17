import { handlers } from "@/lib/auth";

// ─── NextAuth v5 Route Handler ────────────────────────────────
// Handles GET and POST for all /api/auth/* routes:
// - /api/auth/signin
// - /api/auth/signout
// - /api/auth/callback/credentials
// - /api/auth/session
// See: https://authjs.dev/getting-started/installation#configure

export const { GET, POST } = handlers;
