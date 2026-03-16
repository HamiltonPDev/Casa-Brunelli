/**
 * Casa Brunelli — Application Constants
 * Source of truth: Notion Documentation + CASA_BRUNELLI_CLAUDE_CODE_PROMPT.md
 */

// ─── Business Rules ────────────────────────────────────────────

/** Default nightly rate when no season is active */
export const DEFAULT_NIGHTLY_RATE = 450;

/** Advance percentage (30%) */
export const ADVANCE_PERCENTAGE = 0.3;

/** Balance percentage (70%) */
export const BALANCE_PERCENTAGE = 0.7;

/** Days before check-in to send balance payment link */
export const BALANCE_DUE_DAYS_BEFORE_CHECKIN = 7;

/** Days before check-in to send first balance reminder */
export const BALANCE_REMINDER_DAYS_BEFORE_CHECKIN = 30;

/** Maximum number of guests */
export const MAX_GUESTS = 8;

/** Minimum number of guests */
export const MIN_GUESTS = 1;

/** Stripe payment link expiry in hours */
export const PAYMENT_LINK_EXPIRY_HOURS = 24;

/** Villa physical address — used in emails and booking confirmations */
export const VILLA_ADDRESS = "Località Brunelli, 52044 Cortona (AR), Tuscany, Italy";

// ─── Booking Status ────────────────────────────────────────────

export const BOOKING_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
  COMPLETED: "COMPLETED",
} as const;

export type BookingStatus =
  (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];

// ─── Message Types ─────────────────────────────────────────────

export const MESSAGE_TYPE = {
  GENERAL: "GENERAL",
  BOOKING_REQUEST: "BOOKING_REQUEST",
  QUESTION: "QUESTION",
  COMPLAINT: "COMPLAINT",
} as const;

export type MessageType = (typeof MESSAGE_TYPE)[keyof typeof MESSAGE_TYPE];

// ─── Message Status ────────────────────────────────────────────

export const MESSAGE_STATUS = {
  UNREAD: "UNREAD",
  READ: "READ",
  REPLIED: "REPLIED",
} as const;

export type MessageStatus =
  (typeof MESSAGE_STATUS)[keyof typeof MESSAGE_STATUS];

// ─── Season Status ─────────────────────────────────────────────

export const SEASON_STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  ARCHIVED: "ARCHIVED",
} as const;

export type SeasonStatus = (typeof SEASON_STATUS)[keyof typeof SEASON_STATUS];

// ─── DOW Override Types ────────────────────────────────────────

export const OVERRIDE_TYPE = {
  ADD: "ADD",
  SUBTRACT: "SUBTRACT",
  CUSTOM: "CUSTOM",
} as const;

export type OverrideType = (typeof OVERRIDE_TYPE)[keyof typeof OVERRIDE_TYPE];

// ─── Admin Roles ───────────────────────────────────────────────

export const ADMIN_ROLE = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  VIEWER: "VIEWER",
} as const;

export type AdminRole = (typeof ADMIN_ROLE)[keyof typeof ADMIN_ROLE];

// ─── Email Categories ──────────────────────────────────────────

export const EMAIL_CATEGORY = {
  BOOKING_CONFIRMATION: "BOOKING_CONFIRMATION",
  ADVANCE_RECEIVED: "ADVANCE_RECEIVED",
  ADVANCE_PAYMENT_LINK: "ADVANCE_PAYMENT_LINK",
  BALANCE_REMINDER: "BALANCE_REMINDER",
  ADMIN_NEW_BOOKING: "ADMIN_NEW_BOOKING",
  CONTACT_REPLY: "CONTACT_REPLY",
  EARLY_CHECKIN: "EARLY_CHECKIN",
  PARKING: "PARKING",
  REFUND: "REFUND",
  GENERAL: "GENERAL",
} as const;

export type EmailCategory =
  (typeof EMAIL_CATEGORY)[keyof typeof EMAIL_CATEGORY];

// ─── Payment Status ────────────────────────────────────────────

export const PAYMENT_STATUS = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
} as const;

export type PaymentStatus =
  (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

// ─── Payment Types ─────────────────────────────────────────────

export const PAYMENT_TYPE = {
  ADVANCE: "ADVANCE",
  BALANCE: "BALANCE",
  REFUND: "REFUND",
} as const;

export type PaymentType = (typeof PAYMENT_TYPE)[keyof typeof PAYMENT_TYPE];

// ─── Days of Week ──────────────────────────────────────────────

export const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday", short: "Sun" },
  { value: 1, label: "Monday", short: "Mon" },
  { value: 2, label: "Tuesday", short: "Tue" },
  { value: 3, label: "Wednesday", short: "Wed" },
  { value: 4, label: "Thursday", short: "Thu" },
  { value: 5, label: "Friday", short: "Fri" },
  { value: 6, label: "Saturday", short: "Sat" },
] as const;

// ─── Sample Seasons (pre-configured from Notion) ───────────────

