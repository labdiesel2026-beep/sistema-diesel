import { PrismaClient } from "@prisma/client";
import { ENV } from "./env.js";

declare global {
  // eslint-disable-next-line no-var
  var __prismaInstance: PrismaClient | undefined;
}

/**
 * Cliente Prisma singleton para acceso persistente y estructurado a PostgreSQL.
 * (RF-01, 4.6, D-01)
 */
export const prisma =
  globalThis.__prismaInstance ??
  new PrismaClient({
    datasources: {
      db: {
        url: ENV.DATABASE_URL,
      },
    },
    log:
      ENV.NODE_ENV === "development"
        ? [
            { emit: "stdout", level: "warn" },
            { emit: "stdout", level: "error" },
          ]
        : [{ emit: "stdout", level: "error" }],
  });

if (ENV.NODE_ENV !== "production") {
  globalThis.__prismaInstance = prisma;
}

export default prisma;
