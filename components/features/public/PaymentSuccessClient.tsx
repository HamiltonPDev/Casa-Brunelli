// components/features/public/PaymentSuccessClient.tsx
// Organism — Payment success confirmation with micro-interactions
// Client component for framer-motion animations.
// Reuses SuccessConfirmation molecule structure with extended payment-specific content.

"use client";

// ─── Imports ─────────────────────────────────────────────────
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Calendar,
  Users,
  CreditCard,
  Clock,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/public/Button";

// ─── Types ───────────────────────────────────────────────────

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

interface PaymentSuccessClientProps {
  details: PaymentDetails;
}

// ─── Animation Variants ─────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
} as const;

const checkmarkVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 200,
      damping: 15,
      delay: 0.2,
    },
  },
} as const;

const sparkleVariants = {
  hidden: { scale: 0, rotate: -180 },
  visible: {
    scale: [0, 1.2, 1],
    rotate: 0,
    transition: {
      duration: 0.6,
      delay: 0.5,
      ease: "easeOut" as const,
    },
  },
};

// ─── Component ───────────────────────────────────────────────

export function PaymentSuccessClient({
  details,
}: Readonly<PaymentSuccessClientProps>) {
  const {
    guestFirstName,
    paymentType,
    amountPaid,
    totalPrice,
    advanceAmount,
    balanceAmount,
    dateRange,
    numberOfNights,
    guestCount,
    balancePaid,
    isAsyncPending,
  } = details;

  const isAdvance = paymentType === "ADVANCE";
  const isFullyPaid = balancePaid;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-2xl w-full"
    >
      {/* ─── Main Card ──────────────────────────────────────── */}
      <div
        className="bg-white rounded-2xl border overflow-hidden"
        style={{ borderColor: "rgba(139,157,131,0.2)" }}
      >
        {/* ─── Success Header ─────────────────────────────── */}
        <div
          className="relative px-8 pt-10 pb-8 text-center"
          style={{
            background:
              "linear-gradient(135deg, rgba(46,125,50,0.06) 0%, rgba(192,175,126,0.06) 100%)",
          }}
        >
          {/* Sparkle decoration */}
          <motion.div
            variants={sparkleVariants}
            className="absolute top-4 right-8"
            style={{ color: "var(--terracotta-gold)" }}
          >
            <Sparkles size={20} />
          </motion.div>
          <motion.div
            variants={sparkleVariants}
            className="absolute top-8 left-10"
            style={{ color: "var(--sage-variant)" }}
          >
            <Sparkles size={14} />
          </motion.div>

          {/* Checkmark */}
          <motion.div
            variants={checkmarkVariants}
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{
              backgroundColor: isAsyncPending
                ? "rgba(192,175,126,0.15)"
                : "rgba(46,125,50,0.1)",
            }}
          >
            {isAsyncPending ? (
              <Clock size={40} style={{ color: "var(--terracotta-gold)" }} />
            ) : (
              <CheckCircle2 size={40} style={{ color: "#2E7D32" }} />
            )}
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={itemVariants}
            className="font-serif text-3xl lg:text-4xl mb-3"
            style={{ color: "var(--dark-forest)" }}
          >
            {isAsyncPending
              ? "Payment Processing"
              : isFullyPaid
                ? "Booking Fully Paid!"
                : "Payment Confirmed!"}
          </motion.h1>

          {/* Personalised message */}
          <motion.p
            variants={itemVariants}
            className="text-base max-w-md mx-auto"
            style={{ color: "rgba(61,82,67,0.8)" }}
          >
            {isAsyncPending ? (
              <>
                Thank you, <strong>{guestFirstName}</strong>. Your payment is
                being processed by your bank. You&apos;ll receive a confirmation
                email once it&apos;s complete.
              </>
            ) : isAdvance ? (
              <>
                Thank you, <strong>{guestFirstName}</strong>! Your advance
                payment has been received. Your stay in Tuscany is now secured.
              </>
            ) : (
              <>
                Wonderful, <strong>{guestFirstName}</strong>! Your booking is
                fully paid. We can&apos;t wait to welcome you to Casa Brunelli.
              </>
            )}
          </motion.p>
        </div>

        {/* ─── Payment Summary ────────────────────────────── */}
        <motion.div variants={itemVariants} className="px-8 py-6">
          {/* Amount paid highlight */}
          <div
            className="rounded-xl p-5 mb-6 text-center"
            style={{
              backgroundColor: isAsyncPending
                ? "rgba(192,175,126,0.08)"
                : "rgba(46,125,50,0.04)",
              border: `1px solid ${isAsyncPending ? "rgba(192,175,126,0.2)" : "rgba(46,125,50,0.1)"}`,
            }}
          >
            <div
              className="text-xs tracking-[0.2em] uppercase font-semibold mb-2"
              style={{ color: "var(--sage-variant)" }}
            >
              {isAdvance ? "Advance Paid (30%)" : "Balance Paid (70%)"}
            </div>
            <div
              className="font-serif text-3xl font-medium"
              style={{ color: "var(--dark-forest)" }}
            >
              {amountPaid}
            </div>
          </div>

          {/* Booking details grid */}
          <div
            className="rounded-xl p-5"
            style={{ backgroundColor: "var(--cream)" }}
          >
            <div className="grid grid-cols-2 gap-5 text-sm">
              <DetailItem
                icon={<Calendar size={16} />}
                label="Dates"
                value={dateRange}
              />
              <DetailItem
                icon={<Users size={16} />}
                label="Guests"
                value={`${guestCount} ${guestCount === 1 ? "guest" : "guests"} · ${numberOfNights} ${numberOfNights === 1 ? "night" : "nights"}`}
              />
              <DetailItem
                icon={<CreditCard size={16} />}
                label="Total Price"
                value={totalPrice}
              />
              <DetailItem
                icon={<CreditCard size={16} />}
                label={isFullyPaid ? "Fully Paid" : "Balance Due"}
                value={isFullyPaid ? "✓ Complete" : balanceAmount}
                highlight={isFullyPaid}
              />
            </div>
          </div>
        </motion.div>

        {/* ─── Next Steps ─────────────────────────────────── */}
        <motion.div variants={itemVariants} className="px-8 pb-8">
          <div
            className="rounded-xl p-5 border"
            style={{
              borderColor: "rgba(139,157,131,0.15)",
              backgroundColor: "white",
            }}
          >
            <h2
              className="font-serif text-lg mb-3"
              style={{ color: "var(--dark-forest)" }}
            >
              What happens next?
            </h2>
            <ul
              className="space-y-2.5 text-sm"
              style={{ color: "rgba(61,82,67,0.75)" }}
            >
              {isAsyncPending ? (
                <>
                  <NextStepItem>
                    Your bank is processing the payment — this usually takes 1–2
                    business days
                  </NextStepItem>
                  <NextStepItem>
                    You&apos;ll receive a confirmation email once the payment is
                    verified
                  </NextStepItem>
                  <NextStepItem>
                    No further action needed from your side
                  </NextStepItem>
                </>
              ) : isAdvance ? (
                <>
                  <NextStepItem>
                    You&apos;ll receive a confirmation email with your booking
                    details
                  </NextStepItem>
                  <NextStepItem>
                    The remaining balance of{" "}
                    <strong style={{ color: "var(--dark-forest)" }}>
                      {balanceAmount}
                    </strong>{" "}
                    will be due before check-in
                  </NextStepItem>
                  <NextStepItem>
                    We&apos;ll send you a payment link for the balance closer to
                    your arrival date
                  </NextStepItem>
                  <NextStepItem>
                    A welcome guide with check-in details will follow 24 hours
                    before arrival
                  </NextStepItem>
                </>
              ) : (
                <>
                  <NextStepItem>
                    Your booking is fully paid — no further payments required
                  </NextStepItem>
                  <NextStepItem>
                    A welcome guide with check-in details will be sent 24 hours
                    before arrival
                  </NextStepItem>
                  <NextStepItem>Check-in is from 3:00 PM onwards</NextStepItem>
                </>
              )}
            </ul>
          </div>
        </motion.div>

        {/* ─── CTA ────────────────────────────────────────── */}
        <motion.div variants={itemVariants} className="px-8 pb-10 text-center">
          <Button href="/" size="lg">
            Back to Casa Brunelli
            <ArrowRight size={16} className="ml-2 inline" />
          </Button>

          <p className="mt-4 text-xs" style={{ color: "var(--sage-variant)" }}>
            Questions? Contact us at{" "}
            <a
              href="mailto:info@casabrunelli.com"
              className="underline underline-offset-2 transition-colors hover:opacity-80"
              style={{ color: "var(--terracotta-gold)" }}
            >
              info@casabrunelli.com
            </a>
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── Private Sub-Components ────────────────────────────────────

function DetailItem({
  icon,
  label,
  value,
  highlight = false,
}: Readonly<{
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}>) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 shrink-0" style={{ color: "var(--sage-variant)" }}>
        {icon}
      </div>
      <div>
        <div className="text-xs mb-0.5" style={{ color: "rgba(61,82,67,0.5)" }}>
          {label}
        </div>
        <div
          className="font-medium"
          style={{
            color: highlight ? "#2E7D32" : "var(--dark-forest)",
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

function NextStepItem({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <li className="flex gap-2.5 items-start">
      <div
        className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
        style={{ backgroundColor: "var(--terracotta-gold)" }}
      />
      <span>{children}</span>
    </li>
  );
}
