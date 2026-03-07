import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS classes safely, resolving conflicts.
 * Use this for all dynamic className composition.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number as EUR currency.
 * @example formatCurrency(1250) → "€1,250.00"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formats a date as a human-readable string.
 * @example formatDate(new Date("2025-06-15")) → "Jun 15, 2025"
 */
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

/**
 * Extracts a yyyy-MM-dd string from a Date using local timezone.
 * Avoids the UTC shift that `.toISOString().split("T")[0]` causes.
 * @example toLocalDateStr(new Date("2025-06-25T00:00:00Z")) → "2025-06-24" (in UTC-5)
 */
export function toLocalDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Formats a date as a short European string from an ISO yyyy-MM-dd string.
 * Appends T00:00:00 to avoid timezone shifts.
 * @example formatDateShort("2025-06-15") → "15 Jun 2025"
 */
export function formatDateShort(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Formats a date as a long European string from an ISO yyyy-MM-dd string.
 * Appends T00:00:00 to avoid timezone shifts.
 * @example formatDateLong("2025-06-15") → "15 June 2025"
 */
export function formatDateLong(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Formats a number as EUR currency with no decimals.
 * Uses "en" locale for wider compatibility with €-prefix formatting.
 * @example formatEur(1250) → "€1,250"
 */
export function formatEur(amount: number): string {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats a date range as a string.
 * @example formatDateRange(checkIn, checkOut) → "Jun 15 – Jun 22, 2025"
 */
export function formatDateRange(
  checkIn: Date | string,
  checkOut: Date | string,
): string {
  const start = new Date(checkIn);
  const end = new Date(checkOut);

  const sameYear = start.getFullYear() === end.getFullYear();
  const sameMonth = sameYear && start.getMonth() === end.getMonth();

  if (sameMonth) {
    return (
      new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
      }).format(start) +
      " – " +
      new Intl.DateTimeFormat("en-US", {
        day: "numeric",
        year: "numeric",
      }).format(end)
    );
  }

  return (
    new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(
      start,
    ) +
    " – " +
    new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(end)
  );
}

/**
 * Calculates the number of nights between two dates.
 */
export function calculateNights(
  checkIn: Date | string,
  checkOut: Date | string,
): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = end.getTime() - start.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

/**
 * Calculates the 30% advance amount from a total price.
 */
export function calculateAdvance(totalPrice: number): number {
  return Math.round(totalPrice * 0.3 * 100) / 100;
}

/**
 * Calculates the 70% balance amount from a total price.
 */
export function calculateBalance(totalPrice: number): number {
  return Math.round(totalPrice * 0.7 * 100) / 100;
}

/**
 * Truncates a string to a maximum length with ellipsis.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "...";
}

/**
 * Returns initials from a full name (up to 2 chars).
 * Returns "?" for empty or whitespace-only strings.
 * @example getInitials("Marco Rossi") → "MR"
 * @example getInitials("") → "?"
 */
export function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";

  return trimmed
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Formats a date as a relative/short label for message lists.
 * Today → "HH:MM", yesterday → "Yesterday", <7 days → weekday short, else → "DD Mon".
 * @example formatMessageDate(new Date()) → "14:30"
 */
export function formatMessageDate(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return d.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return d.toLocaleDateString("en-GB", { weekday: "short" });
  }
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

/**
 * Formats a date as a full human-readable string with time.
 * @example formatFullDate(new Date()) → "Thursday, 19 February 2026, 14:30"
 */
export function formatFullDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Checks if a date falls within a range (inclusive).
 */
export function isDateInRange(date: Date, start: Date, end: Date): boolean {
  const d = date.getTime();
  return d >= start.getTime() && d <= end.getTime();
}

/**
 * Adds days to a date and returns a new Date.
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Returns true if two date ranges overlap.
 */
export function dateRangesOverlap(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date,
): boolean {
  return start1 < end2 && end1 > start2;
}
