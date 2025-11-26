/**
 * @summary
 * Creates a new client registration with personal information, address,
 * and generates email verification token. Implements IP-based rate limiting
 * and comprehensive validation.
 *
 * @procedure spClientCreate
 * @schema functional
 * @type stored-procedure
 *
 * @endpoints
 * - POST /api/v1/external/client/register
 *
 * @parameters
 * @param {NVARCHAR(100)} fullName
 *   - Required: Yes
 *   - Description: Client full name
 *
 * @param {VARCHAR(11)} cpf
 *   - Required: Yes
 *   - Description: Client CPF (11 digits)
 *
 * @param {NVARCHAR(100)} email
 *   - Required: Yes
 *   - Description: Client email address
 *
 * @param {VARCHAR(11)} phone
 *   - Required: Yes
 *   - Description: Client phone number with DDD
 *
 * @param {DATE} birthDate
 *   - Required: Yes
 *   - Description: Client birth date
 *
 * @param {VARCHAR(8)} zipCode
 *   - Required: Yes
 *   - Description: Address ZIP code
 *
 * @param {NVARCHAR(100)} street
 *   - Required: Yes
 *   - Description: Street name
 *
 * @param {VARCHAR(10)} number
 *   - Required: Yes
 *   - Description: Address number
 *
 * @param {NVARCHAR(50)} complement
 *   - Required: No
 *   - Description: Address complement
 *
 * @param {NVARCHAR(50)} neighborhood
 *   - Required: Yes
 *   - Description: Neighborhood name
 *
 * @param {NVARCHAR(50)} city
 *   - Required: Yes
 *   - Description: City name
 *
 * @param {VARCHAR(2)} state
 *   - Required: Yes
 *   - Description: State code (UF)
 *
 * @param {VARCHAR(255)} passwordHash
 *   - Required: Yes
 *   - Description: Hashed password (bcrypt)
 *
 * @param {VARCHAR(20)} termsVersion
 *   - Required: Yes
 *   - Description: Terms version accepted
 *
 * @param {VARCHAR(45)} ipAddress
 *   - Required: Yes
 *   - Description: Client IP address
 *
 * @returns {INTEGER} idClient - Created client identifier
 * @returns {VARCHAR(255)} verificationToken - Email verification token
 *
 * @testScenarios
 * - Valid registration with all required fields
 * - Duplicate CPF validation
 * - Duplicate email validation
 * - Age validation (minimum 18 years)
 * - IP rate limiting (5 attempts in 10 minutes)
 * - IP blocking (30 minutes after limit exceeded)
 */
