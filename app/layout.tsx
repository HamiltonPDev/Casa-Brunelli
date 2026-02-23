import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Casa Brunelli — Luxury Tuscan Villa",
    template: "%s | Casa Brunelli",
  },
  description:
    "Experience the beauty of Tuscany at Casa Brunelli. A luxury villa rental in the heart of Italy — book directly and save on OTA commissions.",
  keywords: [
    "luxury villa Tuscany",
    "Casa Brunelli",
    "Tuscany vacation rental",
    "Italy villa booking",
    "luxury accommodation Tuscany",
    "direct booking villa Italy",
  ],
  openGraph: {
    title: "Casa Brunelli — Luxury Tuscan Villa",
    description:
      "Experience the beauty of Tuscany at Casa Brunelli. Book directly and save.",
    type: "website",
    locale: "en_US",
    siteName: "Casa Brunelli",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased">
        {/* Skip Link — WCAG 2.4.1 Level A */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-medium focus:text-white focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{ backgroundColor: "var(--dark-forest)" }}
        >
          Skip to main content
        </a>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
