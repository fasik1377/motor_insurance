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

async function dedupe() {
  const pool = new sql.ConnectionPool(config);
  await pool.connect();
  
  // Delete duplicates, keep first occurrence
  await pool.request().batch(`
    WITH CTE AS (
      SELECT *, ROW_NUMBER() OVER (PARTITION BY Department, Name, Code ORDER BY (SELECT 0)) as rn
      FROM dbo.Cover
    )
    DELETE FROM CTE WHERE rn > 1
  `);
  
  console.log("Duplicates removed");
  
  const result = await pool.request().query("SELECT Department, Name, Code, YngExcess FROM dbo.Cover ORDER BY Department, Name");
  console.log("Total covers:", result.recordset.length);
  
  const motor = await pool.request().query(
    "SELECT Name, Code, YngExcess FROM dbo.Cover WHERE Department = 'MOTOR' AND Name <> 'THIRD PARTY AND FIRE' ORDER BY Name"
  );
  console.log("Motor covers:", motor.recordset);
  
  await pool.close();
}

dedupe().catch(console.error);