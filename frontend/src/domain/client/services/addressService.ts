import axios from 'axios';
import type { AddressData } from '../types';

export const addressService = {
  async fetchAddressByZipCode(zipCode: string): Promise<AddressData> {
    const response = await axios.get(`https://viacep.com.br/ws/${zipCode}/json/`);

    if (response.data.erro) {
      throw new Error('CEP não encontrado');
    }

    return response.data;
  },
};
