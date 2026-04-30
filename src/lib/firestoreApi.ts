/**
 * Firestore Adapter
 * -----------------
 * Routes every legacy `/api/*` call to a Firestore collection. The frontend
 * keeps using `api("/api/products")`, `api("/api/admin/products", { method: "POST" })`,
 * etc. — but instead of hitting a Node backend, this adapter performs the
 * equivalent Firestore operation client-side.
 *
 * This means the frontend can be deployed as static files (cPanel) and only
 * needs Firestore + Firebase Auth.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query as fsQuery,
  where,
  orderBy,
  limit as fsLimit,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db, isAdminEmail, auth } from "./firebase";

export class AdapterError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function parsePath(path: string): { pathname: string; params: URLSearchParams } {
  const u = new URL(path, "http://x");
  return { pathname: u.pathname, params: u.searchParams };
}

function readBody(opts: RequestInit): any {
  if (!opts.body) return {};
  if (typeof opts.body === "string") {
    try { return JSON.parse(opts.body); } catch { return {}; }
  }
  return {};
}

function method(opts: RequestInit): string {
  return (opts.method || "GET").toUpperCase();
}

function requireAdmin() {
  const user = auth.currentUser;
  if (!user) throw new AdapterError("Not authenticated", 401);
  if (!isAdminEmail(user.email)) throw new AdapterError("Admin access required", 403);
}

function snapToDoc(snap: any) {
  return { id: snap.id, ...(snap.data() as any) };
}

async function listCollection(name: string, opts?: { orderField?: string }) {
  const ref = collection(db, name);
  const q = opts?.orderField
    ? fsQuery(ref, orderBy(opts.orderField, "asc"))
    : ref;
  const snap = await getDocs(q as any);
  return snap.docs.map(snapToDoc);
}

async function findBySlug(name: string, slug: string) {
  // Document IDs ARE the slugs for products/industries/standards (set during
  // migration), so a direct getDoc is the fast path. Fall back to a where()
  // query in case docs were created with auto IDs.
  try {
    const direct = await getDoc(doc(db, name, slug));
    if (direct.exists()) return snapToDoc(direct);
  } catch { /* fall through */ }
  const q = fsQuery(collection(db, name), where("slug", "==", slug), fsLimit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snapToDoc(snap.docs[0]);
}

async function createDoc(name: string, data: any, idField?: string) {
  const payload = { ...data };
  delete payload.id;
  if (idField && payload[idField]) {
    const id = String(payload[idField]);
    await setDoc(doc(db, name, id), payload, { merge: true });
    return { id, ...payload };
  }
  const ref = await addDoc(collection(db, name), payload);
  return { id: ref.id, ...payload };
}

async function patchDoc(name: string, id: string, data: any) {
  const payload = { ...data };
  delete payload.id;
  await updateDoc(doc(db, name, id), payload);
  const snap = await getDoc(doc(db, name, id));
  return snap.exists() ? snapToDoc(snap) : { id, ...payload };
}

async function removeDoc(name: string, id: string) {
  await deleteDoc(doc(db, name, id));
  return { ok: true };
}

// ─── Route table ─────────────────────────────────────────────────────────────
type Handler = (
  m: string,
  body: any,
  segs: string[],
  params: URLSearchParams,
) => Promise<any>;

