import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
import * as schema from "../shared/schema";

const { Pool } = pkg;

if (!process.env.DATABASE_URL) {
  // Log a clear warning instead of throwing — prevents the Vercel function from
  // crashing at import time. Errors surface when the first DB query is attempted.
  console.error(
    "[db] WARNING: DATABASE_URL is not set.\n" +
    "     Admin login will use the ADMIN_PASSWORD env var as fallback.\n" +
    "     To enable full database features on Vercel, set DATABASE_URL to a\n" +
    "     public PostgreSQL URL (e.g. Neon: https://neon.tech, Supabase: https://supabase.com)"
  );
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://none:none@127.0.0.1:5432/none",
  // Keep timeouts short on serverless — Vercel functions timeout at 10s by default.
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 8000,
  max: 3,
});

pool.on("error", (err) => {
  console.error("[db] Pool error:", err.message);
});

export const db = drizzle(pool, { schema });
