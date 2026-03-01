# Casa Brunelli — Luxury Tuscan Villa Booking Platform

Direct booking platform for Casa Brunelli. Saves €11–15k/year in OTA commissions (Airbnb/Booking.com).

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env .env.local   # or create .env from scratch
# → Fill in the required variables (see section below)

# 3. Run database migrations (creates all tables in Supabase)
npx prisma migrate dev --name init

# 4. Seed the database (admin user + seasons + email templates)
npx prisma db seed

# 5. Start the dev server
npm run dev
```

Open [http://localhost:3000/admin](http://localhost:3000/admin) — redirects to login.

---

## Environment Variables

Create a `.env` file (or `.env.local`) in the project root and fill in:

| Variable | Where to get it |
|----------|----------------|
| `DATABASE_URL` | Supabase → Settings → Database → Connection String → **Session mode** (port 5432) — add `?pgbouncer=true` at the end |
| `DIRECT_URL` | Supabase → Settings → Database → Connection String → **Direct connection** (no pgbouncer) |
| `AUTH_SECRET` | Generate it → see command below |
| `ADMIN_EMAIL` | Whatever you want, e.g. `admin@casabrunelli.com` |
| `ADMIN_PASSWORD` | Strong password for the admin login |
| `ADMIN_NAME` | Display name, e.g. `Casa Brunelli Admin` |
| `STRIPE_SECRET_KEY` | Stripe dashboard → Developers → API keys |
| `RESEND_API_KEY` | resend.com → API Keys |

### Generate AUTH_SECRET

```bash
openssl rand -base64 33
```

Copy the output into `AUTH_SECRET` in your `.env`. Must be at least 32 characters.

---

## Prisma Commands

### Daily use

```bash
# Open Prisma Studio — visual DB browser (like a mini Supabase UI locally)
npx prisma studio

# Pull current DB state (if you changed schema in Supabase directly)
npx prisma db pull

# Regenerate the Prisma client (after changing schema.prisma)
npx prisma generate
```

### Migrations

```bash
# Create and apply a new migration (after editing schema.prisma)
npx prisma migrate dev --name <description>
# Example:
npx prisma migrate dev --name add-notes-to-booking

# Apply migrations in production (Vercel deploy, CI)
npx prisma migrate deploy

# Reset DB completely and re-seed (⚠️ DELETES ALL DATA)
npx prisma migrate reset
```

### Seed

```bash
# Run the seed script (creates admin user + seasons + email templates)
npx prisma db seed

# The seed is safe to run multiple times:
# - Admin user → upsert (update if exists)
# - Seasons → deletes and recreates
# - Email templates → skips if already exists
```

### Inspect

```bash
# Check migration status (which ones are applied)
npx prisma migrate status

# Validate schema.prisma without applying changes
npx prisma validate

# Format schema.prisma
npx prisma format
```

---

## Database Schema (10 tables)

```
Booking             — Created ONLY after admin approves a ContactMessage
ContactMessage      — ALL inquiries enter here first (Messages-First workflow)
Season              — Seasonal pricing rules with priority conflict resolution
DowOverride         — Day-of-week price adjustments per season
AdminUser           — Admin authentication and role-based access
UnavailableDate     — Manual calendar blocks by the owner
GuestUser           — Repeat guest profiles and booking history
EmailTemplate       — Canned responses for the Messages module
PaymentTransaction  — Full payment history (advance 30% + balance 70%)
AuditLog            — All admin actions for security and compliance
```

---

## Project Structure

```
app/
  (admin)/admin/          Admin panel (protected by proxy.ts)
    login/                Login page
    page.tsx              Dashboard (KPI cards)
    messages/             ← Next to build
    bookings/             ← Next to build
    seasonal-pricing/     ← Next to build
    calendar/             ← Next to build
    settings/             ← Next to build
  api/auth/[...nextauth]  NextAuth v5 handlers
  globals.css             Design token system (25+ CSS variables)
  layout.tsx              Root layout (fonts, metadata, Toaster)

components/admin/
  AdminShell.tsx          Collapsible sidebar + nav
  AdminCard.tsx           Card wrapper with title/actions
  AdminBadge.tsx          Status/payment/message badges
  AdminButton.tsx         Button variants (primary/secondary/ghost/danger)
  AdminField.tsx          Input/select/textarea with label and error

lib/
  auth.ts                 NextAuth v5 config + role helpers
  prisma.ts               PrismaClient singleton (hot-reload safe)
  pricing.ts              Nightly rate engine + booking total calculator
  utils.ts                cn, formatCurrency, formatDate, etc.
  constants.ts            All enums, business rules, sample seasons

prisma/
  schema.prisma           Database schema (10 models)
  seed.ts                 Initial data (admin + seasons + templates)

prisma.config.ts          Prisma v7 datasource config (DATABASE_URL lives here)
proxy.ts                  Protects /admin/* routes (Next.js 16 proxy, NOT middleware.ts)
```

---

## Business Rules

| Rule | Value |
|------|-------|
| Default nightly rate | €450 (when no season active) |
| Advance | 30% of total — paid via Stripe at booking |
| Balance | 70% of total — sent 7 days before check-in |
| Max guests | 8 |
| Season conflict | Higher `priority` number wins |
| Holiday Premium priority | 15 — beats ALL other seasons |

### Booking workflow (Messages-First)

```
1. Guest submits contact form → ContactMessage created (type: BOOKING_REQUEST)
2. Admin reviews in /admin/messages inbox
3. Admin clicks "Approve" → Booking record created + Stripe advance payment link sent
4. Guest pays 30% → Stripe webhook → advancePaid: true, status: CONFIRMED
5. 7 days before check-in → balance link sent automatically
6. Guest pays 70% → balancePaid: true
```

**No Booking record exists until the admin explicitly approves a ContactMessage.**

---

## Tech Stack

| Package | Version |
|---------|---------|
| Next.js | 16.1.6 |
| React | 19.2.4 |
| NextAuth | 5.0.0-beta.30 |
| Prisma | 7.3.0 |
| Tailwind CSS | 4 |
| Framer Motion | 12 (import from `framer-motion`) |
| Stripe | 20.3.1 |
| Resend | 6.9.2 |
| Zod | 4.3.6 |
| Sonner | 2.0.7 (import from `sonner`) |

---

## Common Issues

### `PrismaClientInitializationError` on start
Your `DATABASE_URL` is wrong or Supabase is paused. Check Supabase dashboard → project is active.

### Seed fails with "Missing ADMIN_EMAIL or ADMIN_PASSWORD"
Your `.env` file is missing these variables. Make sure you have a `.env` file in the project root with `ADMIN_EMAIL` and `ADMIN_PASSWORD` set.

### Login redirects back to /admin/login
`AUTH_SECRET` might be missing or less than 32 characters. Regenerate: `openssl rand -base64 33`

### Prisma types not found after schema change
Run `npx prisma generate` to regenerate the client.
