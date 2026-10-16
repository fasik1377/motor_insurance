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
  const vmod = await pool.request().query("SELECT COUNT(*) as cnt FROM dbo.VehicleModel");
  
  console.log("VehicleType:", vt.recordset[0].cnt);
  console.log("VehicleMake:", vm.recordset[0].cnt);
  console.log("VehicleModel:", vmod.recordset[0].cnt);
  
  const types = await pool.request().query("SELECT ID, Name, VehicleType FROM dbo.VehicleType WHERE Active = 1 ORDER BY VehicleType, Name");
  console.log("\nVehicleTypes:");
  types.recordset.forEach(t => console.log(`  ${t.ID}: ${t.Name} (${t.VehicleType})`));
  
  const makes = await pool.request().query("SELECT DISTINCT Name, VehicleType FROM dbo.VehicleMake ORDER BY VehicleType, Name");
  console.log("\nVehicleMakes:");
  makes.recordset.forEach(m => console.log(`  ${m.Name} (${m.VehicleType})`));
  
  const models = await pool.request().query("SELECT Make, Model, VehicleType FROM dbo.VehicleModel ORDER BY Make, Model");
  console.log("\nVehicleModels (first 20):");
  models.recordset.slice(0, 20).forEach(m => console.log(`  ${m.Make} - ${m.Model} (${m.VehicleType})`));
  
  await pool.close();
}

check().catch(console.error);