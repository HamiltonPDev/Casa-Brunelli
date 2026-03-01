// app/api/admin/messages/[id]/promote/route.ts
// ═══ Promote ContactMessage → Booking (Messages-First core flow) ═══
//
// This is THE business-critical action:
// 1. Validates the message is a BOOKING_REQUEST with dates/guests
// 2. Checks for date overlap (double-booking prevention)
// 3. Recalculates pricing (or uses admin override)
// 4. Creates or links a GuestUser (INSIDE the transaction)
// 5. Creates a Booking record
// 6. Marks the message as REPLIED
//
// Protected: admin session required. Validated with Zod.

import { requireWrite } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateBookingTotal } from "@/lib/pricing";
import { calculateNights } from "@/lib/utils";
import {
  MESSAGE_TYPE,
  MESSAGE_STATUS,
  BOOKING_STATUS,
  ADVANCE_PERCENTAGE,
} from "@/lib/constants";
import { promoteMessageSchema, validationError } from "@/lib/validations/admin";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// ─── POST /api/admin/messages/[id]/promote ─────────────────────
export async function POST(request: Request, { params }: RouteParams) {
  const { session, denied } = await requireWrite();
  if (denied) return denied;

  const { id } = await params;

  try {
    // ── 1. Validate request body ──────────────────────────────
    const body = await request.json();
    const parsed = promoteMessageSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    // ── 2. Fetch the message ──────────────────────────────────
    const message = await prisma.contactMessage.findUnique({
      where: { id },
    });

    if (!message) {
      return Response.json(
        { success: false, error: "Message not found" },
        { status: 404 },
      );
    }

    // ── 3. Validate it's a BOOKING_REQUEST with required data ─
    if (message.type !== MESSAGE_TYPE.BOOKING_REQUEST) {
      return Response.json(
        {
          success: false,
          error:
            "Only BOOKING_REQUEST messages can be promoted to bookings",
        },
        { status: 400 },
      );
    }

    if (!message.checkIn || !message.checkOut || !message.guestCount) {
      return Response.json(
        {
          success: false,
          error:
            "Message is missing booking data (checkIn, checkOut, or guestCount)",
        },
        { status: 400 },
      );
    }

    // ── 4. Check for date overlap (double-booking prevention) ─
    // A booking overlaps if its checkIn < our checkOut AND its checkOut > our checkIn
    const overlapping = await prisma.booking.findFirst({
      where: {
        status: {
          in: [
            BOOKING_STATUS.PENDING,
            BOOKING_STATUS.CONFIRMED,
            BOOKING_STATUS.COMPLETED,
          ],
        },
        checkIn: { lt: message.checkOut },
        checkOut: { gt: message.checkIn },
      },
      select: { id: true, checkIn: true, checkOut: true, guestName: true },
    });

    if (overlapping) {
      return Response.json(
        {
          success: false,
          error: `Date conflict: overlaps with booking for ${overlapping.guestName} (${overlapping.checkIn.toISOString().slice(0, 10)} → ${overlapping.checkOut.toISOString().slice(0, 10)})`,
        },
        { status: 409 },
      );
    }

    // ── 5. Calculate pricing ──────────────────────────────────
    const pricing = await calculateBookingTotal(
      message.checkIn,
      message.checkOut,
    );
    const nights = calculateNights(message.checkIn, message.checkOut);

    // Admin can override the total price (e.g., discount for repeat guest)
    const totalPrice = parsed.data.totalPriceOverride ?? pricing.totalPrice;
    const advanceAmount =
      Math.round(totalPrice * ADVANCE_PERCENTAGE * 100) / 100;

    // ── 6. Transaction: upsert GuestUser + create Booking + mark message ─
    // GuestUser upsert is INSIDE the transaction to prevent orphans if
    // booking creation fails.
    const result = await prisma.$transaction(async (tx) => {
      const guestUser = await tx.guestUser.upsert({
        where: { email: message.email },
        update: {
          name: message.name,
          phone: message.phone,
          lastBookingAt: new Date(),
          totalBookings: { increment: 1 },
        },
        create: {
          email: message.email,
          name: message.name,
          phone: message.phone,
          totalBookings: 1,
          lastBookingAt: new Date(),
        },
      });

      const booking = await tx.booking.create({
        data: {
          checkIn: message.checkIn!,
          checkOut: message.checkOut!,
          numberOfNights: nights,
          guestCount: message.guestCount!,
          guestName: message.name,
          guestEmail: message.email,
          guestPhone: message.phone,
          totalPrice,
          advanceAmount,
          specialRequests: parsed.data.notes ?? null,
          approvedBy: session.user.id,
          approvedAt: new Date(),
          guestUserId: guestUser.id,
        },
      });

      await tx.contactMessage.update({
        where: { id },
        data: {
          status: MESSAGE_STATUS.REPLIED,
          repliedBy: session.user.id,
          repliedAt: new Date(),
        },
      });

      return { booking, guestUser };
    });

    return Response.json(
      {
        success: true,
        data: {
          bookingId: result.booking.id,
          guestUserId: result.guestUser.id,
          totalPrice: Number(result.booking.totalPrice),
          advanceAmount: Number(result.booking.advanceAmount),
          nights,
          minStayValid: pricing.minStayValid,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(`[API] POST /admin/messages/${id}/promote failed:`, error);
    return Response.json(
      { success: false, error: "Failed to promote message to booking" },
      { status: 500 },
    );
  }
}
