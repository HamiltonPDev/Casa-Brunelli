# Casa Brunelli — Agent Coding Guidelines

## Project Overview

Luxury villa rental booking platform (Tuscany). Direct booking site to avoid OTA commissions.
Next.js 16 App Router · React 19 · Tailwind CSS 4 · Prisma 7 · NextAuth v5 · PostgreSQL.

**Business model:** Messages-First — ALL inquiries enter as `ContactMessage`, admin promotes to `Booking`.
No guest-facing auth. Admin-only credentials auth. Deposit = 30%, balance = 70%.

---

## Commands

```bash
# Dev
npm run dev                  # Next.js 16 + Turbopack

# Quality — run BOTH before finishing any task
npm run lint                 # ESLint (eslint-config-next)
npx tsc --noEmit 2>&1 | grep -v "Interactive Web Prototypes" | grep -v "^$"

# Build
npm run build && npm start

# Database
npx prisma migrate dev       # Run migrations
npx prisma db seed           # Uses tsx prisma/seed.ts (Prisma v7 config)
npx prisma studio            # Visual DB browser
```

> **No test runner configured.** Ask before adding Vitest or Jest.

---

## Critical Version Constraints — DO NOT CHANGE

| Package | Version | Critical rule |
|---|---|---|
| `next` | 16.1.6 | Uses `proxy.ts` in root, NOT `middleware.ts` |
| `react` | 19.2.4 | No `useMemo`/`useCallback` needed (React Compiler) |
| `framer-motion` | ^12.34.0 | Import from `"framer-motion"` — NOT `"motion/react"` |
| `zod` | ^4.3.6 | Import from `"zod/v4"` — NOT `"zod"` |
| `sonner` | ^2.0.7 | Import from `"sonner"` |
| `next-auth` | ^5.0.0-beta.30 | Beta — Credentials provider only, no OAuth |
| `prisma` | ^7.3.0 | DB url in `prisma.config.ts`, NOT `schema.prisma` |
| `tailwindcss` | ^4 | `@import "tailwindcss"` syntax, no `@tailwind` directives |

### Next.js 16 Async Params
`params` AND `searchParams` in Server Components are **Promises** — always `await` them:
```tsx
export default async function Page({ params, searchParams }: Props) {
  const { id } = await params;
  const { guests } = await searchParams;
}
```

---

## File Organization

```
proxy.ts                     ← Route protection (NOT middleware.ts)
prisma.config.ts             ← Prisma v7 DB URL + seed command
prisma/schema.prisma         ← 10 tables: Booking, ContactMessage, Season,
                               DowOverride, AdminUser, UnavailableDate,
                               GuestUser, EmailTemplate, PaymentTransaction, AuditLog
app/
  globals.css                ← @import "tailwindcss" + all CSS vars + @theme
  layout.tsx                 ← Root layout
  page.tsx                   ← Landing (Server → HomeLanding client component)
  (admin)/admin/             ← Route group, all admin pages
  api/
    auth/[...nextauth]/      ← NextAuth route handler
    availability/route.ts
    booking-request/route.ts
    contact/route.ts
components/
  admin/                     ← Admin-only components
  public/                    ← Public-facing components
  ui/                        ← Reusable primitives
lib/
  auth.ts                    ← NextAuth config
  constants.ts               ← All enums + business constants (source of truth)
  pricing.ts                 ← Season-based pricing calculation
  prisma.ts                  ← Prisma singleton (ALWAYS import from here)
  utils.ts                   ← cn(), formatCurrency(), formatDate(), etc.
types/
  index.ts                   ← Domain types mirroring Prisma schema
```

---

## Import Order

```tsx
// 1. Next.js / React core
import type { Metadata } from "next";
import { useState } from "react";

// 2. External libraries
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod/v4";
import { toast } from "sonner";

// 3. Internal absolute (@/*)
import { cn } from "@/lib/utils";
import { BOOKING_STATUS, MAX_GUESTS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import type { Booking } from "@/types";

// 4. Relative (only when necessary)
import { SomeLocalHelper } from "./helpers";
import "./globals.css";
```

---

## TypeScript Patterns

```tsx
// interface for object shapes — NOT type
interface BookingFormProps {
  checkIn: string;
  checkOut: string;
  nights: number;
  guests?: number;          // optional props with ?
}

// type for unions / derived types
type BookingStatus = (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];

// Explicit return types on all exported functions
export function formatCurrency(amount: number): string { ... }

// Readonly for component props when immutable
function Page({ children }: Readonly<{ children: ReactNode }>) { ... }

// Never use `any` — use `unknown` and narrow
catch (error: unknown) {
  const msg = error instanceof Error ? error.message : "Unknown error";
}
```

---

## Component Structure

