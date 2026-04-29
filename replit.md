# M.I. Engineering Works — Fastener Manufacturer Site

Marketing + content-managed site for M.I. Engineering Works, manufacturer of ASTM A193 Grade B7 high-tensile fasteners (Mumbai, India).

## Stack
- **Frontend**: React 18 + Vite 5, TypeScript, Tailwind, shadcn/ui, framer-motion, react-router-dom, react-helmet-async, TanStack Query v5
- **Backend (legacy, being phased out)**: Express + TypeScript (`tsx watch`), `multer` uploads, `pdfkit` catalogs. Still serves uploads/PDF/MI-chat/backups/ledger/applications.
- **Backend (current)**: Firebase — Auth (Email/Password) + Firestore. See `FIREBASE_SETUP.md`.
- **Database (legacy)**: PostgreSQL via Drizzle ORM; schemas in `shared/schema.ts` (kept as the source of record while migration is in progress).
- **Database (current)**: Firestore collections — `users`, `siteContent`, `pageSections`, `floatingImages`, `products`, `industries`, `standards`, `media`, `contacts`. Migrated routes are intercepted transparently by `src/lib/firestoreApi.ts`.
- **Dev runner**: `concurrently` runs vite (port 5000) + server (port 3001) under one `npm run dev` workflow

