"use client";

// ─── Imports ───────────────────────────────────────────────────
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────
interface NavItem {
  label: string;
  href: string;
}

interface PublicNavProps {
  /** When true, nav starts transparent and fades to white on scroll (hero pages) */
  transparent?: boolean;
}

// ─── Constants ─────────────────────────────────────────────────
const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
] as const;

// ─── Component ─────────────────────────────────────────────────
export function PublicNav({ transparent = false }: PublicNavProps) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 40);
    }
    // Trigger immediately in case page is already scrolled
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // On transparent mode: start clear, become white on scroll
  // On solid mode: always white
  const isTransparentMode = transparent && !isScrolled;
  const isSolidWhite = !transparent || isScrolled;

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-200 transition-all duration-500",
        isSolidWhite ? "shadow-sm border-b" : "border-b border-transparent"
      )}
      style={{
        backgroundColor: isSolidWhite ? "white" : "transparent",
        borderColor: isSolidWhite ? "rgba(139,157,131,0.2)" : "transparent",
      }}
    >
      <div className="max-w-350 mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* ─── Logo ──────────────────────────────────────────── */}
          <Link
            href="/"
            className="flex flex-col leading-none group"
            aria-label="Casa Brunelli"
          >
            <span
              className="text-[10px] tracking-[0.3em] uppercase transition-colors duration-500"
              style={{
                color: isTransparentMode
                  ? "rgba(192,175,126,0.9)"
                  : "var(--terracotta-gold)",
              }}
            >
              Tuscany, Italy
            </span>
            <span
              className="text-xl font-medium tracking-tight transition-all duration-500 group-hover:opacity-80"
              style={{
                fontFamily: "var(--font-display)",
                color: isTransparentMode ? "white" : "var(--dark-forest)",
              }}
            >
              Casa Brunelli
            </span>
          </Link>

          {/* ─── Desktop Nav ──────────────────────────────────── */}
          <nav
            className="hidden md:flex items-center gap-8"
            aria-label="Main navigation"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-sm transition-all duration-300",
                    isActive ? "font-medium" : "hover:opacity-70"
                  )}
                  style={{
                    color: isTransparentMode
                      ? isActive
                        ? "rgba(255,255,255,1)"
                        : "rgba(255,255,255,0.8)"
                      : isActive
                      ? "var(--sage-variant)"
                      : "var(--medium-green)",
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* ─── CTA + Mobile toggle ──────────────────────────── */}
          <div className="flex items-center gap-3">
            <Link
              href="/availability"
              className="hidden md:inline-flex px-5 py-2.5 rounded-lg text-sm font-medium tracking-wide transition-all duration-300 hover:opacity-90 active:scale-95"
              style={{
                backgroundColor: isTransparentMode
                  ? "rgba(255,255,255,0.15)"
                  : "var(--dark-forest)",
                color: "white",
                backdropFilter: isTransparentMode ? "blur(4px)" : "none",
                border: isTransparentMode
                  ? "1px solid rgba(255,255,255,0.3)"
                  : "none",
              }}
            >
              Check Availability
            </Link>

            <button
              className="md:hidden p-2 rounded-lg transition-colors duration-300"
              onClick={() => setIsMobileOpen((v) => !v)}
              aria-expanded={isMobileOpen}
              aria-label="Toggle menu"
              style={{
                color: isTransparentMode ? "white" : "var(--dark-forest)",
              }}
            >
              {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* ─── Mobile Drawer ────────────────────────────────────── */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="md:hidden overflow-hidden border-t"
            style={{
              borderColor: "rgba(139,157,131,0.2)",
              backgroundColor: "white",
            }}
          >
            <nav className="max-w-350 mx-auto px-6 py-4 flex flex-col gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                      "px-3 py-3 rounded-lg text-sm transition-colors",
                      isActive ? "font-medium" : ""
                    )}
                    style={{
                      color: isActive
                        ? "var(--sage-variant)"
                        : "var(--medium-green)",
                      backgroundColor: isActive
                        ? "rgba(139,157,131,0.08)"
                        : "transparent",
                    }}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <Link
                href="/availability"
                onClick={() => setIsMobileOpen(false)}
                className="mt-2 px-4 py-3 rounded-lg text-sm font-medium text-center transition-all"
                style={{
                  backgroundColor: "var(--dark-forest)",
                  color: "white",
                }}
              >
                Check Availability
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
