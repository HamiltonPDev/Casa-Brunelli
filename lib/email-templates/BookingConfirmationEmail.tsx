/**
 * Casa Brunelli — Booking Confirmation Email
 *
 * Sent after the advance payment (30%) is confirmed via Stripe webhook.
 * Shows booking details, amount paid, and remaining balance.
 */

import {
  Section,
  Heading,
  Text,
  Button,
  Hr,
} from "@react-email/components";
import { BaseLayout } from "./BaseLayout";
import { BRAND } from "./brand";
import { DetailRow } from "./DetailRow";
import type { BookingConfirmationEmailProps } from "@/types";

// ─── Component ───────────────────────────────────────────────

export function BookingConfirmationEmail({
  guestName,
  checkIn,
  checkOut,
  numberOfNights,
  totalPaid,
  balanceRemaining,
  villaAddress,
  appUrl,
  bookingId,
}: Readonly<BookingConfirmationEmailProps>): React.ReactElement {
  const formatEur = (amount: number): string =>
    new Intl.NumberFormat("en", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <BaseLayout preview={`Your booking at Casa Brunelli is confirmed — ${checkIn} to ${checkOut}`}>
      <Heading
        as="h1"
        style={{
          fontSize: "24px",
          fontWeight: 700,
          color: BRAND.darkForest,
          margin: "0 0 8px 0",
        }}
      >
        Booking Confirmed
      </Heading>
      <Text
        style={{
          fontSize: "16px",
          color: BRAND.gray,
          margin: "0 0 24px 0",
        }}
      >
        Dear {guestName}, your stay at Casa Brunelli has been
        confirmed. We look forward to welcoming you!
      </Text>

      {/* ─── Booking Details ─── */}
      <Section
        style={{
          backgroundColor: BRAND.cream,
          padding: "24px",
          borderRadius: "8px",
          border: `1px solid ${BRAND.lightGray}`,
        }}
      >
        <DetailRow label="Check-in" value={checkIn} />
        <DetailRow label="Check-out" value={checkOut} />
        <DetailRow
          label="Duration"
          value={`${numberOfNights} night${numberOfNights > 1 ? "s" : ""}`}
        />
        <Hr
          style={{
            borderColor: BRAND.lightGray,
            margin: "12px 0",
          }}
        />
        <DetailRow
          label="Advance Paid"
          value={formatEur(totalPaid)}
          highlight
        />
        <DetailRow
          label="Balance Due"
          value={formatEur(balanceRemaining)}
        />
      </Section>

      {/* ─── Villa Address ─── */}
      <Section style={{ marginTop: "24px" }}>
        <Text
          style={{
            fontSize: "13px",
            fontWeight: 600,
            color: BRAND.darkForest,
            margin: "0 0 4px 0",
            textTransform: "uppercase" as const,
            letterSpacing: "1px",
          }}
        >
          Villa Location
        </Text>
        <Text
          style={{
            fontSize: "14px",
            color: BRAND.gray,
            margin: 0,
          }}
        >
          {villaAddress}
        </Text>
      </Section>

      {/* ─── CTA ─── */}
      <Section style={{ textAlign: "center" as const, marginTop: "32px" }}>
        <Button
          href={`${appUrl}/booking/${bookingId}/success`}
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
          View Your Booking
        </Button>
      </Section>

      {/* ─── Next Steps ─── */}
      <Hr
        style={{
          borderColor: BRAND.lightGray,
          margin: "32px 0 24px 0",
        }}
      />
      <Text
        style={{
          fontSize: "14px",
          fontWeight: 600,
          color: BRAND.darkForest,
          margin: "0 0 12px 0",
        }}
      >
        What happens next?
      </Text>
      <Text
        style={{ fontSize: "14px", color: BRAND.gray, margin: "0 0 8px 0" }}
      >
        1. You will receive check-in instructions 24 hours before arrival.
      </Text>
      <Text
        style={{ fontSize: "14px", color: BRAND.gray, margin: "0 0 8px 0" }}
      >
        2. The remaining balance ({formatEur(balanceRemaining)}) is due 30 days
        before check-in.
      </Text>
      <Text
        style={{ fontSize: "14px", color: BRAND.gray, margin: "0 0 8px 0" }}
      >
        3. We will send you a payment link for the balance when it is due.
      </Text>
    </BaseLayout>
  );
}
