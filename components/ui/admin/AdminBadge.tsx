import { cn } from "@/lib/utils";
import type {
  BookingStatus,
  MessageStatus,
  PaymentStatus,
} from "@/lib/constants";
import type { ReactNode } from "react";

interface AdminBadgeProps {
  variant: "status" | "payment" | "message" | "success" | "default";
  status?: BookingStatus | MessageStatus | PaymentStatus | string;
  size?: "sm" | "md";
  children?: ReactNode;
}

// que es el admin badge? Es un componente reutilizable para mostrar el estado de una reserva, pago o mensaje en el panel de administración.
// Tiene diferentes variantes para cada tipo de estado, y estilos predefinidos para cada posible valor de estado. También permite
// personalizar el texto mostrado a través de los children.

const STATUS_STYLES: Record<string, string> = {
  // Booking status
  PENDING: "bg-gray-100 text-gray-700 border-gray-200",
  CONFIRMED:
    "bg-status-confirmed-bg text-status-confirmed border-status-confirmed/20",
  CANCELLED:
    "bg-status-cancelled-bg text-status-cancelled border-status-cancelled/20",
  COMPLETED:
    "bg-status-completed-bg text-status-completed border-status-completed/20",
  // Payment status
  FAILED:
    "bg-status-cancelled-bg text-status-cancelled border-status-cancelled/20",
  REFUNDED: "bg-purple-50 text-purple-700 border-purple-200",
  // Message status
  UNREAD:
    "bg-status-completed-bg text-status-completed border-status-completed/20",
  READ: "bg-gray-100 text-gray-600 border-gray-200",
  REPLIED:
    "bg-status-confirmed-bg text-status-confirmed border-status-confirmed/20",
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

export function AdminBadge({
  variant,
  status,
  size = "md",
  children,
}: AdminBadgeProps) {
  // Plain success / default variants (no status needed)
  if (variant === "success") {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-md border font-medium",
          "bg-status-confirmed-bg text-status-confirmed border-status-confirmed/20",
          size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1"
        )}
      >
        {children}
      </span>
    );
  }

  if (variant === "default") {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-md border font-medium",
          "bg-gray-100 text-gray-600 border-gray-200",
          size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1"
        )}
      >
        {children}
      </span>
    );
  }

  const key = status ?? "";
  const styles =
    STATUS_STYLES[key] ?? "bg-gray-100 text-gray-700 border-gray-200";
  const label = children ?? STATUS_LABELS[key] ?? key;

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
