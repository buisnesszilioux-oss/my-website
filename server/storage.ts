import { db } from "./db";
import { adminUsers, products, industries, standards, contactSubmissions, media, siteContent, pageSections, ledgerEntries, customers } from "../shared/schema";
import { eq, asc, desc } from "drizzle-orm";
import type { InsertProduct, InsertIndustry, InsertStandard, InsertContact, InsertMedia, InsertSiteContent, InsertPageSection, InsertLedger, InsertCustomer } from "../shared/schema";

export const storage = {
  // Admin
  getAdminByUsername: (username: string) =>
    db.select().from(adminUsers).where(eq(adminUsers.username, username)).then((r) => r[0]),
  createAdmin: (username: string, passwordHash: string) =>
    db.insert(adminUsers).values({ username, passwordHash }).returning().then((r) => r[0]),
  updateAdminPassword: (id: number, passwordHash: string) =>
    db.update(adminUsers).set({ passwordHash }).where(eq(adminUsers.id, id)).returning().then((r) => r[0]),
  deleteAllAdmins: () => db.delete(adminUsers),

  // Media
  listMedia: () => db.select().from(media).orderBy(asc(media.sortOrder)),
  createMedia: (data: InsertMedia) => db.insert(media).values(data).returning().then((r) => r[0]),
  updateMedia: (id: number, data: Partial<InsertMedia>) =>
    db.update(media).set(data).where(eq(media.id, id)).returning().then((r) => r[0]),
  deleteMedia: (id: number) => db.delete(media).where(eq(media.id, id)),

  // Products
  listProducts: () => db.select().from(products).orderBy(asc(products.sortOrder)),
  getProduct: (slug: string) => db.select().from(products).where(eq(products.slug, slug)).then((r) => r[0]),
  upsertProduct: async (data: InsertProduct) => {
    const existing = await db.select().from(products).where(eq(products.slug, data.slug)).then((r) => r[0]);
    if (existing) return db.update(products).set(data).where(eq(products.id, existing.id)).returning().then((r) => r[0]);
    return db.insert(products).values(data).returning().then((r) => r[0]);
  },
  updateProduct: (id: number, data: Partial<InsertProduct>) =>
    db.update(products).set(data).where(eq(products.id, id)).returning().then((r) => r[0]),
  deleteProduct: (id: number) => db.delete(products).where(eq(products.id, id)),

  // Industries
  listIndustries: () => db.select().from(industries).orderBy(asc(industries.sortOrder)),
  getIndustry: (slug: string) => db.select().from(industries).where(eq(industries.slug, slug)).then((r) => r[0]),
  upsertIndustry: async (data: InsertIndustry) => {
    const existing = await db.select().from(industries).where(eq(industries.slug, data.slug)).then((r) => r[0]);
    if (existing) return db.update(industries).set(data).where(eq(industries.id, existing.id)).returning().then((r) => r[0]);
    return db.insert(industries).values(data).returning().then((r) => r[0]);
  },
  updateIndustry: (id: number, data: Partial<InsertIndustry>) =>
    db.update(industries).set(data).where(eq(industries.id, id)).returning().then((r) => r[0]),
  deleteIndustry: (id: number) => db.delete(industries).where(eq(industries.id, id)),

  // Standards
  listStandards: () => db.select().from(standards).orderBy(asc(standards.sortOrder)),
  getStandard: (slug: string) => db.select().from(standards).where(eq(standards.slug, slug)).then((r) => r[0]),
  upsertStandard: async (data: InsertStandard) => {
    const existing = await db.select().from(standards).where(eq(standards.slug, data.slug)).then((r) => r[0]);
    if (existing) return db.update(standards).set(data).where(eq(standards.id, existing.id)).returning().then((r) => r[0]);
    return db.insert(standards).values(data).returning().then((r) => r[0]);
  },
  updateStandard: (id: number, data: Partial<InsertStandard>) =>
    db.update(standards).set(data).where(eq(standards.id, id)).returning().then((r) => r[0]),
  deleteStandard: (id: number) => db.delete(standards).where(eq(standards.id, id)),

  // Contact
  createContact: (data: InsertContact) =>
    db.insert(contactSubmissions).values(data).returning().then((r) => r[0]),
  listContacts: () => db.select().from(contactSubmissions).orderBy(desc(contactSubmissions.createdAt)),
  deleteContact: (id: number) => db.delete(contactSubmissions).where(eq(contactSubmissions.id, id)),

  // Site content (key/value)
  listSiteContent: () => db.select().from(siteContent).orderBy(asc(siteContent.key)),
  getSiteContentMap: async () => {
    const rows = await db.select().from(siteContent);
    return rows.reduce<Record<string, string>>((m, r) => { m[r.key] = r.value; return m; }, {});
  },
  upsertSiteContent: async (data: InsertSiteContent) => {
    const existing = await db.select().from(siteContent).where(eq(siteContent.key, data.key)).then((r) => r[0]);
    if (existing) return db.update(siteContent).set({ value: data.value }).where(eq(siteContent.id, existing.id)).returning().then((r) => r[0]);
    return db.insert(siteContent).values(data).returning().then((r) => r[0]);
  },
  bulkUpsertSiteContent: async (entries: InsertSiteContent[]) => {
    for (const e of entries) await storage.upsertSiteContent(e);
    return storage.getSiteContentMap();
  },

  // Customers (Ledger / Khata)
  listCustomers: () => db.select().from(customers).orderBy(asc(customers.name)),
  getCustomer: (id: number) => db.select().from(customers).where(eq(customers.id, id)).then((r) => r[0]),
  createCustomer: (data: InsertCustomer) =>
    db.insert(customers).values(data).returning().then((r) => r[0]),
  updateCustomer: (id: number, data: Partial<InsertCustomer>) =>
    db.update(customers).set(data).where(eq(customers.id, id)).returning().then((r) => r[0]),
  deleteCustomer: async (id: number) => {
    await db.delete(ledgerEntries).where(eq(ledgerEntries.customerId, id));
    await db.delete(customers).where(eq(customers.id, id));
  },

  // Ledger / Khata entries
  listLedger: () => db.select().from(ledgerEntries).orderBy(desc(ledgerEntries.createdAt)),
  listLedgerByCustomer: (customerId: number) =>
    db.select().from(ledgerEntries).where(eq(ledgerEntries.customerId, customerId)).orderBy(desc(ledgerEntries.invoiceDate)),
  createLedger: (data: InsertLedger) =>
    db.insert(ledgerEntries).values(data).returning().then((r) => r[0]),
  updateLedger: (id: number, data: Partial<InsertLedger>) =>
    db.update(ledgerEntries).set(data).where(eq(ledgerEntries.id, id)).returning().then((r) => r[0]),
  deleteLedger: (id: number) => db.delete(ledgerEntries).where(eq(ledgerEntries.id, id)),

  // Page sections (custom homepage blocks)
  listPageSections: (page = "home") =>
    db.select().from(pageSections).where(eq(pageSections.page, page)).orderBy(asc(pageSections.sortOrder)),
  createPageSection: (data: InsertPageSection) =>
    db.insert(pageSections).values(data).returning().then((r) => r[0]),
  updatePageSection: (id: number, data: Partial<InsertPageSection>) =>
    db.update(pageSections).set(data).where(eq(pageSections.id, id)).returning().then((r) => r[0]),
  deletePageSection: (id: number) => db.delete(pageSections).where(eq(pageSections.id, id)),
};
