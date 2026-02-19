import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BOOKING_STATUS } from "@/lib/constants";
import type { BookingStatus } from "@/lib/constants";
import { bulkUpdateBookingsSchema, validationError } from "@/lib/validations/admin";

// ─── GET /api/admin/bookings ───────────────────────────────────
// Supports query params: search, status, dateFrom, dateTo, guests, page
export async function GET(request: Request) {
  const session = await auth();
  if (!session) {
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status"); // comma-separated or single
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  const guests = searchParams.get("guests");
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const perPage = 10;

  const statusList = status
    ? status
        .split(",")
        .filter((s) =>
          Object.values(BOOKING_STATUS).includes(s as BookingStatus)
        )
    : [];

  try {
    const where = {
      ...(search && {
        OR: [
          { guestName: { contains: search, mode: "insensitive" as const } },
          { guestEmail: { contains: search, mode: "insensitive" as const } },
        ],
      }),
      ...(statusList.length > 0 && {
        status: { in: statusList as BookingStatus[] },
      }),
      ...(dateFrom && { checkIn: { gte: new Date(dateFrom) } }),
      ...(dateTo && { checkIn: { lte: new Date(dateTo) } }),
      ...(guests && { guestCount: Number(guests) }),
    };

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.booking.count({ where }),
    ]);

    // Serialize Decimal fields
    const data = bookings.map((b) => ({
      ...b,
      totalPrice: Number(b.totalPrice),
      depositAmount: Number(b.depositAmount),
    }));

    return Response.json({
      success: true,
      data,
      pagination: {
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
      },
    });
  } catch (error) {
    console.error("[API] GET /api/admin/bookings:", error);
    return Response.json(
      { success: false, error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

// ─── PATCH /api/admin/bookings ─────────────────────────────────
// Bulk status update: { ids: string[], status: BookingStatus }
export async function PATCH(request: Request) {
  const session = await auth();
  if (!session) {
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const parsed = bulkUpdateBookingsSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const { ids, status } = parsed.data;

    const { count } = await prisma.booking.updateMany({
      where: { id: { in: ids } },
      data: { status: status as BookingStatus },
    });

    return Response.json({ success: true, updated: count });
  } catch (error) {
    console.error("[API] PATCH /api/admin/bookings:", error);
    return Response.json(
      { success: false, error: "Failed to update bookings" },
      { status: 500 }
    );
  }
}
