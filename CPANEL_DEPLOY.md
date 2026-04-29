# Hosting on cPanel — Step by Step

This guide explains how to put **M.I. Engineering Works** on a cPanel server (Hostinger, Bluehost, Namecheap, GoDaddy cPanel, etc.).

You will get **two ZIP files** from `cpanel-zips/`:

| ZIP | What's inside | Where it goes |
|-----|---------------|---------------|
| `mi-public_html.zip` (~4.4 MB) | Built static frontend (`index.html`, JS, CSS, images) | `public_html/` (your domain root) |
| `mi-backend.zip` (~17 MB) | Node/Express API + dependencies + uploads folder | A separate folder, set up as a **Node.js app** in cPanel (we'll call this app **`miweb`**) |

You need cPanel with **Setup Node.js App** enabled (Node 18+) and a PostgreSQL database (cPanel's own, or external like Neon / Supabase / Railway).

---

## 1. Upload the frontend (public_html.zip)

1. Open **cPanel → File Manager → public_html**.
2. (Optional) back up anything already in `public_html` and delete it.
3. Upload `mi-public_html.zip` into `public_html/`.
4. Right-click the zip → **Extract** (extract into `public_html/`, not into a sub-folder).
5. Delete the zip file after extracting.

You should now see `index.html`, `assets/`, `favicon.ico`, etc. directly inside `public_html/`.

---

## 2. Upload the backend (backend.zip)

1. In **File Manager**, go to your home folder `/home/<your-cpanel-user>/`.
2. Create a new folder called **`miweb`**.
3. Upload `mi-backend.zip` into `miweb/`.
4. Right-click the zip → **Extract**.
5. Delete the zip file after extracting.

You should see `package.json`, `dist/server.cjs`, `server/`, `shared/`, `uploads/`, `node_modules/` inside `miweb/`.

---

## 3. Create the Node.js app in cPanel

1. Open **cPanel → Setup Node.js App** (sometimes called "Node.js Selector").
2. Click **Create Application** and fill in:
   - **Node.js version:** 18.x or higher
   - **Application mode:** Production
   - **Application root:** `miweb`
   - **Application URL:** leave the path empty so it serves from `/api` on your domain (e.g. `www.miengineeringworks.com`). If your host forces a path, use something like `/node`.
   - **Application startup file:** `dist/server.cjs`
3. Click **Create**.

> The app **name** in cPanel is **`miweb`** to match the folder.

---

## 4. (Skip if node_modules already shipped) Install dependencies

The backend ZIP already includes `node_modules`, so you usually don't need to do anything here. If anything is missing or you upgraded Node:

1. In the same **Setup Node.js App** page, scroll to **Detected configuration files**.
2. Click **Run NPM Install** and wait 1–3 minutes.

---

## 5. Set environment variables

Still on the Node.js App page, scroll to **Environment variables** and add these (click **+** for each):

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | (leave blank — cPanel sets this automatically) |
| `DATABASE_URL` | Your PostgreSQL URL, e.g. `postgresql://user:pass@host:5432/dbname` |
| `JWT_SECRET` | A long random string (40+ characters). Used for session tokens. |
| `ADMIN_USERNAME` | `miengineering@gmail.com,miengineering17@gmail.com` |
| `ADMIN_PASSWORD` | `6392061892` *(or your own password — keep this and Firebase password identical for the admin email so the admin panel auto-unlocks)* |
| `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID` | Your Firebase project credentials (also need to be baked into the frontend build — see step 9) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`, `MAIL_TO` | Optional — for the contact form to send email notifications |

Click **Save** after adding.

---

## 6. Initialise the database (one-time)

Open **cPanel → Terminal** (or SSH) and run:

```bash
cd ~/miweb
source /home/<your-cpanel-user>/nodevenv/miweb/18/bin/activate   # path shown in cPanel
npm run db:push
```

If it asks "Is this correct?" → answer `yes`. This creates every table.

The server auto-seeds 11 product categories, ~80 sub-products, applications/industries and standards on first boot. To disable: set `AUTO_SEED=false` in the env vars.

To re-seed manually later:
```bash
npm run db:seed -- --force
```

---

## 7. Start the app

Back in **Setup Node.js App** click **Restart**.

---

## 8. Make `/api`, `/uploads`, `/api/catalog.pdf` reach the Node app

Your domain (`public_html`) serves the static frontend, but API calls (`/api/...`) and file uploads (`/uploads/...`) must reach the Node app. The frontend ZIP ships an **`.htaccess`** file in `public_html/` that does this automatically using **mod_proxy**.

If your cPanel host disables proxying, instead add a **Reverse Proxy** in cPanel (some hosts call it "Application Manager → URL mapping") so that `/api` and `/uploads` point to the `miweb` Node app's port.

Quick test from your domain root: open `https://www.your-domain.com/api/health` — you should see a JSON response, not a 404.

---

## 9. Tell Firebase about your domain

In **Firebase Console → Authentication → Settings → Authorized domains**, add:
- `www.miengineeringworks.com`
- `miengineeringworks.com`

Without this, sign-in will fail with an "auth domain not authorised" error.

The frontend ZIP was built with the Firebase keys present in this Replit environment. If you ever swap to a different Firebase project, set the new `VITE_FIREBASE_*` variables in this project, run `npm run build`, then re-zip the frontend with `node scripts/build-cpanel.cjs`.

---

## 10. Sign in as Admin (NEW SIMPLIFIED FLOW)

There is **no separate admin login page anymore**. The admin panel automatically unlocks for the admin email.

1. Open `https://www.your-domain.com/auth`
2. Sign in with `miengineering17@gmail.com` and your password.
3. Immediately go to `https://www.your-domain.com/admin` — you're already in. No second password.

If this is the first time you use this email on the new build, click **Create Account** on `/auth` and register with `miengineering17@gmail.com` and a password (use the same password as `ADMIN_PASSWORD` so the admin API also accepts it). The system automatically marks anyone signing in with that email as **admin**.

---

## Common issues

**Calls to `/api/...` return 404 / HTML** → the `.htaccess` proxy isn't active. Either enable mod_proxy via cPanel, or use Application Manager URL mapping (step 8).

**"Cannot reach the database."** → `DATABASE_URL` is wrong, or the DB host blocks your cPanel server. If using cPanel's PostgreSQL, add your cPanel user to the database under **PostgreSQL Databases**.

**Site shows blank page** → check the browser DevTools console for errors; most often a missing `VITE_FIREBASE_*` value at build time.

**Port already in use** → leave `PORT` blank; cPanel passes its own port via `process.env.PORT`.

**Uploads disappear after restart** → they shouldn't; `uploads/` is real disk on cPanel. Don't delete the folder.

**Admin panel says "Unauthorized" on some pages** → the email you signed in with isn't in `ADMIN_USERNAME`. Update the env var, or sign in with one of the listed admin emails.

---

## Updating the site later

1. Make changes locally and run `npm run build`.
2. Run `node scripts/build-cpanel.cjs` to rebuild both ZIPs.
3. **Frontend update:** delete everything in `public_html/` (except `.htaccess` if you customised it), upload + extract the new `mi-public_html.zip`.
4. **Backend update:** in `miweb/`, replace `dist/`, `server/`, `shared/` (and `package.json` if it changed). Skip `node_modules` unless dependencies changed.
5. In cPanel **Setup Node.js App** → **Restart** the `miweb` app.
