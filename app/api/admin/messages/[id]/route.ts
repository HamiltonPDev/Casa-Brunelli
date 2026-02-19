import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MESSAGE_STATUS } from "@/lib/constants";
import { updateMessageSchema, validationError } from "@/lib/validations/admin";

// ─── PATCH /api/admin/messages/[id] ────────────────────────────
// Updates the status of a ContactMessage (READ | REPLIED).
// Protected: admin session required. Validated with Zod.

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = updateMessageSchema.safeParse(body);

  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const { status } = parsed.data;

  try {
    const updated = await prisma.contactMessage.update({
      where: { id },
      data: {
        status: status as (typeof MESSAGE_STATUS)[keyof typeof MESSAGE_STATUS],
        ...(status === MESSAGE_STATUS.REPLIED && {
          repliedBy: session.user.id,
          repliedAt: new Date(),
        }),
      },
    });

    return Response.json({ success: true, data: updated });
  } catch (error) {
    console.error(`[API] PATCH /admin/messages/${id} failed:`, error);
    return Response.json(
      { success: false, error: "Failed to update message" },
      { status: 500 }
    );
  }
}
