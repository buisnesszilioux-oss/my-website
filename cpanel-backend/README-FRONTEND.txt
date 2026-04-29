============================================================
M.I. ENGINEERING WORKS — FRONTEND  (public_html ke liye)
============================================================

Yeh ZIP cPanel ke public_html folder me extract karna hai.
Backend ka alag ZIP hai jo Node.js app folder me jaata hai.

------------------------------------------------------------
ANDAR KYA HAI
------------------------------------------------------------
  index.html       -> Main entry
  assets/          -> Built JS + CSS
  favicon.png, robots.txt, sitemap.xml, placeholder.svg
  .htaccess        -> SPA routing + /api proxy ke liye

------------------------------------------------------------
STEP 1 — public_html clean karo
------------------------------------------------------------
  1. cPanel -> File Manager -> public_html me jao
  2. Purani files (jo M.I. Engineering ki hain) backup le ke
     hata do. Default cgi-bin folder mat chhuna.

------------------------------------------------------------
STEP 2 — Frontend ZIP upload karo
------------------------------------------------------------
  1. Upload -> mi-frontend-public_html.zip select karo
  2. Right-click -> Extract (public_html ke andar)
  3. Sab files seedha public_html me hone chahiye —
     andar koi sub-folder NAHI hona chahiye.
     (Agar mi-frontend/ folder bana ho to uske andar ki saari
      files cut kar ke public_html me paste karo.)
  4. ZIP delete kar do.

------------------------------------------------------------
STEP 3 — .htaccess check karo
------------------------------------------------------------
  public_html me .htaccess file honi chahiye. Agar nahi dikhe to
  File Manager > Settings > "Show Hidden Files" enable karo.

  Yeh do kaam karta hai:
    a) /api/* requests ko Node.js backend par bhejta hai
    b) React Router ke liye saare routes ko index.html par bhejta hai

  Backend agar SAME domain par hai (e.g. yourdomain.com aur
  yourdomain.com/api/...) to .htaccess pehle se sahi hai.

  Backend agar SUBDOMAIN par hai (e.g. api.yourdomain.com) to
  .htaccess me yeh line update karo:
        RewriteRule ^api/(.*)$ https://api.yourdomain.com/$1 [P,L]
  Aur cPanel ke "mod_proxy" / "mod_rewrite" enable hone chahiye
  (default enabled hote hain shared hosting par).

------------------------------------------------------------
STEP 4 — Test
------------------------------------------------------------
  Browser me kholo:  https://yourdomain.com
  Home page khulna chahiye.

  Login test karo:
    https://yourdomain.com/admin/login
    -> apna admin email + ADMIN_PASSWORD daalo
    -> /admin dashboard khulna chahiye

------------------------------------------------------------
TROUBLESHOOTING
------------------------------------------------------------
  Page khalee aata hai (white screen):
    -> Browser DevTools (F12) -> Console kholo. Agar 404 errors
       aa rahe hain assets ke liye, matlab files galat folder me
       extract hui hain. Sab files seedha public_html me honi
       chahiye.

  Login pe "Invalid email or password" aa raha hai:
    -> Backend me ADMIN_USERNAME aur ADMIN_PASSWORD env vars set
       nahi hain. cPanel ke "Setup Node.js App" me check karo.

  /api/* calls 502/504 de rahe hain:
    -> Backend Node.js app start nahi hai. cPanel me "Restart"
       dabao aur Logs check karo.

  Routes (e.g. /products/abc) reload pe 404 dete hain:
    -> .htaccess missing/galat hai. Upar STEP 3 dobara karo.
