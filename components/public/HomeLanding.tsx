"use client";

// ─── Imports ───────────────────────────────────────────────────
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Leaf,
  Waves,
  UtensilsCrossed,
  Wifi,
  Car,
  BedDouble,
  Star,
  Home,
  Bed,
  Users,
  ArrowUp,
  ChevronDown,
} from "lucide-react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { FadeInView } from "@/components/ui/FadeInView";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { FeatureCard } from "@/components/shared/FeatureCard";

// ─── Types ─────────────────────────────────────────────────────
interface HeroMilestone {
  minProgress: number;
  maxProgress: number;
  eyebrow: string;
  headline: string;
  sub: string;
  align: "center" | "left" | "right";
}

// ─── Constants ─────────────────────────────────────────────────
const HERO_MILESTONES: HeroMilestone[] = [
  {
    minProgress: 0,
    maxProgress: 0.2,
    eyebrow: "Tuscany, Italy · Direct Booking",
    headline: "Casa\nBrunelli",
    sub: "A private luxury villa nestled in the Tuscan hills.",
    align: "center",
  },
  {
    minProgress: 0.2,
    maxProgress: 0.4,
    eyebrow: "The Villa",
    headline: "Authentic\nTuscan Living",
    sub: "18th-century architecture, lovingly restored for modern comfort.",
    align: "left",
  },
  {
    minProgress: 0.4,
    maxProgress: 0.6,
    eyebrow: "The Estate",
    headline: "2 Acres of\nPrivate Gardens",
    sub: "Olive groves, lemon trees, a heated infinity pool.",
    align: "right",
  },
  {
    minProgress: 0.6,
    maxProgress: 0.8,
    eyebrow: "Sleeps up to 8",
    headline: "4 Luxury\nBedrooms",
    sub: "En-suite rooms with views across the rolling Tuscan hills.",
    align: "left",
  },
  {
    minProgress: 0.8,
    maxProgress: 1,
    eyebrow: "Book Direct & Save",
    headline: "Your Escape\nAwaits",
    sub: "No OTA commissions — better rates, direct with the owners.",
    align: "center",
  },
];

const FEATURES = [
  {
    icon: BedDouble,
    title: "4 Luxury Bedrooms",
    description: "Spacious en-suite rooms with views across the Tuscan hills.",
    gradient: "from-[#E8F5E9] to-[#F5F3EF]",
  },
  {
    icon: Waves,
    title: "Private Pool",
    description: "A heated infinity pool surrounded by cypresses and lavender.",
    gradient: "from-[#F5F3EF] to-[#EEF4EE]",
  },
  {
    icon: UtensilsCrossed,
    title: "Tuscan Kitchen",
    description: "Fully equipped stone kitchen for authentic Italian cooking.",
    gradient: "from-[#FFF8ED] to-[#F5F3EF]",
  },
  {
    icon: Leaf,
    title: "2 Acres of Gardens",
    description: "Terraced olive groves, lemon trees, and rose gardens.",
    gradient: "from-[#E8F5E9] to-[#F0F7F0]",
  },
  {
    icon: Car,
    title: "Private Parking",
    description: "Gated parking for up to 4 vehicles on the estate.",
    gradient: "from-[#F5F3EF] to-[#F0EDE8]",
  },
  {
    icon: Wifi,
    title: "High-Speed Wi-Fi",
    description: "Fibre-optic internet throughout the villa.",
    gradient: "from-[#EEF4EE] to-[#F5F3EF]",
  },
] as const;

const STATS = [
  { value: "4", label: "Bedrooms" },
  { value: "8", label: "Max Guests" },
  { value: "2 acres", label: "Private Estate" },
  { value: "30 km", label: "from Florence" },
] as const;

const SEASONS = [
  {
    name: "High Summer",
    period: "Jun 15 – Aug 31",
    rate: "from €750/night",
    highlight: true,
  },
  {
    name: "Spring Blossom",
    period: "Apr 1 – Jun 14",
    rate: "from €550/night",
    highlight: false,
  },
  {
    name: "Autumn Harvest",
    period: "Sep 1 – Nov 15",
    rate: "from €600/night",
    highlight: false,
  },
  {
    name: "Winter Retreat",
    period: "Nov 16 – Mar 31",
    rate: "from €450/night",
    highlight: false,
  },
] as const;

