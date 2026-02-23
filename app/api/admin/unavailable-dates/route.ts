// app/api/admin/unavailable-dates/route.ts
// ═══ UnavailableDate CRUD — block/unblock calendar dates ═══
//
// GET    → list all blocked dates (with optional date range filter)
// POST   → block one or more dates (with optional reason)
// DELETE → unblock one or more dates
//
// Protected: admin session required. Validated with Zod.

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createUnavailableDatesSchema,
  deleteUnavailableDatesSchema,
  validationError,
} from "@/lib/validations/admin";

// ─── GET /api/admin/unavailable-dates ──────────────────────────
// Optional query params: ?from=2025-06-01&to=2025-12-31
export async function GET(request: Request) {
  const session = await auth();
  if (!session) {
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  try {
    const dates = await prisma.unavailableDate.findMany({
      where: {
        ...(from && { date: { gte: new Date(from + "T00:00:00Z") } }),
        ...(to && { date: { lte: new Date(to + "T00:00:00Z") } }),
      },
      orderBy: { date: "asc" },
      include: {
        admin: { select: { name: true } },
      },
    });

    return Response.json({ success: true, data: dates });
  } catch (error) {
    console.error("[API] GET /api/admin/unavailable-dates:", error);
    return Response.json(
      { success: false, error: "Failed to fetch unavailable dates" },
      { status: 500 }
    );
  }
}

// ─── POST /api/admin/unavailable-dates ─────────────────────────
// Body: { dates: ["2025-07-04", "2025-07-05"], reason?: "Owner vacation" }
export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await request.json();
  const parsed = createUnavailableDatesSchema.safeParse(body);

  // I
  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const { dates, reason } = parsed.data;

  try {
    // Use createMany with skipDuplicates — if a date is already blocked, just skip it
    const result = await prisma.unavailableDate.createMany({
      data: dates.map((d) => ({
        date: new Date(d + "T00:00:00Z"),
        reason: reason ?? null,
        createdBy: session.user.id,
      })),
      skipDuplicates: true,
    });

    return Response.json(
      { success: true, data: { created: result.count } },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API] POST /api/admin/unavailable-dates:", error);
    return Response.json(
      { success: false, error: "Failed to block dates" },
      { status: 500 }
    );
  }
}

// ─── DELETE /api/admin/unavailable-dates ───────────────────────
// Body: { dates: ["2025-07-04", "2025-07-05"] }
export async function DELETE(request: Request) {
  const session = await auth();
  if (!session) {
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await request.json();
  const parsed = deleteUnavailableDatesSchema.safeParse(body);

  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const { dates } = parsed.data;

  try {
    const result = await prisma.unavailableDate.deleteMany({
      where: {
        date: {
          in: dates.map((d) => new Date(d + "T00:00:00Z")),
        },
      },
    });

    return Response.json({ success: true, data: { deleted: result.count } });
  } catch (error) {
    console.error("[API] DELETE /api/admin/unavailable-dates:", error);
    return Response.json(
      { success: false, error: "Failed to unblock dates" },
      { status: 500 }
    );
  }
}
