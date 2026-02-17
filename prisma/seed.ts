/**
 * Casa Brunelli — Prisma Seed
 *
 * Creates:
 *   1. SUPER_ADMIN admin user (credentials from .env)
 *   2. Sample seasons with DOW overrides (from lib/constants.ts)
 *   3. Sample email templates (canned responses)
 *
 * Run: npx prisma db seed
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// ─── Helpers ───────────────────────────────────────────────────

/** Build a Date from month (1-12) and day for a given year */
function seasonDate(year: number, month: number, day: number): Date {
  return new Date(year, month - 1, day);
}

// ─── Seed Data ─────────────────────────────────────────────────

const SEED_SEASONS = [
  {
    name: "High Summer",
    colorTag: "#1a4a3a",
    startMonth: 6,
    startDay: 15,
    endMonth: 8,
    endDay: 31,
    baseRate: 750,
    minStay: 7,
    priority: 10,
    dowOverrides: [
      { dayOfWeek: 5, type: "ADD" as const, amount: 50 },
      { dayOfWeek: 6, type: "ADD" as const, amount: 50 },
    ],
  },
  {
    name: "Spring Blossom",
    colorTag: "#9caf88",
    startMonth: 4,
    startDay: 1,
    endMonth: 6,
    endDay: 14,
    baseRate: 550,
    minStay: 3,
    priority: 7,
    dowOverrides: [
      { dayOfWeek: 5, type: "ADD" as const, amount: 40 },
      { dayOfWeek: 6, type: "ADD" as const, amount: 40 },
    ],
  },
  {
    name: "Autumn Harvest",
    colorTag: "#C0AF7E",
    startMonth: 9,
    startDay: 1,
    endMonth: 11,
    endDay: 15,
    baseRate: 600,
    minStay: 4,
    priority: 8,
    dowOverrides: [
      { dayOfWeek: 5, type: "ADD" as const, amount: 45 },
      { dayOfWeek: 6, type: "ADD" as const, amount: 45 },
    ],
  },
  {
    name: "Winter Retreat",
    colorTag: "#8B9D83",
    startMonth: 11,
    startDay: 16,
    endMonth: 3,
    endDay: 31,
    baseRate: 450,
    minStay: 2,
    priority: 5,
    dowOverrides: [] as {
      dayOfWeek: number;
      type: "ADD" | "SUBTRACT" | "CUSTOM";
      amount: number;
    }[],
  },
  {
    name: "Holiday Premium",
    colorTag: "#d2691e",
    startMonth: 12,
    startDay: 20,
    endMonth: 1,
    endDay: 5,
    baseRate: 850,
    minStay: 5,
    priority: 15,
    dowOverrides: [] as {
      dayOfWeek: number;
      type: "ADD" | "SUBTRACT" | "CUSTOM";
      amount: number;
    }[],
  },
];

