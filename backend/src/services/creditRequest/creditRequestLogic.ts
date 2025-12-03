/**
 * @summary
 * Business logic for credit request creation and management.
 * Handles validation, data transformation, and request processing.
 *
 * @module services/creditRequest/creditRequestLogic
 */

import { getClientById } from '@/services/client';
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
  AnalysisQueueFilters,
  AnalysisQueueResponse,
  AnalysisQueueItem,
  CreditRequestApproveParams,
  CreditRequestRejectParams,
  CreditRequestReturnParams,
  CreditRequestDetailResponse,
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
 * Calculate SLA indicator color based on wait time
 */
function calculateSLA(waitTimeMinutes: number): string {
  if (waitTimeMinutes <= 30) return 'Green';
  if (waitTimeMinutes <= 42) return 'Yellow';
  if (waitTimeMinutes <= 51) return 'Orange';
  if (waitTimeMinutes <= 60) return 'Red';
  return 'Black';
}

/**
 * @summary
 * Calculate priority score based on wait time and amount
 */
function calculatePriority(waitTimeMinutes: number, amount: number): number {
  if (waitTimeMinutes < 30) return amount;
  return 1000000;
}

/**
 * @summary
 * Calculate installment value using PMT formula
 */
function calculateInstallment(amount: number, rate: number, months: number): number {
  if (rate === 0) return amount / months;
  const i = rate / 100;
  return (amount * i * Math.pow(1 + i, months)) / (Math.pow(1 + i, months) - 1);
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
    status: RequestStatus.AguardandoDocumentacao,
    documents: [],
    lockStatus: false,
    lockedBy: undefined,
    lockTimestamp: undefined,
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

/**
 * @summary
 * Retrieves the analysis queue with priority sorting and filtering
 *
 * @function getAnalysisQueue
 * @module services/creditRequest/creditRequestLogic
 *
 * @param {AnalysisQueueFilters} filters - Filter parameters
 * @param {number} analystId - ID of the analyst requesting the queue
 *
 * @returns {Promise<AnalysisQueueResponse>} Paginated analysis queue
 */
export async function getAnalysisQueue(
  filters: AnalysisQueueFilters,
  analystId: number
): Promise<AnalysisQueueResponse> {
  // 1. Filter by status 'Em Análise' and not locked by others
  let queue = creditRequests.filter((req) => {
    if (req.status !== RequestStatus.EmAnalise) return false;
    if (req.lockStatus && req.lockedBy !== analystId) return false;
    return true;
  });

  // 2. Apply Advanced Filters
  if (filters.startDate) {
    const start = new Date(filters.startDate);
    queue = queue.filter((req) => new Date(req.requestDate) >= start);
  }
  if (filters.endDate) {
    const end = new Date(filters.endDate);
    end.setHours(23, 59, 59, 999);
    queue = queue.filter((req) => new Date(req.requestDate) <= end);
  }
  if (filters.minAmount) {
    queue = queue.filter((req) => req.creditAmount >= filters.minAmount!);
  }
  if (filters.maxAmount) {
    queue = queue.filter((req) => req.creditAmount <= filters.maxAmount!);
  }
  if (filters.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    queue = queue.filter((req) => {
      const client = getClientById(req.idClient);
      const cpf = client?.cpf || '';
      return req.requestNumber.toLowerCase().includes(term) || cpf.includes(term);
    });
  }

  // 3. Calculate Priority and SLA for sorting
  const now = new Date();
  const enrichedQueue: AnalysisQueueItem[] = queue.map((req) => {
    const requestDate = new Date(req.requestDate);
    const waitTime = Math.floor((now.getTime() - requestDate.getTime()) / 60000);
    const priorityScore = calculatePriority(waitTime, req.creditAmount);
    const slaIndicator = calculateSLA(waitTime);
    const client = getClientById(req.idClient);

    return {
      ...req,
      waitTime,
      priorityScore,
      slaIndicator,
      clientName: client?.fullName || 'Unknown',
      clientCpf: client?.cpf || 'Unknown',
    };
  });

  // 4. Sort by Priority (Desc) then Date (Asc)
  enrichedQueue.sort((a, b) => {
    if (b.priorityScore !== a.priorityScore) {
      return b.priorityScore - a.priorityScore;
    }
    return new Date(a.requestDate).getTime() - new Date(b.requestDate).getTime();
  });

  // 5. Pagination
  const total = creditRequests.filter((req) => req.status === RequestStatus.EmAnalise).length;
  const filteredTotal = enrichedQueue.length;
  const page = filters.page || 1;
  const pageSize = filters.pageSize || 10;
  const start = (page - 1) * pageSize;
  const paginatedData = enrichedQueue.slice(start, start + pageSize);

  return {
    data: paginatedData,
    total,
    filteredTotal,
    page,
    pageSize,
  };
}

/**
 * @summary
 * Locks a credit request for analysis
 *
 * @function lockCreditRequest
 * @module services/creditRequest/creditRequestLogic
 *
 * @param {number} idCreditRequest - Request identifier
 * @param {number} analystId - Analyst identifier
 *
 * @returns {Promise<void>}
 * @throws {Error} If request not found or already locked by another analyst
 */
export async function lockCreditRequest(idCreditRequest: number, analystId: number): Promise<void> {
  const request = creditRequests.find((req) => req.idCreditRequest === idCreditRequest);

  if (!request) {
    throw new Error('requestNotFound');
  }

  if (request.lockStatus && request.lockedBy !== analystId) {
    throw new Error('proposalAlreadyLocked');
  }

  request.lockStatus = true;
  request.lockedBy = analystId;
  request.lockTimestamp = new Date().toISOString();
}

/**
 * @summary
 * Retrieves detailed credit request information for analysis
 *
 * @function creditRequestGetDetail
 * @module services/creditRequest/creditRequestLogic
 *
 * @param {number} idCreditRequest - Request identifier
 * @param {number} analystId - Analyst identifier
 *
 * @returns {Promise<CreditRequestDetailResponse>}
 * @throws {Error} If request not found
 */
export async function creditRequestGetDetail(
  idCreditRequest: number,
  analystId: number
): Promise<CreditRequestDetailResponse> {
  const request = creditRequests.find((req) => req.idCreditRequest === idCreditRequest);

  if (!request) {
    throw new Error('requestNotFound');
  }

  // In a real scenario, we might enforce that the analyst has locked the request
  // but for viewing details, we might allow it if it's not locked by someone else
  // or if it's just for viewing.

  const client = getClientById(request.idClient);
  const history = creditRequests
    .filter((req) => req.idClient === request.idClient && req.idCreditRequest !== idCreditRequest)
    .sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());

  return {
    ...request,
    clientData: client,
    history,
  };
}

