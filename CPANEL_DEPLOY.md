# Hosting M.I. Engineering Works on cPanel — Step by Step

This guide takes you from the two ZIPs in `cpanel-zips/` to a fully working production site on a cPanel server (Hostinger, Bluehost, Namecheap, GoDaddy cPanel, etc.).

You only need:
- A cPanel account with **Setup Node.js App** (Node 18+)
- A PostgreSQL database — we will use the free **Neon** database below
- Two ZIP files (built for you in `cpanel-zips/`):

| ZIP | What's inside | Where it goes |
|-----|---------------|---------------|
| `mi-public_html.zip` (~4.3 MB) | Built static frontend (`index.html`, JS, CSS, images) | `public_html/` (your domain root) |
| `mi-backend.zip` (~16.6 MB) | Node/Express API + dependencies + uploads folder | A separate folder, set up as a **Node.js app** in cPanel — name it **`miweb`** |

---

## 1. Upload the frontend → `public_html/`

1. Open **cPanel → File Manager → public_html**.
2. (Optional) back up anything already there and delete it.
3. Upload `mi-public_html.zip`.
4. Right-click → **Extract** (extract into `public_html/`, not into a sub-folder).
5. Delete the zip after extracting.

You should see `index.html`, `assets/`, `favicon.png`, `.htaccess`, etc. directly inside `public_html/`.

---

## 2. Upload the backend → `~/miweb/`

1. In **File Manager**, go to your home folder `/home/<your-cpanel-user>/`.
2. Create a new folder called **`miweb`**.
3. Upload `mi-backend.zip` into `miweb/`.
4. Right-click → **Extract**.
5. Delete the zip.

You should see `package.json`, `dist/server.cjs`, `server/`, `shared/`, `uploads/`, `node_modules/` inside `miweb/`.

---

## 3. Create the Node.js app in cPanel

1. Open **cPanel → Setup Node.js App**.
2. Click **Create Application** and fill in:
   - **Node.js version:** 18.x or higher
   - **Application mode:** Production
   - **Application root:** `miweb`
   - **Application URL:** leave the path empty so it serves from `/api` on your main domain
   - **Application startup file:** `dist/server.cjs`
3. Click **Create**.

> The cPanel app **name** is **`miweb`** to match the folder.

---

## 4. (Skip if `node_modules` ships) Install dependencies

The backend ZIP already includes `node_modules`, so usually nothing to do. If anything is missing or you upgraded Node:

1. Same Node.js App page → **Run NPM Install** (1–3 minutes).

---

## 5. Set environment variables

Still on the Node.js App page → **Environment variables** → click **+** for each row:

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | (leave blank — cPanel sets this) |
| `DATABASE_URL` | `postgresql://neondb_owner:npg_N8afFxsjA4ke@ep-shy-shadow-am3cyaj3-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require` |
| `JWT_SECRET` | `miweb-prod-jwt-2026-d4f7a92e1b3c8e5f9a7b2c4d6e8f0a1b3c5d7e9f1a2b4c6d8e0` *(or any long random string)* |
| `ADMIN_USERNAME` | `miengineering17@gmail.com,sahilsabirshaikh256@gmail.com` |
| `ADMIN_PASSWORD` | `6392061892` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`, `MAIL_TO` | *Optional* — only needed if you want the contact form to email you |

Click **Save** after adding each.

---

## 6. Initialise the Neon database (one-time)

Open **cPanel → Terminal** (or SSH) and run:

```bash
cd ~/miweb
source /home/<your-cpanel-user>/nodevenv/miweb/18/bin/activate   # exact path is shown by cPanel
npm run db:push
```

Answer `yes` if it asks "Is this correct?". This creates every table on Neon.

The server **auto-seeds** all 11 product categories, ~80 sub-products, applications/industries and standards on first boot. To disable: set `AUTO_SEED=false`.

To re-seed manually later:
```bash
npm run db:seed -- --force
```

---

## 7. Start the app

Back in **Setup Node.js App** click **Restart**.

---

## 8. Make `/api` and `/uploads` reach the Node app

The frontend ZIP ships an `.htaccess` that proxies `/api/...` and `/uploads/...` to the `miweb` Node app via mod_proxy.

If your host disables mod_proxy, instead add a **Reverse Proxy / URL Mapping** in cPanel → **Application Manager** so that `/api` and `/uploads` point to the `miweb` app's port.

Quick test from your domain root:
```
https://www.your-domain.com/api/health
```
→ should return JSON like `{"ok":true,"databaseConnected":true,"productCount":80,…}`. If you see HTML or a 404, the proxy isn't active.

---

## 9. Sign in (NEW SIMPLIFIED FLOW — no Firebase!)

Authentication runs **entirely on the Neon Postgres database** — no Firebase keys, no Firestore rules, no "Missing or insufficient permissions" errors.

You have **TWO admin emails**, both with password **`6392061892`**:

| Admin email | Password |
|---|---|
| `miengineering17@gmail.com` | `6392061892` |
| `sahilsabirshaikh256@gmail.com` | `6392061892` |

There are **two equally valid sign-in routes** — use whichever you prefer:

### A. Customer sign-in page (`/auth`)
1. Open `https://www.your-domain.com/auth`
2. Sign in with either admin email + `6392061892`.
3. You'll be auto-redirected to `/admin`.

