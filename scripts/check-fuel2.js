const sql = require("mssql/msnodesqlv8");

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

async function check() {
  const pool = new sql.ConnectionPool(config);
  await pool.connect();
  
  // Check all tables
  const tables = await pool.request().query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME LIKE '%Vehicle%' OR TABLE_NAME LIKE '%Fuel%'");
  console.log("Vehicle/Fuel tables:", tables.recordset.map(r => r.TABLE_NAME).join(', '));
  
  // Check if there's a FuelType column anywhere
  const cols = await pool.request().query("SELECT TABLE_NAME, COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE COLUMN_NAME LIKE '%Fuel%' OR COLUMN_NAME LIKE '%fuel%'");
  console.log("\nFuel columns:");
  cols.recordset.forEach(r => console.log(`  ${r.TABLE_NAME}.${r.COLUMN_NAME}`));
  
  await pool.close();
}

check().catch(console.error);