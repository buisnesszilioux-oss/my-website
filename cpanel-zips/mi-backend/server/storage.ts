import { db } from "./db";
import { adminUsers, users, products, industries, standards, contactSubmissions, media, siteContent, pageSections, ledgerEntries, customers, floatingImages } from "../shared/schema";
import { eq, asc, desc } from "drizzle-orm";
import type { InsertProduct, InsertIndustry, InsertStandard, InsertContact, InsertMedia, InsertSiteContent, InsertPageSection, InsertLedger, InsertCustomer, InsertFloatingImage } from "../shared/schema";

export const storage = {
  // Admin
  getAdminByUsername: (username: string) =>
    db.select().from(adminUsers).where(eq(adminUsers.username, username)).then((r) => r[0]),
  createAdmin: (username: string, passwordHash: string) =>
    db.insert(adminUsers).values({ username, passwordHash }).returning().then((r) => r[0]),
  updateAdminPassword: (id: number, passwordHash: string) =>
    db.update(adminUsers).set({ passwordHash }).where(eq(adminUsers.id, id)).returning().then((r) => r[0]),
  deleteAllAdmins: () => db.delete(adminUsers),

  // Users (normal customer accounts)
  getUserByEmail: (email: string) =>
    db.select().from(users).where(eq(users.email, email)).then((r) => r[0]),
  getUserById: (id: number) =>
    db.select().from(users).where(eq(users.id, id)).then((r) => r[0]),
  createUser: (data: { email: string; name: string; phone?: string; company?: string; passwordHash?: string; provider?: string; picture?: string }) =>
    db.insert(users).values({
      email: data.email,
      name: data.name,
      phone: data.phone ?? "",
      company: data.company ?? "",
      passwordHash: data.passwordHash ?? "",
      provider: data.provider ?? "password",
      picture: data.picture ?? "",
    }).returning().then((r) => r[0]),
  updateUser: (id: number, data: Partial<{ name: string; phone: string; company: string; picture: string }>) =>
    db.update(users).set(data).where(eq(users.id, id)).returning().then((r) => r[0]),

  // Media
  listMedia: () => db.select().from(media).orderBy(asc(media.sortOrder)),
  createMedia: (data: InsertMedia) => db.insert(media).values(data).returning().then((r) => r[0]),
  updateMedia: (id: number, data: Partial<InsertMedia>) =>
    db.update(media).set(data).where(eq(media.id, id)).returning().then((r) => r[0]),
  deleteMedia: (id: number) => db.delete(media).where(eq(media.id, id)),

  // Products — uses ON CONFLICT on slug so saves never fail due to id sequence drift
  listProducts: () => db.select().from(products).orderBy(asc(products.sortOrder)),
  getProduct: (slug: string) => db.select().from(products).where(eq(products.slug, slug)).then((r) => r[0]),
  upsertProduct: async (data: InsertProduct) =>
    db.insert(products)
      .values(data)
      .onConflictDoUpdate({ target: products.slug, set: data })
      .returning()
      .then((r) => r[0]),
  updateProduct: (id: number, data: Partial<InsertProduct>) =>
    db.update(products).set(data).where(eq(products.id, id)).returning().then((r) => r[0]),
  deleteProduct: (id: number) => db.delete(products).where(eq(products.id, id)),

  // Industries
  listIndustries: () => db.select().from(industries).orderBy(asc(industries.sortOrder)),
  getIndustry: (slug: string) => db.select().from(industries).where(eq(industries.slug, slug)).then((r) => r[0]),
  upsertIndustry: async (data: InsertIndustry) =>
    db.insert(industries)
      .values(data)
      .onConflictDoUpdate({ target: industries.slug, set: data })
      .returning()
      .then((r) => r[0]),
  updateIndustry: (id: number, data: Partial<InsertIndustry>) =>
    db.update(industries).set(data).where(eq(industries.id, id)).returning().then((r) => r[0]),
  deleteIndustry: (id: number) => db.delete(industries).where(eq(industries.id, id)),

  // Standards
  listStandards: () => db.select().from(standards).orderBy(asc(standards.sortOrder)),
  getStandard: (slug: string) => db.select().from(standards).where(eq(standards.slug, slug)).then((r) => r[0]),
  upsertStandard: async (data: InsertStandard) =>
    db.insert(standards)
      .values(data)
      .onConflictDoUpdate({ target: standards.slug, set: data })
      .returning()
      .then((r) => r[0]),
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
    return db.insert(siteContent)
      .values(data)
      .onConflictDoUpdate({ target: siteContent.key, set: { value: data.value } })
      .returning()
      .then((r) => r[0]);
  },
  bulkUpsertSiteContent: async (entries: InsertSiteContent[]) => {
    for (const e of entries) {
      await db.insert(siteContent)
        .values(e)
        .onConflictDoUpdate({ target: siteContent.key, set: { value: e.value } });
    }
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

  // Floating images (premium animated overlay images on the hero)
  listFloatingImages: () => db.select().from(floatingImages).orderBy(asc(floatingImages.sortOrder)),
  listEnabledFloatingImages: () =>
    db.select().from(floatingImages).where(eq(floatingImages.enabled, true)).orderBy(asc(floatingImages.sortOrder)),
  createFloatingImage: (data: InsertFloatingImage) =>
    db.insert(floatingImages).values(data).returning().then((r) => r[0]),
  updateFloatingImage: (id: number, data: Partial<InsertFloatingImage>) =>
    db.update(floatingImages).set(data).where(eq(floatingImages.id, id)).returning().then((r) => r[0]),
  deleteFloatingImage: (id: number) => db.delete(floatingImages).where(eq(floatingImages.id, id)),

  // Page sections (custom homepage blocks)
  listPageSections: (page = "home") =>
    db.select().from(pageSections).where(eq(pageSections.page, page)).orderBy(asc(pageSections.sortOrder)),
  createPageSection: (data: InsertPageSection) =>
    db.insert(pageSections).values(data).returning().then((r) => r[0]),
  updatePageSection: (id: number, data: Partial<InsertPageSection>) =>
    db.update(pageSections).set(data).where(eq(pageSections.id, id)).returning().then((r) => r[0]),
  deletePageSection: (id: number) => db.delete(pageSections).where(eq(pageSections.id, id)),
};
