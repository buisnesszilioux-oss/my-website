/**
 * Vercel serverless function for /api/admin/login
 *
 * This file is auto-routed by Vercel's file-system routing and takes precedence
 * over the /api/:path* rewrite in vercel.json — so this always handles login.
 *
 * STRATEGY: Try the database first (4-second timeout). If the DB is unreachable
 * (e.g. Replit-internal URL not accessible from Vercel), fall back to comparing
 * the password directly against the ADMIN_PASSWORD environment variable. This
 * lets admin login work on Vercel even before an external database is configured.
 */
import type { IncomingMessage, ServerResponse } from "http";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db } from "../../server/db";
import { adminUsers } from "../../shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

/** Stream-read and JSON-parse the POST body */
function readBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve) => {
    let raw = "";
    req.on("data", (chunk: Buffer) => { raw += chunk.toString(); });
    req.on("end", () => {
      try { resolve(JSON.parse(raw || "{}")); } catch { resolve({}); }
    });
    req.on("error", () => resolve({}));
  });
}

/** Write a JSON response */
function json(res: ServerResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(payload),
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });
  res.end(payload);
}

/** Run a DB query with an explicit timeout so we fail fast on Vercel cold-start */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`DB_TIMEOUT after ${ms}ms`)), ms)
    ),
  ]);
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method === "OPTIONS") return json(res, 200, {});
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed. Use POST." });

  try {
    // ── 1. Parse body ──────────────────────────────────────────────────────────
    const body = await readBody(req);
    const username = (typeof body.username === "string" ? body.username : "").trim().toLowerCase();
    const password  = typeof body.password  === "string" ? body.password  : "";

    if (!username || !password) {
      return json(res, 400, { error: "Email and password are required." });
    }

    // ── 2. Email whitelist ─────────────────────────────────────────────────────
    const allowedEmails = (
      process.env.ADMIN_USERNAME || "miengineering@gmail.com,miengineering17@gmail.com"
    ).split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);

    if (!allowedEmails.includes(username)) {
      return json(res, 401, { error: "Only the admin email is allowed to sign in." });
    }

    // ── 3. Try database lookup (4.5-second timeout) ────────────────────────────
    let dbUser: { id: number; username: string; passwordHash: string } | null = null;
    let dbAvailable = false;

    try {
      const rows = await withTimeout(
        db.select().from(adminUsers).where(eq(adminUsers.username, username)),
        4500
      );
      dbUser = rows[0] ?? null;
      dbAvailable = true;
      console.log(`[login] DB reachable. User found: ${dbUser ? "yes" : "no"}`);
    } catch (dbErr: any) {
      console.warn(`[login] DB unavailable (${dbErr.message}). Falling back to env var auth.`);
      dbAvailable = false;
    }

    // ── 4. Verify credentials ──────────────────────────────────────────────────
    if (dbAvailable && dbUser) {
      // Happy path: DB works and user exists → bcrypt compare
      const ok = await bcrypt.compare(password, dbUser.passwordHash);
      if (!ok) return json(res, 401, { error: "Invalid password." });

    } else if (dbAvailable && !dbUser) {
      // DB works but no admin row found (not seeded yet)
      return json(res, 401, {
        error:
          "Admin account not found in the database. " +
          "Run `npm run db:push` then `npm run db:seed` against your production database, " +
          "or set ADMIN_PASSWORD in Vercel environment variables for env-var login.",
      });

    } else {
      // DB unreachable → fall back to plain-text comparison against ADMIN_PASSWORD env var
      // (This is intentional: allows Vercel login without an external database configured)
      const envPass = process.env.ADMIN_PASSWORD || "6392061892";
      if (password !== envPass) {
        return json(res, 401, { error: "Invalid password." });
      }
      console.log(`[login] Authenticated via ADMIN_PASSWORD env var (DB unavailable).`);
    }

    // ── 5. Issue JWT ───────────────────────────────────────────────────────────
    const token = jwt.sign(
      { id: dbUser?.id ?? 0, username },
      JWT_SECRET,
      { expiresIn: "12h" }
    );

    console.log(`[login] Admin "${username}" signed in successfully.`);
    return json(res, 200, { token });

  } catch (err: any) {
    console.error("[login] Unhandled error:", err?.message ?? String(err));
    console.error("[login] Stack:", err?.stack ?? "(no stack)");

    let message = "Internal server error. Check Vercel function logs for details.";
    if (err?.message?.includes("ECONNREFUSED") || err?.message?.includes("connect") || err?.message?.includes("timeout")) {
      message = "Cannot connect to the database. Ensure DATABASE_URL on Vercel points to a public PostgreSQL server (not localhost or Replit-internal).";
    }
    return json(res, 500, { error: message });
  }
}
