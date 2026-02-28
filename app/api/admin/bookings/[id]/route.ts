import { requireAuth, requireWrite } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { BookingStatus } from "@/lib/constants";
import { updateBookingSchema, validationError } from "@/lib/validations/admin";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// ─── GET /api/admin/bookings/[id] ─────────────────────────────
export async function GET(_request: Request, { params }: RouteParams) {
  const { denied } = await requireAuth();
  if (denied) return denied;

  const { id } = await params;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        payments: {
          orderBy: { createdAt: "desc" },
        },
        guestUser: true,
      },
    });

    if (!booking) {
      return Response.json(
        { success: false, error: "Booking not found" },
        { status: 404 },
      );
    }

    // Serialize Decimal fields
    const data = {
      ...booking,
      totalPrice: Number(booking.totalPrice),
      depositAmount: Number(booking.depositAmount),
      payments: booking.payments.map((p) => ({
        ...p,
        amount: Number(p.amount),
      })),
    };

    return Response.json({ success: true, data });
  } catch (error) {
    console.error("[API] GET /api/admin/bookings/[id]:", error);
    return Response.json(
      { success: false, error: "Failed to fetch booking" },
      { status: 500 },
    );
  }
}

// ─── PATCH /api/admin/bookings/[id] ───────────────────────────
// Update booking status: { status: BookingStatus }
// Or toggle payment flags: { depositPaid?: boolean, balancePaid?: boolean }
export async function PATCH(request: Request, { params }: RouteParams) {
  const { denied } = await requireWrite();
  if (denied) return denied;

  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = updateBookingSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const { status, depositPaid, balancePaid } = parsed.data;

    // Check existence first — Prisma P2025 on update gives a generic 500
    const existing = await prisma.booking.findUnique({ where: { id } });
    if (!existing) {
      return Response.json(
        { success: false, error: "Booking not found" },
        { status: 404 },
      );
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        ...(status && { status: status as BookingStatus }),
        ...(depositPaid !== undefined && { depositPaid }),
        ...(balancePaid !== undefined && { balancePaid }),
      },
    });

    return Response.json({
      success: true,
      data: {
        ...updated,
        totalPrice: Number(updated.totalPrice),
        depositAmount: Number(updated.depositAmount),
      },
    });
  } catch (error) {
    console.error("[API] PATCH /api/admin/bookings/[id]:", error);
    return Response.json(
      { success: false, error: "Failed to update booking" },
      { status: 500 },
    );
  }
}

// ─── DELETE /api/admin/bookings/[id] ──────────────────────────
// Hard delete a booking + cascade PaymentTransactions
export async function DELETE(_request: Request, { params }: RouteParams) {
  const { session, denied } = await requireWrite();
  if (denied) return denied;

  const { id } = await params;

  try {
    const existing = await prisma.booking.findUnique({ where: { id } });
    if (!existing) {
      return Response.json(
        { success: false, error: "Booking not found" },
        { status: 404 },
      );
    }

    // Cascade: delete payments first (FK constraint), then booking
    await prisma.$transaction(async (tx) => {
      await tx.paymentTransaction.deleteMany({ where: { bookingId: id } });
      await tx.booking.delete({ where: { id } });

      // Audit log
      await tx.auditLog.create({
        data: {
          adminUserId: session.user.id,
          action: "BOOKING_DELETED",
          entityType: "Booking",
          entityId: id,
          changes: JSON.stringify({
            guestName: existing.guestName,
            guestEmail: existing.guestEmail,
            status: existing.status,
            totalPrice: Number(existing.totalPrice),
          }),
        },
      });
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("[API] DELETE /api/admin/bookings/[id]:", error);
    return Response.json(
      { success: false, error: "Failed to delete booking" },
      { status: 500 },
    );
  }
}
