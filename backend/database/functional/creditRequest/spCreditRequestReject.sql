/**
 * @summary
 * Rejects a credit request with a justification.
 * Validates analyst lock and updates status to 'Reprovado'.
 *
 * @procedure spCreditRequestReject
 * @schema functional
 * @type stored-procedure
 *
 * @endpoints
 * - POST /api/v1/internal/credit-request/:id/reject
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
 * @param {NVARCHAR(1000)} rejectionReason
 *   - Required: Yes
 *   - Description: Reason for rejection
 *
 * @returns {BIT} success
 */
CREATE OR ALTER PROCEDURE [functional].[spCreditRequestReject]
  @idCreditRequest INTEGER,
  @analystId INTEGER,
  @rejectionReason NVARCHAR(1000)
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
    ;THROW 51000, 'invalidStatusForRejection', 1;
  END;

  -- Update
  UPDATE [functional].[creditRequest]
  SET 
    [status] = 'Reprovado',
    [rejectionReason] = @rejectionReason,
    [analysisCompletionDate] = GETUTCDATE(),
    [lockStatus] = 0,
    [lockedBy] = NULL,
    [lockTimestamp] = NULL
  WHERE [idCreditRequest] = @idCreditRequest;

  SELECT 1 as [success];
END;
GO
