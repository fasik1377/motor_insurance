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

async function createVehicleTables() {
  const sqlPath = path.join(__dirname, "Vehicle TAB Type-Make-Model.sql");
  const buffer = fs.readFileSync(sqlPath);
  let sqlContent = buffer.toString("utf16le");
  
  if (sqlContent.charCodeAt(0) === 0xFEFF) {
    sqlContent = sqlContent.slice(1);
  }
  
  // Remove GO statements and USE, SET IDENTITY_INSERT
  const statements = sqlContent
    .split("GO")
    .map(s => s.trim())
    .filter(s => s.length > 0 
      && !s.toUpperCase().startsWith("USE ") 
      && !s.toUpperCase().startsWith("SET ANSI_NULLS")
      && !s.toUpperCase().startsWith("SET QUOTED_IDENTIFIER")
      && !s.toUpperCase().startsWith("SET IDENTITY_INSERT"));
  
  console.log("Executing", statements.length, "statements...");
  
  const pool = new sql.ConnectionPool(config);
  await pool.connect();
  
  let success = 0;
  let failed = 0;
  
  for (const stmt of statements) {
    try {
      await pool.request().batch(stmt);
      success++;
    } catch (e) {
      failed++;
      if (!e.message.includes("There is already an object named")) {
        console.error("Failed:", stmt.substring(0, 100), "...", e.message);
      }
    }
  }
  
  console.log(`Success: ${success}, Failed: ${failed}`);
  
  // Verify
  const vt = await pool.request().query("SELECT COUNT(*) as cnt FROM dbo.VehicleType");
  const vm = await pool.request().query("SELECT COUNT(*) as cnt FROM dbo.VehicleMake");
  const vmod = await pool.request().query("SELECT COUNT(*) as cnt FROM dbo.VehicleModel");
  console.log("VehicleType:", vt.recordset[0].cnt);
  console.log("VehicleMake:", vm.recordset[0].cnt);
  console.log("VehicleModel:", vmod.recordset[0].cnt);
  
  await pool.close();
}

createVehicleTables().catch(console.error);