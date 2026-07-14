// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";

function createPrismaClient() {
  if (process.env.NEXT_RUNTIME === "edge") {
    return new Proxy({}, {
      get() {
        throw new Error("Prisma cannot be executed in the Edge Runtime.");
      }
    }) as any;
  }
  return new PrismaClient();
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
