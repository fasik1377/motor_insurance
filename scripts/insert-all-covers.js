const sql = require("mssql/msnodesqlv8");
const fs = require("fs");
const path = require("path");

const config = {
  driver: "ODBC Driver 18 for SQL Server",
  server: "localhost",
  port: 1433,
  database: "NiaData",
  options: {
    trustedConnection: true,
    encrypt: false,
    trustServerCertificate: true,
  },
};

async function insertAllCovers() {
  const sqlPath = path.join(__dirname, "cover.sql");
  const buffer = fs.readFileSync(sqlPath);
  let sqlContent = buffer.toString("utf16le");
  
  if (sqlContent.charCodeAt(0) === 0xFEFF) {
    sqlContent = sqlContent.slice(1);
  }
  
  // Remove CREATE TABLE, SET, USE statements - keep only INSERTs
  const lines = sqlContent.split(/\n/);
  const insertLines = lines.filter(line => {
    const trimmed = line.trim().toUpperCase();
    return trimmed.startsWith("INSERT");
  });
  
  const insertStatements = insertLines.join("\n");
  console.log("Executing", insertLines.length, "INSERT statements...");
  
  const pool = new sql.ConnectionPool(config);
  await pool.connect();
  
  // Execute all INSERTs at once
  await pool.request().batch(insertStatements);
  
  console.log("All covers inserted!");
  
  // Verify
  const result = await pool.request().query("SELECT Department, Name, Code, YngExcess FROM dbo.Cover ORDER BY Department, Name");
  console.log("All covers:", result.recordset.length, "rows");
  
  await pool.close();
}

insertAllCovers().catch(console.error);