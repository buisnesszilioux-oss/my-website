import path from "path";
import fs from "fs";
import { db } from "./db";
import {
  products, industries, standards, media, siteContent, pageSections,
  customers, ledgerEntries, contactSubmissions,
} from "../shared/schema";

const BACKUP_DIR = path.resolve("data/backups");
const UPLOAD_DIR = path.resolve("uploads");
if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const TABLES = {
  products, industries, standards, media, siteContent, pageSections,
  customers, ledgerEntries, contactSubmissions,
} as const;

type TableKey = keyof typeof TABLES;

export type Snapshot = {
  version: number;
  createdAt: string;
  kind: "db" | "full";
  tables: Record<TableKey, any[]>;
  counts: Record<TableKey, number>;
  files?: Record<string, string>; // filename -> base64
};

export async function dumpAllTables() {
  const tables: any = {};
  const counts: any = {};
  for (const [name, table] of Object.entries(TABLES)) {
    const rows = await db.select().from(table as any);
    tables[name] = rows;
    counts[name] = rows.length;
  }
  return { tables, counts };
}

function timestampSlug() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

/** DB-only backup (small, fast) */
export async function createBackup(label = "manual") {
  const dump = await dumpAllTables();
  const snap: Snapshot = {
    version: 2,
    kind: "db",
    createdAt: new Date().toISOString(),
    tables: dump.tables,
    counts: dump.counts,
  };
  const safe = label.replace(/[^a-z0-9-_]/gi, "-").slice(0, 32);
  const file = `backup-${timestampSlug()}-${safe}.json`;
  const full = path.join(BACKUP_DIR, file);
  fs.writeFileSync(full, JSON.stringify(snap, null, 2), "utf8");
  return {
    file, path: full, kind: "db" as const,
    counts: snap.counts,
    totalRows: Object.values(snap.counts).reduce((a, b) => a + b, 0),
    fileCount: 0,
  };
}

/** Full backup — DB + every file in /uploads (base64 inline). Single .json file. */
export async function createFullBackup(label = "full") {
  const dump = await dumpAllTables();

  const files: Record<string, string> = {};
  let fileCount = 0;
  if (fs.existsSync(UPLOAD_DIR)) {
    for (const name of fs.readdirSync(UPLOAD_DIR)) {
      const p = path.join(UPLOAD_DIR, name);
      try {
        const stat = fs.statSync(p);
        if (!stat.isFile()) continue;
        if (stat.size > 50 * 1024 * 1024) continue; // skip files > 50 MB
        const buf = fs.readFileSync(p);
        files[name] = buf.toString("base64");
        fileCount++;
      } catch {}
    }
  }

  const snap: Snapshot = {
    version: 2,
    kind: "full",
    createdAt: new Date().toISOString(),
    tables: dump.tables,
    counts: dump.counts,
    files,
  };

  const safe = label.replace(/[^a-z0-9-_]/gi, "-").slice(0, 32);
  const file = `fullbackup-${timestampSlug()}-${safe}.json`;
  const full = path.join(BACKUP_DIR, file);
  fs.writeFileSync(full, JSON.stringify(snap), "utf8"); // no pretty (keep size smaller)
  const sizeBytes = fs.statSync(full).size;
  return {
    file, path: full, kind: "full" as const,
    counts: snap.counts,
    totalRows: Object.values(snap.counts).reduce((a, b) => a + b, 0),
    fileCount,
    sizeBytes,
  };
}

export function listBackups() {
  if (!fs.existsSync(BACKUP_DIR)) return [];
  return fs.readdirSync(BACKUP_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      const full = path.join(BACKUP_DIR, f);
      const s = fs.statSync(full);
      let counts: Record<string, number> = {};
      let createdAt: string | undefined;
      let kind: "db" | "full" = "db";
      let fileCount = 0;
      try {
        const raw = fs.readFileSync(full, "utf8");
        const j = JSON.parse(raw);
        counts = j.counts || {};
        createdAt = j.createdAt;
        kind = j.kind === "full" ? "full" : "db";
        fileCount = j.files ? Object.keys(j.files).length : 0;
      } catch {}
      return {
        file: f,
        size: s.size,
        modified: s.mtime.toISOString(),
        createdAt,
        kind,
        totalRows: Object.values(counts).reduce((a, b) => a + b, 0),
        counts,
        fileCount,
      };
    })
    .sort((a, b) => (b.createdAt || b.modified).localeCompare(a.createdAt || a.modified));
}

