"use client";

// components/ui/public/FadeInView.tsx
// Atom — wraps children in a whileInView fade+slide animation
// Respects prefers-reduced-motion (WCAG 2.3.3)

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

interface FadeInViewProps {
  children: ReactNode;
  /** Stagger delay in seconds (default 0) */
  delay?: number;
  /** Animation duration in seconds (default 0.6) */
  duration?: number;
  /** Y offset to animate from (default 24) */
  y?: number;
  className?: string;
}

export function FadeInView({
  children,
  delay = 0,
  duration = 0.6,
  y = 24,
  className,
}: FadeInViewProps) {
  const prefersReducedMotion = useReducedMotion();

  // When user prefers reduced motion, render without animation
  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: "easeOut" }}
      viewport={{ once: true }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
