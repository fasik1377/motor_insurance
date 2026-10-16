USE [NiaData];
GO
IF OBJECT_ID(N'dbo.WebUsers', N'U') IS NULL
BEGIN
 CREATE TABLE [dbo].[WebUsers] (UserId uniqueidentifier NOT NULL CONSTRAINT PK_WebUsers PRIMARY KEY DEFAULT NEWSEQUENTIALID(), Email nvarchar(254) NULL, Mobile nvarchar(30) NULL, EmailVerified bit NOT NULL DEFAULT 0, MobileVerified bit NOT NULL DEFAULT 0, CreatedAt datetime2(0) NOT NULL DEFAULT SYSUTCDATETIME(), UpdatedAt datetime2(0) NOT NULL DEFAULT SYSUTCDATETIME(), CONSTRAINT CK_WebUsers_Contact CHECK (Email IS NOT NULL OR Mobile IS NOT NULL));
 CREATE UNIQUE INDEX UX_WebUsers_Email ON dbo.WebUsers(Email) WHERE Email IS NOT NULL;
 CREATE UNIQUE INDEX UX_WebUsers_Mobile ON dbo.WebUsers(Mobile) WHERE Mobile IS NOT NULL;
END;
GO
IF OBJECT_ID(N'dbo.WebUserProfiles', N'U') IS NULL
BEGIN
 CREATE TABLE [dbo].[WebUserProfiles] (UserId uniqueidentifier NOT NULL CONSTRAINT PK_WebUserProfiles PRIMARY KEY, Title nvarchar(10) NOT NULL, FirstName nvarchar(100) NOT NULL, Surname nvarchar(100) NOT NULL, Gender nvarchar(20) NOT NULL, DateOfBirth date NOT NULL, CreatedAt datetime2(0) NOT NULL DEFAULT SYSUTCDATETIME(), UpdatedAt datetime2(0) NOT NULL DEFAULT SYSUTCDATETIME(), CONSTRAINT FK_WebUserProfiles_WebUsers FOREIGN KEY (UserId) REFERENCES dbo.WebUsers(UserId), CONSTRAINT CK_WebUserProfiles_Gender CHECK (Gender IN (N'Male',N'Female',N'Other')));
END;
GO
IF OBJECT_ID(N'dbo.WebUserSessions', N'U') IS NULL
BEGIN
 CREATE TABLE [dbo].[WebUserSessions] (SessionId uniqueidentifier NOT NULL CONSTRAINT PK_WebUserSessions PRIMARY KEY DEFAULT NEWSEQUENTIALID(), UserId uniqueidentifier NOT NULL, TokenHash char(64) NOT NULL, ExpiresAt datetime2(0) NOT NULL, CreatedAt datetime2(0) NOT NULL DEFAULT SYSUTCDATETIME(), CONSTRAINT FK_WebUserSessions_WebUsers FOREIGN KEY (UserId) REFERENCES dbo.WebUsers(UserId) ON DELETE CASCADE);
 CREATE UNIQUE INDEX UX_WebUserSessions_TokenHash ON dbo.WebUserSessions(TokenHash);
END;
GO
