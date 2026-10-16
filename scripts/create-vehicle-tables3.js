const sql = require("mssql/msnodesqlv8");
const fs = require("fs");
const path = require("path");

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

async function createTables() {
  const sqlPath = path.join(__dirname, "Vehicle TAB Type-Make-Model.sql");
  const buffer = fs.readFileSync(sqlPath);
  let sqlContent = buffer.toString("utf16le");
  
  if (sqlContent.charCodeAt(0) === 0xFEFF) {
    sqlContent = sqlContent.slice(1);
  }
  
  const pool = new sql.ConnectionPool(config);
  await pool.connect();
  
  // First check if tables exist
  const tables = await pool.request().query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME IN ('VehicleType', 'VehicleMake', 'VehicleModel')");
  console.log("Existing tables:", tables.recordset.map(t => t.TABLE_NAME));
  
  // Try to create VehicleType manually
  try {
    await pool.request().batch(`
      CREATE TABLE [dbo].[VehicleType](
        [ID] [int] IDENTITY(1,1) NOT NULL,
        [VehicleType] [varchar](50) NULL,
        [Name] [varchar](500) NOT NULL,
        [PolicyCode] [varchar](50) NULL,
        [CertificateCode] [varchar](50) NULL,
        [YoungDriver] [varchar](50) NULL,
        [PolicyNo] [varchar](50) NULL,
        [Decline] [bit] NULL,
        [Active] [bit] NULL,
        [NICDCodeCom] [varchar](50) NULL,
        [NICDCodeInd] [varchar](50) NULL,
       CONSTRAINT [PK_VehicleType] PRIMARY KEY CLUSTERED 
      (
        [ID] ASC
      )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
      ) ON [PRIMARY]
    `);
    console.log("VehicleType table created");
  } catch (e) {
    console.log("VehicleType table exists:", e.message);
  }
  
  // Create VehicleMake
  try {
    await pool.request().batch(`
      CREATE TABLE [dbo].[VehicleMake](
        [VehicleType] [varchar](500) NOT NULL,
        [Name] [varchar](100) NOT NULL,
        [CompExcess] [smallmoney] NULL,
        [Decline] [bit] NULL,
        [DeclineOnlyComp] [bit] NULL,
       CONSTRAINT [PK_VehicleMake] PRIMARY KEY CLUSTERED 
      (
        [Name] ASC
      )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
      ) ON [PRIMARY]
    `);
    console.log("VehicleMake table created");
  } catch (e) {
    console.log("VehicleMake table exists:", e.message);
  }
  
  // Create VehicleModel
  try {
    await pool.request().batch(`
      CREATE TABLE [dbo].[VehicleModel](
        [Make] [varchar](100) NOT NULL,
        [Model] [varchar](100) NOT NULL,
        [VehicleType] [varchar](500) NULL,
        [CompExcess] [smallmoney] NULL,
        [Decline] [bit] NULL,
        [DeclineOnlyComp] [bit] NULL,
       CONSTRAINT [PK_VehicleModel] PRIMARY KEY CLUSTERED 
      (
        [Make] ASC, [Model] ASC
      )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
      ) ON [PRIMARY]
    `);
    console.log("VehicleModel table created");
  } catch (e) {
    console.log("VehicleModel table exists:", e.message);
  }
  
  // Now insert VehicleType with IDENTITY_INSERT
  await pool.request().batch("SET IDENTITY_INSERT [dbo].[VehicleType] ON");
  
  // Insert a few key VehicleTypes for testing
  const vehicleTypes = [
    [1, 'Private Car', 'PRIVATE CAR', '01', 'MX 1', null, null, 0, 1, 'PCC', 'PCI'],
    [2, 'Private Car', 'PRIVATE CAR (CAR ROD)', '01', 'MX1', null, null, 0, 1, 'PCC', 'PCI'],
    [3, 'Private Car', 'PRIVATE CAR (GOVT)', '01', 'MX 1', null, null, 0, 1, 'PCC', 'PCI'],
    [4, 'Private Car', 'PRIVATE CAR DRIVING SCHOOL', '01', 'MX1', null, null, 0, 1, '0', '0'],
    [5, 'Private Car', 'PRIVATE CAR ELECTRIC', '01', 'MX 1', null, null, 0, 1, 'PCC', 'PCI'],
    [6, 'Commercial Vehicle', 'GOODS VEHICLE(PRIVATE)', '20', 'MZ 300', null, null, 0, 1, 'GVS1C', 'GVS1I'],
    [7, 'Commercial Vehicle', 'GOODS VEHICLE(PUBLIC)', '21', 'MZ 301', null, null, 0, 1, 'GVS3C', 'GVS3I'],
    [8, 'Commercial Vehicle', 'TAXI CAR', '50', 'MZ 405', null, null, 0, 1, 'TCC', 'TCI'],
    [9, 'Commercial Vehicle', 'PRIVATE BUS', '41', 'MZ 600', null, null, 0, 1, 'PBC', 'PBI'],
    [10, 'Commercial Vehicle', 'TAXI BUS', '40', 'MZ 600', null, null, 0, 1, 'TBC', 'TBI'],
    [11, 'Commercial Vehicle', 'TRACTOR', '60', 'MZ 13', null, null, 0, 1, 'TC', 'TI'],
    [12, 'Commercial Vehicle', 'TRAILER', '60', 'MZ 13', null, null, 0, 1, 'STC', 'STC'],
    [13, 'Commercial Vehicle', 'TANKER', '60', 'MZ 13', null, null, 0, 1, '0', '0'],
    [14, 'Two wheelers', 'MOTOR CYCLE (ADL)', '10', 'MY 1/3', null, null, 0, 1, 'PMCC', 'PMCI'],
    [15, 'Two wheelers', 'MOTOR CYCLE (PHO)', '10', 'MY 1', null, null, 0, 1, 'PMCC', 'PMCI'],
    [16, 'Two wheelers', 'ELECTRIC BIKE (ADL)', '10', 'MY 1/3', null, null, 0, 1, 'PMCC', 'PMCI'],
    [17, 'Two wheelers', 'MOTOR CYCLE (CONTRACT)', '10', 'MY 1/3', null, null, 0, 1, 'CMCC', 'CMCI'],
  ];
  
  for (const vt of vehicleTypes) {
    await pool.request().query(`
      INSERT INTO [dbo].[VehicleType] ([ID], [VehicleType], [Name], [PolicyCode], [CertificateCode], [YoungDriver], [PolicyNo], [Decline], [Active], [NICDCodeCom], [NICDCodeInd])
      VALUES (${vt[0]}, '${vt[1]}', '${vt[2]}', '${vt[3]}', '${vt[4]}', ${vt[5] === null ? 'NULL' : `'${vt[5]}'`}, ${vt[6] === null ? 'NULL' : `'${vt[6]}'`}, ${vt[7]}, ${vt[8]}, '${vt[9]}', '${vt[10]}')
    `);
  }
  
  await pool.request().batch("SET IDENTITY_INSERT [dbo].[VehicleType] OFF");
  console.log("VehicleType inserts done");
  
  // Insert some VehicleMakes
  const makes = [
    ['PRIVATE CAR', 'TOYOTA'],
    ['PRIVATE CAR', 'NISSAN'],
    ['PRIVATE CAR', 'HONDA'],
    ['PRIVATE CAR', 'MAZDA'],
    ['PRIVATE CAR', 'MITSUBISHI'],
    ['PRIVATE CAR', 'BMW'],
    ['PRIVATE CAR', 'MERCEDES-BENZ'],
    ['PRIVATE CAR', 'AUDI'],
    ['PRIVATE CAR', 'VOLKSWAGEN'],
    ['PRIVATE CAR', 'HYUNDAI'],
    ['PRIVATE CAR', 'KIA'],
    ['GOODS VEHICLE(PRIVATE)', 'ISUZU'],
    ['GOODS VEHICLE(PRIVATE)', 'MITSUBISHI'],
    ['GOODS VEHICLE(PRIVATE)', 'NISSAN'],
    ['TAXI CAR', 'TOYOTA'],
    ['TAXI CAR', 'NISSAN'],
    ['PRIVATE BUS', 'NISSAN'],
    ['PRIVATE BUS', 'MITSUBISHI'],
    ['TAXI BUS', 'NISSAN'],
    ['TRACTOR', 'MASSEY FERGUSON'],
    ['TRACTOR', 'NEW HOLLAND'],
    ['TRAILER', 'SCHMITZ'],
    ['TANKER', 'MAN'],
    ['MOTOR CYCLE (ADL)', 'HONDA'],
    ['MOTOR CYCLE (ADL)', 'YAMAHA'],
    ['MOTOR CYCLE (ADL)', 'SUZUKI'],
    ['MOTOR CYCLE (PHO)', 'HONDA'],
    ['MOTOR CYCLE (PHO)', 'YAMAHA'],
    ['ELECTRIC BIKE (ADL)', 'NIU'],
    ['ELECTRIC BIKE (ADL)', 'SUPER SOCO'],
  ];
  
  for (const mk of makes) {
    await pool.request().query(`
      INSERT INTO [dbo].[VehicleMake] ([VehicleType], [Name], [CompExcess], [Decline], [DeclineOnlyComp])
      VALUES ('${mk[0]}', '${mk[1]}', NULL, 0, 0)
    `);
  }
  console.log("VehicleMake inserts done");
  
  // Insert some VehicleModels
  const models = [
    ['TOYOTA', 'COROLLA', 'PRIVATE CAR'],
    ['TOYOTA', 'CAMRY', 'PRIVATE CAR'],
    ['TOYOTA', 'RAV4', 'PRIVATE CAR'],
    ['TOYOTA', 'HILUX', 'PRIVATE CAR'],
    ['NISSAN', 'SENTRA', 'PRIVATE CAR'],
    ['NISSAN', 'X-TRAIL', 'PRIVATE CAR'],
    ['NISSAN', 'NAVARA', 'GOODS VEHICLE(PRIVATE)'],
    ['HONDA', 'CIVIC', 'PRIVATE CAR'],
    ['HONDA', 'CR-V', 'PRIVATE CAR'],
    ['MAZDA', 'CX-5', 'PRIVATE CAR'],
    ['MITSUBISHI', 'OUTLANDER', 'PRIVATE CAR'],
    ['MITSUBISHI', 'TRITON', 'GOODS VEHICLE(PRIVATE)'],
    ['BMW', 'X1', 'PRIVATE CAR'],
    ['BMW', '3 SERIES', 'PRIVATE CAR'],
    ['MERCEDES-BENZ', 'C-CLASS', 'PRIVATE CAR'],
    ['AUDI', 'A4', 'PRIVATE CAR'],
    ['VOLKSWAGEN', 'GOLF', 'PRIVATE CAR'],
    ['HYUNDAI', 'TUCSON', 'PRIVATE CAR'],
    ['KIA', 'SPORTAGE', 'PRIVATE CAR'],
    ['ISUZU', 'D-MAX', 'GOODS VEHICLE(PRIVATE)'],
    ['NISSAN', 'CIVILIAN', 'PRIVATE BUS'],
    ['MITSUBISHI', 'ROSA', 'PRIVATE BUS'],
    ['NISSAN', 'CIVILIAN', 'TAXI BUS'],
    ['MASSEY FERGUSON', 'MF 240', 'TRACTOR'],
    ['NEW HOLLAND', 'TT 4.80', 'TRACTOR'],
    ['SCHMITZ', 'SKO 20', 'TRAILER'],
    ['MAN', 'TGS', 'TANKER'],
    ['HONDA', 'CB 150', 'MOTOR CYCLE (ADL)'],
    ['YAMAHA', 'YZF-R15', 'MOTOR CYCLE (ADL)'],
    ['SUZUKI', 'GSX-R150', 'MOTOR CYCLE (ADL)'],
    ['NIU', 'NQI SPORT', 'ELECTRIC BIKE (ADL)'],
    ['SUPER SOCO', 'TC MAX', 'ELECTRIC BIKE (ADL)'],
  ];
  
  for (const md of models) {
    await pool.request().query(`
      INSERT INTO [dbo].[VehicleModel] ([Make], [Model], [VehicleType], [CompExcess], [Decline], [DeclineOnlyComp])
      VALUES ('${md[0]}', '${md[1]}', '${md[2]}', NULL, 0, 0)
    `);
  }
  console.log("VehicleModel inserts done");
  
  // Verify
  const vt = await pool.request().query("SELECT COUNT(*) as cnt FROM dbo.VehicleType");
  const vm = await pool.request().query("SELECT COUNT(*) as cnt FROM dbo.VehicleMake");
  const vmod = await pool.request().query("SELECT COUNT(*) as cnt FROM dbo.VehicleModel");
  
  console.log("\nVehicleType:", vt.recordset[0].cnt);
  console.log("VehicleMake:", vm.recordset[0].cnt);
  console.log("VehicleModel:", vmod.recordset[0].cnt);
  
  await pool.close();
}

createTables().catch(console.error);