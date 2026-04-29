// ─────────────────────────────────────────────────────────────────────────────
// Centralised configuration loader.
// All sensitive values (admin emails, master password, JWT secret, contact
// email) are read ONLY from environment variables — never hardcoded in source.
//
// In production (cPanel / Replit Deployments) set these via the host's
// environment-variable / secrets panel. In local development copy
// `.env.example` to `.env` and fill in the values.
// ─────────────────────────────────────────────────────────────────────────────

function readList(value: string | undefined): string[] {
  return (value || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function warnOnce(key: string, message: string) {
  if ((global as any).__warnedKeys?.has?.(key)) return;
  (global as any).__warnedKeys = (global as any).__warnedKeys || new Set<string>();
  (global as any).__warnedKeys.add(key);
  console.warn(`[config] ${message}`);
}

/** List of admin emails (lowercased). Empty if not configured. */
export function adminEmails(): string[] {
  const list = readList(process.env.ADMIN_USERNAME);
  if (list.length === 0) {
    warnOnce(
      "ADMIN_USERNAME",
      "ADMIN_USERNAME is not set. No admin can sign in. Set it (comma-separated emails)."
    );
  }
  return list;
}

/** Master admin password. Returns null if not configured. */
export function adminMasterPassword(): string | null {
  const pw = process.env.ADMIN_PASSWORD || "";
  if (!pw) {
    warnOnce(
      "ADMIN_PASSWORD",
      "ADMIN_PASSWORD is not set. Admin login will be disabled until it is configured."
    );
    return null;
  }
  return pw;
}

/** JWT signing secret. Falls back to a random per-process secret if missing. */
let _jwtFallback: string | null = null;
export function jwtSecret(): string {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (!_jwtFallback) {
    _jwtFallback = require("crypto").randomBytes(48).toString("hex");
    warnOnce(
      "JWT_SECRET",
      "JWT_SECRET is not set. Generated a random per-process secret — sessions will reset on every restart."
    );
  }
  return _jwtFallback!;
}

/** Email address used as the destination for contact-form submissions. */
export function contactEmail(): string {
  return (process.env.CONTACT_TO_EMAIL || process.env.ADMIN_USERNAME?.split(",")[0] || "").trim();
}

/** True when the supplied email is one of the configured admin emails. */
export function isAdminEmail(email: string): boolean {
  if (!email) return false;
  return adminEmails().includes(String(email).trim().toLowerCase());
}
