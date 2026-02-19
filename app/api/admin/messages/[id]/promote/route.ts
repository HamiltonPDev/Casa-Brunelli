// app/api/admin/messages/[id]/promote/route.ts
// ═══ Promote ContactMessage → Booking (Messages-First core flow) ═══
//
// This is THE business-critical action:
// 1. Validates the message is a BOOKING_REQUEST with dates/guests
// 2. Recalculates pricing (or uses admin override)
// 3. Creates or links a GuestUser
// 4. Creates a Booking record
// 5. Marks the message as REPLIED
//
// Protected: admin session required. Validated with Zod.

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateBookingTotal } from "@/lib/pricing";
import { calculateNights } from "@/lib/utils";
import { MESSAGE_TYPE, MESSAGE_STATUS, DEPOSIT_PERCENTAGE } from "@/lib/constants";
import { promoteMessageSchema, validationError } from "@/lib/validations/admin";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// ─── POST /api/admin/messages/[id]/promote ─────────────────────
export async function POST(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session) {
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id } = await params;

  // ── 1. Validate request body ──────────────────────────────
  const body = await request.json();
  const parsed = promoteMessageSchema.safeParse(body);

  if (!parsed.success) {
    return validationError(parsed.error);
  }

  try {
    // ── 2. Fetch the message ──────────────────────────────────
    const message = await prisma.contactMessage.findUnique({
      where: { id },
    });

    if (!message) {
      return Response.json(
        { success: false, error: "Message not found" },
        { status: 404 }
      );
    }

    // ── 3. Validate it's a BOOKING_REQUEST with required data ─
    if (message.type !== MESSAGE_TYPE.BOOKING_REQUEST) {
      return Response.json(
        { success: false, error: "Only BOOKING_REQUEST messages can be promoted to bookings" },
        { status: 400 }
      );
    }

    if (!message.checkIn || !message.checkOut || !message.guestCount) {
      return Response.json(
        { success: false, error: "Message is missing booking data (checkIn, checkOut, or guestCount)" },
        { status: 400 }
      );
    }

    // ── 4. Calculate pricing ──────────────────────────────────
    const pricing = await calculateBookingTotal(message.checkIn, message.checkOut);
    const nights = calculateNights(message.checkIn, message.checkOut);

    // Admin can override the total price (e.g., discount for repeat guest)
    const totalPrice = parsed.data.totalPriceOverride ?? pricing.totalPrice;
    const depositAmount = Math.round(totalPrice * DEPOSIT_PERCENTAGE * 100) / 100;

    // ── 5. Upsert GuestUser (auto-create for new guests) ────
    const guestUser = await prisma.guestUser.upsert({
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

    // ── 6. Create Booking + mark message as REPLIED (transaction) ─
    const [booking] = await prisma.$transaction([
      prisma.booking.create({
        data: {
          checkIn: message.checkIn,
          checkOut: message.checkOut,
          numberOfNights: nights,
          guestCount: message.guestCount,
          guestName: message.name,
          guestEmail: message.email,
          guestPhone: message.phone,
          totalPrice,
          depositAmount,
          specialRequests: parsed.data.notes ?? null,
          approvedBy: session.user.id,
          approvedAt: new Date(),
          guestUserId: guestUser.id,
        },
      }),
      prisma.contactMessage.update({
        where: { id },
        data: {
          status: MESSAGE_STATUS.REPLIED,
          repliedBy: session.user.id,
          repliedAt: new Date(),
        },
      }),
    ]);

    return Response.json(
      {
        success: true,
        data: {
          bookingId: booking.id,
          guestUserId: guestUser.id,
          totalPrice: Number(booking.totalPrice),
          depositAmount: Number(booking.depositAmount),
          nights,
          minStayValid: pricing.minStayValid,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(`[API] POST /admin/messages/${id}/promote failed:`, error);
    return Response.json(
      { success: false, error: "Failed to promote message to booking" },
      { status: 500 }
    );
  }
}
