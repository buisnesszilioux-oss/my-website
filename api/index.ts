/**
 * Vercel serverless entry point.
 * Vercel bundles this file with esbuild and runs it as a Node.js
 * serverless function. The Express app handles all routing internally.
 *
 * Routes directed here via vercel.json rewrites:
 *   /api/(.*)      → all backend API calls
 *   /uploads/(.*) → uploaded file serving (ephemeral in serverless)
 */
import app from "../server/index";

export default app;
