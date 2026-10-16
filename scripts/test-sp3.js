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

async function testVehicleType(vClass, vAge, cc, seating, sumInsured, mgw) {
  const pool = new sql.ConnectionPool(config);
  await pool.connect();
  
  const spRequest = pool.request()
    .input("StrCountry", sql.NVarChar(50), "MAURITIUS")
    .input("IssDate", sql.Date, "2026-10-05")
    .input("BlnCompCover", sql.Bit, 1)
    .input("Vstatus", sql.NVarChar(20), "NEW")
    .input("VClass", sql.NVarChar(100), vClass)
    .input("Type", sql.NVarChar(50), "")
    .input("VAge", sql.Decimal(10, 2), vAge)
    .input("TotSeat", sql.Int, seating)
    .input("CC", sql.Decimal(18, 2), cc)
    .input("Feet", sql.Int, 0)
    .input("Excess", sql.Decimal(18, 2), 0)
    .input("Sum", sql.Decimal(18, 2), sumInsured)
    .input("MGW", sql.Decimal(18, 2), mgw)
    .input("IsPrivateCar", sql.Bit, vClass.includes("PRIVATE CAR") ? 1 : 0)
    .output("Success", sql.Bit)
    .output("ErrorMsg", sql.NVarChar(500));

  const result = await spRequest.execute("usp_GetPremiumRateMotor");
  
  console.log(`\n=== ${vClass} (Age:${vAge}, CC:${cc}, MGW:${mgw}) ===`);
  console.log("Success:", result.output.Success);
  console.log("ErrorMsg:", result.output.ErrorMsg);
  if (result.recordset && result.recordset.length > 0) {
    console.log("Rate:", result.recordset[0].Rate, "BasicAmt:", result.recordset[0].BasicAmt);
  }
  
  await pool.close();
}

async function run() {
  // GOODS VEHICLE needs MGW > 0
  await testVehicleType("GOODS VEHICLE(PRIVATE)", 5, 3000, 2, 1000000, 5000);
  await testVehicleType("GOODS VEHICLE(PUBLIC)", 5, 3000, 2, 1000000, 5000);
  await testVehicleType("CONTRACT CAR", 5, 2000, 8, 500000, 0);
  await testVehicleType("TAXI CAR", 5, 1500, 5, 500000, 0);
  await testVehicleType("PRIVATE BUS", 5, 3000, 30, 2000000, 0);
  await testVehicleType("MOTOR CYCLE (ADL)", 3, 150, 2, 100000, 0);
  await testVehicleType("DUAL PURPOSE(INDIVIDUAL)", 5, 2000, 7, 800000, 0);
}

run().catch(console.error);