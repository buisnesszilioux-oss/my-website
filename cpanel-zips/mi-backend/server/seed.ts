import "dotenv/config";
import { db } from "./db";
import { products, industries, standards } from "../shared/schema";
import { productsSeed, industriesSeed, standardsSeed } from "./seed-data";
import { categoryProductsSeed } from "./seed-categories";
import { sql } from "drizzle-orm";

// Merge legacy seed + new category seed, dedup by slug (category seed wins)
const mergedProductsSeed = (() => {
  const map = new Map<string, any>();
  for (const p of productsSeed) map.set(p.slug, p);
  for (const p of categoryProductsSeed) map.set(p.slug, p);
  return Array.from(map.values());
})();

async function main() {
  const force = process.argv.includes("--force");

  const [{ count: pCount }] = (await db.execute(sql`select count(*)::int as count from products`)).rows as any[];
  if (pCount === 0 || force) {
    if (force) await db.delete(products);
    for (const p of mergedProductsSeed) await db.insert(products).values(p as any);
    console.log(`[seed] products: ${mergedProductsSeed.length}`);
  } else {
    // Top-up: add any products from the merged seed whose slug doesn't yet exist.
    const existing = (await db.execute(sql`select slug from products`)).rows as any[];
    const have = new Set(existing.map((r) => r.slug));
    const missing = mergedProductsSeed.filter((p) => !have.has(p.slug));
    for (const p of missing) await db.insert(products).values(p as any);
    if (missing.length > 0) console.log(`[seed] products top-up: +${missing.length}`);
    else console.log(`[seed] products already populated (${pCount}), skip`);
  }

  const [{ count: iCount }] = (await db.execute(sql`select count(*)::int as count from industries`)).rows as any[];
  if (iCount === 0 || force) {
    if (force) await db.delete(industries);
    for (const i of industriesSeed) await db.insert(industries).values(i as any);
    console.log(`[seed] industries: ${industriesSeed.length}`);
  } else console.log(`[seed] industries already populated (${iCount}), skip`);

  const [{ count: sCount }] = (await db.execute(sql`select count(*)::int as count from standards`)).rows as any[];
  if (sCount === 0 || force) {
    if (force) await db.delete(standards);
    for (const s of standardsSeed) await db.insert(standards).values(s as any);
    console.log(`[seed] standards: ${standardsSeed.length}`);
  } else console.log(`[seed] standards already populated (${sCount}), skip`);

  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