/**
 * Restore from a snapshot file.
 * mode "replace" — clear table then insert backed-up rows
 * mode "merge"   — only insert rows whose id is not already present
 * Full backups also write files back into /uploads.
 */
export async function restoreBackup(file: string, mode: "replace" | "merge" = "replace") {
  const safe = path.basename(file);
  const full = path.join(BACKUP_DIR, safe);
  if (!fs.existsSync(full)) throw new Error(`Backup file not found: ${safe}`);
  const snap: Snapshot = JSON.parse(fs.readFileSync(full, "utf8"));
  if (snap.version !== 1 && snap.version !== 2) throw new Error("Unsupported backup version");

  const restored: Record<string, number> = {};
  const skipped: Record<string, number> = {};

  for (const [name, table] of Object.entries(TABLES)) {
    const rows: any[] = (snap.tables as any)[name] || [];
    if (rows.length === 0) { restored[name] = 0; skipped[name] = 0; continue; }

    if (mode === "replace") {
      await db.delete(table as any);
      const cleaned = rows.map((r) => normalizeRow(r));
      for (const chunk of chunkArray(cleaned, 100)) {
        await db.insert(table as any).values(chunk);
      }
      restored[name] = rows.length;
      skipped[name] = 0;
    } else {
      const existing = await db.select().from(table as any);
      const existingIds = new Set(existing.map((e: any) => e.id));
      const toInsert = rows.filter((r) => !existingIds.has(r.id)).map(normalizeRow);
      if (toInsert.length) {
        for (const chunk of chunkArray(toInsert, 100)) {
          await db.insert(table as any).values(chunk);
        }
      }
      restored[name] = toInsert.length;
      skipped[name] = rows.length - toInsert.length;
    }
  }

  // Restore files (full backups)
  let filesRestored = 0;
  if (snap.files && typeof snap.files === "object") {
    for (const [name, b64] of Object.entries(snap.files)) {
      try {
        const safeName = path.basename(name);
        const out = path.join(UPLOAD_DIR, safeName);
        fs.writeFileSync(out, Buffer.from(String(b64), "base64"));
        filesRestored++;
      } catch (e) {
        console.warn("[mi] restore file failed:", name, (e as Error).message);
      }
    }
  }

  return { file: safe, mode, kind: snap.kind || "db", restored, skipped, filesRestored };
}

export function deleteBackup(file: string) {
  const safe = path.basename(file);
  const full = path.join(BACKUP_DIR, safe);
  if (!fs.existsSync(full)) throw new Error(`Backup file not found: ${safe}`);
  fs.unlinkSync(full);
  return { file: safe, deleted: true };
}

/** Save uploaded backup file into /data/backups so it shows up in the list */
export function saveUploadedBackup(originalName: string, buf: Buffer) {
  // Validate JSON shape
  let snap: any;
  try { snap = JSON.parse(buf.toString("utf8")); }
  catch { throw new Error("Uploaded file is not valid JSON"); }
  if (!snap || (snap.version !== 1 && snap.version !== 2) || !snap.tables) {
    throw new Error("Uploaded file is not a valid MI backup (missing version/tables)");
  }
  const baseRaw = path.basename(originalName).replace(/[^a-z0-9.\-_]/gi, "_");
  const base = baseRaw.toLowerCase().endsWith(".json") ? baseRaw : `${baseRaw}.json`;
  const finalName = base.startsWith("backup-") || base.startsWith("fullbackup-")
    ? base
    : `uploaded-${timestampSlug()}-${base}`;
  const out = path.join(BACKUP_DIR, finalName);
  fs.writeFileSync(out, buf);
  const counts = snap.counts || {};
  return {
    file: finalName,
    kind: snap.kind === "full" ? "full" : "db",
    totalRows: Object.values(counts).reduce((a: number, b: any) => a + Number(b || 0), 0),
    fileCount: snap.files ? Object.keys(snap.files).length : 0,
    sizeBytes: buf.length,
  };
}

