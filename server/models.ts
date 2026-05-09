import mongoose, { Schema } from "mongoose";

const { model, models } = mongoose;

// ── Products ──────────────────────────────────────────────────────────────────
const ProductSchema = new Schema({
  slug: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  image: String,
  images: [String],
  category: String,
  standard: String,
  description: String,
  sizes: String,
  threads: String,
  length: String,
  material: String,
  finish: [String],
  grades: [String],
  applications: [String],
  dimensions: [{ label: String, value: String }],
  sortOrder: { type: Number, default: 0 },
}, { timestamps: true });

// ── Industries ────────────────────────────────────────────────────────────────
const IndustrySchema = new Schema({
  slug: { type: String, required: true, unique: true },
  name: String,
  description: String,
  heroDescription: String,
  image: String,
  grades: [{ grade: String, specification: String, usage: String }],
  applications: [{ name: String, description: String, image: String }],
  keyRequirements: [String],
  sortOrder: { type: Number, default: 0 },
}, { timestamps: true });

// ── Standards ─────────────────────────────────────────────────────────────────
const StandardSchema = new Schema({
  slug: { type: String, required: true, unique: true },
  code: String,
  name: String,
  region: String,
  description: String,
  image: String,
  scope: String,
  applications: [String],
  materials: [String],
  examples: [String],
  sortOrder: { type: Number, default: 0 },
}, { timestamps: true });

// ── Media ─────────────────────────────────────────────────────────────────────
const MediaSchema = new Schema({
  type: { type: String, enum: ["photo", "video"], default: "photo" },
  category: { type: String, default: "gallery" },
  url: String,
  title: String,
  caption: String,
  thumbnail: String,
  sortOrder: { type: Number, default: 0 },
}, { timestamps: true });

// ── Floating Images ───────────────────────────────────────────────────────────
const FloatingImageSchema = new Schema({
  url: String,
  title: String,
  enabled: { type: Boolean, default: true },
  duration: { type: Number, default: 6 },
  delay: { type: Number, default: 0 },
  positionX: { type: Number, default: 50 },
  positionY: { type: Number, default: 50 },
  size: { type: Number, default: 120 },
  sortOrder: { type: Number, default: 0 },
}, { timestamps: true });

// ── Page Sections ─────────────────────────────────────────────────────────────
const PageSectionSchema = new Schema({
  page: { type: String, default: "home" },
  type: String,
  title: String,
  subtitle: String,
  content: String,
  image: String,
  enabled: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
}, { timestamps: true });

// ── Site Content (key/value) ──────────────────────────────────────────────────
const SiteContentSchema = new Schema({
  key: { type: String, required: true, unique: true },
  value: String,
}, { timestamps: true });

// ── Contacts ──────────────────────────────────────────────────────────────────
const ContactSchema = new Schema({
  fullName: String,
  email: String,
  phone: String,
  companyName: String,
  message: String,
}, { timestamps: true });

// ── Customers ─────────────────────────────────────────────────────────────────
const CustomerSchema = new Schema({
  name: { type: String, required: true },
  phone: String,
  address: String,
  notes: String,
}, { timestamps: true });

// ── Ledger Entries ────────────────────────────────────────────────────────────
const LedgerEntrySchema = new Schema({
  customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
  customerName: String,
  invoiceDate: String,
  invoiceNo: String,
  amountDue: Schema.Types.Mixed,
  amountReceived: Schema.Types.Mixed,
  paymentDate: String,
  notes: String,
  tallyReceiptDone: { type: Boolean, default: false },
  bookEntryDone: { type: Boolean, default: false },
}, { timestamps: true });

function getModel<T>(name: string, schema: Schema) {
  return (models[name] as mongoose.Model<T>) || model<T>(name, schema);
}

export const Product = getModel("Product", ProductSchema);
export const Industry = getModel("Industry", IndustrySchema);
export const Standard = getModel("Standard", StandardSchema);
export const Media = getModel("Media", MediaSchema);
export const FloatingImage = getModel("FloatingImage", FloatingImageSchema);
export const PageSection = getModel("PageSection", PageSectionSchema);
export const SiteContent = getModel("SiteContent", SiteContentSchema);
export const Contact = getModel("Contact", ContactSchema);
export const Customer = getModel("Customer", CustomerSchema);
export const LedgerEntry = getModel("LedgerEntry", LedgerEntrySchema);
