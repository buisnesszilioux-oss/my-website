============================================================
M.I. ENGINEERING WORKS — BACKEND  (Node.js app for cPanel)
============================================================

Yeh ZIP cPanel ke "Setup Node.js App" folder ke andar
extract karna hai. Frontend ka alag ZIP hai jo public_html
me jaata hai.

------------------------------------------------------------
ANDAR KYA HAI
------------------------------------------------------------
  app.js              -> cPanel ka startup file (yeh select karna hai)
  server.cjs          -> Pura backend bundled (ek file me — npm install nahi chahiye)
  package.json        -> Sirf "main" / "start" entries
  dist/               -> Built frontend (fallback ke liye, agar public_html
                         alag se nahi rakhna chahte)
  uploads/            -> Empty folder. Yahaan customer ki uploaded files
                         (PDFs, images) save hoti hain. Backups ke time
                         is folder ka backup zaroor lena.

------------------------------------------------------------
STEP 1 — cPanel me Node.js App banao
------------------------------------------------------------
  1. cPanel kholo -> "Setup Node.js App"
  2. CREATE APPLICATION dabao:
       Node.js version       : 18.x ya 20.x
       Application mode      : Production
       Application root      : nodeapp
       Application URL       : api.yourdomain.com    (subdomain banaya ho to)
                               ya /api               (ek hi domain par chalana ho to)
       Application startup   : app.js
  3. CREATE dabao. Ek folder ban jayega: /home/USERNAME/nodeapp/

------------------------------------------------------------
STEP 2 — File Manager se ZIP upload + extract
------------------------------------------------------------
  1. cPanel -> File Manager kholo
  2. Folder /home/USERNAME/nodeapp/ ke andar jao
  3. Upload button -> mi-backend-nodeapp.zip upload karo
  4. Right-click -> Extract (current folder me)
  5. ZIP delete kar do (jagah bachane ke liye)

------------------------------------------------------------
STEP 3 — Environment variables daalo (ZAROORI)
------------------------------------------------------------
  Wapas "Setup Node.js App" me jao -> apni app -> "Environment
  variables" section me yeh values daalo:

    DATABASE_URL      <apna PostgreSQL connection string>
                      (Neon / Supabase / cPanel Postgres — koi bhi)

    ADMIN_USERNAME    <admin email(s) — comma-separated>
                      e.g.  owner@example.com,manager@example.com

    ADMIN_PASSWORD    <strong password — kam se kam 12 chars>
                      Yeh master password hai, isse koi bhi admin
                      apne email se sign-in kar sakta hai.

    JWT_SECRET        <random 48+ characters string>
                      Generate karne ke liye terminal me chalao:
                        node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"

    NODE_ENV          production

  Optional (Google sign-in chalana ho to):
    GOOGLE_CLIENT_ID  <apna Google OAuth client ID>

  Optional (contact form ke emails ke liye):
    SMTP_HOST         smtp.gmail.com
    SMTP_PORT         465
    SMTP_USER         yourapp@gmail.com
    SMTP_PASS         <Gmail app-password — normal password nahi>
    CONTACT_TO_EMAIL  jisko quotes mile

  ⚠️  IMPORTANT: Yeh values KISI KE SAATH share mat karna.
      Source code me kahin nahi likhi hain — sirf cPanel ke
      env-vars panel me rehni chahiye.

------------------------------------------------------------
STEP 4 — App start karo
------------------------------------------------------------
  1. "Setup Node.js App" me wapas jao
  2. "Run NPM Install" DABANA NAHI hai. Sab kuch server.cjs me
     bundled hai — ek bhi external package install nahi karna.
  3. "Restart" button dabao
  4. Status "Running" dikhe to tick.

------------------------------------------------------------
STEP 5 — Test
------------------------------------------------------------
  Browser me kholo:
    https://api.yourdomain.com/api/health

  Aisa JSON dikhna chahiye:
    {
      "ok": true,
      "node": "v20.x.x",
      "env": "production",
      "hasDatabaseUrl": true,
      "hasJwtSecret": true,
      "hasAdminPassword": true,
      "adminEmailsConfigured": 2,
      "databaseConnected": true,
      "productCount": 85
    }

  Agar "ok": false aaye to "error" field padho — wahi bata raha
  hoga ki kya missing hai (DB URL, password, ya kuch aur).

------------------------------------------------------------
LOGIN TESTING
------------------------------------------------------------
  Frontend par /admin/login ya /auth khol ke apna admin email +
  ADMIN_PASSWORD se sign-in karo. Admin panel khulega.

------------------------------------------------------------
UPDATE KARNA HO TO
------------------------------------------------------------
  Sirf naya server.cjs file replace karo. Baaki kuch mat chedna.
  cPanel me "Restart" button dabao. Bas.
