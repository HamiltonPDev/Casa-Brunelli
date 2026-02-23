import { requireWrite } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MESSAGE_STATUS } from "@/lib/constants";
import { updateMessageSchema, validationError } from "@/lib/validations/admin";

// ─── PATCH /api/admin/messages/[id] ────────────────────────────
// Updates the status of a ContactMessage (READ | REPLIED).
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

    const { status } = parsed.data;
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
