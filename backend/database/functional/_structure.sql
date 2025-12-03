/**
 * @schema functional
 * Business entity schema for CrediTudo application
 */
CREATE SCHEMA [functional];
GO

/**
 * @table client Client registration and personal information
 * @multitenancy false
 * @softDelete false
 * @alias cli
 */
CREATE TABLE [functional].[client] (
  [idClient] INTEGER IDENTITY(1, 1) NOT NULL,
  [fullName] NVARCHAR(100) NOT NULL,
  [cpf] VARCHAR(11) NOT NULL,
  [email] NVARCHAR(100) NOT NULL,
  [phone] VARCHAR(11) NOT NULL,
  [birthDate] DATE NOT NULL,
  [passwordHash] VARCHAR(255) NOT NULL,
  [status] INTEGER NOT NULL,
  [profile] INTEGER NOT NULL,
  [emailVerified] BIT NOT NULL,
  [termsVersion] VARCHAR(20) NOT NULL,
  [registrationDate] DATETIME2 NOT NULL,
  [registrationIp] VARCHAR(45) NOT NULL
);
GO

/**
 * @table address Client address information
 * @multitenancy false
 * @softDelete false
 * @alias adr
 */
CREATE TABLE [functional].[address] (
  [idAddress] INTEGER IDENTITY(1, 1) NOT NULL,
  [idClient] INTEGER NOT NULL,
  [zipCode] VARCHAR(8) NOT NULL,
  [street] NVARCHAR(100) NOT NULL,
  [number] VARCHAR(10) NOT NULL,
  [complement] NVARCHAR(50) NULL,
  [neighborhood] NVARCHAR(50) NOT NULL,
  [city] NVARCHAR(50) NOT NULL,
  [state] VARCHAR(2) NOT NULL
);
GO

/**
 * @table emailVerification Email verification tokens
 * @multitenancy false
 * @softDelete false
 * @alias emlVer
 */
CREATE TABLE [functional].[emailVerification] (
  [idVerification] INTEGER IDENTITY(1, 1) NOT NULL,
  [idClient] INTEGER NOT NULL,
  [token] VARCHAR(255) NOT NULL,
  [generatedDate] DATETIME2 NOT NULL,
  [expirationDate] DATETIME2 NOT NULL,
  [used] BIT NOT NULL
);
GO

/**
 * @table registrationAttempt Registration attempt tracking by IP
 * @multitenancy false
 * @softDelete false
 * @alias regAtt
 */
CREATE TABLE [functional].[registrationAttempt] (
  [idAttempt] INTEGER IDENTITY(1, 1) NOT NULL,
  [ipAddress] VARCHAR(45) NOT NULL,
  [attemptCount] INTEGER NOT NULL,
  [lastAttemptDate] DATETIME2 NOT NULL,
  [blockedUntil] DATETIME2 NULL
);
GO

/**
 * @table auditLog Audit log for client operations
 * @multitenancy false
 * @softDelete false
 * @alias audLog
 */
CREATE TABLE [functional].[auditLog] (
  [idLog] INTEGER IDENTITY(1, 1) NOT NULL,
  [operationType] NVARCHAR(50) NOT NULL,
  [operationDate] DATETIME2 NOT NULL,
  [ipAddress] VARCHAR(45) NOT NULL,
  [idClient] INTEGER NULL,
  [details] NVARCHAR(MAX) NULL
);
GO

/**
 * @table verificationRequest Email verification resend requests
 * @multitenancy false
 * @softDelete false
 * @alias verReq
 */
CREATE TABLE [functional].[verificationRequest] (
  [idRequest] INTEGER IDENTITY(1, 1) NOT NULL,
  [email] NVARCHAR(100) NOT NULL,
  [requestDate] DATETIME2 NOT NULL,
  [ipAddress] VARCHAR(45) NOT NULL
);
GO

/**
 * @table creditRequest Credit request information
 * @multitenancy false
 * @softDelete false
 * @alias creReq
 */
CREATE TABLE [functional].[creditRequest] (
  [idCreditRequest] INTEGER IDENTITY(1, 1) NOT NULL,
  [idClient] INTEGER NOT NULL,
  [requestNumber] VARCHAR(50) NOT NULL,
  [creditAmount] DECIMAL(15, 2) NOT NULL,
  [purposeCategory] VARCHAR(50) NOT NULL,
  [purposeSubcategory] VARCHAR(100) NOT NULL,
  [paymentTerm] VARCHAR(50) NOT NULL,
  [paymentMethod] VARCHAR(50) NOT NULL,
  [monthlyIncome] DECIMAL(15, 2) NOT NULL,
  [committedIncome] DECIMAL(15, 2) NOT NULL,
  [professionalSituation] VARCHAR(50) NOT NULL,
  [bankCode] VARCHAR(3) NOT NULL,
  [branchNumber] VARCHAR(5) NOT NULL,
  [accountNumber] VARCHAR(12) NOT NULL,
  [requestDate] DATETIME2 NOT NULL,
  [status] VARCHAR(50) NOT NULL,
  [lockStatus] BIT DEFAULT 0 NOT NULL,
  [lockedBy] INTEGER NULL,
  [lockTimestamp] DATETIME2 NULL
);
GO

