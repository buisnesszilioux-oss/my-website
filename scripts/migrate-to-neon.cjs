#!/usr/bin/env node
// Copies every row from the source PG (DATABASE_URL) into the target PG (TARGET_URL).
// Usage:
//   DATABASE_URL=<source>  TARGET_URL=<neon-url>  node scripts/migrate-to-neon.cjs

const { Pool } = require("pg");

const SRC = process.env.DATABASE_URL;
const TGT = process.env.TARGET_URL;

if (!SRC || !TGT) {
  console.error("[migrate] Set both DATABASE_URL (source) and TARGET_URL (Neon).");
  process.exit(1);
}

function makePool(url) {
  const needsSsl = /sslmode=require|neon\.tech|supabase\.co|amazonaws\.com|render\.com/.test(url);
  const cleanUrl = url.replace(/[?&]channel_binding=[^&]*/g, "").replace(/[?&]+$/, "");
  return new Pool({
    connectionString: cleanUrl,
    ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
    connectionTimeoutMillis: 10000,
    max: 3,
  });
}

const TABLES_IN_ORDER = [
  "admin_users",
  "users",
  "site_content",
  "products",
  "industries",
  "standards",
  "media",
  "page_sections",
  "contact_submissions",
  "customers",
  "ledger_entries",
  "floating_images",
];

async function tableExists(pool, name) {
  const r = await pool.query(
    `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=$1) AS ok`,
    [name],
  );
  return r.rows[0]?.ok === true;
}

async function copyTable(srcPool, tgtPool, table) {
  if (!(await tableExists(srcPool, table))) {
    console.log(`[migrate] skip ${table} (not in source)`);
    return;
  }
  if (!(await tableExists(tgtPool, table))) {
    console.log(`[migrate] skip ${table} (not in target — push schema first)`);
    return;
  }

  const { rows } = await srcPool.query(`SELECT * FROM "${table}"`);
  if (rows.length === 0) {
    console.log(`[migrate] ${table}: 0 rows`);
    return;
  }

  // Wipe target table first, so the migration is idempotent.
  await tgtPool.query(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE`).catch((e) => {
    console.warn(`[migrate] truncate ${table} warning:`, e.message);
  });

  const cols = Object.keys(rows[0]);
  const colList = cols.map((c) => `"${c}"`).join(", ");

  // Identify which columns are JSON / JSONB in the target table.
  const colInfo = await tgtPool.query(
    `SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name=$1`,
    [table],
  );
  const jsonCols = new Set(colInfo.rows.filter((r) => r.data_type === "json" || r.data_type === "jsonb").map((r) => r.column_name));

  let inserted = 0;
  for (const row of rows) {
    const values = cols.map((c) => {
      const v = row[c];
      // Postgres returns JSON cols as parsed objects — re-stringify so pg can re-insert them.
      if (jsonCols.has(c) && v !== null && typeof v !== "string") return JSON.stringify(v);
      return v;
    });
    const placeholders = cols.map((_, i) => `$${i + 1}`).join(", ");
    try {
      await tgtPool.query(
        `INSERT INTO "${table}" (${colList}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
        values,
      );
      inserted++;
    } catch (e) {
      console.warn(`[migrate] ${table} row insert failed:`, e.message);
    }
  }

  // Reset id sequence so future inserts don't collide.
  try {
    await tgtPool.query(
      `SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), COALESCE((SELECT MAX(id) FROM "${table}"), 1))`,
    );
  } catch {}

  console.log(`[migrate] ${table}: ${inserted}/${rows.length} rows`);
}

(async () => {
  const src = makePool(SRC);
  const tgt = makePool(TGT);

  console.log("[migrate] source =", new URL(SRC).hostname);
  console.log("[migrate] target =", new URL(TGT).hostname);

  for (const t of TABLES_IN_ORDER) {
    try { await copyTable(src, tgt, t); }
    catch (e) { console.error(`[migrate] ${t} FAILED:`, e.message); }
  }

  await src.end();
  await tgt.end();
  console.log("[migrate] done");
})().catch((e) => {
  console.error("[migrate] fatal:", e);
  process.exit(1);
});
