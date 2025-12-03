/**
 * @summary
 * Finalizes document submission for a credit request.
 * Validates mandatory categories and changes request status to 'Em Análise'.
 *
 * @procedure spDocumentFinalize
 * @schema functional
 * @type stored-procedure
 *
 * @endpoints
 * - POST /api/v1/internal/credit-request/:id/documents/finalize
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
 * @returns {BIT} success
 *
 * @testScenarios
 * - Valid finalization with all mandatory documents
 * - Missing mandatory category documents
 * - Invalid request status
 * - Request not found or ownership mismatch
 */
CREATE OR ALTER PROCEDURE [functional].[spDocumentFinalize]
  @idCreditRequest INTEGER,
  @idClient INTEGER
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @requestOwner INTEGER;
  DECLARE @requestStatus VARCHAR(50);
  DECLARE @hasIdentification BIT = 0;
  DECLARE @hasIncome BIT = 0;
  DECLARE @hasResidence BIT = 0;
  DECLARE @missingCategories NVARCHAR(500) = '';

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

    IF @requestOwner IS NULL OR @requestOwner <> @idClient
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
     * @validation Mandatory categories check
     * @throw {mandatoryCategoriesMissing}
     */
    SELECT @hasIdentification = CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END
    FROM [functional].[document]
    WHERE [idCreditRequest] = @idCreditRequest
      AND [category] = 'Documento de Identificação'
      AND [deleted] = 0;

    SELECT @hasIncome = CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END
    FROM [functional].[document]
    WHERE [idCreditRequest] = @idCreditRequest
      AND [category] = 'Comprovante de Renda'
      AND [deleted] = 0;

    SELECT @hasResidence = CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END
    FROM [functional].[document]
    WHERE [idCreditRequest] = @idCreditRequest
      AND [category] = 'Comprovante de Residência'
      AND [deleted] = 0;

    IF @hasIdentification = 0
      SET @missingCategories = @missingCategories + 'Documento de Identificação, ';
    IF @hasIncome = 0
      SET @missingCategories = @missingCategories + 'Comprovante de Renda, ';
    IF @hasResidence = 0
      SET @missingCategories = @missingCategories + 'Comprovante de Residência, ';

    IF LEN(@missingCategories) > 0
    BEGIN
      SET @missingCategories = LEFT(@missingCategories, LEN(@missingCategories) - 2);
      ;THROW 51000, 'mandatoryCategoriesMissing', 1;
    END;

    /**
     * @rule {fn-document-finalization} Update request status
     */
    BEGIN TRAN;

      UPDATE [functional].[creditRequest]
      SET [status] = 'Em Análise'
      WHERE [idCreditRequest] = @idCreditRequest;

      /**
       * @rule {fn-audit-log} Register audit log
       */
      INSERT INTO [functional].[auditLog]
      ([operationType], [operationDate], [ipAddress], [idClient], [details])
      VALUES
      ('DocumentFinalization', GETUTCDATE(), '', @idClient,
       JSON_QUERY((SELECT @idCreditRequest AS idCreditRequest FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)));

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