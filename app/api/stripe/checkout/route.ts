/**
 * POST /api/stripe/checkout
 *
 * Creates a Stripe Checkout Session for a booking payment.
 * Admin-only (requireWrite) — generates a payment link that can be
 * sent to the guest via email (Phase E) or copied manually.
 *
 * Body: { bookingId: string, type: "ADVANCE" | "BALANCE" }
 * Returns: { success: true, data: { sessionId, url } }
 */

import { requireWrite } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCheckoutSession } from "@/lib/stripe";
import { createCheckoutSchema, validationError } from "@/lib/validations/admin";
import { BOOKING_STATUS, PAYMENT_STATUS, PAYMENT_TYPE } from "@/lib/constants";
import { sendAdvancePaymentLink } from "@/lib/notifications";
import { toLocalDateStr } from "@/lib/utils";

export async function POST(request: Request): Promise<Response> {
  // ── Auth: admin with write permissions ──
  const { session, denied } = await requireWrite();
  if (denied) return denied;

  try {
    const body = await request.json();
    const parsed = createCheckoutSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const { bookingId, type } = parsed.data;

    // ── Fetch booking with existing payments ──
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        payments: {
          where: { status: { in: ["PENDING", "COMPLETED"] } },
        },
      },
    });

    if (!booking) {
      return Response.json(
        { success: false, error: "Booking not found" },
        { status: 404 },
      );
    }

    // ── Business rule: can only pay for non-cancelled bookings ──
    if (booking.status === BOOKING_STATUS.CANCELLED) {
      return Response.json(
        {
          success: false,
          error: "Cannot create payment for a cancelled booking",
        },
        { status: 400 },
      );
    }

    // ── Prevent duplicate payments ──
    if (type === "ADVANCE" && booking.advancePaid) {
      return Response.json(
        { success: false, error: "Advance has already been paid" },
        { status: 400 },
      );
    }

    if (type === "BALANCE" && booking.balancePaid) {
      return Response.json(
        { success: false, error: "Balance has already been paid" },
        { status: 400 },
      );
    }

    // Business rule: balance can only be paid after advance
    if (type === "BALANCE" && !booking.advancePaid) {
      return Response.json(
        { success: false, error: "Advance must be paid before balance" },
        { status: 400 },
      );
    }

    // Check for existing PENDING payment of this type
    // (don't create duplicate checkout sessions)
    const existingPending = booking.payments.find(
      (p) => p.type === type && p.status === PAYMENT_STATUS.PENDING,
    );

    if (existingPending) {
      return Response.json(
        {
          success: false,
          error: `A pending ${type.toLowerCase()} payment already exists. Wait for it to expire or be completed.`,
        },
        { status: 409 },
      );
    }

    // ── Create Stripe Checkout Session ──
    const { sessionId, url } = await createCheckoutSession({
      bookingId: booking.id,
      paymentType: type,
      totalPrice: Number(booking.totalPrice),
      guestName: booking.guestName,
      guestEmail: booking.guestEmail,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      numberOfNights: booking.numberOfNights,
    });

    // ── Store session ID and create PENDING PaymentTransaction ──
    await prisma.$transaction([
      // Update the appropriate session ID on the booking
      prisma.booking.update({
        where: { id: bookingId },
        data:
          type === "ADVANCE"
            ? { advanceSessionId: sessionId, stripeSessionId: sessionId }
            : { balanceSessionId: sessionId, stripeSessionId: sessionId },
      }),

      // Create PaymentTransaction with PENDING status
      prisma.paymentTransaction.create({
        data: {
          bookingId,
          stripePaymentId: sessionId,
          amount: Number(booking.totalPrice) * (type === "ADVANCE" ? 0.3 : 0.7),
          currency: "EUR",
          status: PAYMENT_STATUS.PENDING,
          type,
        },
      }),

      // Audit log
      prisma.auditLog.create({
        data: {
          adminUserId: session.user.id,
          action: "CREATE_PAYMENT_SESSION",
          entityType: "Booking",
          entityId: bookingId,
          changes: JSON.stringify({
            paymentType: type,
            sessionId,
            amount:
              Number(booking.totalPrice) * (type === "ADVANCE" ? 0.3 : 0.7),
          }),
        },
      }),
    ]);

    // Auto-send advance payment link email (non-blocking)
    if (type === PAYMENT_TYPE.ADVANCE) {
      sendAdvancePaymentLink({
        guestEmail: booking.guestEmail,
        guestName: booking.guestName,
        checkIn: toLocalDateStr(booking.checkIn),
        checkOut: toLocalDateStr(booking.checkOut),
        numberOfNights: booking.numberOfNights,
        totalPrice: Number(booking.totalPrice),
        advanceAmount: Number(booking.advanceAmount),
        checkoutUrl: url,
      }).catch((err) =>
        console.error(
          "[Checkout] Failed to send advance link email:",
          err,
        ),
      );
    }

    return Response.json({
      success: true,
      data: { sessionId, url },
    });
  } catch (error) {
    console.error("[API] POST /api/stripe/checkout:", error);
    return Response.json(
      { success: false, error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
