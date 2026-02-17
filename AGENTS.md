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
| `react` | 19.2.4 | React Compiler — no `useMemo`/`useCallback` needed |
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

## File Organization

```
proxy.ts                     ← Route protection (NOT middleware.ts)
prisma.config.ts             ← Prisma v7 config (url, directUrl, seed)
prisma/schema.prisma         ← 10 models (see below)
app/
  globals.css                ← @import "tailwindcss" + CSS vars + @theme
  page.tsx                   ← Landing → HomeLanding client component
  availability/ booking/ contact/ gallery/   ← Public pages
  (admin)/admin/             ← Route group — Dashboard, Bookings, Messages, Pricing, Settings
  (auth)/admin/login/        ← Login page
  api/                       ← Public + admin API routes
components/
  ui/                        ← Atoms (Eyebrow, SectionHeading, Button, Card, FadeInView)
  shared/                    ← Molecules (SectionHeader, FeatureCard)
  public/                    ← Organisms (HomeLanding, Calendar, BookingForm, etc.)
  admin/                     ← Admin components (Shell, Client pages, atoms)
lib/
  auth.ts      constants.ts      pricing.ts      prisma.ts      utils.ts
types/index.ts               ← Domain types mirroring Prisma schema
```

**Prisma models (10):** Booking, ContactMessage, Season, DowOverride, AdminUser,
UnavailableDate, GuestUser, EmailTemplate, PaymentTransaction, AuditLog.

---

## Import Order

```tsx
// 1. Next.js / React
import type { Metadata } from "next";
import { useState } from "react";
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

---

## TypeScript

- `interface` for object shapes. `type` for unions / derived types.
- Explicit return types on all exported functions.
- `Readonly<Props>` for immutable component props.
- `unknown` instead of `any` — narrow with `instanceof`.
- All enums live in `lib/constants.ts` — never inline string literals.

---

## Component Structure

```tsx
"use client";                              // First line if client
// ─── Imports ─────────────────────────
// ─── Types ───────────────────────────
// ─── Constants ───────────────────────
// ─── Component ───────────────────────
export function Name({ title }: Props) {
  // 1. Hooks → 2. Derived → 3. Handlers → return JSX
}
```

## Naming

| Thing | Convention | Example |
|---|---|---|
| Components | PascalCase file + export | `BookingCard.tsx` |
| Hooks | `use` prefix | `useAuth.ts` |
| Constants | SCREAMING_SNAKE + `as const` | `BOOKING_STATUS` |
| Types | PascalCase | `BookingStatus` |
| API routes | `route.ts` in `app/api/*/` | — |

---

## Tailwind v4 + Design System

**NEVER** hex in `className` — use `style={{}}` with CSS vars or inline hex:
```tsx
// ✅ style={{ backgroundColor: "var(--dark-forest)" }}
// ✅ style={{ color: "#2D3A2E" }}
// ❌ className="bg-[#2D3A2E]"
```

Always use `cn()` for conditional classes.

**Tokens:** `--dark-forest` #2D3A2E · `--medium-green` #3D5243 · `--sage-variant` #8B9D83
`--terracotta-gold` #C0AF7E · `--cream` #F5F3EF · `--forest-green` #1A4A3A · `--golden-wheat` #F5DEB3

**Layout:** `max-w-[1400px] mx-auto px-6 lg:px-8`

---

## Error Handling

```tsx
// API — always structured { success, data/error }
return Response.json({ success: true, data: result });
return Response.json({ success: false, error: "msg" }, { status: 500 });

// Client — sonner toasts
toast.success("Saved!"); toast.error("Something went wrong.");
```

---

## Key Constraints

1. **Messages-First** — public forms → `ContactMessage`, never `Booking` directly
2. **Prisma singleton** — `import { prisma } from "@/lib/prisma"`, never `new PrismaClient()`
3. **`proxy.ts`** — route protection, NOT `middleware.ts`
4. **Stripe** — deposit 30 %, balance 70 %, link expires 24h
5. **Comments:** `// ─── Section ───` (minor) · `// ═══ Major ═══` (major) · JSDoc for exports

## Environment Variables

```bash
DATABASE_URL=       # PostgreSQL
AUTH_SECRET=        # NextAuth JWT secret
AUTH_TRUST_HOST=    # true in production
DIRECT_URL=         # Direct DB (prisma.config.ts)
```
