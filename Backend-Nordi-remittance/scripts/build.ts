import logger from "jet-logger";
import { exec, remove } from "./common/utils.js";

// ============================================================================
// BUILD SCRIPT — Nordi Remittance Backend
// Compiles TypeScript with tsconfig.prod.json → dist/
// ============================================================================

(async () => {
  try {
    logger.info("🧹 Removing previous build artifacts...");
    await remove("./dist/");
    await remove("./temp/");

    logger.info("🔨 Compiling TypeScript (tsconfig.prod.json)...");
    // exec() resolves loc relative to the calling script (scripts/build.ts),
    // so "../" points to the project root where tsconfig.prod.json lives.
    await exec("tsc --project tsconfig.prod.json", "../");

    // tsconfig.prod.json outDir is ./temp — rename it to ./dist
    logger.info("📦 Moving temp → dist...");
    await exec("mv temp dist", "../");

    logger.info("✅ Build complete → dist/");
  } catch (err) {
    logger.err(err);
    process.exit(1);
  }
})();



