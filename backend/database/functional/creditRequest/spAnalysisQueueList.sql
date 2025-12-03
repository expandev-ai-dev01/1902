/**
 * @summary
 * Lists credit requests for the analysis queue with hybrid priority sorting.
 * Implements SLA calculation and advanced filtering.
 *
 * @procedure spAnalysisQueueList
 * @schema functional
 * @type stored-procedure
 *
 * @endpoints
 * - GET /api/v1/internal/analysis-queue
 *
 * @parameters
 * @param {INTEGER} analystId
 *   - Required: Yes
 *   - Description: ID of the analyst requesting the queue
 *
 * @param {DATE} startDate
 *   - Required: No
 *   - Description: Filter start date
 *
 * @param {DATE} endDate
 *   - Required: No
 *   - Description: Filter end date
 *
 * @param {DECIMAL(15,2)} minAmount
 *   - Required: No
 *   - Description: Minimum credit amount
 *
 * @param {DECIMAL(15,2)} maxAmount
 *   - Required: No
 *   - Description: Maximum credit amount
 *
 * @param {VARCHAR(50)} searchTerm
 *   - Required: No
 *   - Description: Search by request number or CPF
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
 * @returns {TABLE} data - List of analysis queue items
 * @returns {INTEGER} total - Total count of pending requests
 * @returns {INTEGER} filteredTotal - Count of requests matching filters
 */
CREATE OR ALTER PROCEDURE [functional].[spAnalysisQueueList]
  @analystId INTEGER,
  @startDate DATE = NULL,
  @endDate DATE = NULL,
  @minAmount DECIMAL(15, 2) = NULL,
  @maxAmount DECIMAL(15, 2) = NULL,
  @searchTerm VARCHAR(50) = NULL,
  @page INTEGER = 1,
  @pageSize INTEGER = 10
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @offset INTEGER = (@page - 1) * @pageSize;
  DECLARE @currentDate DATETIME2 = GETUTCDATE();

  -- Base query with calculations
  WITH QueueItems AS (
    SELECT
      [cr].[idCreditRequest],
      [cr].[requestNumber],
      [cr].[creditAmount],
      [cr].[paymentTerm],
      [cr].[requestDate],
      [cli].[fullName] as [clientName],
      [cli].[cpf] as [clientCpf],
      DATEDIFF(MINUTE, [cr].[requestDate], @currentDate) as [waitTime],
      CASE
        WHEN DATEDIFF(MINUTE, [cr].[requestDate], @currentDate) < 30 THEN [cr].[creditAmount]
        ELSE 1000000
      END as [priorityScore],
      CASE
        WHEN DATEDIFF(MINUTE, [cr].[requestDate], @currentDate) <= 30 THEN 'Green'
        WHEN DATEDIFF(MINUTE, [cr].[requestDate], @currentDate) <= 42 THEN 'Yellow'
        WHEN DATEDIFF(MINUTE, [cr].[requestDate], @currentDate) <= 51 THEN 'Orange'
        WHEN DATEDIFF(MINUTE, [cr].[requestDate], @currentDate) <= 60 THEN 'Red'
        ELSE 'Black'
      END as [slaIndicator]
    FROM [functional].[creditRequest] cr
    INNER JOIN [functional].[client] cli ON [cr].[idClient] = [cli].[idClient]
    WHERE [cr].[status] = 'Em Análise'
      AND ([cr].[lockStatus] = 0 OR [cr].[lockedBy] = @analystId)
      AND (@startDate IS NULL OR CAST([cr].[requestDate] AS DATE) >= @startDate)
      AND (@endDate IS NULL OR CAST([cr].[requestDate] AS DATE) <= @endDate)
      AND (@minAmount IS NULL OR [cr].[creditAmount] >= @minAmount)
      AND (@maxAmount IS NULL OR [cr].[creditAmount] <= @maxAmount)
      AND (@searchTerm IS NULL OR (
        [cr].[requestNumber] LIKE '%' + @searchTerm + '%' OR
        [cli].[cpf] LIKE '%' + @searchTerm + '%'
      ))
  )
  SELECT
    *,
    (SELECT COUNT(*) FROM [functional].[creditRequest] WHERE [status] = 'Em Análise') as [total],
    COUNT(*) OVER() as [filteredTotal]
  FROM QueueItems
  ORDER BY [priorityScore] DESC, [requestDate] ASC
  OFFSET @offset ROWS
  FETCH NEXT @pageSize ROWS ONLY;
END;
GO
