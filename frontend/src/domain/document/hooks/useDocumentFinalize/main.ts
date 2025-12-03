import { useMutation, useQueryClient } from '@tanstack/react-query';
import { documentService } from '../../services';

export const useDocumentFinalize = (idCreditRequest: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => documentService.finalize(idCreditRequest),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', idCreditRequest] });
      queryClient.invalidateQueries({ queryKey: ['credit-request', idCreditRequest] });
      queryClient.invalidateQueries({ queryKey: ['credit-requests'] });
    },
  });
};
