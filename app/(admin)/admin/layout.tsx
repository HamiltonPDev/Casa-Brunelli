import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import type { ReactNode } from "react";

// ─── Admin Layout ──────────────────────────────────────────────
// Server Component — reads session on the server.
// Middleware already protects this route, but we double-check
// here to satisfy TypeScript and handle edge cases.

interface AdminLayoutProps {
  children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await auth();

  // Middleware handles the redirect, but we double-check here.
  // /admin/login is excluded from this layout via the middleware matcher,
  // but if it somehow reaches here without a session, redirect.
  if (!session?.user) {
    redirect("/admin/login");
  }

  return (
    <AdminShell
      user={{
        name: session.user.name ?? "Admin",
        email: session.user.email ?? "",
      }}
    >
      {children}
    </AdminShell>
  );
}
