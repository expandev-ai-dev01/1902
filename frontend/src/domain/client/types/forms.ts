import { z } from 'zod';
import { clientRegisterSchema } from '../validations/client';

export type ClientRegisterInput = z.input<typeof clientRegisterSchema>;
export type ClientRegisterOutput = z.output<typeof clientRegisterSchema>;

export type ResendVerificationInput = {
  email: string;
};
