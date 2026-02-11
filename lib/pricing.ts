import { prisma } from "@/lib/prisma";
import {
  DEFAULT_NIGHTLY_RATE,
  DEPOSIT_PERCENTAGE,
  BALANCE_PERCENTAGE,
  OVERRIDE_TYPE,
  SEASON_STATUS,
} from "@/lib/constants";
import { addDays } from "@/lib/utils";
import type { BookingPriceBreakdown, NightlyRateResult } from "@/types";

// ─── calculateNightlyRate ──────────────────────────────────────
// Returns the rate for a single date applying the pricing rules:
// 1. Find all ACTIVE seasons that contain the date
// 2. Highest priority wins (ties: first found)
// 3. Apply DOW override if present for that day
// 4. Default to DEFAULT_NIGHTLY_RATE if no season matches

export async function calculateNightlyRate(
  date: Date
): Promise<NightlyRateResult> {
  const dayOfWeek = date.getDay(); // 0=Sunday … 6=Saturday

  // All active seasons that cover this date, highest priority first
  const seasons = await prisma.season.findMany({
    where: {
      status: SEASON_STATUS.ACTIVE,
      startDate: { lte: date },
      endDate: { gte: date },
    },
    orderBy: { priority: "desc" },
    include: { dowOverrides: true },
    take: 1, // highest priority only
  });

  if (seasons.length === 0) {
    return {
      date,
      rate: DEFAULT_NIGHTLY_RATE,
      seasonName: null,
      seasonId: null,
    };
  }

  const season = seasons[0];
  let rate = Number(season.baseRate);

  // Apply day-of-week override if one exists for this day
  const dowOverride = season.dowOverrides.find(
    (o: { dayOfWeek: number }) => o.dayOfWeek === dayOfWeek
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

export async function calculateBookingTotal(
  checkIn: Date,
  checkOut: Date
): Promise<BookingPriceBreakdown> {
  const nights: NightlyRateResult[] = [];
  let current = new Date(checkIn);

  while (current < checkOut) {
    const result = await calculateNightlyRate(current);
    nights.push(result);
    current = addDays(current, 1);
  }

  const totalPrice = nights.reduce((sum, n) => sum + n.rate, 0);
  const depositAmount = Math.round(totalPrice * DEPOSIT_PERCENTAGE * 100) / 100;
  const balanceAmount = Math.round(totalPrice * BALANCE_PERCENTAGE * 100) / 100;

  // Min stay: use the highest minStay from any season in the range
  const seasonIds = [...new Set(nights.map((n) => n.seasonId).filter(Boolean))];
  let minStayRequired: number | null = null;

  if (seasonIds.length > 0) {
    const seasons = await prisma.season.findMany({
      where: { id: { in: seasonIds as string[] } },
      select: { minStay: true },
    });
    minStayRequired = Math.max(...seasons.map((s: { minStay: number }) => s.minStay));
  }

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

export function validateMinimumStay(
  breakdown: BookingPriceBreakdown
): { valid: boolean; required: number | null; actual: number } {
  return {
    valid: breakdown.minStayValid,
    required: breakdown.minStayRequired,
    actual: breakdown.nights,
  };
}
