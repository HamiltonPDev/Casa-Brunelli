# Casa Brunelli — Agent Coding Guidelines

Luxury Tuscan villa direct-booking platform. Next.js 16 · React 19 · Tailwind CSS 4 · Prisma 7 · NextAuth v5 · PostgreSQL.
**Business model:** ALL inquiries → `ContactMessage` → admin promotes to `Booking`. No guest auth. Deposit 30%, balance 70%.

## Commands

```bash
npm run dev          # Next.js 16 + Turbopack
npm run lint         # ESLint (eslint-config-next)
npm run build        # Production build

# TypeScript — MUST pass 0 errors before finishing any task
npx tsc --noEmit 2>&1 | grep -v "Interactive Web Prototypes" | grep -v "^$"

# Database
npx prisma migrate dev    # Apply migrations
npx prisma db seed        # tsx prisma/seed.ts (via prisma.config.ts)
npx prisma studio         # Visual DB browser
```

> **No test runner configured.** Ask before adding Vitest/Jest.
> **No commits** without explicit user approval.
> LSP errors in `Interactive Web Prototypes casa brunelly/` are IDE noise — ignore.

## Critical Version Constraints — DO NOT CHANGE

| Package | Version | Import / Rule |
|---|---|---|
| `next` | 16.1.6 | Uses `proxy.ts` in root — **NOT** `middleware.ts` |
| `react` | 19.2.4 | React Compiler — **no** `useMemo`/`useCallback`/`forwardRef` |
| `framer-motion` | ^12.34.0 | `import from "framer-motion"` — **NOT** `"motion/react"` |
| `zod` | ^4.3.6 | `import { z } from "zod/v4"` — uses `z.email()`, `z.uuid()` (not `.string().email()`) |
| `sonner` | ^2.0.7 | `import { toast } from "sonner"` |
| `next-auth` | ^5.0.0-beta.30 | Credentials only, no OAuth |
| `prisma` | ^7.3.0 | DB url in `prisma.config.ts` — **NOT** `schema.prisma` |
| `tailwindcss` | ^4 | `@import "tailwindcss"` — no `@tailwind` directives |

### Next.js 16 — Async Params

`params` AND `searchParams` are **Promises** in Server Components — always `await`:
```tsx
export default async function Page({ params }: Props) {
  const { id } = await params;
}
```

## File Organization — Atomic Design

```
proxy.ts                    ← Route protection (NOT middleware.ts)
prisma.config.ts            ← Prisma v7 config (url, seed)
prisma/schema.prisma        ← 10 models
app/                        ← Pages (Server Components) + API routes
  (admin)/admin/            ← Dashboard, Bookings, Messages, Pricing, Settings
  (auth)/admin/login/       ← Login page
  api/                      ← Public + admin API routes
components/
  ui/{public,admin}/        ← Atoms — single elements (Button, AdminCard, AdminBadge)
  shared/public/            ← Molecules — 2-3 atoms composed (SectionHeader, FeatureCard)
  features/{public,admin}/  ← Organisms — complex sections (BookingForm, CalendarWidget)
  layouts/admin/            ← Templates — page scaffolding (AdminShell)
lib/
  auth.ts                   ← NextAuth v5 + RBAC guards (requireAuth/requireWrite/requireSuperAdmin)
  constants.ts              ← ALL enums + business rules (const object + type extraction)
  pricing.ts                ← calculateNightlyRate, calculateBookingTotal
  prisma.ts                 ← Prisma singleton — ALWAYS import from here
  stripe.ts                 ← Stripe singleton — ALWAYS import from here
  utils.ts                  ← cn(), formatCurrency, formatEur, getInitials, date formatters
  validations/admin.ts      ← Centralized Zod schemas for admin API routes
  services/                 ← Client-side typed fetch wrappers (ApiResult<T>)
types/index.ts              ← Domain types mirroring Prisma schema
```

## Import Order

```tsx
// 1. Next.js / React
import type { Metadata } from "next";
import { useState, useTransition } from "react";
// 2. External libs
import { motion } from "framer-motion";
import { z } from "zod/v4";
import { toast } from "sonner";
// 3. Internal absolute (@/*)
import { cn } from "@/lib/utils";
import { BOOKING_STATUS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import type { Booking } from "@/types";
// 4. Relative (only when necessary)
import { SomeHelper } from "./helpers";
```

