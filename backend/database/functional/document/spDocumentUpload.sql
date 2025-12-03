/**
 * @summary
 * Uploads a document for a credit request.
 * Validates file properties, request status, and stores document metadata.
 *
 * @procedure spDocumentUpload
 * @schema functional
 * @type stored-procedure
 *
 * @endpoints
 * - POST /api/v1/internal/credit-request/:id/documents
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
 * @param {VARCHAR(50)} category
 *   - Required: Yes
 *   - Description: Document category
 *
 * @param {NVARCHAR(100)} description
 *   - Required: No
 *   - Description: Document description
 *
 * @param {NVARCHAR(255)} fileName
 *   - Required: Yes
 *   - Description: Original file name
 *
 * @param {INTEGER} fileSize
 *   - Required: Yes
 *   - Description: File size in bytes
 *
 * @param {VARCHAR(50)} fileType
 *   - Required: Yes
 *   - Description: File type (PDF, JPG, PNG)
 *
 * @param {NVARCHAR(500)} storageUrl
 *   - Required: Yes
 *   - Description: Storage URL for the uploaded file
 *
 * @returns {INTEGER} idDocument - Created document identifier
 *
 * @testScenarios
 * - Valid document upload
 * - Invalid request status (not 'Aguardando Documentação')
 * - Invalid file size (exceeds 10MB)
 * - Invalid file type
 * - Request not found or ownership mismatch
 */
CREATE OR ALTER PROCEDURE [functional].[spDocumentUpload]
  @idCreditRequest INTEGER,
  @idClient INTEGER,
  @category VARCHAR(50),
  @description NVARCHAR(100) = NULL,
  @fileName NVARCHAR(255),
  @fileSize INTEGER,
  @fileType VARCHAR(50),
  @storageUrl NVARCHAR(500)
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @idDocument INTEGER;
  DECLARE @currentDate DATETIME2 = GETUTCDATE();
  DECLARE @requestStatus VARCHAR(50);
  DECLARE @requestOwner INTEGER;

  BEGIN TRY
    /**
     * @validation Request existence and ownership check
     * @throw {requestNotFound}
     */
    SELECT
      @requestStatus = [status],
      @requestOwner = [idClient]
    FROM [functional].[creditRequest]
    WHERE [idCreditRequest] = @idCreditRequest;

    IF @requestOwner IS NULL
    BEGIN
      ;THROW 51000, 'requestNotFound', 1;
    END;

    IF @requestOwner <> @idClient
    BEGIN
      ;THROW 51000, 'requestNotFound', 1;
    END;

    /**
     * @validation Request status check
     * @throw {invalidRequestStatus}
     */
    IF @requestStatus <> 'Aguardando Documentação'
    BEGIN
      ;THROW 51000, 'invalidRequestStatus', 1;
    END;

    /**
     * @validation File size check
     * @throw {fileSizeExceeded}
     */
    IF @fileSize > 10485760
    BEGIN
      ;THROW 51000, 'fileSizeExceeded', 1;
    END;

    /**
     * @validation File type check
     * @throw {invalidFileType}
     */
    IF @fileType NOT IN ('PDF', 'JPG', 'PNG')
    BEGIN
      ;THROW 51000, 'invalidFileType', 1;
    END;

    /**
     * @rule {fn-document-upload} Insert document record
     */
    BEGIN TRAN;

      INSERT INTO [functional].[document]
      ([idCreditRequest], [idClient], [category], [description],
       [fileName], [fileSize], [fileType], [uploadDate],
       [uploadStatus], [storageUrl], [deleted])
      VALUES
      (@idCreditRequest, @idClient, @category, @description,
       @fileName, @fileSize, @fileType, @currentDate,
       'Concluído', @storageUrl, 0);

      SET @idDocument = SCOPE_IDENTITY();

      /**
       * @rule {fn-audit-log} Register audit log
       */
      INSERT INTO [functional].[auditLog]
      ([operationType], [operationDate], [ipAddress], [idClient], [details])
      VALUES
      ('DocumentUpload', @currentDate, '', @idClient,
       JSON_QUERY((SELECT @idDocument AS idDocument, @category AS category FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)));

    COMMIT TRAN;

    /**
     * @output {DocumentUploaded, 1, 1}
     * @column {INTEGER} idDocument
     * - Description: Created document identifier
     */
    SELECT @idDocument AS [idDocument];

  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0
      ROLLBACK TRAN;

    THROW;
  END CATCH;
END;
GO