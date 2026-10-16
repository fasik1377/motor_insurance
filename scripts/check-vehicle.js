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
  
  const vt = await pool.request().query("SELECT COUNT(*) as cnt FROM dbo.VehicleType");
  const vm = await pool.request().query("SELECT COUNT(*) as cnt FROM dbo.VehicleMake");
  
  // Check if VehicleModel exists
  const tables = await pool.request().query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'VehicleModel'");
  const vmExists = tables.recordset.length > 0;
  let vmod = { recordset: [{ cnt: 0 }] };
  if (vmExists) {
    vmod = await pool.request().query("SELECT COUNT(*) as cnt FROM dbo.VehicleModel");
  }
  
  console.log("VehicleType:", vt.recordset[0].cnt);
  console.log("VehicleMake:", vm.recordset[0].cnt);
  console.log("VehicleModel exists:", vmExists, "count:", vmod.recordset[0].cnt);
  
  // Show some VehicleTypes
  const types = await pool.request().query("SELECT ID, Name, VehicleType FROM dbo.VehicleType WHERE Active = 1 ORDER BY Name");
  console.log("\nActive VehicleTypes:");
  types.recordset.forEach(t => console.log(`  ${t.ID}: ${t.Name} (${t.VehicleType})`));
  
  await pool.close();
}

check().catch(console.error);