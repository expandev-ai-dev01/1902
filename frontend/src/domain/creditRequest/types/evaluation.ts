import { z } from 'zod';
import {
  approveProposalSchema,
  rejectProposalSchema,
  returnProposalSchema,
} from '../validations/evaluation';
import type { CreditRequest } from './creditRequest';
import type { Client } from '@/domain/client/types';

export interface EvaluationDetail extends CreditRequest {
  client: Client;
  history: CreditRequest[];
}

export type ApproveProposalInput = z.input<typeof approveProposalSchema>;
export type ApproveProposalOutput = z.output<typeof approveProposalSchema>;

export type RejectProposalInput = z.input<typeof rejectProposalSchema>;
export type RejectProposalOutput = z.output<typeof rejectProposalSchema>;

export type ReturnProposalInput = z.input<typeof returnProposalSchema>;
export type ReturnProposalOutput = z.output<typeof returnProposalSchema>;
