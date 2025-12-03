import { useQuery } from '@tanstack/react-query';
import { documentService } from '../../services';

export const useDocumentList = (idCreditRequest: number) => {
  return useQuery({
    queryKey: ['documents', idCreditRequest],
    queryFn: () => documentService.list(idCreditRequest),
    enabled: !!idCreditRequest && !isNaN(idCreditRequest),
  });
};
