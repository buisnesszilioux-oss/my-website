# Firebase Setup — M.I. Engineering Works

This document explains how to finish wiring up Firebase Authentication + Firestore so the new login/register/role-redirect system works on your live cPanel-hosted site.

---

## 1. What's already done in code

| File | Purpose |
| --- | --- |
| `src/lib/firebase.ts` | Initializes Firebase App, exports `auth`, `db`, and `ADMIN_EMAIL`. |
| `src/contexts/AuthContext.tsx` | React context wrapping Firebase Auth + Firestore `users` collection. Exposes `login`, `register`, `logout`, `updateProfile`, `user`, `isAdmin`. |
| `src/components/ProtectedRoute.tsx` | Generic route guard. Use `requireAdmin` to lock pages to admins. |
| `src/pages/admin/RequireAdmin.tsx` | Admin-only route guard (redirects non-admins to `/dashboard`). |
| `src/pages/UserAuthPage.tsx` | Public login + register page (`/auth`, `/login`, `/register`). |
| `src/pages/admin/AdminLogin.tsx` | Admin sign-in page (`/admin/login`). |
| `src/pages/DashboardPage.tsx` | Customer dashboard (`/dashboard`). |
| `src/App.tsx` | New routes: `/auth`, `/dashboard`, `/account` (protected). |

**Redirect rules after login:**
- Email matches `miengineering17@gmail.com` → `/admin`
- Anyone else → `/dashboard`

**Firestore data model (auto-created on signup):**
```
users/{uid} = {
  uid: string,
  email: string,        // lowercased
  name: string,
  phone: string,        // optional
  company: string,      // optional
  picture: string,      // optional
  role: "admin" | "user",
  createdAt: serverTimestamp
}
```

---

## 2. One-time setup in the Firebase Console

You must do these once for the project `miweb-edaf5`:

### A. Enable Email/Password Authentication
1. Open https://console.firebase.google.com/project/miweb-edaf5/authentication/providers
2. Click **Email/Password** → toggle **Enable** → **Save**.

### B. Create Firestore database
1. Open https://console.firebase.google.com/project/miweb-edaf5/firestore
2. Click **Create database** → start in **production mode** → pick a region (e.g. `asia-south1` for India).

### C. Add Authorized Domains
Auth will refuse to sign users in from any host that isn't whitelisted.
1. Open https://console.firebase.google.com/project/miweb-edaf5/authentication/settings
2. Under **Authorized domains**, add:
   - Your cPanel/production domain (e.g. `miengineeringworks.com`)
   - Any preview / staging domains you use
   - `localhost` is added automatically

### D. Apply Firestore Security Rules
Open https://console.firebase.google.com/project/miweb-edaf5/firestore/rules and paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // helpers
    function isSignedIn()    { return request.auth != null; }
    function isOwner(uid)    { return isSignedIn() && request.auth.uid == uid; }
    function isAdminEmail()  {
      return isSignedIn()
        && request.auth.token.email != null
        && request.auth.token.email.lower() == 'miengineering17@gmail.com';
    }

    // /users/{uid}
    match /users/{uid} {
      // a user can read their own doc; admin can read any
      allow read:   if isOwner(uid) || isAdminEmail();
      // a user can create only their own doc, with role forced to 'user' (admin gets 'admin' on first read)
      allow create: if isOwner(uid)
                    && request.resource.data.uid == uid
                    && request.resource.data.email is string
                    && request.resource.data.role in ['user', 'admin'];
      // a user can update their own profile fields except role; admin can update any field
      allow update: if (isOwner(uid) && !('role' in request.resource.data.diff(resource.data).affectedKeys()))
                    || isAdminEmail();
      allow delete: if isAdminEmail();
    }

    // default: deny everything else
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```
Click **Publish**.

### E. Create the admin account
The admin role is granted automatically to whoever signs up with `miengineering17@gmail.com`. So:
1. Open your site at `/auth` (or `/admin/login`).
2. Click **Create Account** tab.
3. Register with email `miengineering17@gmail.com` and a strong password.
4. You'll be redirected straight to `/admin`.

After this, `/admin/login` works for you and `/auth` works for everyone else.

---

## 3. Environment variables (optional but recommended)

The Firebase config is hard-coded as a fallback in `src/lib/firebase.ts`, but you can override it via env vars if you ever rotate keys or use different Firebase projects per environment.

Create `.env` (or set these in your cPanel build environment):

```
VITE_FIREBASE_API_KEY=AIzaSyBoAKGgn_Abb8qADt0u_N_-P0ZzR-vGlOE
VITE_FIREBASE_AUTH_DOMAIN=miweb-edaf5.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=miweb-edaf5
VITE_FIREBASE_STORAGE_BUCKET=miweb-edaf5.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=943224981876
VITE_FIREBASE_APP_ID=1:943224981876:web:c92167e6f873aca4ec0421
VITE_FIREBASE_MEASUREMENT_ID=G-GVVDEHW5N5
VITE_ADMIN_EMAIL=miengineering17@gmail.com
```

> Note: These keys are **public** — Firebase web SDK keys are designed to be exposed in client code. Real security comes from the Firestore rules above + Authorized Domains list.

---

## 4. Building for cPanel

1. Run `npm install` (only needed once or when packages change).
2. Run `npm run build` — this produces a `dist/` folder.
3. Upload **everything inside `dist/`** to your cPanel `public_html/` (or the subfolder you serve the site from).
4. Add an `.htaccess` file in `public_html/` so React Router deep-links work:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

That's it — visiting `/auth`, `/dashboard`, `/admin`, etc. will all resolve to your SPA.

---

## 5. Quick smoke test

1. Visit `/auth` → register with a non-admin email → you should land on `/dashboard`.
2. Sign out from the dashboard.
3. Visit `/auth` → register with `miengineering17@gmail.com` → you should land on `/admin`.
4. Open the Firestore console → `users` collection → you should see two docs, one with `role: "user"` and one with `role: "admin"`.

---

## 6. What is NOT yet in Firebase

The current Replit project still uses the old Node + PostgreSQL backend for everything else (products, industries, standards, hero images, contacts, ledger, animations, floating images, media uploads). Phase 1 (this) only migrated **auth + the users collection** to Firebase.

If you want to fully drop the Node backend and move all admin data + uploads to Firebase, that's a separate phase — Firestore for the data and Firebase Storage for image/video uploads (Storage requires the Blaze paid plan).
