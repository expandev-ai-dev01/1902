import { useMutation, useQueryClient } from '@tanstack/react-query';
import { documentService } from '../../services';

export const useDocumentDelete = (idCreditRequest: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (idDocument: number) => documentService.delete(idCreditRequest, idDocument),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', idCreditRequest] });
      queryClient.invalidateQueries({ queryKey: ['credit-request', idCreditRequest] });
    },
  });
};
