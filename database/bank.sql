USE [NiaData]
GO
/****** Object:  Table [dbo].[Bank]    Script Date: 17/09/2026 22:00:06 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Bank](
	[Code] [varchar](20) NOT NULL,
	[Title] [varchar](10) NULL,
	[Name] [varchar](100) NULL,
	[Classification] [varchar](15) NULL,
	[Address] [varchar](300) NULL,
	[City] [varchar](50) NULL,
	[teloff] [varchar](15) NULL,
	[Tel2] [varchar](15) NULL,
	[Tel3] [varchar](15) NULL,
	[FAX] [varchar](50) NULL,
	[Contact] [varchar](50) NULL,
	[Remarks] [varchar](100) NULL,
	[AccNo] [varchar](20) NULL,
	[Active] [bit] NULL,
	[MailAddress] [varchar](50) NULL,
	[Email] [varchar](50) NULL,
	[BRN] [varchar](50) NULL,
	[VAT] [varchar](50) NULL,
	[TAN] [varchar](50) NULL,
	[BankName] [varchar](50) NULL,
	[BankAddress] [varchar](100) NULL,
	[AccountName] [varchar](100) NULL,
	[AccountNo] [varchar](50) NULL,
	[AccountType] [varchar](50) NULL
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[Bank] ADD  CONSTRAINT [DF_Bank_Active]  DEFAULT (1) FOR [Active]
GO