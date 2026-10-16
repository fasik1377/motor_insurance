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
  const result = await pool.request().query("SELECT DISTINCT VehicleType FROM dbo.VehicleMake ORDER BY VehicleType");
  console.log("Distinct VehicleTypes in VehicleMake:");
  result.recordset.forEach(r => console.log("  " + r.VehicleType));
  await pool.close();
}

check().catch(console.error);