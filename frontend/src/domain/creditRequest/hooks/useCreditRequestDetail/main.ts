import { useQuery } from '@tanstack/react-query';
import { creditRequestService } from '../../services';

export const useCreditRequestDetail = (id: number) => {
  return useQuery({
    queryKey: ['credit-request', id],
    queryFn: () => creditRequestService.getById(id),
    enabled: !!id,
  });
};
