/**
 * Casa Brunelli — Admin New Contact Notification Email
 *
 * Sent to admin when a general contact form is submitted
 * (not a booking request — no dates or pricing).
 */

import { Section, Heading, Text, Button, Hr } from "@react-email/components";
import { BaseLayout } from "./BaseLayout";
import { BRAND } from "./brand";

// ─── Types ───────────────────────────────────────────────────

interface AdminNewContactEmailProps {
  guestName: string;
  guestEmail: string;
  subject: string;
  message: string;
  dashboardUrl: string;
  messageId: string;
}

// ─── Component ───────────────────────────────────────────────

export function AdminNewContactEmail({
  guestName,
  guestEmail,
  subject,
  message,
  dashboardUrl,
  messageId,
}: Readonly<AdminNewContactEmailProps>): React.ReactElement {
  return (
    <BaseLayout
      preview={`New contact message from ${guestName} — ${subject}`}
    >
      <Section
        style={{
          backgroundColor: "#e0e7ff",
          padding: "12px 16px",
          borderRadius: "6px",
          marginBottom: "24px",
          border: "1px solid #a5b4fc",
        }}
      >
        <Text
          style={{
            fontSize: "13px",
            color: "#3730a3",
            margin: 0,
            fontWeight: 600,
            textAlign: "center" as const,
          }}
        >
          New Contact Message
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
        {subject}
      </Heading>

      {/* ─── Sender Info ─── */}
      <Section
        style={{
          backgroundColor: BRAND.cream,
          padding: "24px",
          borderRadius: "8px",
          border: `1px solid ${BRAND.lightGray}`,
          marginBottom: "24px",
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
          From
        </Text>
        <Text
          style={{
            fontSize: "14px",
            margin: "0 0 4px 0",
            color: BRAND.darkForest,
          }}
        >
          <strong>{guestName}</strong>
        </Text>
        <Text
          style={{
            fontSize: "14px",
            margin: 0,
            color: BRAND.gray,
          }}
        >
          {guestEmail}
        </Text>
      </Section>

      {/* ─── Message Content ─── */}
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
            lineHeight: "1.7",
            whiteSpace: "pre-wrap" as const,
          }}
        >
          {message}
        </Text>
      </Section>

      {/* ─── CTA ─── */}
      <Section style={{ textAlign: "center" as const, marginTop: "32px" }}>
        <Button
          href={`${dashboardUrl}/admin/messages`}
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
          View in Dashboard
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
