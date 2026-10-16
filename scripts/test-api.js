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

async function testAPI() {
  const pool = new sql.ConnectionPool(config);
  await pool.connect();
  
  // Test 1: Get vehicle classes and types
  console.log("=== Test 1: Vehicle Types ===");
  const types = await pool.request().query("SELECT Name, VehicleType FROM dbo.VehicleType WHERE Active = 1 ORDER BY VehicleType, Name");
  console.log(types.recordset);
  
  // Test 2: Get makes for vehicleClass "Commercial Vehicle"
  console.log("\n=== Test 2: Makes for Commercial Vehicle ===");
  const typeNames = await pool.request()
    .input("vehicleClass", "Commercial Vehicle")
    .query("SELECT Name FROM dbo.VehicleType WHERE VehicleType = @vehicleClass AND Active = 1");
  console.log("Type names:", typeNames.recordset);
  
  if (typeNames.recordset.length > 0) {
    const names = typeNames.recordset.map(r => r.Name);
    const placeholders = names.map((_, i) => `@type${i}`).join(",");
    const params = names.reduce((acc, name, i) => ({ ...acc, [`type${i}`]: name }), {});
    const makes = await pool.request()
      .query(`SELECT DISTINCT Name FROM dbo.VehicleMake WHERE VehicleType IN (${placeholders}) ORDER BY Name`, params);
    console.log("Makes:", makes.recordset);
  }
  
  // Test 3: Get makes for vehicleClass "Private Car"
  console.log("\n=== Test 3: Makes for Private Car ===");
  const typeNames2 = await pool.request()
    .input("vehicleClass", "Private Car")
    .query("SELECT Name FROM dbo.VehicleType WHERE VehicleType = @vehicleClass AND Active = 1");
  console.log("Type names:", typeNames2.recordset);
  
  if (typeNames2.recordset.length > 0) {
    const names = typeNames2.recordset.map(r => r.Name);
    const placeholders = names.map((_, i) => `@type${i}`).join(",");
    const params = names.reduce((acc, name, i) => ({ ...acc, [`type${i}`]: name }), {});
    const makes = await pool.request()
      .query(`SELECT DISTINCT Name FROM dbo.VehicleMake WHERE VehicleType IN (${placeholders}) ORDER BY Name`, params);
    console.log("Makes:", makes.recordset);
  }
  
  // Test 4: Get models for a make
  console.log("\n=== Test 4: Models for TOYOTA ===");
  const models = await pool.request()
    .input("make", "TOYOTA")
    .query("SELECT DISTINCT Model FROM dbo.VehicleModel WHERE Make = @make ORDER BY Model");
  console.log("Models:", models.recordset);
  
  await pool.close();
}

testAPI().catch(console.error);