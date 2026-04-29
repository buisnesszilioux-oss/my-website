# M.I. Engineering Works — cPanel Deployment Guide

This package contains BOTH the frontend (already built into `dist/`) and the backend (Node.js Express API).
You only need to deploy this ONE folder to your cPanel hosting.

> Hosting requirement: a cPanel plan that includes **Setup Node.js App** (most cPanel plans on LiteSpeed/Apache + Phusion Passenger have this).

---

## 1. What is in this zip

```
mi-engineering-cpanel/
├── dist/                  ← Built frontend (HTML, JS, CSS, images)
├── server/                ← Express backend source (runs with tsx)
├── shared/                ← Shared types & DB schema
├── data/backups/          ← Auto-created folder for site backups
├── uploads/               ← Auto-created folder for product/site uploads
├── drizzle.config.ts
├── tsconfig.json
├── package.json           ← Production dependencies only
├── .env.example           ← Copy to .env and fill in your values
└── CPANEL_DEPLOY.md       ← THIS file
```

---

## 2. Upload the files

1. Log in to **cPanel**.
2. Open **File Manager** → go to your domain's home, e.g. `/home/USERNAME/`.
3. Create a new folder, e.g. `mi-engineering` (NOT inside `public_html`).
4. Upload the zip and **Extract** it inside `mi-engineering/`.
5. Inside `mi-engineering/`, **rename `.env.example` to `.env`** and edit it (next step).

---

## 3. Set environment variables (`.env`)

Open `.env` in the File Manager editor and replace the placeholder values:

```env
# Neon PostgreSQL (already filled in for you — change later if you migrate)
DATABASE_URL=postgresql://neondb_owner:npg_N8afFxsjA4ke@ep-shy-shadow-am3cyaj3-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Strong random secret — REPLACE before going live
JWT_SECRET=change-me-to-a-long-random-string

# Admin login (used the first time the server starts)
ADMIN_EMAIL=admin@miengineering.in
ADMIN_PASSWORD=change-me-strong-password

# SMTP (for the Contact form). Use Gmail App Password or your hosting SMTP.
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=mienginering17@gmail.com
SMTP_PASS=your-gmail-app-password
SMTP_FROM="M.I. Engineering Works <mienginering17@gmail.com>"

# Where contact form submissions are emailed
CONTACT_TO=mienginering17@gmail.com

# Set automatically by Passenger; do NOT change.
NODE_ENV=production
```

> **Important:** `JWT_SECRET` and `ADMIN_PASSWORD` MUST be changed before you go live.

---

## 4. Create the Node.js application in cPanel

1. Open **cPanel → Setup Node.js App** (sometimes labeled "Node.js Selector").
2. Click **Create Application**.
3. Fill in:
   - **Node.js version:** `20.x` (or the highest 20+ available)
   - **Application mode:** `Production`
   - **Application root:** `mi-engineering` (the folder you extracted into)
   - **Application URL:** your domain (e.g. `miengineering.in`)
   - **Application startup file:** `server/index.ts`
4. Click **Create**.

cPanel will create a Node virtual environment and show you a command line like:
`source /home/USERNAME/nodevenv/mi-engineering/20/bin/activate && cd /home/USERNAME/mi-engineering`.
Open the cPanel **Terminal** (or SSH) and run that line — you should now see your prompt prefixed with the venv name.

---

## 5. Install the production packages

In the same activated terminal, run:

```bash
npm install --omit=dev
```

This installs `express`, `tsx`, `drizzle-orm`, `pg`, `nodemailer`, etc. (a few minutes).

> Note: we run the TypeScript backend directly via `tsx`, so no separate "backend build" step is needed.

---

## 6. Push the database schema to Neon

Still in the activated terminal:

```bash
npm run db:push
```

This creates all the tables (products, contacts, admins, ledger entries, content, …) in the Neon database listed in `.env`. It is safe to run multiple times — Drizzle only applies what is needed.

If it asks about destructive changes, type `n` and re-check that you are using a fresh database.

---

## 7. Tell Passenger how to start the server

Back in **Setup Node.js App**:

1. In the **Startup file** field, set: `server/index.ts`.
2. In **Environment variables**, copy each line of your `.env` (Passenger does NOT auto-load `.env`). Add at minimum:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD`
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
   - `CONTACT_TO`
3. Click **Save**, then **Restart**.

The Express server in `server/index.ts` automatically:
- Listens on the port Passenger gives it (`process.env.PORT`).
- Serves the API at `/api/*`.
- Serves the static frontend from the `dist/` folder for every other URL.

So one Node app handles the whole site — no separate Apache/Nginx config needed.

---

## 8. Point your domain at the app

In **Setup Node.js App**, the **Application URL** you chose (e.g. `miengineering.in`) becomes the public URL.

If you'd rather use a subdirectory (`miengineering.in/app`), set Application URL accordingly. For a clean root domain, point your domain's main document root to the Passenger app — cPanel does this automatically when Application URL is the bare domain.

If you previously had a placeholder `index.html` in `public_html`, remove or rename it so it doesn't shadow the Node app.

---

## 9. First-time login

Open `https://YOUR-DOMAIN/admin/login` and log in with the `ADMIN_EMAIL` and `ADMIN_PASSWORD` you set in `.env`.

If login returns "Sign-in failed (200)" it means Passenger isn't routing `/api/*` to the Node app and the static `dist/index.html` is being returned instead. Double-check step 7 (startup file + restart) and step 8 (application URL).

---

## 10. Backups (download / restore)

Inside the admin panel go to **Admin → Backups**:

- **Download Backup** → produces one ZIP containing the entire database (as JSON) PLUS the `uploads/` folder. Save it somewhere safe (Google Drive, hard disk).
- **Upload & Restore** → choose any previously downloaded backup ZIP and the site is restored. This is what you'd use to migrate to a new server, or to roll back after a mistake.

The backup files are also stored on the server inside `data/backups/` so you can grab them by FTP/File Manager if needed.

---

## 11. Updating the site later

When you make changes locally and want to redeploy:

1. Re-build locally: `npm run build` → produces a new `dist/`.
2. Re-zip this folder (or just upload `dist/` and any changed `server/` / `shared/` files).
3. In **Setup Node.js App**, click **Restart**.

That's it — your changes are live.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| 502 / app not responding | Setup Node.js App → click **Stop** then **Start**. Check the **Application Log** link on the same screen. |
| Admin login returns HTML | Passenger isn't routing `/api/*`. Make sure the app's Application URL is the same domain you visit, and the app is started. |
| `ECONNREFUSED` to database | Wrong `DATABASE_URL` — copy it again from Neon and paste into both `.env` AND the Passenger env-var panel. |
| Contact form fails | Wrong SMTP creds. For Gmail you must use a 16-character **App Password**, not your normal password. |
| Images not appearing after upload | Make sure the `uploads/` folder is writable: `chmod 755 uploads`. |

---

You're done. The whole site (frontend + API + admin + backups) is now running from this single cPanel Node app on your Neon database.
