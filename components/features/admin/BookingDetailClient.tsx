"use client";

// ─── Imports ───────────────────────────────────────────────────
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Mail,
  CheckCircle,
  AlertCircle,
  Info,
  RefreshCcw,
} from "lucide-react";
import { AdminCard } from "@/components/ui/admin/AdminCard";
import { AdminBadge } from "@/components/ui/admin/AdminBadge";
import { AdminButton } from "@/components/ui/admin/AdminButton";
import { formatCurrency } from "@/lib/utils";
import { updateBooking } from "@/lib/services/bookings";

// ─── Types ─────────────────────────────────────────────────────
interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  type: string;
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
  specialRequests?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
  payments: Payment[];
  guestUser?: { id: string; name: string; totalBookings: number };
}

interface BookingDetailClientProps {
  booking: BookingDetail;
  adminName: string;
}

// ─── Helpers ───────────────────────────────────────────────────
function TimelineIcon({ type }: { type: "success" | "error" | "info" }) {
  if (type === "success")
    return <CheckCircle className="w-5 h-5 text-green-700" />;
  if (type === "error") return <AlertCircle className="w-5 h-5 text-red-700" />;
  return <Info className="w-5 h-5 text-blue-700" />;
}

function paymentTypeIcon(type: string): "success" | "error" | "info" {
  if (type === "COMPLETED") return "success";
  if (type === "FAILED" || type === "REFUNDED") return "error";
  return "info";
}

// ─── Component ─────────────────────────────────────────────────
export function BookingDetailClient({
  booking,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- reserved for future "approved by" display
  adminName,
}: BookingDetailClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [depositPaid, setDepositPaid] = useState(booking.depositPaid);
  const [balancePaid] = useState(booking.balancePaid);
  const [status, setStatus] = useState(booking.status);

  async function handleMarkDepositPaid() {
    setLoading("deposit");
    const result = await updateBooking(booking.id, { depositPaid: true });
    if (result.success) {
      setDepositPaid(true);
      toast.success("Deposit marked as paid");
    } else {
      toast.error(result.error);
    }
    setLoading(null);
  }

  async function handleCancelBooking() {
    setLoading("cancel");
    const result = await updateBooking(booking.id, { status: "CANCELLED" });
    if (result.success) {
      setStatus("CANCELLED");
      toast.success("Booking cancelled");
    } else {
      toast.error(result.error);
    }
    setLoading(null);
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
    ...booking.payments.map((p) => ({
      type: paymentTypeIcon(p.status),
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
          {!depositPaid && status === "CONFIRMED" && (
            <AdminButton
              variant="secondary"
              size="sm"
              loading={loading === "deposit"}
              icon={<CheckCircle className="w-4 h-4" />}
              onClick={handleMarkDepositPaid}
            >
              Mark Deposit Paid
            </AdminButton>
          )}
          <AdminButton
            variant="secondary"
            size="sm"
            icon={<RefreshCcw className="w-4 h-4" />}
          >
            Refund
          </AdminButton>
          <AdminButton
            variant="primary"
            size="sm"
            icon={<Mail className="w-4 h-4" />}
            onClick={() => {
              window.location.href = `mailto:${booking.guestEmail}`;
            }}
          >
            Email Guest
          </AdminButton>
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
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Deposit (30%)</span>
                  <div className="flex items-center gap-2">
                    <AdminBadge
                      variant={depositPaid ? "success" : "default"}
                      size="sm"
                    >
                      {depositPaid ? "Paid" : "Pending"}
                    </AdminBadge>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(booking.depositAmount)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Balance (70%)</span>
                  <div className="flex items-center gap-2">
                    <AdminBadge
                      variant={balancePaid ? "success" : "default"}
                      size="sm"
                    >
                      {balancePaid ? "Paid" : "Pending"}
                    </AdminBadge>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(booking.balanceAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
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
