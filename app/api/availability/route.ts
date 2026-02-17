// app/api/availability/route.ts
// Public endpoint — no auth required
// Returns available dates, nightly rates, and min-stay for a date range

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateNightlyRate } from "@/lib/pricing";
import { addDays } from "@/lib/utils";
import { BOOKING_STATUS, SEASON_STATUS } from "@/lib/constants";

// ─── Types ─────────────────────────────────────────────────────

export interface DayAvailability {
  date: string; // ISO yyyy-MM-dd
  available: boolean;
  blocked: boolean; // manually blocked by admin
  booked: boolean; // confirmed/pending booking
  rate: number | null; // null if unavailable
  seasonName: string | null;
  minStay: number | null;
}

export interface AvailabilityResponse {
  days: DayAvailability[];
  from: string;
  to: string;
}

// ─── Helpers ───────────────────────────────────────────────────

function toISODate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function parseDateParam(raw: string | null, fallback: Date): Date {
  if (!raw) return fallback;
  const d = new Date(raw + "T00:00:00Z");
  return isNaN(d.getTime()) ? fallback : d;
}

// ─── GET /api/availability ─────────────────────────────────────
// Query params:
//   from  yyyy-MM-dd  (default: today)
//   to    yyyy-MM-dd  (default: today + 90 days)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const from = parseDateParam(searchParams.get("from"), today);
    const to = parseDateParam(
      searchParams.get("to"),
      addDays(today, 90)
    );

    // Clamp: from can't be in the past; range can't exceed 365 days
    const clampedFrom = from < today ? today : from;
    const maxTo = addDays(clampedFrom, 365);
    const clampedTo = to > maxTo ? maxTo : to;

    // ─── Fetch blocked data in parallel ──────────────────────

    const [bookedRanges, unavailableDates, activeSeasons] = await Promise.all([
      // Confirmed OR pending bookings that overlap the range
      prisma.booking.findMany({
        where: {
          status: { in: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.PENDING] },
          checkIn: { lt: clampedTo },
          checkOut: { gt: clampedFrom },
        },
        select: { checkIn: true, checkOut: true },
      }),

      // Manually blocked dates in range
      prisma.unavailableDate.findMany({
        where: {
          date: { gte: clampedFrom, lte: clampedTo },
        },
        select: { date: true },
      }),

      // Active seasons that overlap the range (for minStay)
      prisma.season.findMany({
        where: {
          status: SEASON_STATUS.ACTIVE,
          startDate: { lte: clampedTo },
          endDate: { gte: clampedFrom },
        },
        select: {
          id: true,
          name: true,
          startDate: true,
          endDate: true,
          minStay: true,
          priority: true,
          baseRate: true,
          dowOverrides: {
            select: { dayOfWeek: true, type: true, amount: true },
          },
        },
        orderBy: { priority: "desc" },
      }),
    ]);

    // ─── Build lookup sets for O(1) access ───────────────────

    const bookedDates = new Set<string>();
    for (const booking of bookedRanges) {
      let cur = new Date(booking.checkIn);
      cur.setUTCHours(0, 0, 0, 0);
      const out = new Date(booking.checkOut);
      out.setUTCHours(0, 0, 0, 0);
      while (cur < out) {
        bookedDates.add(toISODate(cur));
        cur = addDays(cur, 1);
      }
    }

    const manuallyBlocked = new Set<string>(
      unavailableDates.map((u) => toISODate(new Date(u.date)))
    );

    // ─── Iterate each day in range ────────────────────────────

    const days: DayAvailability[] = [];
    let current = new Date(clampedFrom);

    while (current <= clampedTo) {
      const iso = toISODate(current);
      const isBooked = bookedDates.has(iso);
      const isBlocked = manuallyBlocked.has(iso);
      const isAvailable = !isBooked && !isBlocked;

      let rate: number | null = null;
      let seasonName: string | null = null;
      let minStay: number | null = null;

      if (isAvailable) {
        // Find highest-priority active season for this date
        const matchingSeason = activeSeasons.find((s) => {
          const start = new Date(s.startDate);
          start.setUTCHours(0, 0, 0, 0);
          const end = new Date(s.endDate);
          end.setUTCHours(0, 0, 0, 0);
          return current >= start && current <= end;
        });

        if (matchingSeason) {
          seasonName = matchingSeason.name;
          minStay = matchingSeason.minStay;

          // Apply DOW override if present
          const dow = current.getUTCDay();
          const override = matchingSeason.dowOverrides.find(
            (o) => o.dayOfWeek === dow
          );

          let baseRate = Number(matchingSeason.baseRate);
          if (override) {
            const amount = Number(override.amount);
            if (override.type === "ADD") baseRate += amount;
            else if (override.type === "SUBTRACT") baseRate -= amount;
            else if (override.type === "CUSTOM") baseRate = amount;
          }
          rate = Math.max(0, baseRate);
        } else {
          // No active season — use default rate
          const result = await calculateNightlyRate(current);
          rate = result.rate;
        }
      }

      days.push({
        date: iso,
        available: isAvailable,
        blocked: isBlocked,
        booked: isBooked,
        rate,
        seasonName,
        minStay,
      });

      current = addDays(current, 1);
    }

    const response: AvailabilityResponse = {
      days,
      from: toISODate(clampedFrom),
      to: toISODate(clampedTo),
    };

    return NextResponse.json(response, {
      headers: {
        // Cache for 5 minutes — public, stale-while-revalidate
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    console.error("[API] GET /api/availability error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch availability" },
      { status: 500 }
    );
  }
}
