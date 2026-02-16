// components/ui/Button.tsx
// Atom — public-facing button (NOT admin — admin uses AdminButton)

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import Link from "next/link";

interface ButtonBaseProps {
  /** "primary" = dark-forest bg, "outline" = border only, "gold" = terracotta-gold bg */
  variant?: "primary" | "outline" | "gold";
  /** "md" = px-6 py-3 (default), "lg" = px-8 py-4 */
  size?: "md" | "lg";
  children: ReactNode;
  className?: string;
}

interface ButtonAsButton extends ButtonBaseProps {
  href?: never;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

interface ButtonAsLink extends ButtonBaseProps {
  href: string;
  onClick?: never;
  disabled?: never;
  type?: never;
}

type ButtonProps = ButtonAsButton | ButtonAsLink;

const VARIANT_STYLES = {
  primary: {
    backgroundColor: "var(--dark-forest)",
    color: "white",
    border: "none",
  },
  outline: {
    backgroundColor: "transparent",
    color: "var(--medium-green)",
    border: "1px solid rgba(139,157,131,0.3)",
  },
  gold: {
    backgroundColor: "var(--terracotta-gold)",
    color: "var(--dark-forest)",
    border: "none",
  },
} as const;

const SIZE_CLASSES = {
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-sm",
} as const;

const BASE_CLASS =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 hover:opacity-90 active:scale-[0.98]";

export function Button({
  variant = "primary",
  size = "md",
  children,
  className,
  ...props
}: ButtonProps) {
  const styles = VARIANT_STYLES[variant];
  const classes = cn(BASE_CLASS, SIZE_CLASSES[size], className);

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} className={classes} style={styles}>
        {children}
      </Link>
    );
  }

  const { onClick, disabled, type = "button" } = props as ButtonAsButton;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(classes, disabled && "opacity-50 cursor-not-allowed")}
      style={styles}
    >
      {children}
    </button>
  );
}
