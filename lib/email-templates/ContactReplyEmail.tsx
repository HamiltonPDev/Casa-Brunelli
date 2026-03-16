/**
 * Casa Brunelli — Contact Reply Email
 *
 * Generic reply from admin to a guest who contacted via the
 * public form. Clean layout with the reply text and a
 * reference to the original message subject.
 */

import {
  Section,
  Heading,
  Text,
  Hr,
} from "@react-email/components";
import { BaseLayout } from "./BaseLayout";
import { BRAND } from "./brand";
import type { ContactReplyEmailProps } from "@/types";

// ─── Component ───────────────────────────────────────────────

export function ContactReplyEmail({
  guestName,
  replyText,
  originalSubject,
}: Readonly<ContactReplyEmailProps>): React.ReactElement {
  return (
    <BaseLayout preview={`Reply from Casa Brunelli regarding: ${originalSubject}`}>
      <Heading
        as="h1"
        style={{
          fontSize: "24px",
          fontWeight: 700,
          color: BRAND.darkForest,
          margin: "0 0 8px 0",
        }}
      >
        A Message From Casa Brunelli
      </Heading>
      <Text
        style={{
          fontSize: "16px",
          color: BRAND.gray,
          margin: "0 0 24px 0",
        }}
      >
        Dear {guestName},
      </Text>

      {/* ─── Reply Content ─── */}
      <Section
        style={{
          padding: "0 0 24px 0",
        }}
      >
        <Text
          style={{
            fontSize: "15px",
            color: BRAND.darkForest,
            lineHeight: "1.7",
            margin: 0,
            whiteSpace: "pre-wrap" as const,
          }}
        >
          {replyText}
        </Text>
      </Section>

      {/* ─── Original Message Reference ─── */}
      <Hr
        style={{
          borderColor: BRAND.lightGray,
          margin: "0 0 24px 0",
        }}
      />
      <Section
        style={{
          backgroundColor: "#f9fafb",
          padding: "16px",
          borderRadius: "6px",
          borderLeft: `3px solid ${BRAND.sage}`,
        }}
      >
        <Text
          style={{
            fontSize: "12px",
            fontWeight: 600,
            color: BRAND.sage,
            margin: "0 0 4px 0",
            textTransform: "uppercase" as const,
            letterSpacing: "1px",
          }}
        >
          In response to
        </Text>
        <Text
          style={{
            fontSize: "14px",
            color: BRAND.gray,
            margin: 0,
          }}
        >
          {originalSubject}
        </Text>
      </Section>

      {/* ─── Closing ─── */}
      <Section style={{ marginTop: "32px" }}>
        <Text
          style={{
            fontSize: "14px",
            color: BRAND.gray,
            margin: "0 0 4px 0",
          }}
        >
          Warm regards,
        </Text>
        <Text
          style={{
            fontSize: "14px",
            fontWeight: 600,
            color: BRAND.darkForest,
            margin: "0",
          }}
        >
          The Casa Brunelli Team
        </Text>
      </Section>
    </BaseLayout>
  );
}