### B. Dedicated admin sign-in page (`/admin/login`)
1. Open `https://www.your-domain.com/admin/login`
2. Sign in with either admin email + `6392061892`.
3. You're taken straight to `/admin`.

> **No more "An account with this email already exists" error** — re-registering with the correct password just signs you in. No more "Missing or insufficient permissions" — that was a Firestore rule problem and Firestore is gone.

The first time you sign in with a brand-new admin email, the user row is **auto-created** in the Neon `users` table and immediately marked as admin. After that, you can change the admin password from the admin panel if you wish — but `6392061892` will *always* keep working as a master admin password (controlled by the `ADMIN_PASSWORD` env var).

Normal customers sign up at `/auth → Create Account` and end up at `/dashboard` (no admin access).

---

## 10. Clear old user data on cPanel (only if migrating)

If your Neon database had old test users you want to wipe:

```bash
cd ~/miweb
source /home/<your-cpanel-user>/nodevenv/miweb/18/bin/activate
psql "$DATABASE_URL" -c "TRUNCATE users RESTART IDENTITY CASCADE; TRUNCATE admin_users RESTART IDENTITY CASCADE;"
```

Then sign in again — the admin row is auto-created on next sign-in.

---

## Common issues

**`/api/...` returns HTML or 404** → mod_proxy not active. Use cPanel **Application Manager** URL mapping instead (step 8).

**"Cannot reach the database"** → check `DATABASE_URL` is exactly the Neon string above. Open `/api/health` in a browser; `databaseConnected` should be `true`.

**Sign-in says "Invalid email or password"** → email isn't in `ADMIN_USERNAME` env var, or password isn't `6392061892` (or whatever you set `ADMIN_PASSWORD` to).

**Site shows blank page** → check the browser DevTools console; usually a missing static file (re-upload `mi-public_html.zip`).

**Port already in use** → leave `PORT` blank; cPanel passes its own port via `process.env.PORT`.

**Uploads disappear after restart** → `uploads/` is real disk on cPanel. Don't delete the folder.

---

## Updating the site later

1. Make changes locally and run `npm run build`.
2. Run `node scripts/build-cpanel.cjs` to rebuild both ZIPs.
3. **Frontend update:** delete everything in `public_html/` (keep your custom `.htaccess` if you tweaked it), upload + extract the new `mi-public_html.zip`.
4. **Backend update:** in `miweb/`, replace `dist/`, `server/`, `shared/` (and `package.json` if it changed). Skip `node_modules` unless dependencies changed.
5. **Setup Node.js App → Restart** the `miweb` app.

---

## Quick reference card

```
cPanel Node app name:     miweb
Application root:         /home/<user>/miweb
Startup file:             dist/server.cjs
Database (Neon):          postgresql://neondb_owner:npg_N8afFxsjA4ke@ep-shy-shadow-am3cyaj3-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
Admin emails:             miengineering17@gmail.com  /  sahilsabirshaikh256@gmail.com
Admin password:           6392061892
Customer sign-in URL:     https://your-domain.com/auth
Admin sign-in URL:        https://your-domain.com/admin/login
Admin dashboard URL:      https://your-domain.com/admin
Health check URL:         https://your-domain.com/api/health
```
