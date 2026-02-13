# Casa Brunelli — Agent Coding Guidelines

## Project Overview

Luxury villa rental booking platform. Next.js 16 App Router, React 19, Tailwind CSS 4, Prisma ORM, NextAuth v5.

## Build/Lint Commands

```bash
# Development
npm run dev              # Start dev server (Next.js 16 + Turbopack)

# Build/Deploy
npm run build            # Production build with type checking
npm run start            # Start production server

# Code Quality
npm run lint             # ESLint with Next.js 16 config
npx tsc --noEmit         # Type-only check (no build)
```

**Note:** No test runner configured yet. Add Vitest or Jest if tests needed.

## Tech Stack

- **Framework:** Next.js 16.1.6, React 19.2.4
- **Styling:** Tailwind CSS 4 + CSS custom properties (design tokens)
- **Database:** Prisma 7.3.0 + PostgreSQL
- **Auth:** NextAuth v5 (beta) with Credentials provider
- **Validation:** Zod 4.3.6
- **Forms:** React Hook Form + @hookform/resolvers
- **Icons:** Lucide React

## Code Style Guidelines

### Imports (Priority Order)

```tsx
// 1. Next.js / React core
import type { Metadata } from "next";
import { useState } from "react";
import type { ReactNode } from "react";

// 2. External libraries
import { signOut } from "next-auth/react";
import { clsx, type ClassValue } from "clsx";

// 3. Internal absolute imports (@/*)
import { cn } from "@/lib/utils";
import { BOOKING_STATUS } from "@/lib/constants";
import type { Booking } from "@/types";

// 4. Relative imports (only when necessary)
import { SomeLocalComponent } from "./SomeLocalComponent";
import "./globals.css";
```

### Naming Conventions

- **Components:** PascalCase (`AdminShell.tsx`, `BookingCard.tsx`)
- **Hooks:** camelCase with `use` prefix (`useAuth.ts`)
- **Utilities:** camelCase (`utils.ts`, `formatDate.ts`)
- **Constants:** SCREAMING_SNAKE_CASE + `as const` (`BOOKING_STATUS`, `DEFAULT_NIGHTLY_RATE`)
- **Types/Interfaces:** PascalCase, prefer `interface` over `type` for objects
- **Files:** Match the default export name exactly

### TypeScript Patterns

```tsx
// Use interface for object shapes
interface AdminShellProps {
  children: ReactNode;
  user: {
    name: string;
    email: string;
  };
}

// Use `type` for unions/aliases
type BookingStatus = (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];

// Explicit return types on exported functions
export function formatCurrency(amount: number): string { }

// Readonly for props when appropriate
function Component({ children }: Readonly<{ children: ReactNode }>) { }
```

### Component Structure

```tsx
"use client"; // First line if needed

// ─── Imports ───────────────────────────────────────────────────
import { useState } from "react";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────
interface Props { }

// ─── Constants ─────────────────────────────────────────────────
const NAV_ITEMS = [...] as const;

// ─── Component ─────────────────────────────────────────────────
export function ComponentName({ prop }: Props) {
  // hooks first
  const [state, setState] = useState(false);
  
  // derived values
  const isActive = ...;
  
  // handlers
  function handleClick() { }
  
  return (...);
}
```

### Tailwind + CSS Variables

```tsx
// NEVER use var() in className — use @theme mapping in globals.css
// GOOD: Tailwind classes only
<div className="bg-forest-green text-white">

// GOOD: Inline styles for CSS variables only when needed
<div style={{ color: "var(--terracotta-gold)" }}>

// Use cn() for conditional classes
className={cn(
  "base-classes",
  condition && "conditional-class",
  collapsed ? "w-20" : "w-64"
)}
```

### Error Handling

```tsx
// API routes — return structured responses
try {
  const result = await prisma.booking.create({ ... });
  return Response.json({ success: true, data: result });
} catch (error) {
  console.error("[API] Failed to create booking:", error);
  return Response.json(
    { success: false, error: "Failed to create booking" },
    { status: 500 }
  );
}

// Server Actions — similar pattern
// Auth — use NextAuth's error handling, redirect to /admin/login
```

### File Organization

```
app/
  (admin)/              # Route groups for admin
    admin/
      layout.tsx        # Admin shell
      page.tsx          # Dashboard
      login/
        page.tsx        # Auth form
  api/
    auth/[...nextauth]/ # NextAuth route handler
  layout.tsx            # Root layout
  page.tsx              # Landing page
  globals.css           # Tailwind + design tokens

components/
  admin/                # Admin-specific components
  ui/                   # Reusable UI components (create as needed)

lib/
  utils.ts              # cn(), formatters, helpers
  constants.ts          # App constants + enums
  auth.ts               # NextAuth config
  prisma.ts             # Prisma singleton
  pricing.ts            # Pricing calculation logic

types/
  index.ts              # Domain types mirroring Prisma schema
```

### Constants Pattern

```ts
// lib/constants.ts
export const BOOKING_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
  COMPLETED: "COMPLETED",
} as const;

export type BookingStatus = (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];
```

### Comments Style

```tsx
// Section dividers (50 chars wide)
// ─── Section Name ─────────────────────────────────────────────

// ═══ Major Sections ═══════════════════════════════════════════

// Inline comments for business logic
/** Deposit is always 30% of total */
const depositAmount = totalPrice * DEPOSIT_PERCENTAGE;
```

## Key Constraints

1. **No tests configured** — ask before adding test infrastructure
2. **Admin-only auth** — no OAuth, credentials only
3. **Tailwind v4** — uses `@import "tailwindcss"` syntax
4. **Prisma** — always use singleton from `@/lib/prisma`
5. **Design tokens** — defined in `globals.css`, mapped in `@theme`

## Environment Variables (Required)

```bash
DATABASE_URL=
AUTH_SECRET=
AUTH_TRUST_HOST=
```
