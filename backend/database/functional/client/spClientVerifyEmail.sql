/**
 * @summary
 * Verifies client email using the provided token.
 * Updates email verification status and invalidates the token.
 *
 * @procedure spClientVerifyEmail
 * @schema functional
 * @type stored-procedure
 *
 * @endpoints
 * - GET /api/v1/external/client/verify-email
 *
 * @parameters
 * @param {VARCHAR(255)} token
 *   - Required: Yes
 *   - Description: Email verification token
 *
 * @returns {INTEGER} idClient - Verified client identifier
 * @returns {NVARCHAR(100)} email - Client email address
 *
 * @testScenarios
 * - Valid token verification
 * - Invalid token handling
 * - Expired token handling
 * - Already used token handling
 */
CREATE OR ALTER PROCEDURE [functional].[spClientVerifyEmail]
  @token VARCHAR(255)
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @idClient INTEGER;
  DECLARE @email NVARCHAR(100);
  DECLARE @currentDate DATETIME2 = GETUTCDATE();
  DECLARE @expirationDate DATETIME2;
  DECLARE @used BIT;

  BEGIN TRY
    /**
     * @validation Token existence and validity check
     * @throw {invalidToken}
     */
    SELECT
      @idClient = [emlVer].[idClient],
      @expirationDate = [emlVer].[expirationDate],
      @used = [emlVer].[used]
    FROM [functional].[emailVerification] emlVer
    WHERE [emlVer].[token] = @token;

    IF @idClient IS NULL
    BEGIN
      ;THROW 51000, 'invalidToken', 1;
    END;

    /**
     * @validation Token already used check
     * @throw {tokenAlreadyUsed}
     */
    IF @used = 1
    BEGIN
      ;THROW 51000, 'tokenAlreadyUsed', 1;
    END;

    /**
     * @validation Token expiration check
     * @throw {tokenExpired}
     */
    IF @expirationDate < @currentDate
    BEGIN
      ;THROW 51000, 'tokenExpired', 1;
    END;

    /**
     * @rule {fn-email-verification} Update client and token status
     */
    BEGIN TRAN;

      UPDATE [functional].[client]
      SET [emailVerified] = 1
      WHERE [idClient] = @idClient;

      UPDATE [functional].[emailVerification]
      SET [used] = 1
      WHERE [token] = @token;

      SELECT @email = [cli].[email]
      FROM [functional].[client] cli
      WHERE [cli].[idClient] = @idClient;

      /**
       * @rule {fn-audit-log} Register verification audit log
       */
      INSERT INTO [functional].[auditLog]
      ([operationType], [operationDate], [ipAddress], [idClient], [details])
      VALUES
      ('EmailVerification', @currentDate, '', @idClient,
       JSON_QUERY((SELECT @email AS email FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)));

    COMMIT TRAN;

    /**
     * @output {EmailVerified, 1, 1}
     * @column {INTEGER} idClient
     * - Description: Verified client identifier
     * @column {NVARCHAR(100)} email
     * - Description: Client email address
     */
    SELECT
      @idClient AS [idClient],
      @email AS [email];

  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0
      ROLLBACK TRAN;

    THROW;
  END CATCH;
END;
GO