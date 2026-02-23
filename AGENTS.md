# Casa Brunelli — Agent Coding Guidelines

## Project Overview

Luxury Tuscan villa direct-booking platform. Replaces OTA dependency (saves €11-15k/year).
Next.js 16 App Router · React 19 · Tailwind CSS 4 · Prisma 7 · NextAuth v5 · PostgreSQL.

**Business model — Messages-First:** ALL inquiries → `ContactMessage` → admin promotes to `Booking`.
No guest-facing auth. Admin-only credentials auth. Deposit = 30 %, balance = 70 %.

---

## Commands

```bash
npm run dev                  # Next.js 16 + Turbopack
npm run lint                 # ESLint (eslint-config-next)

# TypeScript check — MUST pass 0 errors before finishing any task
npx tsc --noEmit 2>&1 | grep -v "Interactive Web Prototypes" | grep -v "^$"

npm run build && npm start   # Production build

# Database
npx prisma migrate dev       # Apply migrations
npx prisma db seed           # tsx prisma/seed.ts (configured in prisma.config.ts)
npx prisma studio            # Visual DB browser
```

> **No test runner configured.** Ask before adding Vitest/Jest.
> **No commits** without explicit user approval.
> LSP errors in `Interactive Web Prototypes casa brunelly/` are IDE ghosts — ignore them.

---

## Critical Version Constraints — DO NOT CHANGE

| Package | Version | Rule |
|---|---|---|
| `next` | 16.1.6 | Uses `proxy.ts` in root, **NOT** `middleware.ts` |
| `react` | 19.2.4 | React Compiler — **no** `useMemo`/`useCallback` |
| `framer-motion` | ^12.34.0 | Import from `"framer-motion"` — **NOT** `"motion/react"` |
| `zod` | ^4.3.6 | Import from `"zod/v4"` — **NOT** `"zod"` |
| `sonner` | ^2.0.7 | Import from `"sonner"` |
| `next-auth` | ^5.0.0-beta.30 | Credentials only, no OAuth |
| `prisma` | ^7.3.0 | DB url in `prisma.config.ts`, **NOT** `schema.prisma` |
| `tailwindcss` | ^4 | `@import "tailwindcss"` — no `@tailwind` directives |

### Next.js 16 — Async Params
`params` AND `searchParams` are **Promises** in Server Components:
```tsx
export default async function Page({ params }: Props) {
  const { id } = await params;
}
```

---

## File Organization — Atomic Design

```
proxy.ts                     ← Route protection (NOT middleware.ts)
prisma.config.ts             ← Prisma v7 config (url, directUrl, seed)
prisma/schema.prisma         ← 10 models
app/
  globals.css                ← @import "tailwindcss" + CSS vars + @theme
  page.tsx                   ← Landing → HomeLanding client component
  availability/ booking/ contact/ gallery/   ← Public pages
  (admin)/admin/             ← Route group — Dashboard, Bookings, Messages, Pricing, Settings
  (auth)/admin/login/        ← Login page
  api/                       ← Public + admin API routes
components/
  ui/                        ← UI primitives — single elements, no composition
    public/                  ← Button, Card, FormField, Eyebrow, SectionHeading, FadeInView
    admin/                   ← AdminCard, AdminButton, AdminField, AdminBadge
  shared/                    ← Composed reusable blocks (2-3 ui primitives together)
    public/                  ← SectionHeader, FeatureCard, SuccessConfirmation
  features/                  ← Complex self-contained sections, organized by domain
    public/                  ← PublicNav, PublicFooter, HomeLanding, BookingForm, ContactForm, GalleryClient, AvailabilityCalendar
    admin/                   ← CalendarWidget, BookingsClient, BookingDetailClient, MessagesClient, SeasonalPricingClient, SettingsClient
  layouts/                   ← Page-level layout scaffolding
    admin/                   ← AdminShell (sidebar + topbar + content layout)
lib/
  auth.ts                    ← NextAuth v5 config
  constants.ts               ← ALL enums + business rules + COUNTRIES + QUICK_REPLIES (const object + type extraction)
  pricing.ts                 ← calculateNightlyRate, calculateBookingTotal
  prisma.ts                  ← Prisma singleton — ALWAYS import from here
  utils.ts                   ← cn, formatCurrency, formatDateShort, formatDateLong, formatEur, getInitials, formatDateRange, formatMessageDate, formatFullDate
  validations/admin.ts       ← Centralized Zod schemas for admin API routes
  services/                  ← Client-side typed fetch wrappers (see Service Layer below)
types/index.ts               ← Domain types mirroring Prisma schema
```

