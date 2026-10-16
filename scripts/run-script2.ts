import { getDb, sql } from "@/lib/db";

async function runScript2() {
  const scriptPath = "C:\\Users\\yidid\\OneDrive\\Desktop\\Remote Jobs Files\\macrosolutions\\script2";
  const fs = require("fs");
  const script = fs.readFileSync(scriptPath, "utf8");

  // Split by GO statements
  const batches = script
    .split(/\n\s*GO\s*\n/i)
    .map((b) => b.trim())
    .filter((b) => b.length > 0 && !b.startsWith("USE ["));

  const pool = await getDb();

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    if (!batch) continue;

    console.log(`\n--- Executing batch ${i + 1}/${batches.length} ---`);
    console.log(batch.substring(0, 200) + (batch.length > 200 ? "..." : ""));

    try {
      await pool.request().batch(batch);
      console.log("✓ Success");
    } catch (error: any) {
      // Ignore "already exists" errors
      if (error.message?.includes("already exists") || error.message?.includes("duplicate key")) {
        console.log("⊘ Already exists, skipping");
      } else {
        console.error("✗ Error:", error.message);
        throw error;
      }
    }
  }

  console.log("\n✓ All batches completed");
  await pool.close();
}

runScript2().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});