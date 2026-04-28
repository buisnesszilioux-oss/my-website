import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import multer from "multer";
import { storage } from "./storage";
import { hashPassword, verifyPassword, signToken, requireAuth, requireUser } from "./auth";
import { insertContactSchema, insertProductSchema, insertIndustrySchema, insertStandardSchema, insertMediaSchema, insertSiteContentSchema, insertPageSectionSchema, insertUserSchema, loginUserSchema } from "../shared/schema";
import { z } from "zod";
import { generateCatalogPdf } from "./catalog-pdf";
import { sendContactEmail } from "./mailer";
import { handleChat, createBackup, createFullBackup, listBackups, restoreBackup, deleteBackup, saveUploadedBackup, healthCheck, ensureFirstRunBackup, startBackupScheduler } from "./mi-service";
import { runDataFixes } from "./data-fix";

const app = express();
app.use(cors());
app.use(express.json({ limit: "20mb" }));

// On Vercel serverless the real filesystem is read-only; use /tmp instead.
const UPLOAD_DIR = process.env.VERCEL ? "/tmp/uploads" : path.resolve("uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
app.use("/uploads", express.static(UPLOAD_DIR));

const storageMulter = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-z0-9.\-]/gi, "_");
    cb(null, `${Date.now()}-${safe}`);
  },
});
const upload = multer({ storage: storageMulter, limits: { fileSize: 10 * 1024 * 1024 } });

// ── Utility: wrap any async route handler with standardised error handling ─────
// This ensures every DB failure returns clean JSON (not a crash) on Vercel.
type AsyncHandler = (req: any, res: any, next: any) => Promise<any>;
function wrap(fn: AsyncHandler): AsyncHandler {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (e: any) {
      const cause = e?.cause ?? e?.original ?? null;
      console.error("[route] Error:", e?.message ?? e);
      if (cause) console.error("[route] Cause:", cause?.code, cause?.detail, cause?.message);
      if (e?.stack) console.error(e.stack);
      if (res.headersSent) return;
      let msg = e?.message || "Internal server error";
      if (cause?.message) msg = `${msg} — ${cause.message}`;
      if (e?.message?.includes("ECONNREFUSED") || e?.message?.includes("timeout") || e?.message?.includes("connect")) {
        msg = "Database unreachable. Set DATABASE_URL in Vercel environment variables to a public PostgreSQL server (Neon/Supabase).";
      }
      res.status(500).json({ error: msg });
    }
  };
}

