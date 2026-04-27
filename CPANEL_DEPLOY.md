# Hosting on cPanel — Step by Step

This guide explains how to put **M.I. Engineering Works** on a cPanel server (e.g. Hostinger, Bluehost, Namecheap, GoDaddy cPanel).

You need a cPanel account with **Node.js Selector / Setup Node.js App** enabled (Node 18 or higher), and a PostgreSQL database (cPanel's own PostgreSQL, or an external one like Neon, Supabase, Railway).

---

## 1. Upload the project

1. Open **cPanel → File Manager**.
2. Create a folder, e.g. `miengineeringworks` inside `/home/<your-user>/`.
3. Upload `mi-engineering-cpanel.zip` into that folder.
4. Right-click the zip → **Extract**.

You should now see `package.json`, `server/`, `dist/`, `uploads/`, etc. inside.

---

## 2. Create the Node.js application

1. Open **cPanel → Setup Node.js App** (sometimes "Node.js Selector").
2. Click **Create Application** and fill in:
   - **Node.js version:** 18.x or higher
   - **Application mode:** Production
   - **Application root:** `miengineeringworks` (the folder you extracted into)
   - **Application URL:** your domain, e.g. `www.miengineeringworks.com`
   - **Application startup file:** `dist/server.cjs`
3. Click **Create**.

cPanel will print a yellow box with a `source /home/.../nodevenv/...` command — you don't need it; everything runs from the cPanel UI.

---

## 3. Install dependencies

In the same Node.js App page:

1. Scroll to **Detected configuration files** → click **Run NPM Install**.
2. Wait until it finishes (1–3 minutes). This installs everything from `package.json`.

---

## 4. Set environment variables

Still on the Node.js App page, scroll to **Environment variables** and add the following (click + for each):

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | (leave blank — cPanel sets this automatically) |
| `DATABASE_URL` | Your full PostgreSQL connection string, e.g. `postgresql://user:pass@host:5432/dbname` |
| `JWT_SECRET` | A long random string (e.g. 40+ characters). Used to sign admin login tokens. |
| `ADMIN_USERNAME` | `miengineering@gmail.com,miengineering17@gmail.com` |
| `ADMIN_PASSWORD` | Your admin password |
| `GOOGLE_CLIENT_ID` | `374744007598-plgqj6s9ds83v5aij2ehtm60ad2k86er.apps.googleusercontent.com` |
| `VITE_GOOGLE_CLIENT_ID` | (same as above — only needed if you ever run `npm run build` here) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`, `MAIL_TO` | Optional — for the contact form to send email notifications |

Click **Save** after adding each one.

---

## 5. Initialise the database

You need to create the tables once. Open **cPanel → Terminal** (or SSH) and run:

```bash
cd ~/miengineeringworks
source /home/<your-user>/nodevenv/miengineeringworks/18/bin/activate   # path shown by cPanel
npm run db:push
```

This creates every table in your PostgreSQL database. If `db:push` asks "Is this correct?" → answer `yes`.

---

## 6. Start the app

Back in **Setup Node.js App** click **Restart**.

Visit your domain — the site should load.

---

## 7. Tell Google about your domain

In **Google Cloud Console → APIs & Services → Credentials → your OAuth 2.0 Client**, add these to **Authorized JavaScript origins**:

- `https://www.miengineeringworks.com`
- `https://miengineeringworks.com`

Without this, Google sign-in will show "origin not allowed".

---

## 8. Admin login

- Open `https://www.miengineeringworks.com/admin/login`
- Sign in with `miengineering@gmail.com` and the password you set in `ADMIN_PASSWORD`.
- Or click **Sign in with Google** (only the two whitelisted Gmail addresses are allowed in).

---

## Common issues

**"Cannot reach the database."** → `DATABASE_URL` is wrong, or the database server doesn't accept connections from your cPanel host. If you're using cPanel's own PostgreSQL, make sure you added your cPanel user to the database under **PostgreSQL Databases**.

**Site shows blank page** → run `npm install` again (some optional dependencies may have been skipped).

**Port already in use** → leave the `PORT` env var blank; cPanel passes its own port via `process.env.PORT`.

**Uploads disappear after restart** → the `uploads/` folder is real disk on cPanel, files persist. Don't delete it.

**File uploads fail** → check `uploads/` permissions are 755, owned by your cPanel user.

---

## Updating the site later

1. Make changes locally.
2. Run `npm run build` to rebuild the frontend.
3. Run `npx esbuild server/index.ts --bundle --platform=node --target=node18 --format=cjs --outfile=dist/server.cjs --packages=external` to rebuild the server.
4. Re-zip and re-upload `dist/`, `server/`, `shared/`, `uploads/` (skip `node_modules`).
5. In cPanel **Setup Node.js App** → **Restart**.
