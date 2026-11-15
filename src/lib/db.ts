import { cache } from "react";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

export { COUNTIES, PROPERTY_TYPES, BER_RATINGS } from "./constants";

const getPrismaClient = cache(() => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured for this environment.");
  }

  const adapter = new PrismaPg({ connectionString, maxUses: 1 });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
});

// Keep the public Prisma API used by the app, while creating one database client
// per server request so Workers do not reuse a PostgreSQL pool across requests.
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const client = getPrismaClient();
    const value = Reflect.get(client, property, client) as unknown;
    return typeof value === "function" ? value.bind(client) : value;
  },
});

