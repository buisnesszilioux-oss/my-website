/**
 * Thin client wrapper that routes every legacy `/api/*` call through the
 * Firestore adapter (see `firestoreApi.ts`). The Node backend is gone — the
 * frontend talks directly to Firestore + Firebase Auth.
 */

import { tryFirestoreFetch, AdapterError, installFetchInterceptor } from "./firestoreApi";
import { storage } from "./firebase";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

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
 * Upload a file (image / video / pdf) to Firebase Storage and return a public
 * download URL. Requires Firebase Storage to be enabled in the Firebase Console
 * and the storage rules to allow writes for admin users.
 */
export async function uploadFile(file: File): Promise<{ url: string }> {
  if (!file) throw new Error("No file selected");
  const MAX_BYTES = 50 * 1024 * 1024;
  if (file.size > MAX_BYTES) {
    throw new Error(`File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max 50 MB.`);
  }
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "_");
  const path = `uploads/${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${safeName}`;
  try {
    const r = storageRef(storage, path);
    const snap = await uploadBytes(r, file, { contentType: file.type || "application/octet-stream" });
    const url = await getDownloadURL(snap.ref);
    return { url };
  } catch (e: any) {
    const code = e?.code || "";
    if (code === "storage/unauthorized") {
      throw new Error(
        "Upload blocked by Firebase Storage rules. Open Firebase Console → Storage → Rules and allow writes for admin users.",
      );
    }
    if (code === "storage/unknown" || /CORS|network/i.test(String(e?.message || ""))) {
      throw new Error(
        "Upload failed — Firebase Storage may not be enabled. Open Firebase Console → Storage → Get Started to enable it.",
      );
    }
    throw new Error(e?.message || "Upload failed");
  }
}
