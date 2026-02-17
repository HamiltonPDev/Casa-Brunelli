import { defineConfig } from "prisma/config";
import "dotenv/config";

// Prisma v7 — connection URL moved from schema.prisma to prisma.config.ts
// See: https://pris.ly/d/config-datasource
// dotenv/config loads .env before Prisma reads process.env

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    // Seed command — replaces the old "prisma.seed" in package.json (Prisma v7)
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DIRECT_URL,
  },
});
