import { publicClient } from '@/core/lib/api';
import type { ClientRegisterOutput, ResendVerificationInput } from '../types';

export const clientService = {
  async register(
    data: ClientRegisterOutput
  ): Promise<{ idClient: number; verificationToken: string }> {
    const response = await publicClient.post('/client/register', data);
    return response.data.data;
  },

  async verifyEmail(token: string): Promise<{ idClient: number; email: string }> {
    const response = await publicClient.get('/client/verify-email', {
      params: { token },
    });
    return response.data.data;
  },

  async resendVerification(data: ResendVerificationInput): Promise<{ verificationToken: string }> {
    const response = await publicClient.post('/client/resend-verification', data);
    return response.data.data;
  },
};