const SEED_EMAIL_TEMPLATES = [
  {
    name: "Booking Confirmation",
    subject: "Your stay at Casa Brunelli is confirmed! 🌿",
    body: `Dear {{guestName}},

We are thrilled to confirm your upcoming stay at Casa Brunelli.

Stay Details:
- Check-in: {{checkIn}}
- Check-out: {{checkOut}}
- Guests: {{guestCount}}
- Total: {{totalPrice}}

Your deposit of {{depositAmount}} has been received. The remaining balance of {{balanceAmount}} will be due 7 days before your arrival.

We look forward to welcoming you to Tuscany!

Warm regards,
The Casa Brunelli Team`,
    category: "BOOKING_CONFIRMATION" as const,
  },
  {
    name: "Deposit Received",
    subject: "Deposit received — Casa Brunelli",
    body: `Dear {{guestName}},

We have received your deposit payment of {{depositAmount}}. Your reservation is now secured.

Your balance of {{balanceAmount}} will be due on {{balanceDueDate}}.

See you in Tuscany!

Warm regards,
The Casa Brunelli Team`,
    category: "DEPOSIT_RECEIVED" as const,
  },
  {
    name: "Early Check-in Info",
    subject: "Early check-in details — Casa Brunelli",
    body: `Dear {{guestName}},

We wanted to share some information about early check-in options for your upcoming stay.

Standard check-in is from 3:00 PM. If you'd like to arrange an early check-in, please let us know and we'll do our best to accommodate you, subject to availability.

Looking forward to hosting you!

Warm regards,
The Casa Brunelli Team`,
    category: "EARLY_CHECKIN" as const,
  },
  {
    name: "Parking Instructions",
    subject: "Parking & arrival details — Casa Brunelli",
    body: `Dear {{guestName}},

Here are the parking and arrival details for your stay:

The property has private parking for up to 3 vehicles. Upon arrival, please follow the signs to the main gate. The access code will be sent separately closer to your arrival date.

GPS coordinates: 43.7696° N, 11.2558° E

See you soon!

Warm regards,
The Casa Brunelli Team`,
    category: "PARKING" as const,
  },
  {
    name: "General Inquiry Response",
    subject: "Re: Your inquiry about Casa Brunelli",
    body: `Dear {{guestName}},

Thank you for reaching out about Casa Brunelli. We'd be happy to answer your questions.

{{message}}

Please don't hesitate to contact us if you need anything else.

Warm regards,
The Casa Brunelli Team`,
    category: "GENERAL" as const,
  },
];

// ─── Sample Contact Messages ───────────────────────────────────

const SEED_MESSAGES = [
  {
    type: "BOOKING_REQUEST" as const,
    name: "Sophie Müller",
    email: "sophie.mueller@gmail.com",
    phone: "+49 151 23456789",
    subject: "Booking request: Aug 10–17, 4 guests",
    message:
      "Hello, we are a family of 4 (2 adults + 2 children, ages 8 and 11) interested in staying at Casa Brunelli from August 10th to 17th. Could you confirm availability? We are celebrating our 15th anniversary and would love to make it special. Do you have any special arrangements for anniversaries?",
    status: "UNREAD" as const,
    checkIn: new Date("2026-08-10"),
    checkOut: new Date("2026-08-17"),
    guestCount: 4,
    totalPrice: 5250,
  },
  {
    type: "BOOKING_REQUEST" as const,
    name: "James & Claire Thornton",
    email: "j.thornton@outlook.com",
    phone: "+44 7700 900123",
    subject: "Enquiry for September 2026 — 2 weeks",
    message:
      "Good morning. My wife and I are looking to book Casa Brunelli for two weeks in September, ideally September 5th to 19th. We've been following the property for a while and it looks absolutely stunning. We'd also like to know about restaurant recommendations in the area. Many thanks.",
    status: "UNREAD" as const,
    checkIn: new Date("2026-09-05"),
    checkOut: new Date("2026-09-19"),
    guestCount: 2,
    totalPrice: 8400,
  },
  {
    type: "GENERAL" as const,
    name: "Marco Benedetti",
    email: "m.benedetti@studio.it",
    phone: "+39 333 1234567",
    subject: "Domanda sulle attività nelle vicinanze",
    message:
      "Buongiorno, siamo interessati a una settimana a luglio. Vorremmo sapere se ci sono attività di wine tasting o tour delle cantine nelle vicinanze. Siamo appassionati di vini toscani. Grazie mille.",
    status: "READ" as const,
    checkIn: null,
    checkOut: null,
    guestCount: null,
    totalPrice: null,
  },
  {
    type: "BOOKING_REQUEST" as const,
    name: "Isabelle Fontaine",
    email: "isabelle.fontaine@orange.fr",
    phone: null,
    subject: "Réservation juin 2026 — groupe de 6",
    message:
      "Bonjour, nous sommes un groupe de 6 amis qui cherchons une villa pour notre semaine de vacances en Toscane. Nous serions intéressés par la semaine du 20 au 27 juin. Pourriez-vous nous confirmer la disponibilité et le prix total? Merci d'avance.",
    status: "REPLIED" as const,
    checkIn: new Date("2026-06-20"),
    checkOut: new Date("2026-06-27"),
    guestCount: 6,
    totalPrice: 3850,
  },
  {
    type: "QUESTION" as const,
    name: "Lars Andersen",
    email: "lars.andersen@proton.me",
    phone: "+47 900 12345",
    subject: "Question about the pool and accessibility",
    message:
      "Hi, we're planning a family holiday and one of our group uses a wheelchair. Could you tell us more about the accessibility features at Casa Brunelli? Also, is the pool area accessible? We would love to visit but want to make sure it's suitable. Thank you.",
    status: "UNREAD" as const,
    checkIn: null,
    checkOut: null,
    guestCount: null,
    totalPrice: null,
  },
];

