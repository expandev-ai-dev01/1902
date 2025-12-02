import { useQuery } from '@tanstack/react-query';
import { creditRequestService } from '../../services';
import type { CreditRequestListParams } from '../../types';

export const useCreditRequestList = (params: CreditRequestListParams) => {
  return useQuery({
    queryKey: ['credit-requests', params],
    queryFn: () => creditRequestService.list(params),
    refetchInterval: 30000, // Polling every 30s as fallback for realtime
  });
};
