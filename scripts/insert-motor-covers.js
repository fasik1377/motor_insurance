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

const motorCovers = [
  { Department: 'MOTOR', Name: 'COMPREHENSIVE', CycloneLimit: 0, Code: 1, YngExcess: 1, AllowAgent: null },
  { Department: 'MOTOR', Name: 'COMPREHENSIVE AUTOPLUS', CycloneLimit: 0, Code: 10, YngExcess: 1, AllowAgent: null },
  { Department: 'MOTOR', Name: 'THIRD PARTY AND FIRE', CycloneLimit: 0, Code: 22, YngExcess: 1, AllowAgent: null },
  { Department: 'MOTOR', Name: 'THIRD PARTY ONLY', CycloneLimit: 0, Code: 21, YngExcess: 0, AllowAgent: null },
];

async function insertCovers() {
  const pool = new sql.ConnectionPool(config);
  await pool.connect();
  
  for (const cover of motorCovers) {
    const result = await pool.request()
      .input("Department", sql.NVarChar, cover.Department)
      .input("Name", sql.NVarChar, cover.Name)
      .input("CycloneLimit", sql.Bit, cover.CycloneLimit)
      .input("Code", sql.Int, cover.Code)
      .input("YngExcess", sql.Bit, cover.YngExcess)
      .input("AllowAgent", sql.Bit, cover.AllowAgent)
      .query("INSERT INTO dbo.Cover (Department, Name, CycloneLimit, Code, YngExcess, AllowAgent) VALUES (@Department, @Name, @CycloneLimit, @Code, @YngExcess, @AllowAgent)");
    console.log(`Inserted: ${cover.Name}`);
  }
  
  const result = await pool.request().query("SELECT Name, Code, YngExcess FROM dbo.Cover WHERE Department = 'MOTOR' ORDER BY Name");
  console.log("Motor covers:", result.recordset);
  
  await pool.close();
}

insertCovers().catch(console.error);