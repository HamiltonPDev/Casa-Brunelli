// app/api/booking-request/route.ts
// Public endpoint — no auth required
// Creates a ContactMessage of type BOOKING_REQUEST (Messages-First flow)
// No Booking record is created here — admin approves from the Messages module

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { prisma } from "@/lib/prisma";
import { calculateBookingTotal } from "@/lib/pricing";
import {
  MESSAGE_TYPE,
  MAX_GUESTS,
  MIN_GUESTS,
  DEPOSIT_PERCENTAGE,
} from "@/lib/constants";

// ─── Validation Schema ─────────────────────────────────────────

const bookingRequestSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.email("Invalid email address"),
  phone: z.string().optional(),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be yyyy-MM-dd"),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be yyyy-MM-dd"),
  guestCount: z.number().int().min(MIN_GUESTS).max(MAX_GUESTS),
  specialRequests: z.string().max(1000).optional(),
});

// ─── POST /api/booking-request ─────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = bookingRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid input", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { name, email, phone, checkIn, checkOut, guestCount, specialRequests } =
      parsed.data;

    // Parse dates at midnight UTC
    const checkInDate = new Date(checkIn + "T00:00:00Z");
    const checkOutDate = new Date(checkOut + "T00:00:00Z");

    // Validate date logic
    if (checkInDate >= checkOutDate) {
      return NextResponse.json(
        { success: false, error: "Check-out must be after check-in" },
        { status: 400 }
      );
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    if (checkInDate < today) {
      return NextResponse.json(
        { success: false, error: "Check-in date cannot be in the past" },
        { status: 400 }
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
      `Deposit (${DEPOSIT_PERCENTAGE * 100}%): €${pricing.depositAmount.toFixed(2)}`,
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

    return NextResponse.json(
      {
        success: true,
        data: {
          id: contactMessage.id,
          nights: pricing.nights,
          totalPrice: pricing.totalPrice,
          depositAmount: pricing.depositAmount,
          minStayRequired: pricing.minStayRequired,
          minStayValid: pricing.minStayValid,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API] POST /api/booking-request error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit booking request" },
      { status: 500 }
    );
  }
}