// ── Auth ───────────────────────────────────────────────────────────────────────
// This route NEVER throws a 500. Every branch returns clean JSON.
// Three working sign-in paths:
//   1. DB has admin row + bcrypt password matches → success
//   2. DB has admin row + plain password matches  → success (legacy/seed safety)
//   3. DB unavailable / no row → fall back to ADMIN_PASSWORD env var
app.post("/api/admin/login", async (req, res) => {
  const safeJson = (status: number, body: any) => {
    try { return res.status(status).json(body); }
    catch { return res.status(status).end(JSON.stringify(body)); }
  };
  try {
    const body = req.body ?? {};
    const submitted = String(body.username || "").trim().toLowerCase();
    const password  = String(body.password  || "");

    if (!submitted || !password) {
      return safeJson(400, { error: "Email and password are required" });
    }

    const allowedEmails = (process.env.ADMIN_USERNAME || "miengineering@gmail.com,miengineering17@gmail.com")
      .split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);

    if (!allowedEmails.includes(submitted)) {
      return safeJson(401, { error: "Only the registered admin email can sign in." });
    }

    const envPass = process.env.ADMIN_PASSWORD || "6392061892";

    // Try DB with an explicit timeout so we never hang.
    let dbUser: { id: number; username: string; passwordHash: string } | null = null;
    let dbAvailable = false;
    try {
      const u = await Promise.race([
        storage.getAdminByUsername(submitted),
        new Promise<null>((_, rej) => setTimeout(() => rej(new Error("DB_TIMEOUT")), 6000)),
      ]) as any;
      dbUser = u ?? null;
      dbAvailable = true;
    } catch (dbErr: any) {
      console.warn("[login] DB unavailable:", dbErr?.message, "— using env var fallback");
    }

    let userId = 0;

    if (dbAvailable && dbUser) {
      userId = dbUser.id;
      // Try bcrypt match first; if hash is malformed or doesn't match, also accept ADMIN_PASSWORD env var.
      let ok = false;
      try {
        if (dbUser.passwordHash && dbUser.passwordHash.startsWith("$2")) {
          ok = await verifyPassword(password, dbUser.passwordHash);
        }
      } catch (bcryptErr: any) {
        console.warn("[login] bcrypt error:", bcryptErr?.message);
      }
      if (!ok && password === envPass) ok = true;        // env-var safety net
      if (!ok && password === dbUser.passwordHash) ok = true; // plain-text legacy seed
      if (!ok) return safeJson(401, { error: "Invalid password" });
    } else {
      // DB row missing OR DB unreachable → compare against env var only.
      if (password !== envPass) return safeJson(401, { error: "Invalid password" });
      console.log("[login] ENV VAR FALLBACK: authenticated via ADMIN_PASSWORD");
    }

    return safeJson(200, { token: signToken({ id: userId, username: submitted }) });
  } catch (e: any) {
    console.error("[login] Unexpected error:", e?.message, e?.stack);
    // As a last resort, still try the env-var path so the admin is never locked out.
    try {
      const submitted = String(req.body?.username || "").trim().toLowerCase();
      const password  = String(req.body?.password  || "");
      const envPass = process.env.ADMIN_PASSWORD || "6392061892";
      const allowed = (process.env.ADMIN_USERNAME || "miengineering@gmail.com,miengineering17@gmail.com")
        .split(",").map((s) => s.trim().toLowerCase());
      if (allowed.includes(submitted) && password === envPass) {
        return safeJson(200, { token: signToken({ id: 0, username: submitted }) });
      }
    } catch {}
    return safeJson(500, { error: "Server error during login. Check DATABASE_URL and ADMIN_PASSWORD env vars." });
  }
});

// Verify a token is still valid (used by RequireAdmin to harden client-side guard)
app.get("/api/admin/verify", requireAuth, (_req, res) => res.json({ ok: true }));

// Public health endpoint — helps debug a fresh cPanel deploy.
// Hit https://yourdomain.com/api/health from a browser to see what's wrong.
app.get("/api/health", async (_req, res) => {
  const out: any = {
    ok: true,
    node: process.version,
    env: process.env.NODE_ENV || "development",
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    hasJwtSecret: Boolean(process.env.JWT_SECRET),
    hasAdminPassword: Boolean(process.env.ADMIN_PASSWORD),
    adminEmails: (process.env.ADMIN_USERNAME || "miengineering@gmail.com,miengineering17@gmail.com").split(","),
    databaseHost: null as string | null,
    databaseConnected: false,
    productCount: null as number | null,
    error: null as string | null,
  };
  try {
    if (process.env.DATABASE_URL) {
      try { out.databaseHost = new URL(process.env.DATABASE_URL).hostname; } catch {}
    }
    const products = await Promise.race([
      storage.listProducts(),
      new Promise<never>((_, rej) => setTimeout(() => rej(new Error("DB_TIMEOUT_5s")), 5000)),
    ]) as any[];
    out.databaseConnected = true;
    out.productCount = products.length;
  } catch (e: any) {
    out.ok = false;
    out.error = e?.message || String(e);
  }
  res.json(out);
});

