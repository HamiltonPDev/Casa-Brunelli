/**
 * Casa Brunelli — Balance Reminder Email
 *
 * Sent 30 days before check-in (first reminder) and at 7 days
 * (urgent reminder). Shows remaining balance and countdown.
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
import type { BalanceReminderEmailProps } from "@/types";

// ─── Component ───────────────────────────────────────────────

export function BalanceReminderEmail({
  guestName,
  checkIn,
  checkOut,
  balanceAmount,
  checkoutUrl,
  daysUntilCheckIn,
}: Readonly<BalanceReminderEmailProps>): React.ReactElement {
  const formatEur = (amount: number): string =>
    new Intl.NumberFormat("en", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  const isUrgent = daysUntilCheckIn <= 7;

  return (
    <BaseLayout
      preview={`Balance reminder: ${formatEur(balanceAmount)} due — ${daysUntilCheckIn} days until check-in`}
    >
      <Heading
        as="h1"
        style={{
          fontSize: "24px",
          fontWeight: 700,
          color: BRAND.darkForest,
          margin: "0 0 8px 0",
        }}
      >
        {isUrgent ? "Urgent: Balance Payment Due" : "Balance Payment Reminder"}
      </Heading>
      <Text
        style={{
          fontSize: "16px",
          color: BRAND.gray,
          margin: "0 0 24px 0",
        }}
      >
        Dear {guestName}, your stay at Casa Brunelli is approaching!
        Please complete the remaining balance payment to finalise
        your reservation.
      </Text>

      {/* ─── Countdown ─── */}
      <Section
        style={{
          textAlign: "center" as const,
          padding: "24px",
          backgroundColor: isUrgent ? "#fef2f2" : BRAND.cream,
          borderRadius: "8px",
          border: `1px solid ${isUrgent ? "#fecaca" : BRAND.lightGray}`,
          marginBottom: "24px",
        }}
      >
        <Text
          style={{
            fontSize: "48px",
            fontWeight: 700,
            color: isUrgent ? "#dc2626" : BRAND.darkForest,
            margin: "0",
            lineHeight: 1,
          }}
        >
          {daysUntilCheckIn}
        </Text>
        <Text
          style={{
            fontSize: "14px",
            color: isUrgent ? "#991b1b" : BRAND.gray,
            margin: "4px 0 0 0",
            textTransform: "uppercase" as const,
            letterSpacing: "2px",
          }}
        >
          days until check-in
        </Text>
      </Section>

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
        <Hr
          style={{
            borderColor: BRAND.lightGray,
            margin: "12px 0",
          }}
        />
        <DetailRow
          label="Balance Due"
          value={formatEur(balanceAmount)}
          highlight
        />
      </Section>

      {/* ─── CTA ─── */}
      <Section style={{ textAlign: "center" as const, marginTop: "32px" }}>
        <Button
          href={checkoutUrl}
          style={{
            backgroundColor: isUrgent ? "#dc2626" : BRAND.terracottaGold,
            color: isUrgent ? "#ffffff" : BRAND.darkForest,
            padding: "16px 40px",
            borderRadius: "6px",
            fontSize: "16px",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Pay Balance ({formatEur(balanceAmount)})
        </Button>
      </Section>

      {/* ─── Help Text ─── */}
      <Hr
        style={{
          borderColor: BRAND.lightGray,
          margin: "32px 0 24px 0",
        }}
      />
      <Text
        style={{
          fontSize: "13px",
          color: BRAND.gray,
          margin: "0",
        }}
      >
        If you have already made this payment, please disregard this
        email. For any questions or to discuss payment arrangements,
        reply to this email or contact us at{" "}
        <span style={{ color: BRAND.terracottaGold }}>
          info@casabrunelli.com
        </span>
        .
      </Text>
    </BaseLayout>
  );
}
