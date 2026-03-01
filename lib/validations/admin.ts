/**
 * Casa Brunelli — Admin API Zod Schemas
 * Centralized validation for all admin POST/PATCH endpoints.
 * Import from "zod/v4" — Zod 4 syntax (z.email(), z.uuid(), etc.)
 */

import { z } from "zod/v4";
import {
  BOOKING_STATUS,
  MESSAGE_STATUS,
  SEASON_STATUS,
  OVERRIDE_TYPE,
  MIN_GUESTS,
  MAX_GUESTS,
} from "@/lib/constants";

// ═══════════════════════════════════════════════════════════════
// MESSAGES
// ═══════════════════════════════════════════════════════════════

/** PATCH /api/admin/messages/[id] — update message status */
export const updateMessageSchema = z.object({
  status: z.enum(Object.values(MESSAGE_STATUS) as [string, ...string[]], {
    error: `Status must be one of: ${Object.values(MESSAGE_STATUS).join(", ")}`,
  }),
});

/** POST /api/admin/messages/[id]/promote — promote message to booking */
export const promoteMessageSchema = z.object({
  /** Override the calculated total price (optional — recalculated if omitted) */
  totalPriceOverride: z.number().positive().optional(),
  /** Admin notes for the new booking */
  notes: z.string().max(1000).optional(),
});

// ═══════════════════════════════════════════════════════════════
// BOOKINGS
// ═══════════════════════════════════════════════════════════════

/** PATCH /api/admin/bookings — bulk status update */
export const bulkUpdateBookingsSchema = z.object({
  ids: z
    .array(z.string().min(1))
    .min(1, { error: "At least one booking ID is required" }),
  status: z.enum(Object.values(BOOKING_STATUS) as [string, ...string[]], {
    error: `Status must be one of: ${Object.values(BOOKING_STATUS).join(", ")}`,
  }),
});

/** DELETE /api/admin/bookings — bulk delete */
export const bulkDeleteBookingsSchema = z.object({
  ids: z
    .array(z.string().min(1))
    .min(1, { error: "At least one booking ID is required" }),
});

/** PATCH /api/admin/bookings/[id] — update single booking */
export const updateBookingSchema = z
  .object({
    status: z
      .enum(Object.values(BOOKING_STATUS) as [string, ...string[]], {
        error: `Status must be one of: ${Object.values(BOOKING_STATUS).join(
          ", ",
        )}`,
      })
      .optional(),
    advancePaid: z.boolean().optional(),
    balancePaid: z.boolean().optional(),
  })
  .refine(
    (data) =>
      data.status !== undefined ||
      data.advancePaid !== undefined ||
      data.balancePaid !== undefined,
    {
      error:
        "At least one field (status, advancePaid, or balancePaid) is required",
    },
  );

// ═══════════════════════════════════════════════════════════════
// SEASONS
// ═══════════════════════════════════════════════════════════════

/** DOW override sub-schema (used in season create/update) */
const dowOverrideSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  type: z.enum(Object.values(OVERRIDE_TYPE) as [string, ...string[]]),
  amount: z.number().positive(),
});

/** POST /api/admin/seasons — create season */
export const createSeasonSchema = z.object({
  name: z.string().min(2).max(100),
  colorTag: z.string().min(3).max(20),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { error: "Date must be yyyy-MM-dd" }),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { error: "Date must be yyyy-MM-dd" }),
  baseRate: z.number().positive(),
  minStay: z.number().int().min(1).max(30),
  priority: z.number().int().min(1).max(20),
  notes: z.string().max(500).optional(),
  dowOverrides: z.array(dowOverrideSchema).optional(),
});

/** PATCH /api/admin/seasons/[id] — update season (all fields optional) */
export const updateSeasonSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  colorTag: z.string().min(3).max(20).optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { error: "Date must be yyyy-MM-dd" })
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { error: "Date must be yyyy-MM-dd" })
    .optional(),
  baseRate: z.number().positive().optional(),
  minStay: z.number().int().min(1).max(30).optional(),
  priority: z.number().int().min(1).max(20).optional(),
  notes: z.string().max(500).nullish(),
  status: z
    .enum(Object.values(SEASON_STATUS) as [string, ...string[]])
    .optional(),
  dowOverrides: z.array(dowOverrideSchema).optional(),
});

// ═══════════════════════════════════════════════════════════════
// UNAVAILABLE DATES
// ═══════════════════════════════════════════════════════════════

/** POST /api/admin/unavailable-dates — block one or more dates */
export const createUnavailableDatesSchema = z.object({
  dates: z
    .array(
      z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, { error: "Date must be yyyy-MM-dd" }),
    )
    .min(1, { error: "At least one date is required" }),
  reason: z.string().max(200).optional(),
});

/** DELETE /api/admin/unavailable-dates — unblock one or more dates */
export const deleteUnavailableDatesSchema = z.object({
  dates: z
    .array(
      z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, { error: "Date must be yyyy-MM-dd" }),
    )
    .min(1, { error: "At least one date is required" }),
});

// ═══════════════════════════════════════════════════════════════
// BOOKING REQUEST (public — no auth, but uses shared validation)
// ═══════════════════════════════════════════════════════════════

/** POST /api/booking-request — public booking inquiry form */
export const bookingRequestSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.email("Invalid email address"),
  phone: z.string().optional(),
  checkIn: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { error: "Date must be yyyy-MM-dd" }),
  checkOut: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { error: "Date must be yyyy-MM-dd" }),
  guestCount: z.number().int().min(MIN_GUESTS).max(MAX_GUESTS),
  specialRequests: z.string().max(1000).optional(),
});

// ═══════════════════════════════════════════════════════════════
// CONTACT (public — no auth, but uses shared validation helper)
// ═══════════════════════════════════════════════════════════════

/** POST /api/contact — public contact form submission */
export const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.email("Invalid email address"),
  phone: z.string().optional(),
  subject: z.string().min(3, "Subject too short").max(200),
  message: z.string().min(10, "Message too short").max(5000),
});

// ═══════════════════════════════════════════════════════════════
// STRIPE CHECKOUT
// ═══════════════════════════════════════════════════════════════

/** POST /api/stripe/checkout — create Stripe Checkout Session */
export const createCheckoutSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  type: z.enum(["ADVANCE", "BALANCE"], {
    error: "Payment type must be ADVANCE or BALANCE",
  }),
});

// ═══════════════════════════════════════════════════════════════
// HELPER — Standard error response from Zod issues
// ═══════════════════════════════════════════════════════════════

/** Creates a consistent 400 Response from Zod validation errors */
export function validationError(error: z.ZodError): Response {
  return Response.json(
    {
      success: false,
      error: "Invalid input",
      issues: error.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      })),
    },
    { status: 400 },
  );
}
