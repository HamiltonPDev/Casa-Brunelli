// components/shared/SectionHeader.tsx
// Molecule — Eyebrow + SectionHeading + optional subtitle, centered or left-aligned
// Replaces the repeated "eyebrow + h2 + p" pattern found in every section of HomeLanding

import { Eyebrow } from "@/components/ui/Eyebrow";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  eyebrow: string;
  heading: string;
  subtitle?: string;
  align?: "center" | "left";
  /** heading size passed to SectionHeading */
  size?: "xl" | "lg" | "sm";
  /** heading color — "dark" on light bg, "wheat" on dark bg */
  color?: "dark" | "wheat";
  className?: string;
}

export function SectionHeader({
  eyebrow,
  heading,
  subtitle,
  align = "center",
  size = "xl",
  color = "dark",
  className,
}: SectionHeaderProps) {
  const isCenter = align === "center";

  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        isCenter && "items-center text-center",
        isCenter && "max-w-xl mx-auto",
        className
      )}
    >
      <Eyebrow color={color === "wheat" ? "gold" : "gold"}>{eyebrow}</Eyebrow>
      <SectionHeading size={size} color={color}>
        {heading}
      </SectionHeading>
      {subtitle && (
        <p
          className="text-sm leading-relaxed"
          style={{
            color:
              color === "wheat"
                ? "rgba(245,243,239,0.7)"
                : "rgba(61,82,67,0.7)",
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
