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
  
  // Check if table exists
  const tables = await pool.request().query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'AccMast'");
  console.log("Table exists:", tables.recordset.length > 0);
  
  if (tables.recordset.length > 0) {
    const result = await pool.request().query("SELECT Name, Rate FROM dbo.AccMast WHERE Rate > 0 ORDER BY Name");
    console.log("Accessories:", result.recordset);
  }
  
  await pool.close();
}

check().catch(console.error);