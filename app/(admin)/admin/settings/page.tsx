import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { SettingsClient } from "@/components/features/admin/SettingsClient";

export const metadata: Metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [emailTemplates, adminUsers] = await Promise.all([
    prisma.emailTemplate.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.adminUser.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        lastLoginAt: true,
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return (
    <SettingsClient
      emailTemplates={emailTemplates.map((t) => ({
        id: t.id,
        name: t.name,
        subject: t.subject,
        category: t.category,
        updatedAt: t.updatedAt.toISOString(),
      }))}
      adminUsers={adminUsers.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        lastLoginAt: u.lastLoginAt?.toISOString() ?? null,
      }))}
    />
  );
}