function normalizeRow(r: any) {
  const out: any = {};
  for (const [k, v] of Object.entries(r)) {
    if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(v)) {
      out[k] = new Date(v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

function chunkArray<T>(arr: T[], n: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

/* ---------- HEALTH CHECK ---------- */

export async function healthCheck() {
  const counts: Record<string, number> = {};
  for (const [name, table] of Object.entries(TABLES)) {
    const rows = await db.select().from(table as any);
    counts[name] = rows.length;
  }

  const onDisk = fs.existsSync(UPLOAD_DIR) ? new Set(fs.readdirSync(UPLOAD_DIR)) : new Set<string>();

  const refs: { table: string; row: number; field: string; url: string }[] = [];
  const collectImageRefs = (rows: any[], table: string, fields: string[]) => {
    for (const r of rows) {
      for (const f of fields) {
        const v = r[f];
        if (typeof v === "string" && v.startsWith("/uploads/")) refs.push({ table, row: r.id, field: f, url: v });
      }
    }
  };
  const productsRows = await db.select().from(products);
  const industriesRows = await db.select().from(industries);
  const standardsRows = await db.select().from(standards);
  const mediaRows = await db.select().from(media);
  const sectionsRows = await db.select().from(pageSections);
  const contentRows = await db.select().from(siteContent);

  collectImageRefs(productsRows, "products", ["image"]);
  collectImageRefs(industriesRows, "industries", ["image"]);
  collectImageRefs(standardsRows, "standards", ["image"]);
  collectImageRefs(mediaRows, "media", ["url", "thumbnail"]);
  collectImageRefs(sectionsRows, "pageSections", ["image"]);
  for (const c of contentRows) {
    if (typeof c.value === "string" && c.value.startsWith("/uploads/")) {
      refs.push({ table: "siteContent", row: c.id, field: c.key, url: c.value });
    }
  }
  for (const ind of industriesRows) {
    const apps: any[] = (ind as any).applications || [];
    apps.forEach((a, i) => {
      if (a?.image && typeof a.image === "string" && a.image.startsWith("/uploads/")) {
        refs.push({ table: "industries.applications", row: ind.id, field: `[${i}].image`, url: a.image });
      }
    });
  }

  const missingFiles = refs.filter((r) => {
    const filename = r.url.replace(/^\/uploads\//, "");
    return !onDisk.has(filename);
  });

  const issues: { severity: "warn" | "error"; message: string }[] = [];
  if (counts.products === 0) issues.push({ severity: "warn", message: "No products in database" });
  if (counts.industries === 0) issues.push({ severity: "warn", message: "No industries in database" });
  if (counts.standards === 0) issues.push({ severity: "warn", message: "No standards in database" });
  if (missingFiles.length > 0) issues.push({
    severity: "error",
    message: `${missingFiles.length} uploaded image(s) referenced in DB are missing from /uploads folder`,
  });

  const backups = listBackups();
  if (backups.length === 0) issues.push({ severity: "warn", message: "No backups exist yet — type 'backup' to create one" });

  return {
    counts,
    totalRows: Object.values(counts).reduce((a, b) => a + b, 0),
    uploadedFilesOnDisk: onDisk.size,
    referencedUploadFiles: refs.length,
    missingFiles: missingFiles.slice(0, 30),
    missingFilesCount: missingFiles.length,
    issues,
    backups: backups.length,
    latestBackup: backups[0] || null,
  };
}

/* ---------- AUTO BACKUPS (boot + daily) ---------- */

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export async function ensureFirstRunBackup() {
  try {
    if (listBackups().length > 0) return;
    const dump = await dumpAllTables();
    if (dump.counts.products === 0 && dump.counts.industries === 0 && dump.counts.standards === 0) return;
    const r = await createFullBackup("auto-first-run");
    console.log(`[mi] auto first-run FULL backup created: ${r.file} (${r.totalRows} rows, ${r.fileCount} files)`);
  } catch (e) {
    console.warn("[mi] first-run backup skipped:", (e as Error).message);
  }
}

/** Run a daily auto full-backup. Keep last 7 auto backups; older ones are pruned. */
export async function runDailyBackupIfDue() {
  try {
    const all = listBackups();
    const autoOnes = all.filter((b) => /-auto-daily/.test(b.file));
    const newest = autoOnes[0];
    if (newest) {
      const last = new Date(newest.createdAt || newest.modified).getTime();
      if (Date.now() - last < ONE_DAY_MS) return null; // not due yet
    }
    const r = await createFullBackup("auto-daily");
    console.log(`[mi] daily auto FULL backup created: ${r.file}`);

    // Prune auto-daily backups beyond 7
    const refreshed = listBackups().filter((b) => /-auto-daily/.test(b.file));
    const toDelete = refreshed.slice(7);
    for (const old of toDelete) {
      try { fs.unlinkSync(path.join(BACKUP_DIR, old.file)); console.log(`[mi] pruned old daily backup: ${old.file}`); }
      catch {}
    }
    return r;
  } catch (e) {
    console.warn("[mi] daily auto backup failed:", (e as Error).message);
    return null;
  }
}

export function startBackupScheduler() {
  // run once shortly after boot, then every 6 hours (each call is a no-op if not due)
  setTimeout(() => { runDailyBackupIfDue(); }, 60 * 1000);
  setInterval(() => { runDailyBackupIfDue(); }, 6 * 60 * 60 * 1000);
  console.log("[mi] daily auto-backup scheduler started (checks every 6h, fires once per 24h)");
}

/* ---------- CHAT INTENT PARSER ---------- */

export type ChatResponse = {
  reply: string;
  kind?: "text" | "health" | "backups" | "stats" | "ok" | "error" | "help";
  data?: any;
  actions?: { label: string; command: string }[];
};

const HELP = `Main MI Chat hoon. Aap mujhe yeh seedhi-saadhi commands de sakte ho:

• "backup" — abhi ke saare data + photos ka FULL backup banao
• "db backup" — sirf database ka backup (chhota, jaldi)
• "restore" — purane backup se data wapas le aao
• "list backups" — saare available backups dikhao
• "health" / "fix bug" — site check karo, kya broken hai bata do
• "stats" — kitne products, industries, standards hain dikhao
• "help" — yeh menu firse dikhao

Tip: Detailed backup management ke liye sidebar me "Backups" page kholo — wahan upload/download/delete sab hai.

English ya Hindi dono samjhta hoon.`;

function detectIntent(raw: string): string {
  const m = raw.toLowerCase().trim();
  if (!m) return "unknown";
  if (/^(help|menu|commands?|kya kar sakte|kya kr sakte|kaise|how)/.test(m)) return "help";
  if (/list.*(backup|snapshot)|(backup|snapshot).*list|sare backup|saare backup|show backup|dikhao backup/.test(m)) return "list-backups";
  if (/^(db|database|small|chhota|chota)\s*backup|backup.*db|backup.*database/.test(m)) return "db-backup";
  if (/^backup$|^full ?backup$|backup banao|backup karo|save backup|create backup|snapshot|backup le|take backup|pura backup/.test(m)) return "full-backup";
  if (/restore|wapas|recover|gayab|missing data|laoo|laao|undo|rollback/.test(m)) return "restore";
  if (/health|status|bug|error|broken|fix|kya issue|kya problem|theek|sahi hai|check karo/.test(m)) return "health";
  if (/stats|count|kitne|total|total kitne/.test(m)) return "stats";
  return "unknown";
}

export async function handleChat(rawMessage: string, opts?: { restoreFile?: string; restoreMode?: "replace" | "merge" }): Promise<ChatResponse> {
  const message = (rawMessage || "").trim();

  if (opts?.restoreFile) {
    try {
      const r = await restoreBackup(opts.restoreFile, opts.restoreMode || "replace");
      const total = Object.values(r.restored).reduce((a, b) => a + b, 0);
      return {
        kind: "ok",
        reply: `✅ Restore complete from "${r.file}". Total ${total} rows wapas aaye${r.filesRestored ? ` aur ${r.filesRestored} photos/files bhi wapas` : ""} (mode: ${r.mode}).`,
        data: r,
      };
    } catch (e: any) {
      return { kind: "error", reply: `❌ Restore fail: ${e.message}` };
    }
  }

  const intent = detectIntent(message);

  if (intent === "help") return { kind: "help", reply: HELP };

  if (intent === "full-backup") {
    const r = await createFullBackup("chat");
    return {
      kind: "ok",
      reply: `✅ FULL Backup ban gaya: ${r.file}\n📦 ${r.totalRows} rows + 🖼️ ${r.fileCount} photos save hue.\n\nSize: ${(r.sizeBytes / 1024 / 1024).toFixed(2)} MB. Project ke andar data/backups/ folder me.`,
      data: r,
      actions: [{ label: "Open Backups page", command: "list backups" }],
    };
  }

  if (intent === "db-backup") {
    const r = await createBackup("chat");
    return {
      kind: "ok",
      reply: `✅ DB Backup ban gaya: ${r.file}\n📦 ${r.totalRows} rows save hue (sirf database, photos nahi).`,
      data: r,
    };
  }

  if (intent === "list-backups" || intent === "restore") {
    const backups = listBackups();
    if (backups.length === 0) {
      return {
        kind: "text",
        reply: "❌ Koi backup file nahi mili.\n\nSabse pehle ek backup banao:",
        actions: [{ label: "Create backup now", command: "backup" }],
      };
    }
    if (intent === "restore") {
      return {
        kind: "backups",
        reply: `🗂️ ${backups.length} backup mile. Jisse restore karna hai uska "Restore" button dabao.\n\n⚠️ Restore karne se abhi ka data REPLACE ho jayega backup wale data se.`,
        data: backups,
      };
    }
    return {
      kind: "backups",
      reply: `🗂️ ${backups.length} backup files available:`,
      data: backups,
    };
  }

  if (intent === "health") {
    const h = await healthCheck();
    let reply = `🩺 Health Check:\n\n📊 Total rows in DB: ${h.totalRows}\n📁 Uploads on disk: ${h.uploadedFilesOnDisk}\n🔗 Image references in DB: ${h.referencedUploadFiles}`;
    if (h.missingFilesCount > 0) reply += `\n\n⚠️ ${h.missingFilesCount} image(s) DB me hain par /uploads me file gayab hai.`;
    if (h.issues.length === 0) reply += `\n\n✅ Sab kuch theek dikh raha hai.`;
    else reply += `\n\nIssues:\n${h.issues.map((i) => `• [${i.severity.toUpperCase()}] ${i.message}`).join("\n")}`;
    if (h.latestBackup) reply += `\n\n💾 Last backup: ${h.latestBackup.file}`;
    const actions: { label: string; command: string }[] = [{ label: "Backup now", command: "backup" }];
    if (h.backups > 0) actions.push({ label: "Restore from backup", command: "restore" });
    return { kind: "health", reply, data: h, actions };
  }

  if (intent === "stats") {
    const dump = await dumpAllTables();
    const lines = Object.entries(dump.counts).map(([k, v]) => `• ${k}: ${v}`).join("\n");
    return { kind: "stats", reply: `📊 Database stats:\n\n${lines}`, data: dump.counts };
  }

  return {
    kind: "text",
    reply: `Maaf kijiye, "${message}" samjh nahi aaya.\n\n${HELP}`,
  };
}
