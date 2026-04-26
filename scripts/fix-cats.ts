import "dotenv/config";
import { runDataFixes } from "../server/data-fix";

runDataFixes()
  .then(() => { console.log("[fix-cats] complete"); process.exit(0); })
  .catch((e) => { console.error("[fix-cats] failed:", e); process.exit(1); });
