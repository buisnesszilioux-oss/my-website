# Auto-Deploy from GitHub to cPanel

This guide explains how to connect your GitHub repo (`https://github.com/buisnesszilioux-oss/my-website`) to cPanel so that every time you push code, you can deploy it with one click.

---

## Part 1 — One-time GitHub & local setup

### 1. Make sure your repo has the latest pre-built files

Before the first deploy, run these two commands locally and commit the results:

```bash
npm run build                                                                                  # builds the React frontend into dist/
npx esbuild server/index.ts --bundle --platform=node --target=node18 --format=cjs --outfile=dist/server.cjs --packages=external   # bundles the server into dist/server.cjs
git add -A
git commit -m "build: production assets for cPanel"
git push
```

**Why:** cheap cPanel hosts don't have enough memory to run `vite build`. Committing `dist/` to the repo avoids that. The updated `.gitignore` already allows `dist/` to be tracked.

### 2. If your repo is private, create a deploy SSH key

Skip this step if your repo is **public**.

In **cPanel → SSH Access → Manage SSH Keys**:
1. Click **Generate a New Key**, name it `github_deploy`, leave passphrase blank, click **Generate**.
2. Click **View / Download** next to the public key. Copy the whole `ssh-rsa ...` text.
3. Click **Manage** next to the **private** key → click **Authorize**.

Then in GitHub:
1. Open your repo → **Settings → Deploy keys → Add deploy key**.
2. Title: `cPanel`. Paste the public key. Leave **Allow write access** unchecked. **Add key**.

---

## Part 2 — Connect cPanel to GitHub

### 3. Clone the repo via Git Version Control

In **cPanel → Git Version Control**:

1. Click **Create**.
2. Toggle **Clone a Repository** ON.
3. **Clone URL:**
   - For a **public** repo: `https://github.com/buisnesszilioux-oss/my-website.git`
   - For a **private** repo: `git@github.com:buisnesszilioux-oss/my-website.git` (SSH form — needs the deploy key from step 2)
4. **Repository Path:** `/home/<your-cpanel-user>/miengineeringworks` (this is the folder cPanel will create and clone into)
5. **Repository Name:** `miengineeringworks`
6. Click **Create**.

cPanel will pull the entire repo. Wait until you see "Repository was successfully created."

### 4. Point the Node.js App at the cloned folder

In **cPanel → Setup Node.js App**:

If you already have an app from before:
1. Click the **pencil/edit** icon next to your existing app
2. Change **Application root** to the same path you used in step 3 (e.g. `miengineeringworks`)
3. Make sure **Application startup file** is `dist/server.cjs`
4. Click **SAVE**

If you don't have one yet:
1. Click **Create Application**
2. **Node.js version:** 18.x or higher
3. **Application mode:** Production
4. **Application root:** `miengineeringworks` (the folder from step 3)
5. **Application URL:** `www.miengineeringworks.com`
6. **Application startup file:** `dist/server.cjs`
7. Click **Create**

### 5. First-time install

In **Setup Node.js App**, scroll to **Detected configuration files** → click **Run NPM Install**. Wait 1–3 minutes.

### 6. Set environment variables

Same list as before (in **Setup Node.js App → Environment variables**):

| Name | Value |
|------|-------|
| `NODE_ENV` | `production` |
| `JWT_SECRET` | `-4hFGHwDWUtVIB7ZoBIJIRxTOzcxFnW3P5WKjG3XmVmcGT6edqV0ESUyioa5OyBd` |
| `ADMIN_USERNAME` | `miengineering@gmail.com,miengineering17@gmail.com` |
| `ADMIN_PASSWORD` | *(your chosen admin password)* |
| `GOOGLE_CLIENT_ID` | `374744007598-plgqj6s9ds83v5aij2ehtm60ad2k86er.apps.googleusercontent.com` |
| `VITE_GOOGLE_CLIENT_ID` | (same as above) |
| `DATABASE_URL` | your full PostgreSQL connection string |

Click **SAVE**, then click **RESTART** at the top.

### 7. Initialise the database (first time only)

Open **cPanel → Terminal**:

```bash
cd ~/miengineeringworks
source ~/nodevenv/miengineeringworks/18/bin/activate     # cPanel shows the exact path on the Node.js App page
npm run db:push                                          # creates all tables; answer "yes" if prompted
```

Visit your domain — site should be live.

---

## Part 3 — Deploying future changes

Every time you push new commits to GitHub:

1. Locally, after making changes:
   ```bash
   npm run build
   npx esbuild server/index.ts --bundle --platform=node --target=node18 --format=cjs --outfile=dist/server.cjs --packages=external
   git add -A && git commit -m "your change message" && git push
   ```
2. In **cPanel → Git Version Control**, click **Manage** next to your repo.
3. Click the **Pull or Deploy** tab.
4. Click **Update from Remote** — this fetches the latest commit.
5. Click **Deploy HEAD Commit** — this runs the steps in `.cpanel.yml` (which I've added to your repo): `npm install`, then restart Passenger so the new code goes live.

That's it — your changes are live in under a minute.

---

## Important security note

The file `server/index.ts` contains a **hardcoded fallback admin password** (`6392061892`) used only when the database is unreachable. Since your repo is on GitHub, **anyone who can read the repo can see this password**.

If your repo is **public**, do this immediately:
1. Open `server/index.ts`
2. Find this line (around line 96):
   ```ts
   const envPass = process.env.ADMIN_PASSWORD || "6392061892";
   ```
3. Change to:
   ```ts
   const envPass = process.env.ADMIN_PASSWORD || "";
   if (!envPass) return res.status(500).json({ error: "Admin not configured" });
   ```
4. Same for the `ensureDefaultAdmin` function (around line 501) — remove the `|| "6392061892"` fallback.
5. Set `ADMIN_PASSWORD` env var in cPanel to your real chosen password.
6. Commit and push.

If your repo is **private** (deploy key only), this is less urgent but still recommended.

---

## Common issues

- **"Permission denied (publickey)" when cloning** → the SSH deploy key isn't installed correctly. Re-do step 2 carefully.
- **`.cpanel.yml` deploy fails on `npm install`** → likely out of memory. Run `npm install --omit=dev --no-audit --no-fund` manually in cPanel Terminal once, then future deploys should work.
- **Site loads but shows old content after deploy** → click **RESTART** in Setup Node.js App. Sometimes Passenger caches the old process.
- **`dist/server.cjs not found`** → you forgot to commit the build. Run the local build commands in step 1 again.
