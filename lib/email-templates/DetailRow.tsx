/**
 * Casa Brunelli — DetailRow Email Sub-Component
 *
 * Shared label–value row used across booking-related email
 * templates. Supports optional highlight (terracotta gold).
 */

import { Text } from "@react-email/components";
import { BRAND } from "./brand";

// ─── Types ───────────────────────────────────────────────────

interface DetailRowProps {
  label: string;
  value: string;
  highlight?: boolean;
}

// ─── Component ───────────────────────────────────────────────

export function DetailRow({
  label,
  value,
  highlight = false,
}: Readonly<DetailRowProps>): React.ReactElement {
  return (
    <Text
      style={{
        fontSize: "14px",
        margin: "0 0 6px 0",
        color: BRAND.darkForest,
      }}
    >
      <span style={{ color: BRAND.gray }}>{label}: </span>
      <strong
        style={{
          color: highlight ? BRAND.terracottaGold : BRAND.darkForest,
        }}
      >
        {value}
      </strong>
    </Text>
  );
}
