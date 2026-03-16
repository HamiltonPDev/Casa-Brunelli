/**
 * Casa Brunelli — Advance Payment Link Email
 *
 * Sent when admin promotes a booking request and generates
 * a Stripe Checkout link for the 30% advance.
 * Includes 24-hour expiry notice.
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
import type { AdvancePaymentLinkEmailProps } from "@/types";

// ─── Component ───────────────────────────────────────────────

export function AdvancePaymentLinkEmail({
  guestName,
  checkIn,
  checkOut,
  numberOfNights,
  totalPrice,
  advanceAmount,
  checkoutUrl,
}: Readonly<AdvancePaymentLinkEmailProps>): React.ReactElement {
  const formatEur = (amount: number): string =>
    new Intl.NumberFormat("en", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <BaseLayout preview={`Your booking request has been approved — pay ${formatEur(advanceAmount)} to confirm`}>
      <Heading
        as="h1"
        style={{
          fontSize: "24px",
          fontWeight: 700,
          color: BRAND.darkForest,
          margin: "0 0 8px 0",
        }}
      >
        Your Booking Is Approved
      </Heading>
      <Text
        style={{
          fontSize: "16px",
          color: BRAND.gray,
          margin: "0 0 24px 0",
        }}
      >
        Dear {guestName}, great news! Your booking request for Casa
        Brunelli has been approved. Please complete the advance
        payment to confirm your reservation.
      </Text>

      {/* ─── Booking Summary ─── */}
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
        <DetailRow label="Total Stay" value={formatEur(totalPrice)} />
        <DetailRow
          label="Advance Due (30%)"
          value={formatEur(advanceAmount)}
          highlight
        />
        <DetailRow
          label="Balance (70%)"
          value={formatEur(totalPrice - advanceAmount)}
        />
      </Section>

      {/* ─── CTA ─── */}
      <Section style={{ textAlign: "center" as const, marginTop: "32px" }}>
        <Button
          href={checkoutUrl}
          style={{
            backgroundColor: BRAND.terracottaGold,
            color: BRAND.darkForest,
            padding: "16px 40px",
            borderRadius: "6px",
            fontSize: "16px",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Pay Advance ({formatEur(advanceAmount)})
        </Button>
      </Section>

      {/* ─── Expiry Notice ─── */}
      <Section
        style={{
          backgroundColor: "#fef3cd",
          padding: "16px 20px",
          borderRadius: "6px",
          marginTop: "24px",
          border: "1px solid #f0e1a1",
        }}
      >
        <Text
          style={{
            fontSize: "13px",
            color: "#856404",
            margin: 0,
            textAlign: "center" as const,
          }}
        >
          This payment link expires in <strong>24 hours</strong>. If
          it expires, please contact us and we will send a new one.
        </Text>
      </Section>

      {/* ─── Payment Details ─── */}
      <Hr
        style={{
          borderColor: BRAND.lightGray,
          margin: "32px 0 24px 0",
        }}
      />
      <Text
        style={{
          fontSize: "14px",
          color: BRAND.gray,
          margin: "0 0 8px 0",
        }}
      >
        The remaining balance of {formatEur(totalPrice - advanceAmount)} will
        be due 30 days before your check-in date. We will send you a
        separate payment link when it is time.
      </Text>
      <Text
        style={{
          fontSize: "13px",
          color: BRAND.gray,
          margin: "0",
        }}
      >
        Payments are processed securely via Stripe. We never store
        your card details.
      </Text>
    </BaseLayout>
  );
}
