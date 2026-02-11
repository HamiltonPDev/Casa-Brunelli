import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Casa Brunelli — Luxury Tuscan Villa",
};

export default function HomePage() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ backgroundColor: "var(--cream)" }}
    >
      {/* Wordmark */}
      <div className="flex flex-col items-center gap-2 mb-12">
        <p
          className="text-sm tracking-[0.3em] uppercase"
          style={{ color: "var(--terracotta-gold)", fontFamily: "var(--font-body)" }}
        >
          Tuscany, Italy
        </p>
        <h1
          className="text-5xl md:text-6xl text-center"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--dark-forest)",
            letterSpacing: "-0.02em",
          }}
        >
          Casa Brunelli
        </h1>
        <p
          className="text-base tracking-widest uppercase"
          style={{ color: "var(--muted-green-gray)", fontFamily: "var(--font-body)" }}
        >
          Luxury Villa Rental
        </p>
      </div>

      {/* Divider */}
      <div
        className="w-24 h-px mb-12"
        style={{ backgroundColor: "var(--terracotta-gold)" }}
      />

      {/* Navigation cards */}
      <nav className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg px-6">
        <Link
          href="/availability"
          className="group flex flex-col items-center gap-2 p-6 rounded-xl border transition-all duration-300 hover:shadow-lg"
          style={{
            backgroundColor: "var(--white)",
            borderColor: "var(--soft-beige)",
          }}
        >
          <span
            className="text-2xl font-semibold"
            style={{ fontFamily: "var(--font-display)", color: "var(--forest-green)" }}
          >
            Check Availability
          </span>
          <span className="text-sm" style={{ color: "var(--muted-green-gray)" }}>
            View dates &amp; pricing
          </span>
        </Link>

        <Link
          href="/admin"
          className="group flex flex-col items-center gap-2 p-6 rounded-xl border transition-all duration-300 hover:shadow-lg"
          style={{
            backgroundColor: "var(--dark-forest)",
            borderColor: "var(--dark-forest)",
          }}
        >
          <span
            className="text-2xl font-semibold"
            style={{ fontFamily: "var(--font-display)", color: "var(--golden-wheat)" }}
          >
            Admin Dashboard
          </span>
          <span className="text-sm" style={{ color: "var(--sage-variant)" }}>
            Manage bookings
          </span>
        </Link>
      </nav>

      {/* Phase indicator */}
      <p
        className="mt-16 text-xs tracking-widest uppercase"
        style={{ color: "var(--warm-gray)" }}
      >
        Phase A — Foundation · In Progress
      </p>
    </main>
  );
}
