// app/gallery/page.tsx
// Server Component — Photo Gallery page

import type { Metadata } from "next";
import Link from "next/link";
import { PublicNav } from "@/components/public/PublicNav";
import { PublicFooter } from "@/components/public/PublicFooter";
import { GalleryClient } from "@/components/public/GalleryClient";

export const metadata: Metadata = {
  title: "Photo Gallery",
  description:
    "Explore Casa Brunelli through our photo gallery — exterior views, interior spaces, outdoor living areas, and architectural details.",
};

export default function GalleryPage() {
  return (
    <>
      <PublicNav />

      <main style={{ backgroundColor: "#F5F3EF" }}>
        {/* ─── Hero ──────────────────────────────────────────── */}
        <div
          className="border-b"
          style={{
            background: "linear-gradient(to bottom, #2D3A2E, #3D5243)",
            borderColor: "rgba(139,157,131,0.2)",
          }}
        >
          <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-14 lg:py-20">
            {/* Eyebrow */}
            <p
              className="text-xs tracking-[0.4em] uppercase font-semibold mb-4"
              style={{ color: "#C0AF7E" }}
            >
              Casa Brunelli
            </p>

            {/* Title */}
            <h1
              className="font-serif text-4xl lg:text-6xl mb-4 leading-tight"
              style={{ color: "#F5DEB3", letterSpacing: "-0.02em" }}
            >
              Photo Gallery
            </h1>

            <p className="text-lg max-w-2xl mb-8" style={{ color: "#8B9D83" }}>
              Explore every detail of the villa — from the cypress-lined
              exterior to the intimate interiors and sweeping Tuscan views.
            </p>

            {/* Stats */}
            <div className="flex items-center gap-8">
              {[
                { value: "14", label: "Photos" },
                { value: "4", label: "Categories" },
                { value: "360°", label: "Villa Tour" },
              ].map(({ value, label }) => (
                <div key={label}>
                  <p
                    className="font-serif text-2xl"
                    style={{ color: "#F5DEB3" }}
                  >
                    {value}
                  </p>
                  <p className="text-xs uppercase tracking-wider" style={{ color: "#8B9D83" }}>
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Gallery (client, handles categories + lightbox) ── */}
        <GalleryClient />

        {/* ─── Footer CTA ─────────────────────────────────────── */}
        <div
          className="border-t"
          style={{
            background: "linear-gradient(to bottom, #F5F3EF, white)",
            borderColor: "rgba(139,157,131,0.1)",
          }}
        >
          <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-16 lg:py-20 text-center">
            <h2
              className="font-serif text-3xl mb-4"
              style={{ color: "#2D3A2E" }}
            >
              Ready to Experience It in Person?
            </h2>
            <p
              className="text-base mb-8 max-w-md mx-auto"
              style={{ color: "rgba(61,82,67,0.7)" }}
            >
              Check availability and book your stay directly — no commissions,
              no hidden fees.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link
                href="/availability"
                className="inline-flex items-center px-8 py-4 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ backgroundColor: "#2D3A2E" }}
              >
                Check Availability
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center px-8 py-4 rounded-xl text-sm font-semibold border transition-all hover:opacity-80"
                style={{
                  borderColor: "rgba(139,157,131,0.3)",
                  color: "rgba(61,82,67,0.7)",
                }}
              >
                Ask a Question
              </Link>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </>
  );
}
