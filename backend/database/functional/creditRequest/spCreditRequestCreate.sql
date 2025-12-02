/**
 * @summary
 * Creates a new credit request with all required information.
 * Validates business rules and generates unique request number.
 *
 * @procedure spCreditRequestCreate
 * @schema functional
 * @type stored-procedure
 *
 * @endpoints
 * - POST /api/v1/internal/credit-request
 *
 * @parameters
 * @param {INTEGER} idClient
 *   - Required: Yes
 *   - Description: Client identifier
 *
 * @param {DECIMAL(15,2)} creditAmount
 *   - Required: Yes
 *   - Description: Requested credit amount
 *
 * @param {VARCHAR(50)} purposeCategory
 *   - Required: Yes
 *   - Description: Purpose category (CONSUMO, INVESTIMENTO, IMÓVEL, VEÍCULO)
 *
 * @param {VARCHAR(100)} purposeSubcategory
 *   - Required: Yes
 *   - Description: Purpose subcategory
 *
 * @param {VARCHAR(50)} paymentTerm
 *   - Required: Yes
 *   - Description: Payment term
 *
 * @param {VARCHAR(50)} paymentMethod
 *   - Required: Yes
 *   - Description: Payment method
 *
 * @param {DECIMAL(15,2)} monthlyIncome
 *   - Required: Yes
 *   - Description: Client monthly income
 *
 * @param {DECIMAL(15,2)} committedIncome
 *   - Required: Yes
 *   - Description: Income committed to other loans
 *
 * @param {VARCHAR(50)} professionalSituation
 *   - Required: Yes
 *   - Description: Professional situation
 *
 * @param {VARCHAR(3)} bankCode
 *   - Required: Yes
 *   - Description: Bank code (3 digits)
 *
 * @param {VARCHAR(5)} branchNumber
 *   - Required: Yes
 *   - Description: Branch number
 *
 * @param {VARCHAR(12)} accountNumber
 *   - Required: Yes
 *   - Description: Account number
 *
 * @returns {INTEGER} idCreditRequest - Created request identifier
 * @returns {VARCHAR(50)} requestNumber - Generated request number
 *
 * @testScenarios
 * - Valid credit request creation
 * - Committed income validation (cannot exceed monthly income)
 * - Client existence validation
 * - Email verification requirement
 */
CREATE OR ALTER PROCEDURE [functional].[spCreditRequestCreate]
  @idClient INTEGER,
  @creditAmount DECIMAL(15, 2),
  @purposeCategory VARCHAR(50),
  @purposeSubcategory VARCHAR(100),
  @paymentTerm VARCHAR(50),
  @paymentMethod VARCHAR(50),
  @monthlyIncome DECIMAL(15, 2),
  @committedIncome DECIMAL(15, 2),
  @professionalSituation VARCHAR(50),
  @bankCode VARCHAR(3),
  @branchNumber VARCHAR(5),
  @accountNumber VARCHAR(12)
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @idCreditRequest INTEGER;
  DECLARE @requestNumber VARCHAR(50);
  DECLARE @currentDate DATETIME2 = GETUTCDATE();
  DECLARE @emailVerified BIT;

  BEGIN TRY
    /**
     * @validation Client existence and email verification check
     * @throw {clientNotFound}
     * @throw {emailNotVerified}
     */
    SELECT @emailVerified = [cli].[emailVerified]
    FROM [functional].[client] cli
    WHERE [cli].[idClient] = @idClient;

    IF @emailVerified IS NULL
    BEGIN
      ;THROW 51000, 'clientNotFound', 1;
    END;

    IF @emailVerified = 0
    BEGIN
      ;THROW 51000, 'emailNotVerified', 1;
    END;

    /**
     * @validation Committed income validation
     * @throw {committedIncomeExceedsMonthlyIncome}
     */
    IF @committedIncome > @monthlyIncome
    BEGIN
      ;THROW 51000, 'committedIncomeExceedsMonthlyIncome', 1;
    END;

    /**
     * @rule {fn-credit-request-creation} Create credit request
     */
    BEGIN TRAN;

      /**
       * @rule {fn-request-number-generation} Generate unique request number
       */
      SET @requestNumber = 'CR-' + FORMAT(@currentDate, 'yyyyMMdd') + '-' + 
        RIGHT('00000' + CAST(NEXT VALUE FOR [functional].[seqCreditRequest] AS VARCHAR(5)), 5);

      INSERT INTO [functional].[creditRequest]
      ([idClient], [requestNumber], [creditAmount], [purposeCategory], [purposeSubcategory],
       [paymentTerm], [paymentMethod], [monthlyIncome], [committedIncome],
       [professionalSituation], [bankCode], [branchNumber], [accountNumber],
       [requestDate], [status])
      VALUES
      (@idClient, @requestNumber, @creditAmount, @purposeCategory, @purposeSubcategory,
       @paymentTerm, @paymentMethod, @monthlyIncome, @committedIncome,
       @professionalSituation, @bankCode, @branchNumber, @accountNumber,
       @currentDate, 'Em Análise');

      SET @idCreditRequest = SCOPE_IDENTITY();

      /**
       * @rule {fn-audit-log} Register audit log
       */
      INSERT INTO [functional].[auditLog]
      ([operationType], [operationDate], [ipAddress], [idClient], [details])
      VALUES
      ('CreditRequestCreation', @currentDate, '', @idClient,
       JSON_QUERY((SELECT @requestNumber AS requestNumber, @creditAmount AS creditAmount FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)));

    COMMIT TRAN;

    /**
     * @output {CreditRequestCreated, 1, 1}
     * @column {INTEGER} idCreditRequest
     * - Description: Created request identifier
     * @column {VARCHAR(50)} requestNumber
     * - Description: Generated request number
     */
    SELECT
      @idCreditRequest AS [idCreditRequest],
      @requestNumber AS [requestNumber];

  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0
      ROLLBACK TRAN;

    THROW;
  END CATCH;
END;
GO

/**
 * @sequence seqCreditRequest
 * @description Sequence for generating credit request numbers
 */
CREATE SEQUENCE [functional].[seqCreditRequest]
  START WITH 1
  INCREMENT BY 1
  MINVALUE 1
  MAXVALUE 99999
  CYCLE;
GO