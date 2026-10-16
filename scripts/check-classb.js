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
  const result = await pool.request()
    .input("Make", "TOYOTA")
    .input("Model", "COROLLA")
    .input("FuelType", "Petrol")
    .query(`
      SELECT TOP 1 ExcessComp, ExcessYoung
      FROM MotClassBVehList
      WHERE UPPER(Make) = UPPER(@Make)
        AND UPPER(Model) = UPPER(@Model)
        AND FuelType = @FuelType
        AND Status = 'O'
      ORDER BY EffDate DESC
    `);
  console.log("MotClassBVehList for TOYOTA COROLLA Petrol:");
  console.log(result.recordset);
  await pool.close();
}

check().catch(console.error);