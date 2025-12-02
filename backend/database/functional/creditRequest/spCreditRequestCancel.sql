/**
 * @summary
 * Cancels a credit request if it is in a cancellable status.
 *
 * @procedure spCreditRequestCancel
 * @schema functional
 * @type stored-procedure
 *
 * @endpoints
 * - POST /api/v1/internal/credit-request/:id/cancel
 *
 * @parameters
 * @param {INTEGER} idClient
 *   - Required: Yes
 *   - Description: Client identifier (for ownership check)
 *
 * @param {INTEGER} idCreditRequest
 *   - Required: Yes
 *   - Description: Credit request identifier
 *
 * @returns {BIT} success
 *
 * @throws {requestNotFound} If request does not exist or belongs to another client
 * @throws {requestCannotBeCancelled} If request status does not allow cancellation
 */
CREATE OR ALTER PROCEDURE [functional].[spCreditRequestCancel]
  @idClient INTEGER,
  @idCreditRequest INTEGER
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @currentStatus VARCHAR(50);

  -- Check existence and ownership
  SELECT @currentStatus = [status]
  FROM [functional].[creditRequest]
  WHERE [idCreditRequest] = @idCreditRequest
    AND [idClient] = @idClient;

  IF @currentStatus IS NULL
  BEGIN
    ;THROW 51000, 'requestNotFound', 1;
  END;

  -- Check if cancellable
  IF @currentStatus NOT IN ('Rascunho', 'Aguardando Documentação', 'Em Análise')
  BEGIN
    ;THROW 51000, 'requestCannotBeCancelled', 1;
  END;

  -- Update status
  UPDATE [functional].[creditRequest]
  SET [status] = 'Cancelado'
  WHERE [idCreditRequest] = @idCreditRequest;

  SELECT 1 as [success];
END;
GO