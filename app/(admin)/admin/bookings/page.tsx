import type { Metadata } from "next";
import { BookingsClient } from "@/components/features/admin/BookingsClient";

export const metadata: Metadata = { title: "Bookings" };
export const dynamic = "force-dynamic";

export default function BookingsPage() {
  return <BookingsClient />;
}
