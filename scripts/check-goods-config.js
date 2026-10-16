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
  
  const configResult = await pool.request().query("SELECT * FROM MotTariffConfigMast WHERE VehicleType = 'GOODS VEHICLE(PRIVATE)'");
  console.log("Config for GOODS VEHICLE(PRIVATE):", configResult.recordset);
  
  const rateResult = await pool.request().query("SELECT DISTINCT SubType, MIN(EffFrom) as MinEffFrom, MAX(EffTo) as MaxEffTo FROM MotTariffMast WHERE SubType = 'GOODS VEHICLE(PRIVATE)' GROUP BY SubType");
  console.log("Rates for GOODS VEHICLE(PRIVATE):", rateResult.recordset);
  
  // Check rates for current date
  const rateResult2 = await pool.request().query("SELECT * FROM MotTariffMast WHERE SubType = 'GOODS VEHICLE(PRIVATE)' AND '2026-10-05' BETWEEN EffFrom AND EffTo");
  console.log("Rates for GOODS VEHICLE(PRIVATE) Oct 2026:", rateResult2.recordset.length);
  rateResult2.recordset.forEach(r => console.log("  SumIns:", r.SumInsFrom, "-", r.SumInsTo, "CC:", r.CCfrom, "-", r.CCTo));
  
  await pool.close();
}

check().catch(console.error);