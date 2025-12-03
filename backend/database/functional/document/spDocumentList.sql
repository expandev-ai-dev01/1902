/**
 * @summary
 * Lists all documents for a credit request.
 * Returns documents grouped by category with metadata.
 *
 * @procedure spDocumentList
 * @schema functional
 * @type stored-procedure
 *
 * @endpoints
 * - GET /api/v1/internal/credit-request/:id/documents
 *
 * @parameters
 * @param {INTEGER} idCreditRequest
 *   - Required: Yes
 *   - Description: Credit request identifier
 *
 * @param {INTEGER} idClient
 *   - Required: Yes
 *   - Description: Client identifier (for ownership validation)
 *
 * @returns {TABLE} documents - List of documents with metadata
 *
 * @testScenarios
 * - Valid document listing
 * - Request not found or ownership mismatch
 * - Empty document list
 */
CREATE OR ALTER PROCEDURE [functional].[spDocumentList]
  @idCreditRequest INTEGER,
  @idClient INTEGER
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @requestOwner INTEGER;

  /**
   * @validation Request existence and ownership check
   * @throw {requestNotFound}
   */
  SELECT @requestOwner = [idClient]
  FROM [functional].[creditRequest]
  WHERE [idCreditRequest] = @idCreditRequest;

  IF @requestOwner IS NULL OR @requestOwner <> @idClient
  BEGIN
    ;THROW 51000, 'requestNotFound', 1;
  END;

  /**
   * @output {DocumentList, 1, N}
   * @column {INTEGER} idDocument - Document identifier
   * @column {VARCHAR(50)} category - Document category
   * @column {NVARCHAR(100)} description - Document description
   * @column {NVARCHAR(255)} fileName - File name
   * @column {INTEGER} fileSize - File size in bytes
   * @column {VARCHAR(50)} fileType - File type
   * @column {DATETIME2} uploadDate - Upload date
   * @column {VARCHAR(20)} uploadStatus - Upload status
   */
  SELECT
    [idDocument],
    [category],
    [description],
    [fileName],
    [fileSize],
    [fileType],
    [uploadDate],
    [uploadStatus]
  FROM [functional].[document]
  WHERE [idCreditRequest] = @idCreditRequest
    AND [deleted] = 0
  ORDER BY [category], [uploadDate] DESC;
END;
GO