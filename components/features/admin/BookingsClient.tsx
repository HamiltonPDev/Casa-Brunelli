"use client";

// ─── Imports ───────────────────────────────────────────────────
import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Eye,
  FileX,
  Trash2,
} from "lucide-react";
import { AdminCard } from "@/components/ui/admin/AdminCard";
import { AdminBadge } from "@/components/ui/admin/AdminBadge";
import { AdminButton } from "@/components/ui/admin/AdminButton";
import { AdminField } from "@/components/ui/admin/AdminField";
import { formatCurrency, formatDateRange, cn } from "@/lib/utils";
import {
  fetchBookings as fetchBookingsApi,
  deleteBookings,
} from "@/lib/services/bookings";

// ─── Types ─────────────────────────────────────────────────────
interface Booking {
  id: string;
  guestName: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
  numberOfNights: number;
  guestCount: number;
  status: string;
  totalPrice: number;
  advanceAmount: number;
  advancePaid: boolean;
  balancePaid: boolean;
  updatedAt: string;
}

interface Pagination {
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

// ─── Constants ─────────────────────────────────────────────────
const STATUS_OPTIONS = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"];

const GUEST_OPTIONS = ["2", "3", "4", "5", "6", "7", "8"].map((v) => ({
  value: v,
  label: `${v} guests`,
}));

// ─── Component ─────────────────────────────────────────────────
export function BookingsClient() {
  const router = useRouter();

  // ── Filter state ──────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [guests, setGuests] = useState("");
  const [page, setPage] = useState(1);

  // ── Table state ───────────────────────────────────────────
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [isPending, startTransition] = useTransition();

  const hasActiveFilters =
    search || statusFilters.length > 0 || dateFrom || dateTo || guests;

  // ── Fetch bookings ────────────────────────────────────────
  // useTransition batches all setState calls into a single render
  function loadBookings() {
    startTransition(async () => {
      const result = await fetchBookingsApi({
        search: search || undefined,
        status: statusFilters.length ? statusFilters : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        guests: guests || undefined,
        page,
      });

      if (result.success) {
        setBookings(result.data.data);
        setPagination(result.data.pagination);
      } else {
        toast.error(result.error);
      }
    });
  }

  useEffect(() => {
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilters, dateFrom, dateTo, guests, page]);

  // ── Handlers ──────────────────────────────────────────────
  function toggleStatus(status: string) {
    setStatusFilters((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    );
    setPage(1);
  }

  function clearFilters() {
    setSearch("");
    setStatusFilters([]);
    setDateFrom("");
    setDateTo("");
    setGuests("");
    setPage(1);
  }

  function toggleRow(id: string) {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id],
    );
  }

  function toggleAll() {
    setSelectedRows(
      selectedRows.length === bookings.length ? [] : bookings.map((b) => b.id),
    );
  }

  async function handleBulkDelete() {
    setBulkLoading(true);

    const result = await deleteBookings(selectedRows);

    if (result.success) {
      toast.success(
        `Deleted ${result.data.deleted} booking${result.data.deleted !== 1 ? "s" : ""}`,
      );
      setSelectedRows([]);
      setConfirmBulkDelete(false);
      void loadBookings();
    } else {
      toast.error(result.error);
    }

    setBulkLoading(false);
  }

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Bookings</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage all property bookings
          </p>
        </div>
        <div className="flex items-center gap-3">
          <AdminButton variant="ghost" icon={<Download className="w-4 h-4" />}>
            Export CSV
          </AdminButton>
          <AdminButton variant="primary" icon={<Plus className="w-4 h-4" />}>
            New Booking
          </AdminButton>
        </div>
      </div>

