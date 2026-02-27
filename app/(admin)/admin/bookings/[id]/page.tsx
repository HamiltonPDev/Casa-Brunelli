import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BookingDetailClient } from "@/components/features/admin/BookingDetailClient";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const booking = await prisma.booking.findUnique({
    where: { id },
    select: { guestName: true },
  });
  return {
    title: booking ? `Booking — ${booking.guestName}` : "Booking Detail",
  };
}

export const dynamic = "force-dynamic";

export default async function BookingDetailPage({ params }: PageProps) {
  const { id } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      payments: { orderBy: { createdAt: "desc" } },
      guestUser: true,
    },
  });

  if (!booking) notFound();

  const totalPrice = Number(booking.totalPrice);
  const depositAmount = Number(booking.depositAmount);
  const balanceAmount = totalPrice - depositAmount;

  return (
    <BookingDetailClient
      booking={{
        id: booking.id,
        guestName: booking.guestName,
        guestEmail: booking.guestEmail,
        guestPhone: booking.guestPhone ?? undefined,
        checkIn: booking.checkIn.toISOString(),
        checkOut: booking.checkOut.toISOString(),
        numberOfNights: booking.numberOfNights,
        guestCount: booking.guestCount,
        status: booking.status,
        totalPrice,
        depositAmount,
        balanceAmount,
        depositPaid: booking.depositPaid,
        balancePaid: booking.balancePaid,
        depositSessionId: booking.depositSessionId ?? undefined,
        balanceSessionId: booking.balanceSessionId ?? undefined,
        specialRequests: booking.specialRequests ?? undefined,
        approvedBy: booking.approvedBy ?? undefined,
        approvedAt: booking.approvedAt?.toISOString() ?? undefined,
        createdAt: booking.createdAt.toISOString(),
        updatedAt: booking.updatedAt.toISOString(),
        payments: booking.payments.map((p) => ({
          id: p.id,
          stripePaymentId: p.stripePaymentId,
          amount: Number(p.amount),
          currency: p.currency,
          status: p.status,
          type: p.type,
          processedAt: p.processedAt?.toISOString() ?? undefined,
          createdAt: p.createdAt.toISOString(),
        })),
        guestUser: booking.guestUser
          ? {
              id: booking.guestUser.id,
              name: booking.guestUser.name,
              totalBookings: booking.guestUser.totalBookings,
            }
          : undefined,
      }}
    />
  );
}
