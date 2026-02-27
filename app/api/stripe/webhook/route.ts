/**
 * POST /api/stripe/webhook
 *
 * Handles Stripe webhook events. This route:
 * - Has NO auth (Stripe sends directly — verified by signature)
 * - Uses raw body (request.text()) — Stripe needs exact bytes for sig verification
 * - Returns 200 for ALL events (Stripe retries on non-200)
 *
 * Events handled:
 * - checkout.session.completed              → Mark payment COMPLETED (cards) or PENDING (async methods like iDEAL)
 * - checkout.session.async_payment_succeeded → Async method confirmed by bank → COMPLETED
 * - checkout.session.async_payment_failed    → Async method rejected by bank → FAILED
 * - checkout.session.expired                → Payment link expired (24h) → FAILED
 */

import type Stripe from "stripe";
import { constructWebhookEvent } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { BOOKING_STATUS, PAYMENT_STATUS } from "@/lib/constants";

// ─── Types ─────────────────────────────────────────────────────

interface SessionMetadata {
  bookingId: string;
  paymentType: "DEPOSIT" | "BALANCE";
}

// ─── Webhook Handler ───────────────────────────────────────────

export async function POST(request: Request): Promise<Response> {
  // ── Read raw body (NOT json) — Stripe requires exact bytes ──
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return Response.json(
      { success: false, error: "Missing stripe-signature header" },
      { status: 400 },
    );
  }

  // ── Verify webhook signature ──
  let event: Stripe.Event;
  try {
    event = constructWebhookEvent(rawBody, signature);
  } catch (error) {
    console.error("[Stripe Webhook] Signature verification failed:", error);
    return Response.json(
      { success: false, error: "Webhook signature verification failed" },
      { status: 400 },
    );
  }

  // ── Route event to handler ──
  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session,
        );
        break;

      case "checkout.session.async_payment_succeeded":
        await handleAsyncPaymentSucceeded(
          event.data.object as Stripe.Checkout.Session,
        );
        break;

      case "checkout.session.async_payment_failed":
        await handleAsyncPaymentFailed(
          event.data.object as Stripe.Checkout.Session,
        );
        break;

      case "checkout.session.expired":
        await handleCheckoutExpired(
          event.data.object as Stripe.Checkout.Session,
        );
        break;

      default:
        // Acknowledge but don't process — Stripe won't retry
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    // Always return 200 — Stripe retries on non-200
    return Response.json({ received: true });
  } catch (error) {
    console.error(`[Stripe Webhook] Error processing ${event.type}:`, error);
    // Still return 200 to prevent infinite retries
    // The error is logged for investigation
    return Response.json({ received: true });
  }
}

// ─── Event Handlers ────────────────────────────────────────────

/**
 * checkout.session.completed — Checkout flow finished
 *
 * For **synchronous** methods (cards, wallets): payment_status = "paid" → mark COMPLETED
 * For **asynchronous** methods (iDEAL, SEPA, Bancontact): payment_status = "unpaid"
 *   → the payment is not confirmed yet, wait for async_payment_succeeded event
 */
async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
): Promise<void> {
  const metadata = session.metadata as unknown as SessionMetadata;

  if (!metadata?.bookingId || !metadata?.paymentType) {
    console.error(
      "[Stripe Webhook] checkout.session.completed missing metadata:",
      session.id,
    );
    return;
  }

  // Async payment methods (iDEAL, SEPA, Bancontact) fire completed with
  // payment_status "unpaid" — the real confirmation comes later via
  // checkout.session.async_payment_succeeded
  if (session.payment_status !== "paid") {
    console.log(
      `[Stripe Webhook] ${metadata.paymentType} checkout completed but payment_status="${session.payment_status}" — waiting for async confirmation`,
    );
    return;
  }

  // Synchronous payment (cards) — process immediately
  await fulfillPayment(session);
}

/**
 * checkout.session.async_payment_succeeded — Bank confirmed the async payment
 *
 * Fired for iDEAL, SEPA Direct Debit, Bancontact, etc. after the bank confirms.
 * Same logic as a completed card payment.
 */
async function handleAsyncPaymentSucceeded(
  session: Stripe.Checkout.Session,
): Promise<void> {
  const metadata = session.metadata as unknown as SessionMetadata;

  if (!metadata?.bookingId || !metadata?.paymentType) {
    console.error(
      "[Stripe Webhook] async_payment_succeeded missing metadata:",
      session.id,
    );
    return;
  }

  await fulfillPayment(session);
}

/**
 * checkout.session.async_payment_failed — Bank rejected the async payment
 *
 * Fired when iDEAL/SEPA/Bancontact payment fails after the initial redirect.
 */
