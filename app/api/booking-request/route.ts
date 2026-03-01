// app/api/booking-request/route.ts
// Public endpoint — no auth required
// Creates a ContactMessage of type BOOKING_REQUEST (Messages-First flow)
// No Booking record is created here — admin approves from the Messages module

import { prisma } from "@/lib/prisma";
import { calculateBookingTotal } from "@/lib/pricing";
import {
  MESSAGE_TYPE,
  BOOKING_STATUS,
  ADVANCE_PERCENTAGE,
} from "@/lib/constants";
import {
  bookingRequestSchema,
  validationError,
} from "@/lib/validations/admin";

// ─── POST /api/booking-request ─────────────────────────────────

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = bookingRequestSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const {
      name,
      email,
      phone,
      checkIn,
      checkOut,
      guestCount,
      specialRequests,
    } = parsed.data;

    // Parse dates at midnight UTC
    const checkInDate = new Date(checkIn + "T00:00:00Z");
    const checkOutDate = new Date(checkOut + "T00:00:00Z");

    // Validate date logic
    if (checkInDate >= checkOutDate) {
      return Response.json(
        { success: false, error: "Check-out must be after check-in" },
        { status: 400 },
      );
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    if (checkInDate < today) {
      return Response.json(
        { success: false, error: "Check-in date cannot be in the past" },
        { status: 400 },
      );
    }

    // ── Availability check: reject if dates overlap existing bookings ──
    const overlapping = await prisma.booking.findFirst({
      where: {
        status: {
          in: [
            BOOKING_STATUS.PENDING,
            BOOKING_STATUS.CONFIRMED,
            BOOKING_STATUS.COMPLETED,
          ],
        },
        checkIn: { lt: checkOutDate },
        checkOut: { gt: checkInDate },
      },
      select: { id: true },
    });

    if (overlapping) {
      return Response.json(
        {
          success: false,
          error:
            "The selected dates are not available. Please choose different dates.",
        },
        { status: 409 },
      );
    }

    // Calculate pricing for the requested dates
    const pricing = await calculateBookingTotal(checkInDate, checkOutDate);

    // Build a human-readable subject line
    const subject = `Booking request: ${checkIn} → ${checkOut} (${pricing.nights} nights, ${guestCount} guests)`;

    // Build message body with all relevant details
    const message = [
      `Check-in:  ${checkIn}`,
      `Check-out: ${checkOut}`,
      `Nights:    ${pricing.nights}`,
      `Guests:    ${guestCount}`,
      `Total:     €${pricing.totalPrice.toFixed(2)}`,
      `Advance (${ADVANCE_PERCENTAGE * 100}%): €${pricing.advanceAmount.toFixed(2)}`,
      pricing.minStayRequired
        ? `Min stay: ${pricing.minStayRequired} nights`
        : null,
      specialRequests ? `\nSpecial requests:\n${specialRequests}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    // Create the ContactMessage (Messages-First — no Booking record yet)
    const contactMessage = await prisma.contactMessage.create({
      data: {
        type: MESSAGE_TYPE.BOOKING_REQUEST,
        name,
        email,
        phone: phone ?? null,
        subject,
        message,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guestCount,
        totalPrice: pricing.totalPrice,
      },
    });

    return Response.json(
      {
        success: true,
        data: {
          id: contactMessage.id,
          nights: pricing.nights,
          totalPrice: pricing.totalPrice,
          advanceAmount: pricing.advanceAmount,
          minStayRequired: pricing.minStayRequired,
          minStayValid: pricing.minStayValid,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[API] POST /api/booking-request error:", error);
    return Response.json(
      { success: false, error: "Failed to submit booking request" },
      { status: 500 },
    );
  }
}
