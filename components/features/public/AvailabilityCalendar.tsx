"use client";

// ─── Imports ───────────────────────────────────────────────────
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Users,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MAX_GUESTS, MIN_GUESTS } from "@/lib/constants";
import { Card } from "@/components/ui/public/Card";
import type { DayAvailability } from "@/app/api/availability/route";

// ─── Types ─────────────────────────────────────────────────────
type BandPosition = "single" | "start" | "middle" | "end";
type DayState = "available" | "booked" | "blocked" | "past";

interface DayCell {
  iso: string;
  date: Date;
  inMonth: boolean;
  state: DayState;
  bandPosition: BandPosition;
  info: DayAvailability | null;
}

interface PriceTooltip {
  iso: string;
  price: number;
  seasonName: string | null;
  minStay: number | null;
}

type SelectionState =
  | { phase: "idle" }
  | { phase: "start"; checkIn: string }
  | { phase: "done"; checkIn: string; checkOut: string };

// ─── Constants ─────────────────────────────────────────────────
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
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
] as const;

// ─── Helpers ───────────────────────────────────────────────────
function toISO(date: Date): string {
  return date.toISOString().split("T")[0];
}

function addMonths(d: Date, n: number): Date {
  const r = new Date(d);
  r.setMonth(r.getMonth() + n, 1);
  return r;
}

async function fetchAvailability(
  from: string,
  to: string
): Promise<Map<string, DayAvailability>> {
  const res = await fetch(`/api/availability?from=${from}&to=${to}`);
  if (!res.ok) throw new Error("Failed to fetch");
  const json = (await res.json()) as {
    success: boolean;
    data: { days: DayAvailability[] };
  };
  return new Map(json.data.days.map((d) => [d.date, d]));
}

function formatEuro(n: number): string {
  return `€${Math.round(n).toLocaleString("en-EU")}`;
}

function calcNights(a: string, b: string): number {
  return Math.round(
    (new Date(b + "T00:00:00").getTime() -
      new Date(a + "T00:00:00").getTime()) /
      86400000
  );
}

