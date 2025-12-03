/**
 * @summary
 * Approves a credit request with specific financial conditions.
 * Validates analyst lock and updates status to 'Aprovado'.
 *
 * @procedure spCreditRequestApprove
 * @schema functional
 * @type stored-procedure
 *
 * @endpoints
 * - POST /api/v1/internal/credit-request/:id/approve
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
 * @param {DECIMAL(15,2)} approvedAmount
 *   - Required: Yes
 *   - Description: Final approved credit amount
 *
 * @param {DECIMAL(5,2)} interestRate
 *   - Required: Yes
 *   - Description: Monthly interest rate
 *
 * @param {INTEGER} finalTerm
 *   - Required: Yes
 *   - Description: Final payment term in months
 *
 * @param {DECIMAL(15,2)} installmentValue
 *   - Required: Yes
 *   - Description: Calculated installment value
 *
 * @returns {BIT} success
 */
CREATE OR ALTER PROCEDURE [functional].[spCreditRequestApprove]
  @idCreditRequest INTEGER,
  @analystId INTEGER,
  @approvedAmount DECIMAL(15, 2),
  @interestRate DECIMAL(5, 2),
  @finalTerm INTEGER,
  @installmentValue DECIMAL(15, 2)
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
    ;THROW 51000, 'invalidStatusForApproval', 1;
  END;

  -- Update
  UPDATE [functional].[creditRequest]
  SET 
    [status] = 'Aprovado',
    [approvedAmount] = @approvedAmount,
    [interestRate] = @interestRate,
    [finalTerm] = @finalTerm,
    [installmentValue] = @installmentValue,
    [analysisCompletionDate] = GETUTCDATE(),
    [lockStatus] = 0,
    [lockedBy] = NULL,
    [lockTimestamp] = NULL
  WHERE [idCreditRequest] = @idCreditRequest;

  SELECT 1 as [success];
END;
GO
