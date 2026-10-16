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

async function createTables() {
  const sqlPath = path.join(__dirname, "Vehicle TAB Type-Make-Model.sql");
  const buffer = fs.readFileSync(sqlPath);
  let sqlContent = buffer.toString("utf16le");
  
  if (sqlContent.charCodeAt(0) === 0xFEFF) {
    sqlContent = sqlContent.slice(1);
  }
  
  // Split by GO and find CREATE TABLE statements
  const sections = sqlContent.split("GO");
  
  const pool = new sql.ConnectionPool(config);
  await pool.connect();
  
  // First, create tables - extract CREATE TABLE statements
  for (const section of sections) {
    const trimmed = section.trim().toUpperCase();
    if (trimmed.startsWith("CREATE TABLE")) {
      try {
        await pool.request().batch(section);
        console.log("Created table:", section.substring(0, 80).replace(/\n/g, " "));
      } catch (e) {
        if (!e.message.includes("There is already an object named")) {
          console.error("Create table error:", e.message);
        }
      }
    }
  }
  
  // Then handle SET IDENTITY_INSERT ON and INSERT for VehicleType
  let inIdentityInsert = false;
  for (const section of sections) {
    const trimmed = section.trim().toUpperCase();
    if (trimmed.startsWith("SET IDENTITY_INSERT") && trimmed.includes("ON")) {
      inIdentityInsert = true;
      try {
        await pool.request().batch(section);
        console.log("SET IDENTITY_INSERT ON");
      } catch (e) {
        console.error("Identity insert error:", e.message);
      }
      continue;
    }
    if (trimmed.startsWith("SET IDENTITY_INSERT") && trimmed.includes("OFF")) {
      inIdentityInsert = false;
      try {
        await pool.request().batch(section);
        console.log("SET IDENTITY_INSERT OFF");
      } catch (e) {
        console.error("Identity insert error:", e.message);
      }
      continue;
    }
    if (inIdentityInsert && trimmed.startsWith("INSERT") && trimmed.includes("VEHICLETYPE")) {
      try {
        await pool.request().batch(section);
      } catch (e) {
        if (!e.message.includes("Cannot insert explicit value")) {
          console.error("VehicleType insert error:", e.message.substring(0, 100));
        }
      }
    }
  }
  
  console.log("\nVehicleType inserts done. Now inserting VehicleMake...");
  
  // Insert VehicleMake - these have complex strings, execute one by one
  for (const section of sections) {
    const trimmed = section.trim().toUpperCase();
    if (trimmed.startsWith("INSERT") && trimmed.includes("VEHICLEMAKE")) {
      try {
        await pool.request().batch(section);
      } catch (e) {
        // Ignore errors for now - data may have issues
      }
    }
  }
  
  console.log("VehicleMake inserts done. Now inserting VehicleModel...");
  
  // Insert VehicleModel
  for (const section of sections) {
    const trimmed = section.trim().toUpperCase();
    if (trimmed.startsWith("INSERT") && trimmed.includes("VEHICLEMODEL")) {
      try {
        await pool.request().batch(section);
      } catch (e) {
        if (!e.message.includes("There is already an object named")) {
          console.error("VehicleModel insert error:", e.message.substring(0, 100));
        }
      }
    }
  }
  
  console.log("All done!");
  
  // Verify
  const vt = await pool.request().query("SELECT COUNT(*) as cnt FROM dbo.VehicleType");
  const vm = await pool.request().query("SELECT COUNT(*) as cnt FROM dbo.VehicleMake");
  const tables = await pool.request().query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'VehicleModel'");
  let vmod = { recordset: [{ cnt: 0 }] };
  if (tables.recordset.length > 0) {
    vmod = await pool.request().query("SELECT COUNT(*) as cnt FROM dbo.VehicleModel");
  }
  
  console.log("\nVehicleType:", vt.recordset[0].cnt);
  console.log("VehicleMake:", vm.recordset[0].cnt);
  console.log("VehicleModel:", vmod.recordset[0].cnt);
  
  await pool.close();
}

createTables().catch(console.error);