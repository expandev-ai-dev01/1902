import { useMutation, useQueryClient } from '@tanstack/react-query';
import { analysisService } from '../../services';

export const useLockProposal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => analysisService.lock(id),
    onSuccess: () => {
      // Invalidate the queue to remove the locked item from the list
      queryClient.invalidateQueries({ queryKey: ['analysis-queue'] });
    },
  });
};
