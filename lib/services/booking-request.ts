// lib/services/booking-request.ts
// ─── Public Booking Request Service ────────────────────────────
// Client-side typed wrapper for POST /api/booking-request
// Used by BookingForm — this is a PUBLIC endpoint (no auth).

import { apiPost, type ApiResult } from "./client";

// ─── Types ─────────────────────────────────────────────────────

interface BookingRequestPayload {
  name: string;
  email: string;
  phone?: string;
  checkIn: string;
  checkOut: string;
  guestCount: number;
  specialRequests?: string;
}

export interface BookingRequestResult {
  id: string;
  nights: number;
  totalPrice: number;
  depositAmount: number;
  minStayRequired: number | null;
  minStayValid: boolean;
}

// ─── Service ───────────────────────────────────────────────────

/**
 * Submits a booking request to the public API.
 * Creates a ContactMessage of type BOOKING_REQUEST (Messages-First flow).
 */
export function submitBookingRequest(
  payload: BookingRequestPayload,
): Promise<ApiResult<BookingRequestResult>> {
  return apiPost<BookingRequestResult>("/api/booking-request", payload);
}
