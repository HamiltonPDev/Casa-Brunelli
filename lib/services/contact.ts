// lib/services/contact.ts
// ─── Public Contact Service ────────────────────────────────────
// Client-side typed wrapper for POST /api/contact
// Used by ContactForm — this is a PUBLIC endpoint (no auth).

import { apiPost, type ApiResult } from "./client";

// ─── Types ─────────────────────────────────────────────────────

interface ContactPayload {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

interface ContactResult {
  id: string;
}

// ─── Service ───────────────────────────────────────────────────

/**
 * Submits a contact message to the public API.
 * Creates a ContactMessage of type GENERAL (Messages-First flow).
 */
export function sendContactMessage(
  payload: ContactPayload,
): Promise<ApiResult<ContactResult>> {
  return apiPost<ContactResult>("/api/contact", payload);
}
