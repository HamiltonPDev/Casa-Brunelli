"use client";

// ─── Imports ───────────────────────────────────────────────────
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Lock, X, Eye } from "lucide-react";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminBadge } from "@/components/admin/AdminBadge";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────
export interface CalendarBooking {
  id: string;
  guestName: string;
  guestEmail: string;
  checkIn: Date;
  checkOut: Date;
  numberOfNights: number;
  guestCount: number;
  status: string;
  totalPrice: number;
}

interface BlockedDate {
  date: string;
  note?: string;
}

interface CalendarWidgetProps {
  bookings: CalendarBooking[];
  onViewBooking?: (bookingId: string) => void;
}

// ─── Constants ─────────────────────────────────────────────────
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const YEARS = [2025, 2026, 2027];

// ─── Helpers ───────────────────────────────────────────────────
function toDateStr(date: Date): string {
  return date.toISOString().split("T")[0];
}

function isSameDay(a: Date, b: Date): boolean {
  return toDateStr(a) === toDateStr(b);
}

// ─── Component ─────────────────────────────────────────────────
export function CalendarWidget({
  bookings,
  onViewBooking,
}: CalendarWidgetProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [hoveredDay, setHoveredDay] = useState<Date | null>(null);
  const [dragStart, setDragStart] = useState<Date | null>(null);
  const [dragEnd, setDragEnd] = useState<Date | null>(null);
  const [blockNote, setBlockNote] = useState("");
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);

  // ── Derived ───────────────────────────────────────────────
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];

    for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++)
      days.push(new Date(year, month, d));

    return days;
  }, [currentDate]);

  function getBookingForDate(date: Date) {
    const str = toDateStr(date);
    return bookings.find((b) => {
      const ci = new Date(b.checkIn);
      const co = new Date(b.checkOut);
      const d = new Date(str);
      return d >= ci && d < co;
    });
  }

  function getBlockedInfo(date: Date) {
    return blockedDates.find((b) => b.date === toDateStr(date));
  }

  function getDayState(date: Date) {
    const today = new Date();
    if (isSameDay(date, today)) return "today" as const;
    if (getBookingForDate(date)) return "booked" as const;
    if (getBlockedInfo(date)) return "blocked" as const;
    return "available" as const;
  }

  function isInDragRange(date: Date) {
    if (!dragStart || !dragEnd) return false;
    const start = dragStart < dragEnd ? dragStart : dragEnd;
    const end = dragStart < dragEnd ? dragEnd : dragStart;
    return date >= start && date <= end;
  }

  // ── Handlers ──────────────────────────────────────────────
  function handleDayClick(date: Date) {
    if (dragStart) {
      setDragEnd(date);
      setDragStart(null);
    } else {
      setSelectedDay(date);
    }
  }

  function handleDayMouseDown(date: Date) {
    if (getDayState(date) === "available") {
      setDragStart(date);
      setDragEnd(date);
    }
  }

  function handleDayMouseEnter(date: Date) {
    setHoveredDay(date);
    if (dragStart && getDayState(date) === "available") setDragEnd(date);
  }

  function handleBlockDays() {
    if (!dragStart || !dragEnd) return;
    const start = dragStart < dragEnd ? dragStart : dragEnd;
    const end = dragStart < dragEnd ? dragEnd : dragStart;
    const newBlocked: BlockedDate[] = [];

    for (const d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      newBlocked.push({
        date: toDateStr(new Date(d)),
        note: blockNote || "Blocked by admin",
      });
    }

    setBlockedDates((prev) => [...prev, ...newBlocked]);
    setDragStart(null);
    setDragEnd(null);
    setBlockNote("");
    toast.success(`Blocked ${toDateStr(start)} → ${toDateStr(end)}`);
  }

  function handleUnblockDay(date: Date) {
    setBlockedDates((prev) => prev.filter((b) => b.date !== toDateStr(date)));
    setSelectedDay(null);
    toast.success("Day unblocked");
  }

  const selectedBooking = selectedDay ? getBookingForDate(selectedDay) : null;
  const selectedBlocked = selectedDay ? getBlockedInfo(selectedDay) : null;

  // ── Render ────────────────────────────────────────────────
  return (
    <>
      <AdminCard
        title="Availability Calendar"
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            {/* Legend */}
            <div className="flex items-center gap-3 mr-2">
              {[
                {
                  color: "bg-white border border-gray-300",
                  label: "Available",
                },
                { color: "bg-admin-avatar", label: "Booked" },
                { color: "bg-gray-200", label: "Blocked" },
                {
                  color: "bg-white border-2 border-admin-sage",
                  label: "Today",
                },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className={cn("w-3 h-3 rounded", color)} />
                  <span className="text-xs text-gray-600">{label}</span>
                </div>
              ))}
            </div>

            {/* Month nav */}
            <button
              onClick={() =>
                setCurrentDate(
                  new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() - 1,
                    1
                  )
                )
              }
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <select
              value={currentDate.getMonth()}
              onChange={(e) =>
                setCurrentDate(
                  new Date(currentDate.getFullYear(), Number(e.target.value), 1)
                )
              }
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-admin-sage/20"
            >
              {MONTH_NAMES.map((m, i) => (
                <option key={i} value={i}>
                  {m}
                </option>
              ))}
            </select>

            <select
              value={currentDate.getFullYear()}
              onChange={(e) =>
                setCurrentDate(
                  new Date(Number(e.target.value), currentDate.getMonth(), 1)
                )
              }
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-admin-sage/20"
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>

            <button
              onClick={() =>
                setCurrentDate(
                  new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() + 1,
                    1
                  )
                )
              }
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <AdminButton
              variant="secondary"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
            >
              Today
            </AdminButton>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-2">
            {DAYS_OF_WEEK.map((d) => (
              <div
                key={d}
                className="text-center text-sm font-semibold text-gray-600 py-2"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((date, idx) => {
              if (!date)
                return <div key={`e-${idx}`} className="aspect-square" />;

              const state = getDayState(date);
              const booking = getBookingForDate(date);
              const isSelected = selectedDay && isSameDay(date, selectedDay);
              const inDrag = isInDragRange(date);
              const isHovered = hoveredDay && isSameDay(date, hoveredDay);

              return (
                <div
                  key={idx}
                  className="relative group"
                  onMouseDown={() => handleDayMouseDown(date)}
                  onMouseEnter={() => handleDayMouseEnter(date)}
                  onClick={() => handleDayClick(date)}
                >
                  <div
                    className={cn(
                      "aspect-square min-h-[44px] rounded-lg border-2 p-2 cursor-pointer",
                      "transition-all duration-200 flex flex-col items-center justify-center",
                      state === "available" &&
                        "bg-white border-gray-200 hover:border-admin-sage hover:bg-gray-50",
                      state === "booked" &&
                        "bg-admin-avatar border-admin-avatar text-white",
                      state === "blocked" &&
                        "bg-gray-200 border-gray-300 relative overflow-hidden",
                      state === "today" &&
                        "ring-2 ring-admin-sage ring-offset-2",
                      isSelected && "ring-2 ring-blue-500 ring-offset-2",
                      inDrag && "ring-2 ring-admin-sage bg-admin-sage/10"
                    )}
                  >
                    {/* Diagonal hatch for blocked */}
                    {state === "blocked" && (
                      <div className="absolute inset-0 pointer-events-none">
                        <svg
                          className="w-full h-full"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <defs>
                            <pattern
                              id="hatch"
                              patternUnits="userSpaceOnUse"
                              width="4"
                              height="4"
                            >
                              <path
                                d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2"
                                stroke="#9CA3AF"
                                strokeWidth="1"
                              />
                            </pattern>
                          </defs>
                          <rect width="100%" height="100%" fill="url(#hatch)" />
                        </svg>
                      </div>
                    )}

                    <div
                      className={cn(
                        "text-sm font-medium z-10",
                        state === "booked" ? "text-white" : "text-gray-900",
                        state === "blocked" && "text-gray-600"
                      )}
                    >
                      {date.getDate()}
                    </div>

                    {state === "booked" && (
                      <div className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded mt-0.5">
                        Booked
                      </div>
                    )}
                    {state === "blocked" && (
                      <Lock className="w-3 h-3 text-gray-500 mt-0.5 z-10" />
                    )}
                  </div>

                  {/* Tooltip */}
                  {state === "booked" && booking && isHovered && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-20 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg pointer-events-none">
                      {booking.guestName}
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Drag selection toolbar */}
          {dragStart && dragEnd && (
            <div className="flex items-center justify-between p-4 bg-admin-sage text-white rounded-lg">
              <span className="font-medium text-sm">
                Block {toDateStr(dragStart < dragEnd ? dragStart : dragEnd)} →{" "}
                {toDateStr(dragStart < dragEnd ? dragEnd : dragStart)}
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Optional note..."
                  value={blockNote}
                  onChange={(e) => setBlockNote(e.target.value)}
                  className="px-3 py-1.5 rounded-lg text-gray-900 text-sm w-40"
                />
                <AdminButton
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setDragStart(null);
                    setDragEnd(null);
                  }}
                >
                  Cancel
                </AdminButton>
                <AdminButton
                  variant="primary"
                  size="sm"
                  onClick={handleBlockDays}
                >
                  Block Days
                </AdminButton>
              </div>
            </div>
          )}
        </div>
      </AdminCard>

      {/* Day detail modal */}
      {selectedDay && !dragStart && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedDay.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedBooking
                    ? "Booking Details"
                    : selectedBlocked
                    ? "Blocked Date"
                    : "Available Date"}
                </p>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {selectedBooking ? (
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">
                        {selectedBooking.guestName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {selectedBooking.guestEmail}
                      </div>
                    </div>
                    <AdminBadge
                      variant="status"
                      status={
                        selectedBooking.status as Parameters<
                          typeof AdminBadge
                        >[0]["status"]
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Check-in</div>
                      <div className="font-medium text-gray-900 text-sm">
                        {new Date(selectedBooking.checkIn).toLocaleDateString(
                          "en-GB"
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">
                        Check-out
                      </div>
                      <div className="font-medium text-gray-900 text-sm">
                        {new Date(selectedBooking.checkOut).toLocaleDateString(
                          "en-GB"
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Guests</div>
                      <div className="font-medium text-gray-900 text-sm">
                        {selectedBooking.guestCount} guests
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Nights</div>
                      <div className="font-medium text-gray-900 text-sm">
                        {selectedBooking.numberOfNights} nights
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-gray-100">
                    <div className="text-xs text-gray-500 mb-1">Total</div>
                    <div className="text-2xl font-semibold text-gray-900">
                      €{selectedBooking.totalPrice.toLocaleString()}
                    </div>
                  </div>
                  {onViewBooking && (
                    <AdminButton
                      variant="primary"
                      className="w-full"
                      icon={<Eye className="w-4 h-4" />}
                      onClick={() => {
                        onViewBooking(selectedBooking.id);
                        setSelectedDay(null);
                      }}
                    >
                      View Booking
                    </AdminButton>
                  )}
                </div>
              ) : selectedBlocked ? (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-100 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-700 mb-1">
                      <Lock className="w-4 h-4" />
                      <span className="font-medium text-sm">Blocked</span>
                    </div>
                    {selectedBlocked.note && (
                      <p className="text-sm text-gray-600">
                        {selectedBlocked.note}
                      </p>
                    )}
                  </div>
                  <AdminButton
                    variant="secondary"
                    className="w-full"
                    onClick={() => handleUnblockDay(selectedDay)}
                  >
                    Unblock This Day
                  </AdminButton>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  This date is available for booking.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
