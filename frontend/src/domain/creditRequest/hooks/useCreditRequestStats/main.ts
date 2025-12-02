import { useQuery } from '@tanstack/react-query';
import { creditRequestService } from '../../services';

export const useCreditRequestStats = () => {
  return useQuery({
    queryKey: ['credit-requests-stats'],
    queryFn: () => creditRequestService.getStats(),
    refetchInterval: 30000, // Polling every 30s
  });
};
