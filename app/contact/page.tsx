// app/contact/page.tsx
// Server Component — Contact page with Figma design

import type { Metadata } from "next";
import Link from "next/link";
import { PublicNav } from "@/components/public/PublicNav";
import { PublicFooter } from "@/components/public/PublicFooter";
import { ContactForm } from "@/components/public/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Casa Brunelli. Questions about availability, pricing, or your stay — we reply within 24 hours.",
};

export default function ContactPage() {
  return (
    <>
      <PublicNav />

      <main style={{ backgroundColor: "#F5F3EF" }}>
        {/* ─── Hero ──────────────────────────────────────────── */}
        <div
          className="border-b"
          style={{
            background: "linear-gradient(to bottom, white, #F5F3EF)",
            borderColor: "rgba(139,157,131,0.1)",
          }}
        >
          <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-12 lg:py-16">
            <h1
              className="font-serif text-4xl lg:text-5xl mb-4"
              style={{ color: "#2D3A2E" }}
            >
              Get in Touch
            </h1>
            <p
              className="text-lg max-w-2xl"
              style={{ color: "rgba(61,82,67,0.8)" }}
            >
              Have a question about Casa Brunelli? We&apos;d love to hear from
              you. We reply within 24 hours.
            </p>
          </div>
        </div>

        {/* ─── Main Content ──────────────────────────────────── */}
        <section className="max-w-[1400px] mx-auto px-6 lg:px-8 py-12 lg:py-16">
          <ContactForm />
        </section>

        {/* ─── Footer CTA ────────────────────────────────────── */}
        <div
          className="border-t"
          style={{
            background: "linear-gradient(to bottom, #F5F3EF, white)",
            borderColor: "rgba(139,157,131,0.1)",
          }}
        >
          <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-16 lg:py-24">
            <div className="max-w-3xl mx-auto text-center">
              <h2
                className="font-serif text-3xl lg:text-4xl mb-4"
                style={{ color: "#2D3A2E" }}
              >
                Ready to Book Your Tuscan Escape?
              </h2>
              <p
                className="text-lg mb-8"
                style={{ color: "rgba(61,82,67,0.8)" }}
              >
                Check our availability calendar and reserve your perfect dates
                at Casa Brunelli.
              </p>
              <Link
                href="/availability"
                className="inline-flex items-center px-8 py-4 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ backgroundColor: "#2D3A2E" }}
              >
                Check Availability
              </Link>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </>
  );
}
