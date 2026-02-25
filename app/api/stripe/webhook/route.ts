/**
 * POST /api/stripe/webhook
 *
 * Handles Stripe webhook events. This route:
 * - Has NO auth (Stripe sends directly — verified by signature)
 * - Uses raw body (request.text()) — Stripe needs exact bytes for sig verification
 * - Returns 200 for ALL events (Stripe retries on non-200)
 *
 * Events handled:
 * - checkout.session.completed → Mark payment as COMPLETED, update booking status
 * - checkout.session.expired   → Mark payment as FAILED
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
 * checkout.session.completed — Payment succeeded
 *
 * 1. Update PaymentTransaction: PENDING → COMPLETED
 * 2. Update Booking: depositPaid/balancePaid + status transition
 * 3. Future: trigger email notifications (Phase E)
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
      // Create the transaction record from scratch
      await tx.paymentTransaction.create({
        data: {
          bookingId,
          stripePaymentId: stripePaymentIntentId,
          amount: (session.amount_total ?? 0) / 100, // Convert from cents
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
      // Check if deposit was also paid → COMPLETED
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

    // Audit log
    await tx.auditLog.create({
      data: {
        adminUserId: "SYSTEM", // Webhook — no admin user
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
  // await sendBookingConfirmationEmail(bookingId);
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
          adminUserId: "SYSTEM",
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
