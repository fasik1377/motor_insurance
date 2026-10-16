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
  
  // Get all configs
  const configs = await pool.request().query("SELECT VehicleType, Parameter1, Parameter2, Parameter3, Parameter4 FROM MotTariffConfigMast ORDER BY VehicleType");
  console.log("All configs:");
  configs.recordset.forEach(c => console.log(" ", c.VehicleType, "- P1:", c.Parameter1, "P2:", c.Parameter2, "P3:", c.Parameter3, "P4:", c.Parameter4));
  
  // Get all rate subtypes
  const rates = await pool.request().query("SELECT DISTINCT SubType FROM MotTariffMast WHERE '2026-10-05' BETWEEN EffFrom AND EffTo ORDER BY SubType");
  console.log("\nRate subtypes for Oct 2026:");
  rates.recordset.forEach(r => console.log(" ", r.SubType));
  
  await pool.close();
}

check().catch(console.error);