import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { SeasonStatus } from "@/lib/constants";
import { updateSeasonSchema, validationError } from "@/lib/validations/admin";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// ─── PATCH /api/admin/seasons/[id] ────────────────────────────
export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session) {
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const { id } = await params;

  try {
    const raw = await request.json();
    const parsed = updateSeasonSchema.safeParse(raw);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const body = parsed.data;

    const updated = await prisma.season.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.colorTag && { colorTag: body.colorTag }),
        ...(body.startDate && { startDate: new Date(body.startDate) }),
        ...(body.endDate && { endDate: new Date(body.endDate) }),
        ...(body.baseRate !== undefined && { baseRate: body.baseRate }),
        ...(body.minStay !== undefined && { minStay: body.minStay }),
        ...(body.priority !== undefined && { priority: body.priority }),
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.status && { status: body.status as SeasonStatus }),
      },
      include: { dowOverrides: true },
    });

    return Response.json({
      success: true,
      data: {
        ...updated,
        baseRate: Number(updated.baseRate),
        dowOverrides: updated.dowOverrides.map((d) => ({
          ...d,
          amount: Number(d.amount),
        })),
      },
    });
  } catch (error) {
    console.error("[API] PATCH /api/admin/seasons/[id]:", error);
    return Response.json(
      { success: false, error: "Failed to update season" },
      { status: 500 },
    );
  }
}

// ─── DELETE /api/admin/seasons/[id] ───────────────────────────
export async function DELETE(_request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session) {
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const { id } = await params;

  try {
    await prisma.season.delete({ where: { id } });
    return Response.json({ success: true });
  } catch (error) {
    console.error("[API] DELETE /api/admin/seasons/[id]:", error);
    return Response.json(
      { success: false, error: "Failed to delete season" },
      { status: 500 },
    );
  }
}
