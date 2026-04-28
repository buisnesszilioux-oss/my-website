#!/usr/bin/env node
// Builds two cPanel-ready ZIPs:
//   1. cpanel-zips/mi-backend.zip      → goes into the cPanel Node.js app folder
//   2. cpanel-zips/mi-public_html.zip  → goes into public_html for static hosting
//
// Usage:  node scripts/build-cpanel.cjs

const fs = require("fs");
const path = require("path");
const archiver = require("archiver");

const ROOT = path.resolve(__dirname, "..");
const OUT  = path.join(ROOT, "cpanel-zips");
fs.mkdirSync(OUT, { recursive: true });

function zipDir(srcDir, outFile) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outFile);
    const archive = archiver("zip", { zlib: { level: 6 } });
    output.on("close", () => resolve(archive.pointer()));
    archive.on("error", reject);
    archive.pipe(output);
    archive.directory(srcDir, false);
    archive.finalize();
  });
}

(async () => {
  const backendDir   = path.join(ROOT, "cpanel-backend");
  const backendZip   = path.join(OUT, "mi-backend.zip");
  const frontendDir  = path.join(ROOT, "dist");
  const frontendZip  = path.join(OUT, "mi-public_html.zip");

  if (!fs.existsSync(backendDir))  throw new Error("Run prepare step: cpanel-backend/ missing");
  if (!fs.existsSync(frontendDir)) throw new Error("Run `npm run build` first to create dist/");

  console.log("[zip] backend  →", backendZip);
  const a = await zipDir(backendDir, backendZip);
  console.log(`         ${(a / 1024 / 1024).toFixed(2)} MB`);

  console.log("[zip] frontend →", frontendZip);
  const b = await zipDir(frontendDir, frontendZip);
  console.log(`         ${(b / 1024 / 1024).toFixed(2)} MB`);

  console.log("[zip] done");
})().catch((e) => {
  console.error("[zip] failed:", e);
  process.exit(1);
});
