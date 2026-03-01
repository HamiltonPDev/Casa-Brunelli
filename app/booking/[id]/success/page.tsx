// app/booking/[id]/success/page.tsx
// Server Component — Payment success page for guests
// Guest is redirected here after completing a Stripe Checkout Session.
// Validates the session_id query param, fetches booking details,
// and shows a confirmation with next steps.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicNav } from "@/components/features/public/PublicNav";
import { PublicFooter } from "@/components/features/public/PublicFooter";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { formatCurrency, formatDateRange } from "@/lib/utils";
import { PAYMENT_TYPE } from "@/lib/constants";
import { PaymentSuccessClient } from "@/components/features/public/PaymentSuccessClient";

// ─── Types ─────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ session_id?: string }>;
}

// ─── Metadata ──────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Payment Confirmed — Casa Brunelli",
  description: "Your payment has been received. Thank you for choosing Casa Brunelli.",
};

// ─── Helper — Fetch & validate booking + session ───────────────

interface PaymentDetails {
  guestFirstName: string;
  paymentType: "ADVANCE" | "BALANCE";
  amountPaid: string;
  totalPrice: string;
  advanceAmount: string;
  balanceAmount: string;
  dateRange: string;
  numberOfNights: number;
  guestCount: number;
  advancePaid: boolean;
  balancePaid: boolean;
  isAsyncPending: boolean;
}

async function getPaymentDetails(
  bookingId: string,
  sessionId: string | undefined,
): Promise<PaymentDetails | null> {
  try {
    // ─── 1. Fetch booking ────────────────────────────────────
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        guestName: true,
        checkIn: true,
        checkOut: true,
        numberOfNights: true,
        guestCount: true,
        totalPrice: true,
        advanceAmount: true,
        advancePaid: true,
        balancePaid: true,
        advanceSessionId: true,
        balanceSessionId: true,
      },
    });

    if (!booking) return null;

    // ─── 2. Determine payment type from session ──────────────
    let paymentType: "ADVANCE" | "BALANCE" = PAYMENT_TYPE.ADVANCE;
    let isAsyncPending = false;

    if (sessionId) {
      // Validate session with Stripe to confirm it's real
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        const metaType = session.metadata?.paymentType;

        if (metaType === PAYMENT_TYPE.BALANCE) {
          paymentType = PAYMENT_TYPE.BALANCE;
        }

        // Check if payment is still pending (async methods like iDEAL/SEPA)
        if (session.payment_status !== "paid") {
          isAsyncPending = true;
        }
      } catch {
        // Invalid session_id — still show the page with booking data
        // but fall back to detecting type from booking state
      }
    }

    // Fallback: if no valid session, infer type from booking state
    if (!sessionId) {
      if (booking.balancePaid) {
        paymentType = PAYMENT_TYPE.BALANCE;
      }
    }

    // ─── 3. Calculate amounts ────────────────────────────────
    const totalPrice = Number(booking.totalPrice);
    const advanceAmount = Number(booking.advanceAmount);
    const balanceAmount = Math.round((totalPrice - advanceAmount) * 100) / 100;
    const amountPaid =
      paymentType === PAYMENT_TYPE.ADVANCE ? advanceAmount : balanceAmount;

    return {
      guestFirstName: booking.guestName.split(" ")[0],
      paymentType,
      amountPaid: formatCurrency(amountPaid),
      totalPrice: formatCurrency(totalPrice),
      advanceAmount: formatCurrency(advanceAmount),
      balanceAmount: formatCurrency(balanceAmount),
      dateRange: formatDateRange(booking.checkIn, booking.checkOut),
      numberOfNights: booking.numberOfNights,
      guestCount: booking.guestCount,
      advancePaid: booking.advancePaid,
      balancePaid: booking.balancePaid,
      isAsyncPending,
    };
  } catch {
    return null;
  }
}

// ─── Page ──────────────────────────────────────────────────────

export default async function PaymentSuccessPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { session_id } = await searchParams;

  const details = await getPaymentDetails(id, session_id);

  if (!details) {
    notFound();
  }

  return (
    <>
      <PublicNav />

      <main
        id="main-content"
        className="min-h-screen pt-16 md:pt-20"
        style={{ backgroundColor: "#F5F3EF" }}
      >
        <div className="min-h-[70vh] flex items-center justify-center px-6 py-16">
          <PaymentSuccessClient details={details} />
        </div>
      </main>

      <PublicFooter />
    </>
  );
}
