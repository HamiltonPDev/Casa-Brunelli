"use client";

// ─── Imports ───────────────────────────────────────────────────
import { useSyncExternalStore, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Info,
  CreditCard,
  Copy,
  Clock,
  Send,
  Ban,
} from "lucide-react";
import { AdminCard } from "@/components/ui/admin/AdminCard";
import { AdminBadge } from "@/components/ui/admin/AdminBadge";
import { AdminButton } from "@/components/ui/admin/AdminButton";
import { formatCurrency } from "@/lib/utils";
import { updateBooking } from "@/lib/services/bookings";
import { createPaymentSession } from "@/lib/services/payments";
import { PAYMENT_TYPE, PAYMENT_STATUS } from "@/lib/constants";
import {
  saveCheckoutUrl,
  getCheckoutUrl,
} from "@/lib/checkout-urls";
import type { PaymentStatus, PaymentType } from "@/types";

// ─── Types ─────────────────────────────────────────────────────

/** Serialized PaymentTransaction — dates as ISO strings for client transport */
interface SerializedPayment {
  id: string;
  stripePaymentId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  type: PaymentType;
  processedAt?: string;
  createdAt: string;
}

interface BookingDetail {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  checkIn: string;
  checkOut: string;
  numberOfNights: number;
  guestCount: number;
  status: string;
  totalPrice: number;
  depositAmount: number;
  balanceAmount: number;
  depositPaid: boolean;
  balancePaid: boolean;
  depositSessionId?: string;
  balanceSessionId?: string;
  specialRequests?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
  payments: SerializedPayment[];
  guestUser?: { id: string; name: string; totalBookings: number };
}

interface BookingDetailClientProps {
  booking: BookingDetail;
}

// ─── Helpers ───────────────────────────────────────────────────
function TimelineIcon({ type }: { type: "success" | "error" | "info" }) {
  if (type === "success")
    return <CheckCircle className="w-5 h-5 text-green-700" />;
  if (type === "error") return <AlertCircle className="w-5 h-5 text-red-700" />;
  return <Info className="w-5 h-5 text-blue-700" />;
}

function paymentStatusIcon(status: string): "success" | "error" | "info" {
  if (status === PAYMENT_STATUS.COMPLETED) return "success";
  if (status === PAYMENT_STATUS.FAILED || status === PAYMENT_STATUS.REFUNDED)
    return "error";
  return "info";
}

/** Determine payment badge state from paid flag + session ID existence */
function getPaymentBadge(
  paid: boolean,
  sessionId?: string,
): {
  label: string;
  variant: "success" | "default" | "status";
  status?: string;
} {
  if (paid) return { label: "Paid", variant: "success" };
  if (sessionId)
    return { label: "Link Sent", variant: "status", status: "UNREAD" };
  return { label: "Pending", variant: "default" };
}

/** Copy text to clipboard with toast feedback */
async function copyToClipboard(text: string, label: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  } catch {
    toast.error("Failed to copy to clipboard");
  }
}

