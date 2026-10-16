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

async function testAPIFixed() {
  const pool = new sql.ConnectionPool(config);
  await pool.connect();
  
  // Test: Get makes for vehicleClass "Commercial Vehicle" using the fixed approach
  console.log("=== Test: Makes for Commercial Vehicle (Fixed Approach) ===");
  const typeNamesResult = await pool.request()
    .input("vehicleClass", "Commercial Vehicle")
    .query("SELECT Name FROM dbo.VehicleType WHERE VehicleType = @vehicleClass AND Active = 1");
  const typeNames = typeNamesResult.recordset.map(r => r.Name);
  console.log("Type names:", typeNames);
  
  if (typeNames.length > 0) {
    // Build query with individual inputs - FIXED APPROACH
    const request = pool.request();
    typeNames.forEach((name, i) => {
      request.input(`type${i}`, sql.NVarChar, name);
    });
    const placeholders = typeNames.map((_, i) => `@type${i}`).join(",");
    const makesResult = await request.query(
      `SELECT DISTINCT Name FROM dbo.VehicleMake WHERE VehicleType IN (${placeholders}) ORDER BY Name`
    );
    console.log("Makes:", makesResult.recordset);
  }
  
  // Test: Get models for TOYOTA
  console.log("\n=== Test: Models for TOYOTA ===");
  const modelsResult = await pool.request()
    .input("make", "TOYOTA")
    .query("SELECT DISTINCT Model FROM dbo.VehicleModel WHERE Make = @make ORDER BY Model");
  console.log("Models:", modelsResult.recordset);
  
  await pool.close();
}

testAPIFixed().catch(console.error);