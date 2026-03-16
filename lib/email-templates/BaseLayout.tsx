/**
 * Casa Brunelli — Shared Email Layout
 *
 * Wraps all transactional emails with consistent branding:
 * header (logo/name), body slot, footer (contact + address).
 *
 * Brand palette:
 * - Dark Forest:     #2d3a2e
 * - Cream:           #f5f3ef
 * - Sage:            #8b9d83
 * - Terracotta Gold: #c0af7e
 */

import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Link,
  Hr,
  Tailwind,
  pixelBasedPreset,
} from "@react-email/components";
import type { BaseLayoutProps } from "@/types";
import { VILLA_ADDRESS } from "@/lib/constants";
import { BRAND } from "./brand";

// ─── Component ───────────────────────────────────────────────

export function BaseLayout({
  preview,
  children,
}: Readonly<BaseLayoutProps>): React.ReactElement {
  return (
    <Html lang="en" dir="ltr">
      <Tailwind config={{ presets: [pixelBasedPreset] }}>
        <Head />
        <Preview>{preview}</Preview>
        <Body
          style={{
            backgroundColor: BRAND.cream,
            fontFamily: "'Georgia', 'Times New Roman', serif",
            margin: 0,
            padding: 0,
          }}
        >
          <Container
            style={{
              maxWidth: "600px",
              margin: "0 auto",
              padding: "0",
            }}
          >
            {/* ─── Header ─── */}
            <Section
              style={{
                backgroundColor: BRAND.darkForest,
                padding: "32px 40px",
                textAlign: "center" as const,
              }}
            >
              <Text
                style={{
                  fontSize: "28px",
                  fontWeight: 700,
                  color: BRAND.terracottaGold,
                  margin: 0,
                  letterSpacing: "2px",
                  textTransform: "uppercase" as const,
                }}
              >
                Casa Brunelli
              </Text>
              <Text
                style={{
                  fontSize: "13px",
                  color: BRAND.sage,
                  margin: "4px 0 0 0",
                  letterSpacing: "3px",
                  textTransform: "uppercase" as const,
                }}
              >
                Luxury Tuscan Villa
              </Text>
            </Section>

            {/* ─── Body ─── */}
            <Section
              style={{
                backgroundColor: BRAND.white,
                padding: "40px",
              }}
            >
              {children}
            </Section>

            {/* ─── Footer ─── */}
            <Section
              style={{
                backgroundColor: BRAND.darkForest,
                padding: "32px 40px",
                textAlign: "center" as const,
              }}
            >
              <Text
                style={{
                  fontSize: "13px",
                  color: BRAND.sage,
                  margin: "0 0 8px 0",
                }}
              >
                {VILLA_ADDRESS}
              </Text>
              <Hr
                style={{
                  borderColor: BRAND.sage,
                  opacity: 0.3,
                  margin: "16px 0",
                }}
              />
              <Text
                style={{
                  fontSize: "12px",
                  color: BRAND.sage,
                  margin: "0 0 4px 0",
                }}
              >
                <Link
                  href="mailto:info@casabrunelli.com"
                  style={{ color: BRAND.terracottaGold }}
                >
                  info@casabrunelli.com
                </Link>
                {" · "}
                <Link
                  href="https://casabrunelli.com"
                  style={{ color: BRAND.terracottaGold }}
                >
                  casabrunelli.com
                </Link>
              </Text>
              <Text
                style={{
                  fontSize: "11px",
                  color: BRAND.gray,
                  margin: "12px 0 0 0",
                }}
              >
                You are receiving this email because of your booking inquiry
                with Casa Brunelli. If you believe this was sent in error,
                please contact us.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
