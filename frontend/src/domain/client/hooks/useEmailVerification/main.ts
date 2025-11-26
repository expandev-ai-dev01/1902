import { useMutation } from '@tanstack/react-query';
import { clientService } from '../../services';

export const useEmailVerification = () => {
  return useMutation({
    mutationFn: (token: string) => clientService.verifyEmail(token),
  });
};
