import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { SeasonalPricingClient } from "@/components/features/admin/SeasonalPricingClient";

export const metadata: Metadata = { title: "Seasonal Pricing" };
export const dynamic = "force-dynamic";

export default async function SeasonalPricingPage() {
  const seasons = await prisma.season.findMany({
    include: { dowOverrides: true },
    orderBy: [{ priority: "desc" }, { startDate: "asc" }],
  });

  const data = seasons.map((s) => ({
    id: s.id,
    name: s.name,
    colorTag: s.colorTag,
    startDate: s.startDate.toISOString(),
    endDate: s.endDate.toISOString(),
    baseRate: Number(s.baseRate),
    minStay: s.minStay,
    priority: s.priority,
    status: s.status,
    notes: s.notes ?? undefined,
    updatedAt: s.updatedAt.toISOString(),
    dowOverrides: s.dowOverrides.map((d) => ({
      id: d.id,
      dayOfWeek: d.dayOfWeek,
      type: d.type,
      amount: Number(d.amount),
    })),
  }));

  return <SeasonalPricingClient initialSeasons={data} />;
}