// ─── Main ──────────────────────────────────────────────────────

async function main() {
  console.log("🌿 Starting Casa Brunelli seed...\n");

  // ── 1. Admin User ───────────────────────────────────────────
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? "Casa Brunelli Admin";

  if (!email || !password) {
    throw new Error(
      "Missing ADMIN_EMAIL or ADMIN_PASSWORD in .env — cannot seed admin user."
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash, name },
    create: {
      email,
      passwordHash,
      name,
      role: "SUPER_ADMIN",
    },
  });

  console.log(`✅ Admin user: ${admin.email} (${admin.role})`);

  // ── 2. Seasons ──────────────────────────────────────────────
  // Delete existing non-archived seasons to avoid duplicates on re-seed
  await prisma.dowOverride.deleteMany({});
  await prisma.season.deleteMany({});
  console.log("🗑  Cleared existing seasons");

  const currentYear = new Date().getFullYear();

  for (const s of SEED_SEASONS) {
    // Holiday Premium crosses year boundary (Dec → Jan)
    const startYear = currentYear;
    const endYear = s.endMonth < s.startMonth ? currentYear + 1 : currentYear;

    const season = await prisma.season.create({
      data: {
        name: s.name,
        colorTag: s.colorTag,
        startDate: seasonDate(startYear, s.startMonth, s.startDay),
        endDate: seasonDate(endYear, s.endMonth, s.endDay),
        baseRate: s.baseRate,
        minStay: s.minStay,
        priority: s.priority,
        status: "ACTIVE",
        dowOverrides: {
          create: s.dowOverrides.map((d) => ({
            dayOfWeek: d.dayOfWeek,
            type: d.type,
            amount: d.amount,
          })),
        },
      },
    });

    console.log(
      `✅ Season: ${season.name} (priority ${season.priority}, €${season.baseRate}/night)`
    );
  }

  // ── 3. Email Templates ──────────────────────────────────────
  for (const t of SEED_EMAIL_TEMPLATES) {
    const existing = await prisma.emailTemplate.findFirst({
      where: { name: t.name },
    });

    if (!existing) {
      await prisma.emailTemplate.create({
        data: {
          name: t.name,
          subject: t.subject,
          body: t.body,
          category: t.category,
          isActive: true,
          createdBy: admin.id,
        },
      });
      console.log(`✅ Email template: ${t.name}`);
    } else {
      console.log(`⏭  Email template already exists: ${t.name}`);
    }
  }

  // ── 4. Sample Contact Messages ──────────────────────────────
  const existingMessages = await prisma.contactMessage.count();

  if (existingMessages === 0) {
    for (const m of SEED_MESSAGES) {
      await prisma.contactMessage.create({
        data: {
          type: m.type,
          name: m.name,
          email: m.email,
          phone: m.phone ?? null,
          subject: m.subject,
          message: m.message,
          status: m.status,
          checkIn: m.checkIn ?? null,
          checkOut: m.checkOut ?? null,
          guestCount: m.guestCount ?? null,
          totalPrice: m.totalPrice ?? null,
          ...(m.status === "REPLIED" && {
            repliedBy: admin.id,
            repliedAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          }),
        },
      });
      console.log(`✅ Message: "${m.subject}" (${m.status})`);
    }
  } else {
    console.log(
      `⏭  Skipped messages — ${existingMessages} already exist`
    );
  }

  console.log("\n🎉 Seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
