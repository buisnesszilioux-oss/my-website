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

/** File uploads are disabled in the static (cPanel + Firestore) build. */
export async function uploadFile(_file: File): Promise<{ url: string }> {
  throw new Error(
    "Image upload is disabled. Upload your file to the cPanel /uploads/ folder via File Manager and paste the URL (e.g. /uploads/myimage.jpg).",
  );
}