const ROUTES: Array<{ test: RegExp; handle: Handler }> = [
  // Public catalog reads
  {
    test: /^\/api\/products\/?$/,
    handle: async (m) => {
      if (m === "GET") return listCollection("products", { orderField: "sortOrder" });
      throw new AdapterError("Method not allowed", 405);
    },
  },
  {
    test: /^\/api\/products\/([^/]+)\/?$/,
    handle: async (m, _b, segs) => {
      if (m === "GET") {
        const item = await findBySlug("products", segs[1]);
        if (!item) throw new AdapterError("Product not found", 404);
        return item;
      }
      throw new AdapterError("Method not allowed", 405);
    },
  },
  {
    test: /^\/api\/industries\/?$/,
    handle: async (m) => {
      if (m === "GET") return listCollection("industries", { orderField: "sortOrder" });
      throw new AdapterError("Method not allowed", 405);
    },
  },
  {
    test: /^\/api\/industries\/([^/]+)\/?$/,
    handle: async (m, _b, segs) => {
      if (m === "GET") {
        const item = await findBySlug("industries", segs[1]);
        if (!item) throw new AdapterError("Industry not found", 404);
        return item;
      }
      throw new AdapterError("Method not allowed", 405);
    },
  },
  {
    test: /^\/api\/standards\/?$/,
    handle: async (m) => {
      if (m === "GET") return listCollection("standards", { orderField: "sortOrder" });
      throw new AdapterError("Method not allowed", 405);
    },
  },
  {
    test: /^\/api\/standards\/([^/]+)\/?$/,
    handle: async (m, _b, segs) => {
      if (m === "GET") {
        const item = await findBySlug("standards", segs[1]);
        if (!item) throw new AdapterError("Standard not found", 404);
        return item;
      }
      throw new AdapterError("Method not allowed", 405);
    },
  },
  {
    test: /^\/api\/media\/?$/,
    handle: async (m) => {
      if (m === "GET") return listCollection("media", { orderField: "sortOrder" });
      throw new AdapterError("Method not allowed", 405);
    },
  },
  {
    test: /^\/api\/floating-images\/?$/,
    handle: async (m) => {
      if (m === "GET") {
        const all = await listCollection("floatingImages", { orderField: "sortOrder" });
        return all.filter((x: any) => x.enabled !== false);
      }
      throw new AdapterError("Method not allowed", 405);
    },
  },
  {
    test: /^\/api\/page-sections\/?$/,
    handle: async (m, _b, _s, params) => {
      if (m !== "GET") throw new AdapterError("Method not allowed", 405);
      const page = params.get("page") || "home";
      const ref = collection(db, "pageSections");
      const snap = await getDocs(ref);
      return snap.docs
        .map(snapToDoc)
        .filter((x: any) => (x.page || "home") === page && x.enabled !== false)
        .sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    },
  },
  {
    test: /^\/api\/site-content\/?$/,
    handle: async (m) => {
      if (m !== "GET") throw new AdapterError("Method not allowed", 405);
      const docs = await listCollection("siteContent");
      const map: Record<string, string> = {};
      docs.forEach((d: any) => {
        if (d.key) map[d.key] = d.value ?? "";
      });
      return map;
    },
  },
  {
    test: /^\/api\/contact\/?$/,
    handle: async (m, body) => {
      if (m !== "POST") throw new AdapterError("Method not allowed", 405);
      const required = ["fullName", "email", "phone", "message"];
      for (const k of required) {
        if (!body?.[k] || String(body[k]).trim() === "") {
          throw new AdapterError(`${k} is required`, 400);
        }
      }
      const payload = {
        fullName: String(body.fullName).trim(),
        email: String(body.email).trim(),
        phone: String(body.phone).trim(),
        companyName: String(body.companyName || "").trim(),
        message: String(body.message).trim(),
        createdAt: serverTimestamp(),
      };
      const ref = await addDoc(collection(db, "contacts"), payload);
      return { ok: true, id: ref.id };
    },
  },

  // ─── Admin: verify ────────────────────────────────────────────────────────
  {
    test: /^\/api\/admin\/verify\/?$/,
    handle: async (m) => {
      if (m !== "GET") throw new AdapterError("Method not allowed", 405);
      requireAdmin();
      return { ok: true };
    },
  },

  // ─── Admin CRUD: products ─────────────────────────────────────────────────
  {
    test: /^\/api\/admin\/products\/?$/,
    handle: async (m, body) => {
      requireAdmin();
      if (m === "POST") return createDoc("products", body, "slug");
      throw new AdapterError("Method not allowed", 405);
    },
  },
  {
    test: /^\/api\/admin\/products\/([^/]+)\/?$/,
    handle: async (m, body, segs) => {
      requireAdmin();
      const id = segs[1];
      if (m === "PATCH") return patchDoc("products", id, body);
      if (m === "DELETE") return removeDoc("products", id);
      throw new AdapterError("Method not allowed", 405);
    },
  },

  // ─── Admin CRUD: industries ───────────────────────────────────────────────
  {
    test: /^\/api\/admin\/industries\/?$/,
    handle: async (m, body) => {
      requireAdmin();
      if (m === "POST") return createDoc("industries", body, "slug");
      throw new AdapterError("Method not allowed", 405);
    },
  },
  {
    test: /^\/api\/admin\/industries\/([^/]+)\/?$/,
    handle: async (m, body, segs) => {
      requireAdmin();
      const id = segs[1];
      if (m === "PATCH") return patchDoc("industries", id, body);
      if (m === "DELETE") return removeDoc("industries", id);
      throw new AdapterError("Method not allowed", 405);
    },
  },

  // ─── Admin CRUD: standards ────────────────────────────────────────────────
  {
    test: /^\/api\/admin\/standards\/?$/,
    handle: async (m, body) => {
      requireAdmin();
      if (m === "POST") return createDoc("standards", body, "slug");
      throw new AdapterError("Method not allowed", 405);
    },
  },
  {
    test: /^\/api\/admin\/standards\/([^/]+)\/?$/,
    handle: async (m, body, segs) => {
      requireAdmin();
      const id = segs[1];
      if (m === "PATCH") return patchDoc("standards", id, body);
      if (m === "DELETE") return removeDoc("standards", id);
      throw new AdapterError("Method not allowed", 405);
    },
  },

  // ─── Admin CRUD: media ────────────────────────────────────────────────────
  {
    test: /^\/api\/admin\/media\/?$/,
    handle: async (m, body) => {
      requireAdmin();
      if (m === "POST") return createDoc("media", body);
      throw new AdapterError("Method not allowed", 405);
    },
  },
  {
    test: /^\/api\/admin\/media\/([^/]+)\/?$/,
    handle: async (m, body, segs) => {
      requireAdmin();
      const id = segs[1];
      if (m === "PATCH") return patchDoc("media", id, body);
      if (m === "DELETE") return removeDoc("media", id);
      throw new AdapterError("Method not allowed", 405);
    },
  },

  // ─── Admin CRUD: page-sections ────────────────────────────────────────────
  {
    test: /^\/api\/admin\/page-sections\/?$/,
    handle: async (m, body) => {
      requireAdmin();
      if (m === "POST") return createDoc("pageSections", body);
      throw new AdapterError("Method not allowed", 405);
    },
  },
  {
    test: /^\/api\/admin\/page-sections\/([^/]+)\/?$/,
    handle: async (m, body, segs) => {
      requireAdmin();
      const id = segs[1];
      if (m === "PATCH") return patchDoc("pageSections", id, body);
      if (m === "DELETE") return removeDoc("pageSections", id);
      throw new AdapterError("Method not allowed", 405);
    },
  },

  // ─── Admin CRUD: floating-images ──────────────────────────────────────────
  {
    test: /^\/api\/admin\/floating-images\/?$/,
    handle: async (m, body) => {
      requireAdmin();
      if (m === "GET") return listCollection("floatingImages", { orderField: "sortOrder" });
      if (m === "POST") return createDoc("floatingImages", body);
      throw new AdapterError("Method not allowed", 405);
    },
  },
  {
    test: /^\/api\/admin\/floating-images\/([^/]+)\/?$/,
    handle: async (m, body, segs) => {
      requireAdmin();
      const id = segs[1];
      if (m === "PATCH") return patchDoc("floatingImages", id, body);
      if (m === "DELETE") return removeDoc("floatingImages", id);
      throw new AdapterError("Method not allowed", 405);
    },
  },

  // ─── Admin CRUD: contacts ─────────────────────────────────────────────────
  {
    test: /^\/api\/admin\/contacts\/?$/,
    handle: async (m) => {
      requireAdmin();
      if (m === "GET") return listCollection("contacts");
      throw new AdapterError("Method not allowed", 405);
    },
  },
  {
    test: /^\/api\/admin\/contacts\/([^/]+)\/?$/,
    handle: async (m, _b, segs) => {
      requireAdmin();
      if (m === "DELETE") return removeDoc("contacts", segs[1]);
      throw new AdapterError("Method not allowed", 405);
    },
  },

  // ─── Admin CRUD: customers (ledger) ───────────────────────────────────────
  {
    test: /^\/api\/admin\/customers\/?$/,
    handle: async (m, body) => {
      requireAdmin();
      if (m === "GET") return listCollection("customers");
      if (m === "POST") return createDoc("customers", body);
      throw new AdapterError("Method not allowed", 405);
    },
  },
  {
    test: /^\/api\/admin\/customers\/([^/]+)\/?$/,
    handle: async (m, body, segs) => {
      requireAdmin();
      const id = segs[1];
      if (m === "GET") {
        const snap = await getDoc(doc(db, "customers", id));
        if (!snap.exists()) throw new AdapterError("Customer not found", 404);
        return snapToDoc(snap);
      }
      if (m === "PATCH") return patchDoc("customers", id, body);
      if (m === "DELETE") return removeDoc("customers", id);
      throw new AdapterError("Method not allowed", 405);
    },
  },

  // ─── Admin CRUD: ledger entries ───────────────────────────────────────────
  {
    test: /^\/api\/admin\/ledger\/?$/,
    handle: async (m, body, _s, params) => {
      requireAdmin();
      if (m === "GET") {
        const customerId = params.get("customerId");
        const all = await listCollection("ledgerEntries");
        if (customerId) {
          return all.filter((x: any) => String(x.customerId) === String(customerId));
        }
        return all;
      }
      if (m === "POST") return createDoc("ledgerEntries", body);
      throw new AdapterError("Method not allowed", 405);
    },
  },
  {
    test: /^\/api\/admin\/ledger\/([^/]+)\/?$/,
    handle: async (m, body, segs) => {
      requireAdmin();
      const id = segs[1];
      if (m === "PATCH") return patchDoc("ledgerEntries", id, body);
      if (m === "DELETE") return removeDoc("ledgerEntries", id);
      throw new AdapterError("Method not allowed", 405);
    },
  },

  // ─── Admin: site-content (key/value) ──────────────────────────────────────
  {
    test: /^\/api\/admin\/site-content\/?$/,
    handle: async (m, body) => {
      requireAdmin();
      if (m !== "POST") throw new AdapterError("Method not allowed", 405);
      const key = String(body?.key || "").trim();
      if (!key) throw new AdapterError("Missing key", 400);
      const value = String(body?.value ?? "");
      await setDoc(doc(db, "siteContent", key), { key, value }, { merge: true });
      return { key, value };
    },
  },

  // ─── Admin: upload (cPanel manual) ────────────────────────────────────────
  {
    test: /^\/api\/admin\/upload\/?$/,
    handle: async () => {
      throw new AdapterError(
        "Image upload disabled. Upload your file to the cPanel /uploads/ folder via File Manager and paste the URL (e.g. /uploads/myimage.jpg).",
        501,
      );
    },
  },

  // ─── Removed features (PDF, MI service, backups, google login) ────────────
  {
    test: /^\/api\/(catalog\.pdf|admin\/catalog-pdf|admin\/mi\/.*|admin\/google-login|auth\/google)\/?$/,
    handle: async () => {
      throw new AdapterError("This feature is disabled in the static (Firestore) build.", 501);
    },
  },
];

