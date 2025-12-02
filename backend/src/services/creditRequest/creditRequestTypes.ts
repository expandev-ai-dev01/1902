/**
 * @summary
 * Type definitions for credit request management.
 * Defines interfaces for credit request data, creation requests, and responses.
 *
 * @module services/creditRequest/creditRequestTypes
 */

/**
 * @enum PurposeCategory
 * @description Credit purpose categories
 */
export enum PurposeCategory {
  CONSUMO = 'CONSUMO',
  INVESTIMENTO = 'INVESTIMENTO',
  IMOVEL = 'IMÓVEL',
  VEICULO = 'VEÍCULO',
}

/**
 * @enum PaymentTerm
 * @description Payment term options
 */
export enum PaymentTerm {
  UpTo6Months = 'Até 6 meses',
  From6To12Months = '6 a 12 meses',
  From13To24Months = '13 a 24 meses',
  From25To48Months = '25 a 48 meses',
  From49To60Months = '49 a 60 meses',
}

/**
 * @enum PaymentMethod
 * @description Payment method options
 */
export enum PaymentMethod {
  Boleto = 'Boleto',
  CreditCard = 'Cartão de crédito',
  AutomaticDebit = 'Débito automático em conta corrente',
}

/**
 * @enum ProfessionalSituation
 * @description Professional situation options
 */
export enum ProfessionalSituation {
  CLT = 'CLT',
  Autonomo = 'Autônomo',
  Empresario = 'Empresário',
  Aposentado = 'Aposentado',
  FuncionarioPublico = 'Funcionário Público',
  Pensionista = 'Pensionista',
  Estudante = 'Estudante',
  Desempregado = 'Desempregado',
}

/**
 * @enum RequestStatus
 * @description Credit request status values
 */
export enum RequestStatus {
  Rascunho = 'Rascunho',
  AguardandoDocumentacao = 'Aguardando Documentação',
  EmAnalise = 'Em Análise',
  Aprovado = 'Aprovado',
  Reprovado = 'Reprovado',
  Cancelado = 'Cancelado',
  Efetivada = 'Efetivada',
}

/**
 * @interface CreditRequestEntity
 * @description Represents a credit request entity
 */
export interface CreditRequestEntity {
  idCreditRequest: number;
  idClient: number;
  requestNumber: string;
  creditAmount: number;
  purposeCategory: PurposeCategory;
  purposeSubcategory: string;
  paymentTerm: PaymentTerm;
  paymentMethod: PaymentMethod;
  monthlyIncome: number;
  committedIncome: number;
  professionalSituation: ProfessionalSituation;
  bankCode: string;
  branchNumber: string;
  accountNumber: string;
  requestDate: string;
  status: RequestStatus;
  rejectionReason?: string;
  approvedConditions?: {
    approvedAmount: number;
    interestRate: number;
    finalTerm: number;
    installmentValue: number;
  };
  documents?: Array<{
    id: number;
    name: string;
    uploadDate: string;
  }>;
}

/**
 * @interface CreditRequestCreateRequest
 * @description Request parameters for credit request creation
 */
export interface CreditRequestCreateRequest {
  idClient: number;
  creditAmount: number;
  purposeCategory: PurposeCategory;
  purposeSubcategory: string;
  paymentTerm: PaymentTerm;
  paymentMethod: PaymentMethod;
  monthlyIncome: number;
  committedIncome: number;
  professionalSituation: ProfessionalSituation;
  bankCode: string;
  branchNumber: string;
  accountNumber: string;
}

/**
 * @interface CreditRequestCreateResponse
 * @description Response data from credit request creation
 */
export interface CreditRequestCreateResponse {
  idCreditRequest: number;
  requestNumber: string;
}

/**
 * @interface CreditRequestListFilters
 * @description Filters for listing credit requests
 */
export interface CreditRequestListFilters {
  status?: RequestStatus[];
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
  page?: number;
  pageSize?: number;
}

/**
 * @interface CreditRequestListResponse
 * @description Response for paginated list of credit requests
 */
export interface CreditRequestListResponse {
  data: CreditRequestEntity[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * @interface CreditRequestStats
 * @description Statistics for credit requests
 */
export interface CreditRequestStats {
  total: number;
  byStatus: Record<RequestStatus, number>;
}
