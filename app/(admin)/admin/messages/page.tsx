import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { MessagesClient } from "@/components/features/admin/MessagesClient";

// ─── Messages Page ─────────────────────────────────────────────
// Server Component — fetches all ContactMessages server-side.
// Passes data to MessagesClient for interactive split-pane UI.
// force-dynamic: admin inbox must always be fresh.

export const metadata: Metadata = {
  title: "Messages — Casa Brunelli Admin",
};

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      admin: { select: { name: true } },
    },
  });

  // Serialize Prisma Decimal fields to plain numbers for client components
  const serialized = messages.map((m) => ({
    ...m,
    totalPrice: m.totalPrice ? Number(m.totalPrice) : null,
  }));

  return <MessagesClient initialMessages={serialized} />;
}
