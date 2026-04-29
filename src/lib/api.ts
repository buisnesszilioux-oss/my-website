/**
 * Thin API client. Tries the Firestore adapter first for migrated routes,
 * then falls back to the Node backend for things still served there
 * (uploads, PDF generation, MI chat, backups, ledger, applications, etc.).
 *
 * The Firebase ID token is attached as a Bearer token on admin requests
 * so any remaining Node-backed admin endpoints can validate the caller.
 */

import { tryFirestoreFetch, AdapterError, installFetchInterceptor } from "./firestoreApi";

// Preserve the original window.fetch for callers that explicitly want to bypass
// any future interceptors. The Firestore adapter is now a no-op stub.
installFetchInterceptor();

export interface Product {
  id: string;
  slug: string;
  name: string;
  image: string;
  images?: string[];
  category?: string;
  standard: string;
  description: string;
  sizes: string;
  threads: string;
  length: string;
  material: string;
  finish: string[];
  grades: string[];
  applications: string[];
  dimensions: { label: string; value: string }[];
}

export interface Industry {
  id: string;
  slug: string;
  name: string;
  description: string;
  heroDescription: string;
  image: string;
  grades: { grade: string; specification: string; usage: string }[];
  applications: { name: string; description: string; image: string }[];
  keyRequirements: string[];
}

export interface Standard {
  id: string;
  slug: string;
  code: string;
  name: string;
  region: string;
  description: string;
  image: string;
  scope: string;
  applications: string[];
  materials: string[];
  examples: string[];
}

export interface ContactSubmission {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  message: string;
  createdAt: string;
}

// Legacy token helpers — kept as no-ops so existing admin pages that import
// them continue to compile. Real auth is now Firebase Auth via AuthContext.
const LEGACY_TOKEN_KEY = "mi_admin_token";
export const getToken = () => localStorage.getItem(LEGACY_TOKEN_KEY);
export const setToken = (t: string) => localStorage.setItem(LEGACY_TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(LEGACY_TOKEN_KEY);

async function bearerHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {};
  try {
    if (auth.currentUser) {
      const idToken = await auth.currentUser.getIdToken();
      headers["Authorization"] = `Bearer ${idToken}`;
    } else {
      const legacy = getToken();
      if (legacy) headers["Authorization"] = `Bearer ${legacy}`;
    }
  } catch {
    /* non-fatal */
  }
  return headers;
}

export async function api<T = any>(path: string, opts: RequestInit = {}): Promise<T> {
  // Firestore adapter takes precedence for migrated routes.
  try {
    const fsResult = await tryFirestoreFetch(path, opts);
    if (fsResult !== null) return fsResult as T;
  } catch (e) {
    if (e instanceof AdapterError) throw new Error(e.message);
    throw e;
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(await bearerHeaders()),
    ...(opts.headers as any),
  };
  const res = await fetch(path, { ...opts, headers });
  if (!res.ok) {
    if ((res.status === 401 || res.status === 403) && path.startsWith("/api/admin")) {
      // Don't auto-redirect when we're on Firebase auth — let the page handle it.
      console.warn("[api] admin request returned", res.status, "for", path);
    }
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed (${res.status})`);
  }
  return res.json();
}

export async function uploadFile(file: File): Promise<{ url: string }> {
  const fd = new FormData();
  fd.append("file", file);
  const headers = await bearerHeaders();
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd, headers });
  if (!res.ok) throw new Error("Upload failed");
  return res.json();
}
