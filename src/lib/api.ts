/**
 * Thin client wrapper that routes every legacy `/api/*` call through the
 * Firestore adapter (see `firestoreApi.ts`). The Node backend is gone — the
 * frontend talks directly to Firestore + Firebase Auth.
 */

import { tryFirestoreFetch, AdapterError, installFetchInterceptor } from "./firestoreApi";

// Install the global fetch interceptor so even raw `fetch("/api/...")` calls
// scattered across the codebase are routed to Firestore.
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

export interface Customer {
  id: string;
  name: string;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
  createdAt?: string | null;
}

export interface LedgerEntry {
  id: string;
  customerId: string;
  customerName: string;
  invoiceDate: string;
  invoiceNo: string;
  amountDue: string | number;
  amountReceived?: string | number | null;
  paymentDate?: string | null;
  notes?: string | null;
  tallyReceiptDone?: boolean | null;
  bookEntryDone?: boolean | null;
  createdAt?: string | null;
}

// Legacy token helpers — kept as no-ops so existing admin pages that import
// them continue to compile. Real auth is now Firebase Auth via AuthContext.
const LEGACY_TOKEN_KEY = "mi_admin_token";
export const getToken = () => localStorage.getItem(LEGACY_TOKEN_KEY);
export const setToken = (t: string) => localStorage.setItem(LEGACY_TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(LEGACY_TOKEN_KEY);

/** Generic API helper. Routes every call through the Firestore adapter. */
export async function api<T = any>(path: string, opts: RequestInit = {}): Promise<T> {
  try {
    const data = await tryFirestoreFetch(path, opts);
    if (data === null) {
      throw new Error(`No Firestore route for ${path}`);
    }
    return data as T;
  } catch (e) {
    if (e instanceof AdapterError) throw new Error(e.message);
    throw e;
  }
}

/**
 * Upload a file (image / video / pdf) to Cloudinary and return a public
 * delivery URL. Uses an UNSIGNED upload preset so no server is needed.
 *
 * Required env vars (set as Replit secrets, prefixed VITE_ so Vite exposes them):
 *   VITE_CLOUDINARY_CLOUD_NAME    — your Cloudinary cloud name
 *   VITE_CLOUDINARY_UPLOAD_PRESET — name of an UNSIGNED upload preset
 *
 * Setup steps in Cloudinary dashboard:
 *   1. Settings → Upload → Add upload preset → Signing Mode = "Unsigned"
 *   2. (Optional) Set a folder, allowed formats, max file size on the preset
 */
export async function uploadFile(file: File): Promise<{ url: string }> {
  if (!file) throw new Error("No file selected");

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined;
  const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined;
  if (!cloudName || !preset) {
    throw new Error(
      "Cloudinary not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in Replit Secrets.",
    );
  }

  // Cloudinary auto-routes images / videos / raw files based on `resource_type=auto`.
  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", preset);

  const realFetch = (window as any).__realFetch__ || window.fetch.bind(window);
  const res = await realFetch(endpoint, { method: "POST", body: form });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = data?.error?.message || `Cloudinary upload failed (${res.status})`;
    throw new Error(msg);
  }
  const url: string = data?.secure_url || data?.url;
  if (!url) throw new Error("Cloudinary did not return a URL");
  return { url };
}
