import { db } from "./db";
import { products, industries, standards } from "../shared/schema";
import { eq, sql } from "drizzle-orm";

export const PRODUCT_CATEGORIES = [
  "Bolts",
  "Nuts",
  "Screws",
  "Washers",
  "Rivets",
  "Threaded Rods / Studs",
  "Anchors",
  "Industrial / Heavy",
  "Special",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export function categorizeProductName(name: string): ProductCategory {
  const n = name.toLowerCase();
  if (/\banchor\b/.test(n)) return "Anchors";
  if (/(hsfg|high\s*tensile|structural|railway)/.test(n)) return "Industrial / Heavy";
  if (/(custom|cnc|precision|non[\s-]?standard|special)/.test(n)) return "Special";
  if (/\brivet/.test(n)) return "Rivets";
  if (/\bwasher/.test(n)) return "Washers";
  if (/\bnut\b/.test(n)) return "Nuts";
  if (/\bscrew/.test(n)) return "Screws";
  if (/(threaded\s*rod|\brod\b|\bstud\b)/.test(n) && !/stud\s*bolt/.test(n)) return "Threaded Rods / Studs";
  if (/stud\s*bolt/.test(n)) return "Threaded Rods / Studs";
  if (/\bbolt/.test(n)) return "Bolts";
  return "Special";
}

const PALETTES: { bg: string; fg: string }[] = [
  { bg: "1f2937", fg: "d4af37" },
  { bg: "0f172a", fg: "f59e0b" },
  { bg: "1e293b", fg: "fbbf24" },
  { bg: "111827", fg: "eab308" },
];

export function placeholderImage(name: string, slug = ""): string {
  const seed = (slug || name).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const p = PALETTES[seed % PALETTES.length];
  const txt = encodeURIComponent(name.replace(/\s+&\s+/g, " and ").slice(0, 40));
  return `https://placehold.co/1200x800/${p.bg}/${p.fg}/png?text=${txt}&font=roboto`;
}

function isBrokenUrl(url: string): boolean {
  if (!url) return false;
  return url.includes("source.unsplash.com");
}

/** Replace broken `source.unsplash.com` URLs with stable branded placeholders. */
export async function fixBrokenImages() {
  let fixed = 0;

  // Industries (top-level image + nested applications[].image)
  const inds = await db.select().from(industries);
  for (const ind of inds) {
    let dirty = false;
    let nextImage = ind.image;
    if (isBrokenUrl(ind.image)) {
      nextImage = placeholderImage(ind.name, ind.slug);
      dirty = true;
    }
    let apps: any[] = (ind.applications as any) || [];
    if (Array.isArray(apps)) {
      apps = apps.map((a) => {
        if (a && typeof a === "object" && isBrokenUrl(a.image)) {
          return { ...a, image: placeholderImage(a.name || ind.name, ind.slug) };
        }
        return a;
      });
      const before = JSON.stringify((ind.applications as any) || []);
      const after = JSON.stringify(apps);
      if (before !== after) dirty = true;
    }
    if (dirty) {
      await db.update(industries).set({ image: nextImage, applications: apps }).where(eq(industries.id, ind.id));
      fixed++;
    }
  }

  // Standards
  const stds = await db.select().from(standards);
  for (const s of stds) {
    if (isBrokenUrl(s.image)) {
      await db.update(standards).set({ image: placeholderImage(s.code || s.name, s.slug) }).where(eq(standards.id, s.id));
      fixed++;
    }
  }

  // Products
  const prods = await db.select().from(products);
  for (const p of prods) {
    if (isBrokenUrl(p.image)) {
      await db.update(products).set({ image: placeholderImage(p.name, p.slug) }).where(eq(products.id, p.id));
      fixed++;
    }
  }

  if (fixed > 0) console.log(`[data-fix] fixed ${fixed} broken image reference(s)`);
}

/** Backfill `category` for products whose category is empty / default-Bolts but doesn't actually match. */
export async function backfillProductCategories() {
  const rows = await db.select().from(products);
  let updated = 0;
  for (const p of rows) {
    const correct = categorizeProductName(p.name);
    if (!p.category || p.category !== correct) {
      await db.update(products).set({ category: correct }).where(eq(products.id, p.id));
      updated++;
    }
  }
  if (updated > 0) console.log(`[data-fix] backfilled categories for ${updated} product(s)`);
}

/**
 * Reset every `id` SERIAL sequence to (MAX(id) + 1) so future INSERTs never
 * collide with rows imported from a seed dump or restored backup.
 *
 * Why this matters: the original cPanel-side bug was caused by drifted Postgres
 * sequences — seed data inserted rows with explicit ids like 1..50 but the
 * sequence still started at 1, so the very first admin save threw a duplicate
 * primary-key error. Running this once on every boot keeps Replit/cPanel/any
 * fresh database self-healing.
 */
export async function fixIdSequences() {
  const tables = [
    "products", "industries", "standards", "site_content", "page_sections",
    "media", "floating_images", "customers", "ledger_entries",
    "contact_submissions", "admin_users", "users",
  ];
  let fixed = 0;
  for (const t of tables) {
    try {
      await db.execute(sql.raw(
        `SELECT setval(pg_get_serial_sequence('${t}', 'id'), COALESCE((SELECT MAX(id) FROM ${t}), 0) + 1, false)`
      ));
      fixed++;
    } catch {
      /* table missing or no serial id — ignore */
    }
  }
  if (fixed > 0) console.log(`[data-fix] reset id sequences for ${fixed} table(s)`);
}

export async function runDataFixes() {
  try {
    await fixIdSequences();
    await fixBrokenImages();
    await backfillProductCategories();
  } catch (e) {
    console.warn("[data-fix] failed:", (e as Error).message);
  }
}
