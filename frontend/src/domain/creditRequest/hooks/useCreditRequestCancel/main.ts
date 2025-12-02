import { useMutation, useQueryClient } from '@tanstack/react-query';
import { creditRequestService } from '../../services';

export const useCreditRequestCancel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => creditRequestService.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-requests'] });
      queryClient.invalidateQueries({ queryKey: ['credit-requests-stats'] });
      queryClient.invalidateQueries({ queryKey: ['credit-request'] });
    },
  });
};