// ─── Component ─────────────────────────────────────────────────
export function BookingDetailClient({
  booking,
}: Readonly<BookingDetailClientProps>) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState<string | null>(null);
  const [status, setStatus] = useState(booking.status);
  // Optimistic state — session IDs update immediately after creating a payment link,
  // while paid flags and payments refresh via RSC on next navigation
  const [depositSessionId, setDepositSessionId] = useState(
    booking.depositSessionId,
  );
  const [balanceSessionId, setBalanceSessionId] = useState(
    booking.balanceSessionId,
  );
  const { depositPaid, balancePaid, payments } = booking;

  // Cached checkout URLs — allows re-copying a previously sent link.
  // useSyncExternalStore reads localStorage without hydration mismatch:
  // server snapshot returns null, client reads the real value after hydration.
  const noopSubscribe = (): (() => void) => () => {};
  const depositUrl = useSyncExternalStore(
    noopSubscribe,
    () => getCheckoutUrl(booking.id, PAYMENT_TYPE.DEPOSIT),
    () => null,
  );
  const balanceUrl = useSyncExternalStore(
    noopSubscribe,
    () => getCheckoutUrl(booking.id, PAYMENT_TYPE.BALANCE),
    () => null,
  );

  // ─── Handlers ──────────────────────────────────────────────
  function handleSendPaymentLink(type: PaymentType): void {
    startTransition(async () => {
      setLoading(type);
      const result = await createPaymentSession(booking.id, type);
      if (result.success) {
        const { url } = result.data;
        // Cache URL in localStorage for re-copy (24h TTL) — must happen
        // BEFORE setting session ID so the next render reads it via useSyncExternalStore
        saveCheckoutUrl(booking.id, type, url);
        // Update local state — triggers re-render, useSyncExternalStore picks up the cached URL
        if (type === PAYMENT_TYPE.DEPOSIT) {
          setDepositSessionId(result.data.sessionId);
        } else {
          setBalanceSessionId(result.data.sessionId);
        }
        // Copy URL to clipboard for admin to send to guest
        await copyToClipboard(url, "Payment link");
        toast.success("Payment link created and copied! Send it to the guest.");
      } else {
        toast.error(result.error);
      }
      setLoading(null);
    });
  }

  function handleRecopyLink(type: PaymentType): void {
    const url =
      type === PAYMENT_TYPE.DEPOSIT ? depositUrl : balanceUrl;
    if (url) {
      copyToClipboard(url, "Payment link");
    }
  }

  function handleCancelBooking(): void {
    startTransition(async () => {
      setLoading("cancel");
      const result = await updateBooking(booking.id, { status: "CANCELLED" });
      if (result.success) {
        setStatus("CANCELLED");
        toast.success("Booking cancelled");
      } else {
        toast.error(result.error);
      }
      setLoading(null);
    });
  }

  // Build timeline from payments + booking events
  const timeline = [
    {
      type: "info" as const,
      label: "Booking Created",
      description: `Booking request submitted by ${booking.guestName}`,
      timestamp: new Date(booking.createdAt).toLocaleString("en-GB"),
    },
    ...(booking.approvedAt
      ? [
          {
            type: "success" as const,
            label: "Booking Confirmed",
            description: `Approved by ${booking.approvedBy ?? "Admin"}`,
            timestamp: new Date(booking.approvedAt).toLocaleString("en-GB"),
          },
        ]
      : []),
    ...payments.map((p) => ({
      type: paymentStatusIcon(p.status),
      label: `${p.type.charAt(0) + p.type.slice(1).toLowerCase()} Payment`,
      description: `${formatCurrency(p.amount)} — ${p.status.toLowerCase()}`,
      timestamp: new Date(p.processedAt ?? p.createdAt).toLocaleString("en-GB"),
    })),
    ...(status === "CANCELLED"
      ? [
          {
            type: "error" as const,
            label: "Booking Cancelled",
            description: "Booking was cancelled",
            timestamp: new Date(booking.updatedAt).toLocaleString("en-GB"),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/admin/bookings")}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-gray-900">
              {booking.guestName}
            </h1>
            <AdminBadge variant="status" status={status} />
          </div>
          <p className="text-sm text-gray-500 mt-1">Booking ID: {booking.id}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* ── Deposit Button ── */}
          {!depositPaid && status !== "CANCELLED" && (
            (() => {
              const linkSent = !!depositSessionId;
              const canRecopy = linkSent && !!depositUrl;
              return (
                <AdminButton
                  variant={linkSent ? "secondary" : "primary"}
                  size="sm"
                  loading={loading === PAYMENT_TYPE.DEPOSIT}
                  disabled={isPending || (linkSent && !canRecopy)}
                  icon={
                    linkSent ? (
                      canRecopy ? <Copy className="w-4 h-4" /> : <Send className="w-4 h-4" />
                    ) : (
                      <CreditCard className="w-4 h-4" />
                    )
                  }
                  onClick={() =>
                    canRecopy
                      ? handleRecopyLink(PAYMENT_TYPE.DEPOSIT)
                      : handleSendPaymentLink(PAYMENT_TYPE.DEPOSIT)
                  }
                >
                  {linkSent
                    ? canRecopy
                      ? "Re-copy Deposit Link"
                      : "Deposit Link Sent"
                    : "Send Deposit Link"}
                </AdminButton>
              );
            })()
          )}
          {/* ── Balance Button ── */}
          {!balancePaid && status !== "CANCELLED" && (
            (() => {
              const linkSent = !!balanceSessionId;
              const canRecopy = linkSent && !!balanceUrl;
              // Balance is locked until deposit is paid
              if (!depositPaid) {
                return (
                  <AdminButton
                    variant="ghost"
                    size="sm"
                    disabled
                    icon={<Ban className="w-4 h-4" />}
                    className="cursor-not-allowed"
                  >
                    Pay Deposit First
                  </AdminButton>
                );
              }
              return (
                <AdminButton
                  variant={linkSent ? "secondary" : "primary"}
                  size="sm"
                  loading={loading === PAYMENT_TYPE.BALANCE}
                  disabled={isPending || (linkSent && !canRecopy)}
                  icon={
                    linkSent ? (
                      canRecopy ? <Copy className="w-4 h-4" /> : <Send className="w-4 h-4" />
                    ) : (
                      <CreditCard className="w-4 h-4" />
                    )
                  }
                  onClick={() =>
                    canRecopy
                      ? handleRecopyLink(PAYMENT_TYPE.BALANCE)
                      : handleSendPaymentLink(PAYMENT_TYPE.BALANCE)
                  }
                >
                  {linkSent
                    ? canRecopy
                      ? "Re-copy Balance Link"
                      : "Balance Link Sent"
                    : "Send Balance Link"}
                </AdminButton>
              );
            })()
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left col */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stay Details */}
          <AdminCard title="Stay Details">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Check-in</p>
                <p className="font-medium text-gray-900">
                  {new Date(booking.checkIn).toLocaleDateString("en-GB", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Check-out</p>
                <p className="font-medium text-gray-900">
                  {new Date(booking.checkOut).toLocaleDateString("en-GB", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Nights</p>
                <p className="font-medium text-gray-900">
                  {booking.numberOfNights} nights
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Guests</p>
                <p className="font-medium text-gray-900">
                  {booking.guestCount} guests
                </p>
              </div>
            </div>
            {booking.specialRequests && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-2">Special Requests</p>
                <p className="text-gray-900">{booking.specialRequests}</p>
              </div>
            )}
          </AdminCard>

          {/* Price Breakdown */}
          <AdminCard title="Price Breakdown">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">
                  Subtotal ({booking.numberOfNights} nights)
                </span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(booking.totalPrice)}
                </span>
              </div>
              <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(booking.totalPrice)}
                </span>
              </div>
              <div className="pt-4 border-t border-gray-200 space-y-3">
                {(() => {
                  const depositBadge = getPaymentBadge(
                    depositPaid,
                    depositSessionId,
                  );
                  return (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Deposit (30%)</span>
                      <div className="flex items-center gap-2">
                        <AdminBadge
                          variant={depositBadge.variant}
                          status={depositBadge.status}
                          size="sm"
                        >
                          {depositBadge.label}
                        </AdminBadge>
                        <span className="font-medium text-gray-900">
                          {formatCurrency(booking.depositAmount)}
                        </span>
                      </div>
                    </div>
                  );
                })()}
                {(() => {
                  const balanceBadge = getPaymentBadge(
                    balancePaid,
                    balanceSessionId,
                  );
                  return (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Balance (70%)</span>
                      <div className="flex items-center gap-2">
                        <AdminBadge
                          variant={balanceBadge.variant}
                          status={balanceBadge.status}
                          size="sm"
                        >
                          {balanceBadge.label}
                        </AdminBadge>
                        <span className="font-medium text-gray-900">
                          {formatCurrency(booking.balanceAmount)}
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </AdminCard>

          {/* Payment History */}
          <AdminCard
            title="Payment History"
            subtitle="Stripe transaction records"
          >
            {payments.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">
                  No payment transactions yet
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {payments.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="shrink-0 w-8 h-8 rounded-full bg-white flex items-center justify-center border border-gray-200">
                        {p.status === PAYMENT_STATUS.COMPLETED ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : p.status === PAYMENT_STATUS.FAILED ||
                          p.status === PAYMENT_STATUS.REFUNDED ? (
                          <AlertCircle className="w-4 h-4 text-red-600" />
                        ) : (
                          <Clock className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {p.type === PAYMENT_TYPE.DEPOSIT
                            ? "Deposit (30%)"
                            : p.type === PAYMENT_TYPE.BALANCE
                              ? "Balance (70%)"
                              : "Refund"}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-gray-500">
                            {new Date(
                              p.processedAt ?? p.createdAt,
                            ).toLocaleString("en-GB")}
                          </p>
                          {p.stripePaymentId && (
                            <button
                              onClick={() =>
                                copyToClipboard(p.stripePaymentId, "Stripe ID")
                              }
                              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                              title={p.stripePaymentId}
                            >
                              <span className="font-mono">
                                {p.stripePaymentId.slice(0, 14)}…
                              </span>
                              <Copy className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <AdminBadge
                        variant="status"
                        status={p.status}
                        size="sm"
                      />
                      <span className="font-medium text-gray-900 tabular-nums">
                        {formatCurrency(p.amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AdminCard>

          {/* Guest Info */}
          <AdminCard title="Guest Information">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Name</p>
                <p className="font-medium text-gray-900">{booking.guestName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Email</p>
                <p className="font-medium text-gray-900">
                  {booking.guestEmail}
                </p>
              </div>
              {booking.guestPhone && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Phone</p>
                  <p className="font-medium text-gray-900">
                    {booking.guestPhone}
                  </p>
                </div>
              )}
              {booking.guestUser && (
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Repeat Guest</p>
                  <p className="font-medium text-gray-900">
                    {booking.guestUser.totalBookings} total bookings
                  </p>
                </div>
              )}
            </div>
          </AdminCard>
        </div>

        {/* Right col — Timeline */}
        <div>
          <AdminCard title="Timeline" subtitle="Activity history">
            <div className="space-y-6">
              {timeline.map((event, i) => (
                <div key={i} className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <TimelineIcon type={event.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 mb-0.5">
                      {event.label}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      {event.description}
                    </p>
                    <p className="text-xs text-gray-500">{event.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </AdminCard>
        </div>
      </div>

      {/* Danger Zone */}
      {status !== "CANCELLED" && (
        <AdminCard title="Danger Zone">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 mb-1">Cancel Booking</p>
              <p className="text-sm text-gray-500">
                This action cannot be undone. The guest will be notified.
              </p>
            </div>
            <AdminButton
              variant="danger"
              loading={loading === "cancel"}
              onClick={handleCancelBooking}
            >
              Cancel Booking
            </AdminButton>
          </div>
        </AdminCard>
      )}
    </div>
  );
}
