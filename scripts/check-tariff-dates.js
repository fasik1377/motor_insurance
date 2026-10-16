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
  const result = await pool.request().query("SELECT MIN(EffFrom) as MinEffFrom, MAX(EffTo) as MaxEffTo FROM MotTariffMast");
  console.log("Tariff date range:", result.recordset[0]);
  
  // Also check config mast
  const configResult = await pool.request().query("SELECT VehicleType, EffFrom, EffTo FROM MotTariffConfigMast");
  console.log("Config mast:", configResult.recordset);
  
  await pool.close();
}

check().catch(console.error);