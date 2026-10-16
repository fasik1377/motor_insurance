/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");
const sql = require("mssql/msnodesqlv8");

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return;

  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=]+?)\s*=\s*(.*)\s*$/);
    if (!match || process.env[match[1]] !== undefined) continue;
    process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, "$2");
  }
}

function asBoolean(value, fallback) {
  if (value === undefined || value === "") return fallback;
  return value.toLowerCase() === "true";
}

async function main() {
  const sqlFile = process.argv[2];
  const execute = process.argv.includes("--execute");
  const describe = process.argv.includes("--describe");
  if (!sqlFile) throw new Error("Usage: node scripts/import-sql.cjs <file.sql> [--execute]");

  loadEnv(path.resolve(".env.local"));
  const user = process.env.DB_USER?.trim();
  const password = process.env.DB_PASSWORD?.trim();
  const trustedConnection = !user && !password;
  const config = {
    driver: process.env.DB_DRIVER || "ODBC Driver 18 for SQL Server",
    server: process.env.DB_SERVER,
    port: Number(process.env.DB_PORT || 1433),
    database: process.env.DB_DATABASE || process.env.DB_NAME,
    ...(trustedConnection ? {} : { user, password }),
    options: {
      trustedConnection,
      encrypt: asBoolean(process.env.DB_ENCRYPT, false),
      trustServerCertificate: asBoolean(process.env.DB_TRUST_SERVER_CERTIFICATE, true),
    },
  };

  const scriptBuffer = fs.readFileSync(path.resolve(sqlFile));
  const script = scriptBuffer[0] === 0xff && scriptBuffer[1] === 0xfe
    ? scriptBuffer.subarray(2).toString("utf16le")
    : scriptBuffer.toString("utf8").replace(/^\uFEFF/, "");
  const tableNames = [...script.matchAll(/CREATE\s+TABLE\s+\[dbo\]\.\[([^\]]+)\]/gi)].map((match) => match[1]);
  const pool = await new sql.ConnectionPool(config).connect();

  try {
    const existing = await pool.request().query(
      `SELECT name FROM sys.tables WHERE schema_id = SCHEMA_ID('dbo') AND name IN (${tableNames
        .map((name) => `N'${name.replaceAll("'", "''")}'`)
        .join(", ")}) ORDER BY name`,
    );

    console.log(JSON.stringify({
      database: config.database,
      tablesInFile: tableNames.length,
      existingTables: existing.recordset.map((row) => row.name),
      mode: execute ? "execute" : "preflight",
    }, null, 2));

    if (describe && existing.recordset.length) {
      const details = await pool.request().query(`
        SELECT
          t.name AS table_name,
          c.column_id,
          c.name AS column_name,
          ty.name AS data_type,
          c.max_length,
          c.precision,
          c.scale,
          c.is_nullable,
          c.is_identity,
          dc.definition AS default_definition,
          CASE WHEN pk.column_id IS NULL THEN 0 ELSE 1 END AS is_primary_key
        FROM sys.tables t
        JOIN sys.columns c ON c.object_id = t.object_id
        JOIN sys.types ty ON ty.user_type_id = c.user_type_id
        LEFT JOIN sys.default_constraints dc ON dc.parent_object_id = c.object_id AND dc.parent_column_id = c.column_id
        LEFT JOIN (
          SELECT ic.object_id, ic.column_id
          FROM sys.indexes i
          JOIN sys.index_columns ic ON ic.object_id = i.object_id AND ic.index_id = i.index_id
          WHERE i.is_primary_key = 1
        ) pk ON pk.object_id = c.object_id AND pk.column_id = c.column_id
        WHERE t.schema_id = SCHEMA_ID('dbo')
          AND t.name IN (${tableNames.map((name) => `N'${name.replaceAll("'", "''")}'`).join(", ")})
        ORDER BY t.name, c.column_id
      `);
      console.log(JSON.stringify(details.recordset, null, 2));
    }

    if (!execute) return;
    if (existing.recordset.length) {
      throw new Error("Import stopped because one or more target tables already exist.");
    }

    const batches = script.split(/^\s*GO\s*(?:--.*)?$/gim).filter((batch) => batch.trim());
    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    try {
      for (const batch of batches) await transaction.request().batch(batch);
      await transaction.commit();
      console.log(`Imported ${tableNames.length} tables in ${batches.length} batches.`);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } finally {
    await pool.close();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