// Google Identity Services — verify Google ID token, then issue our own JWT
app.post("/api/admin/google-login", async (req, res) => {
  try {
    const credential = String(req.body?.credential || "").trim();
    if (!credential) return res.status(400).json({ error: "Missing Google credential" });

    const expectedAud = process.env.GOOGLE_CLIENT_ID || "";
    if (!expectedAud) {
      return res.status(500).json({ error: "Google login not configured. Set GOOGLE_CLIENT_ID env var." });
    }

    // Verify the ID token via Google's tokeninfo endpoint (no extra dependency required).
    const verifyUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`;
    const r = await fetch(verifyUrl);
    if (!r.ok) return res.status(401).json({ error: "Invalid Google token" });
    const payload: any = await r.json();

    // aud must match our client id; iss must be google
    const audOk = String(payload.aud || "") === expectedAud;
    const issOk = ["accounts.google.com", "https://accounts.google.com"].includes(String(payload.iss || ""));
    const expOk = Number(payload.exp || 0) * 1000 > Date.now();
    if (!audOk || !issOk || !expOk) {
      return res.status(401).json({ error: "Invalid Google token" });
    }
    if (!payload.email_verified || payload.email_verified === "false") {
      return res.status(401).json({ error: "Google email is not verified" });
    }

    const email = String(payload.email || "").trim().toLowerCase();
    const allowedEmails = (process.env.ADMIN_USERNAME || "miengineering@gmail.com,miengineering17@gmail.com")
      .split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
    if (!allowedEmails.includes(email)) {
      return res.status(403).json({ error: "This Google account is not authorised for admin access." });
    }

    // Best-effort: ensure DB admin record exists (matches password-login flow)
    let adminId = 0;
    try {
      const existing = await storage.getAdminByUsername(email);
      if (existing) adminId = existing.id;
    } catch (e) { console.warn("[google-login] DB lookup failed:", (e as any)?.message); }

    res.json({ token: signToken({ id: adminId, username: email, via: "google" }) });
  } catch (e: any) {
    console.error("[google-login] Error:", e?.message ?? e);
    res.status(500).json({ error: "Google sign-in failed" });
  }
});

// ── User accounts (normal customers) ──────────────────────────────────────────
const sanitiseUser = (u: any) => ({
  id: u.id, email: u.email, name: u.name, phone: u.phone,
  company: u.company, picture: u.picture, provider: u.provider,
  createdAt: u.createdAt,
});

app.post("/api/auth/register", wrap(async (req, res) => {
  const parsed = insertUserSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid data" });
  }
  const data = parsed.data;
  const existing = await storage.getUserByEmail(data.email);
  if (existing) return res.status(409).json({ error: "An account with this email already exists" });
  const passwordHash = await hashPassword(data.password);
  const user = await storage.createUser({
    email: data.email,
    name: data.name,
    phone: data.phone || "",
    company: data.company || "",
    passwordHash,
    provider: "password",
  });
  const token = signToken({ id: user.id, email: user.email, kind: "user" });
  res.json({ token, user: sanitiseUser(user) });
}));

app.post("/api/auth/login", wrap(async (req, res) => {
  const parsed = loginUserSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid data" });
  }
  const { email, password } = parsed.data;
  const user = await storage.getUserByEmail(email);
  if (!user || !user.passwordHash) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid email or password" });
  const token = signToken({ id: user.id, email: user.email, kind: "user" });
  res.json({ token, user: sanitiseUser(user) });
}));

// Google sign-in for normal users — auto-creates an account on first login
app.post("/api/auth/google", wrap(async (req, res) => {
  const credential = String(req.body?.credential || "").trim();
  if (!credential) return res.status(400).json({ error: "Missing Google credential" });
  const expectedAud = process.env.GOOGLE_CLIENT_ID || "";
  if (!expectedAud) return res.status(500).json({ error: "Google login not configured." });

  const verifyUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`;
  const r = await fetch(verifyUrl);
  if (!r.ok) return res.status(401).json({ error: "Invalid Google token" });
  const payload: any = await r.json();
  if (String(payload.aud || "") !== expectedAud) return res.status(401).json({ error: "Invalid Google token" });
  if (!["accounts.google.com", "https://accounts.google.com"].includes(String(payload.iss || ""))) {
    return res.status(401).json({ error: "Invalid Google token" });
  }
  if (Number(payload.exp || 0) * 1000 <= Date.now()) return res.status(401).json({ error: "Google token expired" });
  if (!payload.email_verified || payload.email_verified === "false") {
    return res.status(401).json({ error: "Google email not verified" });
  }
  const email = String(payload.email || "").trim().toLowerCase();
  if (!email) return res.status(400).json({ error: "Google account has no email" });

  let user = await storage.getUserByEmail(email);
  if (!user) {
    user = await storage.createUser({
      email,
      name: String(payload.name || email.split("@")[0]),
      picture: String(payload.picture || ""),
      provider: "google",
    });
  }
  const token = signToken({ id: user.id, email: user.email, kind: "user" });
  res.json({ token, user: sanitiseUser(user) });
}));

