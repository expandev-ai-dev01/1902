import { z } from 'zod';
import { creditRequestSchema } from '../validations/creditRequest';

export type CreditRequestFormInput = z.input<typeof creditRequestSchema>;
export type CreditRequestFormOutput = z.output<typeof creditRequestSchema>;
