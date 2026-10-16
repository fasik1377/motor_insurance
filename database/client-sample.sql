USE [NiaData];
GO

-- Run client.sql first. This repeatable sample adds one record for testing /buy-online.
IF OBJECT_ID(N'dbo.Client', N'U') IS NULL
    THROW 50001, 'dbo.Client does not exist. Run client.sql first.', 1;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.Client WHERE Code = 'WEB-DEMO-001')
BEGIN
    INSERT dbo.Client (Code, Category, Title, Name, Surname, Mobile, EMail, Idate, Iuser)
    VALUES ('WEB-DEMO-001', 'Individual', 'Ms', 'Amina', 'Demo', '0500000000',
            'amina.demo@example.com', GETDATE(), 'client-sample.sql');
END;
GO

SELECT Code, Category, Title, Name, Surname, Mobile, EMail
FROM dbo.Client
WHERE Code = 'WEB-DEMO-001';
GO
