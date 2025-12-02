export interface CreditRequest {
  idCreditRequest: string;
  idClient: string;
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
  status: string;
  requestDate: string;
  requestNumber: string;
}

export interface CreditRequestResponse {
  idCreditRequest: number;
  requestNumber: string;
}
