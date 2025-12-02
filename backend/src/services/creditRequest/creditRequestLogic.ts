/**
 * @summary
 * Business logic for credit request creation and management.
 * Handles validation, data transformation, and request processing.
 *
 * @module services/creditRequest/creditRequestLogic
 */

import {
  CreditRequestCreateRequest,
  CreditRequestCreateResponse,
  CreditRequestEntity,
  PurposeCategory,
  PaymentTerm,
  PaymentMethod,
  ProfessionalSituation,
  RequestStatus,
} from './creditRequestTypes';

/**
 * @summary
 * In-memory storage for credit requests (temporary implementation)
 */
const creditRequests: CreditRequestEntity[] = [];
let nextId = 1;
let requestSequence = 1;

/**
 * @summary
 * Generate unique request number
 */
function generateRequestNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const sequence = String(requestSequence++).padStart(5, '0');
  return `CR-${dateStr}-${sequence}`;
}

/**
 * @summary
 * Validate subcategory matches category
 */
function validateSubcategory(category: PurposeCategory, subcategory: string): boolean {
  const validSubcategories: Record<PurposeCategory, string[]> = {
    CONSUMO: [
      'Pagamento de dívidas',
      'Despesas pessoais/familiares',
      'Emergência médica',
      'Viagem/Lazer',
      'Eletrodomésticos/Móveis',
    ],
    INVESTIMENTO: [
      'Negócio próprio',
      'Educação/Cursos',
      'Reforma/Construção',
      'Equipamentos profissionais',
      'Capital de giro',
    ],
    IMÓVEL: [
      'Compra de imóvel residencial',
      'Compra de imóvel comercial',
      'Reforma/Ampliação',
      'Entrada/Sinal',
      'Quitação de financiamento',
    ],
    VEÍCULO: [
      'Compra de carro',
      'Compra de moto',
      'Veículo comercial/trabalho',
      'Entrada/Sinal',
      'Quitação de financiamento',
    ],
  };

  return validSubcategories[category]?.includes(subcategory) || false;
}

/**
 * @summary
 * Creates a new credit request
 *
 * @function creditRequestCreate
 * @module services/creditRequest/creditRequestLogic
 *
 * @param {CreditRequestCreateRequest} params - Credit request parameters
 *
 * @returns {Promise<CreditRequestCreateResponse>} Created request data
 *
 * @throws {Error} When validation fails or client not found
 */
export async function creditRequestCreate(
  params: CreditRequestCreateRequest
): Promise<CreditRequestCreateResponse> {
  /**
   * @validation Client existence check (simulated)
   */
  if (params.idClient <= 0) {
    throw new Error('clientNotFound');
  }

  /**
   * @validation Email verification check (simulated)
   * In production, this would check the actual client record
   */
  // Simulated: assume client with ID > 0 is verified

  /**
   * @validation Committed income validation
   */
  if (params.committedIncome > params.monthlyIncome) {
    throw new Error('committedIncomeExceedsMonthlyIncome');
  }

  /**
   * @validation Subcategory matches category
   */
  if (!validateSubcategory(params.purposeCategory, params.purposeSubcategory)) {
    throw new Error('purposeSubcategoryInvalid');
  }

  /**
   * @rule {fn-credit-request-creation} Create credit request record
   */
  const requestNumber = generateRequestNumber();
  const idCreditRequest = nextId++;

  const creditRequest: CreditRequestEntity = {
    idCreditRequest,
    idClient: params.idClient,
    requestNumber,
    creditAmount: params.creditAmount,
    purposeCategory: params.purposeCategory,
    purposeSubcategory: params.purposeSubcategory,
    paymentTerm: params.paymentTerm,
    paymentMethod: params.paymentMethod,
    monthlyIncome: params.monthlyIncome,
    committedIncome: params.committedIncome,
    professionalSituation: params.professionalSituation,
    bankCode: params.bankCode,
    branchNumber: params.branchNumber,
    accountNumber: params.accountNumber,
    requestDate: new Date().toISOString(),
    status: RequestStatus.EmAnalise,
  };

  creditRequests.push(creditRequest);

  return {
    idCreditRequest,
    requestNumber,
  };
}

/**
 * @summary
 * Get credit request by ID
 *
 * @function creditRequestGet
 * @module services/creditRequest/creditRequestLogic
 *
 * @param {number} idCreditRequest - Credit request identifier
 *
 * @returns {Promise<CreditRequestEntity | null>} Credit request data or null
 */
export async function creditRequestGet(
  idCreditRequest: number
): Promise<CreditRequestEntity | null> {
  return creditRequests.find((req) => req.idCreditRequest === idCreditRequest) || null;
}

/**
 * @summary
 * List credit requests for a client
 *
 * @function creditRequestList
 * @module services/creditRequest/creditRequestLogic
 *
 * @param {number} idClient - Client identifier
 *
 * @returns {Promise<CreditRequestEntity[]>} List of credit requests
 */
export async function creditRequestList(idClient: number): Promise<CreditRequestEntity[]> {
  return creditRequests.filter((req) => req.idClient === idClient);
}
