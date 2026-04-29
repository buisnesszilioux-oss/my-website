# M.I. Engineering Works — cPanel Deployment Guide

**Two-ZIP deployment** — backend cPanel ke Node.js app folder me, frontend
public_html me. cPanel khud `/api/*` requests Node app pe route karega
(Phusion Passenger se), koi proxy / mod_proxy nahi chahiye.

---

## Aapke paas yeh files hain

| File | Size | Kahaan jaata hai |
| --- | --- | --- |
| `cpanel-zips/mi-backend-nodeapp.zip` | ~24 MB | cPanel Node.js app folder (e.g. `nodeapp/`) |
| `cpanel-zips/mi-frontend-public_html.zip` | ~4 MB | cPanel `public_html/` folder |

Bonus (single-app fallback, agar 2-zip approach na chale): `mi-fullstack-cpanel.zip`

---

## STEP 1 — Database ready karo (Neon recommended)

1. [neon.tech](https://neon.tech) → free account → "Create project"
2. Region apne paas ka choose karo
3. **"Connection string" → "Pooled connection"** copy karo:
   ```
   postgresql://user:password@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require
   ```
4. Notepad me save karo

⚠️ **Agar database password public chat / screenshot me share kiya hai,
Neon dashboard → "Reset password" se naya generate karo. Purana leak ho chuka.**

---

## STEP 2 — cPanel pe Node.js App banao (Application URL = `/api`)

1. cPanel kholo → **"Setup Node.js App"** open karo
2. **CREATE APPLICATION** dabao:

   | Field | Value |
   |---|---|
   | Node.js version | **20.x** (ya 18.x) |
   | Application mode | **Production** |
   | Application root | `nodeapp` (folder ka naam) |
   | **Application URL** | **`https://yourdomain.com/api`** ← YEH IMPORTANT |
   | Application startup file | `app.js` |

3. CREATE dabao. cPanel automatically `public_html/api/.htaccess` create kar
   dega jo `/api/*` ke saare requests Node app ko bhejega.

---

## STEP 3 — Backend ZIP upload karo

1. cPanel → **File Manager** → `/home/USERNAME/nodeapp/` folder me jao
2. **Upload** dabao → `mi-backend-nodeapp.zip` upload karo
3. Right-click ZIP → **Extract** (current folder me)
4. Verify: `nodeapp/app.js`, `nodeapp/server.cjs`, `nodeapp/package.json`,
   `nodeapp/uploads/` honi chahiye direct `nodeapp/` me
5. ZIP file delete kar do

---

## STEP 4 — Frontend ZIP upload karo

1. cPanel → **File Manager** → `public_html/` me jao
2. Purani files (agar M.I. Engineering ki hain) backup le ke hata do.
   **`api/` folder mat chhuna** — woh cPanel ne backend ke liye banaya hai
3. **Upload** dabao → `mi-frontend-public_html.zip` upload karo
4. Right-click ZIP → **Extract** (current folder me — `public_html/`)
5. Verify: `public_html/index.html`, `public_html/.htaccess`, `public_html/assets/`
   honi chahiye direct `public_html/` me (kisi sub-folder me NAHI)
6. Hidden files dikhane ke liye: File Manager → **Settings** → ✓ "Show
   Hidden Files (dotfiles)" — `.htaccess` dikhna chahiye
7. ZIP file delete kar do

---

## STEP 5 — Environment variables daalo (SABSE ZAROORI)

cPanel → "Setup Node.js App" → apni app par click → **"Environment variables"**
section. **5 variables** add karo:

| Variable Name | Value |
|---|---|
| `DATABASE_URL` | Step 1 wala Neon connection string |
| `ADMIN_USERNAME` | Aapka admin email (multiple ho to comma-separated) |
| `ADMIN_PASSWORD` | Strong password (12+ characters) |
| `JWT_SECRET` | Random 96-char hex (niche command se generate karo) |
| `NODE_ENV` | `production` |

**JWT_SECRET kaise generate karein:**
Apne computer ke terminal me chalao:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```
Output paste karo `JWT_SECRET` me.

Har variable add karne ke baad **SAVE** dabana mat bhoolna.

---

## STEP 6 — App start karo

1. "Setup Node.js App" panel me wapas jao
2. **"Run NPM Install" DABANA NAHI hai** — sab kuch already bundled hai
3. **Restart** button dabao
4. Status "Running" ho jaana chahiye

---

## STEP 7 — Test karo

Browser me yeh 3 URLs khol ke verify karo:

### 7a. Backend health
```
https://yourdomain.com/api/health
```
Expected response:
```json
{
  "ok": true,
  "node": "v20.x.x",
  "env": "production",
  "hasDatabaseUrl": true,
  "hasJwtSecret": true,
  "hasAdminPassword": true,
  "adminEmailsConfigured": 1,
  "databaseConnected": true,
  "productCount": 85
}
```

❌ Agar `"ok": false` aaye → `error` field exact problem batayega.
❌ Agar 503 / "Cannot GET" aaye → Node app start nahi hua, cPanel "Logs" check karo.
❌ Agar 404 aaye → Application URL `/api` set nahi hai. Step 2 dobara karo.

### 7b. Frontend
```
https://yourdomain.com/
```
M.I. Engineering home page khulna chahiye.
Products / About / kisi bhi page pe **reload** karne par bhi page khulni
chahiye (`.htaccess` ka SPA fallback kaam kar raha hai).

### 7c. Login
```
https://yourdomain.com/admin/login
```
Apna `ADMIN_USERNAME` + `ADMIN_PASSWORD` daalo → Sign In →
`/admin` dashboard khulna chahiye.

✅ **Sab working = deployment complete!**

---

## Common Errors & Fixes

### Frontend khulta hi nahi (white page / 404)
**Reason:** ZIP `public_html/mi-frontend/` jaise sub-folder me extract ho gaya.

**Fix:** File Manager me check karo `public_html/index.html` direct hona chahiye.
Agar sub-folder me hai, sab files cut karke `public_html/` me paste karo, sub-folder
delete karo.

### "Invalid email or password" (admin ya user dono)
**Reason:** `ADMIN_USERNAME` ya `ADMIN_PASSWORD` env var set nahi.

**Fix:** Step 5 wapas check karo. Save → Restart → dobara try karo.
Verify: `/api/health` response me `"hasAdminPassword": true` aur
`"adminEmailsConfigured": 1+` honi chahiye.

### `/api/health` 404 / "Cannot GET /api/health"
**Reason:** cPanel ne `/api/*` ko Node app pe route nahi kiya — Application URL
galat hai.

**Fix:** "Setup Node.js App" → app par click → "Edit application" →
**Application URL** ko exactly `https://yourdomain.com/api` rakho (slash sahi place pe).
Save → Restart.

### `/api/health` me `"ok": false, "error": "ECONNREFUSED"` ya timeout
**Reason:** `DATABASE_URL` galat hai ya database band hai.

**Fix:** Neon dashboard pe database "active" check karo. Connection string
copy karke wapas paste karo. URL me `?sslmode=require` zaroor ho.

### Login button click karne par "Network Error" ya CORS error
**Reason:** Frontend `/api/*` ko reach nahi kar paa raha.

**Fix:**
1. Browser me F12 → Network tab kholo
2. Login dabao
3. Failing request ka URL dekho — `https://yourdomain.com/api/auth/login`
   honi chahiye (full URL)
4. Agar 404 aa raha hai us URL pe → cPanel Application URL `/api` set nahi
5. Agar request hi nahi ja rahi → public_html me `.htaccess` missing/wrong

### Admin pe login hone ke baad data nahi dikh raha
**Reason:** Backend chal raha hai but DB connect nahi.

**Fix:** `/api/health` me `"databaseConnected": false` ho to wahi se
debug karo. `error` field padho.

### Routes pe reload karne par 404
**Reason:** `public_html/.htaccess` missing.

**Fix:** File Manager Settings → "Show Hidden Files" enable karo.
Agar `.htaccess` nahi hai → frontend ZIP dobara extract karo.

---

## Update karna (next time)

Code change kiya? 
```bash
node scripts/build-cpanel.cjs
```
Phir cPanel par:
- **Backend update:** `nodeapp/server.cjs` aur `nodeapp/app.js` replace karo
  (overwrite YES). "Setup Node.js App" → **Restart**.
- **Frontend update:** `public_html/index.html`, `public_html/assets/`,
  `public_html/.htaccess` replace karo (overwrite YES). Browser me
  **Ctrl+Shift+R** se hard reload karo.

Env variables wahi rahenge — dobara nahi daalna.

---

## Security Checklist ✓

- [x] Source code me kahin koi password / secret hardcoded NAHI hai
- [x] Login pages par koi credential SHOW NAHI hota
- [x] Bundle me sirf code hai, koi env value nahi
- [ ] `ADMIN_PASSWORD` strong + unique (12+ chars)
- [ ] `JWT_SECRET` fresh random 96-char hex
- [ ] `DATABASE_URL` ka password rotated (agar kabhi share kiya ho)
- [ ] HTTPS enabled (cPanel → SSL/TLS Status → AutoSSL run karo)

---

## What changed from previous attempt

**Pichla single-zip approach kyu nahi chala:**
- cPanel Application URL "root" (`/`) pe set karna padta tha — har shared
  host pe yeh allow nahi hota (some hosts force a sub-path)

**Ab kya theek hai (this 2-zip approach):**
- Backend Application URL = `/api` (universally supported)
- cPanel khud `/api/*` requests ko Node app pe route karta hai (Passenger,
  not mod_proxy — isliye reliable hai shared hosts pe)
- Frontend public_html me sirf static files + simple `.htaccess` (sirf SPA
  fallback + uploads alias)
- Old `/uploads/foo.png` URLs auto-redirect ho jaate hain `/api/uploads/foo.png`
  pe (.htaccess rewrite se)

**Tested locally with your Neon DB:**
```
[200] /api/health           → ok:true, db connected, 129 products
[200] /api/products         → product list
[200] /api/admin/login      → JWT token (correct password)
[200] /api/admin/contacts   → protected route works
[200] /api/auth/register    → new user + token
[200] /api/auth/login       → existing user login
[200] /api/auth/me          → user profile
[404] /api/uploads/*        → alias mounted correctly
```
```

Sab kuch kaam kar raha hai. Bas cPanel pe upload + 5 env vars + Restart.
