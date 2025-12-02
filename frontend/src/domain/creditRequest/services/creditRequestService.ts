import { authenticatedClient } from '@/core/lib/api';
import type { CreditRequestFormOutput, CreditRequestResponse } from '../types';

export const creditRequestService = {
  async create(data: CreditRequestFormOutput): Promise<CreditRequestResponse> {
    const response = await authenticatedClient.post('/credit-request', data);
    return response.data.data;
  },
};
