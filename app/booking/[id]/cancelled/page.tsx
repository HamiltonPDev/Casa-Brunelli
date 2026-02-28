// app/booking/[id]/cancelled/page.tsx
// Server Component — Payment cancelled page for guests
// Guest is redirected here when they cancel the Stripe Checkout flow.
// Shows a friendly message with option to return home or contact the host.

import type { Metadata } from "next";
import { PublicNav } from "@/components/features/public/PublicNav";
import { PublicFooter } from "@/components/features/public/PublicFooter";
import { PaymentCancelledClient } from "@/components/features/public/PaymentCancelledClient";

// ─── Types ─────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ id: string }>;
}

// ─── Metadata ──────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Payment Cancelled — Casa Brunelli",
  description: "Your payment was not completed. You can try again using the link provided.",
};

// ─── Page ──────────────────────────────────────────────────────

export default async function PaymentCancelledPage({ params }: PageProps) {
  // Await params per Next.js 16 requirement (even if unused)
  await params;

  return (
    <>
      <PublicNav />

      <main
        id="main-content"
        className="min-h-screen pt-16 md:pt-20"
        style={{ backgroundColor: "#F5F3EF" }}
      >
        <div className="min-h-[70vh] flex items-center justify-center px-6 py-16">
          <PaymentCancelledClient />
        </div>
      </main>

      <PublicFooter />
    </>
  );
}
