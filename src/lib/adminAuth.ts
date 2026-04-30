/**
 * Legacy admin-auth helpers — kept for backwards compatibility.
 *
 * Authentication is now handled by Firebase Auth via `AuthContext`.
 * These helpers continue to work so any older imports still compile,
 * but `getAdminToken` now returns the current Firebase ID token.
 */

import { auth, isAdminEmail } from "./firebase";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";

const TOKEN_KEY = "mi_admin_token";
const EMAIL_KEY = "mi_admin_email";

export function getAdminToken(): string | null {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

export function getAdminEmail(): string | null {
  try { return localStorage.getItem(EMAIL_KEY); } catch { return null; }
}

export function setAdminSession(token: string, email: string) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(EMAIL_KEY, email);
  } catch { /* ignore */ }
}

export function clearAdminSession() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EMAIL_KEY);
  } catch { /* ignore */ }
}

export async function adminLogin(email: string, password: string): Promise<{ token: string; email: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!isAdminEmail(cleanEmail)) {
    throw new Error("This email is not authorised as an admin.");
  }
  const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
  const token = await cred.user.getIdToken();
  setAdminSession(token, cleanEmail);
  return { token, email: cleanEmail };
}

export async function adminLogout() {
  clearAdminSession();
  try { await signOut(auth); } catch { /* ignore */ }
}

export async function verifyAdminToken(): Promise<boolean> {
  const u = auth.currentUser;
  return !!u && isAdminEmail(u.email);
}

export function isAdminLoggedIn(): boolean {
  return !!auth.currentUser && isAdminEmail(auth.currentUser.email);
}
