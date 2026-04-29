M.I. ENGINEERING WORKS — cPanel Single-App Deployment (Recommended)
====================================================================

This ZIP is a self-contained Node.js application. Express serves BOTH
the React frontend (from /dist) AND the API on the same port. You do
NOT need to upload anything separately to public_html.

Files inside this ZIP
---------------------
  app.js              cPanel startup file — point cPanel here
  server.cjs          Pre-bundled backend (3.7 MB, no npm install needed)
  package.json        Just a "main" entry pointing to app.js
  dist/               Built React frontend (served by Express)
  uploads/            Empty folder for user-uploaded files (e.g. catalog PDFs)
  .env.example        Reference list of environment variables
  README-DEPLOY.txt   This file

Deployment steps
----------------

1. cPanel → "Setup Node.js App" → CREATE APPLICATION:

     Node.js version          : 18.x or 20.x
     Application mode         : Production
     Application root         : nodeapp        (folder name, you choose)
     Application URL          : your domain root (https://yourdomain.com/)
     Application startup file : app.js

   Click CREATE.

2. cPanel → File Manager → /home/USER/nodeapp/
     Upload this ZIP, right-click → Extract.
     Delete the ZIP after extraction.

3. cPanel → Setup Node.js App → click your app → "Environment variables":
     Add ALL of these (see .env.example for details):

       DATABASE_URL     = postgresql://user:pass@host/db?sslmode=require
       ADMIN_USERNAME   = your.email@example.com   (comma-separated for multiple)
       ADMIN_PASSWORD   = a strong password (12+ chars)
       JWT_SECRET       = random 96-char hex (see .env.example for command)
       NODE_ENV         = production

4. cPanel → Setup Node.js App → click "Restart".

5. Test in browser:
     https://yourdomain.com/api/health
       Should return: { "ok": true, "databaseConnected": true, ... }

     https://yourdomain.com/
       Should show the M.I. Engineering home page.

     https://yourdomain.com/admin/login
       Sign in with your ADMIN_USERNAME + ADMIN_PASSWORD.

That's it. NO public_html setup needed — Express handles everything.

Updating later
--------------
When you change code:
  1. Re-bundle: node scripts/build-cpanel.cjs
  2. Replace cpanel-backend/server.cjs and cpanel-backend/dist/ on cPanel
  3. cPanel → Setup Node.js App → Restart

Environment variables stay the same; you don't need to re-enter them.

Troubleshooting
---------------
* "Cannot GET /" or 503  →  Node app not running. cPanel → Restart, check Logs.
* /api/health says "ok": false  →  Read the "error" field — it tells you exactly
  what's wrong (usually a wrong DATABASE_URL or missing env var).
* "Invalid email or password" on login  →  ADMIN_USERNAME / ADMIN_PASSWORD
  not set, or set with extra spaces. Re-save them and Restart.
* White page  →  dist/ folder didn't extract. Verify cpanel-backend/dist/index.html
  exists. Re-upload the ZIP.
* Logs location: cPanel → Setup Node.js App → click your app → "Logs"
  (or /home/USER/nodeapp/stderr.log)

Security checklist
------------------
[ ] ADMIN_PASSWORD is 12+ chars, unique, NOT shared anywhere
[ ] JWT_SECRET is fresh random 96-char hex
[ ] DATABASE_URL password is fresh (rotated if ever leaked)
[ ] HTTPS enabled (cPanel → SSL/TLS Status → Run AutoSSL)
