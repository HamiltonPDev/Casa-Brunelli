// app/availability/page.tsx
// Server Component — wraps the client-side AvailabilityCalendar

import type { Metadata } from "next";
import { PublicNav } from "@/components/features/public/PublicNav";
import { PublicFooter } from "@/components/features/public/PublicFooter";
import { AvailabilityCalendar } from "@/components/features/public/AvailabilityCalendar";

export const metadata: Metadata = {
  title: "Availability & Rates",
  description:
    "Check availability and nightly rates for Casa Brunelli. Select your dates and request to book directly — no OTA fees.",
};

export default function AvailabilityPage() {
  return (
    <>
      <PublicNav />

      <main className="min-h-screen pt-16 md:pt-20" style={{ backgroundColor: "#F5F3EF" }}>
        {/* ─── Hero ──────────────────────────────────────────── */}
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
              Check Availability
            </h1>
            <p className="text-base max-w-xl" style={{ color: "rgba(61,82,67,0.8)" }}>
              Select your desired dates to reserve your Tuscan escape. Rates
              include all fees — no hidden charges.
            </p>
          </div>
        </div>

        {/* ─── Calendar (handles its own padding/grid) ───────── */}
        <AvailabilityCalendar />
      </main>

      <PublicFooter />
    </>
  );
}
