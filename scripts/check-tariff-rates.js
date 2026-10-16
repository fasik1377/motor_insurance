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
  const result = await pool.request().query("SELECT DISTINCT SubType, MIN(EffFrom) as MinEffFrom, MAX(EffTo) as MaxEffTo FROM MotTariffMast GROUP BY SubType");
  console.log("Rates by vehicle type:");
  result.recordset.forEach(r => console.log(" ", r));
  await pool.close();
}

check().catch(console.error);