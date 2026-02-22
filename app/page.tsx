// app/page.tsx
// Landing page — Server Component wrapping HomeLanding client component
// Fetches seasonal pricing from DB so HomeLanding displays live rates.

import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { SEASON_STATUS, DEFAULT_NIGHTLY_RATE } from "@/lib/constants";
import { PublicNav } from "@/components/features/public/PublicNav";
import { PublicFooter } from "@/components/features/public/PublicFooter";
import {
  HomeLanding,
  type SeasonCard,
} from "@/components/features/public/HomeLanding";

export const metadata: Metadata = {
  title: "Casa Brunelli — Luxury Tuscan Villa",
  description:
    "Experience the beauty of Tuscany at Casa Brunelli. A luxury villa rental in the heart of Italy — book directly and save on OTA commissions.",
};

// ─── Helpers ─────────────────────────────────────────────────
function formatSeasonPeriod(start: Date, end: Date): string {
  const fmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
  return `${fmt.format(start)} – ${fmt.format(end)}`;
}

// ─── Page ────────────────────────────────────────────────────
export default async function HomePage() {
  // Fetch ACTIVE seasons ordered by priority (highest = "peak")
  const dbSeasons = await prisma.season.findMany({
    where: { status: SEASON_STATUS.ACTIVE },
    orderBy: { priority: "desc" },
    select: {
      name: true,
      startDate: true,
      endDate: true,
      baseRate: true,
      priority: true,
    },
  });

  // Transform Prisma Decimal → serialisable SeasonCard[]
  const highestPriority = dbSeasons[0]?.priority ?? 0;
  const seasons: SeasonCard[] = dbSeasons.map((s) => ({
    name: s.name,
    period: formatSeasonPeriod(s.startDate, s.endDate),
    rate: `from €${Math.round(Number(s.baseRate))}/night`,
    highlight: s.priority === highestPriority,
  }));

  // Fallback — if no seasons in DB, show a generic entry
  if (seasons.length === 0) {
    seasons.push({
      name: "Year-Round",
      period: "Flexible dates",
      rate: `from €${DEFAULT_NIGHTLY_RATE}/night`,
      highlight: false,
    });
  }

  return (
    <>
      <PublicNav transparent />
      <HomeLanding seasons={seasons} />
      <PublicFooter />
    </>
  );
}
