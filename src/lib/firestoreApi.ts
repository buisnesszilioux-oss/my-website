/**
 * firestoreApi — Transparent adapter that intercepts /api/* calls
 * and routes them to Firestore for migrated collections.
 *
 * Strategy:
 *   - tryFirestoreFetch(path, opts) returns the JSON payload if the route
 *     is handled by Firestore, or `null` to let the caller fall back to
 *     real fetch() (for things still served by the Node backend, like
 *     uploads, PDF generation, email sending).
 *   - We also install a window.fetch interceptor so even raw fetch() calls
 *     to /api/* paths are routed through Firestore when applicable.
 *
 * Migrated collections (Phase 2 round 1):
 *   - siteContent      (key/value site-wide content, doc id = key)
 *   - pageSections     (custom homepage sections)
 *   - floatingImages   (hero floating images)
 *   - products
 *   - industries
 *   - standards
 *   - media            (gallery, hero, banner, product photos/videos)
 *   - contacts         (public contact-form submissions)
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  addDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function fromDoc(snap: { id: string; data: () => any }): any {
  const data = snap.data() ?? {};
  const out: any = { ...data, id: snap.id };
  for (const k of Object.keys(out)) {
    if (out[k] instanceof Timestamp) out[k] = out[k].toDate().toISOString();
  }
  return out;
}

async function listCollection(
  name: string,
  opts: { orderField?: string; filter?: (d: any) => boolean } = {},
) {
  const ref = collection(db, name);
  const q = opts.orderField ? query(ref, orderBy(opts.orderField, "asc")) : ref;
  const snap = await getDocs(q);
  let items = snap.docs.map(fromDoc);
  if (opts.filter) items = items.filter(opts.filter);
  return items;
}

async function getDocByField(name: string, field: string, value: string): Promise<any | null> {
  const ref = collection(db, name);
  const snap = await getDocs(query(ref, where(field, "==", value)));
  if (snap.empty) return null;
  return fromDoc(snap.docs[0]);
}

async function getDocOrBySlug(name: string, idOrSlug: string): Promise<any> {
  // Try direct doc id first
  const ref = doc(db, name, idOrSlug);
  const snap = await getDoc(ref);
  if (snap.exists()) return fromDoc(snap);
  // Fall back to slug field lookup
  const bySlug = await getDocByField(name, "slug", idOrSlug);
  if (!bySlug) throw new HttpError(404, "Not found");
  return bySlug;
}

async function createDoc(name: string, data: any, naturalIdField?: string) {
  const payload: any = { ...data };
  delete payload.id; // never let caller set Firestore id via body field

  // For naturally-keyed collections (e.g. siteContent uses 'key' as id)
  if (naturalIdField && payload[naturalIdField]) {
    const id = String(payload[naturalIdField]);
    const ref = doc(db, name, id);
    await setDoc(ref, { ...payload, sortOrder: payload.sortOrder ?? Date.now() });
    return fromDoc(await getDoc(ref));
  }

  const docRef = await addDoc(collection(db, name), {
    ...payload,
    sortOrder: payload.sortOrder ?? Date.now(),
    createdAt: payload.createdAt ?? serverTimestamp(),
  });
  return fromDoc(await getDoc(docRef));
}

async function updateById(name: string, id: string, data: any) {
  const payload: any = { ...data };
  delete payload.id;
  const ref = doc(db, name, id);
  await updateDoc(ref, payload);
  return fromDoc(await getDoc(ref));
}

async function deleteById(name: string, id: string) {
  await deleteDoc(doc(db, name, id));
  return { ok: true };
}

class HttpError extends Error {
  constructor(public status: number, msg: string) {
    super(msg);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Route table
// ─────────────────────────────────────────────────────────────────────────────

type Method = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
type RouteHandler = (m: RegExpMatchArray, body: any) => Promise<any>;
type Route = { pattern: RegExp; method: Method; handle: RouteHandler };

const ROUTES: Route[] = [
  // ── Site content (key/value) ────────────────────────────────────────────
  {
    pattern: /^\/api\/site-content$/,
    method: "GET",
    handle: async () => {
      const items = await listCollection("siteContent");
      const map: Record<string, string> = {};
      for (const it of items) map[it.id] = it.value ?? "";
      return map;
    },
  },
  {
    pattern: /^\/api\/admin\/site-content$/,
    method: "POST",
    handle: async (_m, body) => {
      if (!body?.key) throw new HttpError(400, "key is required");
      return createDoc("siteContent", { key: body.key, value: body.value ?? "" }, "key");
    },
  },

  // ── Page sections ───────────────────────────────────────────────────────
  {
    pattern: /^\/api\/page-sections$/,
    method: "GET",
    handle: async () =>
      listCollection("pageSections", {
        orderField: "sortOrder",
        filter: (d) => d.enabled !== false,
      }),
  },
  {
    pattern: /^\/api\/admin\/page-sections$/,
    method: "POST",
    handle: async (_m, body) => createDoc("pageSections", body),
  },
  {
    pattern: /^\/api\/admin\/page-sections\/(.+)$/,
    method: "PATCH",
    handle: async (m, body) => updateById("pageSections", m[1], body),
  },
  {
    pattern: /^\/api\/admin\/page-sections\/(.+)$/,
    method: "DELETE",
    handle: async (m) => deleteById("pageSections", m[1]),
  },

  // ── Floating images ─────────────────────────────────────────────────────
  {
    pattern: /^\/api\/floating-images$/,
    method: "GET",
    handle: async () =>
      listCollection("floatingImages", {
        orderField: "sortOrder",
        filter: (d) => d.enabled !== false,
      }),
  },
  {
    pattern: /^\/api\/admin\/floating-images$/,
    method: "GET",
    handle: async () => listCollection("floatingImages", { orderField: "sortOrder" }),
  },
  {
    pattern: /^\/api\/admin\/floating-images$/,
    method: "POST",
    handle: async (_m, body) => createDoc("floatingImages", body),
  },
  {
    pattern: /^\/api\/admin\/floating-images\/(.+)$/,
    method: "PATCH",
    handle: async (m, body) => updateById("floatingImages", m[1], body),
  },
  {
    pattern: /^\/api\/admin\/floating-images\/(.+)$/,
    method: "DELETE",
    handle: async (m) => deleteById("floatingImages", m[1]),
  },

  // ── Products ────────────────────────────────────────────────────────────
  {
    pattern: /^\/api\/products$/,
    method: "GET",
    handle: async () => listCollection("products", { orderField: "sortOrder" }),
  },
  {
    pattern: /^\/api\/products\/([^/]+)$/,
    method: "GET",
    handle: async (m) => getDocOrBySlug("products", m[1]),
  },
  {
    pattern: /^\/api\/admin\/products$/,
    method: "POST",
    handle: async (_m, body) => createDoc("products", body),
  },
  {
    pattern: /^\/api\/admin\/products\/(.+)$/,
    method: "PATCH",
    handle: async (m, body) => updateById("products", m[1], body),
  },
  {
    pattern: /^\/api\/admin\/products\/(.+)$/,
    method: "DELETE",
    handle: async (m) => deleteById("products", m[1]),
  },

  // ── Industries ──────────────────────────────────────────────────────────
  {
    pattern: /^\/api\/industries$/,
    method: "GET",
    handle: async () => listCollection("industries", { orderField: "sortOrder" }),
  },
  {
    pattern: /^\/api\/industries\/([^/]+)$/,
    method: "GET",
    handle: async (m) => getDocOrBySlug("industries", m[1]),
  },
  {
    pattern: /^\/api\/admin\/industries$/,
    method: "POST",
    handle: async (_m, body) => createDoc("industries", body),
  },
  {
    pattern: /^\/api\/admin\/industries\/(.+)$/,
    method: "PATCH",
    handle: async (m, body) => updateById("industries", m[1], body),
  },
  {
    pattern: /^\/api\/admin\/industries\/(.+)$/,
    method: "DELETE",
    handle: async (m) => deleteById("industries", m[1]),
  },

  // ── Standards ───────────────────────────────────────────────────────────
  {
    pattern: /^\/api\/standards$/,
    method: "GET",
    handle: async () => listCollection("standards", { orderField: "sortOrder" }),
  },
  {
    pattern: /^\/api\/standards\/([^/]+)$/,
    method: "GET",
    handle: async (m) => getDocOrBySlug("standards", m[1]),
  },
  {
    pattern: /^\/api\/admin\/standards$/,
    method: "POST",
    handle: async (_m, body) => createDoc("standards", body),
  },
  {
    pattern: /^\/api\/admin\/standards\/(.+)$/,
    method: "PATCH",
    handle: async (m, body) => updateById("standards", m[1], body),
  },
  {
    pattern: /^\/api\/admin\/standards\/(.+)$/,
    method: "DELETE",
    handle: async (m) => deleteById("standards", m[1]),
  },

  // ── Media (gallery, hero, banner, product) ──────────────────────────────
  {
    pattern: /^\/api\/media$/,
    method: "GET",
    handle: async () => listCollection("media", { orderField: "sortOrder" }),
  },
  {
    pattern: /^\/api\/admin\/media$/,
    method: "POST",
    handle: async (_m, body) => createDoc("media", body),
  },
  {
    pattern: /^\/api\/admin\/media\/(.+)$/,
    method: "PATCH",
    handle: async (m, body) => updateById("media", m[1], body),
  },
  {
    pattern: /^\/api\/admin\/media\/(.+)$/,
    method: "DELETE",
    handle: async (m) => deleteById("media", m[1]),
  },

  // ── Contacts (public submission, admin read/delete) ─────────────────────
  {
    pattern: /^\/api\/contact$/,
    method: "POST",
    handle: async (_m, body) => {
      const payload = {
        fullName: String(body?.fullName ?? "").trim(),
        email: String(body?.email ?? "").trim(),
        phone: String(body?.phone ?? "").trim(),
        companyName: String(body?.companyName ?? "").trim(),
        message: String(body?.message ?? "").trim(),
        createdAt: serverTimestamp(),
      };
      const ref = await addDoc(collection(db, "contacts"), payload);
      return { ok: true, id: ref.id };
    },
  },
  {
    pattern: /^\/api\/admin\/contacts$/,
    method: "GET",
    handle: async () => listCollection("contacts", { orderField: "createdAt" }),
  },
  {
    pattern: /^\/api\/admin\/contacts\/(.+)$/,
    method: "DELETE",
    handle: async (m) => deleteById("contacts", m[1]),
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Public entry point
// ─────────────────────────────────────────────────────────────────────────────

export class AdapterError extends Error {
  constructor(public status: number, msg: string) {
    super(msg);
  }
}

/** Returns the response payload, or `null` if no Firestore route matches. */
export async function tryFirestoreFetch(path: string, opts: RequestInit = {}): Promise<any | null> {
  const method = (opts.method || "GET").toUpperCase() as Method;
  const stripped = path.split("?")[0];
  for (const route of ROUTES) {
    if (route.method !== method) continue;
    const m = stripped.match(route.pattern);
    if (!m) continue;
    let body: any;
    if (opts.body && typeof opts.body === "string") {
      try {
        body = JSON.parse(opts.body);
      } catch {
        body = undefined;
      }
    }
    try {
      return await route.handle(m, body);
    } catch (e: any) {
      if (e instanceof HttpError) throw new AdapterError(e.status, e.message);
      throw new AdapterError(500, e?.message || "Firestore request failed");
    }
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// window.fetch interceptor — catches raw fetch() calls in the codebase
// (Footer contact form, useSiteContent hook, CustomSections, etc.)
// ─────────────────────────────────────────────────────────────────────────────

let installed = false;
export function installFetchInterceptor() {
  if (installed || typeof window === "undefined") return;
  installed = true;
  const originalFetch = window.fetch.bind(window);
  // Expose the un-intercepted fetch so admin tools (e.g. migration) can
  // bypass the adapter and pull live data from the Node backend.
  (window as any).__realFetch__ = originalFetch;

  window.fetch = (async (input: any, init?: RequestInit) => {
    try {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.pathname + input.search
            : (input as Request).url;

      // Only intercept same-origin /api/* paths
      const path = url.startsWith("http")
        ? new URL(url).pathname + new URL(url).search
        : url;

      if (path.startsWith("/api/")) {
        const opts: RequestInit = {
          ...(init || {}),
          method: init?.method || (input instanceof Request ? input.method : "GET"),
        };
        // If body wasn't provided in init but Request has one, extract it
        if (!opts.body && input instanceof Request && input.method !== "GET" && input.method !== "HEAD") {
          opts.body = await input.clone().text();
        }
        const fsResult = await tryFirestoreFetch(path, opts);
        if (fsResult !== null) {
          return new Response(JSON.stringify(fsResult), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }
      }
    } catch (e: any) {
      if (e instanceof AdapterError) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: e.status,
          headers: { "Content-Type": "application/json" },
        });
      }
      // Fall through to original fetch on unexpected errors
    }
    return originalFetch(input, init);
  }) as typeof fetch;
}

// ─────────────────────────────────────────────────────────────────────────────
// Migration helper used by AdminMigrate page
// Bulk-imports an array of records into a Firestore collection, preserving
// the original numeric `id` as the document id (as a string).
// ─────────────────────────────────────────────────────────────────────────────

export async function importBatchToCollection(
  name: string,
  items: any[],
  opts: { idField?: string } = {},
): Promise<number> {
  let count = 0;
  for (const raw of items) {
    const it = { ...raw };
    let docId: string | null = null;
    if (opts.idField && it[opts.idField] != null) docId = String(it[opts.idField]);
    else if (it.id != null) docId = String(it.id);

    const ref = docId ? doc(db, name, docId) : doc(collection(db, name));
    delete it.id;
    // Convert Date strings back where possible? Leave as-is — Firestore handles strings.
    await setDoc(ref, it, { merge: true });
    count++;
  }
  return count;
}
