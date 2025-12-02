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
  CreditRequestListFilters,
  CreditRequestListResponse,
  CreditRequestStats,
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
    documents: [],
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
 * @param {number} idClient - Client identifier (for ownership check)
 * @param {number} idCreditRequest - Credit request identifier
 *
 * @returns {Promise<CreditRequestEntity | null>} Credit request data or null
 */
export async function creditRequestGet(
  idClient: number,
  idCreditRequest: number
): Promise<CreditRequestEntity | null> {
  const request = creditRequests.find((req) => req.idCreditRequest === idCreditRequest);

  if (!request) return null;
  if (request.idClient !== idClient) return null;

  return request;
}

/**
 * @summary
 * List credit requests for a client with filters and pagination
 *
 * @function creditRequestList
 * @module services/creditRequest/creditRequestLogic
 *
 * @param {number} idClient - Client identifier
 * @param {CreditRequestListFilters} filters - Filter parameters
 *
 * @returns {Promise<CreditRequestListResponse>} Paginated list of credit requests
 */
export async function creditRequestList(
  idClient: number,
  filters: CreditRequestListFilters = {}
): Promise<CreditRequestListResponse> {
  let filtered = creditRequests.filter((req) => req.idClient === idClient);

  // Apply Status Filter
  if (filters.status && filters.status.length > 0) {
    filtered = filtered.filter((req) => filters.status!.includes(req.status));
  }

  // Apply Date Range Filter
  if (filters.startDate) {
    const start = new Date(filters.startDate);
    filtered = filtered.filter((req) => new Date(req.requestDate) >= start);
  }
  if (filters.endDate) {
    const end = new Date(filters.endDate);
    // Adjust end date to include the full day
    end.setHours(23, 59, 59, 999);
    filtered = filtered.filter((req) => new Date(req.requestDate) <= end);
  }

  // Apply Search Filter
  if (filters.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    filtered = filtered.filter((req) => req.requestNumber.toLowerCase().includes(term));
  }

  // Sort by Date Descending
  filtered.sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());

  // Pagination
  const page = filters.page || 1;
  const pageSize = filters.pageSize || 10;
  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const paginatedData = filtered.slice(start, start + pageSize);

  return {
    data: paginatedData,
    total,
    page,
    pageSize,
  };
}

/**
 * @summary
 * Get credit request statistics for a client
 *
 * @function creditRequestGetStats
 * @module services/creditRequest/creditRequestLogic
 *
 * @param {number} idClient - Client identifier
 *
 * @returns {Promise<CreditRequestStats>} Statistics object
 */
export async function creditRequestGetStats(idClient: number): Promise<CreditRequestStats> {
  const clientRequests = creditRequests.filter((req) => req.idClient === idClient);

  const byStatus = clientRequests.reduce((acc, req) => {
    acc[req.status] = (acc[req.status] || 0) + 1;
    return acc;
  }, {} as Record<RequestStatus, number>);

  // Ensure all statuses are present with 0 if no requests
  Object.values(RequestStatus).forEach((status) => {
    if (!byStatus[status]) byStatus[status] = 0;
  });

  return {
    total: clientRequests.length,
    byStatus,
  };
}

/**
 * @summary
 * Cancel a credit request
 *
 * @function creditRequestCancel
 * @module services/creditRequest/creditRequestLogic
 *
 * @param {number} idClient - Client identifier
 * @param {number} idCreditRequest - Request identifier
 *
 * @returns {Promise<boolean>} True if cancelled successfully
 *
 * @throws {Error} If request not found or cannot be cancelled
 */
export async function creditRequestCancel(
  idClient: number,
  idCreditRequest: number
): Promise<boolean> {
  const request = creditRequests.find((req) => req.idCreditRequest === idCreditRequest);

  if (!request || request.idClient !== idClient) {
    throw new Error('requestNotFound');
  }

  const cancellableStatuses = [
    RequestStatus.Rascunho,
    RequestStatus.AguardandoDocumentacao,
    RequestStatus.EmAnalise,
  ];

  if (!cancellableStatuses.includes(request.status)) {
    throw new Error('requestCannotBeCancelled');
  }

  request.status = RequestStatus.Cancelado;
  return true;
}
