// components/shared/public/SuccessConfirmation.tsx
// Molecule — success state after form submission
// Shared between BookingForm + ContactForm (green checkmark, heading, message, optional grid)

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/public/Button";
import type { ReactNode } from "react";

// ─── Types ─────────────────────────────────────────────────────

interface SummaryItem {
  label: string;
  value: string;
  /** Render value with serif + larger text (e.g. pricing) */
  highlight?: boolean;
}

interface SuccessConfirmationProps {
  /** Main heading — e.g. "Booking Request Received" */
  heading: string;
  /** Message body — supports ReactNode for bold/email */
  message: ReactNode;
  /** Optional summary grid (check-in, check-out, guests, total, etc.) */
  summary?: readonly SummaryItem[];
  /** CTA button label — e.g. "Back to Home" */
  ctaLabel: string;
  /** CTA action — either a href (string) or onClick handler */
  ctaAction: string | (() => void);
  /** Whether the card wraps itself in a full-screen centered layout */
  fullscreen?: boolean;
}

// ─── Component ─────────────────────────────────────────────────

export function SuccessConfirmation({
  heading,
  message,
  summary,
  ctaLabel,
  ctaAction,
  fullscreen = false,
}: Readonly<SuccessConfirmationProps>) {
  const content = (
    <div
      className="max-w-2xl w-full text-center bg-white rounded-2xl p-10 border"
      style={{ borderColor: "rgba(139,157,131,0.2)" }}
    >
      {/* Green checkmark */}
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
        style={{ backgroundColor: "rgba(46,125,50,0.1)" }}
      >
        <CheckCircle2 size={32} style={{ color: "#2E7D32" }} />
      </div>

      {/* Heading */}
      <h2
        className="font-serif text-3xl mb-4"
        style={{ color: "var(--dark-forest)" }}
      >
        {heading}
      </h2>

      {/* Message */}
      <p className="mb-8 max-w-md mx-auto" style={{ color: "#3D5243CC" }}>
        {message}
      </p>

      {/* Optional summary grid */}
      {summary && summary.length > 0 && (
        <div
          className="rounded-xl p-6 mb-8 text-left max-w-md mx-auto"
          style={{ backgroundColor: "var(--cream)" }}
        >
          <div className="grid grid-cols-2 gap-4 text-sm">
            {summary.map((item) => (
              <div key={item.label}>
                <div className="mb-1" style={{ color: "#3D524399" }}>
                  {item.label}
                </div>
                <div
                  className={
                    item.highlight
                      ? "font-medium font-serif text-lg"
                      : "font-medium"
                  }
                  style={{ color: "var(--dark-forest)" }}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA button */}
      {typeof ctaAction === "string" ? (
        <Button href={ctaAction} size="lg">
          {ctaLabel}
        </Button>
      ) : (
        <Button onClick={ctaAction} size="lg">
          {ctaLabel}
        </Button>
      )}
    </div>
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={
          fullscreen ? "min-h-[60vh] flex items-center justify-center" : ""
        }
      >
        {content}
      </motion.div>
    </AnimatePresence>
  );
}
