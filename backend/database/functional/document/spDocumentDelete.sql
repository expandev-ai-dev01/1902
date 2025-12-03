/**
 * @summary
 * Deletes (soft delete) a document from a credit request.
 * Only allowed when request is in 'Aguardando Documentação' status.
 *
 * @procedure spDocumentDelete
 * @schema functional
 * @type stored-procedure
 *
 * @endpoints
 * - DELETE /api/v1/internal/credit-request/:id/documents/:idDocument
 *
 * @parameters
 * @param {INTEGER} idDocument
 *   - Required: Yes
 *   - Description: Document identifier
 *
 * @param {INTEGER} idClient
 *   - Required: Yes
 *   - Description: Client identifier (for ownership validation)
 *
 * @returns {BIT} success
 *
 * @testScenarios
 * - Valid document deletion
 * - Document not found or ownership mismatch
 * - Invalid request status (not 'Aguardando Documentação')
 */
CREATE OR ALTER PROCEDURE [functional].[spDocumentDelete]
  @idDocument INTEGER,
  @idClient INTEGER
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @idCreditRequest INTEGER;
  DECLARE @documentOwner INTEGER;
  DECLARE @requestStatus VARCHAR(50);

  BEGIN TRY
    /**
     * @validation Document existence and ownership check
     * @throw {documentNotFound}
     */
    SELECT
      @idCreditRequest = [idCreditRequest],
      @documentOwner = [idClient]
    FROM [functional].[document]
    WHERE [idDocument] = @idDocument
      AND [deleted] = 0;

    IF @documentOwner IS NULL OR @documentOwner <> @idClient
    BEGIN
      ;THROW 51000, 'documentNotFound', 1;
    END;

    /**
     * @validation Request status check
     * @throw {cannotDeleteDocument}
     */
    SELECT @requestStatus = [status]
    FROM [functional].[creditRequest]
    WHERE [idCreditRequest] = @idCreditRequest;

    IF @requestStatus <> 'Aguardando Documentação'
    BEGIN
      ;THROW 51000, 'cannotDeleteDocument', 1;
    END;

    /**
     * @rule {fn-document-deletion} Soft delete document
     */
    BEGIN TRAN;

      UPDATE [functional].[document]
      SET [deleted] = 1
      WHERE [idDocument] = @idDocument;

      /**
       * @rule {fn-audit-log} Register audit log
       */
      INSERT INTO [functional].[auditLog]
      ([operationType], [operationDate], [ipAddress], [idClient], [details])
      VALUES
      ('DocumentDelete', GETUTCDATE(), '', @idClient,
       JSON_QUERY((SELECT @idDocument AS idDocument FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)));

    COMMIT TRAN;

    SELECT 1 AS [success];

  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0
      ROLLBACK TRAN;

    THROW;
  END CATCH;
END;
GO