export const SAMPLE_SEASONS = [
  {
    name: "High Summer",
    colorTag: "#1a4a3a",
    startMonth: 6,
    startDay: 15,
    endMonth: 8,
    endDay: 31,
    baseRate: 750,
    minStay: 7,
    priority: 10,
    dowOverrides: [
      { dayOfWeek: 5, type: "ADD", amount: 50 }, // Friday
      { dayOfWeek: 6, type: "ADD", amount: 50 }, // Saturday
    ],
  },
  {
    name: "Spring Blossom",
    colorTag: "#9caf88",
    startMonth: 4,
    startDay: 1,
    endMonth: 6,
    endDay: 14,
    baseRate: 550,
    minStay: 3,
    priority: 7,
    dowOverrides: [
      { dayOfWeek: 5, type: "ADD", amount: 40 },
      { dayOfWeek: 6, type: "ADD", amount: 40 },
    ],
  },
  {
    name: "Autumn Harvest",
    colorTag: "#C0AF7E",
    startMonth: 9,
    startDay: 1,
    endMonth: 11,
    endDay: 15,
    baseRate: 600,
    minStay: 4,
    priority: 8,
    dowOverrides: [
      { dayOfWeek: 5, type: "ADD", amount: 45 },
      { dayOfWeek: 6, type: "ADD", amount: 45 },
    ],
  },
  {
    name: "Winter Retreat",
    colorTag: "#8B9D83",
    startMonth: 11,
    startDay: 16,
    endMonth: 3,
    endDay: 31,
    baseRate: 450,
    minStay: 2,
    priority: 5,
    dowOverrides: [],
  },
  {
    name: "Holiday Premium",
    colorTag: "#d2691e",
    startMonth: 12,
    startDay: 20,
    endMonth: 1,
    endDay: 5,
    baseRate: 850,
    minStay: 5,
    priority: 15, // Wins all overlaps
    dowOverrides: [],
  },
] as const;

// ─── Countries (Booking & Contact forms) ───────────────────────

export const COUNTRIES = [
  { value: "IT", label: "Italy" },
  { value: "GB", label: "United Kingdom" },
  { value: "US", label: "United States" },
  { value: "FR", label: "France" },
  { value: "DE", label: "Germany" },
  { value: "ES", label: "Spain" },
  { value: "NL", label: "Netherlands" },
  { value: "CH", label: "Switzerland" },
  { value: "AT", label: "Austria" },
  { value: "BE", label: "Belgium" },
  { value: "AU", label: "Australia" },
  { value: "CA", label: "Canada" },
] as const;

// ─── Quick Reply Templates (Messages) ──────────────────────

export const QUICK_REPLIES = [
  {
    value: "parking",
    label: "Parking Information",
    body: "Free parking is available on-site at Casa Brunelli. There are 3 designated parking spots for our guests. No reservation needed — parking is included in your stay.",
  },
  {
    value: "checkin",
    label: "Check-in Instructions",
    body: "Check-in is from 3:00 PM onwards. You will receive a detailed welcome guide with the access code 24 hours before your arrival. Early check-in may be arranged subject to availability — please don't hesitate to ask.",
  },
  {
    value: "amenities",
    label: "Amenities List",
    body: "Casa Brunelli features: private outdoor pool (open May–October), BBQ area, fully equipped kitchen, high-speed Wi-Fi, air conditioning throughout, outdoor dining terrace, and stunning Tuscan countryside views.",
  },
  {
    value: "cancellation",
    label: "Cancellation Policy",
    body: "We offer free cancellation up to 14 days before check-in. Cancellations within 14 days will forfeit the 30% advance payment. The remaining balance is not charged for cancellations made at least 7 days before arrival.",
  },
  {
    value: "pricing",
    label: "Pricing Inquiry",
    body: "Thank you for your interest in Casa Brunelli. I'd be happy to provide a personalised quote for your requested dates. Could you please let me know your preferred check-in/check-out dates and the number of guests in your party?",
  },
] as const;

// ─── Email Defaults ────────────────────────────────────────────

/** Default "from" address for Resend emails (sandbox — update to casabrunelli.com in production) */
export const RESEND_FROM_DEFAULT = "Casa Brunelli <onboarding@resend.dev>";

/** Default "reply-to" address for Resend emails (sandbox — update to casabrunelli.com in production) */
export const RESEND_REPLY_TO_DEFAULT = "onboarding@resend.dev";

// ─── App Config ────────────────────────────────────────────────

export const APP_CONFIG = {
  name: "Casa Brunelli",
  currency: "EUR",
  locale: "it-IT",
  timezone: "Europe/Rome",
  contactEmail: "info@casabrunelli.com",
  adminEmail: process.env.ADMIN_NOTIFICATION_EMAIL ?? "admin@casabrunelli.com",
} as const;

// ─── API Response Format ───────────────────────────────────────

export const API_MESSAGES = {
  CREATED: "Created successfully",
  UPDATED: "Updated successfully",
  DELETED: "Deleted successfully",
  NOT_FOUND: "Resource not found",
  UNAUTHORIZED: "Unauthorized",
  FORBIDDEN: "Forbidden",
  INTERNAL_ERROR: "Internal server error",
  INVALID_INPUT: "Invalid input data",
} as const;