// ─── Component ─────────────────────────────────────────────────
export function AvailabilityCalendar() {
  const router = useRouter();
  const [today] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const [viewMonth, setViewMonth] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(1);
    return d;
  });
  const [availMap, setAvailMap] = useState<Map<string, DayAvailability>>(
    new Map()
  );
  const [fetchState, setFetchState] = useState<{
    loading: boolean;
    error: string | null;
  }>({ loading: true, error: null });
  const [selection, setSelection] = useState<SelectionState>({ phase: "idle" });
  const [hoverISO, setHoverISO] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<PriceTooltip | null>(null);
  const [guests, setGuests] = useState(2);

  // ─── Fetch availability on month change ────────────────────
  useEffect(() => {
    const from = toISO(viewMonth);
    const twoOut = addMonths(viewMonth, 2);
    twoOut.setDate(0);
    const to = toISO(twoOut);
    let cancelled = false;
    setFetchState({ loading: true, error: null }); // eslint-disable-line react-hooks/set-state-in-effect
    fetchAvailability(from, to)
      .then((map) => {
        if (!cancelled) {
          setAvailMap(map);
          setFetchState({ loading: false, error: null });
        }
      })
      .catch(() => {
        if (!cancelled)
          setFetchState({
            loading: false,
            error: "Could not load availability. Please try again.",
          });
      });
    return () => {
      cancelled = true;
    };
  }, [viewMonth]);

  const { loading, error } = fetchState;

  // ─── Build single-month grid ───────────────────────────────
  function buildGrid(year: number, month: number): DayCell[] {
    const firstDay = new Date(year, month, 1);
    const startDow = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const totalCells = Math.ceil((startDow + daysInMonth) / 7) * 7;

    const monthDates: Date[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      monthDates.push(new Date(year, month, d));
    }

    function getState(date: Date): DayState {
      if (date < today) return "past";
      const info = availMap.get(toISO(date));
      if (!info) return "past";
      if (info.booked) return "booked";
      if (info.blocked) return "blocked";
      return "available";
    }

    function getBandPosition(
      _date: Date,
      state: DayState,
      idx: number
    ): BandPosition {
      if (state === "available" || state === "past") return "single";
      const prevState = idx > 0 ? getState(monthDates[idx - 1]) : null;
      const nextState =
        idx < monthDates.length - 1 ? getState(monthDates[idx + 1]) : null;
      const sameAsPrev = prevState === state;
      const sameAsNext = nextState === state;
      if (sameAsPrev && sameAsNext) return "middle";
      if (sameAsPrev && !sameAsNext) return "end";
      if (!sameAsPrev && sameAsNext) return "start";
      return "single";
    }

    const cells: DayCell[] = [];
    const cursor = new Date(year, month, 1 - startDow);

    for (let i = 0; i < totalCells; i++) {
      const d = new Date(cursor);
      const inMonth = d.getMonth() === month;
      const iso = toISO(d);
      const monthIdx = d.getDate() - 1;
      const state = inMonth ? getState(d) : "past";
      const bandPosition = inMonth
        ? getBandPosition(d, state, monthIdx)
        : "single";
      cells.push({
        iso,
        date: d,
        inMonth,
        state,
        bandPosition,
        info: availMap.get(iso) ?? null,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    return cells;
  }

  // ─── Range validation ───────────────────────────────────────
  /** Returns true if every intermediate day between checkIn and checkOut is available */
  function isRangeClear(checkInISO: string, checkOutISO: string): boolean {
    const cursor = new Date(checkInISO + "T00:00:00");
    cursor.setDate(cursor.getDate() + 1); // skip check-in day (already validated)
    const endDate = new Date(checkOutISO + "T00:00:00");

    while (cursor < endDate) {
      const info = availMap.get(toISO(cursor));
      if (!info || info.booked || info.blocked) return false;
      cursor.setDate(cursor.getDate() + 1);
    }
    return true;
  }

  // ─── Selection logic ───────────────────────────────────────
  function handleDayClick(cell: DayCell) {
    if (!cell.inMonth || cell.state !== "available") return;
    const { iso } = cell;

    if (selection.phase === "idle" || selection.phase === "done") {
      setSelection({ phase: "start", checkIn: iso });
      return;
    }
    if (selection.phase === "start") {
      if (iso <= selection.checkIn) {
        setSelection({ phase: "start", checkIn: iso });
        return;
      }
      // Validate no booked/blocked dates in between
      if (!isRangeClear(selection.checkIn, iso)) {
        // Reset to clicked date as new check-in
        setSelection({ phase: "start", checkIn: iso });
        return;
      }
      setSelection({
        phase: "done",
        checkIn: selection.checkIn,
        checkOut: iso,
      });
    }
  }

  function isInRange(iso: string): boolean {
    const end =
      selection.phase === "done"
        ? selection.checkOut
        : selection.phase === "start" &&
          hoverISO &&
          hoverISO > selection.checkIn
        ? hoverISO
        : null;
    if (!end) return false;
    const checkIn =
      selection.phase === "start"
        ? selection.checkIn
        : (selection as { phase: "done"; checkIn: string }).checkIn;
    return iso > checkIn && iso < end;
  }

  function isCheckIn(iso: string): boolean {
    return (
      (selection.phase === "start" || selection.phase === "done") &&
      selection.checkIn === iso
    );
  }

  function isCheckOut(iso: string): boolean {
    return selection.phase === "done" && selection.checkOut === iso;
  }

  const nights =
    selection.phase === "done"
      ? calcNights(selection.checkIn, selection.checkOut)
      : 0;

  const hasMinStayViolation =
    selection.phase === "done" && nights > 0
      ? (() => {
          const info = availMap.get(selection.checkIn);
          return info?.minStay ? nights < info.minStay : false;
        })()
      : false;

  const minStayRequired =
    selection.phase === "start" || selection.phase === "done"
      ? availMap.get(selection.checkIn)?.minStay ?? null
      : null;

  const cells = buildGrid(viewMonth.getFullYear(), viewMonth.getMonth());
  const todayISO = toISO(today);

  // ─── Render ────────────────────────────────────────────────
  return (
    <div className="max-w-350 mx-auto px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ═══ Calendar column (2/3) ══════════════════════════ */}
        <div className="lg:col-span-2 space-y-4">
          {/* ─── Legend ──────────────────────────────────────── */}
          <div className="flex flex-wrap items-center gap-3 text-sm">
            {(
              [
                {
                  bg: "white",
                  borderStyle: "1px solid rgba(139,157,131,0.3)",
                  label: "Available",
                },
                {
                  bg: "var(--terracotta-gold)",
                  borderStyle: "none",
                  label: "Booked",
                },
                {
                  bg: "var(--gray-200)",
                  borderStyle: "none",
                  label: "Unavailable",
                },
                {
                  bg: "white",
                  borderStyle: "2px solid var(--sage-variant)",
                  label: "Today",
                },
              ] as const
            ).map(({ bg, borderStyle, label }) => (
              <div key={label} className="flex items-center gap-2">
                <span
                  className="inline-block w-3.5 h-3.5 rounded-sm"
                  style={{ background: bg, border: borderStyle }}
                />
                <span style={{ color: "var(--sage-variant)" }}>{label}</span>
              </div>
            ))}
          </div>

          {/* ─── Calendar card ───────────────────────────────── */}
          <Card className="space-y-4">
            {/* Month navigation */}
            <div className="flex items-center justify-between">
              <h2
                className="font-serif text-xl"
                style={{ color: "var(--dark-forest)" }}
              >
                {MONTH_NAMES[viewMonth.getMonth()]} {viewMonth.getFullYear()}
              </h2>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setViewMonth(new Date())}
                  className="px-3 py-1.5 text-sm rounded-lg transition-colors"
                  style={{ color: "var(--medium-green)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "var(--cream)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  Today
                </button>
                <button
                  onClick={() => setViewMonth((m) => addMonths(m, -1))}
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: "var(--sage-variant)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "var(--cream)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                  aria-label="Previous month"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => setViewMonth((m) => addMonths(m, 1))}
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: "var(--sage-variant)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "var(--cream)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                  aria-label="Next month"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-20 gap-3">
                <Loader2
                  size={20}
                  className="animate-spin"
                  style={{ color: "var(--sage-variant)" }}
                />
                <span
                  className="text-sm"
                  style={{ color: "var(--sage-variant)" }}
                >
                  Loading availability…
                </span>
              </div>
            )}

            {/* Error */}
            {error && !loading && (
              <div
                className="flex items-center gap-3 p-4 rounded-xl border text-sm"
                style={{
                  color: "var(--error-red)",
                  borderColor: "var(--error-red)",
                  backgroundColor: "rgba(193,67,67,0.05)",
                }}
              >
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {/* Calendar grid */}
            {!loading && !error && (
              <div>
                {/* Weekday headers */}
                <div className="grid grid-cols-7 mb-1">
                  {WEEKDAYS.map((d) => (
                    <div
                      key={d}
                      className="text-center text-xs font-medium py-2"
                      style={{ color: "rgba(61,82,67,0.7)" }}
                    >
                      {d}
                    </div>
                  ))}
                </div>

                {/* Day cells */}
                <div className="grid grid-cols-7 gap-1">
                  {cells.map((cell, idx) => {
                    if (!cell.inMonth) {
                      return <div key={idx} className="aspect-square" />;
                    }

                    const { iso, state, bandPosition, info } = cell;
                    const isCIn = isCheckIn(iso);
                    const isCOut = isCheckOut(iso);
                    const inRange = isInRange(iso);
                    const isT = iso === todayISO;
                    const isHov = hoverISO === iso;

                    // Band border-radius
                    let borderRadiusClass = "rounded-lg";
                    if (state === "booked" || state === "blocked") {
                      if (bandPosition === "start")
                        borderRadiusClass = "rounded-l-lg";
                      else if (bandPosition === "end")
                        borderRadiusClass = "rounded-r-lg";
                      else if (bandPosition === "middle")
                        borderRadiusClass = "rounded-none";
                    }

                    // Background + text color
                    let bg = "white";
                    let textCol = "var(--dark-forest)";
                    let cursorStyle = "default";

                    if (isCIn || isCOut) {
                      bg = "var(--sage-variant)";
                      textCol = "white";
                      cursorStyle = "pointer";
                    } else if (inRange) {
                      bg = "rgba(139,157,131,0.1)";
                      cursorStyle = "pointer";
                    } else if (state === "booked") {
                      bg = "var(--terracotta-gold)";
                      textCol = "white";
                    } else if (state === "blocked" || state === "past") {
                      bg = "var(--gray-200)";
                      textCol = "var(--gray-500)";
                    } else if (state === "available") {
                      bg = isHov ? "var(--cream)" : "white";
                      cursorStyle = "pointer";
                    }

                    return (
                      <div key={iso} className="relative">
                        <button
                          onClick={() => handleDayClick(cell)}
                          onMouseEnter={() => {
                            setHoverISO(iso);
                            if (state === "available" && info?.rate) {
                              setTooltip({
                                iso,
                                price: info.rate,
                                seasonName: info.seasonName,
                                minStay: info.minStay,
                              });
                            }
                          }}
                          onMouseLeave={() => {
                            setHoverISO(null);
                            setTooltip(null);
                          }}
                          disabled={state !== "available"}
                          className={cn(
                            "w-full aspect-square min-h-11 p-2 border flex flex-col items-stretch justify-between transition-all duration-150",
                            borderRadiusClass,
                            state === "available" &&
                              !isCIn &&
                              !isCOut &&
                              "hover:border-sage-variant",
                            isT && !isCIn && !isCOut && "ring-2 ring-offset-1"
                          )}
                          style={{
                            backgroundColor: bg,
                            color: textCol,
                            borderColor:
                              isCIn || isCOut
                                ? "var(--sage-variant)"
                                : inRange
                                ? "rgba(139,157,131,0.4)"
                                : "rgba(139,157,131,0.15)",
                            cursor: cursorStyle,
                            ...(isT && !isCIn && !isCOut
                              ? {
                                  outline: "2px solid var(--sage-variant)",
                                  outlineOffset: "2px",
                                }
                              : {}),
                          }}
                          aria-label={`${iso}${
                            info?.available
                              ? `, ${formatEuro(info.rate ?? 0)}`
                              : ", unavailable"
                          }`}
                        >
                          {/* Diagonal hatch for blocked/past */}
                          {(state === "blocked" || state === "past") && (
                            <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-lg">
                              <svg className="w-full h-full">
                                <defs>
                                  <pattern
                                    id={`h${idx}`}
                                    patternUnits="userSpaceOnUse"
                                    width="4"
                                    height="4"
                                  >
                                    <path
                                      d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2"
                                      stroke="#d1d5db"
                                      strokeWidth="0.8"
                                    />
                                  </pattern>
                                </defs>
                                <rect
                                  width="100%"
                                  height="100%"
                                  fill={`url(#h${idx})`}
                                />
                              </svg>
                            </div>
                          )}

                          {/* Day number */}
                          <div className="text-sm font-medium z-10 text-left">
                            {cell.date.getDate()}
                          </div>

                          {/* Bottom row */}
                          <div className="flex items-end justify-between z-10">
                            {state === "booked" && (
                              <span
                                className="text-[9px] px-1 py-0.5 rounded"
                                style={{
                                  backgroundColor: "rgba(255,255,255,0.25)",
                                  color: "white",
                                }}
                              >
                                Booked
                              </span>
                            )}
                            {(state === "blocked" || state === "past") && (
                              <Lock
                                size={10}
                                style={{ color: "var(--gray-500)" }}
                              />
                            )}
                            {state === "available" &&
                              info?.rate &&
                              !isCIn &&
                              !isCOut && (
                                <span
                                  className="text-[10px] font-semibold ml-auto"
                                  style={{
                                    color: inRange
                                      ? "var(--dark-forest)"
                                      : "var(--medium-green)",
                                  }}
                                >
                                  €{Math.round(info.rate)}
                                </span>
                              )}
                          </div>
                        </button>

                        {/* Price tooltip */}
                        <AnimatePresence>
                          {tooltip?.iso === iso && (
                            <motion.div
                              initial={{ opacity: 0, y: 4, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 4, scale: 0.95 }}
                              transition={{ duration: 0.15 }}
                              className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 rounded-xl px-3 py-2 shadow-lg whitespace-nowrap pointer-events-none text-xs"
                              style={{
                                backgroundColor: "var(--dark-forest)",
                                color: "white",
                              }}
                            >
                              <div className="font-semibold mb-0.5">
                                {formatEuro(tooltip.price)}/night
                              </div>
                              {tooltip.seasonName && (
                                <div style={{ color: "var(--cream)" }}>
                                  {tooltip.seasonName}
                                </div>
                              )}
                              {tooltip.minStay && tooltip.minStay > 1 && (
                                <div
                                  className="text-[10px] mt-0.5"
                                  style={{ color: "rgba(245,243,239,0.6)" }}
                                >
                                  Min {tooltip.minStay} nights
                                </div>
                              )}
                              <div
                                className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45"
                                style={{
                                  backgroundColor: "var(--dark-forest)",
                                }}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* ═══ Sidebar (1/3) ══════════════════════════════════ */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            {/* ─── Your Selection card ─────────────────────── */}
            <Card className="space-y-4">
              <h3
                className="font-serif text-lg"
                style={{ color: "var(--dark-forest)" }}
              >
                Your Selection
              </h3>

              {/* Dates row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div
                    className="text-xs mb-1"
                    style={{ color: "rgba(61,82,67,0.7)" }}
                  >
                    Check-in
                  </div>
                  <div
                    className="font-medium text-sm"
                    style={{ color: "var(--dark-forest)" }}
                  >
                    {selection.phase === "start" || selection.phase === "done"
                      ? new Date(
                          selection.checkIn + "T00:00:00"
                        ).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                        })
                      : "—"}
                  </div>
                </div>
                <div>
                  <div
                    className="text-xs mb-1"
                    style={{ color: "rgba(61,82,67,0.7)" }}
                  >
                    Check-out
                  </div>
                  <div
                    className="font-medium text-sm"
                    style={{ color: "var(--dark-forest)" }}
                  >
                    {selection.phase === "done"
                      ? new Date(
                          selection.checkOut + "T00:00:00"
                        ).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                        })
                      : "—"}
                  </div>
                </div>
              </div>

              {/* Duration */}
              {nights > 0 && (
                <div>
                  <div
                    className="text-xs mb-1"
                    style={{ color: "rgba(61,82,67,0.7)" }}
                  >
                    Duration
                  </div>
                  <div
                    className="font-medium text-sm"
                    style={{ color: "var(--dark-forest)" }}
                  >
                    {nights} {nights === 1 ? "night" : "nights"}
                  </div>
                </div>
              )}

              {/* Min stay warning */}
              <AnimatePresence>
                {hasMinStayViolation && minStayRequired && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-start gap-2 p-3 rounded-xl border overflow-hidden"
                    style={{
                      backgroundColor: "#fffbeb",
                      borderColor: "#fcd34d",
                    }}
                  >
                    <AlertCircle
                      size={16}
                      className="shrink-0 mt-0.5"
                      style={{ color: "#d97706" }}
                    />
                    <div className="text-xs" style={{ color: "#92400e" }}>
                      <div className="font-semibold mb-0.5">
                        Minimum stay requirement
                      </div>
                      <div>
                        This season requires at least {minStayRequired} nights.
                        Please adjust your dates.
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Guests selector */}
              <div>
                <label
                  className="text-xs mb-1 block"
                  style={{ color: "rgba(61,82,67,0.7)" }}
                >
                  Guests
                </label>
                <div className="relative">
                  <Users
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--sage-variant)" }}
                  />
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl border text-sm appearance-none cursor-pointer outline-none"
                    style={{
                      borderColor: "rgba(139,157,131,0.3)",
                      color: "var(--dark-forest)",
                      backgroundColor: "var(--cream)",
                    }}
                  >
                    {Array.from(
                      { length: MAX_GUESTS - MIN_GUESTS + 1 },
                      (_, i) => i + MIN_GUESTS
                    ).map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? "guest" : "guests"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* CTA */}
              <div
                className="pt-3 border-t"
                style={{ borderColor: "rgba(139,157,131,0.15)" }}
              >
                <button
                  onClick={() => {
                    if (selection.phase === "done" && !hasMinStayViolation) {
                      router.push(
                        `/booking?checkIn=${selection.checkIn}&checkOut=${selection.checkOut}&guests=${guests}`
                      );
                    }
                  }}
                  disabled={selection.phase !== "done" || hasMinStayViolation}
                  className="w-full py-3 rounded-xl font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.98]"
                  style={{
                    backgroundColor: "var(--sage-variant)",
                    color: "white",
                  }}
                >
                  Continue to Booking
                </button>

                {selection.phase === "idle" && (
                  <p
                    className="text-xs text-center mt-2"
                    style={{ color: "rgba(61,82,67,0.6)" }}
                  >
                    Select check-in and check-out dates to continue
                  </p>
                )}
                {selection.phase === "start" && (
                  <p
                    className="text-xs text-center mt-2"
                    style={{ color: "rgba(61,82,67,0.6)" }}
                  >
                    Now select your check-out date
                  </p>
                )}
                {selection.phase !== "idle" && (
                  <button
                    onClick={() => setSelection({ phase: "idle" })}
                    className="w-full text-center text-xs mt-2 transition-opacity hover:opacity-60"
                    style={{ color: "rgba(61,82,67,0.6)" }}
                  >
                    Clear selection
                  </button>
                )}
              </div>
            </Card>

            {/* ─── How it works card ────────────────────────── */}
            <Card padding="sm">
              <p
                className="text-xs font-semibold mb-3"
                style={{ color: "rgba(61,82,67,0.7)" }}
              >
                How it works
              </p>
              <ol
                className="text-xs space-y-2 list-decimal list-inside leading-relaxed"
                style={{ color: "rgba(61,82,67,0.8)" }}
              >
                <li>Select your dates on the calendar</li>
                <li>Fill in your details</li>
                <li>We confirm within 24 h</li>
                <li>Pay 30% deposit to secure dates</li>
                <li>Balance due 7 days before check-in</li>
              </ol>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
