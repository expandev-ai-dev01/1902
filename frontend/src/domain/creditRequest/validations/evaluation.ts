import { z } from 'zod';

export const approveProposalSchema = z.object({
  approvedAmount: z
    .number({ message: 'Valor aprovado é obrigatório' })
    .positive('O valor deve ser positivo'),
  interestRate: z
    .number({ message: 'Taxa de juros é obrigatória' })
    .positive('A taxa deve ser positiva'),
  finalTerm: z
    .number({ message: 'Prazo é obrigatório' })
    .int('O prazo deve ser um número inteiro')
    .positive('O prazo deve ser positivo'),
});

export const rejectProposalSchema = z.object({
  rejectionReason: z
    .string({ message: 'Justificativa é obrigatória' })
    .min(20, 'A justificativa deve ter no mínimo 20 caracteres')
    .max(1000, 'A justificativa deve ter no máximo 1000 caracteres'),
});

export const returnProposalSchema = z.object({
  documentsToCorrect: z
    .array(z.number().int())
    .min(1, 'Selecione ao menos um documento para correção'),
  correctionInstructions: z
    .string({ message: 'Instruções são obrigatórias' })
    .min(20, 'As instruções devem ter no mínimo 20 caracteres')
    .max(1000, 'As instruções devem ter no máximo 1000 caracteres'),
});
