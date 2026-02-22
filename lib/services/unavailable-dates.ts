// lib/services/unavailable-dates.ts
// ═══ UnavailableDate Service — Block/Unblock Calendar Dates ═══

import type { ApiResult } from "./client";
import { apiPost, apiDelete } from "./client";

// ─── Types ─────────────────────────────────────────────────────

interface BlockDatesResult {
  created: number;
}

interface UnblockDatesResult {
  deleted: number;
}

// ─── Service Functions ─────────────────────────────────────────

/** Block one or more dates with an optional reason. */
export function blockDates(
  dates: string[],
  reason: string,
): Promise<ApiResult<BlockDatesResult>> {
  return apiPost("/api/admin/unavailable-dates", { dates, reason });
}

/** Unblock one or more dates. */
export function unblockDates(
  dates: string[],
): Promise<ApiResult<UnblockDatesResult>> {
  return apiDelete("/api/admin/unavailable-dates", { dates });
}
