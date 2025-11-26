import { useMutation } from '@tanstack/react-query';
import { clientService } from '../../services';
import type { ResendVerificationInput } from '../../types';

export const useResendVerification = () => {
  return useMutation({
    mutationFn: (data: ResendVerificationInput) => clientService.resendVerification(data),
  });
};
