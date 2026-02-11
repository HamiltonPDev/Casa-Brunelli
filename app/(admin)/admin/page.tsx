import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Booking } from "@/types";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminBadge } from "@/components/admin/AdminBadge";
import { formatCurrency, formatDateRange } from "@/lib/utils";
import { BOOKING_STATUS } from "@/lib/constants";
import {
  AlertCircle,
  Euro,
  CalendarCheck,
  TrendingUp,
} from "lucide-react";

// ─── Admin Dashboard Page ──────────────────────────────────────
// Server Component — fetches KPIs and recent bookings server-side.
// All data is fresh on every request (no caching for admin).

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await auth();

  // ── Fetch KPI data in parallel ────────────────────────────
  const [
    pendingMessages,
    confirmedBookings,
    recentBookings,
    monthlyRevenue,
  ] = await Promise.all([
    // Pending booking requests (Messages-First workflow)
    prisma.contactMessage.count({
      where: { status: "UNREAD" },
    }),

    // Active confirmed bookings
    prisma.booking.count({
      where: { status: BOOKING_STATUS.CONFIRMED },
    }),

    // Last 5 bookings
    prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),

    // Revenue this month
    prisma.booking.aggregate({
      where: {
        status: { in: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.COMPLETED] },
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
      _sum: { totalPrice: true },
    }),
  ]);

  const revenue = Number(monthlyRevenue._sum.totalPrice ?? 0);

  const kpis = [
    {
      label: "Pending Requests",
      value: pendingMessages,
      icon: AlertCircle,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      label: "Confirmed Bookings",
      value: confirmedBookings,
      icon: CalendarCheck,
      color: "text-green-700",
      bg: "bg-green-50",
    },
    {
      label: "Monthly Revenue",
      value: formatCurrency(revenue),
      icon: Euro,
      color: "text-[#1a4a3a]",
      bg: "bg-[#1a4a3a]/5",
    },
    {
      label: "Occupancy Rate",
      value: "—",
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Welcome back, {session?.user?.name}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <AdminCard key={kpi.label}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">{kpi.label}</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">
                    {kpi.value}
                  </p>
                </div>
                <div className={`p-2.5 rounded-lg ${kpi.bg}`}>
                  <Icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
              </div>
            </AdminCard>
          );
        })}
      </div>

      {/* Recent Bookings */}
      <AdminCard
        title="Recent Bookings"
        subtitle="Last 5 bookings across all statuses"
      >
        {recentBookings.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            No bookings yet. They will appear here once guests submit requests.
          </p>
        ) : (
          <div className="overflow-x-auto -mx-6 -mb-6">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Guest
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Nights
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {(recentBookings as Booking[]).map((booking) => (
                  <tr
                    key={booking.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">
                        {booking.guestName}
                      </p>
                      <p className="text-xs text-gray-500">{booking.guestEmail}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDateRange(booking.checkIn, booking.checkOut)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {booking.numberOfNights}
                    </td>
                    <td className="px-6 py-4">
                      <AdminBadge variant="status" status={booking.status} size="sm" />
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                      {formatCurrency(Number(booking.totalPrice))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
    </div>
  );
}
