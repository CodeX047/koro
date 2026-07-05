import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool, PoolClient, QueryResult } from "pg";
import { env } from "./env";

declare global {
  var _postgresPool: Pool | undefined;
}

const pool =
  globalThis._postgresPool ||
  new Pool({
    connectionString: env.DATABASE_URL,
    max: 10, // default max 10
  });

if (process.env.NODE_ENV !== "production") {
  globalThis._postgresPool = pool;
}

export const db = drizzle(pool);
export * from "drizzle-orm";
export default db;
