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
 * Formats a date range as a string.
 * @example formatDateRange(checkIn, checkOut) → "Jun 15 – Jun 22, 2025"
 */
export function formatDateRange(checkIn: Date | string, checkOut: Date | string): string {
  const start = new Date(checkIn);
  const end = new Date(checkOut);

  const sameYear = start.getFullYear() === end.getFullYear();
  const sameMonth = sameYear && start.getMonth() === end.getMonth();

  if (sameMonth) {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(start) +
      " – " +
      new Intl.DateTimeFormat("en-US", {
        day: "numeric",
        year: "numeric",
      }).format(end);
  }

  return (
    new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(start) +
    " – " +
    new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(end)
  );
}

/**
 * Calculates the number of nights between two dates.
 */
export function calculateNights(checkIn: Date | string, checkOut: Date | string): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = end.getTime() - start.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

/**
 * Calculates the 30% deposit amount from a total price.
 */
export function calculateDeposit(totalPrice: number): number {
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
 * @example getInitials("Marco Rossi") → "MR"
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
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
  end2: Date
): boolean {
  return start1 < end2 && end1 > start2;
}
