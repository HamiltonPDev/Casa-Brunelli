"use client";

// ─── Imports ───────────────────────────────────────────────────
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Heart, Info } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────
type Category = "all" | "exterior" | "interior" | "outdoor" | "details";

interface GalleryImage {
  id: number;
  src: string;
  alt: string;
  category: Exclude<Category, "all">;
  caption: string;
}

// ─── Data ──────────────────────────────────────────────────────
const GALLERY_IMAGES: GalleryImage[] = [
  // Exterior & Views
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1759062012138-70f215751ca7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0dXNjYW4lMjB2aWxsYSUyMGV4dGVyaW9yfGVufDF8fHx8MTc2MDAyMDI0MXww&ixlib=rb-4.1.0&q=80&w=1080",
    alt: "Casa Brunelli exterior facade",
    category: "exterior",
    caption: "Villa facade with traditional Tuscan architecture",
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1673997303812-b6cd47939609?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpdGFsaWFuJTIwY291bnRyeXNpZGUlMjB2aWV3fGVufDF8fHx8MTc2MDAyMDI0Mnww&ixlib=rb-4.1.0&q=80&w=1080",
    alt: "Tuscan countryside views",
    category: "exterior",
    caption: "Panoramic views of the surrounding Tuscan hills",
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1677869914397-0d98576ff51b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBwb29sJTIwdHVzY2FueXxlbnwxfHx8fDE3NjAwMjAyNDN8MA&ixlib=rb-4.1.0&q=80&w=1080",
    alt: "Infinity pool with landscape views",
    category: "exterior",
    caption: "Infinity pool overlooking the valley",
  },
  // Interior Spaces
  {
    id: 4,
    src: "https://images.unsplash.com/photo-1748075820744-d558255b6776?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBpdGFsaWFuJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzYwMDIwMjQzfDA&ixlib=rb-4.1.0&q=80&w=1080",
    alt: "Elegant Italian interior",
    category: "interior",
    caption: "Luxurious living spaces with authentic Italian design",
  },
  {
    id: 5,
    src: "https://images.unsplash.com/photo-1707299231603-6c0a93e0f7fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwbGl2aW5nJTIwcm9vbXxlbnwxfHx8fDE3NjAwMjAyNDN8MA&ixlib=rb-4.1.0&q=80&w=1080",
    alt: "Elegant living room",
    category: "interior",
    caption: "Main living room with original architectural features",
  },
  {
    id: 6,
    src: "https://images.unsplash.com/photo-1625579002297-aeebbf69de89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBiZWRyb29tJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzU5OTQzMjI3fDA&ixlib=rb-4.1.0&q=80&w=1080",
    alt: "Master bedroom suite",
    category: "interior",
    caption: "Master bedroom with luxury linens and furnishings",
  },
  {
    id: 7,
    src: "https://images.unsplash.com/photo-1641823911769-c55f23c25143?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBraXRjaGVuJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzU5OTU2ODExfDA&ixlib=rb-4.1.0&q=80&w=1080",
    alt: "Gourmet kitchen",
    category: "interior",
    caption: "Stone kitchen with professional appliances",
  },
  {
    id: 8,
    src: "https://images.unsplash.com/photo-1658760046471-896cbc719c9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXJibGUlMjBiYXRocm9vbSUyMGx1eHVyeXxlbnwxfHx8fDE3NjAwMjAyNDV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    alt: "Luxury marble bathroom",
    category: "interior",
    caption: "En-suite bathroom with marble finishes",
  },
  // Outdoor Living
  {
    id: 9,
    src: "https://images.unsplash.com/photo-1689075326462-581d7705c0ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvdXRkb29yJTIwdGVycmFjZSUyMGRpbmluZ3xlbnwxfHx8fDE3NTk5MTYwMTF8MA&ixlib=rb-4.1.0&q=80&w=1080",
    alt: "Outdoor terrace dining",
    category: "outdoor",
    caption: "Al fresco dining terrace with countryside views",
  },
  {
    id: 10,
    src: "https://images.unsplash.com/photo-1660921127285-de53a3010493?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYXJkZW4lMjBwYXRpbyUyMGZ1cm5pdHVyZXxlbnwxfHx8fDE3NTk5MjMwNTd8MA&ixlib=rb-4.1.0&q=80&w=1080",
    alt: "Garden patio seating",
    category: "outdoor",
    caption: "Relaxation area surrounded by Mediterranean gardens",
  },
  {
    id: 11,
    src: "https://images.unsplash.com/photo-1635549630280-de3b8c2320a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpdGFsaWFuJTIwZ2FyZGVuJTIwbGFuZHNjYXBlfGVufDF8fHx8MTc2MDAyMDI0Nnww&ixlib=rb-4.1.0&q=80&w=1080",
    alt: "Italian garden landscape",
    category: "outdoor",
    caption: "Lush Mediterranean gardens with native plantings",
  },
  // Details & Amenities
  {
    id: 12,
    src: "https://images.unsplash.com/photo-1759221268953-52cb7b5b5a60?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxydXN0aWMlMjBhcmNoaXRlY3R1cmFsJTIwZGV0YWlsfGVufDF8fHx8MTc2MDAyMDI0N3ww&ixlib=rb-4.1.0&q=80&w=1080",
    alt: "Rustic architectural details",
    category: "details",
    caption: "Traditional Tuscan architectural details",
  },
  {
    id: 13,
    src: "https://images.unsplash.com/photo-1686213331025-de65716dcab3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBpbnRlcmlvciUyMGRlY29yfGVufDF8fHx8MTc2MDAyMDI0N3ww&ixlib=rb-4.1.0&q=80&w=1080",
    alt: "Luxury interior decor",
    category: "details",
    caption: "Carefully curated interior styling and finishes",
  },
  {
    id: 14,
    src: "https://images.unsplash.com/photo-1685376834913-fa9b535a40c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpdGFsaWFuJTIwd2luZG93JTIwYXJjaGl0ZWN0dXJlfGVufDF8fHx8MTc2MDAyMDI0OHww&ixlib=rb-4.1.0&q=80&w=1080",
    alt: "Traditional Italian windows",
    category: "details",
    caption: "Original wooden shutters and stone frames",
  },
];

