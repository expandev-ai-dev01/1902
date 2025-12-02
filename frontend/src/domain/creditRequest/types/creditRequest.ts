export type RequestStatus =
  | 'Rascunho'
  | 'Aguardando Documentação'
  | 'Em Análise'
  | 'Aprovado'
  | 'Reprovado'
  | 'Cancelado'
  | 'Efetivada';

export interface CreditRequest {
  idCreditRequest: number;
  idClient: number;
  creditAmount: number;
  purposeCategory: 'CONSUMO' | 'INVESTIMENTO' | 'IMÓVEL' | 'VEÍCULO';
  purposeSubcategory: string;
  paymentTerm: string;
  paymentMethod: string;
  monthlyIncome: number;
  committedIncome: number;
  professionalSituation: string;
  bankCode: string;
  branchNumber: string;
  accountNumber: string;
  status: RequestStatus;
  requestDate: string;
  requestNumber: string;
  rejectionReason?: string;
  approvedConditions?: {
    approvedAmount: number;
    interestRate: number;
    finalTerm: number;
    installmentValue: number;
  };
  documents?: Array<{
    id: string;
    name: string;
    uploadedAt: string;
  }>;
}

export interface CreditRequestResponse {
  idCreditRequest: number;
  requestNumber: string;
}

export interface CreditRequestListParams {
  page?: number;
  pageSize?: number;
  status?: RequestStatus[];
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
}

export interface CreditRequestListResponse {
  data: CreditRequest[];
  page: number;
  pageSize: number;
  total: number;
}

export interface CreditRequestStats {
  total: number;
  byStatus: Record<RequestStatus, number>;
}
