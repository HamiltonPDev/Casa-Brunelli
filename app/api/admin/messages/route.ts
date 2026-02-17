import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MESSAGE_STATUS } from "@/lib/constants";

// ─── GET /api/admin/messages ────────────────────────────────────
// Returns all ContactMessages ordered by createdAt desc.
// Optional ?status= filter (UNREAD | READ | REPLIED).
// Protected: admin session required.

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status");

  try {
    const messages = await prisma.contactMessage.findMany({
      where:
        statusParam &&
        Object.values(MESSAGE_STATUS).includes(
          statusParam as (typeof MESSAGE_STATUS)[keyof typeof MESSAGE_STATUS]
        )
          ? {
              status:
                statusParam as (typeof MESSAGE_STATUS)[keyof typeof MESSAGE_STATUS],
            }
          : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        admin: { select: { name: true } },
      },
    });

    return Response.json({ success: true, data: messages });
  } catch (error) {
    console.error("[API] GET /admin/messages failed:", error);
    return Response.json(
      { success: false, error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