### Atomic Design Levels

| Level | Folder | Rule | Public examples | Admin examples |
|---|---|---|---|---|
| **Atoms** | `ui/` | Single HTML element, no composition | Button, Card, FormField | AdminCard, AdminButton, AdminBadge |
| **Molecules** | `shared/` | 2-3 atoms composed together | SectionHeader (Eyebrow + SectionHeading), FeatureCard | — |
| **Organisms** | `features/` | Complex, self-contained UI sections | BookingForm, HomeLanding, PublicNav | CalendarWidget, BookingsClient |
| **Templates** | `layouts/` | Page-level layout scaffolding | — | AdminShell (sidebar + topbar + content) |
| **Pages** | `app/` | Route files — Server Components that compose organisms | `app/page.tsx`, `app/booking/page.tsx` | `app/(admin)/admin/page.tsx` |

### Where does a new component go?

1. **Single element** (button, input, badge, card) → `ui/public/` or `ui/admin/`
2. **Composes 2-3 atoms** (header block, feature card) → `shared/public/`
3. **Self-contained section** (form, table, nav, footer) → `features/public/` or `features/admin/`
4. **Page layout shell** (sidebar + content area) → `layouts/admin/`
5. **Route entry point** → `app/` (Server Component that fetches data + renders organisms)

**Prisma models (10):** Booking, ContactMessage, Season, DowOverride, AdminUser,
UnavailableDate, GuestUser, EmailTemplate, PaymentTransaction, AuditLog.

