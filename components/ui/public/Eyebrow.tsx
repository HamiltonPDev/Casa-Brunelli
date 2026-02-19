// components/ui/public/Eyebrow.tsx
// Atom — small uppercase label above section titles

import { cn } from "@/lib/utils";

interface EyebrowProps {
  children: React.ReactNode;
  /** "gold" = terracotta-gold (default), "sage" = sage-variant, "muted" = medium-green */
  color?: "gold" | "sage" | "muted";
  className?: string;
}

const COLOR_MAP = {
  gold: "var(--terracotta-gold)",
  sage: "var(--sage-variant)",
  muted: "var(--medium-green)",
} as const;

export function Eyebrow({ children, color = "gold", className }: EyebrowProps) {
  return (
    <p
      className={cn(
        "text-xs tracking-[0.3em] uppercase font-semibold",
        className
      )}
      style={{ color: COLOR_MAP[color] }}
    >
      {children}
    </p>
  );
}
