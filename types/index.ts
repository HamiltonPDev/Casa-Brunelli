/**
 * Casa Brunelli — Domain Types
 * Source of truth: Notion Database Schema (10 tables)
 * These mirror the Prisma schema exactly.
 */

import type {
  BookingStatus,
  MessageType,
  MessageStatus,
  SeasonStatus,
  OverrideType,
  AdminRole,
  EmailCategory,
  PaymentStatus,
  PaymentType,
} from "@/lib/constants";

// ─── Re-export status/enum types ──────────────────────────────
export type {
  BookingStatus,
  MessageType,
  MessageStatus,
  SeasonStatus,
  OverrideType,
  AdminRole,
  EmailCategory,
  PaymentStatus,
  PaymentType,
};

// ═══════════════════════════════════════════════════════════════
// TABLE 1 — Booking
// Created only after admin approves a ContactMessage (BOOKING_REQUEST)
// ═══════════════════════════════════════════════════════════════
export interface Booking {
  id: string;
  checkIn: Date;
  checkOut: Date;
  numberOfNights: number;
  guestCount: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string | null;
  totalPrice: number;
  advanceAmount: number;
  advancePaid: boolean;
  balancePaid: boolean;
  status: BookingStatus;
  specialRequests: string | null;
  stripeSessionId: string | null;
  advanceSessionId: string | null;
  balanceSessionId: string | null;
  approvedBy: string | null;
  approvedAt: Date | null;
  guestUserId: string | null;
  guestUser?: GuestUser | null;
  payments?: PaymentTransaction[];
  createdAt: Date;
  updatedAt: Date;
}

// ═══════════════════════════════════════════════════════════════
// TABLE 2 — ContactMessage
// Entry point for ALL booking requests (Messages-First workflow)
// ═══════════════════════════════════════════════════════════════
export interface ContactMessage {
  id: string;
  type: MessageType;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: MessageStatus;
  /** Booking request metadata — only populated for BOOKING_REQUEST type */
  checkIn: Date | null;
  checkOut: Date | null;
  guestCount: number | null;
  totalPrice: number | null;
  repliedBy: string | null;
  admin?: AdminUser | null;
  repliedAt: Date | null;
  createdAt: Date;
}

// ═══════════════════════════════════════════════════════════════
// TABLE 3 — Season
// Seasonal pricing rules with priority-based conflict resolution
// ═══════════════════════════════════════════════════════════════
export interface Season {
  id: string;
  name: string;
  colorTag: string;
  startDate: Date;
  endDate: Date;
  baseRate: number;
  minStay: number;
  /** Higher number wins when seasons overlap */
  priority: number;
  status: SeasonStatus;
  notes: string | null;
  dowOverrides: DowOverride[];
  createdAt: Date;
  updatedAt: Date;
}

// ═══════════════════════════════════════════════════════════════
// TABLE 4 — DowOverride
// Day-of-week pricing adjustments per season (e.g., +€50 on Fridays)
// ═══════════════════════════════════════════════════════════════
export interface DowOverride {
  id: string;
  seasonId: string;
  season?: Season;
  /** 0 = Sunday, 1 = Monday, ..., 6 = Saturday */
  dayOfWeek: number;
  type: OverrideType;
  amount: number;
  createdAt: Date;
}

// ═══════════════════════════════════════════════════════════════
// TABLE 5 — AdminUser
// Admin authentication and access control
// ═══════════════════════════════════════════════════════════════
export interface AdminUser {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: AdminRole;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Safe version without passwordHash for client-side use */
export type AdminUserSafe = Omit<AdminUser, "passwordHash">;

// ═══════════════════════════════════════════════════════════════
// TABLE 6 — UnavailableDate
// Manual calendar blocks (owner blocks specific dates)
// ═══════════════════════════════════════════════════════════════
export interface UnavailableDate {
  id: string;
  date: Date;
  reason: string | null;
  createdBy: string | null;
  admin?: AdminUser | null;
  createdAt: Date;
}

// ═══════════════════════════════════════════════════════════════
// TABLE 7 — GuestUser
// Track repeat guests and booking history
// ═══════════════════════════════════════════════════════════════
export interface GuestUser {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  totalBookings: number;
  lastBookingAt: Date | null;
  notes: string | null;
  bookings?: Booking[];
  createdAt: Date;
  updatedAt: Date;
}

// ═══════════════════════════════════════════════════════════════
// TABLE 8 — EmailTemplate
// Canned responses for the Messages module
// ═══════════════════════════════════════════════════════════════
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: EmailCategory;
  isActive: boolean;
  createdBy: string | null;
  admin?: AdminUser | null;
  createdAt: Date;
  updatedAt: Date;
}

