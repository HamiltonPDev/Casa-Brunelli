import { requireWrite } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MESSAGE_STATUS } from "@/lib/constants";
import { updateMessageSchema, validationError } from "@/lib/validations/admin";
import { sendContactReply } from "@/lib/notifications";

// ─── PATCH /api/admin/messages/[id] ────────────────────────────
// Updates the status of a ContactMessage (READ | REPLIED).
// When status is REPLIED and replyText is provided, sends the reply via email.
// Protected: admin write access required. Validated with Zod.

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { session, denied } = await requireWrite();
  if (denied) return denied;

  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = updateMessageSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const { status, replyText } = parsed.data;

    // Require replyText when marking as REPLIED
    if (status === MESSAGE_STATUS.REPLIED && !replyText) {
      return Response.json(
        { success: false, error: "replyText is required when status is REPLIED" },
        { status: 400 },
      );
    }

    const updated = await prisma.contactMessage.update({
      where: { id },
      data: {
        status: status as (typeof MESSAGE_STATUS)[keyof typeof MESSAGE_STATUS],
        ...(status === MESSAGE_STATUS.REPLIED && {
          repliedBy: session.user.id,
          repliedAt: new Date(),
        }),
      },
      select: {
        id: true,
        type: true,
        name: true,
        email: true,
        phone: true,
        subject: true,
        message: true,
        status: true,
        checkIn: true,
        checkOut: true,
        guestCount: true,
        totalPrice: true,
        repliedBy: true,
        repliedAt: true,
        createdAt: true,
      },
    });

    // Send reply email to guest (non-blocking)
    if (status === MESSAGE_STATUS.REPLIED && replyText) {
      sendContactReply(
        updated.email,
        updated.name,
        replyText,
        updated.subject,
      ).catch((err) =>
        console.error("[Messages] Failed to send reply email:", err),
      );
    }

    return Response.json({ success: true, data: updated });
  } catch (error) {
    console.error(`[API] PATCH /admin/messages/${id} failed:`, error);
    return Response.json(
      { success: false, error: "Failed to update message" },
      { status: 500 },
    );
  }
}
