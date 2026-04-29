# M.I. Engineering Works — Backend (Node.js + Express + Drizzle)

This zip contains ONLY the backend (Express API + admin + backups + DB layer).
The frontend is shipped separately as `mi-frontend.zip`.

Hosting requirement: a cPanel plan that includes **Setup Node.js App**
(Phusion Passenger), Node 20+.

---

## 1. What is in this zip

```
mi-backend/
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
2. Open **File Manager** → go to your home folder, e.g. `/home/USERNAME/`.
3. Create a new folder, e.g. `mi-engineering` (NOT inside `public_html`).
4. Upload `mi-backend.zip` and **Extract** it inside `mi-engineering/`.
5. Inside `mi-engineering/`, **rename `.env.example` to `.env`** and edit it.

> If you also want this Node app to serve the frontend (recommended), then
> create a `dist/` folder inside `mi-engineering/` and extract
> `mi-frontend.zip` into it. Skip this step if you'll serve the frontend
> from Apache/`public_html` separately.

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

NODE_ENV=production
```

> **Important:** `JWT_SECRET` and `ADMIN_PASSWORD` MUST be changed before going live.

---

## 4. Create the Node.js application in cPanel

1. Open **cPanel → Setup Node.js App**.
2. Click **Create Application** with:
   - **Node.js version:** `20.x` or higher
   - **Application mode:** `Production`
   - **Application root:** `mi-engineering`
   - **Application URL:** your domain (e.g. `miengineering.in`)
     - Or a sub-domain like `api.miengineering.in` if you'll host frontend separately.
   - **Application startup file:** `server/index.ts`
3. Click **Create**.

cPanel will show you a command line like
`source /home/USERNAME/nodevenv/mi-engineering/20/bin/activate && cd /home/USERNAME/mi-engineering`.
Open **Terminal** (or SSH) and run that line — your prompt will be prefixed with the venv name.

---

## 5. Install the production packages

Still in the activated terminal:

```bash
npm install --omit=dev
```

This installs `express`, `tsx`, `drizzle-orm`, `pg`, `nodemailer`, etc. (a few minutes).

> The TypeScript backend is run directly via `tsx` — no separate "backend build" step needed.

---

## 6. Push the database schema to Neon

```bash
npm run db:push
```

Creates all tables in the Neon database from `.env`. Safe to re-run.
If it asks about destructive changes, type `n` and verify you're using a fresh DB.

---

## 7. Tell Passenger how to start the server

Back in **Setup Node.js App**:

1. **Startup file:** `server/index.ts`.
2. **Environment variables:** copy each line from `.env` into the panel
   (Passenger does NOT auto-load `.env`). At minimum:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD`
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
   - `CONTACT_TO`
3. Click **Save**, then **Restart**.

The server in `server/index.ts`:
- Listens on `process.env.PORT` (Passenger).
- Serves the API at `/api/*`.
- If a `dist/` folder exists next to it, serves the frontend statically for every other URL.

---

## 8. Hosting model

**Single domain (simplest):** put `mi-frontend.zip` contents into
`mi-engineering/dist/`. The Node app serves both API and HTML.

**Split (advanced):** host the frontend on Apache from `public_html` and the
backend on a sub-domain. The frontend zip's README has the `.htaccess`
proxy snippet for this case.

---

## 9. First-time login

Open `https://YOUR-DOMAIN/admin/login` and log in with `ADMIN_EMAIL` /
`ADMIN_PASSWORD` from `.env`.

If login returns a "Sign-in failed (200)" or HTML, Passenger isn't routing
`/api/*` to the Node app — re-check steps 4 and 7.

---

## 10. Backups (download / restore)

Inside the admin panel go to **Admin → Backups**:

- **Download Backup** → produces one ZIP with the entire database (as JSON)
  PLUS the `uploads/` folder. Save it safely.
- **Upload & Restore** → restore from any previously downloaded backup ZIP.

Backups are also stored on the server inside `data/backups/`.

---

## 11. Updating later

When you change backend code:
1. Re-upload changed files inside `server/` or `shared/`.
2. Setup Node.js App → **Restart**.

When you change frontend code:
1. Locally `npm run build` → produces a new `dist/`.
2. Upload the new built files.
3. (If frontend is served by Node app, also Restart it.)

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| 502 / app not responding | Setup Node.js App → **Stop** then **Start**. Check the **Application Log** link. |
| Admin login returns HTML | Passenger isn't routing `/api/*`. Verify Application URL and that the app is started. |
| `ECONNREFUSED` to database | Wrong `DATABASE_URL` — copy again from Neon and paste into both `.env` and the Passenger env-var panel. |
| Contact form fails | For Gmail you must use a 16-char **App Password**, not the normal password. |
| Images not appearing after upload | Make sure `uploads/` is writable: `chmod 755 uploads`. |