app.get("/api/auth/me", requireUser, wrap(async (req, res) => {
  const id = (req as any).user?.id;
  const user = id ? await storage.getUserById(id) : null;
  if (!user) return res.status(401).json({ error: "Account not found" });
  res.json({ user: sanitiseUser(user) });
}));

app.patch("/api/auth/me", requireUser, wrap(async (req, res) => {
  const id = (req as any).user?.id;
  if (!id) return res.status(401).json({ error: "Unauthorized" });
  const schema = z.object({
    name: z.string().min(2).optional(),
    phone: z.string().optional(),
    company: z.string().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid data" });
  const updated = await storage.updateUser(id, parsed.data);
  res.json({ user: sanitiseUser(updated) });
}));

// Public reads
app.get("/api/products",       wrap(async (_req, res) => res.json(await storage.listProducts())));
app.get("/api/products/:slug", wrap(async (req, res) => {
  const p = await storage.getProduct(req.params.slug);
  if (!p) return res.status(404).json({ error: "Not found" });
  res.json(p);
}));
app.get("/api/industries",        wrap(async (_req, res) => res.json(await storage.listIndustries())));
app.get("/api/industries/:slug",  wrap(async (req, res) => {
  const i = await storage.getIndustry(req.params.slug);
  if (!i) return res.status(404).json({ error: "Not found" });
  res.json(i);
}));
app.get("/api/standards",       wrap(async (_req, res) => res.json(await storage.listStandards())));
app.get("/api/standards/:slug", wrap(async (req, res) => {
  const s = await storage.getStandard(req.params.slug);
  if (!s) return res.status(404).json({ error: "Not found" });
  res.json(s);
}));

// Contact submission (public)
app.post("/api/contact", wrap(async (req, res) => {
  const parsed = insertContactSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid", details: parsed.error.flatten() });
  const submission = await storage.createContact(parsed.data);
  sendContactEmail(parsed.data as any).catch((e) => console.error("[mailer] error:", e));
  res.json({ ok: true, id: submission.id });
}));

// Admin: upload
app.post("/api/admin/upload", requireAuth, upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file" });
  res.json({ url: `/uploads/${req.file.filename}` });
});

// Admin: products CRUD
app.post("/api/admin/products",      requireAuth, wrap(async (req, res) => {
  const parsed = insertProductSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  res.json(await storage.upsertProduct(parsed.data));
}));
app.patch("/api/admin/products/:id", requireAuth, wrap(async (req, res) => {
  res.json(await storage.updateProduct(Number(req.params.id), req.body));
}));
app.delete("/api/admin/products/:id", requireAuth, wrap(async (req, res) => {
  await storage.deleteProduct(Number(req.params.id));
  res.json({ ok: true });
}));

// Admin: industries CRUD
app.post("/api/admin/industries",      requireAuth, wrap(async (req, res) => {
  const parsed = insertIndustrySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  res.json(await storage.upsertIndustry(parsed.data));
}));
app.patch("/api/admin/industries/:id", requireAuth, wrap(async (req, res) => {
  res.json(await storage.updateIndustry(Number(req.params.id), req.body));
}));
app.delete("/api/admin/industries/:id", requireAuth, wrap(async (req, res) => {
  await storage.deleteIndustry(Number(req.params.id));
  res.json({ ok: true });
}));

// Admin: standards CRUD
app.post("/api/admin/standards",      requireAuth, wrap(async (req, res) => {
  const parsed = insertStandardSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  res.json(await storage.upsertStandard(parsed.data));
}));
app.patch("/api/admin/standards/:id", requireAuth, wrap(async (req, res) => {
  res.json(await storage.updateStandard(Number(req.params.id), req.body));
}));
app.delete("/api/admin/standards/:id", requireAuth, wrap(async (req, res) => {
  await storage.deleteStandard(Number(req.params.id));
  res.json({ ok: true });
}));

// Public media (photos & videos)
app.get("/api/media", wrap(async (_req, res) => res.json(await storage.listMedia())));

// Admin: media CRUD
app.post("/api/admin/media",      requireAuth, wrap(async (req, res) => {
  const parsed = insertMediaSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  res.json(await storage.createMedia(parsed.data));
}));
app.patch("/api/admin/media/:id", requireAuth, wrap(async (req, res) => {
  res.json(await storage.updateMedia(Number(req.params.id), req.body));
}));
app.delete("/api/admin/media/:id", requireAuth, wrap(async (req, res) => {
  await storage.deleteMedia(Number(req.params.id));
  res.json({ ok: true });
}));

// Branded company catalog PDF — serves uploaded PDF if admin has set one,
// otherwise generates a default branded PDF on the fly.
app.get("/api/catalog.pdf", async (req, res) => {
  try {
    const map = await storage.getSiteContentMap();
    const customUrl = (map["catalog.pdfUrl"] || "").trim();
    if (customUrl && customUrl.startsWith("/uploads/")) {
      const fp = path.resolve(UPLOAD_DIR, path.basename(customUrl));
      if (fs.existsSync(fp)) {
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="MI-Engineering-Works-Catalog.pdf"`);
        res.setHeader("Cache-Control", "public, max-age=300");
        return fs.createReadStream(fp).pipe(res);
      }
    }
  } catch (e) { console.error("[catalog] custom pdf check failed:", e); }
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", 'attachment; filename="MI-Engineering-Works-Catalog.pdf"');
  res.setHeader("Cache-Control", "public, max-age=300");
  generateCatalogPdf(res);
});

// Admin: PDF catalog upload (.pdf only)
const pdfUpload = multer({
  storage: storageMulter,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf" || file.originalname.toLowerCase().endsWith(".pdf")) cb(null, true);
    else cb(new Error("Only PDF files are allowed"));
  },
});
app.post("/api/admin/catalog-pdf", requireAuth, (req, res) => {
  pdfUpload.single("file")(req, res, async (err: any) => {
    if (err) return res.status(400).json({ error: err.message || "Upload failed" });
    if (!req.file) return res.status(400).json({ error: "No file" });
    const url = `/uploads/${req.file.filename}`;
    await storage.upsertSiteContent({ key: "catalog.pdfUrl", value: url });
    res.json({ url });
  });
});
app.delete("/api/admin/catalog-pdf", requireAuth, async (_req, res) => {
  try {
    const map = await storage.getSiteContentMap();
    const customUrl = (map["catalog.pdfUrl"] || "").trim();
    if (customUrl && customUrl.startsWith("/uploads/")) {
      const fp = path.resolve(UPLOAD_DIR, path.basename(customUrl));
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
    }
  } catch (e) { console.error("[catalog] delete failed:", e); }
  await storage.upsertSiteContent({ key: "catalog.pdfUrl", value: "" });
  res.json({ ok: true });
});

// Customers (Ledger / Khata)
app.get("/api/admin/customers",     requireAuth, wrap(async (_req, res) => res.json(await storage.listCustomers())));
app.get("/api/admin/customers/:id", requireAuth, wrap(async (req, res) => {
  const c = await storage.getCustomer(Number(req.params.id));
  if (!c) return res.status(404).json({ error: "Not found" });
  res.json(c);
}));
app.post("/api/admin/customers",      requireAuth, wrap(async (req, res) => {
  const { insertCustomerSchema } = await import("../shared/schema");
  const parsed = insertCustomerSchema.parse(req.body || {});
  res.json(await storage.createCustomer(parsed));
}));
app.patch("/api/admin/customers/:id", requireAuth, wrap(async (req, res) => {
  res.json(await storage.updateCustomer(Number(req.params.id), req.body || {}));
}));
app.delete("/api/admin/customers/:id", requireAuth, wrap(async (req, res) => {
  await storage.deleteCustomer(Number(req.params.id));
  res.json({ ok: true });
}));

// Ledger / Khata entries
app.get("/api/admin/ledger", requireAuth, wrap(async (req, res) => {
  const customerId = req.query.customerId ? Number(req.query.customerId) : null;
  if (customerId) return res.json(await storage.listLedgerByCustomer(customerId));
  res.json(await storage.listLedger());
}));
app.post("/api/admin/ledger",      requireAuth, wrap(async (req, res) => {
  const { insertLedgerSchema } = await import("../shared/schema");
  const parsed = insertLedgerSchema.parse(req.body || {});
  const cust = await storage.getCustomer(parsed.customerId);
  if (!cust) return res.status(400).json({ error: "Customer not found" });
  res.json(await storage.createLedger({ ...parsed, customerName: cust.name }));
}));
app.patch("/api/admin/ledger/:id",  requireAuth, wrap(async (req, res) => {
  res.json(await storage.updateLedger(Number(req.params.id), req.body || {}));
}));
app.delete("/api/admin/ledger/:id", requireAuth, wrap(async (req, res) => {
  await storage.deleteLedger(Number(req.params.id));
  res.json({ ok: true });
}));

// Admin: contact submissions
app.get("/api/admin/contacts",     requireAuth, wrap(async (_req, res) => res.json(await storage.listContacts())));
app.delete("/api/admin/contacts/:id", requireAuth, wrap(async (req, res) => {
  await storage.deleteContact(Number(req.params.id));
  res.json({ ok: true });
}));

// Site content (public read, admin write)
app.get("/api/site-content", wrap(async (_req, res) => res.json(await storage.getSiteContentMap())));
app.post("/api/admin/site-content", requireAuth, wrap(async (req, res) => {
  const payload = Array.isArray(req.body) ? req.body : (req.body && (req.body as any).entries) || [];
  const arr = z.array(insertSiteContentSchema).safeParse(payload);
  if (!arr.success) return res.status(400).json({ error: arr.error.flatten() });
  res.json(await storage.bulkUpsertSiteContent(arr.data));
}));

// Page sections (public read by page, admin CRUD)
app.get("/api/page-sections", wrap(async (req, res) => {
  const page = String(req.query.page || "home");
  res.json(await storage.listPageSections(page));
}));
app.post("/api/admin/page-sections",      requireAuth, wrap(async (req, res) => {
  const parsed = insertPageSectionSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  res.json(await storage.createPageSection(parsed.data));
}));
app.patch("/api/admin/page-sections/:id",  requireAuth, wrap(async (req, res) => {
  res.json(await storage.updatePageSection(Number(req.params.id), req.body));
}));
app.delete("/api/admin/page-sections/:id", requireAuth, wrap(async (req, res) => {
  await storage.deletePageSection(Number(req.params.id));
  res.json({ ok: true });
}));

// Floating images (public read enabled, admin write)
app.get("/api/floating-images", wrap(async (_req, res) => res.json(await storage.listEnabledFloatingImages())));
app.get("/api/admin/floating-images", requireAuth, wrap(async (_req, res) => res.json(await storage.listFloatingImages())));
app.post("/api/admin/floating-images", requireAuth, wrap(async (req, res) => {
  const { insertFloatingImageSchema } = await import("../shared/schema");
  const parsed = insertFloatingImageSchema.safeParse(req.body || {});
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  res.json(await storage.createFloatingImage(parsed.data));
}));
app.patch("/api/admin/floating-images/:id", requireAuth, wrap(async (req, res) => {
  res.json(await storage.updateFloatingImage(Number(req.params.id), req.body || {}));
}));
app.delete("/api/admin/floating-images/:id", requireAuth, wrap(async (req, res) => {
  await storage.deleteFloatingImage(Number(req.params.id));
  res.json({ ok: true });
}));

// Bootstrap default admin (email + password)
async function ensureDefaultAdmin() {
  const password = process.env.ADMIN_PASSWORD || "6392061892";
  const allowedEmails = (process.env.ADMIN_USERNAME || "miengineering@gmail.com,miengineering17@gmail.com")
    .split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  const hash = await hashPassword(password);
  for (const email of allowedEmails) {
    const existing = await storage.getAdminByUsername(email);
    if (!existing) {
      await storage.createAdmin(email, hash);
      console.log(`[admin] Created admin user "${email}"`);
    } else {
      // Reset password to env default each boot so credentials stay in sync
      await storage.updateAdminPassword(existing.id, hash);
    }
  }
}

// ───────────── MI Chat (admin self-service: backup, restore, health check) ─────────────

app.post("/api/admin/mi/chat", requireAuth, async (req, res) => {
  try {
    const { message, restoreFile, restoreMode } = req.body || {};
    const r = await handleChat(String(message || ""), { restoreFile, restoreMode });
    res.json(r);
  } catch (e: any) {
    console.error("[mi/chat]", e);
    res.status(500).json({ kind: "error", reply: `❌ ${e.message || "Internal error"}` });
  }
});

app.post("/api/admin/mi/backup", requireAuth, async (req, res) => {
  try {
    const r = await createBackup(String(req.body?.label || "manual"));
    res.json(r);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Full website backup (DB + uploaded files)
app.post("/api/admin/mi/backup/full", requireAuth, async (req, res) => {
  try {
    const r = await createFullBackup(String(req.body?.label || "manual"));
    res.json(r);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.get("/api/admin/mi/backups", requireAuth, (_req, res) => {
  res.json(listBackups());
});

app.post("/api/admin/mi/restore", requireAuth, async (req, res) => {
  try {
    const { file, mode } = req.body || {};
    if (!file) return res.status(400).json({ error: "file is required" });
    const r = await restoreBackup(String(file), mode === "merge" ? "merge" : "replace");
    res.json(r);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.delete("/api/admin/mi/backups/:file", requireAuth, (req, res) => {
  try {
    const r = deleteBackup(String(req.params.file || ""));
    res.json(r);
  } catch (e: any) { res.status(404).json({ error: e.message }); }
});

// Upload backup file (.json)
const backupUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 200 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/json" || file.originalname.toLowerCase().endsWith(".json")) cb(null, true);
    else cb(new Error("Only .json backup files are allowed"));
  },
});
app.post("/api/admin/mi/backups/upload", requireAuth, (req, res) => {
  backupUpload.single("file")(req, res, (err: any) => {
    if (err) return res.status(400).json({ error: err.message || "Upload failed" });
    if (!req.file) return res.status(400).json({ error: "No file" });
    try {
      const r = saveUploadedBackup(req.file.originalname, req.file.buffer);
      res.json(r);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });
});

app.get("/api/admin/mi/health", requireAuth, async (_req, res) => {
  try { res.json(await healthCheck()); } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Download a backup file so admin can save a copy locally too
app.get("/api/admin/mi/backups/:file/download", requireAuth, (req, res) => {
  const safe = path.basename(String(req.params.file || ""));
  const full = path.resolve("data/backups", safe);
  if (!fs.existsSync(full)) return res.status(404).json({ error: "Not found" });
  res.download(full, safe);
});

// ── Global error handler — catches any unhandled error from any route ──────────
// Must have exactly 4 parameters for Express to recognise it as an error handler.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error("[express] Unhandled error:", err?.message ?? err);
  console.error("[express] Stack:", err?.stack ?? "(no stack)");

  let message = "Internal server error.";
  if (err?.message?.includes("ECONNREFUSED") || err?.message?.includes("timeout") || err?.message?.includes("connect")) {
    message = "Cannot reach the database. Ensure DATABASE_URL is set and accessible from Vercel.";
  }

  if (res.headersSent) return;
  res.status(err?.status ?? 500).json({ error: message });
});

// Always bootstrap admin accounts (runs on both local and Vercel cold-start)
ensureDefaultAdmin().catch((e) => console.error("admin bootstrap failed", e));

// Backfill product categories + repair broken legacy image URLs (one-shot per boot).
// Delayed slightly so any startup seeding has a chance to insert rows first.
setTimeout(() => {
  runDataFixes().catch((e) => console.error("[data-fix] failed at boot:", e));
}, 2000);

// ── Dynamic SEO sitemap (lists every product / standard / industry URL) ───────
// This makes Google index every individual product page so users searching for
// any specific product (e.g. "ASTM A193 B7 stud bolt") land directly on its page.
app.get("/sitemap.xml", wrap(async (req, res) => {
  const proto = (req.headers["x-forwarded-proto"] as string) || req.protocol || "https";
  const host  = (req.headers["x-forwarded-host"]  as string) || req.headers.host || "miengineeringworks.com";
  const SITE  = process.env.SITE_URL || `${proto}://${host}`;
  const today = new Date().toISOString().slice(0, 10);

  const staticUrls = [
    { loc: "/",                priority: "1.0", change: "weekly" },
    { loc: "/products",        priority: "0.9", change: "weekly" },
    { loc: "/applications",    priority: "0.9", change: "weekly" },
    { loc: "/standards",       priority: "0.9", change: "weekly" },
    { loc: "/specifications",  priority: "0.8", change: "monthly" },
    { loc: "/grade-chart",     priority: "0.8", change: "monthly" },
    { loc: "/gallery",         priority: "0.7", change: "monthly" },
    { loc: "/about",           priority: "0.7", change: "monthly" },
    { loc: "/contact",         priority: "0.7", change: "monthly" },
    { loc: "/quote",           priority: "0.7", change: "monthly" },
  ];

  let products: any[] = [], industries: any[] = [], standards: any[] = [];
  try { products  = await storage.listProducts(); }   catch {}
  try { industries = await storage.listIndustries(); } catch {}
  try { standards  = await storage.listStandards(); }  catch {}

  const lines: string[] = [];
  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
  for (const u of staticUrls) {
    lines.push(`  <url><loc>${SITE}${u.loc}</loc><lastmod>${today}</lastmod><priority>${u.priority}</priority><changefreq>${u.change}</changefreq></url>`);
  }
  for (const p of products) {
    if (!p?.slug) continue;
    lines.push(`  <url><loc>${SITE}/product/${p.slug}</loc><lastmod>${today}</lastmod><priority>0.85</priority><changefreq>monthly</changefreq></url>`);
  }
  for (const i of industries) {
    if (!i?.slug) continue;
    lines.push(`  <url><loc>${SITE}/industry/${i.slug}</loc><lastmod>${today}</lastmod><priority>0.8</priority><changefreq>monthly</changefreq></url>`);
  }
  for (const s of standards) {
    if (!s?.slug) continue;
    lines.push(`  <url><loc>${SITE}/standards/${s.slug}</loc><lastmod>${today}</lastmod><priority>0.8</priority><changefreq>monthly</changefreq></url>`);
  }
  lines.push('</urlset>');
  res.type("application/xml").send(lines.join("\n"));
}));

app.get("/robots.txt", (req, res) => {
  const proto = (req.headers["x-forwarded-proto"] as string) || req.protocol || "https";
  const host  = (req.headers["x-forwarded-host"]  as string) || req.headers.host || "miengineeringworks.com";
  const SITE  = process.env.SITE_URL || `${proto}://${host}`;
  res.type("text/plain").send(
    `User-agent: *\nAllow: /\n\nUser-agent: Googlebot\nAllow: /\n\nUser-agent: Bingbot\nAllow: /\n\nDisallow: /admin\nDisallow: /api\n\nSitemap: ${SITE}/sitemap.xml\n`
  );
});

// ── Production: serve the built React SPA from dist/ ──────────────────────────
// In dev, Vite serves the frontend separately on its own port (proxied to /api).
// In production (cPanel / VPS / Render), Express alone serves both the API AND
// the static build, so the whole site runs as a single Node process.
const NODE_ENV = process.env.NODE_ENV || "development";
if (NODE_ENV === "production" && !process.env.VERCEL) {
  const distDir = path.resolve("dist");
  if (fs.existsSync(distDir)) {
    app.use(express.static(distDir, { maxAge: "1h", index: false }));
    // SPA fallback: any non-API GET → index.html (lets React Router handle it)
    app.get(/^\/(?!api\/|uploads\/).*/, (_req, res) => {
      res.sendFile(path.join(distDir, "index.html"));
    });
    console.log(`[server] serving production build from ${distDir}`);
  } else {
    console.warn(
      "[server] NODE_ENV=production but dist/ not found.\n" +
      "        Run `npm run build` before `npm start`."
    );
  }
}

if (process.env.VERCEL) {
  // Vercel serverless: skip disk-dependent startup tasks
  console.log("[server] running as Vercel serverless function");
} else {
  // Local dev OR self-hosted (cPanel / VPS / Render).
  // PORT is the standard env var on most hosts; SERVER_PORT kept as fallback
  // so existing dev setups that proxy from Vite to :3001 keep working.
  ensureFirstRunBackup().catch((e) => console.error("first-run backup failed", e));
  startBackupScheduler();
  const PORT = Number(process.env.PORT || process.env.SERVER_PORT || 3001);
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[server] listening on :${PORT} (${NODE_ENV})`);
  });
}

export default app;