async function handleAsyncPaymentFailed(
  session: Stripe.Checkout.Session,
): Promise<void> {
  const metadata = session.metadata as unknown as SessionMetadata;

  if (!metadata?.bookingId || !metadata?.paymentType) {
    console.error(
      "[Stripe Webhook] async_payment_failed missing metadata:",
      session.id,
    );
    return;
  }

  const { bookingId, paymentType } = metadata;

  const existingTx = await prisma.paymentTransaction.findUnique({
    where: { stripePaymentId: session.id },
  });

  if (existingTx && existingTx.status === PAYMENT_STATUS.FAILED) {
    return; // Already processed
  }

  if (existingTx) {
    await prisma.$transaction([
      prisma.paymentTransaction.update({
        where: { id: existingTx.id },
        data: { status: PAYMENT_STATUS.FAILED },
      }),
      prisma.auditLog.create({
        data: {
          adminUserId: null,
          action: "PAYMENT_FAILED",
          entityType: "Booking",
          entityId: bookingId,
          changes: JSON.stringify({
            paymentType,
            stripeSessionId: session.id,
            reason: "async_payment_failed",
          }),
        },
      }),
    ]);
  }

  console.log(
    `[Stripe Webhook] ✗ ${paymentType} async payment failed for booking ${bookingId}`,
  );

  // TODO (Phase E): Notify admin that payment failed
}

// ─── Shared Payment Fulfillment ────────────────────────────────

/**
 * Shared logic for marking a payment as COMPLETED.
 * Used by both checkout.session.completed (cards) and
 * checkout.session.async_payment_succeeded (iDEAL, SEPA, etc.)
 */
async function fulfillPayment(
  session: Stripe.Checkout.Session,
): Promise<void> {
  const metadata = session.metadata as unknown as SessionMetadata;
  const { bookingId, paymentType } = metadata;

  // Idempotency: check if already processed
  const existingTx = await prisma.paymentTransaction.findUnique({
    where: { stripePaymentId: session.id },
  });

  if (existingTx && existingTx.status === PAYMENT_STATUS.COMPLETED) {
    console.log(
      `[Stripe Webhook] Payment ${session.id} already completed — skipping`,
    );
    return;
  }

  // Resolve the actual Stripe payment intent ID for tracking
  const stripePaymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : (session.payment_intent?.id ?? session.id);

  await prisma.$transaction(async (tx) => {
    // Update or create the PaymentTransaction
    if (existingTx) {
      await tx.paymentTransaction.update({
        where: { id: existingTx.id },
        data: {
          status: PAYMENT_STATUS.COMPLETED,
          stripePaymentId: stripePaymentIntentId,
          processedAt: new Date(),
        },
      });
    } else {
      // Edge case: webhook arrived before our DB write
      await tx.paymentTransaction.create({
        data: {
          bookingId,
          stripePaymentId: stripePaymentIntentId,
          amount: (session.amount_total ?? 0) / 100,
          currency: session.currency ?? "eur",
          status: PAYMENT_STATUS.COMPLETED,
          type: paymentType,
          processedAt: new Date(),
        },
      });
    }

    // Update booking flags + status
    if (paymentType === "DEPOSIT") {
      await tx.booking.update({
        where: { id: bookingId },
        data: {
          depositPaid: true,
          status: BOOKING_STATUS.CONFIRMED,
        },
      });
    } else if (paymentType === "BALANCE") {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        select: { depositPaid: true },
      });

      await tx.booking.update({
        where: { id: bookingId },
        data: {
          balancePaid: true,
          status: booking?.depositPaid
            ? BOOKING_STATUS.COMPLETED
            : BOOKING_STATUS.CONFIRMED,
        },
      });
    }

    // Audit log — adminUserId is null for system-initiated events (webhooks)
    await tx.auditLog.create({
      data: {
        adminUserId: null,
        action: "PAYMENT_COMPLETED",
        entityType: "Booking",
        entityId: bookingId,
        changes: JSON.stringify({
          paymentType,
          stripeSessionId: session.id,
          stripePaymentIntentId,
          amount: (session.amount_total ?? 0) / 100,
        }),
      },
    });
  });

  console.log(
    `[Stripe Webhook] ✓ ${paymentType} payment completed for booking ${bookingId}`,
  );

  // TODO (Phase E): Send confirmation email to guest
}

/**
 * checkout.session.expired — Payment link expired (24h)
 *
 * 1. Update PaymentTransaction: PENDING → FAILED
 * 2. Log the expiry for admin awareness
 */
async function handleCheckoutExpired(
  session: Stripe.Checkout.Session,
): Promise<void> {
  const metadata = session.metadata as unknown as SessionMetadata;

  if (!metadata?.bookingId || !metadata?.paymentType) {
    console.error(
      "[Stripe Webhook] checkout.session.expired missing metadata:",
      session.id,
    );
    return;
  }

  const { bookingId, paymentType } = metadata;

  // Idempotency
  const existingTx = await prisma.paymentTransaction.findUnique({
    where: { stripePaymentId: session.id },
  });

  if (existingTx && existingTx.status !== PAYMENT_STATUS.PENDING) {
    console.log(
      `[Stripe Webhook] Payment ${session.id} already ${existingTx.status} — skipping expiry`,
    );
    return;
  }

  if (existingTx) {
    await prisma.$transaction([
      prisma.paymentTransaction.update({
        where: { id: existingTx.id },
        data: { status: PAYMENT_STATUS.FAILED },
      }),
      prisma.auditLog.create({
        data: {
          adminUserId: null,
          action: "PAYMENT_EXPIRED",
          entityType: "Booking",
          entityId: bookingId,
          changes: JSON.stringify({
            paymentType,
            stripeSessionId: session.id,
          }),
        },
      }),
    ]);
  }

  console.log(
    `[Stripe Webhook] ⚠ ${paymentType} payment expired for booking ${bookingId}`,
  );

  // TODO (Phase E): Notify admin via Telegram/email
}
