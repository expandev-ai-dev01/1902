/**
 * @summary
 * Lists credit requests for a client with filtering and pagination.
 * Supports filtering by status, date range, and search term.
 *
 * @procedure spCreditRequestList
 * @schema functional
 * @type stored-procedure
 *
 * @endpoints
 * - GET /api/v1/internal/credit-request
 *
 * @parameters
 * @param {INTEGER} idClient
 *   - Required: Yes
 *   - Description: Client identifier
 *
 * @param {VARCHAR(MAX)} statusList
 *   - Required: No
 *   - Description: Comma-separated list of statuses to filter
 *
 * @param {DATE} startDate
 *   - Required: No
 *   - Description: Filter start date
 *
 * @param {DATE} endDate
 *   - Required: No
 *   - Description: Filter end date
 *
 * @param {VARCHAR(50)} searchTerm
 *   - Required: No
 *   - Description: Search by request number (partial)
 *
 * @param {INTEGER} page
 *   - Required: No
 *   - Default: 1
 *   - Description: Page number
 *
 * @param {INTEGER} pageSize
 *   - Required: No
 *   - Default: 10
 *   - Description: Items per page
 *
 * @returns {TABLE} data - List of credit requests
 * @returns {INTEGER} total - Total count of records matching filters
 */
CREATE OR ALTER PROCEDURE [functional].[spCreditRequestList]
  @idClient INTEGER,
  @statusList VARCHAR(MAX) = NULL,
  @startDate DATE = NULL,
  @endDate DATE = NULL,
  @searchTerm VARCHAR(50) = NULL,
  @page INTEGER = 1,
  @pageSize INTEGER = 10
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @offset INTEGER = (@page - 1) * @pageSize;

  -- Parse status list into table
  DECLARE @statuses TABLE (status VARCHAR(50));
  IF @statusList IS NOT NULL
  BEGIN
    INSERT INTO @statuses
    SELECT value FROM STRING_SPLIT(@statusList, ',');
  END;

  -- Main query with pagination
  SELECT
    [cr].[idCreditRequest],
    [cr].[requestNumber],
    [cr].[creditAmount],
    [cr].[purposeCategory],
    [cr].[purposeSubcategory],
    [cr].[paymentTerm],
    [cr].[status],
    [cr].[requestDate],
    COUNT(*) OVER() as [totalRecords]
  FROM [functional].[creditRequest] cr
  WHERE [cr].[idClient] = @idClient
    AND (@statusList IS NULL OR [cr].[status] IN (SELECT status FROM @statuses))
    AND (@startDate IS NULL OR CAST([cr].[requestDate] AS DATE) >= @startDate)
    AND (@endDate IS NULL OR CAST([cr].[requestDate] AS DATE) <= @endDate)
    AND (@searchTerm IS NULL OR [cr].[requestNumber] LIKE '%' + @searchTerm + '%')
  ORDER BY [cr].[requestDate] DESC
  OFFSET @offset ROWS
  FETCH NEXT @pageSize ROWS ONLY;
END;
GO