/**
 * @primaryKey pkClient
 * @keyType Object
 */
ALTER TABLE [functional].[client]
ADD CONSTRAINT [pkClient] PRIMARY KEY CLUSTERED ([idClient]);
GO

/**
 * @primaryKey pkAddress
 * @keyType Object
 */
ALTER TABLE [functional].[address]
ADD CONSTRAINT [pkAddress] PRIMARY KEY CLUSTERED ([idAddress]);
GO

/**
 * @primaryKey pkEmailVerification
 * @keyType Object
 */
ALTER TABLE [functional].[emailVerification]
ADD CONSTRAINT [pkEmailVerification] PRIMARY KEY CLUSTERED ([idVerification]);
GO

/**
 * @primaryKey pkRegistrationAttempt
 * @keyType Object
 */
ALTER TABLE [functional].[registrationAttempt]
ADD CONSTRAINT [pkRegistrationAttempt] PRIMARY KEY CLUSTERED ([idAttempt]);
GO

/**
 * @primaryKey pkAuditLog
 * @keyType Object
 */
ALTER TABLE [functional].[auditLog]
ADD CONSTRAINT [pkAuditLog] PRIMARY KEY CLUSTERED ([idLog]);
GO

/**
 * @primaryKey pkVerificationRequest
 * @keyType Object
 */
ALTER TABLE [functional].[verificationRequest]
ADD CONSTRAINT [pkVerificationRequest] PRIMARY KEY CLUSTERED ([idRequest]);
GO

/**
 * @primaryKey pkCreditRequest
 * @keyType Object
 */
ALTER TABLE [functional].[creditRequest]
ADD CONSTRAINT [pkCreditRequest] PRIMARY KEY CLUSTERED ([idCreditRequest]);
GO

/**
 * @foreignKey fkAddress_Client Relationship between address and client
 * @target functional.client
 */
ALTER TABLE [functional].[address]
ADD CONSTRAINT [fkAddress_Client] FOREIGN KEY ([idClient])
REFERENCES [functional].[client]([idClient]);
GO

/**
 * @foreignKey fkEmailVerification_Client Relationship between email verification and client
 * @target functional.client
 */
ALTER TABLE [functional].[emailVerification]
ADD CONSTRAINT [fkEmailVerification_Client] FOREIGN KEY ([idClient])
REFERENCES [functional].[client]([idClient]);
GO

/**
 * @foreignKey fkCreditRequest_Client Relationship between credit request and client
 * @target functional.client
 */
ALTER TABLE [functional].[creditRequest]
ADD CONSTRAINT [fkCreditRequest_Client] FOREIGN KEY ([idClient])
REFERENCES [functional].[client]([idClient]);
GO

/**
 * @foreignKey fkCreditRequest_LockedBy Relationship between credit request and analyst
 * @target functional.client
 */
ALTER TABLE [functional].[creditRequest]
ADD CONSTRAINT [fkCreditRequest_LockedBy] FOREIGN KEY ([lockedBy])
REFERENCES [functional].[client]([idClient]);
GO

/**
 * @check chkClient_Status Client status validation
 * @enum {0} Inactive
 * @enum {1} Active
 * @enum {2} Blocked
 */
ALTER TABLE [functional].[client]
ADD CONSTRAINT [chkClient_Status] CHECK ([status] BETWEEN 0 AND 2);
GO

/**
 * @check chkClient_Profile Client profile validation
 * @enum {0} Client
 * @enum {1} Analyst
 * @enum {2} Administrator
 */
ALTER TABLE [functional].[client]
ADD CONSTRAINT [chkClient_Profile] CHECK ([profile] BETWEEN 0 AND 2);
GO

/**
 * @check chkAddress_State Valid Brazilian state codes
 */
ALTER TABLE [functional].[address]
ADD CONSTRAINT [chkAddress_State] CHECK ([state] IN (
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
));
GO

/**
 * @check chkCreditRequest_CreditAmount Credit amount must be positive
 */
ALTER TABLE [functional].[creditRequest]
ADD CONSTRAINT [chkCreditRequest_CreditAmount] CHECK ([creditAmount] > 0);
GO

/**
 * @check chkCreditRequest_MonthlyIncome Monthly income must be positive
 */
ALTER TABLE [functional].[creditRequest]
ADD CONSTRAINT [chkCreditRequest_MonthlyIncome] CHECK ([monthlyIncome] > 0);
GO

/**
 * @check chkCreditRequest_CommittedIncome Committed income must be non-negative
 */
ALTER TABLE [functional].[creditRequest]
ADD CONSTRAINT [chkCreditRequest_CommittedIncome] CHECK ([committedIncome] >= 0);
GO

