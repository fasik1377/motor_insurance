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
  
  // Check for PRIVATE CAR rates covering October 2026
  const result = await pool.request()
    .input("issueDate", "2026-10-05")
    .query(`
      SELECT * FROM MotTariffMast 
      WHERE SubType = 'PRIVATE CAR' 
      AND '2026-10-05' BETWEEN EffFrom AND EffTo
      AND Country = 'MAURITIUS'
    `);
  
  console.log("PRIVATE CAR rates for Oct 2026:", result.recordset.length);
  result.recordset.forEach(r => console.log(" ", r));
  
  await pool.close();
}

check().catch(console.error);