// cPanel "Application startup file" — point cPanel here.
//
// Loads the bundled server. Saara backend code + npm dependencies pre-bundled
// hain server.cjs me (no `npm install` needed on cPanel).
//
// In production, the bundled Express server ALSO serves the React frontend
// from the ./dist folder, so a single Node.js app handles both /api/* AND
// every other route. NO separate public_html upload required.
"use strict";

process.env.NODE_ENV = process.env.NODE_ENV || "production";

// Helpful one-line diagnostic for cPanel "Logs" panel.
const missing = [];
if (!process.env.DATABASE_URL)   missing.push("DATABASE_URL");
if (!process.env.JWT_SECRET)     missing.push("JWT_SECRET");
if (!process.env.ADMIN_PASSWORD) missing.push("ADMIN_PASSWORD");
if (!process.env.ADMIN_USERNAME) missing.push("ADMIN_USERNAME");
if (missing.length) {
  console.error(
    "[startup] MISSING REQUIRED ENV VARS: " + missing.join(", ") +
    "\n[startup] Add them in cPanel → Setup Node.js App → Environment variables, then Restart."
  );
}

require("./server.cjs");
