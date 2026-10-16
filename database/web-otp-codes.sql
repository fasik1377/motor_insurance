USE [NiaData];
GO
CREATE TABLE [dbo].[WebOtpCodes] (
    OtpId uniqueidentifier NOT NULL CONSTRAINT PK_WebOtpCodes PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    Contact nvarchar(254) NOT NULL,
    ContactType varchar(10) NOT NULL,
    CodeHash char(64) NOT NULL,
    ExpiresAt datetime2(0) NOT NULL,
    AttemptCount tinyint NOT NULL CONSTRAINT DF_WebOtpCodes_AttemptCount DEFAULT 0,
    UsedAt datetime2(0) NULL,
    CreatedAt datetime2(0) NOT NULL CONSTRAINT DF_WebOtpCodes_CreatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_WebOtpCodes_Type CHECK (ContactType IN ('email', 'mobile'))
);
CREATE INDEX IX_WebOtpCodes_Lookup ON dbo.WebOtpCodes(Contact, ContactType, CreatedAt DESC);
GO