const CATEGORIES: { id: Category; label: string }[] = [
  { id: "all", label: "All Photos" },
  { id: "exterior", label: "Exterior & Views" },
  { id: "interior", label: "Interior Spaces" },
  { id: "outdoor", label: "Outdoor Living" },
  { id: "details", label: "Details & Amenities" },
];

// ─── Component ─────────────────────────────────────────────────
export function GalleryClient() {
  const [selectedCategory, setSelectedCategory] = useState<Category>("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [showInfo, setShowInfo] = useState(false);
  const [imageLoaded, setImageLoaded] = useState<Record<number, boolean>>({});

  const filteredImages =
    selectedCategory === "all"
      ? GALLERY_IMAGES
      : GALLERY_IMAGES.filter((img) => img.category === selectedCategory);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setShowInfo(false);
  };

  function closeLightbox() {
    setLightboxIndex(null);
    setShowInfo(false);
  }

  function goToPrev() {
    if (lightboxIndex === null) return;
    setLightboxIndex(
      (lightboxIndex - 1 + filteredImages.length) % filteredImages.length
    );
    setShowInfo(false);
  }

  function goToNext() {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % filteredImages.length);
    setShowInfo(false);
  }

  const toggleFavorite = (id: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") goToPrev();
      if (e.key === "ArrowRight") goToNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxIndex, closeLightbox, goToPrev, goToNext]);

  // Lock body scroll when lightbox open
  useEffect(() => {
    document.body.style.overflow = lightboxIndex !== null ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightboxIndex]);

  const currentImage =
    lightboxIndex !== null ? filteredImages[lightboxIndex] : null;

  return (
    <>
      {/* ─── Category filter tabs ──────────────────────────── */}
      <div
        className="sticky top-[64px] z-40 border-b"
        style={{
          backgroundColor: "white",
          borderColor: "rgba(139,157,131,0.15)",
        }}
      >
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto py-4 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "px-5 py-2 rounded-xl whitespace-nowrap text-sm font-medium transition-all duration-200 flex-shrink-0"
                )}
                style={{
                  backgroundColor:
                    selectedCategory === cat.id ? "#2D3A2E" : "transparent",
                  color:
                    selectedCategory === cat.id
                      ? "white"
                      : "rgba(61,82,67,0.7)",
                  border:
                    selectedCategory === cat.id
                      ? "1px solid #2D3A2E"
                      : "1px solid rgba(139,157,131,0.2)",
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Masonry gallery ───────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-12">
        {/* Counter */}
        <div className="flex items-center justify-between mb-8">
          <p className="text-sm" style={{ color: "rgba(61,82,67,0.6)" }}>
            {filteredImages.length} photo
            {filteredImages.length !== 1 ? "s" : ""}
            {selectedCategory !== "all" && (
              <>
                {" "}
                in{" "}
                <span style={{ color: "#2D3A2E", fontWeight: 500 }}>
                  {CATEGORIES.find((c) => c.id === selectedCategory)?.label}
                </span>
              </>
            )}
          </p>
          {favorites.size > 0 && (
            <p
              className="text-sm flex items-center gap-1.5"
              style={{ color: "#C0AF7E" }}
            >
              <Heart size={14} fill="#C0AF7E" />
              {favorites.size} saved
            </p>
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCategory}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            // CSS columns masonry — no external lib needed
            style={{
              columns: "3 320px",
              columnGap: "20px",
            }}
          >
            {filteredImages.map((image, idx) => (
              <div
                key={image.id}
                className="break-inside-avoid mb-5 group relative cursor-pointer overflow-hidden rounded-2xl"
                style={{ borderColor: "rgba(139,157,131,0.2)" }}
                onClick={() => openLightbox(idx)}
              >
                {/* Skeleton while loading */}
                {!imageLoaded[image.id] && (
                  <div
                    className="w-full animate-pulse rounded-2xl"
                    style={{
                      height: 240,
                      backgroundColor: "rgba(139,157,131,0.1)",
                    }}
                  />
                )}

                {/* Image */}
                <img
                  src={image.src}
                  alt={image.alt}
                  loading="lazy"
                  onLoad={() =>
                    setImageLoaded((prev) => ({ ...prev, [image.id]: true }))
                  }
                  className={cn(
                    "w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105",
                    imageLoaded[image.id]
                      ? "opacity-100"
                      : "opacity-0 absolute inset-0"
                  )}
                />

                {/* Hover overlay */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-5"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(45,58,46,0.92) 0%, rgba(45,58,46,0.4) 60%, transparent 100%)",
                  }}
                >
                  {/* Top: favorite button */}
                  <div className="flex justify-end">
                    <button
                      onClick={(e) => toggleFavorite(image.id, e)}
                      className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                      style={{
                        backgroundColor: favorites.has(image.id)
                          ? "#C0AF7E"
                          : "rgba(255,255,255,0.15)",
                        backdropFilter: "blur(4px)",
                      }}
                      aria-label="Toggle favorite"
                    >
                      <Heart
                        size={15}
                        style={{
                          color: favorites.has(image.id) ? "#2D3A2E" : "white",
                          fill: favorites.has(image.id) ? "#2D3A2E" : "none",
                        }}
                      />
                    </button>
                  </div>

                  {/* Bottom: caption + category */}
                  <div>
                    <span
                      className="inline-block px-2 py-0.5 rounded-full text-xs mb-2"
                      style={{
                        backgroundColor: "rgba(139,157,131,0.5)",
                        color: "white",
                      }}
                    >
                      {CATEGORIES.find((c) => c.id === image.category)?.label}
                    </span>
                    <p className="text-sm text-white leading-snug">
                      {image.caption}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>

        {filteredImages.length === 0 && (
          <div className="text-center py-20">
            <p style={{ color: "rgba(61,82,67,0.5)" }}>
              No photos in this category.
            </p>
          </div>
        )}
      </div>

      {/* ─── Lightbox ──────────────────────────────────────── */}
      <AnimatePresence>
        {currentImage && (
          <motion.div
            key="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.95)" }}
            onClick={closeLightbox}
          >
            {/* Top bar */}
            <div
              className="absolute top-0 left-0 right-0 p-5 flex items-center justify-between z-10"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)",
              }}
            >
              {/* Counter */}
              <span
                className="text-sm"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                {(lightboxIndex ?? 0) + 1} / {filteredImages.length}
              </span>

              {/* Actions */}
              <div
                className="flex items-center gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setShowInfo((v) => !v)}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
                  style={{
                    backgroundColor: showInfo
                      ? "rgba(139,157,131,0.6)"
                      : "rgba(255,255,255,0.1)",
                  }}
                  aria-label="Toggle info"
                >
                  <Info size={18} style={{ color: "white" }} />
                </button>
                <button
                  onClick={(e) => toggleFavorite(currentImage.id, e)}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
                  style={{
                    backgroundColor: favorites.has(currentImage.id)
                      ? "#C0AF7E"
                      : "rgba(255,255,255,0.1)",
                  }}
                  aria-label="Toggle favorite"
                >
                  <Heart
                    size={18}
                    style={{
                      color: favorites.has(currentImage.id)
                        ? "#2D3A2E"
                        : "white",
                      fill: favorites.has(currentImage.id) ? "#2D3A2E" : "none",
                    }}
                  />
                </button>
                <button
                  onClick={closeLightbox}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
                  style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                  aria-label="Close"
                >
                  <X size={18} style={{ color: "white" }} />
                </button>
              </div>
            </div>

            {/* Prev/Next */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrev();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center z-10 transition-all hover:scale-110"
              style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
              aria-label="Previous image"
            >
              <ChevronLeft size={24} style={{ color: "white" }} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center z-10 transition-all hover:scale-110"
              style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
              aria-label="Next image"
            >
              <ChevronRight size={24} style={{ color: "white" }} />
            </button>

            {/* Main image */}
            <div
              className="max-w-[90vw] max-h-[85vh] flex flex-col items-center gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImage.id}
                  src={currentImage.src}
                  alt={currentImage.alt}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-2xl"
                />
              </AnimatePresence>

              {/* Caption / Info */}
              <AnimatePresence>
                {showInfo ? (
                  <motion.div
                    key="info"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="rounded-xl px-6 py-4 max-w-lg text-center"
                    style={{ backgroundColor: "rgba(45,58,46,0.9)" }}
                  >
                    <p
                      className="text-sm font-medium mb-1"
                      style={{ color: "#F5DEB3" }}
                    >
                      {currentImage.caption}
                    </p>
                    <p className="text-xs" style={{ color: "#8B9D83" }}>
                      {
                        CATEGORIES.find((c) => c.id === currentImage.category)
                          ?.label
                      }
                    </p>
                  </motion.div>
                ) : (
                  <motion.p
                    key="caption"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-sm text-center max-w-lg"
                    style={{ color: "rgba(255,255,255,0.7)" }}
                  >
                    {currentImage.caption}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Thumbnail strip */}
            <div
              className="absolute bottom-0 left-0 right-0 py-4 px-6 overflow-x-auto"
              style={{
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex gap-2 justify-center">
                {filteredImages.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => {
                      setLightboxIndex(idx);
                      setShowInfo(false);
                    }}
                    className={cn(
                      "flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all duration-200",
                      idx === lightboxIndex
                        ? "border-white scale-110 opacity-100"
                        : "border-transparent opacity-50 hover:opacity-80"
                    )}
                    aria-label={`View ${img.alt}`}
                  >
                    <img
                      src={img.src}
                      alt={img.alt}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
