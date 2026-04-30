# Firebase + cPanel Setup Guide

This frontend talks **directly** to Firestore + Firebase Auth — there is no
Node backend in production. The whole site is a static SPA you can drop into
any cPanel `public_html` folder.

---

## 1 · Firebase Console setup (one-time)

Open <https://console.firebase.google.com/> and select project **migo-5b73d**.

### 1a · Enable Email/Password Authentication

1. Build → **Authentication** → Get started.
2. Sign-in method tab → **Email/Password** → Enable → Save.
3. Users tab → **Add user** for each admin email (use the same emails listed
   in `VITE_ADMIN_EMAILS`). Set a strong password — this is your admin login.

### 1b · Enable Cloud Firestore

1. Build → **Firestore Database** → Create database.
2. Start in **production mode** (we'll lock it down with rules below).
3. Pick a location close to your users (e.g. `asia-south1` for India).

### 1c · Apply Firestore Security Rules

In the Rules tab, paste this and **Publish**:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // 🔐 Helper: is the signed-in user an admin?
    function isAdmin() {
      return request.auth != null && request.auth.token.email in [
        "miengineering17@gmail.com",
        "sahilsabirshaikh256@gmail.com"
      ];
    }

    // Public catalog data — anyone can read, only admins can write.
    match /products/{id}        { allow read: if true; allow write: if isAdmin(); }
    match /industries/{id}      { allow read: if true; allow write: if isAdmin(); }
    match /standards/{id}       { allow read: if true; allow write: if isAdmin(); }
    match /media/{id}           { allow read: if true; allow write: if isAdmin(); }
    match /siteContent/{id}     { allow read: if true; allow write: if isAdmin(); }
    match /pageSections/{id}    { allow read: if true; allow write: if isAdmin(); }
    match /floatingImages/{id}  { allow read: if true; allow write: if isAdmin(); }

    // Contact form: anyone can submit, only admin can read/delete.
    match /contacts/{id} {
      allow create: if true;
      allow read, update, delete: if isAdmin();
    }

    // Customer / ledger data — admin only.
    match /customers/{id}       { allow read, write: if isAdmin(); }
    match /ledgerEntries/{id}   { allow read, write: if isAdmin(); }

    // User profiles — each signed-in user owns their own doc; admins see all.
    match /users/{uid} {
      allow read, write: if request.auth != null
        && (request.auth.uid == uid || isAdmin());
    }
  }
}
```

> ⚠️ **Update the admin email list** inside the `isAdmin()` function whenever
> you change `VITE_ADMIN_EMAILS`. Both lists must match.

---

## 2 · Configure environment variables

Local development (Replit Secrets) already has these set. For your cPanel build
they get baked into the JS bundle at **build time**, so set them in your build
environment (Replit Secrets / `.env` file) before running `npm run build`:

```
VITE_FIREBASE_API_KEY=AIzaSyCsHOuFi82wq8LNi4LxaA_m46wfctQvKQU
VITE_FIREBASE_AUTH_DOMAIN=migo-5b73d.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=migo-5b73d
VITE_FIREBASE_STORAGE_BUCKET=migo-5b73d.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=194756594222
VITE_FIREBASE_APP_ID=1:194756594222:web:3e6f2226a13cb34ccbadbf
VITE_FIREBASE_MEASUREMENT_ID=G-9WYPJMDRKF
VITE_ADMIN_EMAILS=miengineering17@gmail.com,sahilsabirshaikh256@gmail.com
```

---

## 3 · One-time data migration (Postgres → Firestore)

A snapshot of the old Postgres data lives in `src/data/firestore-seed/*.json`
and is bundled with every build.

1. Run the dev server (or open the deployed site).
2. Sign in at **`/admin/login`** with one of the admin emails you created in
   Firebase Auth.
3. Open **`/admin/migrate`**.
4. Click **"Run full migration"** — this writes the bundled JSON snapshot into
   Firestore. Safe to re-run; existing docs are merged, not duplicated.

If a step fails with "Missing or insufficient permissions" — your Firestore
rules from §1c are wrong (most likely the admin email list).

---

## 4 · Build & deploy to cPanel

### 4a · Build the static bundle

```bash
npm run build
```

This produces a `dist/` folder containing `index.html`, `assets/`, and a few
static files. **That entire folder is your website** — no Node, no Express,
no database connection.

### 4b · Upload to cPanel

1. Open cPanel → **File Manager** → `public_html/` (or your subdomain folder).
2. Upload **everything inside** `dist/` (not the `dist/` folder itself).
3. Add a `.htaccess` file alongside `index.html` so client-side routing works:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  # Don't rewrite real files / folders / uploads
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]
  # Send everything else to index.html (React Router handles it)
  RewriteRule ^ index.html [L]
</IfModule>

<IfModule mod_headers.c>
  # Long-cache the hashed assets
  <FilesMatch "\.(js|css|png|jpg|jpeg|webp|svg|woff2)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
</IfModule>
```

### 4c · Image uploads (cPanel uploads folder)

The "upload image" button in the admin is disabled in this build. To add
images:

1. cPanel **File Manager** → `public_html/uploads/` (create this folder if it
   doesn't exist).
2. Upload your image (e.g. `m12-bolt.jpg`).
3. In the admin product/industry/etc. edit screen, paste the URL:
   `/uploads/m12-bolt.jpg`.

The image is then served as a normal static file by Apache.

---

## 5 · Local development

```bash
npm install
npm run dev
```

Vite serves the frontend on `http://localhost:5000`. The tiny stub at
`server/index.ts` runs on `:3001` only so the existing dev script doesn't
crash — it doesn't serve any real API. All data goes straight to Firestore.

---

## 6 · Troubleshooting

| Symptom                                          | Fix                                                    |
| ------------------------------------------------ | ------------------------------------------------------ |
| Login error: "auth/invalid-credential"           | The email isn't in Firebase Auth — add it in step 1a.  |
| "This email is not authorised as an admin"       | Add the email to `VITE_ADMIN_EMAILS` and rebuild.      |
| "Missing or insufficient permissions"            | Update Firestore rules with the correct admin emails.  |
| Empty product / industry list on the public site | You haven't run the migration yet (§3).                |
| 404 on every page after deploy                   | Missing `.htaccess` (§4b) — React Router needs it.     |