// ─── Hero photos (from PhotoHeroScene.tsx prototype) ──────────
interface HeroPhoto {
  url: string;
  alt: string;
  description: string;
  range: [number, number];
}

const HERO_PHOTOS: HeroPhoto[] = [
  {
    url: "https://images.unsplash.com/photo-1660071170186-4997c864a320?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080",
    alt: "Aerial view of Casa Brunelli nestled in Tuscan hills",
    description: "Welcome to Casa Brunelli",
    range: [0, 0.2],
  },
  {
    url: "https://images.unsplash.com/photo-1715037629851-47fc8f53593a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080",
    alt: "Rolling vineyards and olive groves surrounding the estate",
    description: "Tuscan Countryside",
    range: [0.2, 0.4],
  },
  {
    url: "https://images.unsplash.com/photo-1721852474658-884e1881fe31?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080",
    alt: "Historic entrance to the restored Tuscan villa",
    description: "Historic Entrance",
    range: [0.4, 0.6],
  },
  {
    url: "https://images.unsplash.com/photo-1692719630299-d7e5bcce2add?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080",
    alt: "Infinity pool overlooking the valley",
    description: "Luxury Pool & Terrace",
    range: [0.6, 0.8],
  },
  {
    url: "https://images.unsplash.com/photo-1566288940278-2b24d1c0c4cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080",
    alt: "Elegant interior with authentic Italian design",
    description: "Luxury Interiors",
    range: [0.8, 1.0],
  },
];

function getCurrentPhoto(progress: number): HeroPhoto {
  return (
    HERO_PHOTOS.find((p) => progress >= p.range[0] && progress < p.range[1]) ??
    HERO_PHOTOS[HERO_PHOTOS.length - 1]
  );
}

function getPhotoProgress(photo: HeroPhoto, progress: number): number {
  const size = photo.range[1] - photo.range[0];
  return Math.min(Math.max((progress - photo.range[0]) / size, 0), 1);
}

function getCurrentMilestone(progress: number): HeroMilestone {
  return (
    HERO_MILESTONES.find(
      (m) => progress >= m.minProgress && progress < m.maxProgress
    ) ?? HERO_MILESTONES[HERO_MILESTONES.length - 1]
  );
}

