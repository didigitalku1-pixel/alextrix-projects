import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Only log queries in development — production should be quiet for perf
const logConfig =
  process.env.NODE_ENV === "development"
    ? ["error", "warn"]
    : ["error"];

export const db =
  globalForPrisma.prisma ?? new PrismaClient({ log: logConfig });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
