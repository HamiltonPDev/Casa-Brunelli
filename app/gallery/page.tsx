// app/gallery/page.tsx
// Server Component — Photo Gallery page

import type { Metadata } from "next";
import { PublicNav } from "@/components/features/public/PublicNav";
import { PublicFooter } from "@/components/features/public/PublicFooter";
import { GalleryClient } from "@/components/features/public/GalleryClient";

export const metadata: Metadata = {
  title: "Photo Gallery",
  description:
    "Explore Casa Brunelli through our photo gallery — exterior views, interior spaces, outdoor living areas, and architectural details.",
};

export default function GalleryPage() {
  return (
    <>
      <PublicNav />

      <main
        id="main-content"
        className="min-h-screen pt-16 md:pt-20"
        style={{ backgroundColor: "#F5F3EF" }}
      >
        {/* ─── Hero ──────────────────────────────────────────── */}
        <div
          className="border-b"
          style={{
            background: "linear-gradient(to bottom, #2D3A2E, #3D5243)",
            borderColor: "rgba(139,157,131,0.2)",
          }}
        >
          <div className="max-w-350 mx-auto px-6 lg:px-8 py-14 lg:py-20">
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
              ].map(({ value, label }) => (
                <div key={label}>
                  <p
                    className="font-serif text-2xl"
                    style={{ color: "#F5DEB3" }}
                  >
                    {value}
                  </p>
                  <p
                    className="text-xs uppercase tracking-wider"
                    style={{ color: "#8B9D83" }}
                  >
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Gallery (client, handles categories + lightbox) ── */}
        <GalleryClient />

        {/* Footer CTA removed — PublicFooter already has a CTA band */}
      </main>

      <PublicFooter />
    </>
  );
}
