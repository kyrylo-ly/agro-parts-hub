import "server-only";

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

import * as schema from "@/db/schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) throw new Error("DATABASE_URL is missing in .env file");

const globalForDb = globalThis as unknown as {
    client: postgres.Sql | undefined;
};

export const client =
    globalForDb.client ??
    postgres(connectionString, {
        max: process.env.NODE_ENV === "production" ? 1 : 10,
        idle_timeout: 30,
        connect_timeout: 5,
    });

if (process.env.NODE_ENV === "development") {
    globalForDb.client = client;
}

export const db = drizzle(client, { schema });
