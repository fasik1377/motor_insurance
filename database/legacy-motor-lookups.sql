/*
  Compatibility objects required by /api/motor/new-business.
  Run this in the insurer database only after confirming the database name.
  Existing tables are never modified.
*/

IF OBJECT_ID(N'dbo.Department', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Department (
        Code varchar(20) NOT NULL CONSTRAINT PK_Department PRIMARY KEY,
        Name varchar(100) NOT NULL CONSTRAINT UQ_Department_Name UNIQUE
    );
END;
GO

IF OBJECT_ID(N'dbo.[System]', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.[System] (
        Branch varchar(50) NULL
    );
END;
GO

IF OBJECT_ID(N'dbo.VehicleType', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.VehicleType (
        Name varchar(100) NOT NULL CONSTRAINT PK_VehicleType PRIMARY KEY,
        PolicyCode int NULL
    );
END;
GO

/* Seed values only when the compatibility tables are empty. Replace these
   values with the insurer's official codes if they differ. */
IF NOT EXISTS (SELECT 1 FROM dbo.Department)
    INSERT dbo.Department (Code, Name) VALUES ('1', 'MOTOR'), ('2', 'MOTOR TP');
GO

IF NOT EXISTS (SELECT 1 FROM dbo.[System])
    INSERT dbo.[System] (Branch) VALUES ('WEB');
GO

IF OBJECT_ID(N'dbo.GetLatestPolicyCode', N'FN') IS NULL
    PRINT 'GetLatestPolicyCode is still missing; the application fallback will be used.';
GO
