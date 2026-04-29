# M.I. Engineering Works — cPanel Deployment Guide

**Single-app deployment** — ek hi Node.js app frontend + backend dono serve
karega. Koi `public_html` setup nahi, koi proxy nahi, koi `.htaccess`
mod_proxy chahiye nahi. Sabse simple aur foolproof method.

---

## Aapke paas yeh file hai

| File | Size | Kahaan jaata hai |
| --- | --- | --- |
| `cpanel-zips/mi-fullstack-cpanel.zip` | ~29 MB | cPanel Node.js app folder me |

Iske andar hai:
- `app.js` — startup file
- `server.cjs` — pura backend bundled (6.8 MB, single file)
- `dist/` — built React frontend (Express se serve hoga)
- `package.json`, `uploads/`, `.env.example`, `README-DEPLOY.txt`

---

## STEP 1 — Database ready karo (Neon recommended)

1. [neon.tech](https://neon.tech) → free account → "Create project"
2. Region apne paas ka choose karo (e.g. AWS US-East)
3. Bana lo. **"Connection string" → "Pooled connection"** copy karo:
   ```
   postgresql://user:password@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require
   ```
4. Notepad me save karo — Step 3 me paste karna hai

⚠️ **Agar aapne database password ya URL kabhi bhi public chat / screenshot
me share kiya hai, to Neon dashboard → "Reset password" se turant naya
password generate karo. Purana URL leak ho chuka hai.**

---

## STEP 2 — cPanel pe Node.js App banao

1. cPanel kholo → search box me **"Setup Node.js App"** type karo → kholo
2. **CREATE APPLICATION** button dabao:

   | Field | Value |
   |---|---|
   | Node.js version | **20.x** (ya 18.x) |
   | Application mode | **Production** |
   | Application root | `nodeapp` (folder ka naam, kuch bhi rakh sakte ho) |
   | Application URL | **`https://yourdomain.com/`** ← root domain, koi sub-path nahi |
   | Application startup file | `app.js` |

3. CREATE dabao. cPanel automatically `public_html/.htaccess` set kar dega
   jo saari requests Node.js app ko bhejega — koi manual config nahi.

---

## STEP 3 — ZIP upload aur extract karo

1. cPanel → **File Manager** kholo
2. `/home/USERNAME/nodeapp/` folder me jao
3. **Upload** dabao → `mi-fullstack-cpanel.zip` upload karo
4. Upload complete hone ke baad ZIP par right-click → **Extract** (current folder)
5. Verify: `nodeapp/app.js`, `nodeapp/server.cjs`, `nodeapp/dist/index.html`
   honi chahiye direct `nodeapp/` ke andar (kisi sub-folder me NAHI)
6. ZIP file delete kar do

---

## STEP 4 — Environment variables daalo (SABSE ZAROORI)

cPanel → "Setup Node.js App" → apni app par click → **"Environment variables"**
section open karo. **5 variables** add karo:

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
96 characters ka random hex output milega. Wahi paste karo `JWT_SECRET` me.

Har variable add karne ke baad **SAVE** dabana mat bhoolna.

**Optional variables (zarurat ho to):**
- `GOOGLE_CLIENT_ID` — agar Google sign-in chalana ho
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` — contact form emails ke liye
- `CONTACT_TO_EMAIL` — quote requests jisko mile

---

## STEP 5 — App start karo

1. "Setup Node.js App" panel me wapas jao
2. **"Run NPM Install" DABANA NAHI hai** — sab kuch already bundled hai
3. **Restart** button dabao
4. Status "Running" ho jaana chahiye

---

## STEP 6 — Test karo

Browser me yeh 3 URLs khol ke verify karo:

### 6a. Health check
```
https://yourdomain.com/api/health
```
Expected response (JSON):
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

❌ Agar `"ok": false` aaye → `error` field padho, exact problem batayega.

### 6b. Frontend
```
https://yourdomain.com/
```
M.I. Engineering home page khulna chahiye. Products page, About, sab routes
working honi chahiye (reload karne par bhi).

### 6c. Login
```
https://yourdomain.com/admin/login
```
Apna `ADMIN_USERNAME` email + `ADMIN_PASSWORD` daalo → Sign In →
`/admin` dashboard khulna chahiye.

✅ **Sab working = deployment complete!**

---

## Common Errors & Solutions

### "Invalid email or password" (admin ya user)
**Reason:** `ADMIN_USERNAME` ya `ADMIN_PASSWORD` env var set nahi hai, ya
extra space ke saath save hua hai.

**Fix:** Step 4 wapas check karo. Save → Restart → dobara try karo.
Confirmation: `/api/health` me `"hasAdminPassword": true` aur
`"adminEmailsConfigured": 1+` honi chahiye.

### Frontend white / blank page
**Reason:** `dist/` folder properly extract nahi hua.

**Fix:** File Manager me check karo `nodeapp/dist/index.html` exist karta hai.
Nahi hai to ZIP dobara extract karo.

### `/api/health` me `"ok": false, "error": "ECONNREFUSED"`
**Reason:** `DATABASE_URL` galat hai ya database band hai.

**Fix:** Neon dashboard me database "active" check karo. Connection string
copy karke wapas paste karo. Make sure URL me `?sslmode=require` ho.

### "Cannot GET /" ya 503 Service Unavailable
**Reason:** Node.js app start nahi ho rahi.

**Fix:** "Setup Node.js App" → click app → **"Logs"** dekho. Logs me exact
error message dikhega — usually missing env var ya wrong startup file path.

### Routes pe reload karne par 404
**Reason:** cPanel ka auto-generated `.htaccess` overwrite ho gaya.

**Fix:** "Setup Node.js App" → click app → "Edit application" → SAVE
(without changes). cPanel `.htaccess` regenerate kar dega.

### Login ka button click karne par "Network Error"
**Reason:** Frontend backend tak nahi pahuch raha. (Yeh tab hota hai jab
"Application URL" sub-path par set tha jaise `yourdomain.com/api`).

**Fix:** "Setup Node.js App" → "Edit" → **Application URL** ko purely root
domain `https://yourdomain.com/` rakho (koi `/api` suffix nahi). Save → Restart.

---

## Update karna (next time)

Code badla? Sirf 3 commands:
```bash
node scripts/build-cpanel.cjs    # naya zip banayega
```
Phir cPanel par:
1. `nodeapp/server.cjs` aur `nodeapp/dist/` replace karo (overwrite YES)
2. "Setup Node.js App" → **Restart**

Env variables wahi rahenge — dobara nahi daalna.

---

## Security Checklist ✓

- [x] Source code me kahin koi password / secret hardcoded NAHI hai
- [x] Login pages par koi credential SHOW NAHI hota
- [x] Bundle me sirf code hai, koi env value nahi
- [ ] `ADMIN_PASSWORD` strong + unique hai (12+ chars)
- [ ] `JWT_SECRET` fresh random 96-char hex hai
- [ ] `DATABASE_URL` ka password rotated hai (agar kabhi share kiya ho)
- [ ] HTTPS enabled hai (cPanel → SSL/TLS Status → AutoSSL run karo)

---

## What changed (login error fix)

**Pehla error tha:**
- Login page par admin ka email aur password DIRECT screen pe dikh raha tha
- Source code me bhi hardcoded password tha 5+ jagah par
- `.htaccess` proxy approach use kar raha tha jo cPanel pe disable hota hai —
  isliye admin AND normal user dono ka login fail ho raha tha (ek hi error)

**Ab kya theek hai:**
- Frontend se sab visible credentials hata diye gaye
- Source code zero hardcoded passwords / emails / secrets — sirf env vars
- Backend ab khud frontend serve karta hai (NO proxy needed) — yahi single-app
  approach hai jo ab use kar rahe hain
- Startup pe diagnostic message print hota hai jo batata hai env vars set
  hain ya nahi (cPanel "Logs" me dikhega)
- 14-step end-to-end test pass: health, products, industries, standards,
  admin login, user register, user login, protected routes, SPA fallback —
  sab working

Aapke Neon database se connect karke local pe test kiya gaya hai —
sab kuch chal raha hai. Bas cPanel pe upload + 5 env vars + Restart.