---

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
import { updateBooking } from "@/lib/services/bookings";
import type { Booking } from "@/types";
// 4. Relative (only when necessary)
import { SomeHelper } from "./helpers";
```

---

## TypeScript

- `interface` for object shapes. `type` for unions / derived types.
- Explicit return types on all exported functions.
- `Readonly<Props>` for immutable component props.
- `unknown` instead of `any` — narrow with `instanceof` or type guards.
- **Const object pattern** for enums — never bare string unions:
  ```ts
  export const BOOKING_STATUS = { PENDING: "PENDING", ... } as const;
  export type BookingStatus = (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];
  ```
- All enums live in `lib/constants.ts` — never inline string literals.

---

## React 19 + Component Structure

```tsx
"use client";                              // First line if client
// ─── Imports ─────────────────────────
// ─── Types ───────────────────────────
// ─── Constants ───────────────────────
// ─── Private Sub-Components ──────────  (for organisms with 400+ lines)
// ─── Component ───────────────────────
export function Name({ title }: Readonly<Props>) {
  // 1. Hooks → 2. Derived → 3. Handlers → return JSX
}
```

- **No `useMemo` / `useCallback`** — React Compiler handles optimization.
- **`useTransition`** for async mutations — batches state updates, provides `isPending`.
- **No `forwardRef`** — in React 19, `ref` is a regular prop.
- **Named imports only:** `import { useState } from "react"` — never `import React`.

---

## Service Layer (`lib/services/`)

Client components call **service functions** — never inline `fetch`.
Services use `lib/services/client.ts` which returns `ApiResult<T>`:

```tsx
// In component:
const result = await blockDates(dateStrings, reason);
if (!result.success) { toast.error(result.error); return; }
setBlockedDates((prev) => [...prev, ...newBlocked]);
```

**Services:** `bookings.ts` · `messages.ts` · `seasons.ts` · `unavailable-dates.ts` · `booking-request.ts`

---

## API Routes — Response Contract

ALL API routes return this shape:
```ts
// Success — single payload:
Response.json({ success: true, data: result });
// Success — with pagination siblings:
Response.json({ success: true, data: items, pagination: { total, page, perPage, totalPages } });
// Error:
Response.json({ success: false, error: "msg" }, { status: 4xx/5xx });
```

**Validation:** Every admin POST/PATCH route uses Zod schemas from `lib/validations/admin.ts`.
**Auth:** Every admin route checks `const session = await auth()` + proxy.ts defense-in-depth.

---

## Naming

| Thing | Convention | Example |
|---|---|---|
| Components | PascalCase file + export | `BookingCard.tsx` |
| Hooks | `use` prefix | `useAuth.ts` |
| Constants | SCREAMING_SNAKE + `as const` | `BOOKING_STATUS` |
| Types | PascalCase | `BookingStatus` |
| Services | camelCase functions | `blockDates()`, `updateSeason()` |
| API routes | `route.ts` in `app/api/*/` | — |
| Comments | `// ─── Section ───` minor · `// ═══ Major ═══` major · JSDoc for exports |

---

## Tailwind v4 + Design System

**NEVER** hex in `className` — use `style={{}}` with CSS vars or inline hex:
```tsx
// ✅ style={{ backgroundColor: "var(--dark-forest)" }}
// ✅ style={{ color: "#2D3A2E" }}
// ❌ className="bg-[#2D3A2E]"
```

Always use `cn()` for conditional classes.

**Core tokens:** `--dark-forest` #2D3A2E · `--medium-green` #3D5243 · `--sage-variant` #8B9D83
`--terracotta-gold` #C0AF7E · `--cream` #F5F3EF · `--forest-green` #1A4A3A · `--golden-wheat` #F5DEB3

**Gradient tints:** `--mint-pale` #EEF4EE · `--mint-light` #F0F7F0 · `--warm-honey` #FFF8ED · `--warm-sand` #F0EDE8

**Status backgrounds:** `--status-confirmed-bg` #E9F5EC · `--status-cancelled-bg` #FEF2F2 · `--status-completed-bg` #EFF6FF

**Tailwind token classes** (via `@theme` bridge in globals.css): `bg-forest-green`, `text-forest-green`, `bg-admin-sage`, `text-admin-sage`, `bg-admin-avatar`, `text-status-confirmed`, `border-status-confirmed`, etc.

**Tailwind v4 canonical classes** — use these, NOT the legacy forms:
- `shrink-0` not `flex-shrink-0`
- `max-w-350` not `max-w-[1400px]`
- `bg-linear-to-br` not `bg-gradient-to-br`
- `z-200` not `z-[200]`

**Layout:** `max-w-350 mx-auto px-6 lg:px-8`

---

## Error Handling

```tsx
// API routes — structured response + Zod
const parsed = schema.safeParse(body);
if (!parsed.success) return validationError(parsed.error); // from lib/validations/admin.ts
return Response.json({ success: true, data: result });
return Response.json({ success: false, error: "msg" }, { status: 500 });

// Client components — service layer + sonner toasts
const result = await updateBooking(id, data);
if (!result.success) { toast.error(result.error); return; }
toast.success("Booking updated");
```

---

## Key Constraints

1. **Messages-First** — public forms → `ContactMessage`, never `Booking` directly
2. **Prisma singleton** — `import { prisma } from "@/lib/prisma"`, never `new PrismaClient()`
3. **`proxy.ts`** — route protection, NOT `middleware.ts` (Next.js 16)
4. **Stripe** — deposit 30 %, balance 70 %, link expires 24h
5. **Decimal → number** — `types/index.ts` uses `number`; Prisma `Decimal` is serialized in server components before passing to client

## Environment Variables

```bash
DATABASE_URL=       # PostgreSQL
AUTH_SECRET=        # NextAuth JWT secret
AUTH_TRUST_HOST=    # true in production
DIRECT_URL=         # Direct DB (prisma.config.ts)
```
