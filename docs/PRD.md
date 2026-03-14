# Casa Brunelli — Product Requirements Document (PRD)

**Product:** Casa Brunelli — Luxury Tuscan Villa Direct Booking Platform
**Version:** 1.0 (Pre-Launch)
**Last Updated:** March 7, 2026
**Author:** Hamilton Posada (Lead Developer)
**Clients:** Erik & José (Property Owners)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Business Objectives](#3-business-objectives)
4. [Target Users](#4-target-users)
5. [Product Overview](#5-product-overview)
6. [User Flows](#6-user-flows)
7. [Feature Specifications](#7-feature-specifications)
8. [Data Architecture](#8-data-architecture)
9. [Design System](#9-design-system)
10. [Technical Architecture](#10-technical-architecture)
11. [Third-Party Integrations](#11-third-party-integrations)
12. [Non-Functional Requirements](#12-non-functional-requirements)
13. [Legal & Compliance](#13-legal--compliance)
14. [Internationalization](#14-internationalization)
15. [Roadmap & Phases](#15-roadmap--phases)
16. [Success Metrics](#16-success-metrics)
17. [Risks & Mitigations](#17-risks--mitigations)
18. [Appendix](#18-appendix)

---

## 1. Executive Summary

Casa Brunelli is a direct-booking web platform for a luxury villa located in the heart of Tuscany, Italy. The platform enables property owners Erik and José to receive bookings directly from guests, bypassing Online Travel Agencies (OTAs) like Airbnb and Booking.com.

The platform handles the full booking lifecycle: availability search, booking requests, admin approval, Stripe payments (30% advance + 70% balance), and post-booking communications — all through a modern, mobile-responsive web application with a dedicated admin dashboard.

**Key differentiator:** A messages-first architecture where every inquiry becomes a `ContactMessage` before any booking is created, giving owners full control over who stays at their property.

---

## 2. Problem Statement

### The OTA Dependency Trap

Erik and José currently rely on OTAs (Airbnb, Booking.com) to manage their villa rental business. While these platforms provide visibility, they impose significant costs and limitations:

| Pain Point | Impact |
|---|---|
| **15–20% commission per booking** | €11,250–€15,000/year lost on ~€75,000 annual revenue |
| **No direct guest relationship** | OTAs own the communication channel |
| **Algorithmic ranking dependency** | Visibility depends on platform rules, not quality |
| **Limited brand control** | Property listed alongside thousands of competitors |
| **No data ownership** | Guest data and booking patterns locked in OTA systems |
| **Key box ban (Nov 2024)** | Italian law now requires in-person check-in — OTA model friction |

### The Solution

Build a professional direct-booking platform that:

- Provides a **premium brand experience** matching the villa's luxury positioning
- Implements **Stripe payments** at just 1.4% + €0.25 (vs. 15–20% OTA fees)
- Keeps **full ownership** of guest relationships, booking data, and communication
- Costs **€0 to build and host** (free-tier services, developer portfolio project)
- Delivers **immediate ROI** — the first direct booking saves ~€290 vs. OTA

---

## 3. Business Objectives

### Financial Targets

| Metric | Year 1 | Year 2–3 | Long-term |
|---|---|---|---|
| Direct booking rate | 30% (9 bookings) | 50% (15 bookings) | 70% (21 bookings) |
| Annual savings | €2,610 | €4,350 | €6,090 |
| Cumulative savings (5yr) | — | — | €30,450+ |

### Revenue Model

| Income Stream | Annual Estimate |
|---|---|
| Gross rental revenue | ~€75,000 (30 bookings/year, 21–24 weeks booked) |
| Average booking | ~€2,500 (5–7 nights) |
| Booking season | April – October (peak: June–August) |
| Stripe processing fee | ~1.4% + €0.25 per transaction |

### Payment Structure

| Payment | Percentage | Timing |
|---|---|---|
| **Advance payment** | 30% of total | At booking confirmation |
| **Balance payment** | 70% of total | 7 days before check-in |

### Cancellation Policy

- **14+ days before check-in:** Full refund of advance
- **7–14 days before check-in:** Advance forfeited (30%)
- **Less than 7 days:** Balance not charged, advance forfeited

---

## 4. Target Users

### Primary: Potential Guests

| Attribute | Detail |
|---|---|
| **Demographics** | Couples, families, small groups (1–8 guests) |
| **Markets** | Netherlands (primary), UK, Germany, Belgium, USA, Italy |
| **Budget** | Mid-to-high (€450–€850/night) |
| **Behavior** | Research online, compare properties, value direct contact |
| **Devices** | 60%+ mobile, responsive design critical |

### Secondary: Property Admin (Erik & José)

| Attribute | Detail |
|---|---|
| **Technical skill** | Non-technical users — needs intuitive admin UI |
| **Tasks** | Review inquiries, approve bookings, manage pricing, track payments |
| **Access** | Desktop-first (admin tasks), occasional mobile |
| **Roles** | Both are SUPER_ADMIN; may add a VIEWER assistant later |

---

## 5. Product Overview

### Platform Structure

```
casabrunelli.com/
├── Public Website (6 pages)
│   ├── Homepage (hero + 8 content sections)
│   ├── Availability Calendar (interactive + pricing)
│   ├── Booking Form (multi-step with price breakdown)
│   ├── Contact Form (general inquiries)
│   ├── Gallery (property photos with lightbox)
│   └── Payment Success / Cancelled Pages
│
├── Admin Dashboard (7 pages)
│   ├── Dashboard (KPIs, calendar, upcoming check-ins)
│   ├── Messages Inbox (two-pane, status tabs)
│   ├── Bookings List (search, filters, bulk actions)
│   ├── Booking Detail (payment timeline, status management)
│   ├── Seasonal Pricing (seasons CRUD + calendar preview)
│   └── Settings (coming soon)
│
└── API Layer (15 endpoints)
    ├── Public: availability, booking-request, contact, auth
    ├── Admin: messages, bookings, seasons, unavailable-dates
    └── Stripe: checkout, webhook, status
```

### Core Architecture Principle: Messages-First

Every guest interaction — whether a booking request, general question, or complaint — enters the system as a `ContactMessage`. No `Booking` record is ever created automatically. This gives the owners complete control over:

- **Who stays:** Review every request before approval
- **Pricing flexibility:** Override calculated prices when needed
- **Communication:** Respond to questions before creating bookings
- **Quality control:** Screen guests before accepting payment

---

## 6. User Flows

### 6.1 Guest Booking Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Landing    │────▶│ Availability │────▶│  Booking     │
│   Page       │     │  Calendar    │     │  Form        │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │ Submit
                                                  ▼
                                          ┌──────────────┐
                                          │ Contact      │
                                          │ Message      │
                                          │ Created      │
                                          └──────┬───────┘
                                                  │ Admin Approves
                                                  ▼
                                          ┌──────────────┐
                                          │  Booking     │
                                          │  Created     │
                                          │  (PENDING)   │
                                          └──────┬───────┘
                                                  │ Payment Link Sent
                                                  ▼
                                          ┌──────────────┐
                                          │  Stripe      │
                                          │  Checkout    │
                                          │  (30%)       │
                                          └──────┬───────┘
                                            ┌────┴────┐
                                            ▼         ▼
                                     ┌─────────┐ ┌─────────┐
                                     │ Success │ │Cancelled│
                                     │ Page    │ │ Page    │
                                     │CONFIRMED│ │ PENDING │
                                     └────┬────┘ └─────────┘
                                          │ 7 days before check-in
                                          ▼
                                   ┌──────────────┐
                                   │   Balance    │
                                   │   Payment    │
                                   │   (70%)      │
                                   └──────┬───────┘
                                          │
                                          ▼
                                   ┌──────────────┐
                                   │  COMPLETED   │
                                   │  Fully Paid  │
                                   └──────────────┘
```

**Detailed steps:**

1. Guest visits the landing page — browses property info, gallery, amenities
2. Goes to `/availability` — interactive calendar shows available/booked/blocked dates with nightly rates and minimum stay requirements per season
3. Selects dates — redirected to `/booking` with prefilled dates and pricing
4. Fills out booking form: name, email, phone, guest count, address, special requests
5. Sees real-time price breakdown: per-night rates, total, advance (30%), balance (70%)
6. Submits form — creates a `ContactMessage` (type: `BOOKING_REQUEST`)
7. Receives on-screen confirmation (future: email confirmation via Resend)
8. Admin reviews and approves → `Booking` created with status `PENDING`
9. Admin generates a Stripe payment link for the 30% advance
10. Guest receives link, pays via Stripe Checkout (cards, iDEAL, SEPA, Bancontact)
11. On success → `/booking/[id]/success` page with animated confirmation
12. On cancel → `/booking/[id]/cancelled` page with retry guidance
13. 7 days before check-in → balance payment link sent (70%)
14. Guest pays balance → booking status becomes `COMPLETED`

### 6.2 Admin Management Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Login      │────▶│  Dashboard   │────▶│  Messages    │
│              │     │  (KPIs)      │     │  Inbox       │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │ Approve
                                                  ▼
                                          ┌──────────────┐
                                          │  Booking     │
                                          │  Detail      │◄──── Generate Payment Link
                                          │              │────▶ Copy & Send to Guest
                                          └──────────────┘
                                                  │
                                          ┌───────┴────────┐
                                          ▼                ▼
                                   ┌────────────┐  ┌────────────┐
                                   │  Seasonal   │  │  Calendar  │
                                   │  Pricing    │  │  Blocks    │
                                   └────────────┘  └────────────┘
```

**Detailed steps:**

1. Admin logs in at `/admin/login` (credentials only, no OAuth)
2. Dashboard shows: pending requests, monthly revenue, confirmed bookings, occupancy rate, upcoming check-ins (next 30 days), 12-month calendar overview
3. Reviews messages in two-pane inbox with status tabs (Unread / Read / Replied)
4. For booking requests: clicks "Approve" — system validates dates (no double-booking), calculates pricing, creates/links `GuestUser`, creates `Booking` atomically
5. Goes to booking detail — generates Stripe payment link (24h expiry), copies link
6. Monitors payment status in real-time (webhook updates)
7. Manages seasonal pricing: create/edit/archive seasons with day-of-week overrides
8. Blocks/unblocks specific dates via calendar widget

---

## 7. Feature Specifications

### 7.1 Public Website

#### Homepage (`/`)

| Feature | Description |
|---|---|
| Hero section | Full-width image with property name, tagline, and CTA |
| 8 content sections | Property highlights, amenities, location, experiences, reviews, FAQ, contact, newsletter |
| Responsive design | Mobile-first, adapts from 320px to 2560px |
| Animations | Scroll-triggered fade-in with Framer Motion |
| Navigation | Fixed header with transparent-to-solid scroll effect |

#### Availability Calendar (`/availability`)

| Feature | Description |
|---|---|
| Interactive calendar | Month-by-month grid navigation |
| Per-day pricing | Shows nightly rate based on active season |
| Status indicators | Available (green), booked (red), blocked (gray) |
| Minimum stay | Enforced per season (2–7 nights) |
| Season-aware | Rates change based on active season with priority resolution |
| Date range selection | Click start → click end → redirected to booking form |
| API caching | 5-minute cache with stale-while-revalidate |

#### Booking Form (`/booking`)

| Feature | Description |
|---|---|
| Pre-filled dates | From availability selection |
| Guest information | Name, email, phone, address, guest count |
| Price breakdown | Per-night rates, total, advance (30%), balance (70%) |
| Validation | Client-side (React Hook Form) + server-side (Zod) |
| Guest count | 1–8 guests with selector |
| Special requests | Free-text field (max 1000 chars) |
| Terms agreement | Required checkbox |
| Submission | Creates `ContactMessage` type `BOOKING_REQUEST` |

#### Contact Form (`/contact`)

| Feature | Description |
|---|---|
| Fields | Name, email, phone (optional), subject, message |
| Validation | Zod schema: min 2 chars name, valid email, min 10 chars message |
| Submission | Creates `ContactMessage` type `GENERAL` |
| Layout | Form + contact details sidebar |

#### Gallery (`/gallery`)

| Feature | Description |
|---|---|
| Grid layout | Responsive masonry-style photo grid |
| Lightbox | Full-screen image viewer with navigation |
| Lazy loading | Images load on scroll |

#### Payment Pages (`/booking/[id]/success` and `/booking/[id]/cancelled`)

| Feature | Description |
|---|---|
| Success page | Animated confirmation card with booking details, next steps, and CTA |
| Cancelled page | Friendly message with retry guidance |
| Async payment support | iDEAL/SEPA "processing" state for bank transfers |
| Payment type awareness | Different messaging for advance vs. balance |

### 7.2 Admin Dashboard

#### Dashboard (`/admin`)

| Feature | Description |
|---|---|
| KPI cards | Pending requests, monthly revenue (with trend), confirmed bookings, occupancy rate |
| Recent bookings table | Last 10 bookings with status, dates, and revenue |
| Upcoming check-ins | Next 30 days sidebar with guest names and dates |
| Calendar widget | 12-month overview showing bookings and blocked dates |

#### Messages (`/admin/messages`)

| Feature | Description |
|---|---|
| Two-pane layout | Message list (left) + message detail (right) |
| Status tabs | Unread / Read / Replied |
| Message types | General, Booking Request, Question, Complaint |
| Actions | Mark as read, reply, promote to booking |
| Promote flow | Validates dates, calculates pricing, creates booking atomically |

#### Bookings (`/admin/bookings`)

| Feature | Description |
|---|---|
| Searchable list | Filter by status, search by guest name/email |
| Bulk actions | Bulk status update, bulk delete (with cascade) |
| Pagination | Server-side with configurable page size |
| Status badges | Color-coded: Pending (amber), Confirmed (green), Cancelled (red), Completed (blue) |

#### Booking Detail (`/admin/bookings/[id]`)

| Feature | Description |
|---|---|
| Guest information | Name, email, phone, booking dates, guest count |
| Payment status | Advance paid/unpaid, balance paid/unpaid |
| Payment timeline | Chronological log of all payment events |
| Payment link generation | Create Stripe Checkout link (24h TTL) with copy-to-clipboard |
| Status management | Update booking status with optimistic UI |
| Delete | Hard delete with cascade (payments, audit logs) |
| Micro-interactions | Animated status changes, confetti on payment confirmation |

#### Seasonal Pricing (`/admin/seasonal-pricing`)

| Feature | Description |
|---|---|
| Season cards | Name, dates, base rate, min stay, priority |
| Calendar preview | Visual overlap display |
| CRUD operations | Create, edit, archive, delete (SUPER_ADMIN only) |
| Day-of-week overrides | Per-day price adjustments (e.g., +€50 on Fridays) |
| Priority system | Higher priority wins on overlapping dates |
| Pre-configured | 5 seasons: High Summer, Spring Blossom, Autumn Harvest, Winter Retreat, Holiday Premium |

#### Settings (`/admin/settings`)

| Feature | Description |
|---|---|
| Status | Coming Soon — placeholder sections |
| Planned | General settings, email configuration, access management |

---

## 8. Data Architecture

### 8.1 Entity Relationship Overview

```
AdminUser ──────┬── ContactMessage
                ├── UnavailableDate
                ├── EmailTemplate
                └── AuditLog

GuestUser ──────── Booking ──────── PaymentTransaction

Season ─────────── DowOverride
```

### 8.2 Models (10 total)

#### Booking

The central entity. Created ONLY when admin promotes a `ContactMessage`.

| Field | Type | Description |
|---|---|---|
| id | CUID | Primary key |
| checkIn / checkOut | DateTime | Stay dates |
| numberOfNights | Int | Calculated |
| guestCount | Int | 1–8 |
| guestName / guestEmail | String | Guest info |
| guestPhone | String? | Optional |
| totalPrice | Decimal(10,2) | Total in EUR |
| advanceAmount | Decimal(10,2) | 30% of total |
| advancePaid | Boolean | Payment flag |
| balancePaid | Boolean | Payment flag |
| status | Enum | PENDING / CONFIRMED / CANCELLED / COMPLETED |
| stripeSessionId | String? | Latest Stripe session |
| advanceSessionId | String? | Advance payment session |
| balanceSessionId | String? | Balance payment session |

#### ContactMessage

Entry point for ALL guest interactions.

| Field | Type | Description |
|---|---|---|
| id | CUID | Primary key |
| type | Enum | GENERAL / BOOKING_REQUEST / QUESTION / COMPLAINT |
| name / email | String | Sender info |
| subject / message | String | Content |
| status | Enum | UNREAD / READ / REPLIED |
| checkIn / checkOut | DateTime? | For booking requests |
| guestCount | Int? | For booking requests |
| totalPrice | Decimal? | Pre-calculated pricing |

#### Season

Defines pricing periods with priority-based conflict resolution.

| Field | Type | Description |
|---|---|---|
| name | String | e.g., "High Summer" |
| startDate / endDate | Date | Season boundaries |
| baseRate | Decimal(10,2) | Nightly rate in EUR |
| minStay | Int | Minimum nights |
| priority | Int | Higher wins on overlap |
| status | Enum | ACTIVE / INACTIVE / ARCHIVED |

#### Other Models

| Model | Purpose |
|---|---|
| **DowOverride** | Day-of-week price adjustments per season |
| **AdminUser** | Authentication + RBAC (SUPER_ADMIN / ADMIN / VIEWER) |
| **GuestUser** | Repeat guest tracking, booking history |
| **UnavailableDate** | Manual calendar blocks by owner |
| **EmailTemplate** | Pre-written responses categorized by purpose |
| **PaymentTransaction** | Payment history: ADVANCE / BALANCE / REFUND |
| **AuditLog** | All admin actions with actor, entity, changes, IP |

---

## 9. Design System

### 9.1 Visual Identity

Casa Brunelli's design reflects the Tuscan landscape — warm earth tones, natural greens, and elegant typography that conveys luxury without pretension.

### 9.2 Color Palette

| Token | Hex | Usage |
|---|---|---|
| `--forest-green` | `#1a4a3a` | Deep accents, CTAs, dark backgrounds |
| `--deep-green` | `#2d5a47` | Primary buttons, headers |
| `--dark-forest` | `#2d3a2e` | Primary text, headings |
| `--sage-green` | `#9caf88` | Accent highlights |
| `--sage-variant` | `#8b9d83` | Borders, focus rings |
| `--terracotta` | `#d2691e` | Warm accent, highlights |
| `--terracotta-gold` | `#c0af7e` | Logo accents, decorative elements |
| `--golden-wheat` | `#f5deb3` | Borders, hero text on dark |
| `--cream` | `#f5f3ef` | Main page background |
| `--warm-cream` | `#fdf6e3` | Alternate backgrounds |
| `--soft-beige` | `#e8e4dd` | Card backgrounds, borders |

**Status colors:** Pending (`#b26a00`), Confirmed (`#2e7d32`), Cancelled (`#c62828`), Completed (`#1565c0`)

### 9.3 Typography

| Role | Font | Weights |
|---|---|---|
| **Display / Headings** | Playfair Display (serif) | 400, 500, 700 |
| **Body / UI** | Inter (sans-serif) | 400, 500, 600, 700 |

### 9.4 Component Architecture (Atomic Design)

```
components/
├── ui/public/          ← Atoms (Button, Card, FormField, Eyebrow, FadeInView)
├── ui/admin/           ← Atoms (AdminCard, AdminButton, AdminField, AdminBadge)
├── ui/shadcn/          ← shadcn/ui primitives (button, dialog)
├── shared/public/      ← Molecules (SectionHeader, FeatureCard, SuccessConfirmation)
├── features/public/    ← Organisms (HomeLanding, BookingForm, AvailabilityCalendar)
├── features/admin/     ← Organisms (CalendarWidget, BookingsClient, MessagesClient)
└── layouts/admin/      ← Templates (AdminShell)
```

### 9.5 Layout Standards

- **Max width:** `max-w-350` (1400px) with `mx-auto px-6 lg:px-8`
- **Spacing base:** 8px (`--space-1` through `--space-16`)
- **Border radius:** `0.625rem` base
- **Shadows:** 4 levels (sm, md, lg, xl) using `rgba(16, 24, 40, 0.08–0.18)`

---

## 10. Technical Architecture

### 10.1 Tech Stack

| Layer | Technology | Version |
|---|---|---|
| **Framework** | Next.js (App Router) | 16.1.6 |
| **UI Library** | React | 19.2.4 |
| **Styling** | Tailwind CSS | 4.x |
| **UI Components** | shadcn/ui | 3.8+ |
| **Animations** | Framer Motion | 12.34.0 |
| **ORM** | Prisma | 7.3.0 |
| **Database** | PostgreSQL (Supabase) | — |
| **Auth** | NextAuth v5 (beta) | 5.0.0-beta.30 |
| **Payments** | Stripe | 20.3.1 |
| **Email** | Resend (planned) | 6.9.2 |
| **Validation** | Zod | 4.3.6 |
| **Language** | TypeScript | 5.x (strict) |

### 10.2 Architecture Pattern

```
┌──────────────────────────────────────────────────┐
│                    Next.js 16                     │
│                                                   │
│  ┌─────────────┐        ┌──────────────────────┐ │
│  │   Server     │        │   Client             │ │
│  │  Components  │        │  Components          │ │
│  │  (app/)      │───────▶│  (features/)         │ │
│  │  Direct DB   │        │  Call lib/services/   │ │
│  └──────┬──────┘        └──────────┬───────────┘ │
│         │                          │              │
│         ▼                          ▼              │
│  ┌─────────────┐        ┌──────────────────────┐ │
│  │   Prisma     │        │   API Routes         │ │
│  │   (lib/)     │◄───────│   (app/api/)         │ │
│  │              │        │   + Zod Validation   │ │
│  └──────┬──────┘        └──────────────────────┘ │
│         │                                         │
│         ▼                                         │
│  ┌─────────────┐                                  │
│  │ PostgreSQL   │                                  │
│  │ (Supabase)   │                                  │
│  └─────────────┘                                  │
└──────────────────────────────────────────────────┘
```

**Data flow rules:**
- **Server Components** → Query Prisma directly (no self-API calls)
- **Client Components** → Call `lib/services/` typed fetch wrappers → API Routes → Prisma
- **All API responses** → `{ success: true, data }` or `{ success: false, error }`

### 10.3 Security Architecture

| Layer | Implementation |
|---|---|
| **Route Protection** | `proxy.ts` (NOT middleware.ts — Next.js 16) guards `/admin/*` and `/api/admin/*` |
| **Authentication** | NextAuth v5 Credentials provider, bcrypt, 8-hour JWT sessions |
| **Authorization** | 3-tier RBAC: SUPER_ADMIN > ADMIN > VIEWER |
| **Route Guards** | `requireAuth()`, `requireWrite()`, `requireSuperAdmin()` in `lib/auth.ts` |
| **Input Validation** | Zod schemas on every POST/PATCH endpoint |
| **Payment Security** | Stripe webhook signature verification |
| **Idempotency** | Webhook handlers check for duplicate processing |
| **Audit Trail** | `AuditLog` model tracks all admin actions |

### 10.4 File Organization

```
Casa-Brunelli/
├── proxy.ts                     ← Route protection (Next.js 16)
├── prisma.config.ts             ← Prisma 7 config (DB URL, seed)
├── prisma/
│   ├── schema.prisma            ← 10 models
│   ├── seed.ts                  ← Admin user + seasons + templates
│   └── migrations/              ← Tracked in git
├── app/
│   ├── page.tsx                 ← Landing page
│   ├── (admin)/admin/           ← Admin pages (behind auth)
│   ├── (auth)/admin/login/      ← Login page
│   └── api/                     ← API routes (public + admin + Stripe)
├── components/
│   ├── ui/public/               ← Public atoms
│   ├── ui/admin/                ← Admin atoms
│   ├── ui/shadcn/               ← shadcn/ui components
│   ├── shared/public/           ← Molecules
│   ├── features/{public,admin}/ ← Organisms
│   └── layouts/admin/           ← Templates (AdminShell)
├── lib/
│   ├── auth.ts                  ← NextAuth config + RBAC guards
│   ├── constants.ts             ← All enums + business rules
│   ├── pricing.ts               ← Pricing engine
│   ├── prisma.ts                ← Prisma singleton
│   ├── stripe.ts                ← Stripe singleton
│   ├── utils.ts                 ← Helpers (cn, formatters, etc.)
│   ├── validations/admin.ts     ← All Zod schemas
│   └── services/                ← Client-side fetch wrappers
├── types/index.ts               ← Domain types
└── docs/PRD.md                  ← This document
```

---

## 11. Third-Party Integrations

### 11.1 Stripe (Payments)

| Feature | Detail |
|---|---|
| **Product** | Stripe Checkout (hosted payment page) |
| **Payment types** | Advance (30%), Balance (70%), Refund (future) |
| **Methods** | Cards, iDEAL, Bancontact, SEPA Direct Debit |
| **Link expiry** | 24 hours |
| **Webhook events** | `checkout.session.completed`, `async_payment_succeeded`, `async_payment_failed`, `checkout.session.expired` |
| **Async payments** | iDEAL/SEPA/Bancontact fire `completed` with `payment_status: "unpaid"` — real confirmation via `async_payment_succeeded` |
| **Singleton** | `lib/stripe.ts` — lazy init, reused across requests |
| **API version** | `2026-01-28.clover` |

### 11.2 NextAuth v5 (Authentication)

| Feature | Detail |
|---|---|
| **Provider** | Credentials only (email + password) |
| **Strategy** | JWT (no database sessions) |
| **Session length** | 8 hours |
| **Password** | bcrypt hashing |
| **Session data** | `{ id, email, name, role: AdminRole }` |
| **Custom pages** | `/admin/login` |

### 11.3 Prisma 7 + PostgreSQL (Database)

| Feature | Detail |
|---|---|
| **Provider** | PostgreSQL via Supabase |
| **Connections** | Pooled (app) + Direct (migrations) |
| **Config** | `prisma.config.ts` (Prisma 7 pattern) |
| **Singleton** | `lib/prisma.ts` |
| **Seed** | Admin user + 5 seasons + 8 email templates |

### 11.4 Resend (Email — Phase E, Planned)

| Feature | Detail |
|---|---|
| **Purpose** | Transactional emails (confirmations, payment links, reminders) |
| **Planned emails** | Booking confirmation, advance receipt, balance reminder (7 days), admin notifications |
| **Status** | Dependency installed, not yet implemented |

---

## 12. Non-Functional Requirements

### 12.1 Performance

| Requirement | Implementation |
|---|---|
| Availability API response | < 200ms (5-min cache, parallel queries) |
| Calendar rendering | O(1) date lookups via Set |
| Pricing calculation | Single query, no N+1 |
| Image loading | Lazy load with Next.js Image optimization |
| Development | Turbopack for HMR |

### 12.2 SEO

| Requirement | Implementation |
|---|---|
| Metadata | Title template, description, keywords, OpenGraph |
| Indexing | `robots: { index: true, follow: true }` |
| Keywords | "luxury villa Tuscany", "Casa Brunelli", "direct booking villa Italy" |
| Semantic HTML | Proper heading hierarchy, landmarks |
| Phase I | hreflang tags for 4 languages, localized sitemaps |

### 12.3 Accessibility

| Requirement | Implementation |
|---|---|
| Skip navigation | Skip-to-content link (WCAG 2.4.1 Level A) |
| Focus indicators | `2px solid var(--sage-variant)` with offset |
| Color contrast | WCAG-safe on price labels and text |
| Form accessibility | Labels, error states, required indicators |
| Text rendering | `antialiased` for readability |

### 12.4 Browser Support

| Browser | Support |
|---|---|
| Chrome / Edge | Last 2 versions |
| Firefox | Last 2 versions |
| Safari | Last 2 versions |
| Mobile Safari / Chrome | iOS 15+, Android 10+ |

---

## 13. Legal & Compliance

### 13.1 Italian Rental Requirements

| Requirement | Status | Impact on Platform |
|---|---|---|
| **CIR** (Regional Code) | Owner responsibility | Must be obtained before listing |
| **CIN** (National Code) | Owner responsibility | Must be displayed on website (footer/booking page) |
| **Safety equipment** | Owner responsibility | Gas/CO detectors, fire extinguishers (mandatory since Nov 2024) |
| **Key box ban** | Active since Nov 2024 | In-person check-in required — affects booking flow communications |
| **Guest registration** | Within 24h via Questura | May require nationality/ID fields in booking form |
| **Tourist tax** | Per-person-per-night | Future: separate line item in pricing |
| **Cedolare Secca** | 21% flat tax | Owner files directly for direct bookings |
| **APE** (Energy Certificate) | Owner responsibility | Required for rental activity |

### 13.2 Dutch Tax Obligations

| Requirement | Detail |
|---|---|
| **Italy-NL Tax Treaty** | Rental income taxed in Italy (21%), Netherlands gives exemption |
| **Box 3 wealth tax** | Property market value declared as asset |
| **Mortgage deduction** | Reduces Box 3 tax base |

### 13.3 Website Compliance

- CIN number visible on website (footer or booking confirmation)
- Clear cancellation policy
- Terms and conditions (Phase F)
- Privacy policy / GDPR compliance (Phase F)
- Cookie consent (Phase F)

---

## 14. Internationalization

### 14.1 Language Support (Phase I — Post-Launch)

| Language | Code | Market | Priority |
|---|---|---|---|
| English | EN | International (current default) | P0 |
| Dutch | NL | Netherlands (owners' market) | P1 |
| Italian | IT | Local market, legal requirements | P1 |
| Spanish | ES | European market | P2 |

### 14.2 Technical Approach

- **Library:** `next-intl` (recommended)
- **Routing:** `/en/`, `/nl/`, `/it/`, `/es/` prefixed routes
- **SEO:** `hreflang` tags, localized sitemaps, language-specific metadata
- **Scope:** Navigation, forms, error messages, email templates, legal text, pricing labels

---

## 15. Roadmap & Phases

### Completed

| Phase | Name | Status | Key Deliverables |
|---|---|---|---|
| 0 | Discovery | ✅ 100% | Scope, tech stack, client requirements |
| 1 | Branding & Identity | ✅ 100% | Logo, color palette, Figma MVP |
| 2 | Design System | ✅ 100% | Figma components, design tokens |
| A | Backend Foundation | ✅ 90% | Prisma schema, auth, pricing engine, API validation |
| B | Backend Admin | ✅ 80% | All admin pages, message promotion flow |
| C | Public Frontend | ✅ 90% | Landing page, availability calendar, booking form |
| D | Stripe Payments | ✅ 100% | Checkout, webhooks, async payments, payment UI |

### In Progress

| Phase | Name | Status | Key Deliverables |
|---|---|---|---|
| E | Email (Resend) | 🔄 0% | Booking confirmations, payment links, balance reminders, admin notifications |

### Pre-Launch

| Phase | Name | Status | Key Deliverables |
|---|---|---|---|
| F | Testing & Launch | 📋 Planned | Unit/E2E tests, Lighthouse audit, WCAG audit, SEO, Vercel deployment, client training |

### Post-Launch

| Phase | Name | Status | Timeline | Key Deliverables |
|---|---|---|---|---|
| G | Accounting & Tax | 📋 Planned | Q2 2026 | Revenue dashboard, expense tracking, tax calculator, P&L export |
| H | Property Operations | 📋 Planned | Q3 2026 | Cleaning dashboard, team management, maintenance tracking, inventory |
| I | Internationalization | 📋 Planned | Q3 2026 | 4 languages (EN, NL, IT, ES), next-intl, hreflang SEO |

### Overall Progress: ~72%

**Target launch:** Q1 2026 (Phase F completion)

---

## 16. Success Metrics

### Business KPIs

| Metric | Target (Year 1) | Measurement |
|---|---|---|
| Direct booking conversion rate | 30% of total bookings | Booking count via platform vs. OTA |
| Commission savings | €2,610/year | (OTA fee - Stripe fee) × direct bookings |
| Booking request → Confirmed rate | > 80% | ContactMessage → Booking conversion |
| Average response time | < 24 hours | Time from message to admin reply |
| Repeat guest rate | > 20% | GuestUser with totalBookings > 1 |

### Technical KPIs

| Metric | Target | Tool |
|---|---|---|
| Lighthouse Performance | > 90 | Lighthouse CI |
| Lighthouse Accessibility | > 95 | Lighthouse CI |
| Core Web Vitals (LCP) | < 2.5s | Vercel Analytics |
| Core Web Vitals (FID) | < 100ms | Vercel Analytics |
| Core Web Vitals (CLS) | < 0.1 | Vercel Analytics |
| API response time (p95) | < 500ms | Vercel Analytics |
| Uptime | 99.9% | Vercel Status |
| TypeScript errors | 0 | CI pipeline |

---

## 17. Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Low initial direct traffic | High | Medium | SEO optimization, Google Business Profile, owners share link in OTA messages |
| Italian regulatory changes | Medium | High | Modular CIN/CIR display, flexible compliance fields |
| Stripe payment failures | Low | High | Async payment handling, 24h link expiry with regeneration |
| NextAuth v5 breaking changes | Medium | Medium | Pinned to beta.30, upgrade path documented |
| Owner technical difficulties | Medium | Medium | Intuitive admin UI, client training session (Phase F) |
| Double-booking risk | Low | Critical | Atomic overlap checks on promote + booking request |
| Email deliverability | Medium | Medium | Resend with verified domain, SPF/DKIM/DMARC |

---

## 18. Appendix

### A. Environment Variables

```
DATABASE_URL           # PostgreSQL connection (pooled)
DIRECT_URL             # Direct DB connection (migrations)
AUTH_SECRET             # NextAuth JWT secret (32+ chars)
AUTH_TRUST_HOST=true    # Required in production
STRIPE_SECRET_KEY      # Stripe server key (sk_...)
STRIPE_WEBHOOK_SECRET  # Stripe webhook signing secret (whsec_...)
NEXT_PUBLIC_APP_URL    # Public URL for Stripe redirects
```

### B. Pre-Configured Seasons

| Season | Dates | Base Rate | Min Stay | Priority |
|---|---|---|---|---|
| High Summer | Jun 15 – Aug 31 | €750/night | 7 nights | 10 |
| Spring Blossom | Apr 1 – Jun 14 | €550/night | 3 nights | 7 |
| Autumn Harvest | Sep 1 – Nov 15 | €600/night | 4 nights | 8 |
| Winter Retreat | Nov 16 – Mar 31 | €450/night | 2 nights | 5 |
| Holiday Premium | Dec 20 – Jan 5 | €850/night | 5 nights | 15 |

### C. Property Details

| Feature | Detail |
|---|---|
| Max guests | 8 |
| Parking | 3 spots |
| Pool | Private outdoor (May–October) |
| Kitchen | Fully equipped |
| Internet | High-speed Wi-Fi |
| Climate | AC throughout |
| Outdoor | Dining terrace, BBQ, Tuscan countryside views |
| Check-in | From 3:00 PM, access code sent 24h before |

### D. API Endpoints Reference

#### Public (no auth)

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/availability?from=&to=` | Calendar data with pricing |
| POST | `/api/booking-request` | Submit booking inquiry |
| POST | `/api/contact` | Submit contact form |

#### Admin (auth required)

| Method | Route | Guard | Purpose |
|---|---|---|---|
| GET | `/api/admin/messages` | requireAuth | List messages |
| PATCH | `/api/admin/messages/[id]` | requireWrite | Update status |
| POST | `/api/admin/messages/[id]/promote` | requireWrite | Promote to booking |
| GET | `/api/admin/bookings` | requireAuth | List bookings |
| PATCH | `/api/admin/bookings` | requireWrite | Bulk status update |
| DELETE | `/api/admin/bookings` | requireWrite | Bulk delete |
| GET | `/api/admin/bookings/[id]` | requireAuth | Booking detail |
| PATCH | `/api/admin/bookings/[id]` | requireWrite | Update booking |
| DELETE | `/api/admin/bookings/[id]` | requireWrite | Delete booking |
| GET | `/api/admin/seasons` | requireAuth | List seasons |
| POST | `/api/admin/seasons` | requireWrite | Create season |
| PATCH | `/api/admin/seasons/[id]` | requireWrite | Update season |
| DELETE | `/api/admin/seasons/[id]` | requireSuperAdmin | Delete season |
| GET | `/api/admin/unavailable-dates` | requireAuth | List blocked dates |
| POST | `/api/admin/unavailable-dates` | requireWrite | Block dates |
| DELETE | `/api/admin/unavailable-dates` | requireWrite | Unblock dates |

#### Stripe

| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | `/api/stripe/checkout` | requireWrite | Create Checkout Session |
| POST | `/api/stripe/webhook` | Signature verified | Handle payment events |
| GET | `/api/stripe/status` | requireAuth | Stripe configuration status |

---

*This document is a living artifact and will be updated as the project evolves through remaining phases.*
