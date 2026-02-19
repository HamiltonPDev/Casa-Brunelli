// app/page.tsx
// Landing page — Server Component wrapping HomeLanding client component

import type { Metadata } from "next";
import { PublicNav } from "@/components/features/public/PublicNav";
import { PublicFooter } from "@/components/features/public/PublicFooter";
import { HomeLanding } from "@/components/features/public/HomeLanding";

export const metadata: Metadata = {
  title: "Casa Brunelli — Luxury Tuscan Villa",
  description:
    "Experience the beauty of Tuscany at Casa Brunelli. A luxury villa rental in the heart of Italy — book directly and save on OTA commissions.",
};

export default function HomePage() {
  return (
    <>
      <PublicNav transparent />
      <HomeLanding />
      <PublicFooter />
    </>
  );
}
