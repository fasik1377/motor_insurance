const sql = require("mssql/msnodesqlv8");
const fs = require("fs");
const path = require("path");

async function createCoverTable() {
  const config = {
    driver: "ODBC Driver 18 for SQL Server",
    server: process.env.DB_SERVER || "localhost",
    port: parseInt(process.env.DB_PORT || "1433"),
    database: process.env.DB_DATABASE || process.env.DB_NAME || "NiaData",
    options: {
      trustedConnection: true,
      encrypt: false,
      trustServerCertificate: true,
    },
  };

  try {
    const sqlPath = path.join(__dirname, "cover.sql");
    // Read as buffer and handle UTF-16 with BOM
    const buffer = fs.readFileSync(sqlPath);
    let sqlContent = buffer.toString("utf16le");
    
    // Remove BOM if present
    if (sqlContent.charCodeAt(0) === 0xFEFF) {
      sqlContent = sqlContent.slice(1);
    }
    
    // Remove GO statements and USE statement
    sqlContent = sqlContent
      .split(/\n/)
      .filter(line => !line.trim().toUpperCase().startsWith("GO") && !line.trim().toUpperCase().startsWith("USE "))
      .join("\n");
    
    const pool = new sql.ConnectionPool(config);
    await pool.connect();
    console.log("Connected to database");
    
    // Execute the entire script as a single batch
    console.log("Executing full script...");
    await pool.request().batch(sqlContent);
    
    console.log("Cover table created and data inserted successfully!");
    await pool.close();
  } catch (error) {
    console.error("Error creating Cover table:", error);
  }
}

createCoverTable();