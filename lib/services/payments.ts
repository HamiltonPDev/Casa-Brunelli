/**
 * Casa Brunelli — Payment Service (Client-side)
 *
 * Typed fetch wrappers for Stripe payment endpoints.
 * Used by admin components (BookingDetailClient) to create payment links.
 */

import { apiPost, apiGet } from "@/lib/services/client";
import type { ApiResult } from "@/lib/services/client";
import type { PaymentType } from "@/types";

// ─── Types ─────────────────────────────────────────────────────

interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}

interface StripeStatusResponse {
  configured: boolean;
}

// ─── Service Functions ─────────────────────────────────────────

/**
 * Create a Stripe Checkout Session for a booking payment.
 * Returns the session ID and URL for the guest to pay.
 */
export function createPaymentSession(
  bookingId: string,
  type: PaymentType,
): Promise<ApiResult<CheckoutSessionResponse>> {
  return apiPost<CheckoutSessionResponse>("/api/stripe/checkout", {
    bookingId,
    type,
  });
}

/**
 * Check if Stripe is properly configured (API key set).
 * Used by SettingsClient to show accurate connection status.
 */
export function getStripeStatus(): Promise<ApiResult<StripeStatusResponse>> {
  return apiGet<StripeStatusResponse>("/api/stripe/status");
}
