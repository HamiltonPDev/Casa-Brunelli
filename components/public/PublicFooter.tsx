"use client";
// components/public/PublicFooter.tsx
// Figma design: dark forest bg, 4-col, CTA band top, social icons

// ─── Imports ───────────────────────────────────────────────────
import Link from "next/link";
import { Instagram, Facebook, MapPin, Phone, Mail } from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";

// ─── Component ─────────────────────────────────────────────────
export function PublicFooter() {
  const year = new Date().getFullYear();

  return (
    <footer style={{ backgroundColor: "var(--dark-forest)", color: "white" }}>
      {/* ─── CTA Band ────────────────────────────────────────── */}
      <div style={{ backgroundColor: "var(--sage-variant)" }}>
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-12 text-center">
          <h2
            className="text-3xl mb-3 text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Ready to book your Tuscan escape?
          </h2>
          <p className="text-white/90 mb-6 text-lg">
            Experience the beauty of Tuscany at Casa Brunelli
          </p>
          <Link
            href="/availability"
            className="inline-flex px-8 py-3.5 rounded-lg font-semibold text-sm transition-all duration-200 hover:opacity-90 active:scale-95"
            style={{
              backgroundColor: "var(--light-terracotta)",
              color: "white",
            }}
          >
            Check Availability
          </Link>
        </div>
      </div>

      {/* ─── Main Footer ─────────────────────────────────────── */}
      <div
        className="border-t"
        style={{ borderColor: "rgba(139,157,131,0.3)" }}
      >
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-10">
            {/* Column 1 — Brand */}
            <div className="lg:col-span-1">
              <div className="mb-4 flex flex-col gap-1">
                <span
                  className="text-xs tracking-[0.25em] uppercase"
                  style={{ color: "var(--terracotta-gold)" }}
                >
                  Tuscany, Italy
                </span>
                <span
                  className="text-xl font-medium"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "var(--golden-wheat)",
                  }}
                >
                  Casa Brunelli
                </span>
              </div>
              <p
                className="text-sm mb-2"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                Your Tuscan countryside retreat
              </p>
              <p
                className="text-sm leading-relaxed mb-6"
                style={{ color: "rgba(232,232,232,0.8)" }}
              >
                Experience authentic Italian luxury in our meticulously restored
                18th-century villa in the heart of Tuscany.
              </p>
              {/* Social */}
              <div className="flex gap-4">
                {[
                  {
                    href: "https://instagram.com/casabrunelli",
                    Icon: Instagram,
                    label: "Instagram",
                  },
                  {
                    href: "https://facebook.com/casabrunelli",
                    Icon: Facebook,
                    label: "Facebook",
                  },
                  {
                    href: `mailto:${APP_CONFIG.contactEmail}`,
                    Icon: Mail,
                    label: "Email",
                  },
                ].map(({ href, Icon, label }) => (
                  <a
                    key={label}
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel={
                      href.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                    aria-label={label}
                    className="transition-all duration-300 hover:scale-110"
                    style={{ color: "white" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "var(--sage-green)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "white")
                    }
                  >
                    <Icon size={20} />
                  </a>
                ))}
              </div>
            </div>

            {/* Column 2 — Explore */}
            <div>
              <h3
                className="text-xs uppercase tracking-wider mb-4 font-semibold"
                style={{ color: "rgba(255,255,255,0.9)" }}
              >
                Explore
              </h3>
              <ul className="space-y-3">
                {[
                  { label: "Home", href: "/" },
                  { label: "Gallery", href: "/gallery" },
                  { label: "Availability", href: "/availability" },
                  { label: "Book a Stay", href: "/availability" },
                  { label: "Contact", href: "/contact" },
                ].map((link) => (
                  <li key={link.label + link.href}>
                    <Link
                      href={link.href}
                      className="text-sm transition-colors duration-300"
                      style={{ color: "white" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "var(--sage-green)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "white")
                      }
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3 — Information */}
            <div>
              <h3
                className="text-xs uppercase tracking-wider mb-4 font-semibold"
                style={{ color: "rgba(255,255,255,0.9)" }}
              >
                Information
              </h3>
              <ul className="space-y-3">
                {[
                  "About Casa Brunelli",
                  "House Rules",
                  "Cancellation Policy",
                  "Privacy Policy",
                  "Terms & Conditions",
                ].map((label) => (
                  <li key={label}>
                    <a
                      href="#"
                      className="text-sm transition-colors duration-300"
                      style={{ color: "white" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "var(--sage-green)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "white")
                      }
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4 — Contact */}
            <div>
              <h3
                className="text-xs uppercase tracking-wider mb-4 font-semibold"
                style={{ color: "rgba(255,255,255,0.9)" }}
              >
                Get in Touch
              </h3>
              <ul className="space-y-4">
                <li className="flex gap-3 items-start">
                  <MapPin
                    size={16}
                    className="mt-0.5 shrink-0"
                    style={{ color: "var(--sage-green)" }}
                  />
                  <span
                    className="text-sm leading-relaxed"
                    style={{ color: "rgba(232,232,232,0.8)" }}
                  >
                    Via della Collina 12
                    <br />
                    53100 Siena, Tuscany
                    <br />
                    Italy
                  </span>
                </li>
                <li className="flex gap-3 items-center">
                  <Phone
                    size={16}
                    className="shrink-0"
                    style={{ color: "var(--sage-green)" }}
                  />
                  <a
                    href="tel:+390577123456"
                    className="text-sm transition-colors duration-300 hover:opacity-70"
                    style={{ color: "white" }}
                  >
                    +39 0577 123456
                  </a>
                </li>
                <li className="flex gap-3 items-center">
                  <Mail
                    size={16}
                    className="shrink-0"
                    style={{ color: "var(--sage-green)" }}
                  />
                  <a
                    href={`mailto:${APP_CONFIG.contactEmail}`}
                    className="text-sm transition-colors duration-300 hover:opacity-70"
                    style={{ color: "white" }}
                  >
                    {APP_CONFIG.contactEmail}
                  </a>
                </li>
                <li
                  className="text-sm italic"
                  style={{ color: "rgba(232,232,232,0.8)" }}
                >
                  We respond within 24 hours
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Bottom bar ───────────────────────────────────────── */}
      <div className="border-t" style={{ borderColor: "rgba(74,95,78,0.6)" }}>
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-6">
          <div
            className="flex flex-col md:flex-row justify-between items-center gap-3 text-xs"
            style={{ color: "#a0a0a0" }}
          >
            <span>© {year} Casa Brunelli. All rights reserved.</span>
            <span className="hidden md:block">
              Designed by HPS PropTech &amp; Solutions
            </span>
            <span>
              Made with <span className="text-red-400">❤️</span> in Amsterdam
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
