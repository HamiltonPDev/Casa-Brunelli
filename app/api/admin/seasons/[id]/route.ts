import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { OverrideType } from "@prisma/client";
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

    // Build update data — separated to preserve Prisma type inference
    const updateData: Parameters<typeof prisma.season.update>[0]["data"] = {
      ...(body.name && { name: body.name }),
      ...(body.colorTag && { colorTag: body.colorTag }),
      ...(body.startDate && { startDate: new Date(body.startDate) }),
      ...(body.endDate && { endDate: new Date(body.endDate) }),
      ...(body.baseRate !== undefined && { baseRate: body.baseRate }),
      ...(body.minStay !== undefined && { minStay: body.minStay }),
      ...(body.priority !== undefined && { priority: body.priority }),
      ...(body.notes !== undefined && { notes: body.notes }),
      ...(body.status && { status: body.status as SeasonStatus }),
    };

    if (body.dowOverrides) {
      updateData.dowOverrides = {
        deleteMany: {},
        create: body.dowOverrides.map((o) => ({
          dayOfWeek: o.dayOfWeek,
          type: o.type as OverrideType,
          amount: o.amount,
        })),
      };
    }

    const updated = await prisma.season.update({
      where: { id },
      data: updateData,
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
    return Response.json({ success: true, data: { id } });
  } catch (error) {
    console.error("[API] DELETE /api/admin/seasons/[id]:", error);
    return Response.json(
      { success: false, error: "Failed to delete season" },
      { status: 500 },
    );
  }
}