## Layout
- `src/pages/` — public pages and `admin/` subfolder
- `src/components/` — reusable UI components (Header, Footer, Hero, Gallery, GradeChartSection, SpecificationsSection, …)
- `src/hooks/` — `useSiteContent` (key/value site copy), `useEditableTables` (grade chart + specs JSON tables)
- `src/lib/api.ts` — fetch helper. Routes /api/* through `firestoreApi.ts` first; falls back to Node backend for un-migrated routes. Attaches Firebase ID token as Bearer.
- `src/lib/firestoreApi.ts` — Transparent Firestore adapter. Intercepts /api/* paths (also installs a global `window.fetch` interceptor so raw fetch() calls in `useSiteContent`, `Footer`, `CustomSections` are caught). Handles list/get/create/update/delete for migrated collections. Exports `importBatchToCollection` used by the Migrate page.
- `src/lib/firebase.ts` — Firebase init (auth + db) and `ADMIN_EMAIL`.
- `src/contexts/AuthContext.tsx` — Firebase Auth + Firestore `users/{uid}` sync. Exposes `login`, `register`, `logout`, `updateProfile`, `user`, `isAdmin`.
- `src/pages/admin/AdminMigrate.tsx` — One-time "Postgres → Firestore" import button (uses real un-intercepted fetch to read from /api/* on the Node backend, then writes to Firestore via `importBatchToCollection`).
- `server/index.ts` — all Express routes
- `server/storage.ts` — Drizzle storage interface
- `server/catalog-pdf.ts` — branded PDF generator (fallback when no custom PDF uploaded)

## Admin
- **Login**: `/admin/login` — requires email + password.
- **Default credentials** (`ADMIN_USERNAME`, `ADMIN_PASSWORD` env vars):
  - Email: `miengineering@gmail.com` (also accepts `miengineering17@gmail.com`)
  - Password: `6392061892`
- Bootstrap on server start: creates/updates admin users with the env password each boot so credentials stay in sync.
- **Sections**: Dashboard, Site Content, Custom Sections, Products, Industries, Standards, Grade Chart, Specifications, PDF Catalog, Photos & Videos, Floating Images, Submissions.

### Floating Images
- Table `floating_images` (id, url, title, enabled, duration, delay, positionX, positionY, size).
- Public endpoint: `GET /api/floating-images` (only enabled rows). Admin CRUD at `/api/admin/floating-images`.
- Admin page `/admin/floating-images` lets staff upload images and tweak position (X/Y in %), size (px), animation duration (s) and delay (s).
- Rendered via `src/components/FloatingImages.tsx` overlaid on the hero with `.anim-float` (CSS `float-up-down` keyframe).

### Theme
- Replaced the original gold (`48 100% 52%`) palette with a CloudOX-style blue (`210 100% 56%`); legacy class names (`bg-gradient-gold`, `text-gradient-gold`, `gold-divider`, `shadow-gold`, `text-glow-gold`) are kept but now resolve to blue tokens — no codebase-wide rename needed.
- Favicon: `public/favicon.png` (M.I. logo). Cache-busted with `?v=2` in `index.html`.

### Editable Grade Chart & Specifications
Stored as JSON strings in `site_content` rows under these keys (with hardcoded factory defaults if unset):
- `grade.bolts`, `grade.nuts`, `grade.dims`
- `specs.chemical`, `specs.mechMetric`, `specs.mechImperial`

The public `GradeChartSection` and `SpecificationsSection` components read via `useEditableTables()` and fall back to defaults defined in `src/hooks/useEditableTables.ts`.

### PDF Catalog
- `GET /api/catalog.pdf` serves the uploaded PDF from `site_content["catalog.pdfUrl"]` if present, otherwise streams the auto-generated branded PDF from `catalog-pdf.ts`.
- Admin: `/admin/catalog` page allows upload (PDF only, ≤25 MB) and removal.
- Endpoints: `POST /api/admin/catalog-pdf` (multipart `file`), `DELETE /api/admin/catalog-pdf`.

### Other admin behavior
- Media upload → `POST /api/admin/upload` (10 MB), files served from `/uploads/`.
- Site content batch update → `POST /api/admin/site-content` with `{ entries: [{ key, value }] }`.

## Public site notes
- Footer social row includes Email (`miengineering17@gmail.com`), Google, LinkedIn, X, Facebook, WhatsApp.
- Gallery video lightbox: top control bar with type badge, title, fullscreen, download, and close; ESC closes; body scroll locked while open.
- `ReviewsSection` is intentionally not used anywhere; the file may exist but has no callers.

## Running
- Workflow `Start application` runs `npm run dev`. Vite auto-restarts on edits; server uses `tsx watch`.
- DB schema sync: `npm run db:push` (use `--force` if needed). Seed: `npm run db:seed`.
- Production: `npm run build && npm start` (single Express process serves both API and the built SPA).

## Self-Hosted Deployment (cPanel / VPS / Render)
The app runs as a **single Node process** in production — Express serves both the `/api/*` endpoints AND the built React app from `dist/`. No reverse proxy or second server needed.

### One-time setup
1. Copy `.env.example` to `.env` and fill in real values (at minimum `DATABASE_URL` and `JWT_SECRET`).
2. `npm install` — installs all dependencies.
3. `npm run db:push` — creates / syncs all tables in your PostgreSQL database.

### Build & start
```
npm run build    # builds the React frontend into dist/
npm start        # boots Express on $PORT (or 3000 if unset)
```

### How it picks the port
`server/index.ts` reads `process.env.PORT` first (the standard on Render / Heroku / cPanel), then falls back to `process.env.SERVER_PORT`, then `3001`. Always binds to `0.0.0.0` so the host's reverse proxy can reach it.

### cPanel-specific notes
- In cPanel "Setup Node.js App", set **Application startup file** to `node_modules/.bin/tsx` and **Startup arguments** to `server/index.ts` (cPanel doesn't run `npm start` directly). Or use the "Run Script" option with `start`.
- Set environment variables in the cPanel UI (don't upload `.env`).
- Make sure cPanel's Node version is **20.x or higher**.
- After uploading new code: hit "Restart" in the cPanel Node app panel.

### Required env vars (production)
- `DATABASE_URL` — PostgreSQL connection string (without this, hero images / grade chart / site content / products cannot save).
- `JWT_SECRET` — long random string for signing auth tokens.
- `ADMIN_USERNAME`, `ADMIN_PASSWORD` — admin login credentials.
- `GOOGLE_CLIENT_ID`, `VITE_GOOGLE_CLIENT_ID` (optional) — only if you want Google sign-in. Same value goes in both.
- `SMTP_*` (optional) — only if you want the contact form to email you.

### Production hardening already in place
- **Global error middleware** in `server/index.ts` — catches every uncaught route error, logs the stack, returns a clean JSON `{ error }` (never crashes the process).
- **DB pool** uses short timeouts and emits warnings on connection errors instead of crashing.
- **Static assets** served with a `1h` cache header in production.
- **SPA fallback** — any non-API GET serves `index.html`, so deep links like `/admin/products` work after refresh.

## Vercel Deployment
- Frontend: Vite builds to `dist/` (auto-detected by Vercel).
- Backend: `api/index.ts` wraps the entire Express app as a single Vercel serverless function.
- Routing: `vercel.json` rewrites `/api/*` and `/uploads/*` to the serverless function, all other routes to `index.html`.
- Required environment variables in Vercel dashboard:
  - `DATABASE_URL` — PostgreSQL connection string (same database as used locally)
  - `JWT_SECRET` — Secret for signing auth tokens (set a strong random value)
  - `ADMIN_USERNAME` — Comma-separated admin emails (default: miengineering@gmail.com,miengineering17@gmail.com)
  - `ADMIN_PASSWORD` — Admin password (default: 6392061892)
  - `SMTP_USER`, `SMTP_PASS` — (optional) Gmail SMTP credentials for contact form emails
- Note: File uploads and backups use `/tmp` on Vercel (ephemeral — files are lost between function cold-starts). For persistent uploads, consider moving to a cloud storage provider (S3, Cloudinary, etc.) in a future update.

## Recent changes (2026-04 — second batch)
- **Branding & Identity admin** at `/admin/branding`: edit brand name, tagline, logo (upload), favicon (upload — auto-applied to `<head>`), GST number, and a fully editable list of social links (label/icon/URL). Stored in `site_content` keys: `brand.name`, `brand.tagline`, `brand.logo`, `brand.favicon`, `company.gst`, `socials.json`. Defaults pre-loaded (GST `27CBFPM8207D1ZR`).
- **Footer** now renders brand name, GSTIN, contact info and socials from `site_content`. GST shown both in the brand column and the bottom copyright bar.
- **Header** logo: clicking the brand name now does a full-page hard-reload to `/` (so animations / site_content / favicon refresh). Renders uploaded logo image when set.
- **Admin auth hardened**: `RequireAdmin` now calls `GET /api/admin/verify` (server-side JWT check) before mounting any admin page. Stale / invalid tokens are auto-cleared and the user is bounced to `/admin/login` instead of seeing the dashboard.
- **Animations admin** at `/admin/animations`: choose 1 product-card animation and 1 background animation from preset packs (Lift / Tilt / Glow / Shine / Image-Zoom / Pulse for cards; Gold-Grid / Aurora / Particles / Stripes for background). Install / Unequip per type. CSS lives in `src/index.css` under "Animation Presets". Active IDs stored in `site_content` (`animations.product`, `animations.background`).
- **Calculator page** at `/calculator` (industrial black/yellow/white): MS/SS material dropdown, diameter, length, qty, rate/kg, profit %, GST toggle + rate. Live results (weight/piece, total weight, base cost, profit, subtotal, GST, grand total, rate/piece). Formula: `D*D*L*factor/1000 kg` (factor 0.0063 for MS, 0.00637 for SS). Light/Dark theme toggle persisted in localStorage. Print button.
- **Ledger / Khata module** at `/admin/ledger`: new `ledger_entries` table, full CRUD via `/api/admin/ledger`. UI features search, A–Z chip filter, status filter (Paid / Due / All), sticky header, totals (Total Due, Received, Outstanding Balance), edit/delete per row. Auto-derives Paid status when `amountReceived >= amountDue`.

## Recent changes (2026-04)
- Admin login now requires password; defaults set to `miengineering@gmail.com` / `6392061892`.
- Added Email icon to Footer socials.
- Added admin pages: Grade Chart editor, Specifications editor, PDF Catalog upload/remove.
- Made GradeChartSection and SpecificationsSection content-editable via `site_content` keys.
- Removed `ReviewsSection` from `ProductDetail.tsx`.
- Improved gallery video lightbox UI (top toolbar, fullscreen, download, ESC handling).

## Recent changes (2026-04 — third batch)
- **Applications / Use Cases admin** at `/admin/applications` and `/admin/applications/:slug`. Visual cards UI for industries (name + main image upload/preview, slug auto-generated, description). Per-industry use case manager with full CRUD (Title, Description, Image upload+preview). Persists to `industries.applications` jsonb. Reusable `ImagePicker` component exported from `AdminApplications.tsx`.
- **Dedicated public pages**: `/products`, `/about`, `/contact` now exist as their own routes (wrap `ProductsSection`, `AboutSection`, `ContactSection` with Header/Footer/PageTransition). Header nav switched from anchor scroll to real `<Link>` navigation; About link added.
- **SEO component** at `src/components/SEO.tsx`: emits unique title/description/keywords, OG/Twitter cards, canonical URL, geo (Mumbai/IN-MH), JSON-LD Organization. Used on Products / About / Contact pages.
- **MI Chat** at `/admin/mi`: locally-running admin assistant (no external/paid AI). Commands (Hindi+English): `backup`, `restore`, `list backups`, `health` / `fix`, `stats`, `help`. Chat UI shows action chips, backup list cards, health metrics. Backed by `server/mi-service.ts` and 5 endpoints under `/api/admin/mi/*`. Backup files saved to `data/backups/*.json` (committed to git so they survive GitHub→Replit roundtrips). Auto first-run backup created on server boot if none exist.

## Recent changes (2026-04 — fifth batch)
- **Header dropdowns** for Applications and Standards. Hover (or click) reveals a 2-column panel listing every industry / standard pulled from the API plus a "View all" link. Products remains a direct link with no dropdown. Mobile menu has tappable expand chevrons for the same submenus.
- **Products page revamp** at `/products`: search bar at top (matches name, standard, description, material, applications, grades) + horizontal scrollable category bar with the 9 fixed categories plus per-category counts. Combined search + category filtering with empty-state and reset button. The page now reads from `/api/products` so any admin edit is reflected live.
- **Product categories**: added `category` column to `products` schema. Boot-time `server/data-fix.ts` keyword-classifies every product into one of 9 buckets (Bolts, Nuts, Screws, Washers, Rivets, Threaded Rods / Studs, Anchors, Industrial / Heavy, Special). Admin Products edit dialog gained a Category select (new `select` field type added to `EditDialog`).
- **Restored broken Application/Standard images**: `server/data-fix.ts` runs on boot and replaces every legacy `source.unsplash.com` URL (now defunct) on industries, standards, and products with branded placeholders (`https://placehold.co/...`) using a deterministic palette. Nested `industries.applications[].image` is also fixed. `<img onError>` fallback added to product cards as a defensive layer.

## Recent changes (2026-04 — fourth batch)
- **Full website backup system** at `/admin/backups` (sidebar: "Backups"). Two backup kinds:
  - **DB** — `.json` of all tables only (small, fast).
  - **FULL** — `.json` containing all tables PLUS every file in `/uploads` inline as base64. Single-file portability; no archiver dep.
  Per row: Restore (replace), Download, Delete. Toolbar: Create FULL Backup Now, Quick DB Backup, Upload Backup (.json). Stats cards: total backups, full backups, storage used, last auto backup.
- **Daily auto-backup**: `startBackupScheduler()` runs on boot + every 6h, fires once per 24h, creates a FULL backup labelled `auto-daily`, prunes to last 7 auto-daily files. First-run backup also upgraded to FULL.
- **New backend endpoints** under `/api/admin/mi/*`: `POST /backup/full`, `DELETE /backups/:file`, `POST /backups/upload` (multer memoryStorage, 200 MB, `.json` only with shape validation). Restore now also writes any `files` field back into `/uploads`.
- **Backup file format v2**: `{version:2, kind:"db"|"full", createdAt, tables, counts, files?:{name:base64}}`. Backward-compatible with v1.
- **Ledger T (Tally Receipt) / B (Book Entry) status**: added `tallyReceiptDone` + `bookEntryDone` boolean columns to `ledger_entries`. Per-entry table now has T and B toggle buttons; row turns deeper green when payment + T + B are all done ("Fully Done"). Footer legend explains T/B.
- **Customer ledger detail page**: 3-card summary row added (T-pending, B-pending, Fully-Done counts).
- **Customer dashboard `/admin/ledger`**: top-level T-pending / B-pending / Fully-Done totals; each customer row now shows small T·N / B·N pending pills, or an "All Done" pill when everything is reconciled.
- **SEO cleanup**: removed `ASTM A193 Grade B7` from per-product JSON-LD `name` (uses `product.name` only) and from `/products` SEO description. Each product now keywords purely on its own product name.
