import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
import * as schema from "../shared/schema";

const { Pool } = pkg;

const RAW_URL = process.env.DATABASE_URL || "";

if (!RAW_URL) {
  console.error(
    "[db] WARNING: DATABASE_URL is not set.\n" +
    "     Admin login will use the ADMIN_PASSWORD env var as fallback.\n" +
    "     To enable full database features, set DATABASE_URL to a public\n" +
    "     PostgreSQL URL (e.g. Neon: https://neon.tech)."
  );
}

// ── SSL detection ─────────────────────────────────────────────────────────────
// Neon, Supabase, Render, Heroku Postgres etc. all require SSL.
// node-postgres does NOT enable SSL automatically just because the URL says so.
// We enable SSL whenever the URL contains sslmode=require OR a known managed-DB host.
const needsSsl =
  /sslmode=require|sslmode=verify/.test(RAW_URL) ||
  /neon\.tech|supabase\.co|render\.com|amazonaws\.com|aivencloud\.com|railway\.app/.test(RAW_URL);

// Strip the channel_binding=require param (newer pg drivers reject it on cPanel).
const cleanUrl = RAW_URL.replace(/[?&]channel_binding=[^&]*/g, "").replace(/[?&]+$/, "");

export const pool = new Pool({
  connectionString: cleanUrl || "postgresql://none:none@127.0.0.1:5432/none",
  ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
  connectionTimeoutMillis: 8000,
  idleTimeoutMillis: 8000,
  max: 3,
});

pool.on("error", (err) => {
  console.error("[db] Pool error:", err.message);
});

if (needsSsl) console.log("[db] SSL enabled (managed DB host detected)");

export const db = drizzle(pool, { schema });
