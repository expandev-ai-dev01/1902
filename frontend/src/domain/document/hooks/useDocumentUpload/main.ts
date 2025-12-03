import { useMutation, useQueryClient } from '@tanstack/react-query';
import { documentService } from '../../services';
import type { DocumentUploadOutput } from '../../types';

export const useDocumentUpload = (idCreditRequest: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DocumentUploadOutput) => documentService.upload(idCreditRequest, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', idCreditRequest] });
      queryClient.invalidateQueries({ queryKey: ['credit-request', idCreditRequest] });
    },
  });
};
