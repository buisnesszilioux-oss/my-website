import "dotenv/config";
import fs from "fs";
import path from "path";
import { db } from "../server/db";
import {
  products,
  industries,
  standards,
  media,
  contactSubmissions,
  siteContent,
  pageSections,
  floatingImages,
  customers,
  ledgerEntries,
  users,
  adminUsers,
} from "../shared/schema";
import { asc } from "drizzle-orm";

const OUT_DIR = path.resolve("src/data/firestore-seed");
fs.mkdirSync(OUT_DIR, { recursive: true });

async function dump(name: string, rows: any[]) {
  const file = path.join(OUT_DIR, `${name}.json`);
  fs.writeFileSync(file, JSON.stringify(rows, null, 2));
  console.log(`wrote ${rows.length.toString().padStart(4)} rows -> ${file}`);
}

(async () => {
  await dump("products",         await db.select().from(products).orderBy(asc(products.sortOrder)));
  await dump("industries",       await db.select().from(industries).orderBy(asc(industries.sortOrder)));
  await dump("standards",        await db.select().from(standards).orderBy(asc(standards.sortOrder)));
  await dump("media",            await db.select().from(media).orderBy(asc(media.sortOrder)));
  await dump("contacts",         await db.select().from(contactSubmissions));
  await dump("siteContent",      await db.select().from(siteContent));
  await dump("pageSections",     await db.select().from(pageSections).orderBy(asc(pageSections.sortOrder)));
  await dump("floatingImages",   await db.select().from(floatingImages).orderBy(asc(floatingImages.sortOrder)));
  await dump("customers",        await db.select().from(customers));
  await dump("ledgerEntries",    await db.select().from(ledgerEntries));
  await dump("users",            await db.select().from(users));
  await dump("adminUsers",       await db.select().from(adminUsers));
  console.log("\nDone.");
  process.exit(0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
