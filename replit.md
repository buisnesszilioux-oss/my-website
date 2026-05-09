# M.I. Engineering Works — Fastener Manufacturer Site

Marketing + content-managed site for M.I. Engineering Works, manufacturer of ASTM A193 Grade B7 high-tensile fasteners (Mumbai, India).

## Stack
- **Frontend**: React 18 + Vite 5, TypeScript, Tailwind, shadcn/ui, framer-motion, react-router-dom, react-helmet-async, TanStack Query v5. SPA served by Vite dev server on port 5000.
- **Backend**: Express.js (port 3001) + MongoDB (via Mongoose). JWT authentication.
- **Database**: MongoDB — collections: `products`, `industries`, `standards`, `media`, `floatingimages`, `pagesections`, `sitecontents`, `contacts`, `customers`, `ledgerentries`.
- **File uploads**: multer → local `uploads/` directory. Files served at `/uploads/<filename>` via Express static.
- **Dev runner**: `bash start-dev.sh` — starts mongod in background (dbpath `/tmp/mongodb-data`), then runs `tsx watch server/index.ts` + `vite` via concurrently.

## Replit Environment

### Running
- Workflow `Start application` runs `npm run dev` → `bash start-dev.sh`
  - mongod on port 27017 (dbpath `/tmp/mongodb-data`)
  - Express API on port 3001
  - Vite frontend on port 5000 (webview)
- Vite proxy: `/api/*` and `/uploads/*` → `http://localhost:3001`

### Environment Variables (already configured in Replit)
- `JWT_SECRET` — JWT signing key
- `ADMIN_USERNAME` — admin email(s), comma-separated (e.g. `miengineering17@gmail.com,sahilsabirshaikh256@gmail.com`)
- `ADMIN_PASSWORD` — admin password (e.g. `6392061892`)

### Default Admin Credentials
- Email: `miengineering17@gmail.com`
- Password: `6392061892`

### Deployment
- Build: `npm run build` → `vite build` → outputs to `dist/`
- The Express server must be running for the API to work in production.

## Architecture
- **Frontend** (`src/`) is a React SPA that calls the Express API via relative `/api/` URLs (proxied by Vite in dev, served directly in prod).
- **Backend** (`server/`) is Express + Mongoose. All data lives in MongoDB.
- **Auth**: JWT tokens issued by `POST /api/admin/login`. Token stored in `localStorage`. Attached as `Authorization: Bearer <token>` on all admin requests.
- **Image uploads**: `POST /api/admin/upload` (multipart) → multer saves to `uploads/` → returns `{ url }`. The URL uses `x-forwarded-host` for Replit proxy compatibility.
- `src/lib/api.ts` — fetch helper, attaches JWT, handles JSON. `uploadFile()` posts to `/api/admin/upload`.
- `src/contexts/AuthContext.tsx` — login/logout/verify against Express JWT API.
- `server/index.ts` — full Express REST API (all collections + upload endpoint).
- `server/models.ts` — all Mongoose schemas.
- `server/db.ts` — MongoDB connection helper.
- `start-dev.sh` — starts mongod + server + vite.

## Layout
- `src/pages/` — public pages and `admin/` subfolder
- `src/components/` — reusable UI components
- `src/hooks/` — `useSiteContent`, `useHeroImage`, `useEditableTables`, etc.
- `src/lib/api.ts` — fetch helper
- `server/index.ts` — Express API server (all routes)
- `server/models.ts` — Mongoose models
- `server/db.ts` — MongoDB connection
- `uploads/` — locally uploaded files (served at `/uploads/*`)

## Admin
- **Login**: `/admin/login` — JWT-based, email + password.
- **Sections**: Dashboard, Site Content, Custom Sections, Products, Catalogue, Industries, Standards, Grade Chart, Specifications, PDF Catalog, Photos & Videos, Floating Images, Hero, Branding, Animations, Theme, Ledger, Contacts, Applications, Backups, Migrate.

### Key admin features
- **Floating Images** — `/admin/floating-images`: upload images that float on the hero with CSS animations.
- **Ledger / Khata** — `/admin/ledger`: customer invoicing with Tally (T) and Book Entry (B) status tracking.
- **Branding** — `/admin/branding`: edit brand name, tagline, logo, favicon, GST, social links.
- **Migrate** — `/admin/migrate`: seed bundled JSON snapshot into MongoDB.

### Editable Grade Chart & Specifications
Stored as JSON strings in MongoDB `sitecontents` collection:
- `grade.bolts`, `grade.nuts`, `grade.dims`
- `specs.chemical`, `specs.mechMetric`, `specs.mechImperial`

### PDF Catalog
- Admin: `/admin/catalog` — upload PDF; stored URL in siteContent `catalog.pdfUrl`.

## Initial Data Seeding
After a fresh MongoDB start, go to `/admin/migrate` and click "Run full migration" to load the bundled seed data (85 products, 55 industries, 9 standards) into MongoDB.
