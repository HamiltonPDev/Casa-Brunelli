/**
 * Casa Brunelli — Admin New Booking Notification Email
 *
 * Sent to admin when a new booking request arrives via the
 * public contact form (ContactMessage with type BOOKING_REQUEST).
 */

import { Section, Heading, Text, Button, Hr } from "@react-email/components";
import { BaseLayout } from "./BaseLayout";
import { BRAND } from "./brand";
import { DetailRow } from "./DetailRow";
import type { AdminNewBookingEmailProps } from "@/types";

// ─── Component ───────────────────────────────────────────────

export function AdminNewBookingEmail({
  guestName,
  guestEmail,
  checkIn,
  checkOut,
  guestCount,
  totalPrice,
  specialRequests,
  dashboardUrl,
  messageId,
}: Readonly<AdminNewBookingEmailProps>): React.ReactElement {
  const formatEur = (amount: number): string =>
    new Intl.NumberFormat("en", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <BaseLayout
      preview={`New booking request from ${guestName} — ${checkIn} to ${checkOut}`}
    >
      <Section
        style={{
          backgroundColor: "#dbeafe",
          padding: "12px 16px",
          borderRadius: "6px",
          marginBottom: "24px",
          border: "1px solid #93c5fd",
        }}
      >
        <Text
          style={{
            fontSize: "13px",
            color: "#1e40af",
            margin: 0,
            fontWeight: 600,
            textAlign: "center" as const,
          }}
        >
          New Booking Request Received
        </Text>
      </Section>

      <Heading
        as="h1"
        style={{
          fontSize: "24px",
          fontWeight: 700,
          color: BRAND.darkForest,
          margin: "0 0 24px 0",
        }}
      >
        {guestName} wants to book
      </Heading>

      {/* ─── Guest & Booking Details ─── */}
      <Section
        style={{
          backgroundColor: BRAND.cream,
          padding: "24px",
          borderRadius: "8px",
          border: `1px solid ${BRAND.lightGray}`,
        }}
      >
        <Text
          style={{
            fontSize: "12px",
            fontWeight: 600,
            color: BRAND.sage,
            margin: "0 0 12px 0",
            textTransform: "uppercase" as const,
            letterSpacing: "1px",
          }}
        >
          Guest Information
        </Text>
        <DetailRow label="Name" value={guestName} />
        <DetailRow label="Email" value={guestEmail} />
        <DetailRow
          label="Guests"
          value={`${guestCount} guest${guestCount > 1 ? "s" : ""}`}
        />

        <Hr
          style={{
            borderColor: BRAND.lightGray,
            margin: "16px 0",
          }}
        />

        <Text
          style={{
            fontSize: "12px",
            fontWeight: 600,
            color: BRAND.sage,
            margin: "0 0 12px 0",
            textTransform: "uppercase" as const,
            letterSpacing: "1px",
          }}
        >
          Stay Details
        </Text>
        <DetailRow label="Check-in" value={checkIn} />
        <DetailRow label="Check-out" value={checkOut} />
        <DetailRow
          label="Estimated Total"
          value={formatEur(totalPrice)}
          highlight
        />
      </Section>

      {/* ─── Special Requests ─── */}
      {specialRequests ? (
        <Section style={{ marginTop: "24px" }}>
          <Text
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: BRAND.sage,
              margin: "0 0 8px 0",
              textTransform: "uppercase" as const,
              letterSpacing: "1px",
            }}
          >
            Special Requests
          </Text>
          <Section
            style={{
              backgroundColor: "#f9fafb",
              padding: "16px",
              borderRadius: "6px",
              borderLeft: `3px solid ${BRAND.terracottaGold}`,
            }}
          >
            <Text
              style={{
                fontSize: "14px",
                color: BRAND.darkForest,
                margin: 0,
                fontStyle: "italic" as const,
              }}
            >
              &ldquo;{specialRequests}&rdquo;
            </Text>
          </Section>
        </Section>
      ) : null}

      {/* ─── CTA ─── */}
      <Section style={{ textAlign: "center" as const, marginTop: "32px" }}>
        <Button
          href={`${dashboardUrl}/admin/messages/${messageId}`}
          style={{
            backgroundColor: BRAND.darkForest,
            color: BRAND.cream,
            padding: "14px 32px",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Review in Dashboard
        </Button>
      </Section>

      <Hr
        style={{
          borderColor: BRAND.lightGray,
          margin: "32px 0 16px 0",
        }}
      />
      <Text
        style={{
          fontSize: "12px",
          color: BRAND.gray,
          margin: 0,
          textAlign: "center" as const,
        }}
      >
        This is an automated admin notification from Casa Brunelli.
      </Text>
    </BaseLayout>
  );
}
