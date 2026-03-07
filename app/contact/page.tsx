// app/contact/page.tsx
// Server Component — Contact page with Figma design

import type { Metadata } from "next";
import { PublicNav } from "@/components/features/public/PublicNav";
import { PublicFooter } from "@/components/features/public/PublicFooter";
import { ContactForm } from "@/components/features/public/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Casa Brunelli. Questions about availability, pricing, or your stay — we reply within 24 hours.",
};

export default function ContactPage() {
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
            background: "linear-gradient(to bottom, white, #F5F3EF)",
            borderColor: "rgba(139,157,131,0.1)",
          }}
        >
          <div className="max-w-350 mx-auto px-6 lg:px-8 py-12 lg:py-16">
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
        <section className="max-w-350 mx-auto px-6 lg:px-8 py-12 lg:py-16">
          <ContactForm />
        </section>

        {/* Footer CTA removed — PublicFooter already has a CTA band */}
      </main>

      <PublicFooter />
    </>
  );
}
