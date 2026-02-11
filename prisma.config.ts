import { defineConfig } from "prisma/config";

// Prisma v7 — connection URL moved from schema.prisma to prisma.config.ts
// See: https://pris.ly/d/config-datasource

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
