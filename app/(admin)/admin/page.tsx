import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminCard } from "@/components/ui/admin/AdminCard";
import { AdminBadge } from "@/components/ui/admin/AdminBadge";
import { CalendarWidget } from "@/components/features/admin/CalendarWidget";
import type { CalendarBooking } from "@/components/features/admin/CalendarWidget";
import { formatCurrency, formatDateRange } from "@/lib/utils";
import { BOOKING_STATUS } from "@/lib/constants";
import {
  AlertCircle,
  Euro,
  Calendar,
  RefreshCcw,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

// ─── Admin Dashboard Page ──────────────────────────────────────
/*
  Server Component — fetches KPIs, recent bookings, and upcoming
  heck-ins server-side. All data is fresh on every request. 
*/

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await auth();

  // ── Fetch all data in parallel ────────────────────────────
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOfLastMonth = new Date(
    today.getFullYear(),
    today.getMonth() - 1,
    1
  );
  const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

  const [
    pendingMessages,
    confirmedBookings,
    recentBookings,
    monthlyRevenue,
    lastMonthRevenue,
    calendarBookings,
    upcomingCheckIns,
    unavailableDates,
  ] = await Promise.all([
    // Pending unread messages
    prisma.contactMessage.count({
      where: { status: "UNREAD" },
    }),

    // Active confirmed bookings
    prisma.booking.count({
      where: { status: BOOKING_STATUS.CONFIRMED },
    }),

    // Last 5 bookings for table
    prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),

    // Revenue this month
    prisma.booking.aggregate({
      where: {
        status: { in: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.COMPLETED] },
        createdAt: { gte: startOfMonth },
      },
      _sum: { totalPrice: true },
    }),

    // Revenue last month (for trend)
    prisma.booking.aggregate({
      where: {
        status: { in: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.COMPLETED] },
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
      _sum: { totalPrice: true },
    }),

    // All bookings for calendar (next 12 months)
    prisma.booking.findMany({
      where: {
        checkOut: { gte: startOfMonth },
        status: { in: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.PENDING] },
      },
      select: {
        id: true,
        guestName: true,
        guestEmail: true,
        checkIn: true,
        checkOut: true,
        numberOfNights: true,
        guestCount: true,
        status: true,
        totalPrice: true,
      },
    }),

    // Upcoming check-ins (next 30 days)
    prisma.booking.findMany({
      where: {
        checkIn: {
          gte: today,
          lte: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000),
        },
        status: { in: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.PENDING] },
      },
      orderBy: { checkIn: "asc" },
      take: 5,
    }),

    // Unavailable dates for calendar widget
    prisma.unavailableDate.findMany({
      where: { date: { gte: startOfMonth } },
      orderBy: { date: "asc" },
    }),
  ]);

  // ── Derived values ────────────────────────────────────────
  const revenue = Number(monthlyRevenue._sum.totalPrice ?? 0);
  const lastRevenue = Number(lastMonthRevenue._sum.totalPrice ?? 0);
  const revenueTrend =
    lastRevenue > 0 ? ((revenue - lastRevenue) / lastRevenue) * 100 : null;

  // Serialize Decimal → number for CalendarWidget (Client Component)
  const calendarData: CalendarBooking[] = calendarBookings.map((b) => ({
    id: b.id,
    guestName: b.guestName,
    guestEmail: b.guestEmail,
    checkIn: b.checkIn,
    checkOut: b.checkOut,
    numberOfNights: b.numberOfNights,
    guestCount: b.guestCount,
    status: b.status,
    totalPrice: Number(b.totalPrice),
  }));

  // Serialize UnavailableDates for CalendarWidget
  const blockedDates = unavailableDates.map((ud) => ({
    date: ud.date.toISOString().split("T")[0],
    note: ud.reason ?? undefined,
  }));

  const kpis = [
    {
      label: "Pending Requests",
      value: pendingMessages,
      icon: AlertCircle,
      change: null,
      trend: null,
    },
    {
      label: "Monthly Revenue",
      value: formatCurrency(revenue),
      icon: Euro,
      change:
        revenueTrend !== null
          ? `${revenueTrend > 0 ? "+" : ""}${revenueTrend.toFixed(
              0
            )}% vs last month`
          : null,
      trend: revenueTrend !== null && revenueTrend >= 0 ? "up" : "down",
    },
    {
      label: "Confirmed Bookings",
      value: confirmedBookings,
      icon: Calendar,
      change: null,
      trend: null,
    },
    {
      label: "Occupancy Rate",
      value: "—",
      icon: RefreshCcw,
      change: null,
      trend: null,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Welcome back, {session?.user?.name}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <AdminCard key={kpi.label}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{kpi.label}</span>
                  <Icon className="w-5 h-5 text-admin-sage" />
                </div>
                <div className="text-3xl font-semibold text-gray-900">
                  {kpi.value}
                </div>
                {kpi.change && (
                  <div className="flex items-center gap-2 text-sm">
                    {kpi.trend === "up" ? (
                      <TrendingUp className="w-4 h-4 text-green-700" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-gray-500" />
                    )}
                    <span
                      className={
                        kpi.trend === "up" ? "text-green-700" : "text-gray-500"
                      }
                    >
                      {kpi.change}
                    </span>
                  </div>
                )}
              </div>
            </AdminCard>
          );
        })}
      </div>

      {/* Calendar Widget — Full Width */}
      <CalendarWidget bookings={calendarData} initialBlockedDates={blockedDates} />

      {/* Bottom row: Recent Bookings + Today sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings Table */}
        <div className="lg:col-span-2">
          <AdminCard
            title="Recent Bookings"
            subtitle="Last 5 bookings across all statuses"
          >
            {recentBookings.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                No bookings yet. They will appear here once guests submit
                requests.
              </p>
            ) : (
              <div className="overflow-x-auto -mx-6 -mb-6">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Guest
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Dates
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Nights
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((booking) => (
                      <tr
                        key={booking.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">
                            {booking.guestName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {booking.guestEmail}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatDateRange(booking.checkIn, booking.checkOut)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {booking.numberOfNights}
                        </td>
                        <td className="px-6 py-4">
                          <AdminBadge
                            variant="status"
                            status={booking.status}
                            size="sm"
                          />
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-gray-900">
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

        {/* Today — Upcoming Check-ins */}
        <div>
          <AdminCard title="Today" subtitle="Upcoming check-ins (next 30 days)">
            {upcomingCheckIns.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                No upcoming check-ins in the next 30 days.
              </p>
            ) : (
              <div className="space-y-4">
                {upcomingCheckIns.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-4 bg-[#FAFAF9] rounded-lg border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-medium text-gray-900">
                        {booking.guestName}
                      </div>
                      <AdminBadge
                        variant="status"
                        status={booking.status}
                        size="sm"
                      />
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>
                          {booking.checkIn.toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>
                          {booking.numberOfNights} nights · {booking.guestCount}{" "}
                          guests
                        </span>
                        <span className="font-medium text-gray-900">
                          {formatCurrency(Number(booking.totalPrice))}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AdminCard>
        </div>
      </div>
    </div>
  );
}
