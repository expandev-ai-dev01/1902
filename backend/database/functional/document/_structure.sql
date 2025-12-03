/**
 * @schema functional
 * Document management schema for credit request documents
 */

/**
 * @table document Document metadata and storage information
 * @multitenancy false
 * @softDelete false
 * @alias doc
 */
CREATE TABLE [functional].[document] (
  [idDocument] INTEGER IDENTITY(1, 1) NOT NULL,
  [idCreditRequest] INTEGER NOT NULL,
  [idClient] INTEGER NOT NULL,
  [category] VARCHAR(50) NOT NULL,
  [description] NVARCHAR(100) NULL,
  [fileName] NVARCHAR(255) NOT NULL,
  [fileSize] INTEGER NOT NULL,
  [fileType] VARCHAR(50) NOT NULL,
  [uploadDate] DATETIME2 NOT NULL,
  [uploadStatus] VARCHAR(20) NOT NULL,
  [storageUrl] NVARCHAR(500) NOT NULL,
  [deleted] BIT DEFAULT 0 NOT NULL
);
GO

/**
 * @primaryKey pkDocument
 * @keyType Object
 */
ALTER TABLE [functional].[document]
ADD CONSTRAINT [pkDocument] PRIMARY KEY CLUSTERED ([idDocument]);
GO

/**
 * @foreignKey fkDocument_CreditRequest Relationship between document and credit request
 * @target functional.creditRequest
 */
ALTER TABLE [functional].[document]
ADD CONSTRAINT [fkDocument_CreditRequest] FOREIGN KEY ([idCreditRequest])
REFERENCES [functional].[creditRequest]([idCreditRequest]);
GO

/**
 * @foreignKey fkDocument_Client Relationship between document and client
 * @target functional.client
 */
ALTER TABLE [functional].[document]
ADD CONSTRAINT [fkDocument_Client] FOREIGN KEY ([idClient])
REFERENCES [functional].[client]([idClient]);
GO

/**
 * @check chkDocument_Category Valid document categories
 */
ALTER TABLE [functional].[document]
ADD CONSTRAINT [chkDocument_Category] CHECK ([category] IN (
  'Documento de Identificação',
  'Comprovante de Renda',
  'Comprovante de Residência',
  'Extrato Bancário',
  'Outros'
));
GO

/**
 * @check chkDocument_FileSize File size must be positive and within limit
 */
ALTER TABLE [functional].[document]
ADD CONSTRAINT [chkDocument_FileSize] CHECK ([fileSize] > 0 AND [fileSize] <= 10485760);
GO

/**
 * @check chkDocument_FileType Valid file types
 */
ALTER TABLE [functional].[document]
ADD CONSTRAINT [chkDocument_FileType] CHECK ([fileType] IN ('PDF', 'JPG', 'PNG'));
GO

/**
 * @check chkDocument_UploadStatus Valid upload status
 */
ALTER TABLE [functional].[document]
ADD CONSTRAINT [chkDocument_UploadStatus] CHECK ([uploadStatus] IN (
  'Em Andamento',
  'Concluído',
  'Erro'
));
GO

/**
 * @index ixDocument_CreditRequest Index for credit request documents lookup
 * @type ForeignKey
 */
CREATE NONCLUSTERED INDEX [ixDocument_CreditRequest]
ON [functional].[document]([idCreditRequest])
WHERE [deleted] = 0;
GO

/**
 * @index ixDocument_Client Index for client documents lookup
 * @type ForeignKey
 */
CREATE NONCLUSTERED INDEX [ixDocument_Client]
ON [functional].[document]([idClient])
WHERE [deleted] = 0;
GO

/**
 * @index ixDocument_Category Index for category filtering
 * @type Search
 */
CREATE NONCLUSTERED INDEX [ixDocument_Category]
ON [functional].[document]([category])
WHERE [deleted] = 0;
GO