// ─── Component ─────────────────────────────────────────────────
export function HomeLanding() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;
      const heroHeight = heroRef.current.offsetHeight;
      const scrolled = window.scrollY;
      const progress = Math.min(scrolled / (heroHeight - window.innerHeight), 1);
      setScrollProgress(Math.max(0, progress));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const currentMilestone = getCurrentMilestone(scrollProgress);
  const currentPhoto = getCurrentPhoto(scrollProgress);
  const showScrollIndicator = scrollProgress < 0.08;
  const showCTA = scrollProgress > 0.88;

  const alignClass =
    currentMilestone.align === "left"
      ? "items-start text-left pl-12 lg:pl-24"
      : currentMilestone.align === "right"
      ? "items-end text-right pr-12 lg:pr-24"
      : "items-center text-center";

  return (
    <div style={{ backgroundColor: "#F5F3EF" }}>
      {/* ═══════════════════════════════════════════════════════
          SCROLL HERO (5x viewport)
          ═══════════════════════════════════════════════════════ */}
      <div ref={heroRef} style={{ height: "500vh" }} className="relative">
        {/* Fixed background — real photos with crossfade */}
        <div className="fixed inset-0 z-0">
          {HERO_PHOTOS.map((photo) => {
            const isActive = currentPhoto === photo;
            const photoProgress = getPhotoProgress(photo, scrollProgress);
            return (
              <motion.div
                key={photo.url}
                className="absolute inset-0"
                animate={{
                  opacity: isActive ? 1 : 0,
                  scale: isActive ? 1 + photoProgress * 0.08 : 0.96,
                }}
                transition={{
                  opacity: { duration: 1.2, ease: "easeInOut" },
                  scale: { duration: 1.5, ease: "easeOut" },
                }}
                style={{ zIndex: isActive ? 2 : 1 }}
              >
                {/* Photo */}
                <img
                  src={photo.url}
                  alt={photo.alt}
                  className="w-full h-full object-cover"
                  loading={photo.range[0] === 0 ? "eager" : "lazy"}
                  style={{
                    transform: `translateY(${isActive ? photoProgress * -8 : 0}%)`,
                    transition: "transform 0.1s linear",
                  }}
                />
                {/* Dark overlay for text contrast */}
                <div className="absolute inset-0" style={{ backgroundColor: "rgba(0,0,0,0.48)" }} />
              </motion.div>
            );
          })}

          {/* Vignette */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              zIndex: 3,
              background: `radial-gradient(circle at center, transparent 40%, rgba(0,0,0,${0.1 + scrollProgress * 0.25}) 85%)`,
            }}
          />

          {/* Floating particles */}
          <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 4 }}>
            {Array.from({ length: 10 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: 3,
                  height: 3,
                  backgroundColor: "rgba(255,255,255,0.25)",
                  left: `${10 + i * 9}%`,
                  top: `${15 + (i % 5) * 16}%`,
                }}
                animate={{
                  y: [-15, 15, -15],
                  x: [-8, 8, -8],
                  opacity: [0.1, 0.5, 0.1],
                  scale: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 6 + i * 0.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.4,
                }}
              />
            ))}
          </div>
        </div>

        {/* Photo description pill (visible mid-scroll) */}
        <AnimatePresence>
          {scrollProgress > 0.05 && scrollProgress < 0.93 && (
            <motion.div
              key={currentPhoto.description}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
              className="fixed bottom-28 left-1/2 -translate-x-1/2 z-20"
              style={{ backdropFilter: "blur(12px)" }}
            >
              <div
                className="px-4 py-2 rounded-full border text-sm font-medium text-white"
                style={{ backgroundColor: "rgba(0,0,0,0.35)", borderColor: "rgba(255,255,255,0.2)" }}
              >
                {currentPhoto.description}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress dots */}
        <AnimatePresence>
          {scrollProgress > 0.05 && scrollProgress < 0.93 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed bottom-14 left-1/2 -translate-x-1/2 z-20 flex gap-2"
            >
              {HERO_PHOTOS.map((photo, idx) => {
                const isActive = currentPhoto === photo;
                const photoProgress = isActive ? getPhotoProgress(photo, scrollProgress) : scrollProgress > photo.range[1] ? 1 : 0;
                return (
                  <div
                    key={idx}
                    className="relative overflow-hidden rounded-full"
                    style={{
                      width: 40,
                      height: 6,
                      backgroundColor: "rgba(255,255,255,0.2)",
                    }}
                  >
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{ backgroundColor: "white" }}
                      animate={{ width: `${photoProgress * 100}%` }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    />
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        style={{ backgroundColor: "rgba(255,255,255,0.3)" }}
                        animate={{ opacity: [0.4, 0.9, 0.4] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fixed text overlay */}
        <div className="fixed inset-0 z-10 pointer-events-none flex flex-col justify-center">
          <div
            className={`flex flex-col gap-4 px-6 transition-all duration-100 ${alignClass}`}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMilestone.eyebrow}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-4 relative"
              >
                <p
                  className="text-xs tracking-[0.4em] uppercase font-semibold"
                  style={{ color: "var(--terracotta-gold)" }}
                >
                  {currentMilestone.eyebrow}
                </p>
                <h1
                  className="text-5xl md:text-7xl lg:text-8xl font-serif leading-none"
                  style={{
                    color: "var(--golden-wheat)",
                    letterSpacing: "-0.03em",
                    whiteSpace: "pre-line",
                    textShadow: "0 4px 20px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)",
                  }}
                >
                  {currentMilestone.headline}
                </h1>
                <p
                  className="text-base md:text-lg max-w-sm"
                  style={{ color: "var(--sage-variant)" }}
                >
                  {currentMilestone.sub}
                </p>

                {/* ─── Decorative divider (center only) ──────── */}
                {currentMilestone.align === "center" && (
                  <motion.div
                    className="flex items-center justify-center gap-4 mt-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  >
                    <motion.div
                      className="w-12 h-0.5 rounded-full"
                      style={{ backgroundColor: "var(--golden-wheat)" }}
                      animate={{ opacity: [0.5, 1, 0.5], scaleX: [0.8, 1.2, 0.8] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: "var(--golden-wheat)" }}
                      animate={{ opacity: [0.6, 1, 0.6], scale: [0.8, 1.2, 0.8] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    />
                    <motion.div
                      className="w-12 h-0.5 rounded-full"
                      style={{ backgroundColor: "var(--golden-wheat)" }}
                      animate={{ opacity: [0.5, 1, 0.5], scaleX: [0.8, 1.2, 0.8] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    />
                  </motion.div>
                )}

                {/* ─── Accent particles around title (center only) */}
                {currentMilestone.align === "center" && (
                  <div className="absolute inset-0 pointer-events-none">
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 rounded-full"
                        style={{
                          left: `${20 + i * 12}%`,
                          top: `${30 + Math.sin(i) * 40}%`,
                          backgroundColor: "var(--golden-wheat)",
                          opacity: 0.6,
                        }}
                        animate={{
                          y: [-15, 15, -15],
                          opacity: [0.3, 0.8, 0.3],
                          scale: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 4 + i * 0.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: i * 0.3,
                        }}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Left progress bar (fixed) */}
        <div className="fixed left-6 top-1/2 -translate-y-1/2 z-20 hidden lg:flex flex-col items-center gap-2">
          {HERO_MILESTONES.map((m, i) => {
            const isActive =
              scrollProgress >= m.minProgress && scrollProgress < m.maxProgress;
            const isPast = scrollProgress >= m.maxProgress;
            return (
              <div key={i} className="flex items-center gap-2">
                <div
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: isActive ? 8 : 4,
                    height: isActive ? 8 : 4,
                    backgroundColor: isActive
                      ? "#C0AF7E"
                      : isPast
                      ? "#8B9D83"
                      : "rgba(139,157,131,0.3)",
                  }}
                />
                {i < HERO_MILESTONES.length - 1 && (
                  <div
                    className="absolute"
                    style={{
                      width: 1,
                      height: 24,
                      backgroundColor: "rgba(139,157,131,0.2)",
                      transform: "translateX(-6px) translateY(10px)",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Scroll indicator (fixed bottom) */}
        <AnimatePresence>
          {showScrollIndicator && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3"
            >
              {/* Mouse icon */}
              <motion.div
                animate={{ y: [0, 8, 0], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="relative"
              >
                <div
                  className="w-6 h-10 rounded-full flex justify-center"
                  style={{ border: "2px solid rgba(192,175,126,0.6)" }}
                >
                  <motion.div
                    animate={{ y: [0, 8, 0], opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className="w-1 h-3 rounded-full mt-2"
                    style={{ backgroundColor: "var(--terracotta-gold)" }}
                  />
                </div>
              </motion.div>

              {/* "Scroll to explore" text */}
              <motion.p
                className="text-sm font-light tracking-wider"
                style={{
                  color: "rgba(192,175,126,0.8)",
                  textShadow: "0 2px 8px rgba(0,0,0,0.5)",
                }}
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                Scroll to explore
              </motion.p>

              {/* Chevron */}
              <motion.div
                animate={{ y: [0, 6, 0], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              >
                <ChevronDown size={18} style={{ color: "rgba(192,175,126,0.6)" }} />
              </motion.div>

              {/* Floating particles around scroll indicator */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 rounded-full"
                    style={{
                      left: `${35 + i * 10}%`,
                      top: `${15 + i * 15}%`,
                      backgroundColor: "rgba(192,175,126,0.5)",
                    }}
                    animate={{
                      y: [-10, 20, -10],
                      opacity: [0.2, 0.6, 0.2],
                      scale: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 3 + i * 0.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.4,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA panel slides up at end of scroll */}
        <AnimatePresence>
          {showCTA && (
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-20"
              style={{ backgroundColor: "rgba(45,58,46,0.95)", backdropFilter: "blur(12px)" }}
            >
              <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p
                    className="text-xs tracking-[0.3em] uppercase font-semibold mb-1"
                    style={{ color: "var(--terracotta-gold)" }}
                  >
                    Book Direct
                  </p>
                  <p className="text-sm font-serif" style={{ color: "var(--golden-wheat)" }}>
                    Reserve your Tuscan escape — no commissions, no middlemen
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <Button href="/availability" variant="gold">
                    Check Availability
                  </Button>
                  <Button href="/contact" variant="outline">
                    Ask a Question
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ═══════════════════════════════════════════════════════
          CONTENT SECTIONS (below hero, z-30 over fixed)
          ═══════════════════════════════════════════════════════ */}
      <div className="relative z-30" style={{ backgroundColor: "white" }}>
        {/* Stats strip */}
        <div className="border-b" style={{ backgroundColor: "white", borderColor: "rgba(139,157,131,0.1)" }}>
          <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {STATS.map(({ value, label }, i) => (
                <FadeInView key={label} delay={i * 0.1} className="flex flex-col gap-1">
                  <span className="font-serif text-4xl" style={{ color: "var(--dark-forest)" }}>{value}</span>
                  <Eyebrow color="muted">{label}</Eyebrow>
                </FadeInView>
              ))}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div style={{ backgroundColor: "var(--cream)" }} className="py-20 lg:py-28">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
            <FadeInView className="mb-14">
              <SectionHeader
                eyebrow="The Villa"
                heading="Everything You Need for the Perfect Stay"
                subtitle="Casa Brunelli combines authentic Tuscan architecture with every modern comfort."
              />
            </FadeInView>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {FEATURES.map(({ icon, title, description, gradient }, i) => (
                <FeatureCard
                  key={title}
                  icon={icon}
                  title={title}
                  description={description}
                  gradient={gradient}
                  delay={i * 0.1}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Virtual tour teaser */}
        <div style={{ backgroundColor: "white" }} className="py-20 lg:py-28">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="rounded-2xl p-10 lg:p-16 text-center"
              style={{
                background:
                  "linear-gradient(135deg, rgba(139,157,131,0.08) 0%, rgba(192,175,126,0.08) 100%)",
                border: "1px solid rgba(139,157,131,0.2)",
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                {[
                  {
                    icon: Home,
                    title: "Authentic Architecture",
                    desc: "18th-century Tuscan villa restored with original materials",
                    gradient: "from-[#E8F5E9] to-[#F5F3EF]",
                  },
                  {
                    icon: Bed,
                    title: "5 Luxury Bedrooms",
                    desc: "Spacious suites with en-suite bathrooms and countryside views",
                    gradient: "from-[#F5F3EF] to-[#FFF8ED]",
                  },
                  {
                    icon: Users,
                    title: "Sleeps 8–10 Guests",
                    desc: "Perfect for family gatherings and group retreats",
                    gradient: "from-[#FFF8ED] to-[#E8F5E9]",
                  },
                ].map(({ icon, title, desc, gradient }, i) => (
                  <FeatureCard
                    key={title}
                    icon={icon}
                    title={title}
                    description={desc}
                    gradient={gradient}
                    delay={i * 0.15}
                  />
                ))}
              </div>
              <FadeInView delay={0.5}>
                <SectionHeading size="lg" className="mb-3">
                  Scroll Back to Explore the Villa
                </SectionHeading>
                <p className="text-sm mb-6" style={{ color: "rgba(61,82,67,0.7)" }}>
                  Experience Casa Brunelli through our immersive scroll journey — from exterior to every intimate detail.
                </p>
                <Button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                  <ArrowUp size={14} />
                  Back to Top
                </Button>
              </FadeInView>
            </motion.div>
          </div>
        </div>

        {/* Pricing Section */}
        <div style={{ backgroundColor: "var(--cream)" }} className="py-20 lg:py-28">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
            <FadeInView className="mb-14">
              <SectionHeader
                eyebrow="Seasonal Rates"
                heading="Transparent Pricing, No Surprises"
                subtitle="Book directly with us and save up to 20% versus OTA platforms. All rates include taxes and cleaning."
              />
            </FadeInView>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              {SEASONS.map(({ name, period, rate, highlight }, i) => (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -4 }}
                  className="flex flex-col gap-3 p-5 rounded-2xl border transition-all"
                  style={{
                    backgroundColor: highlight ? "var(--dark-forest)" : "white",
                    borderColor: highlight
                      ? "var(--dark-forest)"
                      : "rgba(139,157,131,0.2)",
                  }}
                >
                  {highlight && (
                    <div className="flex items-center gap-1">
                      <Star
                        size={12}
                        style={{ color: "var(--terracotta-gold)" }}
                        fill="var(--terracotta-gold)"
                      />
                      <span
                        className="text-xs tracking-wider uppercase font-semibold"
                        style={{ color: "var(--terracotta-gold)" }}
                      >
                        Peak
                      </span>
                    </div>
                  )}
                  <div>
                    <h3
                      className="font-serif text-base font-medium"
                      style={{ color: highlight ? "var(--golden-wheat)" : "var(--dark-forest)" }}
                    >
                      {name}
                    </h3>
                    <p
                      className="text-xs mt-0.5"
                      style={{
                        color: highlight ? "var(--sage-variant)" : "rgba(61,82,67,0.6)",
                      }}
                    >
                      {period}
                    </p>
                  </div>
                  <p
                    className="font-semibold mt-auto"
                    style={{
                      color: highlight ? "var(--terracotta-gold)" : "var(--medium-green)",
                    }}
                  >
                    {rate}
                  </p>
                </motion.div>
              ))}
            </div>

            <div className="flex justify-center">
              <Button href="/availability" size="lg">
                Check Live Availability &amp; Rates
              </Button>
            </div>
          </div>
        </div>

        {/* Why Book Direct */}
        <div
          className="py-20 lg:py-28"
          style={{ backgroundColor: "var(--dark-forest)" }}
        >
          <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
            <FadeInView className="mb-14">
              <SectionHeader
                eyebrow="Why Book Direct"
                heading="Skip the Middleman. Save More."
                align="center"
                color="wheat"
              />
            </FadeInView>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                {
                  title: "Lower Rates",
                  description:
                    "No 15–20% OTA commission means we pass the savings directly to you.",
                },
                {
                  title: "Personal Service",
                  description:
                    "Talk directly to the owners — we know every corner of the villa.",
                },
                {
                  title: "Flexible Terms",
                  description:
                    "Arrival time, late check-out, special occasions — just ask us directly.",
                },
              ].map(({ title, description }, i) => (
                <FadeInView key={title} delay={i * 0.15}>
                  <div
                    className="flex flex-col gap-3 p-6 rounded-2xl h-full"
                    style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: "var(--terracotta-gold)" }}
                    />
                    <h3
                      className="text-lg font-semibold"
                      style={{ color: "var(--golden-wheat)" }}
                    >
                      {title}
                    </h3>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "var(--sage-variant)" }}
                    >
                      {description}
                    </p>
                  </div>
                </FadeInView>
              ))}
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div
          className="py-20 lg:py-28 border-t"
          style={{
            backgroundColor: "white",
            borderColor: "rgba(139,157,131,0.1)",
          }}
        >
          <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
            <FadeInView className="flex flex-col items-center text-center gap-6">
              <SectionHeader
                eyebrow="Ready to Visit?"
                heading="Your Tuscan Escape Awaits"
                subtitle="Check live availability, select your dates, and send a booking request in minutes. No account required."
                align="center"
              />
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Button href="/availability" size="lg">
                  View Availability
                </Button>
                <Button href="/contact" variant="outline" size="lg">
                  Contact Us
                </Button>
              </div>
            </FadeInView>
          </div>
        </div>
      </div>
    </div>
  );
}
