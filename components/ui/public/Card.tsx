// components/ui/public/Card.tsx
// Atom — white rounded card with sage border, used across public pages

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  /** Optional card title — renders as serif h3 matching design system */
  title?: string;
  /** "md" = p-6 (default), "sm" = p-5, "lg" = p-8 */
  padding?: "sm" | "md" | "lg";
  className?: string;
}

const PADDING_MAP = {
  sm: "p-5",
  md: "p-6",
  lg: "p-8",
} as const;

export function Card({
  children,
  title,
  padding = "md",
  className,
}: Readonly<CardProps>) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl border",
        PADDING_MAP[padding],
        className
      )}
      style={{ borderColor: "rgba(139,157,131,0.2)" }}
    >
      {title && (
        <h3
          className="font-serif text-lg mb-4"
          style={{ color: "var(--dark-forest)" }}
        >
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
