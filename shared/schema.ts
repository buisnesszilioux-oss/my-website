import { pgTable, serial, integer, varchar, text, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 64 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  name: text("name").notNull(),
  image: text("image").notNull(),
  standard: text("standard").notNull(),
  description: text("description").notNull(),
  sizes: text("sizes").notNull().default(""),
  threads: text("threads").notNull().default(""),
  length: text("length").notNull().default(""),
  material: text("material").notNull().default(""),
  finish: text("finish").array().notNull().default([]),
  grades: text("grades").array().notNull().default([]),
  applications: text("applications").array().notNull().default([]),
  dimensions: jsonb("dimensions").notNull().default([]),
  sortOrder: serial("sort_order"),
});

export const industries = pgTable("industries", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  heroDescription: text("hero_description").notNull().default(""),
  image: text("image").notNull(),
  grades: jsonb("grades").notNull().default([]),
  applications: jsonb("applications").notNull().default([]),
  keyRequirements: text("key_requirements").array().notNull().default([]),
  sortOrder: serial("sort_order"),
});

export const standards = pgTable("standards", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  code: text("code").notNull(),
  name: text("name").notNull(),
  region: text("region").notNull().default(""),
  description: text("description").notNull(),
  image: text("image").notNull().default(""),
  scope: text("scope").notNull().default(""),
  applications: text("applications").array().notNull().default([]),
  materials: text("materials").array().notNull().default([]),
  examples: text("examples").array().notNull().default([]),
  sortOrder: serial("sort_order"),
});

export const media = pgTable("media", {
  id: serial("id").primaryKey(),
  type: varchar("type", { length: 16 }).notNull(),
  url: text("url").notNull(),
  title: text("title").notNull().default(""),
  caption: text("caption").notNull().default(""),
  thumbnail: text("thumbnail").notNull().default(""),
  sortOrder: serial("sort_order"),
});

export const contactSubmissions = pgTable("contact_submissions", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  companyName: text("company_name").notNull().default(""),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Editable site content — key/value JSON store for hero/about/stats/contact, etc.
export const siteContent = pgTable("site_content", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 128 }).notNull().unique(),
  value: text("value").notNull().default(""),
});

// Custom sections admin can add to the homepage
export const pageSections = pgTable("page_sections", {
  id: serial("id").primaryKey(),
  page: varchar("page", { length: 64 }).notNull().default("home"),
  position: varchar("position", { length: 64 }).notNull().default("after-stats"),
  title: text("title").notNull().default(""),
  subtitle: text("subtitle").notNull().default(""),
  body: text("body").notNull().default(""),
  image: text("image").notNull().default(""),
  linkText: text("link_text").notNull().default(""),
  linkUrl: text("link_url").notNull().default(""),
  enabled: boolean("enabled").notNull().default(true),
  sortOrder: serial("sort_order"),
});

export const insertMediaSchema = createInsertSchema(media).omit({ id: true, sortOrder: true });
export type Media = typeof media.$inferSelect;
export type InsertMedia = z.infer<typeof insertMediaSchema>;

export const insertProductSchema = createInsertSchema(products).omit({ id: true, sortOrder: true });
export const insertIndustrySchema = createInsertSchema(industries).omit({ id: true, sortOrder: true });
export const insertStandardSchema = createInsertSchema(standards).omit({ id: true, sortOrder: true });

// Contact: hand-rolled to avoid drizzle-zod ↔ zod v3/v4 cross-version issues
export const insertContactSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(7, "Phone is required"),
  companyName: z.string().optional().default(""),
  message: z.string().min(5, "Message is required"),
});

export const insertSiteContentSchema = z.object({
  key: z.string().min(1),
  value: z.string().default(""),
});

// Ledger / Khata — Customers (created first)
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull().default(""),
  address: text("address").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCustomerSchema = z.object({
  name: z.string().min(1, "Customer name is required"),
  phone: z.string().optional().default(""),
  address: z.string().optional().default(""),
});
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

// Ledger / Khata — Entries (always linked to a customer)
export const ledgerEntries = pgTable("ledger_entries", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id"),
  customerName: text("customer_name").notNull(),
  invoiceDate: text("invoice_date").notNull().default(""),
  invoiceNo: text("invoice_no").notNull().default(""),
  amountDue: text("amount_due").notNull().default("0"),
  paymentDate: text("payment_date").notNull().default(""),
  amountReceived: text("amount_received").notNull().default("0"),
  receiptNo: text("receipt_no").notNull().default(""),
  notes: text("notes").notNull().default(""),
  tallyReceiptDone: boolean("tally_receipt_done").notNull().default(false),
  bookEntryDone: boolean("book_entry_done").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLedgerSchema = z.object({
  customerId: z.number().int().positive("Customer is required"),
  customerName: z.string().min(1, "Customer name is required"),
  invoiceDate: z.string().optional().default(""),
  invoiceNo: z.string().optional().default(""),
  amountDue: z.string().optional().default("0"),
  paymentDate: z.string().optional().default(""),
  amountReceived: z.string().optional().default("0"),
  receiptNo: z.string().optional().default(""),
  notes: z.string().optional().default(""),
  tallyReceiptDone: z.boolean().optional().default(false),
  bookEntryDone: z.boolean().optional().default(false),
});
export type LedgerEntry = typeof ledgerEntries.$inferSelect;
export type InsertLedger = z.infer<typeof insertLedgerSchema>;

export const insertPageSectionSchema = z.object({
  page: z.string().default("home"),
  position: z.string().default("after-stats"),
  title: z.string().default(""),
  subtitle: z.string().default(""),
  body: z.string().default(""),
  image: z.string().default(""),
  linkText: z.string().default(""),
  linkUrl: z.string().default(""),
  enabled: z.boolean().default(true),
});

export type Product = typeof products.$inferSelect;
export type Industry = typeof industries.$inferSelect;
export type Standard = typeof standards.$inferSelect;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type SiteContent = typeof siteContent.$inferSelect;
export type PageSection = typeof pageSections.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertIndustry = z.infer<typeof insertIndustrySchema>;
export type InsertStandard = z.infer<typeof insertStandardSchema>;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type InsertSiteContent = z.infer<typeof insertSiteContentSchema>;
export type InsertPageSection = z.infer<typeof insertPageSectionSchema>;
