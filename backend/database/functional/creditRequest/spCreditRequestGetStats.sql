/**
 * @summary
 * Retrieves statistics of credit requests for a client.
 * Returns counts grouped by status and total count.
 *
 * @procedure spCreditRequestGetStats
 * @schema functional
 * @type stored-procedure
 *
 * @endpoints
 * - GET /api/v1/internal/credit-request/stats
 *
 * @parameters
 * @param {INTEGER} idClient
 *   - Required: Yes
 *   - Description: Client identifier
 *
 * @returns {TABLE} stats - Status counts
 */
CREATE OR ALTER PROCEDURE [functional].[spCreditRequestGetStats]
  @idClient INTEGER
AS
BEGIN
  SET NOCOUNT ON;

  SELECT
    [status],
    COUNT(*) as [count]
  FROM [functional].[creditRequest]
  WHERE [idClient] = @idClient
  GROUP BY [status];
END;
GO