import { useQuery } from '@tanstack/react-query';
import { analysisService } from '../../services';
import type { AnalysisQueueListParams } from '../../types';

export const useAnalysisQueue = (params: AnalysisQueueListParams, refreshInterval = 60000) => {
  return useQuery({
    queryKey: ['analysis-queue', params],
    queryFn: () => analysisService.list(params),
    refetchInterval: refreshInterval,
    placeholderData: (previousData) => previousData,
  });
};
