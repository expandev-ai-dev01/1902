import { useMutation } from '@tanstack/react-query';
import { addressService } from '../../services';

export const useAddressLookup = () => {
  return useMutation({
    mutationFn: (zipCode: string) => addressService.fetchAddressByZipCode(zipCode),
  });
};
