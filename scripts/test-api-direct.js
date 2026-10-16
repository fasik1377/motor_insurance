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

async function test() {
  const pool = new sql.ConnectionPool(config);
  await pool.connect();
  
  const result = await pool.request().query(
    "SELECT Name, Code, YngExcess FROM dbo.Cover WHERE Department = 'MOTOR' AND Name <> 'THIRD PARTY AND FIRE' ORDER BY Name"
  );
  
  console.log("Result:", result.recordset);
  await pool.close();
}

test().catch(console.error);