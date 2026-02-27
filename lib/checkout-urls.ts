/**
 * Casa Brunelli — Checkout URL Cache (localStorage)
 *
 * Stores Stripe Checkout URLs in localStorage with a TTL so the admin
 * can re-copy a payment link without creating a duplicate session.
 *
 * Key format: `checkout:{bookingId}:{DEPOSIT|BALANCE}`
 * Value: JSON `{ url: string; expiresAt: number }`
 *
 * TTL matches PAYMENT_LINK_EXPIRY_HOURS (24h) from constants.
 */

import { PAYMENT_LINK_EXPIRY_HOURS } from "@/lib/constants";
import type { PaymentType } from "@/types";

// ─── Types ─────────────────────────────────────────────────────

interface CachedUrl {
  url: string;
  expiresAt: number;
}

// ─── Helpers ───────────────────────────────────────────────────

function storageKey(bookingId: string, type: PaymentType): string {
  return `checkout:${bookingId}:${type}`;
}

function isAvailable(): boolean {
  try {
    const test = "__ls_test__";
    localStorage.setItem(test, "1");
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

// ─── Public API ────────────────────────────────────────────────

/** Save a checkout URL with automatic TTL (24h). */
export function saveCheckoutUrl(
  bookingId: string,
  type: PaymentType,
  url: string,
): void {
  if (!isAvailable()) return;

  const entry: CachedUrl = {
    url,
    expiresAt: Date.now() + PAYMENT_LINK_EXPIRY_HOURS * 60 * 60 * 1000,
  };
  try {
    localStorage.setItem(storageKey(bookingId, type), JSON.stringify(entry));
  } catch {
    // Quota exceeded or private mode — silently ignore
  }
}

/** Retrieve a cached checkout URL. Returns `null` if expired or missing. */
export function getCheckoutUrl(
  bookingId: string,
  type: PaymentType,
): string | null {
  if (!isAvailable()) return null;

  const key = storageKey(bookingId, type);
  const raw = localStorage.getItem(key);
  if (!raw) return null;

  try {
    const entry: CachedUrl = JSON.parse(raw);
    if (Date.now() > entry.expiresAt) {
      localStorage.removeItem(key);
      return null;
    }
    return entry.url;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
}

/** Remove a specific cached URL (e.g., after payment completes). */
export function clearCheckoutUrl(
  bookingId: string,
  type: PaymentType,
): void {
  if (!isAvailable()) return;
  localStorage.removeItem(storageKey(bookingId, type));
}
