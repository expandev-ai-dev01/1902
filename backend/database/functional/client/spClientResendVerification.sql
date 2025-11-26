/**
 * @summary
 * Generates and sends a new email verification token for a client.
 * Invalidates previous tokens and implements daily request limit.
 *
 * @procedure spClientResendVerification
 * @schema functional
 * @type stored-procedure
 *
 * @endpoints
 * - POST /api/v1/external/client/resend-verification
 *
 * @parameters
 * @param {NVARCHAR(100)} email
 *   - Required: Yes
 *   - Description: Client email address
 *
 * @param {VARCHAR(45)} ipAddress
 *   - Required: Yes
 *   - Description: Request IP address
 *
 * @returns {VARCHAR(255)} verificationToken - New verification token
 *
 * @testScenarios
 * - Valid resend request
 * - Email not found handling
 * - Already verified email handling
 * - Daily limit exceeded handling
 */
CREATE OR ALTER PROCEDURE [functional].[spClientResendVerification]
  @email NVARCHAR(100),
  @ipAddress VARCHAR(45)
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @idClient INTEGER;
  DECLARE @emailVerified BIT;
  DECLARE @verificationToken VARCHAR(255);
  DECLARE @currentDate DATETIME2 = GETUTCDATE();
  DECLARE @expirationDate DATETIME2 = DATEADD(HOUR, 24, @currentDate);
  DECLARE @requestCount INTEGER;

  BEGIN TRY
    /**
     * @validation Email existence check
     * @throw {emailNotFound}
     */
    SELECT
      @idClient = [cli].[idClient],
      @emailVerified = [cli].[emailVerified]
    FROM [functional].[client] cli
    WHERE [cli].[email] = @email;

    IF @idClient IS NULL
    BEGIN
      ;THROW 51000, 'emailNotFound', 1;
    END;

    /**
     * @validation Email already verified check
     * @throw {emailAlreadyVerified}
     */
    IF @emailVerified = 1
    BEGIN
      ;THROW 51000, 'emailAlreadyVerified', 1;
    END;

    /**
     * @validation Daily request limit check
     * @throw {dailyLimitExceeded}
     */
    SELECT @requestCount = COUNT(*)
    FROM [functional].[verificationRequest] verReq
    WHERE [verReq].[email] = @email
      AND DATEDIFF(DAY, [verReq].[requestDate], @currentDate) = 0;

    IF @requestCount >= 3
    BEGIN
      ;THROW 51000, 'dailyLimitExceeded', 1;
    END;

    /**
     * @rule {fn-token-regeneration} Generate new token and invalidate old ones
     */
    BEGIN TRAN;

      /**
       * @rule {fn-invalidate-tokens} Invalidate previous tokens
       */
      UPDATE [functional].[emailVerification]
      SET [used] = 1
      WHERE [idClient] = @idClient
        AND [used] = 0;

      /**
       * @rule {fn-new-token} Generate new verification token
       */
      SET @verificationToken = CONVERT(VARCHAR(255), HASHBYTES('SHA2_256',
        CONCAT(@email, @currentDate, NEWID())), 2);

      INSERT INTO [functional].[emailVerification]
      ([idClient], [token], [generatedDate], [expirationDate], [used])
      VALUES
      (@idClient, @verificationToken, @currentDate, @expirationDate, 0);

      /**
       * @rule {fn-request-tracking} Register verification request
       */
      INSERT INTO [functional].[verificationRequest]
      ([email], [requestDate], [ipAddress])
      VALUES
      (@email, @currentDate, @ipAddress);

      /**
       * @rule {fn-audit-log} Register audit log
       */
      INSERT INTO [functional].[auditLog]
      ([operationType], [operationDate], [ipAddress], [idClient], [details])
      VALUES
      ('VerificationResend', @currentDate, @ipAddress, @idClient,
       JSON_QUERY((SELECT @email AS email FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)));

    COMMIT TRAN;

    /**
     * @output {VerificationResent, 1, 1}
     * @column {VARCHAR(255)} verificationToken
     * - Description: New verification token
     */
    SELECT
      @verificationToken AS [verificationToken];

  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0
      ROLLBACK TRAN;

    THROW;
  END CATCH;
END;
GO