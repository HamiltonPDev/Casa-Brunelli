/**
 * Casa Brunelli — Stripe Client Singleton + Helpers
 *
 * Centralizes all Stripe interactions. Every route that needs Stripe
 * imports from here — never instantiate Stripe directly elsewhere.
 *
 * Key helper: `createCheckoutSession()` — generates a Checkout Session
 * for advance (30%) or balance (70%) payments with 24h expiry.
 */

import Stripe from "stripe";
import {
  ADVANCE_PERCENTAGE,
  BALANCE_PERCENTAGE,
  PAYMENT_LINK_EXPIRY_HOURS,
  APP_CONFIG,
} from "@/lib/constants";
import type { PaymentType } from "@/lib/constants";

// ─── Singleton ─────────────────────────────────────────────────

function getStripeClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Add it to your environment variables.",
    );
  }

  return new Stripe(key, {
    // Pin the API version for reproducible behavior across deployments
    apiVersion: "2026-01-28.clover",
    typescript: true,
  });
}

/** Stripe SDK client — lazily initialized, reused across requests */
const globalForStripe = globalThis as unknown as { stripe?: Stripe };
export const stripe = globalForStripe.stripe ?? getStripeClient();
if (process.env.NODE_ENV !== "production") globalForStripe.stripe = stripe;

// ─── Types ─────────────────────────────────────────────────────

interface CheckoutSessionParams {
  /** The booking ID this payment belongs to */
  bookingId: string;
  /** ADVANCE (30%) or BALANCE (70%) */
  paymentType: PaymentType;
  /** Total booking price in EUR (used to calculate the amount) */
  totalPrice: number;
  /** Guest name for the Checkout page */
  guestName: string;
  /** Guest email — pre-filled on Stripe Checkout */
  guestEmail: string;
  /** Booking dates for the line item description */
  checkIn: Date;
  checkOut: Date;
  /** Number of nights */
  numberOfNights: number;
}

interface CheckoutSessionResult {
  /** The Stripe Checkout Session ID */
  sessionId: string;
  /** The URL to redirect the guest to (Stripe-hosted page) */
  url: string;
}

// ─── Helpers ───────────────────────────────────────────────────

/**
 * Creates a Stripe Checkout Session for a booking payment.
 *
 * - ADVANCE: 30% of totalPrice
 * - BALANCE: 70% of totalPrice
 * - Link expires in 24 hours (PAYMENT_LINK_EXPIRY_HOURS)
 * - Metadata includes bookingId + paymentType for the webhook
 */
export async function createCheckoutSession(
  params: CheckoutSessionParams,
): Promise<CheckoutSessionResult> {
  const {
    bookingId,
    paymentType,
    totalPrice,
    guestName,
    guestEmail,
    checkIn,
    checkOut,
    numberOfNights,
  } = params;

  // Calculate payment amount based on type
  const percentage =
    paymentType === "ADVANCE" ? ADVANCE_PERCENTAGE : BALANCE_PERCENTAGE;
  const amount = Math.round(totalPrice * percentage * 100) / 100;

  // Stripe expects amounts in cents (smallest currency unit)
  const amountInCents = Math.round(amount * 100);

  // Format dates for the line item description
  const dateFormatter = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const checkInStr = dateFormatter.format(checkIn);
  const checkOutStr = dateFormatter.format(checkOut);

  // Line item description
  const typeLabel =
    paymentType === "ADVANCE" ? "Advance (30%)" : "Balance (70%)";
  const description = [
    `${APP_CONFIG.name} — ${typeLabel}`,
    `${numberOfNights} nights: ${checkInStr} → ${checkOutStr}`,
    `Guest: ${guestName}`,
  ].join("\n");

  // Session expires in 24 hours
  const expiresAt =
    Math.floor(Date.now() / 1000) + PAYMENT_LINK_EXPIRY_HOURS * 60 * 60;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    // Dynamic payment methods — Stripe auto-selects based on currency (EUR)
    // and customer location. Includes cards, iDEAL, Bancontact, SEPA, etc.
    // Manage which methods appear in Stripe Dashboard → Settings → Payment methods
    customer_email: guestEmail,
    expires_at: expiresAt,

    line_items: [
      {
        price_data: {
          currency: APP_CONFIG.currency.toLowerCase(),
          unit_amount: amountInCents,
          product_data: {
            name: `${APP_CONFIG.name} — ${typeLabel}`,
            description,
          },
        },
        quantity: 1,
      },
    ],

    // Metadata survives through to the webhook — this is how we link
    // the payment back to the booking in checkout.session.completed
    metadata: {
      bookingId,
      paymentType,
    },

    // Guest lands here after payment
    success_url: `${appUrl}/booking/${bookingId}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/booking/${bookingId}/cancelled`,
  });

  if (!session.url) {
    throw new Error("Stripe did not return a checkout URL");
  }

  return {
    sessionId: session.id,
    url: session.url,
  };
}

/**
 * Verify a Stripe webhook signature.
 * Must receive the RAW body (not parsed JSON) — Stripe requires exact bytes.
 */
export function constructWebhookEvent(
  rawBody: string,
  signature: string,
): Stripe.Event {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error(
      "STRIPE_WEBHOOK_SECRET is not set. Add it to your environment variables.",
    );
  }

  return stripe.webhooks.constructEvent(rawBody, signature, secret);
}

/**
 * Check if Stripe is properly configured (API key is set).
 * Used by SettingsClient to show connection status.
 */
export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}
