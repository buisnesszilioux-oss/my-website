import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

if (!firebaseConfig.apiKey) {
  console.error(
    "[firebase] VITE_FIREBASE_API_KEY missing. Set the VITE_FIREBASE_* env vars."
  );
}

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Comma-separated allow-list of admin emails (read on the client only — Firestore
// security rules should also enforce this server-side).
const RAW_ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS as string | undefined) || "";
export const ADMIN_EMAILS: string[] = RAW_ADMIN_EMAILS
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

export const ADMIN_EMAIL = ADMIN_EMAILS[0] || "";

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(String(email).trim().toLowerCase());
}

export default app;