CREATE OR ALTER PROCEDURE [functional].[spClientCreate]
  @fullName NVARCHAR(100),
  @cpf VARCHAR(11),
  @email NVARCHAR(100),
  @phone VARCHAR(11),
  @birthDate DATE,
  @zipCode VARCHAR(8),
  @street NVARCHAR(100),
  @number VARCHAR(10),
  @complement NVARCHAR(50) = NULL,
  @neighborhood NVARCHAR(50),
  @city NVARCHAR(50),
  @state VARCHAR(2),
  @passwordHash VARCHAR(255),
  @termsVersion VARCHAR(20),
  @ipAddress VARCHAR(45)
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @idClient INTEGER;
  DECLARE @idAddress INTEGER;
  DECLARE @verificationToken VARCHAR(255);
  DECLARE @currentDate DATETIME2 = GETUTCDATE();
  DECLARE @expirationDate DATETIME2 = DATEADD(HOUR, 24, @currentDate);
  DECLARE @attemptCount INTEGER;
  DECLARE @blockedUntil DATETIME2;
  DECLARE @age INTEGER;

  BEGIN TRY
    /**
     * @validation IP blocking check
     * @throw {ipBlocked}
     */
    SELECT @blockedUntil = [blockedUntil]
    FROM [functional].[registrationAttempt] regAtt
    WHERE [regAtt].[ipAddress] = @ipAddress
      AND [regAtt].[blockedUntil] > @currentDate;

    IF @blockedUntil IS NOT NULL
    BEGIN
      ;THROW 51000, 'ipBlocked', 1;
    END;

    /**
     * @validation Age requirement check
     * @throw {minimumAgeRequired}
     */
    SET @age = DATEDIFF(YEAR, @birthDate, @currentDate) -
      CASE
        WHEN MONTH(@birthDate) > MONTH(@currentDate) OR
             (MONTH(@birthDate) = MONTH(@currentDate) AND DAY(@birthDate) > DAY(@currentDate))
        THEN 1
        ELSE 0
      END;

    IF @age < 18
    BEGIN
      ;THROW 51000, 'minimumAgeRequired', 1;
    END;

    /**
     * @validation CPF uniqueness check
     * @throw {cpfAlreadyRegistered}
     */
    IF EXISTS (SELECT 1 FROM [functional].[client] cli WHERE [cli].[cpf] = @cpf)
    BEGIN
      ;THROW 51000, 'cpfAlreadyRegistered', 1;
    END;

    /**
     * @validation Email uniqueness check
     * @throw {emailAlreadyRegistered}
     */
    IF EXISTS (SELECT 1 FROM [functional].[client] cli WHERE [cli].[email] = @email)
    BEGIN
      ;THROW 51000, 'emailAlreadyRegistered', 1;
    END;

    /**
     * @rule {fn-client-registration} Client registration with transaction control
     */
    BEGIN TRAN;

      /**
       * @rule {fn-rate-limiting} Update or create registration attempt record
       */
      IF EXISTS (SELECT 1 FROM [functional].[registrationAttempt] regAtt WHERE [regAtt].[ipAddress] = @ipAddress)
      BEGIN
        UPDATE [functional].[registrationAttempt]
        SET
          [attemptCount] = CASE
            WHEN DATEDIFF(MINUTE, [lastAttemptDate], @currentDate) > 10 THEN 1
            ELSE [attemptCount] + 1
          END,
          [lastAttemptDate] = @currentDate,
          [blockedUntil] = CASE
            WHEN DATEDIFF(MINUTE, [lastAttemptDate], @currentDate) <= 10 AND [attemptCount] >= 4
            THEN DATEADD(MINUTE, 30, @currentDate)
            ELSE NULL
          END
        WHERE [ipAddress] = @ipAddress;
      END
      ELSE
      BEGIN
        INSERT INTO [functional].[registrationAttempt]
        ([ipAddress], [attemptCount], [lastAttemptDate], [blockedUntil])
        VALUES
        (@ipAddress, 1, @currentDate, NULL);
      END;

      /**
       * @rule {fn-client-creation} Insert client record
       */
      INSERT INTO [functional].[client]
      ([fullName], [cpf], [email], [phone], [birthDate], [passwordHash],
       [status], [profile], [emailVerified], [termsVersion],
       [registrationDate], [registrationIp])
      VALUES
      (@fullName, @cpf, @email, @phone, @birthDate, @passwordHash,
       1, 0, 0, @termsVersion,
       @currentDate, @ipAddress);

      SET @idClient = SCOPE_IDENTITY();

      /**
       * @rule {fn-address-creation} Insert address record
       */
      INSERT INTO [functional].[address]
      ([idClient], [zipCode], [street], [number], [complement],
       [neighborhood], [city], [state])
      VALUES
      (@idClient, @zipCode, @street, @number, @complement,
       @neighborhood, @city, @state);

      /**
       * @rule {fn-verification-token} Generate verification token
       */
      SET @verificationToken = CONVERT(VARCHAR(255), HASHBYTES('SHA2_256',
        CONCAT(@email, @currentDate, NEWID())), 2);

      INSERT INTO [functional].[emailVerification]
      ([idClient], [token], [generatedDate], [expirationDate], [used])
      VALUES
      (@idClient, @verificationToken, @currentDate, @expirationDate, 0);

      /**
       * @rule {fn-audit-log} Register audit log
       */
      INSERT INTO [functional].[auditLog]
      ([operationType], [operationDate], [ipAddress], [idClient], [details])
      VALUES
      ('ClientRegistration', @currentDate, @ipAddress, @idClient,
       JSON_QUERY((SELECT @email AS email, @cpf AS cpf FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)));

    COMMIT TRAN;

    /**
     * @output {ClientCreated, 1, 1}
     * @column {INTEGER} idClient
     * - Description: Created client identifier
     * @column {VARCHAR(255)} verificationToken
     * - Description: Email verification token
     */
    SELECT
      @idClient AS [idClient],
      @verificationToken AS [verificationToken];

  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0
      ROLLBACK TRAN;

    THROW;
  END CATCH;
END;
GO