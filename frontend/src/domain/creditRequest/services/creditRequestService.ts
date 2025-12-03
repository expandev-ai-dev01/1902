import { authenticatedClient } from '@/core/lib/api';
import type {
  CreditRequestFormOutput,
  CreditRequestResponse,
  CreditRequestListParams,
  CreditRequestListResponse,
  CreditRequestStats,
  CreditRequest,
  EvaluationDetail,
  ApproveProposalOutput,
  RejectProposalOutput,
  ReturnProposalOutput,
} from '../types';

export const creditRequestService = {
  async create(data: CreditRequestFormOutput): Promise<CreditRequestResponse> {
    const response = await authenticatedClient.post('/credit-request', data);
    return response.data.data;
  },

  async list(params?: CreditRequestListParams): Promise<CreditRequestListResponse> {
    const response = await authenticatedClient.get('/credit-request', {
      params: {
        ...params,
        status: params?.status?.join(','),
      },
    });
    return response.data.data;
  },

  async getStats(): Promise<CreditRequestStats> {
    const response = await authenticatedClient.get('/credit-request/stats');
    return response.data.data;
  },

  async getById(id: number): Promise<CreditRequest> {
    const response = await authenticatedClient.get(`/credit-request/${id}`);
    return response.data.data;
  },

  async cancel(id: number): Promise<void> {
    await authenticatedClient.post(`/credit-request/${id}/cancel`);
  },

  async downloadReceipt(id: number): Promise<{ downloadUrl: string }> {
    const response = await authenticatedClient.get(`/credit-request/${id}/receipt`);
    return response.data.data;
  },

  async exportHistory(params?: CreditRequestListParams): Promise<{ downloadUrl: string }> {
    const response = await authenticatedClient.get('/credit-request/export', {
      params: {
        ...params,
        status: params?.status?.join(','),
      },
    });
    return response.data.data;
  },

  async getEvaluationDetail(id: number): Promise<EvaluationDetail> {
    const response = await authenticatedClient.get(`/credit-request/${id}/evaluation-detail`);
    return response.data.data;
  },

  async approve(id: number, data: ApproveProposalOutput): Promise<void> {
    await authenticatedClient.post(`/credit-request/${id}/approve`, data);
  },

  async reject(id: number, data: RejectProposalOutput): Promise<void> {
    await authenticatedClient.post(`/credit-request/${id}/reject`, data);
  },

  async return(id: number, data: ReturnProposalOutput): Promise<void> {
    await authenticatedClient.post(`/credit-request/${id}/return`, data);
  },
};
