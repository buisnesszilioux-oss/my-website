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
   - Application URL: miengineeringworks.com
   - Application startup file:  app.js
3. Application banao, phir File Manager me jao
4. App folder (jaise /home/USER/nodeapp/) ke ANDAR yeh zip extract karo
5. Setup Node.js App me wapas jao:
   - "Run NPM Install" button DABANE KI ZAROORAT NAHI HAI.
     (Sab dependencies pehle se bundled hain.)
   - Environment variables daalo (.env.example me list di hai)
   - "Restart" dabao
6. Done. Site live ho jaani chahiye.

------------------------------------------------------------
ZAROORI ENVIRONMENT VARIABLES (Setup Node.js App ke andar):
------------------------------------------------------------
DATABASE_URL       postgres://user:pass@host:5432/db
JWT_SECRET         -4hFGHwDWUtVIB7ZoBIJIRxTOzcxFnW3P5WKjG3XmVmcGT6edqV0ESUyioa5OyBd
ADMIN_USERNAME     miengineering@gmail.com,miengineering17@gmail.com
ADMIN_PASSWORD     6392061892
GOOGLE_CLIENT_ID   374744007598-plgqj6s9ds83v5aij2ehtm60ad2k86er.apps.googleusercontent.com
NODE_ENV           production

------------------------------------------------------------
CONTENTS:
------------------------------------------------------------
app.js          - cPanel startup entry (just requires server.cjs)
server.cjs      - Bundled server (3.6 MB, includes ALL dependencies)
package.json    - Minimal package file (no dependencies — all bundled)
uploads/        - Aapke uploaded photos / PDFs
dist/           - Frontend (only used if you don't put it in public_html)
.env.example    - Template for environment variables

------------------------------------------------------------
FRONTEND:
------------------------------------------------------------
Frontend ke liye alag zip hai (public_html-frontend.zip).
Usko cPanel ke public_html folder me extract karo.
