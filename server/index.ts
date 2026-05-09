import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";
import multer from "multer";
import { connectDB } from "./db";
import {
  Product, Industry, Standard, Media, FloatingImage,
  PageSection, SiteContent, Contact, Customer, LedgerEntry,
} from "./models";

const app = express();
const PORT = Number(process.env.SERVER_PORT || 3001);
const JWT_SECRET = process.env.JWT_SECRET || "mi-eng-secret-change-me";
const ADMIN_EMAILS = (process.env.ADMIN_USERNAME || "miengineering17@gmail.com")
  .split(",").map((e) => e.trim().toLowerCase());
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";

// ── Uploads folder ────────────────────────────────────────────────────────────
const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// ── Multer ────────────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "5mb" }));
app.use("/uploads", express.static(UPLOADS_DIR));

// ── Auth middleware ───────────────────────────────────────────────────────────
function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) { res.status(403).json({ error: "Admin access required" }); return; }
  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(403).json({ error: "Invalid or expired token" });
  }
}

// ── Helper: doc to plain object with id field ─────────────────────────────────
function toObj(doc: any) {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  obj.id = String(obj._id);
  delete obj._id;
  delete obj.__v;
  return obj;
}

function toList(docs: any[]) {
  return docs.map(toObj);
}

// ── Health ────────────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => res.json({ ok: true, mode: "mongodb" }));

