var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc2) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc(from, key)) || desc2.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  MEDIA_CATEGORIES: () => MEDIA_CATEGORIES,
  adminUsers: () => adminUsers,
  contactSubmissions: () => contactSubmissions,
  customers: () => customers,
  floatingImages: () => floatingImages,
  industries: () => industries,
  insertContactSchema: () => insertContactSchema,
  insertCustomerSchema: () => insertCustomerSchema,
  insertFloatingImageSchema: () => insertFloatingImageSchema,
  insertIndustrySchema: () => insertIndustrySchema,
  insertLedgerSchema: () => insertLedgerSchema,
  insertMediaSchema: () => insertMediaSchema,
  insertPageSectionSchema: () => insertPageSectionSchema,
  insertProductSchema: () => insertProductSchema,
  insertSiteContentSchema: () => insertSiteContentSchema,
  insertStandardSchema: () => insertStandardSchema,
  insertUserSchema: () => insertUserSchema,
  ledgerEntries: () => ledgerEntries,
  loginUserSchema: () => loginUserSchema,
  media: () => media,
  pageSections: () => pageSections,
  products: () => products,
  siteContent: () => siteContent,
  standards: () => standards,
  users: () => users
});
var import_pg_core, import_drizzle_zod, import_zod, adminUsers, users, insertUserSchema, loginUserSchema, products, industries, standards, media, MEDIA_CATEGORIES, contactSubmissions, siteContent, pageSections, insertMediaSchema, insertProductSchema, insertIndustrySchema, insertStandardSchema, insertContactSchema, insertSiteContentSchema, customers, insertCustomerSchema, ledgerEntries, insertLedgerSchema, floatingImages, insertFloatingImageSchema, insertPageSectionSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    import_pg_core = require("drizzle-orm/pg-core");
    import_drizzle_zod = require("drizzle-zod");
    import_zod = require("zod");
    adminUsers = (0, import_pg_core.pgTable)("admin_users", {
      id: (0, import_pg_core.serial)("id").primaryKey(),
      username: (0, import_pg_core.varchar)("username", { length: 64 }).notNull().unique(),
      passwordHash: (0, import_pg_core.text)("password_hash").notNull()
    });
    users = (0, import_pg_core.pgTable)("users", {
      id: (0, import_pg_core.serial)("id").primaryKey(),
      email: (0, import_pg_core.varchar)("email", { length: 128 }).notNull().unique(),
      name: (0, import_pg_core.text)("name").notNull(),
      phone: (0, import_pg_core.text)("phone").notNull().default(""),
      company: (0, import_pg_core.text)("company").notNull().default(""),
      passwordHash: (0, import_pg_core.text)("password_hash").notNull().default(""),
      provider: (0, import_pg_core.varchar)("provider", { length: 16 }).notNull().default("password"),
      picture: (0, import_pg_core.text)("picture").notNull().default(""),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
    });
    insertUserSchema = import_zod.z.object({
      email: import_zod.z.string().email("Valid email required").transform((v) => v.trim().toLowerCase()),
      name: import_zod.z.string().min(2, "Name is required"),
      phone: import_zod.z.string().optional().default(""),
      company: import_zod.z.string().optional().default(""),
      password: import_zod.z.string().min(6, "Password must be at least 6 characters")
    });
    loginUserSchema = import_zod.z.object({
      email: import_zod.z.string().email("Valid email required").transform((v) => v.trim().toLowerCase()),
      password: import_zod.z.string().min(1, "Password is required")
    });
    products = (0, import_pg_core.pgTable)("products", {
      id: (0, import_pg_core.serial)("id").primaryKey(),
      slug: (0, import_pg_core.varchar)("slug", { length: 128 }).notNull().unique(),
      name: (0, import_pg_core.text)("name").notNull(),
      image: (0, import_pg_core.text)("image").notNull(),
      standard: (0, import_pg_core.text)("standard").notNull(),
      category: (0, import_pg_core.text)("category").notNull().default("Bolts"),
      description: (0, import_pg_core.text)("description").notNull(),
      sizes: (0, import_pg_core.text)("sizes").notNull().default(""),
      threads: (0, import_pg_core.text)("threads").notNull().default(""),
      length: (0, import_pg_core.text)("length").notNull().default(""),
      material: (0, import_pg_core.text)("material").notNull().default(""),
      finish: (0, import_pg_core.text)("finish").array().notNull().default([]),
      grades: (0, import_pg_core.text)("grades").array().notNull().default([]),
      applications: (0, import_pg_core.text)("applications").array().notNull().default([]),
      dimensions: (0, import_pg_core.jsonb)("dimensions").notNull().default([]),
      sortOrder: (0, import_pg_core.serial)("sort_order")
    });
    industries = (0, import_pg_core.pgTable)("industries", {
      id: (0, import_pg_core.serial)("id").primaryKey(),
      slug: (0, import_pg_core.varchar)("slug", { length: 128 }).notNull().unique(),
      name: (0, import_pg_core.text)("name").notNull(),
      description: (0, import_pg_core.text)("description").notNull(),
      heroDescription: (0, import_pg_core.text)("hero_description").notNull().default(""),
      image: (0, import_pg_core.text)("image").notNull(),
      grades: (0, import_pg_core.jsonb)("grades").notNull().default([]),
      applications: (0, import_pg_core.jsonb)("applications").notNull().default([]),
      keyRequirements: (0, import_pg_core.text)("key_requirements").array().notNull().default([]),
      sortOrder: (0, import_pg_core.serial)("sort_order")
    });
    standards = (0, import_pg_core.pgTable)("standards", {
      id: (0, import_pg_core.serial)("id").primaryKey(),
      slug: (0, import_pg_core.varchar)("slug", { length: 128 }).notNull().unique(),
      code: (0, import_pg_core.text)("code").notNull(),
      name: (0, import_pg_core.text)("name").notNull(),
      region: (0, import_pg_core.text)("region").notNull().default(""),
      description: (0, import_pg_core.text)("description").notNull(),
      image: (0, import_pg_core.text)("image").notNull().default(""),
      scope: (0, import_pg_core.text)("scope").notNull().default(""),
      applications: (0, import_pg_core.text)("applications").array().notNull().default([]),
      materials: (0, import_pg_core.text)("materials").array().notNull().default([]),
      examples: (0, import_pg_core.text)("examples").array().notNull().default([]),
      sortOrder: (0, import_pg_core.serial)("sort_order")
    });
    media = (0, import_pg_core.pgTable)("media", {
      id: (0, import_pg_core.serial)("id").primaryKey(),
      type: (0, import_pg_core.varchar)("type", { length: 16 }).notNull(),
      category: (0, import_pg_core.varchar)("category", { length: 24 }).notNull().default("gallery"),
      url: (0, import_pg_core.text)("url").notNull(),
      title: (0, import_pg_core.text)("title").notNull().default(""),
      caption: (0, import_pg_core.text)("caption").notNull().default(""),
      thumbnail: (0, import_pg_core.text)("thumbnail").notNull().default(""),
      sortOrder: (0, import_pg_core.serial)("sort_order")
    });
    MEDIA_CATEGORIES = ["hero", "product", "banner", "gallery"];
    contactSubmissions = (0, import_pg_core.pgTable)("contact_submissions", {
      id: (0, import_pg_core.serial)("id").primaryKey(),
      fullName: (0, import_pg_core.text)("full_name").notNull(),
      email: (0, import_pg_core.text)("email").notNull(),
      phone: (0, import_pg_core.text)("phone").notNull(),
      companyName: (0, import_pg_core.text)("company_name").notNull().default(""),
      message: (0, import_pg_core.text)("message").notNull(),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
    });
    siteContent = (0, import_pg_core.pgTable)("site_content", {
      id: (0, import_pg_core.serial)("id").primaryKey(),
      key: (0, import_pg_core.varchar)("key", { length: 128 }).notNull().unique(),
      value: (0, import_pg_core.text)("value").notNull().default("")
    });
    pageSections = (0, import_pg_core.pgTable)("page_sections", {
      id: (0, import_pg_core.serial)("id").primaryKey(),
      page: (0, import_pg_core.varchar)("page", { length: 64 }).notNull().default("home"),
      position: (0, import_pg_core.varchar)("position", { length: 64 }).notNull().default("after-stats"),
      title: (0, import_pg_core.text)("title").notNull().default(""),
      subtitle: (0, import_pg_core.text)("subtitle").notNull().default(""),
      body: (0, import_pg_core.text)("body").notNull().default(""),
      image: (0, import_pg_core.text)("image").notNull().default(""),
      linkText: (0, import_pg_core.text)("link_text").notNull().default(""),
      linkUrl: (0, import_pg_core.text)("link_url").notNull().default(""),
      enabled: (0, import_pg_core.boolean)("enabled").notNull().default(true),
      sortOrder: (0, import_pg_core.serial)("sort_order")
    });
    insertMediaSchema = (0, import_drizzle_zod.createInsertSchema)(media).omit({ id: true, sortOrder: true });
    insertProductSchema = (0, import_drizzle_zod.createInsertSchema)(products).omit({ id: true, sortOrder: true });
    insertIndustrySchema = (0, import_drizzle_zod.createInsertSchema)(industries).omit({ id: true, sortOrder: true });
    insertStandardSchema = (0, import_drizzle_zod.createInsertSchema)(standards).omit({ id: true, sortOrder: true });
    insertContactSchema = import_zod.z.object({
      fullName: import_zod.z.string().min(2, "Full name is required"),
      email: import_zod.z.string().email("Valid email required"),
      phone: import_zod.z.string().min(7, "Phone is required"),
      companyName: import_zod.z.string().optional().default(""),
      message: import_zod.z.string().min(5, "Message is required")
    });
    insertSiteContentSchema = import_zod.z.object({
      key: import_zod.z.string().min(1),
      value: import_zod.z.string().default("")
    });
    customers = (0, import_pg_core.pgTable)("customers", {
      id: (0, import_pg_core.serial)("id").primaryKey(),
      name: (0, import_pg_core.text)("name").notNull(),
      phone: (0, import_pg_core.text)("phone").notNull().default(""),
      address: (0, import_pg_core.text)("address").notNull().default(""),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
    });
    insertCustomerSchema = import_zod.z.object({
      name: import_zod.z.string().min(1, "Customer name is required"),
      phone: import_zod.z.string().optional().default(""),
      address: import_zod.z.string().optional().default("")
    });
    ledgerEntries = (0, import_pg_core.pgTable)("ledger_entries", {
      id: (0, import_pg_core.serial)("id").primaryKey(),
      customerId: (0, import_pg_core.integer)("customer_id"),
      customerName: (0, import_pg_core.text)("customer_name").notNull(),
      invoiceDate: (0, import_pg_core.text)("invoice_date").notNull().default(""),
      invoiceNo: (0, import_pg_core.text)("invoice_no").notNull().default(""),
      amountDue: (0, import_pg_core.text)("amount_due").notNull().default("0"),
      paymentDate: (0, import_pg_core.text)("payment_date").notNull().default(""),
      amountReceived: (0, import_pg_core.text)("amount_received").notNull().default("0"),
      receiptNo: (0, import_pg_core.text)("receipt_no").notNull().default(""),
      notes: (0, import_pg_core.text)("notes").notNull().default(""),
      tallyReceiptDone: (0, import_pg_core.boolean)("tally_receipt_done").notNull().default(false),
      bookEntryDone: (0, import_pg_core.boolean)("book_entry_done").notNull().default(false),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
    });
    insertLedgerSchema = import_zod.z.object({
      customerId: import_zod.z.number().int().positive("Customer is required"),
      customerName: import_zod.z.string().min(1, "Customer name is required"),
      invoiceDate: import_zod.z.string().optional().default(""),
      invoiceNo: import_zod.z.string().optional().default(""),
      amountDue: import_zod.z.string().optional().default("0"),
      paymentDate: import_zod.z.string().optional().default(""),
      amountReceived: import_zod.z.string().optional().default("0"),
      receiptNo: import_zod.z.string().optional().default(""),
      notes: import_zod.z.string().optional().default(""),
      tallyReceiptDone: import_zod.z.boolean().optional().default(false),
      bookEntryDone: import_zod.z.boolean().optional().default(false)
    });
    floatingImages = (0, import_pg_core.pgTable)("floating_images", {
      id: (0, import_pg_core.serial)("id").primaryKey(),
      url: (0, import_pg_core.text)("url").notNull(),
      title: (0, import_pg_core.text)("title").notNull().default(""),
      enabled: (0, import_pg_core.boolean)("enabled").notNull().default(true),
      duration: (0, import_pg_core.integer)("duration").notNull().default(6),
      // seconds for one full float cycle
      delay: (0, import_pg_core.integer)("delay").notNull().default(0),
      // seconds before animation starts
      positionX: (0, import_pg_core.integer)("position_x").notNull().default(50),
      // 0-100 (% from left)
      positionY: (0, import_pg_core.integer)("position_y").notNull().default(50),
      // 0-100 (% from top)
      size: (0, import_pg_core.integer)("size").notNull().default(120),
      // px width
      sortOrder: (0, import_pg_core.serial)("sort_order")
    });
    insertFloatingImageSchema = import_zod.z.object({
      url: import_zod.z.string().min(1, "Image URL is required"),
      title: import_zod.z.string().optional().default(""),
      enabled: import_zod.z.boolean().optional().default(true),
      duration: import_zod.z.number().int().min(2).max(30).optional().default(6),
      delay: import_zod.z.number().int().min(0).max(20).optional().default(0),
      positionX: import_zod.z.number().int().min(0).max(100).optional().default(50),
      positionY: import_zod.z.number().int().min(0).max(100).optional().default(50),
      size: import_zod.z.number().int().min(40).max(400).optional().default(120)
    });
    insertPageSectionSchema = import_zod.z.object({
      page: import_zod.z.string().default("home"),
      position: import_zod.z.string().default("after-stats"),
      title: import_zod.z.string().default(""),
      subtitle: import_zod.z.string().default(""),
      body: import_zod.z.string().default(""),
      image: import_zod.z.string().default(""),
      linkText: import_zod.z.string().default(""),
      linkUrl: import_zod.z.string().default(""),
      enabled: import_zod.z.boolean().default(true)
    });
  }
});