```tsx
"use client"; // First line if client component

// ─── Imports ───────────────────────────────────────────────────
import { useState } from "react";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────
interface Props {
  title: string;
  onSubmit: () => void;
}

// ─── Constants ─────────────────────────────────────────────────
const NAV_ITEMS = ["Home", "Availability", "Gallery"] as const;

// ─── Component ─────────────────────────────────────────────────
export function ComponentName({ title, onSubmit }: Props) {
  // 1. Hooks
  const [open, setOpen] = useState(false);

  // 2. Derived values
  const isActive = open && title.length > 0;

  // 3. Handlers
  function handleClick() {
    setOpen(true);
    onSubmit();
  }

  return <div>{title}</div>;
}
```

---

## Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Components | PascalCase | `BookingCard.tsx` |
| Hooks | `use` prefix, camelCase | `useAuth.ts` |
| Utilities | camelCase | `formatDate.ts` |
| Constants | SCREAMING_SNAKE_CASE + `as const` | `BOOKING_STATUS` |
| Types / Interfaces | PascalCase | `BookingStatus`, `AdminShellProps` |
| Files | Match default export exactly | `AdminShell.tsx` exports `AdminShell` |
| API routes | `route.ts` inside `app/api/*/` | — |

---

## Tailwind v4 + Design System

```tsx
// NEVER inline hex in className — use style={} instead
// BAD:
<div className="bg-[#2D3A2E]">

// GOOD — use CSS vars mapped in @theme (globals.css)
<div className="bg-forest-green text-white">

// GOOD — inline style for dynamic/one-off hex
<div style={{ backgroundColor: "#2D3A2E" }}>

// Always use cn() for conditional classes
className={cn(
  "rounded-xl px-4 py-2",
  isActive && "ring-2 ring-sage-variant",
  disabled ? "opacity-50" : "hover:opacity-80"
)}
```

**Design tokens (hex reference — do not use var() in JSX):**
- `#2D3A2E` — dark forest (primary text, headings)
- `#3D5243` — medium green (interactive elements)
- `#8B9D83` — sage variant (borders, subtle accents)
- `#C0AF7E` — terracotta gold (logo accent, calendar booked)
- `#F5F3EF` — cream (main page background)
- `#1A4A3A` — forest green (dark CTAs, hero backgrounds)

**Layout:** `max-w-[1400px] mx-auto px-6 lg:px-8`

**Hero pattern (availability / booking / contact pages):**
```tsx
<div style={{ background: "linear-gradient(to bottom, white, #F5F3EF)" }}
     className="py-8 lg:py-12">
  <h1 className="font-serif text-4xl" style={{ color: "#2D3A2E" }}>...</h1>
</div>
```

---

## Error Handling

```tsx
// API routes — always structured JSON response
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = MySchema.parse(body);                   // zod/v4 — throws on invalid
    const result = await prisma.booking.create({ data });
    return Response.json({ success: true, data: result });
  } catch (error) {
    console.error("[API /booking-request] Failed:", error);
    return Response.json(
      { success: false, error: "Failed to process request" },
      { status: 500 }
    );
  }
}

// Client — use sonner for toasts
import { toast } from "sonner";
toast.success("Booking submitted!");
toast.error("Something went wrong. Please try again.");
```

---

## Constants Pattern

All enums live in `lib/constants.ts` — never inline string literals:
```ts
// ✅ GOOD
import { BOOKING_STATUS } from "@/lib/constants";
if (booking.status === BOOKING_STATUS.CONFIRMED) { ... }

// ❌ BAD
if (booking.status === "CONFIRMED") { ... }
```

---

## Comments Style

```tsx
// ─── Section Name ──────────────────────────────────────────── (minor)
// ═══ Major Section ════════════════════════════════════════════ (major)

/** JSDoc for exported functions / business logic */
const depositAmount = totalPrice * DEPOSIT_PERCENTAGE; // Deposit is always 30%
```

---

## Key Constraints

1. **No tests** — do not add test infrastructure without asking
2. **No OAuth** — admin auth only, credentials provider via NextAuth v5
3. **Prisma singleton** — always `import { prisma } from "@/lib/prisma"`, never `new PrismaClient()`
4. **Messages-First** — never create `Booking` directly from public form; create `ContactMessage` first
5. **`proxy.ts`** — route protection lives here, not in `middleware.ts` (Next.js 16)
6. **Stripe** — deposit = 30%, balance = 70%, payment link expires in 24h
7. **TSC must pass** — run `npx tsc --noEmit 2>&1 | grep -v "Interactive Web Prototypes" | grep -v "^$"` before finishing
8. **LSP errors in `Interactive Web Prototypes casa brunelly/`** — IDE cache ghosts, ignore them
9. **No commits** without explicit user approval

## Environment Variables

```bash
DATABASE_URL=       # PostgreSQL connection string
AUTH_SECRET=        # NextAuth JWT secret
AUTH_TRUST_HOST=    # true in production
DIRECT_URL=         # Direct DB connection (Prisma v7 — set in prisma.config.ts)
```
