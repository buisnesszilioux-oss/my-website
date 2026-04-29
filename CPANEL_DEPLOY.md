# M.I. Engineering Works — cPanel Deployment Guide

Yeh guide aapke website ko cPanel par deploy karne ke liye step-by-step
instructions deti hai. Do alag-alag ZIP files use hoti hain — ek backend
ke liye, ek frontend ke liye.

---

## Aapke paas kya hona chahiye

**ZIP Files (`cpanel-zips/` folder me):**

| File | Kahaan jaata hai | Size |
| --- | --- | --- |
| `mi-backend-nodeapp.zip` | cPanel ka Node.js app folder | ~17 MB |
| `mi-frontend-public_html.zip` | cPanel ka `public_html` folder | ~4 MB |

**cPanel par chahiye:**

- Node.js App support (cPanel ke "Setup Node.js App" feature)
- PostgreSQL database connection string (Neon / Supabase / cPanel Postgres)
- Domain ya subdomain set up kiya hua

---

## STEP 1 — Database ready karo

Aapko ek PostgreSQL database chahiye. Free options:

- **Neon** ([neon.tech](https://neon.tech)) — sabse easy, 1 minute me ban jaata hai
- **Supabase** ([supabase.com](https://supabase.com)) — free tier
- **cPanel** ka built-in PostgreSQL (agar available ho)

Database banane ke baad `connection string` copy karke rakho. Format:
```
postgresql://user:password@host:5432/dbname?sslmode=require
```

---

## STEP 2 — Backend deploy karo

### 2.1 Node.js App banao

1. cPanel kholo → **"Setup Node.js App"** dhundo
2. **CREATE APPLICATION** dabao:
   - **Node.js version:** 18.x ya 20.x
   - **Application mode:** Production
   - **Application root:** `nodeapp` (ya jo bhi naam pasand)
   - **Application URL:** Decide karo:
     - Single domain: `yourdomain.com/api` (frontend + backend ek hi domain par)
     - Subdomain: `api.yourdomain.com` (alag subdomain banaya ho to)
   - **Application startup file:** `app.js`
3. CREATE dabao

### 2.2 Backend ZIP upload aur extract karo

1. cPanel → **File Manager** kholo
2. Folder `/home/USERNAME/nodeapp/` ke andar jao
3. **Upload** dabao → `mi-backend-nodeapp.zip` upload karo
4. ZIP par right-click → **Extract** (current folder me)
5. ZIP file delete kar do

### 2.3 Environment Variables daalo (SABSE ZAROORI)

"Setup Node.js App" me wapas jao → apni app par click → **"Environment
variables"** section me yeh values daalo:

| Variable | Value | Detail |
| --- | --- | --- |
| `DATABASE_URL` | `postgresql://...` | Step 1 wala connection string |
| `ADMIN_USERNAME` | `you@example.com` | Comma-separated admin emails |
| `ADMIN_PASSWORD` | `<strong password>` | 12+ characters, unique |
| `JWT_SECRET` | `<random 96-char string>` | Niche se generate karo |
| `NODE_ENV` | `production` | Hamesha production |

**JWT_SECRET generate karne ke liye:** Apne computer ke terminal me chalao:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```
Output ko copy karke `JWT_SECRET` me paste kar do.

**Optional variables:**

| Variable | Kab chahiye |
| --- | --- |
| `GOOGLE_CLIENT_ID` | Google sign-in chalana ho |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | Contact form ke email |
| `CONTACT_TO_EMAIL` | Quote requests jisko mile |

### 2.4 Backend start karo

1. "Setup Node.js App" me wapas jao
2. **"Run NPM Install" DABANA NAHI hai** — sab kuch bundled hai
3. **"Restart"** button dabao
4. Status "Running" dikhna chahiye

### 2.5 Backend test karo

Browser me kholo:
```
https://yourdomain.com/api/health
```

Aisa JSON dikhna chahiye:
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

❌ Agar `"ok": false` aaye → `error` field padho, wahi batayega kya missing hai.

---

## STEP 3 — Frontend deploy karo

### 3.1 public_html clean karo

1. cPanel → **File Manager** → `public_html` me jao
2. Purani files (jo M.I. Engineering ki hain) backup le ke hata do
3. `cgi-bin` folder mat chhuna

### 3.2 Frontend ZIP upload aur extract karo

1. **Upload** → `mi-frontend-public_html.zip` upload karo
2. ZIP par right-click → **Extract** (public_html me)
3. ⚠️ **Verify:** Saari files seedha `public_html/` me honi chahiye —
   `public_html/mi-frontend/` ke andar NAHI. Agar sub-folder bana ho to
   uske andar ki saari files cut karke `public_html/` me paste karo.
4. ZIP delete kar do

### 3.3 .htaccess check karo

`public_html/.htaccess` file honi chahiye. Agar nahi dikhe to:
- File Manager → **Settings** → "Show Hidden Files (dotfiles)" enable karo

Yeh file 2 kaam karti hai:
1. `/api/*` requests ko Node.js backend ko bhejti hai
2. React Router ke saare routes ko `index.html` par bhejti hai

**Agar backend SUBDOMAIN par hai** (e.g. `api.yourdomain.com`), to `.htaccess`
me pehle 2 RewriteRule lines edit karo:
```
RewriteRule ^api/(.*)$       https://api.yourdomain.com/api/$1 [P,L]
RewriteRule ^uploads/(.*)$   https://api.yourdomain.com/uploads/$1 [P,L]
```

### 3.4 Frontend test karo

Browser me kholo: `https://yourdomain.com`

Home page khulna chahiye. Phir:
- Products page → product list dikhe
- About page → reload karne par bhi khule (404 nahi)

---

## STEP 4 — Login test karo

1. Browser me kholo: `https://yourdomain.com/admin/login`
2. Apna admin email + `ADMIN_PASSWORD` (jo Step 2.3 me set kiya tha) daalo
3. Sign in dabao
4. `/admin` dashboard khulna chahiye

✅ Login working hai → deployment complete!

---

## Common Problems & Solutions

### "Invalid email or password"
- Backend me `ADMIN_USERNAME` ya `ADMIN_PASSWORD` set nahi hai
- Solution: Step 2.3 wapas check karo, env vars dobara save karo,
  Node app **Restart** karo

### Frontend white/blank screen
- Files galat folder me extract huin
- Solution: Browser me F12 → Console kholo. Agar 404 errors aa rahe
  hain assets ke liye — sab files `public_html/` me seedha honi chahiye

### `/api/*` calls 502 / 504 dete hain
- Backend Node.js app start nahi hai
- Solution: cPanel "Setup Node.js App" → **Restart** dabao →
  Logs check karo

### Routes pe reload karne par 404
- `.htaccess` missing ya galat hai
- Solution: Step 3.3 wapas karo, hidden files dikhane ka option enable karo

### Database "ECONNREFUSED" ya timeout
- `DATABASE_URL` galat ya database band hai
- Solution: Neon/Supabase dashboard me database active check karo,
  connection string copy karke wapas paste karo

---

## Update karna ho to

Agar code me changes kiye hain aur dobara deploy karna hai:

1. **Backend update:** Naya `mi-backend-nodeapp.zip` banao
   (`node scripts/build-cpanel.cjs` chala ke), cPanel par `server.cjs`
   replace karo, "Restart" dabao
2. **Frontend update:** Naya `mi-frontend-public_html.zip` upload karo,
   `public_html` me extract karo (overwrite YES)

Env variables wahi rahenge — unko dobara nahi daalna.

---

## Security Checklist ✓

- [x] `ADMIN_PASSWORD` strong hai (12+ chars, unique)
- [x] `JWT_SECRET` random hai (48+ random bytes)
- [x] Source code me kahin koi password / secret hardcoded NAHI hai
- [x] Login pages par koi credential SHOW NAHI hota
- [x] `.htaccess` me hidden files (`.env`) blocked hain
- [x] HTTPS enabled hai (cPanel "SSL/TLS Status" → AutoSSL)

---

## Files included in build

**Backend ZIP (`mi-backend-nodeapp.zip`):**
- `app.js` — cPanel startup file
- `server.cjs` — Pura backend bundled (3.7 MB, single file, no npm install needed)
- `package.json` — Sirf "main" entry
- `dist/` — Built frontend (fallback agar public_html alag se nahi rakhna)
- `uploads/` — Empty folder for user-uploaded files
- `README-BACKEND.txt`, `README-FRONTEND.txt`

**Frontend ZIP (`mi-frontend-public_html.zip`):**
- `index.html`
- `assets/` — Built JS + CSS chunks
- `favicon.png`, `robots.txt`, `sitemap.xml`, `placeholder.svg`
- `.htaccess` — SPA routing + API proxy

---

Koi problem aaye to backend ke logs cPanel "Setup Node.js App" → "Logs"
section me dekho, frontend ke errors browser DevTools (F12) → Console me.
