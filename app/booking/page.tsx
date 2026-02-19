// app/booking/page.tsx
// Server Component — reads searchParams, validates dates, renders BookingForm

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PublicNav } from "@/components/features/public/PublicNav";
import { PublicFooter } from "@/components/features/public/PublicFooter";
import { BookingForm } from "@/components/features/public/BookingForm";

export const metadata: Metadata = {
  title: "Request to Book",
  description:
    "Complete your booking request for Casa Brunelli. No payment required now — we confirm within 24 hours.",
};

// ─── Helpers ───────────────────────────────────────────────────

function isValidDate(raw: string | undefined): raw is string {
  if (!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) return false;
  const d = new Date(raw + "T00:00:00");
  return !isNaN(d.getTime());
}

function calcNights(checkIn: string, checkOut: string): number {
  const msPerDay = 86400000;
  return Math.round(
    (new Date(checkOut + "T00:00:00").getTime() -
      new Date(checkIn + "T00:00:00").getTime()) /
      msPerDay
  );
}

// ─── Page ──────────────────────────────────────────────────────

interface BookingPageProps {
  searchParams: Promise<{ checkIn?: string; checkOut?: string; guests?: string }>;
}

export default async function BookingPage({ searchParams }: BookingPageProps) {
  const params = await searchParams;
  const { checkIn, checkOut } = params;
  const guests = Math.min(8, Math.max(1, Number(params.guests ?? 2) || 2));

  // If dates are missing or invalid, send back to calendar
  if (!isValidDate(checkIn) || !isValidDate(checkOut)) {
    redirect("/availability");
  }

  const nights = calcNights(checkIn, checkOut);
  if (nights <= 0) redirect("/availability");

  const checkInLabel = new Date(checkIn + "T00:00:00").toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });
  const checkOutLabel = new Date(checkOut + "T00:00:00").toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <>
      <PublicNav />

      <main className="min-h-screen pt-16 md:pt-20" style={{ backgroundColor: "#F5F3EF" }}>
        {/* ─── Hero ────────────────────────────────────────────── */}
        <div
          className="border-b"
          style={{
            background: "linear-gradient(to bottom, white, #F5F3EF)",
            borderColor: "rgba(139,157,131,0.1)",
          }}
        >
          <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-8 lg:py-12">
            <p
              className="text-xs tracking-[0.3em] uppercase font-semibold mb-3"
              style={{ color: "#C0AF7E" }}
            >
              Casa Brunelli · Tuscany
            </p>
            <h1 className="font-serif text-3xl lg:text-4xl mb-2" style={{ color: "#2D3A2E" }}>
              Request to Book
            </h1>
            <p className="text-sm" style={{ color: "rgba(61,82,67,0.7)" }}>
              {nights} night{nights !== 1 ? "s" : ""} · {checkInLabel} – {checkOutLabel}
            </p>
          </div>
        </div>

        {/* ─── Form ────────────────────────────────────────────── */}
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-10">
          <BookingForm
            checkIn={checkIn}
            checkOut={checkOut}
            nights={nights}
            guests={guests}
          />
        </div>
      </main>

      <PublicFooter />
    </>
  );
}
