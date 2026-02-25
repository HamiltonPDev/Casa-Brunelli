/**
 * GET /api/stripe/status
 *
 * Returns whether Stripe is properly configured.
 * Used by SettingsClient to show accurate connection status
 * instead of the misleading hardcoded green badge.
 *
 * Admin-only (requireAuth) — read-only check.
 */

import { requireAuth } from "@/lib/auth";
import { isStripeConfigured } from "@/lib/stripe";

export async function GET(): Promise<Response> {
  const { denied } = await requireAuth();
  if (denied) return denied;

  return Response.json({
    success: true,
    data: { configured: isStripeConfigured() },
  });
}
