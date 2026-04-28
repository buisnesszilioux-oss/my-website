M.I. ENGINEERING WORKS — BACKEND (Node.js app for cPanel)
===========================================================

YEH ZIP CPANEL KE NODE.JS APP FOLDER ME UPLOAD KARNI HAI.
(Frontend ka alag zip hai jo public_html me jaata hai.)

------------------------------------------------------------
STEPS:
------------------------------------------------------------
1. cPanel > "Setup Node.js App" kholo
2. CREATE APPLICATION:
   - Node.js version: 18.x ya 20.x
   - Application mode: Production
   - Application root: nodeapp  (ya jo aap chaho)
   - Application URL: miengineeringworks.in
   - Application startup file:  app.js
3. Application banao, phir File Manager me jao
4. App folder (jaise /home/USER/nodeapp/) ke ANDAR yeh zip extract karo
5. Setup Node.js App me wapas jao:
   - "Run NPM Install" button DABANE KI ZAROORAT NAHI HAI.
     (Sab dependencies pehle se bundled hain server.cjs me.)
   - Environment variables daalo (neeche di gayi list)
   - "Restart" dabao
6. Done. Site live ho jaani chahiye.

------------------------------------------------------------
ZAROORI ENVIRONMENT VARIABLES (Setup Node.js App ke andar):
------------------------------------------------------------

NAME              VALUE
----              -----
DATABASE_URL      postgresql://neondb_owner:npg_N8afFxsjA4ke@ep-shy-shadow-am3cyaj3-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET        change-this-to-a-long-random-string-32chars-or-more
ADMIN_USERNAME    miengineering@gmail.com,miengineering17@gmail.com
ADMIN_PASSWORD    6392061892
GOOGLE_CLIENT_ID  374744007598-plgqj6s9ds83v5aij2ehtm60ad2k86er.apps.googleusercontent.com
NODE_ENV          production

NOTE — DATABASE_URL waala value ekdam wahi rakhna jo upar diya hai
(Neon PostgreSQL — saare products, applications, standards, images
yahin store hain). cPanel me "Add Variable" pe click karke ek-ek karke
saare 6 variables daalo. Phir "Save" → "Restart" dabao.

------------------------------------------------------------
LOGIN CREDENTIALS:
------------------------------------------------------------
URL:       https://miengineeringworks.in/admin/login
Email:     miengineering@gmail.com
Password:  6392061892   (ya jo ADMIN_PASSWORD me set kiya hai)

Agar login fail ho to is URL ko browser me kholo:
  https://miengineeringworks.in/api/health

Yeh ek JSON return karega jisme batayega ki DB connect hua ki nahi,
kitne products mile, kya environment variable missing hai, etc.
Yahi se pata chal jaayega kya galti hai.

------------------------------------------------------------
CONTENTS:
------------------------------------------------------------
app.js              - cPanel startup entry (just requires server.cjs)
server.cjs          - Bundled server (~3.6 MB, includes ALL dependencies)
package.json        - Minimal manifest (start = node app.js)
dist/               - Frontend build (Express serves this for /)
uploads/            - Existing uploaded images (carry-over)
README-BACKEND.txt  - This file

------------------------------------------------------------
FEATURES INCLUDED:
------------------------------------------------------------
- Bulletproof admin login (works even if DB is briefly down)
- Auto SSL detection for Neon / Supabase / managed PG
- /api/health endpoint for one-click debugging
- Dynamic /sitemap.xml (every product / standard / industry URL)
- /robots.txt that points to the sitemap
- JSON-LD structured data on every product / standard / industry page
- Daily auto-backup (DB + uploaded images, single .json file)
- Logo + Home click → smooth scroll to top
