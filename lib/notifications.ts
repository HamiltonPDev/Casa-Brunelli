/**
 * Casa Brunelli — Notification Dispatcher
 *
 * Typed functions that map notification types to React Email
 * templates and send them via the Resend singleton.
 *
 * Each function:
 * 1. Renders the appropriate React Email template as JSX
 * 2. Calls sendEmail() from lib/email.ts
 * 3. Returns typed EmailResult
 *
 * Usage:
 *   import { sendBookingConfirmation } from "@/lib/notifications";
 *   const result = await sendBookingConfirmation({ ...booking });
 */

import { sendEmail } from "@/lib/email";
import { APP_CONFIG } from "@/lib/constants";
import { BookingConfirmationEmail } from "@/lib/email-templates/BookingConfirmationEmail";
import { AdvancePaymentLinkEmail } from "@/lib/email-templates/AdvancePaymentLinkEmail";
import { BalanceReminderEmail } from "@/lib/email-templates/BalanceReminderEmail";
import { AdminNewBookingEmail } from "@/lib/email-templates/AdminNewBookingEmail";
import { AdminNewContactEmail } from "@/lib/email-templates/AdminNewContactEmail";
import { ContactReplyEmail } from "@/lib/email-templates/ContactReplyEmail";
import { VILLA_ADDRESS } from "@/lib/constants";
import type {
  EmailResult,
  BookingConfirmationParams,
  AdvancePaymentLinkParams,
  BalanceReminderParams,
  AdminNewBookingParams,
  AdminNewContactParams,
} from "@/types";

// ─── Dispatchers ─────────────────────────────────────────────

/**
 * Sends a booking confirmation email to the guest after
 * their advance payment has been processed.
 */
export async function sendBookingConfirmation(
  params: BookingConfirmationParams,
): Promise<EmailResult> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return sendEmail({
    to: params.guestEmail,
    subject: `Booking Confirmed — ${APP_CONFIG.name}`,
    react: BookingConfirmationEmail({
      guestName: params.guestName,
      checkIn: params.checkIn,
      checkOut: params.checkOut,
      numberOfNights: params.numberOfNights,
      totalPaid: params.totalPaid,
      balanceRemaining: params.balanceRemaining,
      villaAddress: VILLA_ADDRESS,
      appUrl,
      bookingId: params.bookingId,
    }),
  });
}

/**
 * Sends a payment link for the 30% advance after admin
 * approves a booking request. Link expires in 24h.
 */
export async function sendAdvancePaymentLink(
  params: AdvancePaymentLinkParams,
): Promise<EmailResult> {
  return sendEmail({
    to: params.guestEmail,
    subject: `Complete Your Booking — Pay Advance | ${APP_CONFIG.name}`,
    react: AdvancePaymentLinkEmail({
      guestName: params.guestName,
      checkIn: params.checkIn,
      checkOut: params.checkOut,
      numberOfNights: params.numberOfNights,
      totalPrice: params.totalPrice,
      advanceAmount: params.advanceAmount,
      checkoutUrl: params.checkoutUrl,
    }),
  });
}

/**
 * Sends a balance payment reminder (70%).
 * Called at 30 days and 7 days before check-in.
 */
export async function sendBalanceReminder(
  params: BalanceReminderParams,
): Promise<EmailResult> {
  const isUrgent = params.daysUntilCheckIn <= 7;

  return sendEmail({
    to: params.guestEmail,
    subject: isUrgent
      ? `Urgent: Balance Due — ${APP_CONFIG.name}`
      : `Balance Payment Reminder — ${APP_CONFIG.name}`,
    react: BalanceReminderEmail({
      guestName: params.guestName,
      checkIn: params.checkIn,
      checkOut: params.checkOut,
      balanceAmount: params.balanceAmount,
      checkoutUrl: params.checkoutUrl,
      daysUntilCheckIn: params.daysUntilCheckIn,
    }),
  });
}

/**
 * Sends a notification to the admin when a new booking
 * request arrives via the public contact form.
 */
export async function sendAdminNewBookingNotification(
  params: AdminNewBookingParams,
): Promise<EmailResult> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return sendEmail({
    to: APP_CONFIG.adminEmail,
    subject: `New Booking Request: ${params.guestName} — ${params.checkIn} to ${params.checkOut}`,
    react: AdminNewBookingEmail({
      guestName: params.guestName,
      guestEmail: params.guestEmail,
      checkIn: params.checkIn,
      checkOut: params.checkOut,
      guestCount: params.guestCount,
      totalPrice: params.totalPrice,
      specialRequests: params.specialRequests,
      dashboardUrl: appUrl,
      messageId: params.messageId,
    }),
  });
}

/**
 * Sends a generic reply from admin to a guest.
 * Used from the Messages module in the admin dashboard.
 */
export async function sendContactReply(
  guestEmail: string,
  guestName: string,
  replyText: string,
  originalSubject: string,
): Promise<EmailResult> {
  return sendEmail({
    to: guestEmail,
    subject: `Re: ${originalSubject} — ${APP_CONFIG.name}`,
    react: ContactReplyEmail({
      guestName,
      replyText,
      originalSubject,
    }),
  });
}

/**
 * Sends a notification to the admin when a general contact
 * form is submitted (not a booking request).
 */
export async function sendAdminNewContactNotification(
  params: AdminNewContactParams,
): Promise<EmailResult> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return sendEmail({
    to: APP_CONFIG.adminEmail,
    subject: `New Contact Message: ${params.subject} — ${params.guestName}`,
    react: AdminNewContactEmail({
      guestName: params.guestName,
      guestEmail: params.guestEmail,
      subject: params.subject,
      message: params.message,
      dashboardUrl: appUrl,
      messageId: params.messageId,
    }),
  });
}