/**
 * @check chkCreditRequest_PurposeCategory Valid purpose categories
 */
ALTER TABLE [functional].[creditRequest]
ADD CONSTRAINT [chkCreditRequest_PurposeCategory] CHECK ([purposeCategory] IN (
  'CONSUMO', 'INVESTIMENTO', 'IMÓVEL', 'VEÍCULO'
));
GO

/**
 * @check chkCreditRequest_PaymentTerm Valid payment terms
 */
ALTER TABLE [functional].[creditRequest]
ADD CONSTRAINT [chkCreditRequest_PaymentTerm] CHECK ([paymentTerm] IN (
  'Até 6 meses', '6 a 12 meses', '13 a 24 meses', '25 a 48 meses', '49 a 60 meses'
));
GO

/**
 * @check chkCreditRequest_PaymentMethod Valid payment methods
 */
ALTER TABLE [functional].[creditRequest]
ADD CONSTRAINT [chkCreditRequest_PaymentMethod] CHECK ([paymentMethod] IN (
  'Boleto', 'Cartão de crédito', 'Débito automático em conta corrente'
));
GO

/**
 * @check chkCreditRequest_ProfessionalSituation Valid professional situations
 */
ALTER TABLE [functional].[creditRequest]
ADD CONSTRAINT [chkCreditRequest_ProfessionalSituation] CHECK ([professionalSituation] IN (
  'CLT', 'Autônomo', 'Empresário', 'Aposentado', 'Funcionário Público', 'Pensionista', 'Estudante', 'Desempregado'
));
GO

/**
 * @check chkCreditRequest_Status Valid request status
 */
ALTER TABLE [functional].[creditRequest]
ADD CONSTRAINT [chkCreditRequest_Status] CHECK ([status] IN (
  'Em Análise', 'Aprovado', 'Reprovado', 'Cancelado', 'Rascunho', 'Aguardando Documentação', 'Efetivada'
));
GO

/**
 * @index ixClient_Cpf Unique index for CPF
 * @type Search
 * @unique true
 */
CREATE UNIQUE NONCLUSTERED INDEX [ixClient_Cpf]
ON [functional].[client]([cpf]);
GO

/**
 * @index ixClient_Email Unique index for email
 * @type Search
 * @unique true
 */
CREATE UNIQUE NONCLUSTERED INDEX [ixClient_Email]
ON [functional].[client]([email]);
GO

/**
 * @index ixEmailVerification_Token Index for token lookup
 * @type Search
 */
CREATE NONCLUSTERED INDEX [ixEmailVerification_Token]
ON [functional].[emailVerification]([token])
WHERE [used] = 0;
GO

/**
 * @index ixEmailVerification_Client Index for client verification lookup
 * @type ForeignKey
 */
CREATE NONCLUSTERED INDEX [ixEmailVerification_Client]
ON [functional].[emailVerification]([idClient]);
GO

/**
 * @index ixRegistrationAttempt_Ip Index for IP lookup
 * @type Search
 */
CREATE NONCLUSTERED INDEX [ixRegistrationAttempt_Ip]
ON [functional].[registrationAttempt]([ipAddress]);
GO

/**
 * @index ixAddress_Client Index for client address lookup
 * @type ForeignKey
 */
CREATE NONCLUSTERED INDEX [ixAddress_Client]
ON [functional].[address]([idClient]);
GO

/**
 * @index ixAuditLog_Client Index for client audit log lookup
 * @type ForeignKey
 */
CREATE NONCLUSTERED INDEX [ixAuditLog_Client]
ON [functional].[auditLog]([idClient])
WHERE [idClient] IS NOT NULL;
GO

/**
 * @index ixVerificationRequest_Email Index for email verification request lookup
 * @type Search
 */
CREATE NONCLUSTERED INDEX [ixVerificationRequest_Email]
ON [functional].[verificationRequest]([email]);
GO

/**
 * @index ixCreditRequest_Client Index for client credit requests lookup
 * @type ForeignKey
 */
CREATE NONCLUSTERED INDEX [ixCreditRequest_Client]
ON [functional].[creditRequest]([idClient]);
GO

/**
 * @index ixCreditRequest_RequestNumber Unique index for request number
 * @type Search
 * @unique true
 */
CREATE UNIQUE NONCLUSTERED INDEX [ixCreditRequest_RequestNumber]
ON [functional].[creditRequest]([requestNumber]);
GO

/**
 * @index ixCreditRequest_Status Index for status filtering
 * @type Search
 */
CREATE NONCLUSTERED INDEX [ixCreditRequest_Status]
ON [functional].[creditRequest]([status]);
GO

/**
 * @index ixCreditRequest_LockStatus Index for lock status filtering
 * @type Search
 */
CREATE NONCLUSTERED INDEX [ixCreditRequest_LockStatus]
ON [functional].[creditRequest]([lockStatus])
WHERE [lockStatus] = 0;
GO
