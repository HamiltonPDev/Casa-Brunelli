// lib/services/seasons.ts
// ═══ Seasons Service — CRUD for Seasonal Pricing ═══

import type { ApiResult } from "./client";
import { apiPost, apiPatch, apiDelete } from "./client";

// ─── Types ─────────────────────────────────────────────────────

interface SeasonData {
  id: string;
  name: string;
  colorTag: string;
  startDate: string;
  endDate: string;
  baseRate: number;
  minStay: number;
  priority: number;
  status: string;
  notes?: string;
  updatedAt: string;
  dowOverrides: {
    id: string;
    dayOfWeek: number;
    type: "ADD" | "SUBTRACT" | "CUSTOM";
    amount: number;
  }[];
}

interface SeasonPayload {
  name: string;
  colorTag: string;
  startDate: string;
  endDate: string;
  baseRate: number;
  minStay: number;
  priority: number;
  notes?: string;
}

// ─── Service Functions ─────────────────────────────────────────

/** Create a new season. */
export function createSeason(
  payload: SeasonPayload,
): Promise<ApiResult<SeasonData>> {
  return apiPost("/api/admin/seasons", payload);
}

/** Update an existing season by ID. */
export function updateSeason(
  id: string,
  payload: Partial<SeasonPayload> & { status?: string },
): Promise<ApiResult<SeasonData>> {
  return apiPatch(`/api/admin/seasons/${id}`, payload);
}

/** Duplicate a season (creates a copy with "(Copy)" in the name). */
export function duplicateSeason(
  season: SeasonPayload,
): Promise<ApiResult<SeasonData>> {
  return apiPost("/api/admin/seasons", {
    ...season,
    name: `${season.name} (Copy)`,
  });
}

/** Archive a season by setting its status to ARCHIVED. */
export function archiveSeason(id: string): Promise<ApiResult<SeasonData>> {
  return apiPatch(`/api/admin/seasons/${id}`, { status: "ARCHIVED" });
}

/** Activate one season by ID. */
export function activateSeason(id: string): Promise<ApiResult<SeasonData>> {
  return apiPatch(`/api/admin/seasons/${id}`, { status: "ACTIVE" });
}

/** Deactivate a season by setting its status to INACTIVE. */
export function deactivateSeason(id: string): Promise<ApiResult<SeasonData>> {
  return apiPatch(`/api/admin/seasons/${id}`, { status: "INACTIVE" });
}

/** Permanently delete a season from the database. */
export function deleteSeason(id: string): Promise<ApiResult<void>> {
  return apiDelete(`/api/admin/seasons/${id}`, {});
}
