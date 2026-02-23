// lib/services/messages.ts
// ═══ Messages Service — Status Updates, Replies & Promotions ═══

import type { ApiResult } from "./client";
import { apiPatch, apiPost } from "./client";
import type { MessageStatus } from "@/lib/constants";

// ─── Types ─────────────────────────────────────────────────────

interface UpdateMessageResult {
  id: string;
  status: MessageStatus;
}

interface PromoteMessageResult {
  bookingId: string;
  totalPrice: number;
  nights: number;
}

// ─── Service Functions ─────────────────────────────────────────

/** Update a message's status (e.g. UNREAD → READ → REPLIED). */
export function updateMessageStatus(
  id: string,
  status: MessageStatus,
): Promise<ApiResult<UpdateMessageResult>> {
  return apiPatch(`/api/admin/messages/${id}`, { status });
}

/** Promote a BOOKING_REQUEST message into a real Booking. */
export function promoteMessage(
  id: string,
): Promise<ApiResult<PromoteMessageResult>> {
  return apiPost(`/api/admin/messages/${id}/promote`, {});
}