## TypeScript & Naming

- `interface` for object shapes. `type` for unions / derived types.
- Explicit return types on all exported functions.
- `Readonly<Props>` for component props. `unknown` over `any`.
- **Const object pattern** for enums — all live in `lib/constants.ts`:
  ```ts
  export const BOOKING_STATUS = { PENDING: "PENDING", ... } as const;
  export type BookingStatus = (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];
  ```
- **Components:** PascalCase file + export. **Services:** camelCase functions. **Constants:** SCREAMING_SNAKE.
- **Comments:** `// ─── Section ───` minor · `// ═══ Major ═══` major · JSDoc for exports.

## React 19 + Component Structure

```tsx
"use client";                              // First line if client
// ─── Imports ─────────────────────────
// ─── Types ───────────────────────────
// ─── Constants ───────────────────────
// ─── Private Sub-Components ──────────  (for organisms 400+ lines)
// ─── Component ───────────────────────
export function Name({ title }: Readonly<Props>) {
  // 1. Hooks → 2. Derived → 3. Handlers → return JSX
}
```

- **No `useMemo`/`useCallback`** — React Compiler. **No `forwardRef`** — `ref` is a prop in React 19.
- **`useTransition`** for async mutations. **Named imports only** — never `import React`.

## Service Layer & API Response Contract

Client components call `lib/services/` — **never inline `fetch`**. Services return `ApiResult<T>`:
```tsx
const result = await updateBooking(id, data);
if (!result.success) { toast.error(result.error); return; }
toast.success("Booking updated");
```

ALL API routes return:
```ts
Response.json({ success: true, data: result });                              // Success
Response.json({ success: true, data: items, pagination: { ... } });          // Paginated
Response.json({ success: false, error: "msg" }, { status: 4xx });            // Error
```

## RBAC — Route Guards

Every admin API route uses guards from `lib/auth.ts`:
```ts
const { session, denied } = await requireWrite();  // or requireAuth(), requireSuperAdmin()
if (denied) return denied;
// session.user is typed: { id, email, name, role }
```

Validation: every admin POST/PATCH uses Zod schemas from `lib/validations/admin.ts`:
```ts
const parsed = schema.safeParse(body);
if (!parsed.success) return validationError(parsed.error);
```

## Tailwind v4 + Design System

**NEVER hex in `className`** — use `style={{}}` or CSS var tokens:
```tsx
// ✅ style={{ backgroundColor: "var(--dark-forest)" }}
// ❌ className="bg-[#2D3A2E]"
```

Always use `cn()` for conditional classes. **Canonical v4 classes:**
`shrink-0` not `flex-shrink-0` · `bg-linear-to-br` not `bg-gradient-to-br` · `max-w-350` not `max-w-[1400px]`

**Core tokens:** `--dark-forest` · `--forest-green` · `--sage-variant` · `--terracotta-gold` · `--cream`
**Layout:** `max-w-350 mx-auto px-6 lg:px-8`

## Key Constraints

1. **Messages-First** — public forms → `ContactMessage`, never `Booking` directly
2. **Prisma singleton** — `import { prisma } from "@/lib/prisma"` — never `new PrismaClient()`
3. **Stripe singleton** — `import from "@/lib/stripe"` — never instantiate Stripe directly
4. **`proxy.ts`** — route protection — NOT `middleware.ts` (Next.js 16)
5. **Decimal → number** — `types/index.ts` uses `number`; Prisma `Decimal` serialized in RSC before client

## Environment Variables

```bash
DATABASE_URL=            # PostgreSQL (pooled)
DIRECT_URL=              # Direct DB connection (prisma.config.ts)
AUTH_SECRET=             # NextAuth JWT secret (32+ chars)
AUTH_TRUST_HOST=true     # Required in production
STRIPE_SECRET_KEY=       # Stripe server key (sk_...)
STRIPE_WEBHOOK_SECRET=   # Stripe webhook signing secret (whsec_...)
NEXT_PUBLIC_APP_URL=     # Public URL for Stripe success/cancel redirects
```
