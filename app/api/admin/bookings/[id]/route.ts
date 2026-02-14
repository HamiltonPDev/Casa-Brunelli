import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BOOKING_STATUS } from "@/lib/constants";
import type { BookingStatus } from "@/lib/constants";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// ─── GET /api/admin/bookings/[id] ─────────────────────────────
export async function GET(_request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session) {
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

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
        { status: 404 }
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
      { status: 500 }
    );
  }
}

// ─── PATCH /api/admin/bookings/[id] ───────────────────────────
// Update booking status: { status: BookingStatus }
// Or toggle payment flags: { depositPaid?: boolean, balancePaid?: boolean }
export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session) {
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id } = await params;

  try {
    const body = (await request.json()) as {
      status?: string;
      depositPaid?: boolean;
      balancePaid?: boolean;
    };

    // Validate status if provided
    if (
      body.status &&
      !Object.values(BOOKING_STATUS).includes(body.status as BookingStatus)
    ) {
      return Response.json(
        { success: false, error: "Invalid status value" },
        { status: 400 }
      );
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        ...(body.status && { status: body.status as BookingStatus }),
        ...(body.depositPaid !== undefined && {
          depositPaid: body.depositPaid,
        }),
        ...(body.balancePaid !== undefined && {
          balancePaid: body.balancePaid,
        }),
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
      { status: 500 }
    );
  }
}
