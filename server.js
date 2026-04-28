// cPanel / Passenger entry point.
// Many cPanel hosts default the "Application startup file" to `app.js` or
// `server.js`. This file is just a tiny loader so they all work — the real
// application is the bundled, compiled JavaScript at `dist/server.cjs`.
//
// If `dist/server.cjs` is missing, run:
//   npm run build && npm run build:server
// (or follow CPANEL_DEPLOY.md).

import { createRequire } from "module";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bundlePath = path.join(__dirname, "dist", "server.cjs");

if (!fs.existsSync(bundlePath)) {
  console.error("[server.js] FATAL: dist/server.cjs not found.");
  console.error("[server.js] Run `npm run build` and the esbuild bundle command before starting (see CPANEL_DEPLOY.md).");
  process.exit(1);
}

require(bundlePath);
