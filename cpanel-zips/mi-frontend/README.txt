M.I. Engineering Works — FRONTEND (built static site)
=======================================================

This zip contains ONLY the built frontend files (HTML / JS / CSS / images).
It must be served together with the backend (mi-backend.zip) — the frontend
calls the backend at /api/*.

What's inside
-------------
  index.html         ← main page
  assets/            ← compiled JS, CSS, fonts, product images
  favicon.png
  robots.txt
  sitemap.xml
  placeholder.svg

Two ways to use it on cPanel
============================

OPTION A — Frontend served BY the backend (recommended, single Node app)
------------------------------------------------------------------------
This is what the included CPANEL_DEPLOY.md (in mi-backend.zip) explains.
Inside the backend folder there is a `dist/` directory — copy/replace
everything from THIS zip into that `dist/` folder. The Node server then
serves the static files for every non-/api URL.

  /home/USERNAME/mi-engineering/dist/   ← put these files here

OPTION B — Frontend on Apache + Backend on Node (advanced)
----------------------------------------------------------
If you want to host the static frontend on Apache (public_html) and run
the backend separately:

1. Upload the contents of THIS zip into  public_html/  of your domain.
2. Deploy the backend zip as a Node.js app (see backend's CPANEL_DEPLOY.md),
   but pick a sub-domain like  api.miengineering.in  for it.
3. Add a .htaccess in public_html/ to proxy /api/* to the Node app:

     RewriteEngine On
     RewriteRule ^api/(.*)$ https://api.miengineering.in/api/$1 [P,L]

4. Also add this so React Router (client-side routes) keeps working:

     RewriteEngine On
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]

Updating the frontend later
---------------------------
Whenever the frontend is rebuilt locally (npm run build), this zip is
regenerated. Re-upload it to the same place — no Node restart needed
for OPTION B; for OPTION A, restart the Node app from cPanel.
