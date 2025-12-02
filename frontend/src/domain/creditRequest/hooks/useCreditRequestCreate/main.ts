import { useMutation } from '@tanstack/react-query';
import { creditRequestService } from '../../services';
import type { CreditRequestFormOutput } from '../../types';

export const useCreditRequestCreate = () => {
  return useMutation({
    mutationFn: (data: CreditRequestFormOutput) => creditRequestService.create(data),
  });
};
