// components/features/public/PaymentCancelledClient.tsx
// Organism — Payment cancelled / abandoned page
// Client component for framer-motion animations.
// Shown when a guest closes the Stripe Checkout without paying.

"use client";

// ─── Imports ─────────────────────────────────────────────────
import { motion } from "framer-motion";
import { XCircle, ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/public/Button";

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

const iconVariants = {
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

// ─── Component ───────────────────────────────────────────────

export function PaymentCancelledClient() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-xl w-full"
    >
      <div
        className="bg-white rounded-2xl border overflow-hidden"
        style={{ borderColor: "rgba(139,157,131,0.2)" }}
      >
        {/* ─── Header ─────────────────────────────────────── */}
        <div
          className="px-8 pt-10 pb-8 text-center"
          style={{
            background: "linear-gradient(135deg, rgba(198,40,40,0.04) 0%, rgba(192,175,126,0.04) 100%)",
          }}
        >
          {/* Icon */}
          <motion.div
            variants={iconVariants}
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: "rgba(198,40,40,0.08)" }}
          >
            <XCircle size={40} style={{ color: "#C62828" }} />
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={itemVariants}
            className="font-serif text-3xl lg:text-4xl mb-3"
            style={{ color: "var(--dark-forest)" }}
          >
            Payment Cancelled
          </motion.h1>

          {/* Message */}
          <motion.p
            variants={itemVariants}
            className="text-base max-w-sm mx-auto"
            style={{ color: "rgba(61,82,67,0.8)" }}
          >
            No worries — your payment was not processed and you have not been charged.
          </motion.p>
        </div>

        {/* ─── Info Section ───────────────────────────────── */}
        <motion.div variants={itemVariants} className="px-8 py-6">
          <div
            className="rounded-xl p-5 border"
            style={{
              borderColor: "rgba(139,157,131,0.15)",
              backgroundColor: "var(--cream)",
            }}
          >
            <h2
              className="font-serif text-lg mb-3"
              style={{ color: "var(--dark-forest)" }}
            >
              What you can do
            </h2>
            <ul className="space-y-2.5 text-sm" style={{ color: "rgba(61,82,67,0.75)" }}>
              <li className="flex gap-2.5 items-start">
                <div
                  className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                  style={{ backgroundColor: "var(--terracotta-gold)" }}
                />
                <span>
                  <strong style={{ color: "var(--dark-forest)" }}>Try again</strong> — use
                  the payment link from your email to complete the payment
                </span>
              </li>
              <li className="flex gap-2.5 items-start">
                <div
                  className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                  style={{ backgroundColor: "var(--terracotta-gold)" }}
                />
                <span>
                  <strong style={{ color: "var(--dark-forest)" }}>Link expired?</strong> — contact
                  us and we&apos;ll send you a new one
                </span>
              </li>
              <li className="flex gap-2.5 items-start">
                <div
                  className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                  style={{ backgroundColor: "var(--terracotta-gold)" }}
                />
                <span>
                  <strong style={{ color: "var(--dark-forest)" }}>Changed your mind?</strong> — your
                  booking inquiry is still on file, no action needed
                </span>
              </li>
            </ul>
          </div>
        </motion.div>

        {/* ─── CTAs ───────────────────────────────────────── */}
        <motion.div
          variants={itemVariants}
          className="px-8 pb-10 text-center space-y-3"
        >
          <Button href="/" size="lg">
            Back to Casa Brunelli
            <ArrowRight size={16} className="ml-2 inline" />
          </Button>

          <div>
            <a
              href="mailto:info@casabrunelli.com"
              className="inline-flex items-center gap-1.5 text-sm underline underline-offset-2 transition-colors hover:opacity-80"
              style={{ color: "var(--terracotta-gold)" }}
            >
              <Mail size={14} />
              Contact us for help
            </a>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
