# M.I. Engineering Works — Fastener Manufacturer Site

Marketing + content-managed site for M.I. Engineering Works, manufacturer of ASTM A193 Grade B7 high-tensile fasteners (Mumbai, India).

## Stack
- **Frontend**: React 18 + Vite 5, TypeScript, Tailwind, shadcn/ui, framer-motion, react-router-dom, react-helmet-async, TanStack Query v5. Static SPA served by Vite dev server on port 5000.
- **Backend**: Firebase only — **Auth (Email/Password + Google)** + **Firestore**. No Node backend in production. The frontend talks directly to Firebase via the client SDK.
- **Database**: Firestore collections — `users`, `siteContent`, `pageSections`, `floatingImages`, `products`, `industries`, `standards`, `media`, `contacts`, `customers`, `ledgerEntries`. Doc IDs match the legacy slugs/ids so URLs keep working.
- **Dev runner**: `concurrently` runs vite (port 5000) + a tiny no-op stub server (port 3001) under one `npm run dev`. The stub only exists so the existing dev script doesn't crash; it serves no real API.
- **Image uploads**: Cloudinary (unsigned preset). `VITE_CLOUDINARY_CLOUD_NAME` + `VITE_CLOUDINARY_UPLOAD_PRESET` set in Replit secrets.

## Replit Environment

### Running
- Workflow `Start application` runs `npm run dev` — Vite on port 5000 (webview), stub server on port 3001.
- All env vars are set in `.replit` `[userenv.shared]` section (no `.env` file needed).

### Environment Variables (already configured in Replit)
- `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`
- `VITE_ADMIN_EMAILS` — comma-separated list of admin emails
- `VITE_CLOUDINARY_CLOUD_NAME`, `VITE_CLOUDINARY_UPLOAD_PRESET`
- `VITE_GOOGLE_CLIENT_ID` — for Google sign-in
- `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `JWT_SECRET` — legacy stub server vars (unused in Firestore build)

### Deployment
- Build: `npm run build` → `vite build` → outputs to `dist/`
- Run: `node ./dist/index.cjs` (configured in `.replit` deployment section)

## Architecture (Firestore-only build)
- All `/api/*` calls go through `src/lib/firestoreApi.ts`, which maps every legacy REST route to a Firestore operation client-side. The adapter also installs a `window.fetch` interceptor so raw `fetch("/api/...")` calls in helpers (`useSiteContent`, `Footer`, `CustomSections`, etc.) are caught.
- `src/contexts/AuthContext.tsx` is backed by Firebase Auth. Each signed-in user has a `users/{uid}` Firestore profile doc. Admin status is derived from `VITE_ADMIN_EMAILS` (comma-separated allow-list).
- `src/lib/firebase.ts` reads `VITE_FIREBASE_*` env vars at build time and exports `app`, `db`, `auth`, `ADMIN_EMAILS`, `isAdminEmail()`.
- Image uploads go through `uploadFile()` in `src/lib/api.ts` → Cloudinary unsigned upload → stores `secure_url` in Firestore.
- One-time data migration: `src/data/firestore-seed/*.json` is the bundled snapshot. The admin clicks "Run full migration" on `/admin/migrate` to push it into Firestore.

## Layout
- `src/pages/` — public pages and `admin/` subfolder
- `src/components/` — reusable UI components (Header, Footer, Hero, Gallery, GradeChartSection, SpecificationsSection, …)
- `src/hooks/` — `useSiteContent` (key/value site copy), `useEditableTables` (grade chart + specs JSON tables)
- `src/lib/api.ts` — fetch helper. Routes /api/* through `firestoreApi.ts`. Attaches Firebase ID token as Bearer.
- `src/lib/firestoreApi.ts` — Transparent Firestore adapter. Intercepts /api/* paths (also installs a global `window.fetch` interceptor). Handles list/get/create/update/delete for all collections.
- `src/lib/firebase.ts` — Firebase init (auth + db) and admin email helpers.
- `src/contexts/AuthContext.tsx` — Firebase Auth + Firestore `users/{uid}` sync. Exposes `login`, `register`, `logout`, `updateProfile`, `user`, `isAdmin`.
- `server/index.ts` — stub Express server (no real routes; keeps dev script from crashing)

## Admin
- **Login**: `/admin/login` — requires Firebase Auth email + password.
- **Admin emails**: set via `VITE_ADMIN_EMAILS` env var (comma-separated).
- **Default credentials**: `miengineering17@gmail.com` / `6392061892` (Firebase Auth user must exist).
- **Sections**: Dashboard, Site Content, Custom Sections, Products, Catalogue, Industries, Standards, Grade Chart, Specifications, PDF Catalog, Photos & Videos, Floating Images, Hero, Branding, Animations, Theme, Ledger, Contacts, Applications, Backups, Migrate.

### Key admin features
- **Floating Images** — `/admin/floating-images`: upload images that float on the hero with CSS animations.
- **Ledger / Khata** — `/admin/ledger`: customer invoicing with Tally (T) and Book Entry (B) status tracking.
- **Branding** — `/admin/branding`: edit brand name, tagline, logo, favicon, GST, social links.
- **Animations** — `/admin/animations`: choose product-card and background animation presets.
- **Migrate** — `/admin/migrate`: one-time Postgres→Firestore data import.

### Editable Grade Chart & Specifications
Stored as JSON strings in `siteContent` Firestore collection under these keys:
- `grade.bolts`, `grade.nuts`, `grade.dims`
- `specs.chemical`, `specs.mechMetric`, `specs.mechImperial`

### PDF Catalog
- Admin: `/admin/catalog` — upload PDF; stored URL in `siteContent["catalog.pdfUrl"]`.
