// Firebase has been removed — the app now uses Postgres-backed auth on the
// Node backend (`/api/auth/*`). This stub exists only so that any leftover
// imports from `@/lib/firebase` continue to compile without runtime errors.
// Admin emails are determined server-side; the frontend never lists them.
export const ADMIN_EMAIL = "";
export const ADMIN_EMAILS: string[] = [];
export const auth: any = null;
export const db: any = null;
const app: any = null;
export default app;
