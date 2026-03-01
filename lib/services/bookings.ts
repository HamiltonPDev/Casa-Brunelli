// lib/services/bookings.ts
// ═══ Bookings Service — Fetch, Bulk Update & Patch ═══

import type { ApiResult } from "./client";
import { apiGet, apiPatch, apiDelete } from "./client";

// ─── Types ─────────────────────────────────────────────────────

interface BookingListItem {
  id: string;
  guestName: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
  numberOfNights: number;
  guestCount: number;
  status: string;
  totalPrice: number;
  advanceAmount: number;
  advancePaid: boolean;
  balancePaid: boolean;
  updatedAt: string;
}

interface Pagination {
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

interface FetchBookingsResult {
  data: BookingListItem[];
  pagination: Pagination;
}

interface BulkUpdateResult {
  updated: number;
}

interface UpdateBookingResult {
  success: boolean;
}

interface FetchBookingsParams {
  search?: string;
  status?: string[];
  dateFrom?: string;
  dateTo?: string;
  guests?: string;
  page?: number;
}

// ─── Service Functions ─────────────────────────────────────────

/** Fetch paginated, filtered bookings list. */
export function fetchBookings(
  params: FetchBookingsParams,
): Promise<ApiResult<FetchBookingsResult>> {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.set("search", params.search);
  if (params.status?.length)
    searchParams.set("status", params.status.join(","));
  if (params.dateFrom) searchParams.set("dateFrom", params.dateFrom);
  if (params.dateTo) searchParams.set("dateTo", params.dateTo);
  if (params.guests) searchParams.set("guests", params.guests);
  if (params.page) searchParams.set("page", String(params.page));

  return apiGet(`/api/admin/bookings?${searchParams}`);
}

/** Bulk-update the status of multiple bookings. */
export function bulkUpdateBookings(
  ids: string[],
  status: string,
): Promise<ApiResult<BulkUpdateResult>> {
  return apiPatch("/api/admin/bookings", { ids, status });
}

/** Patch a single booking (status, advancePaid, balancePaid, etc.). */
export function updateBooking(
  id: string,
  data: Record<string, unknown>,
): Promise<ApiResult<UpdateBookingResult>> {
  return apiPatch(`/api/admin/bookings/${id}`, data);
}

/** Delete a single booking (hard delete + cascade payments). */
export function deleteBooking(id: string): Promise<ApiResult<void>> {
  return apiDelete(`/api/admin/bookings/${id}`, {});
}

/** Bulk delete multiple bookings. */
export function deleteBookings(
  ids: string[],
): Promise<ApiResult<{ deleted: number }>> {
  return apiDelete("/api/admin/bookings", { ids });
}
