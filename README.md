# M.I. Engineering Works — Website

Full-stack site (React + Vite + Express + PostgreSQL/Drizzle) for the M.I. Engineering Works business with an integrated admin panel.

## Local development

```bash
npm install
npm run db:push     # creates / syncs the database schema
npm run db:seed     # seeds initial products, industries, standards
npm run dev         # starts vite (5000) + express (3001) together
```

Default admin login: `miengineering@gmail.com` / `6392061892`
(Override with `ADMIN_USERNAME` and `ADMIN_PASSWORD` env vars.)

## Pushing to GitHub — what travels with the repo

The `.gitignore` is configured so that **all** of the following ARE pushed:

| Folder                | What's inside                                       |
| --------------------- | --------------------------------------------------- |
| `src/`                | All React frontend code                             |
| `server/`             | Express backend, storage, auth, mailer, mi-service  |
| `shared/`             | Shared schema and types                             |
| `public/`             | Static assets (favicon, robots, sitemap)            |
| `src/assets/`         | Bundled product / hero images                       |
| `attached_assets/`    | Reference docs and original assets                  |
| `uploads/`            | Admin-uploaded images, videos, PDFs                 |
| `data/backups/`       | Database + file backups created from /admin/backups |

What does **NOT** push:
- `node_modules/` (run `npm install` after cloning)
- `.env` files (secrets — see below)
- `dist/` build output

### "My data is missing on GitHub" — how to fix

1. **The website data lives in PostgreSQL**, not in the repo. After deploying you must:
   - Set the `DATABASE_URL` environment variable on the new host.
   - Run `npm run db:push` once to create the tables.
   - Run `npm run db:seed` to load the initial products / industries / standards.
   - **OR** restore a backup file (admin → Backups → Upload `.json`).

2. **Uploaded images live in `uploads/`** which IS pushed to git. If they're missing, run `git status` on the original machine and `git add uploads/ data/ attached_assets/` before committing.

3. **Always create a backup before pushing**: open `/admin/backups`, click "Create Full Backup" (DB + uploaded files). The download is a single `.json` file — keep it safe and re-upload it on any new environment to instantly restore everything.

## Environment variables

Create a `.env` file (NEVER commit it):

```env
DATABASE_URL=postgres://user:pass@host/dbname

ADMIN_USERNAME=youremail@example.com
ADMIN_PASSWORD=your-secure-password
JWT_SECRET=any-long-random-string

# Optional — outgoing contact email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=youremail@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="M.I. Engineering <youremail@gmail.com>"
SMTP_TO=youremail@gmail.com
```

A safe template lives at `.env.example`.

## Admin panel (`/admin`)

Available pages (all gated by JWT login):

- **Dashboard** — overview
- **MI Chat** — natural-language admin assistant (backup, restore, health)
- **Backups** — create / upload / restore full website backups
- **Branding & Identity** — brand name, tagline, logo, favicon, GST, social links
- **Theme & Colors** — change site palette with presets or custom HSL values
- **Animations** — choose background / card animations
- **Site Content** — hero, about, stats, contact text
- **Custom Sections** — add extra blocks to the homepage
- **Products / Industries / Standards / Applications / Specifications** — full CRUD
- **Grade Chart** — technical reference table
- **PDF Catalog** — upload / manage downloadable catalog
- **Photos & Videos** — media gallery with category filters: **Hero / Product / Banner / Gallery**
- **Calculator** — bolt / load calculator (admin-only tool)
- **Ledger / Khata** — customers + invoices
- **Submissions** — contact form responses

## Useful scripts

```bash
npm run dev        # start dev (vite + express)
npm run build      # production frontend bundle
npm run db:push    # sync Drizzle schema to DB
npm run db:seed    # seed reference data
npx tsx scripts/fix-cats.ts   # re-run product category backfill manually
```

## Deployment notes

- This project deploys cleanly to Replit (autoscale), Vercel, or any Node host that exposes `PORT=3001` (Express) + serves the Vite build under the same domain.
- On Vercel, the express app is mounted as a serverless function from `server/index.ts` and uploads land in `/tmp` (ephemeral). For persistent uploads in production, mount cloud object storage and update `UPLOAD_DIR` in `server/index.ts`.
