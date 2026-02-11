import { PrismaClient } from "@prisma/client";

// ─── Prisma Client Singleton ───────────────────────────────────
// In development, Next.js hot reload would create multiple Prisma
// instances without this pattern — exhausting the DB connection pool.
// We attach the client to `globalThis` so it survives hot reloads.

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
