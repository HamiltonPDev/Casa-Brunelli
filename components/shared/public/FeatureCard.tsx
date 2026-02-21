"use client";

// components/shared/public/FeatureCard.tsx
// Molecule — icon + title + description card with hover animation
// Used in HomeLanding features grid and villa highlights section

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  /** Tailwind gradient classes e.g. "from-mint-tint to-cream" */
  gradient?: string;
  delay?: number;
  className?: string;
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  gradient = "from-cream to-mint-pale",
  delay = 0,
  className,
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.03, y: -4 }}
      className={cn(
        "flex flex-col gap-4 p-6 rounded-2xl border cursor-default",
        gradient && `bg-linear-to-br ${gradient}`,
        className
      )}
      style={{ borderColor: "rgba(139,157,131,0.2)" }}
    >
      <motion.div
        whileHover={{ rotate: [0, -10, 10, -10, 0] }}
        transition={{ duration: 0.5 }}
        className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm"
      >
        <Icon size={22} style={{ color: "var(--sage-variant)" }} />
      </motion.div>

      <div className="flex flex-col gap-1.5">
        <h3
          className="text-base font-semibold"
          style={{ color: "var(--dark-forest)" }}
        >
          {title}
        </h3>
        <p
          className="text-sm leading-relaxed"
          style={{ color: "rgba(61,82,67,0.7)" }}
        >
          {description}
        </p>
      </div>
    </motion.div>
  );
}
