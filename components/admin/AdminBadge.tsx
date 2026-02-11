import { cn } from "@/lib/utils";
import type { BookingStatus, MessageStatus, PaymentStatus } from "@/lib/constants";

interface AdminBadgeProps {
  variant: "status" | "payment" | "message";
  status: BookingStatus | MessageStatus | PaymentStatus;
  size?: "sm" | "md";
}

const STATUS_STYLES: Record<string, string> = {
  // Booking status
  PENDING: "bg-gray-100 text-gray-700 border-gray-200",
  CONFIRMED: "bg-[#E9F5EC] text-[#2E7D32] border-[#2E7D32]/20",
  CANCELLED: "bg-red-50 text-[#C62828] border-[#C62828]/20",
  COMPLETED: "bg-blue-50 text-[#1565C0] border-[#1565C0]/20",
  // Payment status
  FAILED: "bg-red-50 text-[#C62828] border-[#C62828]/20",
  REFUNDED: "bg-purple-50 text-purple-700 border-purple-200",
  // Message status
  UNREAD: "bg-blue-50 text-[#1565C0] border-[#1565C0]/20",
  READ: "bg-gray-100 text-gray-600 border-gray-200",
  REPLIED: "bg-[#E9F5EC] text-[#2E7D32] border-[#2E7D32]/20",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
  FAILED: "Failed",
  REFUNDED: "Refunded",
  UNREAD: "Unread",
  READ: "Read",
  REPLIED: "Replied",
};

export function AdminBadge({ status, size = "md" }: AdminBadgeProps) {
  const styles = STATUS_STYLES[status] ?? "bg-gray-100 text-gray-700 border-gray-200";
  const label = STATUS_LABELS[status] ?? status;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border font-medium",
        size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1",
        styles
      )}
    >
      {label}
    </span>
  );
}