// ─── Public dispatcher ───────────────────────────────────────────────────────
export async function tryFirestoreFetch(
  path: string,
  opts: RequestInit = {},
): Promise<any | null> {
  if (typeof path !== "string" || !path.startsWith("/api/")) return null;
  const { pathname, params } = parsePath(path);
  for (const route of ROUTES) {
    const m = pathname.match(route.test);
    if (m) {
      const body = readBody(opts);
      return await route.handle(method(opts), body, m as any, params);
    }
  }
  return null;
}

// ─── Fetch interceptor (so legacy `fetch("/api/…")` calls also work) ─────────
export function installFetchInterceptor() {
  if (typeof window === "undefined") return;
  if ((window as any).__realFetch__) return;
  const realFetch = window.fetch.bind(window);
  (window as any).__realFetch__ = realFetch;

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
        ? input.toString()
        : (input as Request).url;

    if (typeof url === "string" && url.startsWith("/api/")) {
      try {
        const data = await tryFirestoreFetch(url, init || {});
        if (data !== null) {
          return new Response(JSON.stringify(data), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }
      } catch (e: any) {
        const status = e instanceof AdapterError ? e.status : 500;
        return new Response(
          JSON.stringify({ error: e?.message || "Request failed" }),
          { status, headers: { "Content-Type": "application/json" } },
        );
      }
    }
    return realFetch(input as any, init);
  };
}

// ─── Migration helper: bulk-import an array into a collection ────────────────
export async function importBatchToCollection(
  name: string,
  items: any[],
  opts: { idField?: string } = {},
): Promise<number> {
  if (!Array.isArray(items) || items.length === 0) return 0;
  const idField = opts.idField;
  // Firestore writeBatch supports up to 500 ops at a time.
  const CHUNK = 400;
  let total = 0;
  for (let i = 0; i < items.length; i += CHUNK) {
    const slice = items.slice(i, i + CHUNK);
    const batch = writeBatch(db);
    for (const raw of slice) {
      const data = { ...raw };
      delete data.id;
      let ref;
      if (idField && raw[idField]) {
        ref = doc(db, name, String(raw[idField]));
      } else if (raw.id) {
        ref = doc(db, name, String(raw.id));
      } else {
        ref = doc(collection(db, name));
      }
      batch.set(ref, data, { merge: true });
    }
    await batch.commit();
    total += slice.length;
  }
  return total;
}