// ═══════════════════════════════════════════════════════════════
// TABLE 9 — PaymentTransaction
// Detailed payment history — separate from Booking
// Tracks both ADVANCE (30%) and BALANCE (70%) payments
// ═══════════════════════════════════════════════════════════════
export interface PaymentTransaction {
  id: string;
  bookingId: string;
  booking?: Booking;
  stripePaymentId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  type: PaymentType;
  processedAt: Date | null;
  createdAt: Date;
}

// ═══════════════════════════════════════════════════════════════
// TABLE 10 — AuditLog
// Tracks all admin actions for security and compliance
// ═══════════════════════════════════════════════════════════════
export interface AuditLog {
  id: string;
  adminUserId: string;
  admin?: AdminUser;
  action: string;
  entityType: string;
  entityId: string;
  changes: string | null; // JSON string
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}

// ═══════════════════════════════════════════════════════════════
// API TYPES
// ═══════════════════════════════════════════════════════════════
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── Booking Request (public form → ContactMessage) ───────────
export interface BookingRequestPayload {
  name: string;
  email: string;
  phone?: string;
  checkIn: string;
  checkOut: string;
  guestCount: number;
  specialRequests?: string;
  totalPrice: number;
}

// ─── Pricing ──────────────────────────────────────────────────
export interface NightlyRateResult {
  date: Date;
  rate: number;
  seasonName: string | null;
  seasonId: string | null;
}

export interface BookingPriceBreakdown {
  nights: number;
  totalPrice: number;
  advanceAmount: number;
  balanceAmount: number;
  breakdown: NightlyRateResult[];
  minStayRequired: number | null;
  minStayValid: boolean;
}

// ─── Admin Dashboard KPIs ─────────────────────────────────────
export interface DashboardStats {
  pendingRequests: number;
  confirmedBookings: number;
  advancesPaid: number;
  upcomingCheckIns: number;
  monthlyRevenue: number;
  occupancyRate: number;
}

// ─── Availability ─────────────────────────────────────────────
export interface AvailabilityDay {
  date: Date;
  available: boolean;
  booked: boolean;
  unavailable: boolean;
  pending: boolean;
  nightlyRate: number | null;
  seasonName: string | null;
  minStay: number | null;
}

// ═══════════════════════════════════════════════════════════════
// EMAIL TYPES
// ═══════════════════════════════════════════════════════════════

/** Result of sending an email via Resend */
export type EmailResult =
  | { success: true; data: { id: string } }
  | { success: false; error: string };

/** Parameters for sendEmail() */
export interface SendEmailParams {
  to: string | string[];
  subject: string;
  react: React.ReactElement;
  replyTo?: string;
}

// ─── Email Template Props ─────────────────────────────────────

export interface BookingConfirmationEmailProps {
  guestName: string;
  checkIn: string;
  checkOut: string;
  numberOfNights: number;
  totalPaid: number;
  balanceRemaining: number;
  villaAddress: string;
  appUrl: string;
  bookingId: string;
}

export interface AdvancePaymentLinkEmailProps {
  guestName: string;
  checkIn: string;
  checkOut: string;
  numberOfNights: number;
  totalPrice: number;
  advanceAmount: number;
  checkoutUrl: string;
}

export interface BalanceReminderEmailProps {
  guestName: string;
  checkIn: string;
  checkOut: string;
  balanceAmount: number;
  checkoutUrl: string;
  daysUntilCheckIn: number;
}

export interface AdminNewBookingEmailProps {
  guestName: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
  guestCount: number;
  totalPrice: number;
  specialRequests: string | null;
  dashboardUrl: string;
  messageId: string;
}

export interface ContactReplyEmailProps {
  guestName: string;
  replyText: string;
  originalSubject: string;
}

export interface BaseLayoutProps {
  preview: string;
  children: React.ReactNode;
}

// ─── Notification Dispatcher Params ───────────────────────────

export interface BookingConfirmationParams {
  guestEmail: string;
  guestName: string;
  bookingId: string;
  checkIn: string;
  checkOut: string;
  numberOfNights: number;
  totalPaid: number;
  balanceRemaining: number;
}

export interface AdvancePaymentLinkParams {
  guestEmail: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  numberOfNights: number;
  totalPrice: number;
  advanceAmount: number;
  checkoutUrl: string;
}

export interface BalanceReminderParams {
  guestEmail: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  balanceAmount: number;
  checkoutUrl: string;
  daysUntilCheckIn: number;
}

export interface AdminNewBookingParams {
  guestName: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
  guestCount: number;
  totalPrice: number;
  specialRequests: string | null;
  messageId: string;
}

export interface AdminNewContactParams {
  guestName: string;
  guestEmail: string;
  subject: string;
  message: string;
  messageId: string;
}
