// app/api/contact/route.ts
// Public endpoint — no auth required
// Creates a ContactMessage of type GENERAL (or QUESTION)

import { prisma } from "@/lib/prisma";
import { MESSAGE_TYPE } from "@/lib/constants";
import { contactSchema, validationError } from "@/lib/validations/admin";

// ─── POST /api/contact ─────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error);
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

    return Response.json(
      { success: true, data: { id: contactMessage.id } },
      { status: 201 },
    );
  } catch (error) {
    console.error("[API] POST /api/contact error:", error);
    return Response.json(
      { success: false, error: "Failed to submit contact form" },
      { status: 500 },
    );
  }
}
