import { authenticatedClient } from '@/core/lib/api';
import type { AnalysisQueueListParams, AnalysisQueueListResponse } from '../types';

export const analysisService = {
  /**
   * Lists the analysis queue with pagination and filters.
   */
  async list(params?: AnalysisQueueListParams): Promise<AnalysisQueueListResponse> {
    const response = await authenticatedClient.get('/analysis-queue', {
      params,
    });
    return response.data.data;
  },

  /**
   * Locks a proposal for analysis.
   */
  async lock(id: number): Promise<void> {
    await authenticatedClient.post(`/analysis-queue/${id}/lock`);
  },
};