// server/index.ts
var server_exports = {};
__export(server_exports, {
  default: () => server_default
});
module.exports = __toCommonJS(server_exports);
var import_config2 = require("dotenv/config");
var import_express = __toESM(require("express"), 1);
var import_cors = __toESM(require("cors"), 1);
var import_path2 = __toESM(require("path"), 1);
var import_fs2 = __toESM(require("fs"), 1);
var import_multer = __toESM(require("multer"), 1);

// server/db.ts
var import_config = require("dotenv/config");
var import_node_postgres = require("drizzle-orm/node-postgres");
var import_pg = __toESM(require("pg"), 1);
init_schema();
var { Pool } = import_pg.default;
if (!process.env.DATABASE_URL) {
  console.error(
    "[db] WARNING: DATABASE_URL is not set.\n     Admin login will use the ADMIN_PASSWORD env var as fallback.\n     To enable full database features on Vercel, set DATABASE_URL to a\n     public PostgreSQL URL (e.g. Neon: https://neon.tech, Supabase: https://supabase.com)"
  );
}
var pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://none:none@127.0.0.1:5432/none",
  // Keep timeouts short on serverless — Vercel functions timeout at 10s by default.
  connectionTimeoutMillis: 5e3,
  idleTimeoutMillis: 8e3,
  max: 3
});
pool.on("error", (err) => {
  console.error("[db] Pool error:", err.message);
});
var db = (0, import_node_postgres.drizzle)(pool, { schema: schema_exports });

// server/storage.ts
init_schema();
var import_drizzle_orm = require("drizzle-orm");
var storage = {
  // Admin
  getAdminByUsername: (username) => db.select().from(adminUsers).where((0, import_drizzle_orm.eq)(adminUsers.username, username)).then((r) => r[0]),
  createAdmin: (username, passwordHash) => db.insert(adminUsers).values({ username, passwordHash }).returning().then((r) => r[0]),
  updateAdminPassword: (id, passwordHash) => db.update(adminUsers).set({ passwordHash }).where((0, import_drizzle_orm.eq)(adminUsers.id, id)).returning().then((r) => r[0]),
  deleteAllAdmins: () => db.delete(adminUsers),
  // Users (normal customer accounts)
  getUserByEmail: (email) => db.select().from(users).where((0, import_drizzle_orm.eq)(users.email, email)).then((r) => r[0]),
  getUserById: (id) => db.select().from(users).where((0, import_drizzle_orm.eq)(users.id, id)).then((r) => r[0]),
  createUser: (data) => db.insert(users).values({
    email: data.email,
    name: data.name,
    phone: data.phone ?? "",
    company: data.company ?? "",
    passwordHash: data.passwordHash ?? "",
    provider: data.provider ?? "password",
    picture: data.picture ?? ""
  }).returning().then((r) => r[0]),
  updateUser: (id, data) => db.update(users).set(data).where((0, import_drizzle_orm.eq)(users.id, id)).returning().then((r) => r[0]),
  // Media
  listMedia: () => db.select().from(media).orderBy((0, import_drizzle_orm.asc)(media.sortOrder)),
  createMedia: (data) => db.insert(media).values(data).returning().then((r) => r[0]),
  updateMedia: (id, data) => db.update(media).set(data).where((0, import_drizzle_orm.eq)(media.id, id)).returning().then((r) => r[0]),
  deleteMedia: (id) => db.delete(media).where((0, import_drizzle_orm.eq)(media.id, id)),
  // Products
  listProducts: () => db.select().from(products).orderBy((0, import_drizzle_orm.asc)(products.sortOrder)),
  getProduct: (slug) => db.select().from(products).where((0, import_drizzle_orm.eq)(products.slug, slug)).then((r) => r[0]),
  upsertProduct: async (data) => {
    const existing = await db.select().from(products).where((0, import_drizzle_orm.eq)(products.slug, data.slug)).then((r) => r[0]);
    if (existing) return db.update(products).set(data).where((0, import_drizzle_orm.eq)(products.id, existing.id)).returning().then((r) => r[0]);
    return db.insert(products).values(data).returning().then((r) => r[0]);
  },
  updateProduct: (id, data) => db.update(products).set(data).where((0, import_drizzle_orm.eq)(products.id, id)).returning().then((r) => r[0]),
  deleteProduct: (id) => db.delete(products).where((0, import_drizzle_orm.eq)(products.id, id)),
  // Industries
  listIndustries: () => db.select().from(industries).orderBy((0, import_drizzle_orm.asc)(industries.sortOrder)),
  getIndustry: (slug) => db.select().from(industries).where((0, import_drizzle_orm.eq)(industries.slug, slug)).then((r) => r[0]),
  upsertIndustry: async (data) => {
    const existing = await db.select().from(industries).where((0, import_drizzle_orm.eq)(industries.slug, data.slug)).then((r) => r[0]);
    if (existing) return db.update(industries).set(data).where((0, import_drizzle_orm.eq)(industries.id, existing.id)).returning().then((r) => r[0]);
    return db.insert(industries).values(data).returning().then((r) => r[0]);
  },
  updateIndustry: (id, data) => db.update(industries).set(data).where((0, import_drizzle_orm.eq)(industries.id, id)).returning().then((r) => r[0]),
  deleteIndustry: (id) => db.delete(industries).where((0, import_drizzle_orm.eq)(industries.id, id)),
  // Standards
  listStandards: () => db.select().from(standards).orderBy((0, import_drizzle_orm.asc)(standards.sortOrder)),
  getStandard: (slug) => db.select().from(standards).where((0, import_drizzle_orm.eq)(standards.slug, slug)).then((r) => r[0]),
  upsertStandard: async (data) => {
    const existing = await db.select().from(standards).where((0, import_drizzle_orm.eq)(standards.slug, data.slug)).then((r) => r[0]);
    if (existing) return db.update(standards).set(data).where((0, import_drizzle_orm.eq)(standards.id, existing.id)).returning().then((r) => r[0]);
    return db.insert(standards).values(data).returning().then((r) => r[0]);
  },
  updateStandard: (id, data) => db.update(standards).set(data).where((0, import_drizzle_orm.eq)(standards.id, id)).returning().then((r) => r[0]),
  deleteStandard: (id) => db.delete(standards).where((0, import_drizzle_orm.eq)(standards.id, id)),
  // Contact
  createContact: (data) => db.insert(contactSubmissions).values(data).returning().then((r) => r[0]),
  listContacts: () => db.select().from(contactSubmissions).orderBy((0, import_drizzle_orm.desc)(contactSubmissions.createdAt)),
  deleteContact: (id) => db.delete(contactSubmissions).where((0, import_drizzle_orm.eq)(contactSubmissions.id, id)),
  // Site content (key/value)
  listSiteContent: () => db.select().from(siteContent).orderBy((0, import_drizzle_orm.asc)(siteContent.key)),
  getSiteContentMap: async () => {
    const rows = await db.select().from(siteContent);
    return rows.reduce((m, r) => {
      m[r.key] = r.value;
      return m;
    }, {});
  },
  upsertSiteContent: async (data) => {
    return db.insert(siteContent).values(data).onConflictDoUpdate({ target: siteContent.key, set: { value: data.value } }).returning().then((r) => r[0]);
  },
  bulkUpsertSiteContent: async (entries) => {
    for (const e of entries) {
      await db.insert(siteContent).values(e).onConflictDoUpdate({ target: siteContent.key, set: { value: e.value } });
    }
    return storage.getSiteContentMap();
  },
  // Customers (Ledger / Khata)
  listCustomers: () => db.select().from(customers).orderBy((0, import_drizzle_orm.asc)(customers.name)),
  getCustomer: (id) => db.select().from(customers).where((0, import_drizzle_orm.eq)(customers.id, id)).then((r) => r[0]),
  createCustomer: (data) => db.insert(customers).values(data).returning().then((r) => r[0]),
  updateCustomer: (id, data) => db.update(customers).set(data).where((0, import_drizzle_orm.eq)(customers.id, id)).returning().then((r) => r[0]),
  deleteCustomer: async (id) => {
    await db.delete(ledgerEntries).where((0, import_drizzle_orm.eq)(ledgerEntries.customerId, id));
    await db.delete(customers).where((0, import_drizzle_orm.eq)(customers.id, id));
  },
  // Ledger / Khata entries
  listLedger: () => db.select().from(ledgerEntries).orderBy((0, import_drizzle_orm.desc)(ledgerEntries.createdAt)),
  listLedgerByCustomer: (customerId) => db.select().from(ledgerEntries).where((0, import_drizzle_orm.eq)(ledgerEntries.customerId, customerId)).orderBy((0, import_drizzle_orm.desc)(ledgerEntries.invoiceDate)),
  createLedger: (data) => db.insert(ledgerEntries).values(data).returning().then((r) => r[0]),
  updateLedger: (id, data) => db.update(ledgerEntries).set(data).where((0, import_drizzle_orm.eq)(ledgerEntries.id, id)).returning().then((r) => r[0]),
  deleteLedger: (id) => db.delete(ledgerEntries).where((0, import_drizzle_orm.eq)(ledgerEntries.id, id)),
  // Floating images (premium animated overlay images on the hero)
  listFloatingImages: () => db.select().from(floatingImages).orderBy((0, import_drizzle_orm.asc)(floatingImages.sortOrder)),
  listEnabledFloatingImages: () => db.select().from(floatingImages).where((0, import_drizzle_orm.eq)(floatingImages.enabled, true)).orderBy((0, import_drizzle_orm.asc)(floatingImages.sortOrder)),
  createFloatingImage: (data) => db.insert(floatingImages).values(data).returning().then((r) => r[0]),
  updateFloatingImage: (id, data) => db.update(floatingImages).set(data).where((0, import_drizzle_orm.eq)(floatingImages.id, id)).returning().then((r) => r[0]),
  deleteFloatingImage: (id) => db.delete(floatingImages).where((0, import_drizzle_orm.eq)(floatingImages.id, id)),
  // Page sections (custom homepage blocks)
  listPageSections: (page = "home") => db.select().from(pageSections).where((0, import_drizzle_orm.eq)(pageSections.page, page)).orderBy((0, import_drizzle_orm.asc)(pageSections.sortOrder)),
  createPageSection: (data) => db.insert(pageSections).values(data).returning().then((r) => r[0]),
  updatePageSection: (id, data) => db.update(pageSections).set(data).where((0, import_drizzle_orm.eq)(pageSections.id, id)).returning().then((r) => r[0]),
  deletePageSection: (id) => db.delete(pageSections).where((0, import_drizzle_orm.eq)(pageSections.id, id))
};

