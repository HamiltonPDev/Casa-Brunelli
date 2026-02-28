import { requireAuth, requireWrite } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BOOKING_STATUS } from "@/lib/constants";
import type { BookingStatus } from "@/lib/constants";
import {
  bulkUpdateBookingsSchema,
  bulkDeleteBookingsSchema,
  validationError,
} from "@/lib/validations/admin";

// ─── GET /api/admin/bookings ───────────────────────────────────
// Supports query params: search, status, dateFrom, dateTo, guests, page
export async function GET(request: Request) {
  const { denied } = await requireAuth();
  if (denied) return denied;

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
          Object.values(BOOKING_STATUS).includes(s as BookingStatus),
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
      { status: 500 },
    );
  }
}

// ─── PATCH /api/admin/bookings ─────────────────────────────────
// Bulk status update: { ids: string[], status: BookingStatus }
export async function PATCH(request: Request) {
  const { denied } = await requireWrite();
  if (denied) return denied;

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

    return Response.json({ success: true, data: { updated: count } });
  } catch (error) {
    console.error("[API] PATCH /api/admin/bookings:", error);
    return Response.json(
      { success: false, error: "Failed to update bookings" },
      { status: 500 },
    );
  }
}

// ─── DELETE /api/admin/bookings ────────────────────────────────
// Bulk delete: { ids: string[] }
export async function DELETE(request: Request) {
  const { session, denied } = await requireWrite();
  if (denied) return denied;

  try {
    const body = await request.json();
    const parsed = bulkDeleteBookingsSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const { ids } = parsed.data;

    // Fetch bookings for audit log before deleting
    const bookings = await prisma.booking.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        guestName: true,
        guestEmail: true,
        status: true,
        totalPrice: true,
      },
    });

    if (bookings.length === 0) {
      return Response.json(
        { success: false, error: "No bookings found" },
        { status: 404 },
      );
    }

    await prisma.$transaction(async (tx) => {
      // Cascade: delete payments first, then bookings
      await tx.paymentTransaction.deleteMany({
        where: { bookingId: { in: ids } },
      });
      await tx.booking.deleteMany({
        where: { id: { in: ids } },
      });

      // Audit log per booking
      await tx.auditLog.createMany({
        data: bookings.map((b) => ({
          adminUserId: session.user.id,
          action: "BOOKING_DELETED",
          entityType: "Booking",
          entityId: b.id,
          changes: JSON.stringify({
            guestName: b.guestName,
            guestEmail: b.guestEmail,
            status: b.status,
            totalPrice: Number(b.totalPrice),
            bulkDelete: true,
          }),
        })),
      });
    });

    return Response.json({
      success: true,
      data: { deleted: bookings.length },
    });
  } catch (error) {
    console.error("[API] DELETE /api/admin/bookings:", error);
    return Response.json(
      { success: false, error: "Failed to delete bookings" },
      { status: 500 },
    );
  }
}
