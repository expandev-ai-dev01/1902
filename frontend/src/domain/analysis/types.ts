export interface AnalysisProposal {
  idCreditRequest: number;
  proposalNumber: string;
  clientName: string;
  clientCpf: string;
  requestDate: string;
  requestedAmount: number;
  desiredTerm: number;
  slaIndicator: 'Green' | 'Yellow' | 'Orange' | 'Red' | 'Black';
  waitTime: number;
  priorityScore: number;
  status: string;
}

export interface AnalysisQueueListParams {
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  searchTerm?: string;
}

export interface AnalysisQueueListResponse {
  data: AnalysisProposal[];
  page: number;
  pageSize: number;
  total: number;
  filteredTotal: number;
}
