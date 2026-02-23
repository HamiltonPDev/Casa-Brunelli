"use client";

// components/ui/public/FadeInView.tsx
// Atom — wraps children in a whileInView fade+slide animation
// Replaces 16 repeated motion.div initial/whileInView blocks

import { motion } from "framer-motion";
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
