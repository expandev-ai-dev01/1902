/**
 * @summary
 * Returns a credit request for correction.
 * Validates analyst lock and updates status to 'Aguardando Documentação'.
 *
 * @procedure spCreditRequestReturn
 * @schema functional
 * @type stored-procedure
 *
 * @endpoints
 * - POST /api/v1/internal/credit-request/:id/return
 *
 * @parameters
 * @param {INTEGER} idCreditRequest
 *   - Required: Yes
 *   - Description: Credit request identifier
 *
 * @param {INTEGER} analystId
 *   - Required: Yes
 *   - Description: ID of the analyst performing the action
 *
 * @param {NVARCHAR(MAX)} documentsToCorrect
 *   - Required: Yes
 *   - Description: JSON array of document IDs to correct
 *
 * @param {NVARCHAR(1000)} correctionInstructions
 *   - Required: Yes
 *   - Description: Instructions for the client
 *
 * @returns {BIT} success
 */
CREATE OR ALTER PROCEDURE [functional].[spCreditRequestReturn]
  @idCreditRequest INTEGER,
  @analystId INTEGER,
  @documentsToCorrect NVARCHAR(MAX),
  @correctionInstructions NVARCHAR(1000)
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @currentStatus VARCHAR(50);
  DECLARE @lockedBy INTEGER;

  -- Validation
  SELECT 
    @currentStatus = [status],
    @lockedBy = [lockedBy]
  FROM [functional].[creditRequest]
  WHERE [idCreditRequest] = @idCreditRequest;

  IF @currentStatus IS NULL
  BEGIN
    ;THROW 51000, 'requestNotFound', 1;
  END;

  IF @lockedBy <> @analystId
  BEGIN
    ;THROW 51000, 'proposalNotLockedByAnalyst', 1;
  END;

  IF @currentStatus <> 'Em Análise'
  BEGIN
    ;THROW 51000, 'invalidStatusForReturn', 1;
  END;

  -- Update
  UPDATE [functional].[creditRequest]
  SET 
    [status] = 'Aguardando Documentação',
    [documentsToCorrect] = @documentsToCorrect,
    [correctionInstructions] = @correctionInstructions,
    [analysisCompletionDate] = GETUTCDATE(),
    [lockStatus] = 0,
    [lockedBy] = NULL,
    [lockTimestamp] = NULL
  WHERE [idCreditRequest] = @idCreditRequest;

  SELECT 1 as [success];
END;
GO