/**
 * @summary
 * Approves a credit request
 *
 * @function creditRequestApprove
 * @module services/creditRequest/creditRequestLogic
 *
 * @param {CreditRequestApproveParams} params - Approval parameters
 *
 * @returns {Promise<void>}
 * @throws {Error} If request not found, not locked by analyst, or invalid status
 */
export async function creditRequestApprove(params: CreditRequestApproveParams): Promise<void> {
  const request = creditRequests.find((req) => req.idCreditRequest === params.idCreditRequest);

  if (!request) {
    throw new Error('requestNotFound');
  }

  if (request.lockedBy !== params.analystId) {
    throw new Error('proposalNotLockedByAnalyst');
  }

  if (request.status !== RequestStatus.EmAnalise) {
    throw new Error('invalidStatusForApproval');
  }

  if (params.approvedAmount > request.creditAmount) {
    throw new Error('approvedAmountExceedsRequested');
  }

  const installmentValue = calculateInstallment(
    params.approvedAmount,
    params.interestRate,
    params.finalTerm
  );

  request.status = RequestStatus.Aprovado;
  request.approvedConditions = {
    approvedAmount: params.approvedAmount,
    interestRate: params.interestRate,
    finalTerm: params.finalTerm,
    installmentValue,
  };
  request.analysisCompletionDate = new Date().toISOString();

  // Unlock
  request.lockStatus = false;
  request.lockedBy = undefined;
  request.lockTimestamp = undefined;
}

/**
 * @summary
 * Rejects a credit request
 *
 * @function creditRequestReject
 * @module services/creditRequest/creditRequestLogic
 *
 * @param {CreditRequestRejectParams} params - Rejection parameters
 *
 * @returns {Promise<void>}
 * @throws {Error} If request not found, not locked by analyst, or invalid status
 */
export async function creditRequestReject(params: CreditRequestRejectParams): Promise<void> {
  const request = creditRequests.find((req) => req.idCreditRequest === params.idCreditRequest);

  if (!request) {
    throw new Error('requestNotFound');
  }

  if (request.lockedBy !== params.analystId) {
    throw new Error('proposalNotLockedByAnalyst');
  }

  if (request.status !== RequestStatus.EmAnalise) {
    throw new Error('invalidStatusForRejection');
  }

  request.status = RequestStatus.Reprovado;
  request.rejectionReason = params.rejectionReason;
  request.analysisCompletionDate = new Date().toISOString();

  // Unlock
  request.lockStatus = false;
  request.lockedBy = undefined;
  request.lockTimestamp = undefined;
}

/**
 * @summary
 * Returns a credit request for correction
 *
 * @function creditRequestReturn
 * @module services/creditRequest/creditRequestLogic
 *
 * @param {CreditRequestReturnParams} params - Return parameters
 *
 * @returns {Promise<void>}
 * @throws {Error} If request not found, not locked by analyst, or invalid status
 */
export async function creditRequestReturn(params: CreditRequestReturnParams): Promise<void> {
  const request = creditRequests.find((req) => req.idCreditRequest === params.idCreditRequest);

  if (!request) {
    throw new Error('requestNotFound');
  }

  if (request.lockedBy !== params.analystId) {
    throw new Error('proposalNotLockedByAnalyst');
  }

  if (request.status !== RequestStatus.EmAnalise) {
    throw new Error('invalidStatusForReturn');
  }

  request.status = RequestStatus.AguardandoDocumentacao;
  request.documentsToCorrect = params.documentsToCorrect;
  request.correctionInstructions = params.correctionInstructions;
  request.analysisCompletionDate = new Date().toISOString();

  // Unlock
  request.lockStatus = false;
  request.lockedBy = undefined;
  request.lockTimestamp = undefined;
}
