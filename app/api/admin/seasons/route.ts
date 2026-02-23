import { requireAuth, requireWrite } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { OverrideType } from "@/lib/constants";
import { createSeasonSchema, validationError } from "@/lib/validations/admin";

// ─── GET /api/admin/seasons ────────────────────────────────────
export async function GET() {
  const { denied } = await requireAuth();
  if (denied) return denied;

  try {
    const seasons = await prisma.season.findMany({
      include: { dowOverrides: true },
      orderBy: [{ priority: "desc" }, { startDate: "asc" }],
    });

    const data = seasons.map((s) => ({
      ...s,
      baseRate: Number(s.baseRate),
      dowOverrides: s.dowOverrides.map((d) => ({
        ...d,
        amount: Number(d.amount),
      })),
    }));

    return Response.json({ success: true, data });
  } catch (error) {
    console.error("[API] GET /api/admin/seasons:", error);
    return Response.json(
      { success: false, error: "Failed to fetch seasons" },
      { status: 500 }
    );
  }
}

// ─── POST /api/admin/seasons ───────────────────────────────────
export async function POST(request: Request) {
  const { denied } = await requireWrite();
  if (denied) return denied;

  try {
    const raw = await request.json();
    const parsed = createSeasonSchema.safeParse(raw);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const body = parsed.data;

    const season = await prisma.season.create({
      data: {
        name: body.name,
        colorTag: body.colorTag,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        baseRate: body.baseRate,
        minStay: body.minStay,
        priority: body.priority,
        notes: body.notes,
        dowOverrides: body.dowOverrides?.length
          ? {
              create: body.dowOverrides.map((d) => ({
                dayOfWeek: d.dayOfWeek,
                type: d.type as OverrideType,
                amount: d.amount,
              })),
            }
          : undefined,
      },
      include: { dowOverrides: true },
    });

    return Response.json({
      success: true,
      data: {
        ...season,
        baseRate: Number(season.baseRate),
        dowOverrides: season.dowOverrides.map((d) => ({
          ...d,
          amount: Number(d.amount),
        })),
      },
    });
  } catch (error) {
    console.error("[API] POST /api/admin/seasons:", error);
    return Response.json(
      { success: false, error: "Failed to create season" },
      { status: 500 }
    );
  }
}
