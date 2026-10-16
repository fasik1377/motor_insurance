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
  const result = await pool.request().query("SELECT DISTINCT Make, FuelType FROM MotClassBVehList WHERE Make IN (SELECT DISTINCT Name FROM VehicleMake WHERE VehicleType IN ('GOODS VEHICLE(PRIVATE)', 'PRIVATE BUS', 'TAXI BUS', 'TAXI CAR')) ORDER BY Make, FuelType");
  console.log("Make, FuelType:");
  result.recordset.forEach(r => console.log("  " + r.Make + " -> " + r.FuelType));
  await pool.close();
}

check().catch(console.error);