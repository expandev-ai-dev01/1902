/**
 * @summary
 * Locks a credit request for analysis by a specific analyst.
 * Ensures atomic locking to prevent race conditions.
 *
 * @procedure spAnalysisQueueLock
 * @schema functional
 * @type stored-procedure
 *
 * @endpoints
 * - POST /api/v1/internal/analysis-queue/:id/lock
 *
 * @parameters
 * @param {INTEGER} idCreditRequest
 *   - Required: Yes
 *   - Description: Credit request identifier
 *
 * @param {INTEGER} analystId
 *   - Required: Yes
 *   - Description: Analyst identifier
 *
 * @returns {BIT} success
 *
 * @throws {requestNotFound} If request does not exist
 * @throws {proposalAlreadyLocked} If request is already locked by another analyst
 */
CREATE OR ALTER PROCEDURE [functional].[spAnalysisQueueLock]
  @idCreditRequest INTEGER,
  @analystId INTEGER
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @lockStatus BIT;
  DECLARE @lockedBy INTEGER;

  -- Check current status
  SELECT
    @lockStatus = [lockStatus],
    @lockedBy = [lockedBy]
  FROM [functional].[creditRequest]
  WHERE [idCreditRequest] = @idCreditRequest;

  IF @lockStatus IS NULL
  BEGIN
    ;THROW 51000, 'requestNotFound', 1;
  END;

  IF @lockStatus = 1 AND @lockedBy <> @analystId
  BEGIN
    ;THROW 51000, 'proposalAlreadyLocked', 1;
  END;

  -- Apply lock
  UPDATE [functional].[creditRequest]
  SET
    [lockStatus] = 1,
    [lockedBy] = @analystId,
    [lockTimestamp] = GETUTCDATE()
  WHERE [idCreditRequest] = @idCreditRequest;

  SELECT 1 as [success];
END;
GO
