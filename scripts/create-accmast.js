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

async function createAccMastTable() {
  const sqlContent = `
USE [NiaData]
GO

/****** Object:  Table [dbo].[AccMast]    Script Date: 10/09/2026 17:02:51 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[AccMast](
	[Name] [varchar](50) NOT NULL,
	[Electrical] [bit] NOT NULL,
	[Decline] [bit] NULL,
	[Rate] [smallmoney] NULL,
	[EffDate] [datetime] NULL,
	[Expdate] [datetime] NULL,
	[Status] [char](1) NULL,
	[Idate] [datetime] NULL,
	[Iuser] [varchar](50) NULL,
	[Udate] [datetime] NULL,
	[Uuser] [varchar](50) NULL,
 CONSTRAINT [PK_AccMast] PRIMARY KEY CLUSTERED 
(
	[Name] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
INSERT [dbo].[AccMast] ([Name], [Electrical], [Decline], [Rate], [EffDate], [Expdate], [Status], [Idate], [Iuser], [Udate], [Uuser]) VALUES (N'Air Conditioner', 0, 0, 4.0000, CAST(N'2010-09-20T00:00:00.000' AS DateTime), CAST(N'2030-09-20T00:00:00.000' AS DateTime), N'O', NULL, NULL, NULL, N'AirConditioner')
GO
INSERT [dbo].[AccMast] ([Name], [Electrical], [Decline], [Rate], [EffDate], [Expdate], [Status], [Idate], [Iuser], [Udate], [Uuser]) VALUES (N'Alarm Central Locking System', 0, 0, 4.0000, NULL, NULL, NULL, CAST(N'2013-08-29T12:25:19.000' AS DateTime), N'Marie Desiree MarieJosee', NULL, N'AlarmCentralLockingSystem')
GO
INSERT [dbo].[AccMast] ([Name], [Electrical], [Decline], [Rate], [EffDate], [Expdate], [Status], [Idate], [Iuser], [Udate], [Uuser]) VALUES (N'Alloy Wheels', 0, 0, 4.0000, CAST(N'2010-09-20T00:00:00.000' AS DateTime), CAST(N'2030-09-20T00:00:00.000' AS DateTime), N'O', NULL, NULL, NULL, N'AlloyWheels')
GO
INSERT [dbo].[AccMast] ([Name], [Electrical], [Decline], [Rate], [EffDate], [Expdate], [Status], [Idate], [Iuser], [Udate], [Uuser]) VALUES (N'AM/FM Radio', 0, 0, 4.0000, CAST(N'2010-09-20T00:00:00.000' AS DateTime), CAST(N'2030-09-20T00:00:00.000' AS DateTime), N'O', NULL, NULL, NULL, N'AMFMRadio')
GO
INSERT [dbo].[AccMast] ([Name], [Electrical], [Decline], [Rate], [EffDate], [Expdate], [Status], [Idate], [Iuser], [Udate], [Uuser]) VALUES (N'Amplifier', 0, 0, 4.0000, NULL, NULL, NULL, CAST(N'2013-08-29T12:25:04.000' AS DateTime), N'Marie Desiree MarieJosee', NULL, N'Amplifier')
GO
INSERT [dbo].[AccMast] ([Name], [Electrical], [Decline], [Rate], [EffDate], [Expdate], [Status], [Idate], [Iuser], [Udate], [Uuser]) VALUES (N'Anti rain layer', 0, 0, 4.0000, NULL, NULL, NULL, CAST(N'2022-12-06T17:03:42.000' AS DateTime), N'Administrator', NULL, NULL)
GO
INSERT [dbo].[AccMast] ([Name], [Electrical], [Decline], [Rate], [EffDate], [Expdate], [Status], [Idate], [Iuser], [Udate], [Uuser]) VALUES (N'ARTDESHINE GRAPHENE COATING ', 0, 0, 4.0000, NULL, NULL, NULL, CAST(N'2025-06-11T11:26:26.000' AS DateTime), N'MarieSU', NULL, NULL)
GO
INSERT [dbo].[AccMast] ([Name], [Electrical], [Decline], [Rate], [EffDate], [Expdate], [Status], [Idate], [Iuser], [Udate], [Uuser]) VALUES (N'ARTDESHINE WINDOW COATING', 0, 0, 4.0000, NULL, NULL, NULL, CAST(N'2025-06-11T11:28:38.000' AS DateTime), N'MarieSU', NULL, NULL)
GO
INSERT [dbo].[AccMast] ([Name], [Electrical], [Decline], [Rate], [EffDate], [Expdate], [Status], [Idate], [Iuser], [Udate], [Uuser]) VALUES (N'Automatic Mirror', 0, 0, 4.0000, NULL, NULL, NULL, CAST(N'2025-05-22T13:15:06.000' AS DateTime), N'MarieSU', NULL, NULL)
GO
INSERT [dbo].[AccMast] ([Name], [Electrical], [Decline], [Rate], [EffDate], [Expdate], [Status], [Idate], [Iuser], [Udate], [Uuser]) VALUES (N'Back Sensor', 0, 0, 4.0000, NULL, NULL, NULL, CAST(N'2015-04-30T14:58:09.000' AS DateTime), N'MarieSU', NULL, N'BackSensor')
GO
INSERT [dbo].[AccMast] ([Name], [Electrical], [Decline], [Rate], [EffDate], [Expdate], [Status], [Idate], [Iuser], [Udate], [Uuser]) VALUES (N'Body Kit', 0, 0, 4.0000, NULL, NULL, NULL, CAST(N'2012-04-05T13:53:19.000' AS DateTime), N'Administrator', NULL, N'BodyKit')
GO
  `;
  
  // Remove GO statements
  const statements = sqlContent
    .split("GO")
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.toUpperCase().startsWith("USE "));
  
  console.log("Executing", statements.length, "statements...");
  
  const pool = new sql.ConnectionPool(config);
  await pool.connect();
  
  for (const stmt of statements) {
    try {
      await pool.request().batch(stmt);
    } catch (e) {
      console.error("Error:", e.message);
      console.error("Statement:", stmt.substring(0, 100));
    }
  }
  
  console.log("AccMast table created and data inserted!");
  
  // Verify
  const result = await pool.request().query("SELECT Name, Rate FROM dbo.AccMast ORDER BY Name");
  console.log("Accessories:", result.recordset.length, "rows");
  console.log(result.recordset);
  
  await pool.close();
}

createAccMastTable().catch(console.error);