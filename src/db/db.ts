// TODO: use neon on production
// import "server-only";
// import { neon, Pool } from "@neondatabase/serverless";
// import { drizzle as drizzleHttp } from "drizzle-orm/neon-http";
// import { drizzle as drizzleWs } from "drizzle-orm/neon-serverless";
// import * as schema from "@/db/schema";

// const connectionString = process.env.DATABASE_URL!;

// // HTTP-based driver for reads (stateless, no persistent connections)
// const sql = neon(connectionString);
// export const db = drizzleHttp(sql, { schema });

// // WebSocket pool for transactions only (limited connections for Neon free tier)
// const pool = new Pool({
//   connectionString,
//   max: 1,
//   idleTimeoutMillis: 30_000,
//   connectionTimeoutMillis: 5_000,
// });
// export const dbTx = drizzleWs(pool, { schema });

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
export const dbTx = db;
