// components/ui/public/SectionHeading.tsx
// Atom — serif section title used across all public pages

import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  children: React.ReactNode;
  /** "h1" for page-level, "h2" for sections, "h3" for cards */
  as?: "h1" | "h2" | "h3";
  /** "xl" = 3xl/4xl responsive (default), "lg" = 2xl/3xl, "sm" = lg/xl */
  size?: "xl" | "lg" | "sm";
  /** "dark" = dark-forest (default), "wheat" = golden-wheat (on dark bg) */
  color?: "dark" | "wheat";
  className?: string;
}

const SIZE_MAP = {
  xl: "text-3xl lg:text-4xl",
  lg: "text-2xl lg:text-3xl",
  sm: "text-lg lg:text-xl",
} as const;

const COLOR_MAP = {
  dark: "var(--dark-forest)",
  wheat: "var(--golden-wheat)",
} as const;

export function SectionHeading({
  children,
  as: Tag = "h2",
  size = "xl",
  color = "dark",
  className,
}: SectionHeadingProps) {
  return (
    <Tag
      className={cn("font-serif", SIZE_MAP[size], className)}
      style={{ color: COLOR_MAP[color], letterSpacing: "-0.02em" }}
    >
      {children}
    </Tag>
  );
}
