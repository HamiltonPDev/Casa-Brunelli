/**
 * Casa Brunelli — Resend Email Client Singleton + sendEmail Helper
 *
 * Centralizes all email sending. Every module that needs to send
 * emails imports from here — never instantiate Resend directly.
 *
 * Environment variables:
 * - RESEND_API_KEY        — Resend API key (required)
 * - RESEND_FROM_EMAIL     — defaults to RESEND_FROM_DEFAULT
 * - RESEND_REPLY_TO       — defaults to RESEND_REPLY_TO_DEFAULT
 */

import { Resend } from "resend";
import { RESEND_FROM_DEFAULT, RESEND_REPLY_TO_DEFAULT } from "@/lib/constants";
import type { EmailResult, SendEmailParams } from "@/types";

// ─── Singleton ─────────────────────────────────────────────────

const globalForResend = globalThis as unknown as { resend?: Resend };

function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error(
      "RESEND_API_KEY is not set. Add it to your environment variables.",
    );
  }
  return new Resend(key);
}

/** Resend client — lazily initialized, reused across requests */
const resend = globalForResend.resend ?? getResend();
if (process.env.NODE_ENV !== "production") globalForResend.resend = resend;

// ─── Send Email ────────────────────────────────────────────────

/**
 * Sends a transactional email via Resend.
 *
 * @param params.to      - Recipient email(s)
 * @param params.subject - Email subject line
 * @param params.react   - React Email component (JSX element)
 * @param params.replyTo - Optional reply-to override
 * @returns EmailResult — `{ success: true, data: { id } }` or `{ success: false, error }`
 */
export async function sendEmail(params: SendEmailParams): Promise<EmailResult> {
  const { to, subject, react, replyTo } = params;

  const from = process.env.RESEND_FROM_EMAIL ?? RESEND_FROM_DEFAULT;
  const defaultReplyTo = process.env.RESEND_REPLY_TO ?? RESEND_REPLY_TO_DEFAULT;

  try {
    const { data, error } = await resend.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      react,
      replyTo: replyTo ?? defaultReplyTo,
    });

    if (error) {
      console.error("[Email] Resend error:", error);
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: "Resend returned no data" };
    }

    return { success: true, data: { id: data.id } };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown email error";
    console.error("[Email] Unexpected error:", message);
    return { success: false, error: message };
  }
}

/**
 * Check if Resend is properly configured (API key is set).
 * Used by SettingsClient to show connection status.
 */
export function isResendConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}
