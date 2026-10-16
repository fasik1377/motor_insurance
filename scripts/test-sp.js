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
  
  // Test with typical values for PRIVATE CAR
  const spRequest = pool.request()
    .input("StrCountry", sql.NVarChar(50), "MAURITIUS")
    .input("IssDate", sql.Date, "2026-10-05")
    .input("BlnCompCover", sql.Bit, 1)  // Comprehensive
    .input("Vstatus", sql.NVarChar(20), "NEW")
    .input("VClass", sql.NVarChar(100), "PRIVATE CAR")
    .input("Type", sql.NVarChar(50), "")
    .input("VAge", sql.Decimal(10, 2), 5)  // 5 years old
    .input("TotSeat", sql.Int, 5)
    .input("CC", sql.Decimal(18, 2), 1500)  // 1500cc
    .input("Feet", sql.Int, 0)
    .input("Excess", sql.Decimal(18, 2), 0)
    .input("Sum", sql.Decimal(18, 2), 500000)  // Sum insured 500k
    .input("MGW", sql.Decimal(18, 2), 0)
    .input("IsPrivateCar", sql.Bit, 1)
    .output("Success", sql.Bit)
    .output("ErrorMsg", sql.NVarChar(500));

  const result = await spRequest.execute("usp_GetPremiumRateMotor");
  
  console.log("Success:", result.output.Success);
  console.log("ErrorMsg:", result.output.ErrorMsg);
  console.log("Recordset:", result.recordset);
  
  await pool.close();
}

test().catch(console.error);