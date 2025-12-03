/**
 * @summary
 * Adds evaluation fields to creditRequest table.
 * Stores approval conditions, rejection reasons, and correction instructions.
 */
ALTER TABLE [functional].[creditRequest] ADD
  [rejectionReason] NVARCHAR(1000) NULL,
  [approvedAmount] DECIMAL(15, 2) NULL,
  [interestRate] DECIMAL(5, 2) NULL,
  [finalTerm] INTEGER NULL,
  [installmentValue] DECIMAL(15, 2) NULL,
  [correctionInstructions] NVARCHAR(1000) NULL,
  [documentsToCorrect] NVARCHAR(MAX) NULL,
  [analysisCompletionDate] DATETIME2 NULL;
GO
