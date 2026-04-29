#!/usr/bin/env node
// Builds cPanel-ready ZIPs:
//   1. cpanel-zips/mi-backend-nodeapp.zip       → cPanel Node.js app folder
//   2. cpanel-zips/mi-frontend-public_html.zip  → cPanel public_html folder
//   3. cpanel-zips/mi-fullstack-cpanel.zip      → single-app fallback (both in one)
//
// Usage:  node scripts/build-cpanel.cjs

const fs = require("fs");
const path = require("path");
const archiver = require("archiver");

const ROOT = path.resolve(__dirname, "..");
const OUT  = path.join(ROOT, "cpanel-zips");
fs.mkdirSync(OUT, { recursive: true });

function zipDir(srcDir, outFile, opts = {}) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outFile);
    const archive = archiver("zip", { zlib: { level: 6 } });
    output.on("close", () => resolve(archive.pointer()));
    archive.on("error", reject);
    archive.pipe(output);
    if (opts.exclude && opts.exclude.length) {
      archive.glob("**/*", {
        cwd: srcDir,
        dot: true,
        ignore: opts.exclude,
      });
    } else {
      archive.directory(srcDir, false);
    }
    archive.finalize();
  });
}

(async () => {
  const backendDir   = path.join(ROOT, "cpanel-backend");
  const frontendDir  = path.join(ROOT, "dist");

  if (!fs.existsSync(backendDir))  throw new Error("cpanel-backend/ missing — bundle the server first");
  if (!fs.existsSync(frontendDir)) throw new Error("dist/ missing — run `npm run build` first");

  // 1. Backend-only zip (no dist inside) — for split deployment
  const backendOnlyZip = path.join(OUT, "mi-backend-nodeapp.zip");
  console.log("[zip] backend (split, no dist) →", backendOnlyZip);
  const a = await zipDir(backendDir, backendOnlyZip, { exclude: ["dist/**"] });
  console.log(`         ${(a / 1024 / 1024).toFixed(2)} MB`);

  // 2. Frontend zip — for public_html
  const frontendZip = path.join(OUT, "mi-frontend-public_html.zip");
  console.log("[zip] frontend (public_html) →", frontendZip);
  const b = await zipDir(frontendDir, frontendZip);
  console.log(`         ${(b / 1024 / 1024).toFixed(2)} MB`);

  // 3. Full-stack zip — for single-app deployment (Application URL = root)
  const fullZip = path.join(OUT, "mi-fullstack-cpanel.zip");
  console.log("[zip] fullstack (single-app) →", fullZip);
  const c = await zipDir(backendDir, fullZip);
  console.log(`         ${(c / 1024 / 1024).toFixed(2)} MB`);

  console.log("\n[zip] done — 3 zips ready in cpanel-zips/");
})().catch((e) => {
  console.error("[zip] failed:", e);
  process.exit(1);
});
