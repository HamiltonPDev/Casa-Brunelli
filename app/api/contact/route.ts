// app/api/contact/route.ts
// Public endpoint — no auth required
// Creates a ContactMessage of type GENERAL (or QUESTION)

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { prisma } from "@/lib/prisma";
import { MESSAGE_TYPE } from "@/lib/constants";

// ─── Validation Schema ─────────────────────────────────────────

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.email("Invalid email address"),
  phone: z.string().optional(),
  subject: z.string().min(3, "Subject too short").max(200),
  message: z.string().min(10, "Message too short").max(5000),
});

// ─── POST /api/contact ─────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid input", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { name, email, phone, subject, message } = parsed.data;

    const contactMessage = await prisma.contactMessage.create({
      data: {
        type: MESSAGE_TYPE.GENERAL,
        name,
        email,
        phone: phone ?? null,
        subject,
        message,
      },
    });

    return NextResponse.json(
      { success: true, data: { id: contactMessage.id } },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API] POST /api/contact error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit contact form" },
      { status: 500 }
    );
  }
}
