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
  const cols = await pool.request().query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'MotClassBVehList'");
  console.log("MotClassBVehList columns:");
  cols.recordset.forEach(r => console.log("  " + r.COLUMN_NAME));
  
  const sample = await pool.request()
    .input("Make", "TOYOTA")
    .input("Model", "COROLLA")
    .query("SELECT TOP 5 * FROM MotClassBVehList WHERE UPPER(Make) = UPPER(@Make) AND UPPER(Model) = UPPER(@Model)");
  console.log("\nSample data for TOYOTA COROLLA:");
  sample.recordset.forEach(r => console.log("  ", r));
  await pool.close();
}

check().catch(console.error);