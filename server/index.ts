/**
 * Stub backend.
 *
 * The frontend now talks directly to Firestore + Firebase Auth (see
 * `src/lib/firestoreApi.ts`). The Node backend is no longer used in
 * production. We keep this tiny Express server only so that the existing
 * `npm run dev` script (which runs concurrently with Vite) doesn't crash.
 *
 * If a request reaches `/api/*` here, it means the frontend's fetch
 * interceptor missed it — return a clear 410 message.
 */

import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => res.json({ ok: true, mode: "firestore" }));

app.use("/api", (_req, res) =>
  res.status(410).json({
    error:
      "The Node backend has been retired. The frontend now talks directly to Firestore via the client SDK. See src/lib/firestoreApi.ts.",
  }),
);

const PORT = Number(process.env.PORT || process.env.SERVER_PORT || 3001);
app.listen(PORT, "0.0.0.0", () => {
  console.log(`[server] stub listening on :${PORT} (frontend uses Firestore directly)`);
});
