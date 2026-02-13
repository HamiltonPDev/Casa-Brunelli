import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { ADMIN_ROLE } from "@/lib/constants";
import type { AdminRole } from "@/lib/constants";

// ─── NextAuth v5 Configuration ─────────────────────────────────
// Using Credentials provider — admin-only, no OAuth needed.
// Password compared with bcryptjs against the DB hash.
// Session strategy: JWT (no DB session table required).

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const admin = await prisma.adminUser.findUnique({
          where: { email: credentials.email as string },
        });

        if (!admin) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          admin.passwordHash
        );

        if (!isValid) return null;

        // Update last login timestamp
        await prisma.adminUser.update({
          where: { id: admin.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // On sign-in, attach role to JWT
      if (user) {
        token.id = user.id;
        token.role = (user as { role: AdminRole }).role;
      }
      return token;
    },
    async session({ session, token }) {
      // Expose id + role on client session
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as AdminRole;
      }
      return session;
    },
  },

  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours — admin session
  },
});

// ─── Type Augmentation ─────────────────────────────────────────
// Extend NextAuth session types to include role
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: AdminRole;
    };
  }
}

// ─── Role Helpers ──────────────────────────────────────────────

export function isSuperAdmin(role: AdminRole): boolean {
  return role === ADMIN_ROLE.SUPER_ADMIN;
}

export function canWrite(role: AdminRole): boolean {
  return role === ADMIN_ROLE.SUPER_ADMIN || role === ADMIN_ROLE.ADMIN;
}

export function canRead(role: AdminRole): boolean {
  return Object.values(ADMIN_ROLE).includes(role);
}
