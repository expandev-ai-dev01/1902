/**
 * @summary
 * Retrieves detailed credit request information for analysis.
 * Includes client data and history of previous requests.
 *
 * @procedure spCreditRequestGetDetail
 * @schema functional
 * @type stored-procedure
 *
 * @endpoints
 * - GET /api/v1/internal/credit-request/:id/evaluation-detail
 *
 * @parameters
 * @param {INTEGER} idCreditRequest
 *   - Required: Yes
 *   - Description: Credit request identifier
 *
 * @param {INTEGER} analystId
 *   - Required: Yes
 *   - Description: ID of the analyst requesting details
 *
 * @returns {OBJECT} request - Full request details
 * @returns {OBJECT} client - Client personal data
 * @returns {ARRAY} history - List of previous requests
 */
CREATE OR ALTER PROCEDURE [functional].[spCreditRequestGetDetail]
  @idCreditRequest INTEGER,
  @analystId INTEGER
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @idClient INTEGER;

  -- Get Request and Client ID
  SELECT @idClient = [idClient]
  FROM [functional].[creditRequest]
  WHERE [idCreditRequest] = @idCreditRequest;

  IF @idClient IS NULL
  BEGIN
    ;THROW 51000, 'requestNotFound', 1;
  END;

  -- Return Request Details
  SELECT *
  FROM [functional].[creditRequest]
  WHERE [idCreditRequest] = @idCreditRequest;

  -- Return Client Details
  SELECT 
    [idClient], [fullName], [cpf], [email], [phone], [birthDate]
  FROM [functional].[client]
  WHERE [idClient] = @idClient;

  -- Return History
  SELECT 
    [idCreditRequest], [requestNumber], [requestDate], [status], [creditAmount]
  FROM [functional].[creditRequest]
  WHERE [idClient] = @idClient AND [idCreditRequest] <> @idCreditRequest
  ORDER BY [requestDate] DESC;
END;
GO
