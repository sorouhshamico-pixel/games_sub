import { PrismaClient } from "../generated/client";

declare global {
   
  var __prisma: PrismaClient | undefined;
}

// Reuse the client across hot reloads in dev so we don't exhaust Postgres
// connections; each serverless/worker process still gets its own instance.
export const prisma = globalThis.__prisma ?? new PrismaClient();

if (process.env["NODE_ENV"] !== "production") {
  globalThis.__prisma = prisma;
}

export * from "../generated/client";
export * from "./order-state-machine";
export * from "./notifications";
