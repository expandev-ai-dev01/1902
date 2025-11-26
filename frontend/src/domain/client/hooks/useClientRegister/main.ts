import { useMutation } from '@tanstack/react-query';
import { clientService } from '../../services';
import type { ClientRegisterOutput } from '../../types';

export const useClientRegister = () => {
  return useMutation({
    mutationFn: (data: ClientRegisterOutput) => clientService.register(data),
  });
};
