import { prisma } from "@/lib/prisma";
import {
  DEFAULT_NIGHTLY_RATE,
  DEPOSIT_PERCENTAGE,
  OVERRIDE_TYPE,
  SEASON_STATUS,
} from "@/lib/constants";
import { addDays } from "@/lib/utils";
import type { BookingPriceBreakdown, NightlyRateResult } from "@/types";

// ─── Types ───────────────────────────────────────────────────

/** Season with its DOW overrides, pre-fetched for batch pricing */
interface SeasonWithOverrides {
  id: string;
  name: string;
  baseRate: { toString(): string } | number;
  startDate: Date;
  endDate: Date;
  priority: number;
  minStay: number;
  dowOverrides: {
    dayOfWeek: number;
    type: string;
    amount: { toString(): string } | number;
  }[];
}

// ─── calculateNightlyRate (pure — no DB) ───────────────────────
// Returns the rate for a single date using pre-fetched seasons.
// 1. Find all seasons that contain the date
// 2. Highest priority wins (seasons must be pre-sorted by priority desc)
// 3. Apply DOW override if present for that day
// 4. Default to DEFAULT_NIGHTLY_RATE if no season matches

export function calculateNightlyRate(
  date: Date,
  seasons: SeasonWithOverrides[],
): NightlyRateResult {
  const dayOfWeek = date.getDay(); // 0=Sunday … 6=Saturday

  // Find first season that covers this date (already sorted by priority desc)
  const season = seasons.find((s) => s.startDate <= date && s.endDate >= date);

  if (!season) {
    return {
      date,
      rate: DEFAULT_NIGHTLY_RATE,
      seasonName: null,
      seasonId: null,
    };
  }

  let rate = Number(season.baseRate);

  // Apply day-of-week override if one exists for this day
  const dowOverride = season.dowOverrides.find(
    (o) => o.dayOfWeek === dayOfWeek,
  );

  if (dowOverride) {
    const amount = Number(dowOverride.amount);
    if (dowOverride.type === OVERRIDE_TYPE.ADD) {
      rate += amount;
    } else if (dowOverride.type === OVERRIDE_TYPE.SUBTRACT) {
      rate -= amount;
    } else if (dowOverride.type === OVERRIDE_TYPE.CUSTOM) {
      rate = amount; // replaces the base rate entirely
    }
  }

  return {
    date,
    rate: Math.max(0, rate), // never negative
    seasonName: season.name,
    seasonId: season.id,
  };
}

// ─── calculateBookingTotal ─────────────────────────────────────
// Calculates the full price breakdown for a date range.
// Iterates each night from checkIn up to (not including) checkOut.
// Returns breakdown per night + totals + deposit/balance split.
//
// PERF: Single query fetches ALL overlapping seasons upfront.
// Previously this was N+1 — one query per night in the range.

export async function calculateBookingTotal(
  checkIn: Date,
  checkOut: Date,
): Promise<BookingPriceBreakdown> {
  // ── Single query: all active seasons overlapping [checkIn, checkOut) ──
  const lastNight = addDays(checkOut, -1); // checkOut is departure, last billable night is day before
  const seasons = await prisma.season.findMany({
    where: {
      status: SEASON_STATUS.ACTIVE,
      startDate: { lte: lastNight },
      endDate: { gte: checkIn },
    },
    orderBy: { priority: "desc" },
    include: { dowOverrides: true },
  });

  // ── Calculate rate for each night (pure, no DB) ──
  const nights: NightlyRateResult[] = [];
  let current = new Date(checkIn);

  while (current < checkOut) {
    const result = calculateNightlyRate(current, seasons);
    nights.push(result);
    current = addDays(current, 1);
  }

  const totalPrice = nights.reduce((sum, n) => sum + n.rate, 0);
  const depositAmount = Math.round(totalPrice * DEPOSIT_PERCENTAGE * 100) / 100;
  // Derive balance from total - deposit to avoid rounding mismatch (deposit + balance must === total)
  const balanceAmount = Math.round((totalPrice - depositAmount) * 100) / 100;

  // Min stay: use the highest minStay from seasons actually used in the range
  const usedSeasonIds = new Set(nights.map((n) => n.seasonId).filter(Boolean));
  const usedSeasons = seasons.filter((s) => usedSeasonIds.has(s.id));
  const minStayRequired =
    usedSeasons.length > 0
      ? Math.max(...usedSeasons.map((s) => s.minStay))
      : null;

  const numberOfNights = nights.length;
  const minStayValid =
    minStayRequired === null || numberOfNights >= minStayRequired;

  return {
    nights: numberOfNights,
    totalPrice,
    depositAmount,
    balanceAmount,
    breakdown: nights,
    minStayRequired,
    minStayValid,
  };
}

// ─── validateMinimumStay ───────────────────────────────────────
// Quick sync check (no DB) for UI-side validation.
// Pass the breakdown result from calculateBookingTotal.

export function validateMinimumStay(breakdown: BookingPriceBreakdown): {
  valid: boolean;
  required: number | null;
  actual: number;
} {
  return {
    valid: breakdown.minStayValid,
    required: breakdown.minStayRequired,
    actual: breakdown.nights,
  };
}