      {/* Filters */}
      <AdminCard>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Status pills */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Status
              </label>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => toggleStatus(s)}
                    className={cn(
                      "px-3 py-1.5 text-xs rounded-lg border transition-all font-medium",
                      statusFilters.includes(s)
                        ? "bg-admin-sage text-white border-admin-sage"
                        : "bg-white text-gray-700 border-gray-300 hover:border-admin-sage",
                    )}
                  >
                    {s.charAt(0) + s.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            <AdminField
              type="date"
              label="Check-in from"
              value={dateFrom}
              onChange={(v) => {
                setDateFrom(v);
                setPage(1);
              }}
            />
            <AdminField
              type="date"
              label="Check-in to"
              value={dateTo}
              onChange={(v) => {
                setDateTo(v);
                setPage(1);
              }}
            />
            <AdminField
              type="select"
              label="Guests"
              placeholder="Any"
              value={guests}
              onChange={(v) => {
                setGuests(v);
                setPage(1);
              }}
              options={GUEST_OPTIONS}
            />
            <AdminField
              label="Search"
              placeholder="Guest or email…"
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              icon={<Search className="w-4 h-4" />}
            />
          </div>

          {hasActiveFilters && (
            <div className="flex justify-end">
              <button
                onClick={clearFilters}
                className="text-sm text-admin-sage hover:text-admin-sage-hover font-medium flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Clear filters
              </button>
            </div>
          )}
        </div>
      </AdminCard>

      {/* Bulk actions bar */}
      {selectedRows.length > 0 && (
        <div className="bg-admin-sage text-white px-6 py-4 rounded-xl shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-medium">{selectedRows.length} selected</span>
            <button
              onClick={() => {
                setSelectedRows([]);
                setConfirmBulkDelete(false);
              }}
              className="text-sm hover:text-white/70 transition-colors"
            >
              Clear selection
            </button>
          </div>
          <div className="flex items-center gap-3">
            {confirmBulkDelete ? (
              <>
                <span className="text-sm">Are you sure?</span>
                <AdminButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmBulkDelete(false)}
                >
                  Cancel
                </AdminButton>
                <AdminButton
                  variant="danger"
                  size="sm"
                  loading={bulkLoading}
                  icon={<Trash2 className="w-4 h-4" />}
                  onClick={handleBulkDelete}
                >
                  Yes, Delete {selectedRows.length}
                </AdminButton>
              </>
            ) : (
              <AdminButton
                variant="danger"
                size="sm"
                icon={<Trash2 className="w-4 h-4" />}
                onClick={() => setConfirmBulkDelete(true)}
              >
                Delete Selected
              </AdminButton>
            )}
          </div>
        </div>
      )}

      {/* Table or empty state */}
      {!isPending && bookings.length === 0 ? (
        <AdminCard>
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileX className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No bookings found
            </h3>
            <p className="text-gray-500 mb-6">
              {hasActiveFilters
                ? "Try adjusting your filters to see more results"
                : "No bookings have been created yet"}
            </p>
            {hasActiveFilters && (
              <AdminButton variant="primary" onClick={clearFilters}>
                Reset Filters
              </AdminButton>
            )}
          </div>
        </AdminCard>
      ) : (
        <AdminCard>
          <div className="overflow-x-auto -mx-6 -mb-6">
            <table className="w-full">
              <thead className="sticky top-0 bg-gray-50 z-10">
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedRows.length === bookings.length &&
                        bookings.length > 0
                      }
                      onChange={toggleAll}
                      className="w-4 h-4 rounded border-gray-300 accent-admin-sage"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Guest
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Check-in → Check-out
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                    Nights
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                    Guests
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                    Advance
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                    Balance
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                    Total
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {isPending
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        {Array.from({ length: 10 }).map((__, j) => (
                          <td key={j} className="px-6 py-4">
                            <div className="h-4 bg-gray-100 rounded animate-pulse" />
                          </td>
                        ))}
                      </tr>
                    ))
                  : bookings.map((booking, idx) => {
                      const isSelected = selectedRows.includes(booking.id);
                      return (
                        <tr
                          key={booking.id}
                          className={cn(
                            "border-b border-gray-100 transition-colors",
                            isSelected
                              ? "bg-admin-sage/5"
                              : idx % 2 === 0
                                ? "bg-white hover:bg-gray-50"
                                : "bg-admin-bg hover:bg-gray-50",
                          )}
                        >
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleRow(booking.id)}
                              className="w-4 h-4 rounded border-gray-300 accent-admin-sage"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-medium text-gray-900">
                              {booking.guestName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {booking.guestEmail}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {formatDateRange(
                              new Date(booking.checkIn),
                              new Date(booking.checkOut),
                            )}
                          </td>
                          <td className="px-6 py-4 text-center text-sm text-gray-600">
                            {booking.numberOfNights}
                          </td>
                          <td className="px-6 py-4 text-center text-sm text-gray-600">
                            {booking.guestCount}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <AdminBadge
                              variant={
                                booking.advancePaid ? "success" : "default"
                              }
                              size="sm"
                            >
                              {booking.advancePaid ? "Paid" : "Pending"}
                            </AdminBadge>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <AdminBadge
                              variant={
                                booking.balancePaid ? "success" : "default"
                              }
                              size="sm"
                            >
                              {booking.balancePaid ? "Paid" : "Pending"}
                            </AdminBadge>
                          </td>
                          <td className="px-6 py-4 text-right font-medium text-gray-900">
                            {formatCurrency(booking.totalPrice)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <AdminBadge
                              variant="status"
                              status={booking.status}
                              size="sm"
                            />
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() =>
                                router.push(`/admin/bookings/${booking.id}`)
                              }
                              className="inline-flex items-center gap-1.5 text-sm text-admin-sage hover:text-admin-sage-hover font-medium px-3 py-1.5 rounded-lg hover:bg-admin-sage/10 transition-all duration-200 cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-6">
              <p className="text-sm text-gray-500">
                Showing {(pagination.page - 1) * pagination.perPage + 1} to{" "}
                {Math.min(
                  pagination.page * pagination.perPage,
                  pagination.total,
                )}{" "}
                of {pagination.total} bookings
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from(
                  { length: pagination.totalPages },
                  (_, i) => i + 1,
                ).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                      p === page
                        ? "bg-admin-sage text-white"
                        : "text-gray-700 hover:bg-gray-100",
                    )}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() =>
                    setPage((p) => Math.min(pagination.totalPages, p + 1))
                  }
                  disabled={page === pagination.totalPages}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </AdminCard>
      )}
    </div>
  );
}