// ── Auth: Login ───────────────────────────────────────────────────────────────
app.post("/api/admin/login", async (req, res) => {
  try {
    const { email = "", password = "" } = req.body;
    const norm = email.trim().toLowerCase();
    if (!ADMIN_EMAILS.includes(norm) || password !== ADMIN_PASSWORD) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }
    const token = jwt.sign({ email: norm, role: "admin" }, JWT_SECRET, { expiresIn: "30d" });
    res.json({ token, email: norm });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Auth: Verify ──────────────────────────────────────────────────────────────
app.get("/api/admin/verify", requireAdmin, (_req, res) => res.json({ ok: true }));

// ── File Upload ───────────────────────────────────────────────────────────────
app.post("/api/admin/upload", requireAdmin, upload.single("file"), (req, res) => {
  if (!req.file) { res.status(400).json({ error: "No file uploaded" }); return; }
  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
});

// ── Public: Site Content ──────────────────────────────────────────────────────
app.get("/api/site-content", async (_req, res) => {
  try {
    await connectDB();
    const docs = await SiteContent.find();
    const map: Record<string, string> = {};
    docs.forEach((d) => { map[d.key] = d.value ?? ""; });
    res.json(map);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ── Public: Products ──────────────────────────────────────────────────────────
app.get("/api/products", async (_req, res) => {
  try {
    await connectDB();
    const docs = await Product.find().sort({ sortOrder: 1, createdAt: 1 });
    res.json(toList(docs));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get("/api/products/:slug", async (req, res) => {
  try {
    await connectDB();
    const doc = await Product.findOne({ slug: req.params.slug });
    if (!doc) { res.status(404).json({ error: "Product not found" }); return; }
    res.json(toObj(doc));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ── Public: Industries ────────────────────────────────────────────────────────
app.get("/api/industries", async (_req, res) => {
  try {
    await connectDB();
    const docs = await Industry.find().sort({ sortOrder: 1, createdAt: 1 });
    res.json(toList(docs));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get("/api/industries/:slug", async (req, res) => {
  try {
    await connectDB();
    const doc = await Industry.findOne({ slug: req.params.slug });
    if (!doc) { res.status(404).json({ error: "Industry not found" }); return; }
    res.json(toObj(doc));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ── Public: Standards ─────────────────────────────────────────────────────────
app.get("/api/standards", async (_req, res) => {
  try {
    await connectDB();
    const docs = await Standard.find().sort({ sortOrder: 1, createdAt: 1 });
    res.json(toList(docs));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get("/api/standards/:slug", async (req, res) => {
  try {
    await connectDB();
    const doc = await Standard.findOne({ slug: req.params.slug });
    if (!doc) { res.status(404).json({ error: "Standard not found" }); return; }
    res.json(toObj(doc));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ── Public: Media ─────────────────────────────────────────────────────────────
app.get("/api/media", async (_req, res) => {
  try {
    await connectDB();
    const docs = await Media.find().sort({ sortOrder: 1, createdAt: -1 });
    res.json(toList(docs));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ── Public: Floating Images ───────────────────────────────────────────────────
app.get("/api/floating-images", async (_req, res) => {
  try {
    await connectDB();
    const docs = await FloatingImage.find({ enabled: true }).sort({ sortOrder: 1 });
    res.json(toList(docs));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ── Public: Page Sections ─────────────────────────────────────────────────────
app.get("/api/page-sections", async (req, res) => {
  try {
    await connectDB();
    const page = (req.query.page as string) || "home";
    const docs = await PageSection.find({ page, enabled: true }).sort({ sortOrder: 1 });
    res.json(toList(docs));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ── Public: Contact submission ────────────────────────────────────────────────
app.post("/api/contact", async (req, res) => {
  try {
    await connectDB();
    const { fullName, email, phone, message, companyName } = req.body;
    if (!fullName || !email || !phone || !message) {
      res.status(400).json({ error: "Missing required fields" }); return;
    }
    const doc = await Contact.create({ fullName, email, phone, message, companyName });
    res.json({ ok: true, id: doc._id });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ── Admin: Site Content ───────────────────────────────────────────────────────
app.post("/api/admin/site-content", requireAdmin, async (req, res) => {
  try {
    await connectDB();
    const entries: { key: string; value: string }[] = Array.isArray(req.body?.entries)
      ? req.body.entries
      : [{ key: req.body?.key, value: req.body?.value }];
    const saved = [];
    for (const entry of entries) {
      const key = String(entry?.key || "").trim();
      if (!key) continue;
      const value = String(entry?.value ?? "");
      await SiteContent.findOneAndUpdate({ key }, { key, value }, { upsert: true, new: true });
      saved.push({ key, value });
    }
    res.json(Array.isArray(req.body?.entries) ? { saved } : saved[0]);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ── Admin: Products ───────────────────────────────────────────────────────────
app.post("/api/admin/products", requireAdmin, async (req, res) => {
  try {
    await connectDB();
    const doc = await Product.create(req.body);
    res.json(toObj(doc));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.patch("/api/admin/products/:id", requireAdmin, async (req, res) => {
  try {
    await connectDB();
    const { id } = req.params;
    const query = id.length === 24 ? { _id: id } : { slug: id };
    const doc = await Product.findOneAndUpdate(query, req.body, { new: true });
    if (!doc) { res.status(404).json({ error: "Not found" }); return; }
    res.json(toObj(doc));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.delete("/api/admin/products/:id", requireAdmin, async (req, res) => {
  try {
    await connectDB();
    const { id } = req.params;
    const query = id.length === 24 ? { _id: id } : { slug: id };
    await Product.findOneAndDelete(query);
    res.json({ ok: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ── Admin: Industries ─────────────────────────────────────────────────────────
app.post("/api/admin/industries", requireAdmin, async (req, res) => {
  try {
    await connectDB();
    const doc = await Industry.create(req.body);
    res.json(toObj(doc));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.patch("/api/admin/industries/:id", requireAdmin, async (req, res) => {
  try {
    await connectDB();
    const { id } = req.params;
    const query = id.length === 24 ? { _id: id } : { slug: id };
    const doc = await Industry.findOneAndUpdate(query, req.body, { new: true });
    if (!doc) { res.status(404).json({ error: "Not found" }); return; }
    res.json(toObj(doc));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.delete("/api/admin/industries/:id", requireAdmin, async (req, res) => {
  try {
    await connectDB();
    const { id } = req.params;
    const query = id.length === 24 ? { _id: id } : { slug: id };
    await Industry.findOneAndDelete(query);
    res.json({ ok: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ── Admin: Standards ──────────────────────────────────────────────────────────
app.post("/api/admin/standards", requireAdmin, async (req, res) => {
  try {
    await connectDB();
    const doc = await Standard.create(req.body);
    res.json(toObj(doc));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.patch("/api/admin/standards/:id", requireAdmin, async (req, res) => {
  try {
    await connectDB();
    const { id } = req.params;
    const query = id.length === 24 ? { _id: id } : { slug: id };
    const doc = await Standard.findOneAndUpdate(query, req.body, { new: true });
    if (!doc) { res.status(404).json({ error: "Not found" }); return; }
    res.json(toObj(doc));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.delete("/api/admin/standards/:id", requireAdmin, async (req, res) => {
  try {
    await connectDB();
    const { id } = req.params;
    const query = id.length === 24 ? { _id: id } : { slug: id };
    await Standard.findOneAndDelete(query);
    res.json({ ok: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ── Admin: Media ──────────────────────────────────────────────────────────────
app.post("/api/admin/media", requireAdmin, async (req, res) => {
  try {
    await connectDB();
    const doc = await Media.create(req.body);
    res.json(toObj(doc));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.patch("/api/admin/media/:id", requireAdmin, async (req, res) => {
  try {
    await connectDB();
    const doc = await Media.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!doc) { res.status(404).json({ error: "Not found" }); return; }
    res.json(toObj(doc));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.delete("/api/admin/media/:id", requireAdmin, async (req, res) => {
  try {
    await connectDB();
    await Media.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ── Admin: Floating Images ────────────────────────────────────────────────────
app.get("/api/admin/floating-images", requireAdmin, async (_req, res) => {
  try {
    await connectDB();
    const docs = await FloatingImage.find().sort({ sortOrder: 1 });
    res.json(toList(docs));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.post("/api/admin/floating-images", requireAdmin, async (req, res) => {
  try {
    await connectDB();
    const doc = await FloatingImage.create(req.body);
    res.json(toObj(doc));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.patch("/api/admin/floating-images/:id", requireAdmin, async (req, res) => {
  try {
    await connectDB();
    const doc = await FloatingImage.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!doc) { res.status(404).json({ error: "Not found" }); return; }
    res.json(toObj(doc));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.delete("/api/admin/floating-images/:id", requireAdmin, async (req, res) => {
  try {
    await connectDB();
    await FloatingImage.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ── Admin: Page Sections ──────────────────────────────────────────────────────
app.get("/api/admin/page-sections", requireAdmin, async (_req, res) => {
  try {
    await connectDB();
    const docs = await PageSection.find().sort({ sortOrder: 1 });
    res.json(toList(docs));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.post("/api/admin/page-sections", requireAdmin, async (req, res) => {
  try {
    await connectDB();
    const doc = await PageSection.create(req.body);
    res.json(toObj(doc));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.patch("/api/admin/page-sections/:id", requireAdmin, async (req, res) => {
  try {
    await connectDB();
    const doc = await PageSection.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!doc) { res.status(404).json({ error: "Not found" }); return; }
    res.json(toObj(doc));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.delete("/api/admin/page-sections/:id", requireAdmin, async (req, res) => {
  try {
    await connectDB();
    await PageSection.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ── Admin: Contacts ───────────────────────────────────────────────────────────
app.get("/api/admin/contacts", requireAdmin, async (_req, res) => {
  try {
    await connectDB();
    const docs = await Contact.find().sort({ createdAt: -1 });
    res.json(toList(docs));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.delete("/api/admin/contacts/:id", requireAdmin, async (req, res) => {
  try {
    await connectDB();
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ── Admin: Customers ──────────────────────────────────────────────────────────
app.get("/api/admin/customers", requireAdmin, async (_req, res) => {
  try {
    await connectDB();
    const docs = await Customer.find().sort({ name: 1 });
    res.json(toList(docs));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.post("/api/admin/customers", requireAdmin, async (req, res) => {
  try {
    await connectDB();
    const doc = await Customer.create(req.body);
    res.json(toObj(doc));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get("/api/admin/customers/:id", requireAdmin, async (req, res) => {
  try {
    await connectDB();
    const doc = await Customer.findById(req.params.id);
    if (!doc) { res.status(404).json({ error: "Not found" }); return; }
    res.json(toObj(doc));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.patch("/api/admin/customers/:id", requireAdmin, async (req, res) => {
  try {
    await connectDB();
    const doc = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!doc) { res.status(404).json({ error: "Not found" }); return; }
    res.json(toObj(doc));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.delete("/api/admin/customers/:id", requireAdmin, async (req, res) => {
  try {
    await connectDB();
    await Customer.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ── Admin: Ledger ─────────────────────────────────────────────────────────────
app.get("/api/admin/ledger", requireAdmin, async (req, res) => {
  try {
    await connectDB();
    const filter: any = {};
    if (req.query.customerId) filter.customerId = req.query.customerId;
    const docs = await LedgerEntry.find(filter).sort({ createdAt: -1 });
    res.json(toList(docs));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.post("/api/admin/ledger", requireAdmin, async (req, res) => {
  try {
    await connectDB();
    const doc = await LedgerEntry.create(req.body);
    res.json(toObj(doc));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.patch("/api/admin/ledger/:id", requireAdmin, async (req, res) => {
  try {
    await connectDB();
    const doc = await LedgerEntry.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!doc) { res.status(404).json({ error: "Not found" }); return; }
    res.json(toObj(doc));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.delete("/api/admin/ledger/:id", requireAdmin, async (req, res) => {
  try {
    await connectDB();
    await LedgerEntry.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, "0.0.0.0", async () => {
  console.log(`[server] Listening on :${PORT}`);
  try {
    await connectDB();
  } catch {
    console.warn("[server] MongoDB not connected — start mongod and restart");
  }
});
