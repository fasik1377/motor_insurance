const sql = require("mssql/msnodesqlv8");
const fs = require("fs");
// Load .env.local manually
const fs2 = require("fs");
const path = require("path");
const envPath = path.join(__dirname, "..", ".env.local");
if (fs2.existsSync(envPath)) {
  fs2.readFileSync(envPath, "utf8").split("\n").forEach(line => {
    const [key, ...val] = line.split("=");
    if (key && val.length) process.env[key.trim()] = val.join("=").trim();
  });
}

function requiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function integerEnv(name, fallback) {
  const rawValue = process.env[name];
  if (!rawValue) return fallback;
  const value = parseInt(rawValue, 10);
  if (!Number.isInteger(value) || value < 0) throw new Error(`${name} must be a non-negative integer`);
  return value;
}

function booleanEnv(name, fallback) {
  const rawValue = process.env[name]?.toLowerCase();
  if (!rawValue) return fallback;
  if (rawValue === "true") return true;
  if (rawValue === "false") return false;
  throw new Error(`${name} must be either true or false`);
}

function createConfig() {
  const user = process.env.DB_USER?.trim();
  const password = process.env.DB_PASSWORD?.trim();
  const trustedConnection = !user && !password;

  return {
    driver: process.env.DB_DRIVER?.trim() || "ODBC Driver 18 for SQL Server",
    server: requiredEnv("DB_SERVER"),
    port: integerEnv("DB_PORT", 1433),
    database: process.env.DB_DATABASE?.trim() || requiredEnv("DB_NAME"),
    ...(trustedConnection ? {} : { user, password }),
    pool: {
      max: integerEnv("DB_POOL_MAX", 10),
      min: integerEnv("DB_POOL_MIN", 0),
      idleTimeoutMillis: integerEnv("DB_POOL_IDLE_TIMEOUT_MS", 30000),
    },
    options: {
      trustedConnection,
      encrypt: booleanEnv("DB_ENCRYPT", false),
      trustServerCertificate: booleanEnv("DB_TRUST_SERVER_CERTIFICATE", true),
    },
  };
}

async function runScript2() {
  const scriptPath = "C:\\Users\\yidid\\OneDrive\\Desktop\\Remote Jobs Files\\macrosolutions\\script2";
  let script = fs.readFileSync(scriptPath, "utf16le");
  script = script.replace(/^\uFEFF/, ""); // Remove BOM
  console.log("First 100 chars:", JSON.stringify(script.substring(0, 100)));

  // Split by GO statements
  const batches = script
    .split(/\n\s*GO\s*\n/i)
    .map((b) => b.trim())
    .filter((b) => b.length > 0 && !b.startsWith("USE [") && !b.startsWith("SET ANSI_NULLS") && !b.startsWith("SET QUOTED_IDENTIFIER"));
  
  console.log("Number of batches:", batches.length);
  batches.forEach((b, i) => console.log(`Batch ${i}:`, b.substring(0, 100)));

  const config = createConfig();
  const pool = new sql.ConnectionPool(config);
  await pool.connect();
  console.log("Connected to database");

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    if (!batch) continue;

    console.log(`\n--- Executing batch ${i + 1}/${batches.length} ---`);
    console.log(batch.substring(0, 200) + (batch.length > 200 ? "..." : ""));

    try {
      await pool.request().batch(batch);
      console.log("✓ Success");
    } catch (error) {
      // Ignore "already exists" errors
      if (error.message?.includes("already exists") || error.message?.includes("duplicate key") || error.message?.includes("Violation of PRIMARY KEY") || error.message?.includes("There is already an object named")) {
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