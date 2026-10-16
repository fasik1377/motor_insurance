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

async function verify() {
  const pool = new sql.ConnectionPool(config);
  await pool.connect();
  const result = await pool.request().query("SELECT Name, Code, YngExcess FROM dbo.Cover WHERE Department = 'MOTOR' ORDER BY Name");
  console.log(result.recordset);
  await pool.close();
}

verify().catch(console.error);