// server/auth.ts
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);
var import_bcryptjs = __toESM(require("bcryptjs"), 1);
var JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
var signToken = (payload) => import_jsonwebtoken.default.sign(payload, JWT_SECRET, { expiresIn: "12h" });
var verifyPassword = (plain, hash) => import_bcryptjs.default.compare(plain, hash);
var hashPassword = (plain) => import_bcryptjs.default.hash(plain, 10);
var requireAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
  try {
    const token = auth.slice(7);
    const payload = import_jsonwebtoken.default.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};
var requireUser = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
  try {
    const token = auth.slice(7);
    const payload = import_jsonwebtoken.default.verify(token, JWT_SECRET);
    if (payload?.kind !== "user") return res.status(401).json({ error: "Invalid token" });
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

// server/index.ts
init_schema();
var import_zod2 = require("zod");

// server/catalog-pdf.ts
var import_pdfkit = __toESM(require("pdfkit"), 1);
var GOLD = "#C9A227";
var CHARCOAL = "#1a1a1a";
var MUTED = "#6b6b6b";
var COMPANY = {
  name: "M.I. ENGINEERING WORKS",
  tagline: "Premium Fastener Solutions",
  website: "www.miengineeringworks.in",
  email: "mienginering17@gmail.com",
  phone1: "+91 98199 72301",
  phone2: "+91 91376 58733",
  address: "301, 01, Mehar Iron Bazar, Iron Market, Khedwadi, Girgaon, Mumbai \u2013 400004"
};
var NB = { lineBreak: false };
var drawHeader = (doc) => {
  doc.save();
  doc.rect(0, 0, doc.page.width, 60).fill(CHARCOAL);
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(18).text(COMPANY.name, 40, 20, NB);
  doc.fillColor("#fff").font("Helvetica").fontSize(8).text(COMPANY.tagline.toUpperCase(), 40, 42, NB);
  doc.fillColor(GOLD).fontSize(8).text(COMPANY.website, doc.page.width - 200, 42, { ...NB, width: 160, align: "right" });
  doc.restore();
};
var drawFooter = (doc, pageNum) => {
  doc.save();
  const y = doc.page.height - 40;
  doc.rect(0, y, doc.page.width, 40).fill(CHARCOAL);
  doc.fillColor(GOLD).fontSize(8).font("Helvetica").text(COMPANY.website, 40, y + 14, NB);
  doc.fillColor("#fff").fontSize(8).text(`${COMPANY.email}  |  ${COMPANY.phone1}`, doc.page.width / 2 - 130, y + 14, { ...NB, width: 260, align: "center" });
  doc.fillColor(GOLD).fontSize(8).text(`Page ${pageNum}`, doc.page.width - 80, y + 14, { ...NB, width: 50, align: "right" });
  doc.restore();
};
var sectionTitle = (doc, label) => {
  doc.moveDown(0.5);
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(16).text(label.toUpperCase(), { underline: false });
  doc.moveTo(doc.x, doc.y + 2).lineTo(doc.x + 60, doc.y + 2).strokeColor(GOLD).lineWidth(2).stroke();
  doc.moveDown(0.6);
  doc.fillColor(CHARCOAL).font("Helvetica").fontSize(10);
};
var drawTable = (doc, headers, rows, colWidths) => {
  const startX = 40;
  let y = doc.y + 4;
  const rowH = 22;
  doc.save();
  doc.rect(startX, y, colWidths.reduce((a, b) => a + b, 0), rowH).fill(CHARCOAL);
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(9);
  let x = startX;
  headers.forEach((h, i) => {
    doc.text(h, x + 6, y + 7, { width: colWidths[i] - 12 });
    x += colWidths[i];
  });
  doc.restore();
  y += rowH;
  doc.font("Helvetica").fontSize(9).fillColor(CHARCOAL);
  rows.forEach((row, ri) => {
    if (y + rowH > doc.page.height - 60) {
      doc.addPage();
      y = 80;
    }
    if (ri % 2 === 0) {
      doc.save().rect(startX, y, colWidths.reduce((a, b) => a + b, 0), rowH).fill("#f6f3ec").restore();
    }
    let cx = startX;
    row.forEach((cell, i) => {
      doc.fillColor(CHARCOAL).text(cell, cx + 6, y + 7, { width: colWidths[i] - 12 });
      cx += colWidths[i];
    });
    y += rowH;
  });
  doc.y = y + 6;
};
function generateCatalogPdf(stream) {
  const doc = new import_pdfkit.default({ size: "A4", margins: { top: 80, bottom: 60, left: 40, right: 40 }, autoFirstPage: false });
  let pageNum = 0;
  let drawing = false;
  const decorate = () => {
    if (drawing) return;
    drawing = true;
    try {
      drawHeader(doc);
      drawFooter(doc, pageNum);
    } finally {
      drawing = false;
    }
  };
  doc.on("pageAdded", () => {
    pageNum++;
    decorate();
  });
  const chunks = [];
  doc.on("data", (c) => chunks.push(c));
  doc.on("end", () => {
    const buf = Buffer.concat(chunks);
    if (stream.status) {
      const res = stream;
      res.setHeader("Content-Length", String(buf.length));
      res.end(buf);
    } else {
      stream.write(buf);
      stream.end();
    }
  });
  doc.addPage();
  doc.y = 110;
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(11).text("ENGINEERED FOR EXCELLENCE", { align: "center", characterSpacing: 4 });
  doc.moveDown(0.6);
  doc.fillColor(CHARCOAL).font("Helvetica-Bold").fontSize(34).text(COMPANY.name, { align: "center" });
  doc.fillColor(MUTED).font("Helvetica").fontSize(12).text("Premium Industrial Fastener Solutions", { align: "center" });
  doc.moveDown(0.4);
  doc.fillColor(GOLD).fontSize(10).text("PRODUCT CATALOG  |  2026", { align: "center", characterSpacing: 3 });
  doc.moveDown(2);
  doc.fillColor(CHARCOAL).font("Helvetica").fontSize(11).text(
    "M.I. Engineering Works is a Mumbai-based manufacturer and supplier of premium industrial fasteners \u2014 engineered, tested, and trusted across oil & gas, petrochemical, power generation, infrastructure, marine, and heavy engineering industries worldwide.",
    { align: "justify", indent: 0 }
  );
  doc.moveDown();
  doc.text(
    "From ASTM A193 Grade B7 stud bolts to high-strength socket cap screws, our complete range conforms to ASTM, DIN, ISO, EN, BS, IS and SAE standards \u2014 backed by full material traceability, mill test certificates (EN 10204 3.1/3.2), and rigorous in-house quality control.",
    { align: "justify" }
  );
  doc.moveDown(1.5);
  doc.save().rect(40, doc.y, doc.page.width - 80, 110).fill("#f6f3ec").restore();
  const boxY = doc.y + 12;
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(11).text("KEY STRENGTHS", 60, boxY);
  doc.fillColor(CHARCOAL).font("Helvetica").fontSize(10);
  const bullets = [
    "20,000+ specialised fastener references \u2014 mostly available ex-stock",
    "Compliance with ASTM, DIN, ISO, EN, BS, IS, SAE international standards",
    "In-house coatings: HDG, Zinc, Geomet\xAE, PTFE / Xylan, Cadmium, Black Oxide",
    "Custom-engineered fasteners to drawing or project specification",
    "Mill test certificates EN 10204 3.1 / 3.2 with every batch"
  ];
  let by = boxY + 22;
  bullets.forEach((b) => {
    doc.fillColor(GOLD).text("\u25CF", 60, by);
    doc.fillColor(CHARCOAL).text(b, 75, by, { width: doc.page.width - 140 });
    by += 14;
  });
  doc.y = by + 12;
  doc.moveDown(1);
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(11).text("CONTACT");
  doc.fillColor(CHARCOAL).font("Helvetica").fontSize(10);
  doc.text(COMPANY.address);
  doc.text(`Email: ${COMPANY.email}`);
  doc.text(`Phone: ${COMPANY.phone1}  |  ${COMPANY.phone2}`);
  doc.text(`Website: ${COMPANY.website}`);
  doc.addPage();
  sectionTitle(doc, "About M.I. Engineering Works");
  doc.text(
    "Founded with a singular vision \u2014 to deliver fasteners that secure the world's most demanding engineering structures \u2014 M.I. Engineering Works has grown into a trusted partner for refineries, power plants, EPC contractors, OEMs, and infrastructure projects across India and abroad.",
    { align: "justify" }
  );
  doc.moveDown();
  doc.text(
    "Our manufacturing philosophy combines metallurgical expertise with precision machining and rigorous quality assurance. Every fastener we produce undergoes 100% dimensional checks, hardness testing, and tensile sampling on every production lot to ensure performance under load, vibration, and temperature.",
    { align: "justify" }
  );
  sectionTitle(doc, "Quality & Certifications");
  doc.text("Our quality systems and product testing are aligned with internationally recognized benchmarks, ensuring every fastener delivered exceeds expectation:", { align: "justify" });
  doc.moveDown(0.4);
  ["ISO 9001 Quality Management", "EN 10204 3.1 / 3.2 Mill Test Certification", "Third-party inspection (TUV, BV, SGS, IRS) on request", "PED 2014/68/EU compliance available", "Full material traceability and batch identification"].forEach((b) => doc.text(`\u2022 ${b}`));
  sectionTitle(doc, "Specialised Coatings");
  doc.text("Our in-house surface treatment facilities deliver corrosion protection tailored to your service environment:", { align: "justify" });
  doc.moveDown(0.4);
  ["Hot-Dip Galvanizing (HDG)", "Mechanical & Electrolytic Zinc Plating", "Zinc-Nickel & Cadmium Plating", "PTFE / Xylan\xAE Coating (Blue, Black, Grey)", "Geomet\xAE and Delta-Tone Coatings", "Phosphate, Black Oxide, Bright Plain"].forEach((b) => doc.text(`\u2022 ${b}`));
  doc.addPage();
  sectionTitle(doc, "Socket Screws \u2014 Metric");
  drawTable(
    doc,
    ["Product", "Size", "Grade", "Standard"],
    [
      ["Socket Head Cap Screw", "M1.6 to M64", "12.9", "DIN 912 / ISO 4762 / A574M"],
      ["Socket Low Head Cap Screw", "M4 to M20", "10.9", "DIN 7984"],
      ["Socket Head Shoulder Screw", "M6 to M24", "12.9", "ISO 7379"],
      ["Countersunk Socket Head Screw", "M3 to M20", "12.9", "DIN 7991 / ISO 10642"],
      ["Button Head Socket Screw", "M3 to M12", "12.9", "ISO 7380"],
      ["Flange Button Head Socket Screw", "M3 to M10", "12.9", "ISO 7380-2"],
      ["Socket Set Screw \u2013 Cup Point", "M3 to M20", "45H", "DIN 916 / ISO 4029"],
      ["Socket Set Screw \u2013 Flat Point", "M6 to M12", "45H", "DIN 913 / ISO 4026"],
      ["Socket Set Screw \u2013 Dog Point", "M3 to M20", "45H", "DIN 915 / ISO 4028"],
      ["Socket Set Screw \u2013 Cone Point", "M3 to M12", "45H", "DIN 914 / ISO 4027"]
    ],
    [180, 110, 70, 165]
  );
  sectionTitle(doc, "Socket Screws \u2014 Inch");
  drawTable(
    doc,
    ["Product", "Size", "Tensile / Hardness", "Standard"],
    [
      ["Socket Head Cap Screw", "#0 to 2 (UNC/UNF)", "190,000 psi (\u22641/2)", "ASME B18.3 / ASTM A574"],
      ["Socket Low Head Cap Screw", "#8 to 1/2", "170,000 psi", "ASTM F835"],
      ["Socket Head Shoulder Screw", "1/4 to 2 (UNC)", "HRC 36\u201343", "ASME B18.3"],
      ["Countersunk Socket Head Screw", "#4 to 1-1/2", "160,000 psi", "ASME B18.3 / ASTM F835"],
      ["Button Head Socket Screw", "#10 to 5/8", "160,000 psi", "ASME B18.3 / ASTM F835"],
      ["Socket Set Screw \u2013 Cup Point", "#0 to 5/8", "HRC 45\u201353", "ASME B18.3 / ASTM F912"]
    ],
    [180, 110, 100, 135]
  );
  doc.addPage();
  sectionTitle(doc, "Hex Bolts & Screws");
  drawTable(
    doc,
    ["Product", "Size", "Grade / Class", "Tensile", "Standard"],
    [
      ["Hex Head Bolt \u2014 Metric", "M4 to M80", "10.9", "1040 N/mm\xB2 min", "ISO 4014 / 4017"],
      ["Hex Head Bolt \u2014 Metric", "M6 to M64", "8.8", "830 N/mm\xB2 min", "ISO 4014 / 4017"],
      ["Hex Cap Screw \u2014 Inch", "1/4 to 2", "Grade 8", "150,000 psi min", "ASME B18.2.1"],
      ["Hex Cap Screw \u2014 Inch", "1/4 to 2", "Grade 5", "120,000 psi min", "ASME B18.2.1"],
      ["Hex Bolt \u2014 Inch", "1/4 to 1", "Grade A", "60 ksi min", "ASTM A307"],
      ["Heavy Hex Structural Bolt", "M12 to M36", "10.9 HV", "1040 N/mm\xB2 min", "EN 14399-4 (HV)"],
      ["HSFG Bolts", "M16 to M30", "8.8 / 10.9", "830 / 1040 N/mm\xB2", "BS 4395 / IS 3757"]
    ],
    [165, 95, 90, 95, 100]
  );
  sectionTitle(doc, "Hex Nuts");
  drawTable(
    doc,
    ["Product", "Size", "Class / Grade", "Standard"],
    [
      ["Hex Nut \u2014 Metric", "M3 to M64", "Class 8 / 10 / 12", "DIN 934 / ISO 4032"],
      ["Heavy Hex Nut \u2014 ASTM 2H", "1/4 to 4", "Grade 2H", "ASTM A194 2H"],
      ["Hex Nut \u2014 Inch", "1/4 to 2", "Grade 5 / 8", "ASME B18.2.2"],
      ["Lock Nut (Nyloc)", "M3 to M30", "Class 8 / 10", "DIN 985 / ISO 7040"],
      ["Castle Nut", "M6 to M48", "Class 6 / 8 / 10", "DIN 935 / ISO 7035"]
    ],
    [180, 95, 130, 140]
  );
  doc.addPage();
  sectionTitle(doc, "Stud Bolts & Threaded Rods");
  drawTable(
    doc,
    ["Product", "Size", "Material / Grade", "Standard"],
    [
      ["Stud Bolt with 2 Heavy Hex Nuts", "M6 to M100", "ASTM A193 B7 + A194 2H", "ASME B16.5"],
      ["Stud Bolt \u2014 High Temp", "1/4 to 4", "ASTM A193 B16", "ASME B16.5"],
      ["Stud Bolt \u2014 Low Temp", "1/4 to 4", "ASTM A320 L7 / L7M", "ASME B16.5"],
      ["Stud Bolt \u2014 Stainless", "M6 to M64", "ASTM A193 B8 / B8M", "ASME B16.5"],
      ["Threaded Rod", "M3 to M100", "Grade 4.6 / 8.8 / 10.9 / B7", "DIN 975 / 976"],
      ["Double End Stud", "M8 to M80", "ASTM A193 B7 / B16", "DIN 2510 / ASME B18.2.1"]
    ],
    [185, 100, 145, 115]
  );
  sectionTitle(doc, "Anchor Bolts & Foundation Bolts");
  drawTable(
    doc,
    ["Product", "Size", "Grade", "Standard"],
    [
      ["Foundation Anchor Bolt \u2014 L Type", "M12 to M64", "F1554 Gr 36 / 55 / 105", "ASTM F1554"],
      ["Foundation Anchor Bolt \u2014 J Type", "M12 to M64", "F1554 Gr 36 / 55 / 105", "ASTM F1554"],
      ["Sleeve Anchor", "M6 to M24", "Carbon / SS 304 / SS 316", "Custom"],
      ["Wedge Anchor", "M6 to M24", "Carbon / SS 304 / SS 316", "Custom"],
      ["Chemical Anchor Stud", "M8 to M30", "Grade 5.8 / 8.8 / SS", "Custom"]
    ],
    [205, 95, 145, 100]
  );
  doc.addPage();
  sectionTitle(doc, "Washers");
  drawTable(
    doc,
    ["Product", "Size", "Material", "Standard"],
    [
      ["Plain Washer", "M3 to M64", "Carbon / Stainless", "DIN 125 / ISO 7089"],
      ["Heavy Washer (Structural)", "M12 to M36", "Hardened Carbon Steel", "DIN 6916 / EN 14399-6"],
      ["Spring Lock Washer", "M3 to M48", "Spring Steel", "DIN 127B / IS 3063"],
      ["Tooth Lock Washer (Internal/External)", "M3 to M30", "Spring Steel", "DIN 6797"],
      ["Belleville Disc Spring Washer", "M3 to M60", "Spring / Inconel", "DIN 6796 / DIN 2093"]
    ],
    [220, 90, 130, 105]
  );
  sectionTitle(doc, "Specialty & Custom Fasteners");
  doc.text(
    "We manufacture bespoke and engineered-to-print fasteners across a wide spectrum of standards, materials, and finishes. Whether you require a custom-length stud bolt for a heat exchanger, a high-tensile shoulder screw for tooling, or a duplex-stainless fastener for marine service \u2014 our engineering team works directly from your drawings or specification.",
    { align: "justify" }
  );
  doc.moveDown(0.5);
  ["Eye Bolts (DIN 580 / ASME B18.15)", "U-Bolts (custom radius / DIN 3570)", "Hexagon Wrenches & Bits (ISO 2936)", "Dowel Pins, Sel-Lok Pins (ISO 8752)", "Round Bars & Forgings (ASTM A276)", "PTFE / Xylan-coated assemblies"].forEach((b) => doc.text(`\u2022 ${b}`));
  doc.addPage();
  sectionTitle(doc, "Industries Served");
  doc.text("M.I. Engineering Works supplies precision fasteners across more than 50 global industries:", { align: "justify" });
  doc.moveDown(0.4);
  const industries2 = [
    "Oil & Gas",
    "Petrochemical",
    "Power Generation",
    "Refineries",
    "Cement Plants",
    "Pressure Vessels & Heat Exchangers",
    "Steel Fabrication",
    "Wind Energy",
    "Solar Energy",
    "Pre-Engineered Buildings",
    "Structural Steel",
    "Bridges & Infrastructure",
    "Marine & Shipbuilding",
    "Automotive",
    "Aerospace & Aviation",
    "Defense & Military",
    "Railways & Metro",
    "Mining Equipment",
    "Pumps, Valves & Compressors",
    "Pulp & Paper",
    "Sugar Mills",
    "Water Treatment & Desalination",
    "Pharmaceutical & Food Industry",
    "Telecommunication Towers",
    "HVAC & Ducting"
  ];
  const colW = (doc.page.width - 80) / 3;
  let cx = 40, cy = doc.y;
  industries2.forEach((i, idx) => {
    if (idx > 0 && idx % 3 === 0) {
      cy += 16;
      cx = 40;
    }
    doc.fillColor(GOLD).text("\u25CF", cx, cy);
    doc.fillColor(CHARCOAL).text(i, cx + 12, cy, { width: colW - 16 });
    cx += colW;
  });
  doc.y = cy + 26;
  sectionTitle(doc, "Standards Compliance");
  doc.text("Every fastener we produce conforms to the most demanding international specifications:");
  doc.moveDown(0.4);
  [
    "ASTM International \u2014 A193, A194, A320, A325, A490, F1554",
    "ANSI / ASME \u2014 B18.2, B18.3, B16.5, B1.1",
    "DIN \u2014 931, 933, 934, 976, 6914, 912",
    "ISO \u2014 4014, 4017, 4032, 898-1, 3506",
    "BS / EN \u2014 BS 3692, BS 4395, EN 14399, EN 10204",
    "IS \u2014 1364, 1367, 3757, 6639",
    "SAE \u2014 J429, J995, J1199"
  ].forEach((b) => doc.text(`\u2022 ${b}`));
  doc.addPage();
  sectionTitle(doc, "Get In Touch");
  doc.fillColor(CHARCOAL).font("Helvetica").fontSize(11);
  doc.text("For technical enquiries, project quotations, or product samples, please contact us:", { align: "justify" });
  doc.moveDown();
  doc.save().rect(40, doc.y, doc.page.width - 80, 130).fill("#f6f3ec").restore();
  const cBoxY = doc.y + 14;
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(13).text(COMPANY.name, 60, cBoxY);
  doc.fillColor(CHARCOAL).font("Helvetica").fontSize(10);
  doc.text(COMPANY.tagline, 60, cBoxY + 18);
  doc.fillColor(CHARCOAL).fontSize(10);
  doc.text(`Address:  ${COMPANY.address}`, 60, cBoxY + 38, { width: doc.page.width - 120 });
  doc.text(`Email:    ${COMPANY.email}`, 60, cBoxY + 70);
  doc.text(`Phone:    ${COMPANY.phone1}   |   ${COMPANY.phone2}`, 60, cBoxY + 86);
  doc.text(`Website:  ${COMPANY.website}`, 60, cBoxY + 102);
  doc.y = cBoxY + 140;
  doc.moveDown(2);
  doc.fillColor(MUTED).fontSize(8).text(
    "NOTE: M.I. Engineering Works manufactures fasteners that meet or exceed the requirements of the standards listed above. Different standards are the responsibility of various organizations and are not always identical. M.I. Engineering Works reserves the right to update or modify its manufacturing specifications and other particulars contained in this catalog without prior notice.",
    { align: "justify" }
  );
  doc.end();
}

// server/mailer.ts
var import_nodemailer = __toESM(require("nodemailer"), 1);
var HOST = process.env.SMTP_HOST || "smtp.gmail.com";
var PORT = Number(process.env.SMTP_PORT || 465);
var USER = process.env.SMTP_USER || "";
var PASS = process.env.SMTP_PASS || "";
var TO = process.env.CONTACT_TO_EMAIL || "miengineering17@gmail.com";
var FROM = process.env.SMTP_FROM || `M.I. Engineering Works <${USER || TO}>`;
var transporter = null;
function getTransporter() {
  if (!USER || !PASS) return null;
  if (!transporter) {
    transporter = import_nodemailer.default.createTransport({
      host: HOST,
      port: PORT,
      secure: PORT === 465,
      auth: { user: USER, pass: PASS }
    });
  }
  return transporter;
}
async function sendContactEmail(c) {
  const t = getTransporter();
  if (!t) {
    console.warn("[mailer] SMTP not configured (SMTP_USER/SMTP_PASS missing) \u2014 skipping email");
    return { sent: false, reason: "smtp_not_configured" };
  }
  const subject = `New Enquiry from ${c.fullName} \u2014 M.I. Engineering Works`;
  const html = `
    <div style="font-family:Arial,sans-serif;background:#f6f3ec;padding:24px;color:#1a1a1a;">
      <div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #e5dfc9;border-radius:8px;overflow:hidden;">
        <div style="background:#1a1a1a;padding:20px;">
          <h1 style="color:#C9A227;margin:0;font-size:18px;letter-spacing:2px;">M.I. ENGINEERING WORKS</h1>
          <p style="color:#fff;margin:4px 0 0;font-size:11px;letter-spacing:3px;">NEW WEBSITE ENQUIRY</p>
        </div>
        <div style="padding:24px;">
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr><td style="padding:8px 0;color:#6b6b6b;width:120px;">Name</td><td style="padding:8px 0;font-weight:600;">${esc(c.fullName)}</td></tr>
            <tr><td style="padding:8px 0;color:#6b6b6b;">Email</td><td style="padding:8px 0;"><a href="mailto:${esc(c.email)}" style="color:#C9A227;">${esc(c.email)}</a></td></tr>
            <tr><td style="padding:8px 0;color:#6b6b6b;">Phone</td><td style="padding:8px 0;"><a href="tel:${esc(c.phone)}" style="color:#C9A227;">${esc(c.phone)}</a></td></tr>
            ${c.company ? `<tr><td style="padding:8px 0;color:#6b6b6b;">Company</td><td style="padding:8px 0;">${esc(c.company)}</td></tr>` : ""}
          </table>
          <div style="margin-top:16px;padding:16px;background:#f6f3ec;border-left:3px solid #C9A227;border-radius:4px;">
            <div style="font-size:11px;color:#6b6b6b;text-transform:uppercase;letter-spacing:2px;margin-bottom:6px;">Message</div>
            <div style="white-space:pre-wrap;font-size:14px;line-height:1.5;">${esc(c.message)}</div>
          </div>
          <p style="margin-top:20px;font-size:11px;color:#6b6b6b;">This enquiry was submitted from the M.I. Engineering Works website contact form.</p>
        </div>
      </div>
    </div>
  `;
  const text2 = `New enquiry from ${c.fullName}

Email: ${c.email}
Phone: ${c.phone}
${c.company ? `Company: ${c.company}
` : ""}
Message:
${c.message}`;
  try {
    const info = await t.sendMail({ from: FROM, to: TO, replyTo: c.email, subject, text: text2, html });
    console.log(`[mailer] sent enquiry email: ${info.messageId}`);
    return { sent: true };
  } catch (e) {
    console.error("[mailer] send failed:", e.message);
    return { sent: false, reason: e.message };
  }
}
function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

// server/mi-service.ts
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
init_schema();
var BACKUP_DIR = import_path.default.resolve("data/backups");
var UPLOAD_DIR = import_path.default.resolve("uploads");
if (!import_fs.default.existsSync(BACKUP_DIR)) import_fs.default.mkdirSync(BACKUP_DIR, { recursive: true });
if (!import_fs.default.existsSync(UPLOAD_DIR)) import_fs.default.mkdirSync(UPLOAD_DIR, { recursive: true });
var TABLES = {
  products,
  industries,
  standards,
  media,
  siteContent,
  pageSections,
  customers,
  ledgerEntries,
  contactSubmissions
};
async function dumpAllTables() {
  const tables = {};
  const counts = {};
  for (const [name, table] of Object.entries(TABLES)) {
    const rows = await db.select().from(table);
    tables[name] = rows;
    counts[name] = rows.length;
  }
  return { tables, counts };
}
function timestampSlug() {
  const d = /* @__PURE__ */ new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}
async function createBackup(label = "manual") {
  const dump = await dumpAllTables();
  const snap = {
    version: 2,
    kind: "db",
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    tables: dump.tables,
    counts: dump.counts
  };
  const safe = label.replace(/[^a-z0-9-_]/gi, "-").slice(0, 32);
  const file = `backup-${timestampSlug()}-${safe}.json`;
  const full = import_path.default.join(BACKUP_DIR, file);
  import_fs.default.writeFileSync(full, JSON.stringify(snap, null, 2), "utf8");
  return {
    file,
    path: full,
    kind: "db",
    counts: snap.counts,
    totalRows: Object.values(snap.counts).reduce((a, b) => a + b, 0),
    fileCount: 0
  };
}
async function createFullBackup(label = "full") {
  const dump = await dumpAllTables();
  const files = {};
  let fileCount = 0;
  if (import_fs.default.existsSync(UPLOAD_DIR)) {
    for (const name of import_fs.default.readdirSync(UPLOAD_DIR)) {
      const p = import_path.default.join(UPLOAD_DIR, name);
      try {
        const stat = import_fs.default.statSync(p);
        if (!stat.isFile()) continue;
        if (stat.size > 50 * 1024 * 1024) continue;
        const buf = import_fs.default.readFileSync(p);
        files[name] = buf.toString("base64");
        fileCount++;
      } catch {
      }
    }
  }
  const snap = {
    version: 2,
    kind: "full",
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    tables: dump.tables,
    counts: dump.counts,
    files
  };
  const safe = label.replace(/[^a-z0-9-_]/gi, "-").slice(0, 32);
  const file = `fullbackup-${timestampSlug()}-${safe}.json`;
  const full = import_path.default.join(BACKUP_DIR, file);
  import_fs.default.writeFileSync(full, JSON.stringify(snap), "utf8");
  const sizeBytes = import_fs.default.statSync(full).size;
  return {
    file,
    path: full,
    kind: "full",
    counts: snap.counts,
    totalRows: Object.values(snap.counts).reduce((a, b) => a + b, 0),
    fileCount,
    sizeBytes
  };
}
function listBackups() {
  if (!import_fs.default.existsSync(BACKUP_DIR)) return [];
  return import_fs.default.readdirSync(BACKUP_DIR).filter((f) => f.endsWith(".json")).map((f) => {
    const full = import_path.default.join(BACKUP_DIR, f);
    const s = import_fs.default.statSync(full);
    let counts = {};
    let createdAt;
    let kind = "db";
    let fileCount = 0;
    try {
      const raw = import_fs.default.readFileSync(full, "utf8");
      const j = JSON.parse(raw);
      counts = j.counts || {};
      createdAt = j.createdAt;
      kind = j.kind === "full" ? "full" : "db";
      fileCount = j.files ? Object.keys(j.files).length : 0;
    } catch {
    }
    return {
      file: f,
      size: s.size,
      modified: s.mtime.toISOString(),
      createdAt,
      kind,
      totalRows: Object.values(counts).reduce((a, b) => a + b, 0),
      counts,
      fileCount
    };
  }).sort((a, b) => (b.createdAt || b.modified).localeCompare(a.createdAt || a.modified));
}
async function restoreBackup(file, mode = "replace") {
  const safe = import_path.default.basename(file);
  const full = import_path.default.join(BACKUP_DIR, safe);
  if (!import_fs.default.existsSync(full)) throw new Error(`Backup file not found: ${safe}`);
  const snap = JSON.parse(import_fs.default.readFileSync(full, "utf8"));
  if (snap.version !== 1 && snap.version !== 2) throw new Error("Unsupported backup version");
  const restored = {};
  const skipped = {};
  for (const [name, table] of Object.entries(TABLES)) {
    const rows = snap.tables[name] || [];
    if (rows.length === 0) {
      restored[name] = 0;
      skipped[name] = 0;
      continue;
    }
    if (mode === "replace") {
      await db.delete(table);
      const cleaned = rows.map((r) => normalizeRow(r));
      for (const chunk of chunkArray(cleaned, 100)) {
        await db.insert(table).values(chunk);
      }
      restored[name] = rows.length;
      skipped[name] = 0;
    } else {
      const existing = await db.select().from(table);
      const existingIds = new Set(existing.map((e) => e.id));
      const toInsert = rows.filter((r) => !existingIds.has(r.id)).map(normalizeRow);
      if (toInsert.length) {
        for (const chunk of chunkArray(toInsert, 100)) {
          await db.insert(table).values(chunk);
        }
      }
      restored[name] = toInsert.length;
      skipped[name] = rows.length - toInsert.length;
    }
  }
  let filesRestored = 0;
  if (snap.files && typeof snap.files === "object") {
    for (const [name, b64] of Object.entries(snap.files)) {
      try {
        const safeName = import_path.default.basename(name);
        const out = import_path.default.join(UPLOAD_DIR, safeName);
        import_fs.default.writeFileSync(out, Buffer.from(String(b64), "base64"));
        filesRestored++;
      } catch (e) {
        console.warn("[mi] restore file failed:", name, e.message);
      }
    }
  }
  return { file: safe, mode, kind: snap.kind || "db", restored, skipped, filesRestored };
}
function deleteBackup(file) {
  const safe = import_path.default.basename(file);
  const full = import_path.default.join(BACKUP_DIR, safe);
  if (!import_fs.default.existsSync(full)) throw new Error(`Backup file not found: ${safe}`);
  import_fs.default.unlinkSync(full);
  return { file: safe, deleted: true };
}
function saveUploadedBackup(originalName, buf) {
  let snap;
  try {
    snap = JSON.parse(buf.toString("utf8"));
  } catch {
    throw new Error("Uploaded file is not valid JSON");
  }
  if (!snap || snap.version !== 1 && snap.version !== 2 || !snap.tables) {
    throw new Error("Uploaded file is not a valid MI backup (missing version/tables)");
  }
  const baseRaw = import_path.default.basename(originalName).replace(/[^a-z0-9.\-_]/gi, "_");
  const base = baseRaw.toLowerCase().endsWith(".json") ? baseRaw : `${baseRaw}.json`;
  const finalName = base.startsWith("backup-") || base.startsWith("fullbackup-") ? base : `uploaded-${timestampSlug()}-${base}`;
  const out = import_path.default.join(BACKUP_DIR, finalName);
  import_fs.default.writeFileSync(out, buf);
  const counts = snap.counts || {};
  return {
    file: finalName,
    kind: snap.kind === "full" ? "full" : "db",
    totalRows: Object.values(counts).reduce((a, b) => a + Number(b || 0), 0),
    fileCount: snap.files ? Object.keys(snap.files).length : 0,
    sizeBytes: buf.length
  };
}
function normalizeRow(r) {
  const out = {};
  for (const [k, v] of Object.entries(r)) {
    if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(v)) {
      out[k] = new Date(v);
    } else {
      out[k] = v;
    }
  }
  return out;
}
function chunkArray(arr, n) {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}
async function healthCheck() {
  const counts = {};
  for (const [name, table] of Object.entries(TABLES)) {
    const rows = await db.select().from(table);
    counts[name] = rows.length;
  }
  const onDisk = import_fs.default.existsSync(UPLOAD_DIR) ? new Set(import_fs.default.readdirSync(UPLOAD_DIR)) : /* @__PURE__ */ new Set();
  const refs = [];
  const collectImageRefs = (rows, table, fields) => {
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
    const apps = ind.applications || [];
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
  const issues = [];
  if (counts.products === 0) issues.push({ severity: "warn", message: "No products in database" });
  if (counts.industries === 0) issues.push({ severity: "warn", message: "No industries in database" });
  if (counts.standards === 0) issues.push({ severity: "warn", message: "No standards in database" });
  if (missingFiles.length > 0) issues.push({
    severity: "error",
    message: `${missingFiles.length} uploaded image(s) referenced in DB are missing from /uploads folder`
  });
  const backups = listBackups();
  if (backups.length === 0) issues.push({ severity: "warn", message: "No backups exist yet \u2014 type 'backup' to create one" });
  return {
    counts,
    totalRows: Object.values(counts).reduce((a, b) => a + b, 0),
    uploadedFilesOnDisk: onDisk.size,
    referencedUploadFiles: refs.length,
    missingFiles: missingFiles.slice(0, 30),
    missingFilesCount: missingFiles.length,
    issues,
    backups: backups.length,
    latestBackup: backups[0] || null
  };
}
var ONE_DAY_MS = 24 * 60 * 60 * 1e3;
async function ensureFirstRunBackup() {
  try {
    if (listBackups().length > 0) return;
    const dump = await dumpAllTables();
    if (dump.counts.products === 0 && dump.counts.industries === 0 && dump.counts.standards === 0) return;
    const r = await createFullBackup("auto-first-run");
    console.log(`[mi] auto first-run FULL backup created: ${r.file} (${r.totalRows} rows, ${r.fileCount} files)`);
  } catch (e) {
    console.warn("[mi] first-run backup skipped:", e.message);
  }
}
async function runDailyBackupIfDue() {
  try {
    const all = listBackups();
    const autoOnes = all.filter((b) => /-auto-daily/.test(b.file));
    const newest = autoOnes[0];
    if (newest) {
      const last = new Date(newest.createdAt || newest.modified).getTime();
      if (Date.now() - last < ONE_DAY_MS) return null;
    }
    const r = await createFullBackup("auto-daily");
    console.log(`[mi] daily auto FULL backup created: ${r.file}`);
    const refreshed = listBackups().filter((b) => /-auto-daily/.test(b.file));
    const toDelete = refreshed.slice(7);
    for (const old of toDelete) {
      try {
        import_fs.default.unlinkSync(import_path.default.join(BACKUP_DIR, old.file));
        console.log(`[mi] pruned old daily backup: ${old.file}`);
      } catch {
      }
    }
    return r;
  } catch (e) {
    console.warn("[mi] daily auto backup failed:", e.message);
    return null;
  }
}
function startBackupScheduler() {
  setTimeout(() => {
    runDailyBackupIfDue();
  }, 60 * 1e3);
  setInterval(() => {
    runDailyBackupIfDue();
  }, 6 * 60 * 60 * 1e3);
  console.log("[mi] daily auto-backup scheduler started (checks every 6h, fires once per 24h)");
}
var HELP = `Main MI Chat hoon. Aap mujhe yeh seedhi-saadhi commands de sakte ho:

\u2022 "backup" \u2014 abhi ke saare data + photos ka FULL backup banao
\u2022 "db backup" \u2014 sirf database ka backup (chhota, jaldi)
\u2022 "restore" \u2014 purane backup se data wapas le aao
\u2022 "list backups" \u2014 saare available backups dikhao
\u2022 "health" / "fix bug" \u2014 site check karo, kya broken hai bata do
\u2022 "stats" \u2014 kitne products, industries, standards hain dikhao
\u2022 "help" \u2014 yeh menu firse dikhao

Tip: Detailed backup management ke liye sidebar me "Backups" page kholo \u2014 wahan upload/download/delete sab hai.

English ya Hindi dono samjhta hoon.`;
function detectIntent(raw) {
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
async function handleChat(rawMessage, opts) {
  const message = (rawMessage || "").trim();
  if (opts?.restoreFile) {
    try {
      const r = await restoreBackup(opts.restoreFile, opts.restoreMode || "replace");
      const total = Object.values(r.restored).reduce((a, b) => a + b, 0);
      return {
        kind: "ok",
        reply: `\u2705 Restore complete from "${r.file}". Total ${total} rows wapas aaye${r.filesRestored ? ` aur ${r.filesRestored} photos/files bhi wapas` : ""} (mode: ${r.mode}).`,
        data: r
      };
    } catch (e) {
      return { kind: "error", reply: `\u274C Restore fail: ${e.message}` };
    }
  }
  const intent = detectIntent(message);
  if (intent === "help") return { kind: "help", reply: HELP };
  if (intent === "full-backup") {
    const r = await createFullBackup("chat");
    return {
      kind: "ok",
      reply: `\u2705 FULL Backup ban gaya: ${r.file}
\u{1F4E6} ${r.totalRows} rows + \u{1F5BC}\uFE0F ${r.fileCount} photos save hue.

Size: ${(r.sizeBytes / 1024 / 1024).toFixed(2)} MB. Project ke andar data/backups/ folder me.`,
      data: r,
      actions: [{ label: "Open Backups page", command: "list backups" }]
    };
  }
  if (intent === "db-backup") {
    const r = await createBackup("chat");
    return {
      kind: "ok",
      reply: `\u2705 DB Backup ban gaya: ${r.file}
\u{1F4E6} ${r.totalRows} rows save hue (sirf database, photos nahi).`,
      data: r
    };
  }
  if (intent === "list-backups" || intent === "restore") {
    const backups = listBackups();
    if (backups.length === 0) {
      return {
        kind: "text",
        reply: "\u274C Koi backup file nahi mili.\n\nSabse pehle ek backup banao:",
        actions: [{ label: "Create backup now", command: "backup" }]
      };
    }
    if (intent === "restore") {
      return {
        kind: "backups",
        reply: `\u{1F5C2}\uFE0F ${backups.length} backup mile. Jisse restore karna hai uska "Restore" button dabao.

\u26A0\uFE0F Restore karne se abhi ka data REPLACE ho jayega backup wale data se.`,
        data: backups
      };
    }
    return {
      kind: "backups",
      reply: `\u{1F5C2}\uFE0F ${backups.length} backup files available:`,
      data: backups
    };
  }
  if (intent === "health") {
    const h = await healthCheck();
    let reply = `\u{1FA7A} Health Check:

\u{1F4CA} Total rows in DB: ${h.totalRows}
\u{1F4C1} Uploads on disk: ${h.uploadedFilesOnDisk}
\u{1F517} Image references in DB: ${h.referencedUploadFiles}`;
    if (h.missingFilesCount > 0) reply += `

\u26A0\uFE0F ${h.missingFilesCount} image(s) DB me hain par /uploads me file gayab hai.`;
    if (h.issues.length === 0) reply += `

\u2705 Sab kuch theek dikh raha hai.`;
    else reply += `

Issues:
${h.issues.map((i) => `\u2022 [${i.severity.toUpperCase()}] ${i.message}`).join("\n")}`;
    if (h.latestBackup) reply += `

\u{1F4BE} Last backup: ${h.latestBackup.file}`;
    const actions = [{ label: "Backup now", command: "backup" }];
    if (h.backups > 0) actions.push({ label: "Restore from backup", command: "restore" });
    return { kind: "health", reply, data: h, actions };
  }
  if (intent === "stats") {
    const dump = await dumpAllTables();
    const lines = Object.entries(dump.counts).map(([k, v]) => `\u2022 ${k}: ${v}`).join("\n");
    return { kind: "stats", reply: `\u{1F4CA} Database stats:

${lines}`, data: dump.counts };
  }
  return {
    kind: "text",
    reply: `Maaf kijiye, "${message}" samjh nahi aaya.

${HELP}`
  };
}

// server/data-fix.ts
init_schema();
var import_drizzle_orm2 = require("drizzle-orm");
function categorizeProductName(name) {
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
var PALETTES = [
  { bg: "1f2937", fg: "d4af37" },
  { bg: "0f172a", fg: "f59e0b" },
  { bg: "1e293b", fg: "fbbf24" },
  { bg: "111827", fg: "eab308" }
];
function placeholderImage(name, slug = "") {
  const seed = (slug || name).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const p = PALETTES[seed % PALETTES.length];
  const txt = encodeURIComponent(name.replace(/\s+&\s+/g, " and ").slice(0, 40));
  return `https://placehold.co/1200x800/${p.bg}/${p.fg}/png?text=${txt}&font=roboto`;
}
function isBrokenUrl(url) {
  if (!url) return false;
  return url.includes("source.unsplash.com");
}
async function fixBrokenImages() {
  let fixed = 0;
  const inds = await db.select().from(industries);
  for (const ind of inds) {
    let dirty = false;
    let nextImage = ind.image;
    if (isBrokenUrl(ind.image)) {
      nextImage = placeholderImage(ind.name, ind.slug);
      dirty = true;
    }
    let apps = ind.applications || [];
    if (Array.isArray(apps)) {
      apps = apps.map((a) => {
        if (a && typeof a === "object" && isBrokenUrl(a.image)) {
          return { ...a, image: placeholderImage(a.name || ind.name, ind.slug) };
        }
        return a;
      });
      const before = JSON.stringify(ind.applications || []);
      const after = JSON.stringify(apps);
      if (before !== after) dirty = true;
    }
    if (dirty) {
      await db.update(industries).set({ image: nextImage, applications: apps }).where((0, import_drizzle_orm2.eq)(industries.id, ind.id));
      fixed++;
    }
  }
  const stds = await db.select().from(standards);
  for (const s of stds) {
    if (isBrokenUrl(s.image)) {
      await db.update(standards).set({ image: placeholderImage(s.code || s.name, s.slug) }).where((0, import_drizzle_orm2.eq)(standards.id, s.id));
      fixed++;
    }
  }
  const prods = await db.select().from(products);
  for (const p of prods) {
    if (isBrokenUrl(p.image)) {
      await db.update(products).set({ image: placeholderImage(p.name, p.slug) }).where((0, import_drizzle_orm2.eq)(products.id, p.id));
      fixed++;
    }
  }
  if (fixed > 0) console.log(`[data-fix] fixed ${fixed} broken image reference(s)`);
}
async function backfillProductCategories() {
  const rows = await db.select().from(products);
  let updated = 0;
  for (const p of rows) {
    const correct = categorizeProductName(p.name);
    if (!p.category || p.category !== correct) {
      await db.update(products).set({ category: correct }).where((0, import_drizzle_orm2.eq)(products.id, p.id));
      updated++;
    }
  }
  if (updated > 0) console.log(`[data-fix] backfilled categories for ${updated} product(s)`);
}
async function runDataFixes() {
  try {
    await fixBrokenImages();
    await backfillProductCategories();
  } catch (e) {
    console.warn("[data-fix] failed:", e.message);
  }
}

// server/index.ts
var app = (0, import_express.default)();
app.use((0, import_cors.default)());
app.use(import_express.default.json({ limit: "20mb" }));
var UPLOAD_DIR2 = process.env.VERCEL ? "/tmp/uploads" : import_path2.default.resolve("uploads");
if (!import_fs2.default.existsSync(UPLOAD_DIR2)) import_fs2.default.mkdirSync(UPLOAD_DIR2, { recursive: true });
app.use("/uploads", import_express.default.static(UPLOAD_DIR2));
var storageMulter = import_multer.default.diskStorage({
  destination: UPLOAD_DIR2,
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-z0-9.\-]/gi, "_");
    cb(null, `${Date.now()}-${safe}`);
  }
});
var upload = (0, import_multer.default)({ storage: storageMulter, limits: { fileSize: 10 * 1024 * 1024 } });
function wrap(fn) {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (e) {
      const cause = e?.cause ?? e?.original ?? null;
      console.error("[route] Error:", e?.message ?? e);
      if (cause) console.error("[route] Cause:", cause?.code, cause?.detail, cause?.message);
      if (e?.stack) console.error(e.stack);
      if (res.headersSent) return;
      let msg = e?.message || "Internal server error";
      if (cause?.message) msg = `${msg} \u2014 ${cause.message}`;
      if (e?.message?.includes("ECONNREFUSED") || e?.message?.includes("timeout") || e?.message?.includes("connect")) {
        msg = "Database unreachable. Set DATABASE_URL in Vercel environment variables to a public PostgreSQL server (Neon/Supabase).";
      }
      res.status(500).json({ error: msg });
    }
  };
}
app.post("/api/admin/login", async (req, res) => {
  try {
    const body = req.body ?? {};
    const submitted = String(body.username || "").trim().toLowerCase();
    const password = String(body.password || "");
    if (!submitted || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const allowedEmails = (process.env.ADMIN_USERNAME || "miengineering@gmail.com,miengineering17@gmail.com").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
    if (!allowedEmails.includes(submitted)) {
      return res.status(401).json({ error: "Only the admin email is allowed to sign in." });
    }
    let dbUser = null;
    let dbAvailable = false;
    try {
      const rows = await Promise.race([
        storage.getAdminByUsername(submitted).then((u) => u ? [u] : []),
        new Promise((_, rej) => setTimeout(() => rej(new Error("DB_TIMEOUT")), 4500))
      ]);
      dbUser = rows[0] ?? null;
      dbAvailable = true;
    } catch (dbErr) {
      console.warn("[login] DB unavailable:", dbErr.message, "\u2014 using env var fallback");
    }
    if (dbAvailable && dbUser) {
      const ok = await verifyPassword(password, dbUser.passwordHash);
      if (!ok) return res.status(401).json({ error: "Invalid password" });
    } else if (dbAvailable && !dbUser) {
      return res.status(401).json({ error: "Admin not initialised \u2014 run db:push and db:seed" });
    } else {
      const envPass = process.env.ADMIN_PASSWORD || "6392061892";
      if (password !== envPass) return res.status(401).json({ error: "Invalid password" });
      console.log("[login] ENV VAR FALLBACK: authenticated via ADMIN_PASSWORD");
    }
    res.json({ token: signToken({ id: dbUser?.id ?? 0, username: submitted }) });
  } catch (e) {
    console.error("[login] Error:", e.message, e.stack);
    res.status(500).json({ error: "Internal server error during login." });
  }
});
app.get("/api/admin/verify", requireAuth, (_req, res) => res.json({ ok: true }));
app.post("/api/admin/google-login", async (req, res) => {
  try {
    const credential = String(req.body?.credential || "").trim();
    if (!credential) return res.status(400).json({ error: "Missing Google credential" });
    const expectedAud = process.env.GOOGLE_CLIENT_ID || "";
    if (!expectedAud) {
      return res.status(500).json({ error: "Google login not configured. Set GOOGLE_CLIENT_ID env var." });
    }
    const verifyUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`;
    const r = await fetch(verifyUrl);
    if (!r.ok) return res.status(401).json({ error: "Invalid Google token" });
    const payload = await r.json();
    const audOk = String(payload.aud || "") === expectedAud;
    const issOk = ["accounts.google.com", "https://accounts.google.com"].includes(String(payload.iss || ""));
    const expOk = Number(payload.exp || 0) * 1e3 > Date.now();
    if (!audOk || !issOk || !expOk) {
      return res.status(401).json({ error: "Invalid Google token" });
    }
    if (!payload.email_verified || payload.email_verified === "false") {
      return res.status(401).json({ error: "Google email is not verified" });
    }
    const email = String(payload.email || "").trim().toLowerCase();
    const allowedEmails = (process.env.ADMIN_USERNAME || "miengineering@gmail.com,miengineering17@gmail.com").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
    if (!allowedEmails.includes(email)) {
      return res.status(403).json({ error: "This Google account is not authorised for admin access." });
    }
    let adminId = 0;
    try {
      const existing = await storage.getAdminByUsername(email);
      if (existing) adminId = existing.id;
    } catch (e) {
      console.warn("[google-login] DB lookup failed:", e?.message);
    }
    res.json({ token: signToken({ id: adminId, username: email, via: "google" }) });
  } catch (e) {
    console.error("[google-login] Error:", e?.message ?? e);
    res.status(500).json({ error: "Google sign-in failed" });
  }
});
var sanitiseUser = (u) => ({
  id: u.id,
  email: u.email,
  name: u.name,
  phone: u.phone,
  company: u.company,
  picture: u.picture,
  provider: u.provider,
  createdAt: u.createdAt
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
    provider: "password"
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
app.post("/api/auth/google", wrap(async (req, res) => {
  const credential = String(req.body?.credential || "").trim();
  if (!credential) return res.status(400).json({ error: "Missing Google credential" });
  const expectedAud = process.env.GOOGLE_CLIENT_ID || "";
  if (!expectedAud) return res.status(500).json({ error: "Google login not configured." });
  const verifyUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`;
  const r = await fetch(verifyUrl);
  if (!r.ok) return res.status(401).json({ error: "Invalid Google token" });
  const payload = await r.json();
  if (String(payload.aud || "") !== expectedAud) return res.status(401).json({ error: "Invalid Google token" });
  if (!["accounts.google.com", "https://accounts.google.com"].includes(String(payload.iss || ""))) {
    return res.status(401).json({ error: "Invalid Google token" });
  }
  if (Number(payload.exp || 0) * 1e3 <= Date.now()) return res.status(401).json({ error: "Google token expired" });
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
      provider: "google"
    });
  }
  const token = signToken({ id: user.id, email: user.email, kind: "user" });
  res.json({ token, user: sanitiseUser(user) });
}));
app.get("/api/auth/me", requireUser, wrap(async (req, res) => {
  const id = req.user?.id;
  const user = id ? await storage.getUserById(id) : null;
  if (!user) return res.status(401).json({ error: "Account not found" });
  res.json({ user: sanitiseUser(user) });
}));
app.patch("/api/auth/me", requireUser, wrap(async (req, res) => {
  const id = req.user?.id;
  if (!id) return res.status(401).json({ error: "Unauthorized" });
  const schema = import_zod2.z.object({
    name: import_zod2.z.string().min(2).optional(),
    phone: import_zod2.z.string().optional(),
    company: import_zod2.z.string().optional()
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid data" });
  const updated = await storage.updateUser(id, parsed.data);
  res.json({ user: sanitiseUser(updated) });
}));
app.get("/api/products", wrap(async (_req, res) => res.json(await storage.listProducts())));
app.get("/api/products/:slug", wrap(async (req, res) => {
  const p = await storage.getProduct(req.params.slug);
  if (!p) return res.status(404).json({ error: "Not found" });
  res.json(p);
}));
app.get("/api/industries", wrap(async (_req, res) => res.json(await storage.listIndustries())));
app.get("/api/industries/:slug", wrap(async (req, res) => {
  const i = await storage.getIndustry(req.params.slug);
  if (!i) return res.status(404).json({ error: "Not found" });
  res.json(i);
}));
app.get("/api/standards", wrap(async (_req, res) => res.json(await storage.listStandards())));
app.get("/api/standards/:slug", wrap(async (req, res) => {
  const s = await storage.getStandard(req.params.slug);
  if (!s) return res.status(404).json({ error: "Not found" });
  res.json(s);
}));
app.post("/api/contact", wrap(async (req, res) => {
  const parsed = insertContactSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid", details: parsed.error.flatten() });
  const submission = await storage.createContact(parsed.data);
  sendContactEmail(parsed.data).catch((e) => console.error("[mailer] error:", e));
  res.json({ ok: true, id: submission.id });
}));
app.post("/api/admin/upload", requireAuth, upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file" });
  res.json({ url: `/uploads/${req.file.filename}` });
});
app.post("/api/admin/products", requireAuth, wrap(async (req, res) => {
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
app.post("/api/admin/industries", requireAuth, wrap(async (req, res) => {
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
app.post("/api/admin/standards", requireAuth, wrap(async (req, res) => {
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
app.get("/api/media", wrap(async (_req, res) => res.json(await storage.listMedia())));
app.post("/api/admin/media", requireAuth, wrap(async (req, res) => {
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
app.get("/api/catalog.pdf", async (req, res) => {
  try {
    const map = await storage.getSiteContentMap();
    const customUrl = (map["catalog.pdfUrl"] || "").trim();
    if (customUrl && customUrl.startsWith("/uploads/")) {
      const fp = import_path2.default.resolve(UPLOAD_DIR2, import_path2.default.basename(customUrl));
      if (import_fs2.default.existsSync(fp)) {
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="MI-Engineering-Works-Catalog.pdf"`);
        res.setHeader("Cache-Control", "public, max-age=300");
        return import_fs2.default.createReadStream(fp).pipe(res);
      }
    }
  } catch (e) {
    console.error("[catalog] custom pdf check failed:", e);
  }
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", 'attachment; filename="MI-Engineering-Works-Catalog.pdf"');
  res.setHeader("Cache-Control", "public, max-age=300");
  generateCatalogPdf(res);
});
var pdfUpload = (0, import_multer.default)({
  storage: storageMulter,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf" || file.originalname.toLowerCase().endsWith(".pdf")) cb(null, true);
    else cb(new Error("Only PDF files are allowed"));
  }
});
app.post("/api/admin/catalog-pdf", requireAuth, (req, res) => {
  pdfUpload.single("file")(req, res, async (err) => {
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
      const fp = import_path2.default.resolve(UPLOAD_DIR2, import_path2.default.basename(customUrl));
      if (import_fs2.default.existsSync(fp)) import_fs2.default.unlinkSync(fp);
    }
  } catch (e) {
    console.error("[catalog] delete failed:", e);
  }
  await storage.upsertSiteContent({ key: "catalog.pdfUrl", value: "" });
  res.json({ ok: true });
});
app.get("/api/admin/customers", requireAuth, wrap(async (_req, res) => res.json(await storage.listCustomers())));
app.get("/api/admin/customers/:id", requireAuth, wrap(async (req, res) => {
  const c = await storage.getCustomer(Number(req.params.id));
  if (!c) return res.status(404).json({ error: "Not found" });
  res.json(c);
}));
app.post("/api/admin/customers", requireAuth, wrap(async (req, res) => {
  const { insertCustomerSchema: insertCustomerSchema2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  const parsed = insertCustomerSchema2.parse(req.body || {});
  res.json(await storage.createCustomer(parsed));
}));
app.patch("/api/admin/customers/:id", requireAuth, wrap(async (req, res) => {
  res.json(await storage.updateCustomer(Number(req.params.id), req.body || {}));
}));
app.delete("/api/admin/customers/:id", requireAuth, wrap(async (req, res) => {
  await storage.deleteCustomer(Number(req.params.id));
  res.json({ ok: true });
}));
app.get("/api/admin/ledger", requireAuth, wrap(async (req, res) => {
  const customerId = req.query.customerId ? Number(req.query.customerId) : null;
  if (customerId) return res.json(await storage.listLedgerByCustomer(customerId));
  res.json(await storage.listLedger());
}));
app.post("/api/admin/ledger", requireAuth, wrap(async (req, res) => {
  const { insertLedgerSchema: insertLedgerSchema2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  const parsed = insertLedgerSchema2.parse(req.body || {});
  const cust = await storage.getCustomer(parsed.customerId);
  if (!cust) return res.status(400).json({ error: "Customer not found" });
  res.json(await storage.createLedger({ ...parsed, customerName: cust.name }));
}));
app.patch("/api/admin/ledger/:id", requireAuth, wrap(async (req, res) => {
  res.json(await storage.updateLedger(Number(req.params.id), req.body || {}));
}));
app.delete("/api/admin/ledger/:id", requireAuth, wrap(async (req, res) => {
  await storage.deleteLedger(Number(req.params.id));
  res.json({ ok: true });
}));
app.get("/api/admin/contacts", requireAuth, wrap(async (_req, res) => res.json(await storage.listContacts())));
app.delete("/api/admin/contacts/:id", requireAuth, wrap(async (req, res) => {
  await storage.deleteContact(Number(req.params.id));
  res.json({ ok: true });
}));
app.get("/api/site-content", wrap(async (_req, res) => res.json(await storage.getSiteContentMap())));
app.post("/api/admin/site-content", requireAuth, wrap(async (req, res) => {
  const payload = Array.isArray(req.body) ? req.body : req.body && req.body.entries || [];
  const arr = import_zod2.z.array(insertSiteContentSchema).safeParse(payload);
  if (!arr.success) return res.status(400).json({ error: arr.error.flatten() });
  res.json(await storage.bulkUpsertSiteContent(arr.data));
}));
app.get("/api/page-sections", wrap(async (req, res) => {
  const page = String(req.query.page || "home");
  res.json(await storage.listPageSections(page));
}));
app.post("/api/admin/page-sections", requireAuth, wrap(async (req, res) => {
  const parsed = insertPageSectionSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  res.json(await storage.createPageSection(parsed.data));
}));
app.patch("/api/admin/page-sections/:id", requireAuth, wrap(async (req, res) => {
  res.json(await storage.updatePageSection(Number(req.params.id), req.body));
}));
app.delete("/api/admin/page-sections/:id", requireAuth, wrap(async (req, res) => {
  await storage.deletePageSection(Number(req.params.id));
  res.json({ ok: true });
}));
app.get("/api/floating-images", wrap(async (_req, res) => res.json(await storage.listEnabledFloatingImages())));
app.get("/api/admin/floating-images", requireAuth, wrap(async (_req, res) => res.json(await storage.listFloatingImages())));
app.post("/api/admin/floating-images", requireAuth, wrap(async (req, res) => {
  const { insertFloatingImageSchema: insertFloatingImageSchema2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  const parsed = insertFloatingImageSchema2.safeParse(req.body || {});
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
async function ensureDefaultAdmin() {
  const password = process.env.ADMIN_PASSWORD || "6392061892";
  const allowedEmails = (process.env.ADMIN_USERNAME || "miengineering@gmail.com,miengineering17@gmail.com").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  const hash = await hashPassword(password);
  for (const email of allowedEmails) {
    const existing = await storage.getAdminByUsername(email);
    if (!existing) {
      await storage.createAdmin(email, hash);
      console.log(`[admin] Created admin user "${email}"`);
    } else {
      await storage.updateAdminPassword(existing.id, hash);
    }
  }
}
app.post("/api/admin/mi/chat", requireAuth, async (req, res) => {
  try {
    const { message, restoreFile, restoreMode } = req.body || {};
    const r = await handleChat(String(message || ""), { restoreFile, restoreMode });
    res.json(r);
  } catch (e) {
    console.error("[mi/chat]", e);
    res.status(500).json({ kind: "error", reply: `\u274C ${e.message || "Internal error"}` });
  }
});
app.post("/api/admin/mi/backup", requireAuth, async (req, res) => {
  try {
    const r = await createBackup(String(req.body?.label || "manual"));
    res.json(r);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.post("/api/admin/mi/backup/full", requireAuth, async (req, res) => {
  try {
    const r = await createFullBackup(String(req.body?.label || "manual"));
    res.json(r);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
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
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.delete("/api/admin/mi/backups/:file", requireAuth, (req, res) => {
  try {
    const r = deleteBackup(String(req.params.file || ""));
    res.json(r);
  } catch (e) {
    res.status(404).json({ error: e.message });
  }
});
var backupUpload = (0, import_multer.default)({
  storage: import_multer.default.memoryStorage(),
  limits: { fileSize: 200 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/json" || file.originalname.toLowerCase().endsWith(".json")) cb(null, true);
    else cb(new Error("Only .json backup files are allowed"));
  }
});
app.post("/api/admin/mi/backups/upload", requireAuth, (req, res) => {
  backupUpload.single("file")(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message || "Upload failed" });
    if (!req.file) return res.status(400).json({ error: "No file" });
    try {
      const r = saveUploadedBackup(req.file.originalname, req.file.buffer);
      res.json(r);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });
});
app.get("/api/admin/mi/health", requireAuth, async (_req, res) => {
  try {
    res.json(await healthCheck());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.get("/api/admin/mi/backups/:file/download", requireAuth, (req, res) => {
  const safe = import_path2.default.basename(String(req.params.file || ""));
  const full = import_path2.default.resolve("data/backups", safe);
  if (!import_fs2.default.existsSync(full)) return res.status(404).json({ error: "Not found" });
  res.download(full, safe);
});
app.use((err, _req, res, _next) => {
  console.error("[express] Unhandled error:", err?.message ?? err);
  console.error("[express] Stack:", err?.stack ?? "(no stack)");
  let message = "Internal server error.";
  if (err?.message?.includes("ECONNREFUSED") || err?.message?.includes("timeout") || err?.message?.includes("connect")) {
    message = "Cannot reach the database. Ensure DATABASE_URL is set and accessible from Vercel.";
  }
  if (res.headersSent) return;
  res.status(err?.status ?? 500).json({ error: message });
});
ensureDefaultAdmin().catch((e) => console.error("admin bootstrap failed", e));
setTimeout(() => {
  runDataFixes().catch((e) => console.error("[data-fix] failed at boot:", e));
}, 2e3);
var NODE_ENV = process.env.NODE_ENV || "development";
if (NODE_ENV === "production" && !process.env.VERCEL) {
  const distDir = import_path2.default.resolve("dist");
  if (import_fs2.default.existsSync(distDir)) {
    app.use(import_express.default.static(distDir, { maxAge: "1h", index: false }));
    app.get(/^\/(?!api\/|uploads\/).*/, (_req, res) => {
      res.sendFile(import_path2.default.join(distDir, "index.html"));
    });
    console.log(`[server] serving production build from ${distDir}`);
  } else {
    console.warn(
      "[server] NODE_ENV=production but dist/ not found.\n        Run `npm run build` before `npm start`."
    );
  }
}
if (process.env.VERCEL) {
  console.log("[server] running as Vercel serverless function");
} else {
  ensureFirstRunBackup().catch((e) => console.error("first-run backup failed", e));
  startBackupScheduler();
  const PORT2 = Number(process.env.PORT || process.env.SERVER_PORT || 3001);
  app.listen(PORT2, "0.0.0.0", () => {
    console.log(`[server] listening on :${PORT2} (${NODE_ENV})`);
  });
}
var server_default = app;
