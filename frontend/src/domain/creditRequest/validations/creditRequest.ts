import { z } from 'zod';

const PURPOSE_CATEGORIES = ['CONSUMO', 'INVESTIMENTO', 'IMÓVEL', 'VEÍCULO'] as const;

const PAYMENT_TERMS = [
  'Até 6 meses',
  '6 a 12 meses',
  '13 a 24 meses',
  '25 a 48 meses',
  '49 a 60 meses',
] as const;

const PAYMENT_METHODS = [
  'Boleto',
  'Cartão de crédito',
  'Débito automático em conta corrente',
] as const;

const PROFESSIONAL_SITUATIONS = [
  'CLT',
  'Autônomo',
  'Empresário',
  'Aposentado',
  'Funcionário Público',
  'Pensionista',
  'Estudante',
  'Desempregado',
] as const;

const SUBCATEGORIES = {
  CONSUMO: [
    'Pagamento de dívidas',
    'Despesas pessoais/familiares',
    'Emergência médica',
    'Viagem/Lazer',
    'Eletrodomésticos/Móveis',
  ],
  INVESTIMENTO: [
    'Negócio próprio',
    'Educação/Cursos',
    'Reforma/Construção',
    'Equipamentos profissionais',
    'Capital de giro',
  ],
  IMÓVEL: [
    'Compra de imóvel residencial',
    'Compra de imóvel comercial',
    'Reforma/Ampliação',
    'Entrada/Sinal',
    'Quitação de financiamento',
  ],
  VEÍCULO: [
    'Compra de carro',
    'Compra de moto',
    'Veículo comercial/trabalho',
    'Entrada/Sinal',
    'Quitação de financiamento',
  ],
} as const;

export const creditRequestSchema = z
  .object({
    creditAmount: z
      .number('O valor do crédito deve ser um número positivo')
      .positive('O valor do crédito deve ser um número positivo')
      .refine((val) => Number.isFinite(val), 'Valor do crédito inválido'),
    purposeCategory: z.enum(PURPOSE_CATEGORIES, 'Selecione uma categoria de finalidade'),
    purposeSubcategory: z
      .string('Selecione uma subcategoria de finalidade')
      .min(1, 'Selecione uma subcategoria de finalidade'),
    paymentTerm: z.enum(PAYMENT_TERMS, 'Selecione um prazo de pagamento'),
    paymentMethod: z.enum(PAYMENT_METHODS, 'Selecione uma forma de pagamento'),
    monthlyIncome: z
      .number('A renda mensal deve ser um valor positivo')
      .positive('A renda mensal deve ser um valor positivo')
      .refine((val) => Number.isFinite(val), 'Renda mensal inválida'),
    committedIncome: z
      .number(
        'Informe o valor da sua renda comprometida com outros empréstimos, ou zero caso não possua'
      )
      .min(0, 'A renda comprometida não pode ser negativa')
      .refine((val) => Number.isFinite(val), 'Renda comprometida inválida'),
    professionalSituation: z.enum(PROFESSIONAL_SITUATIONS, 'Selecione sua situação profissional'),
    bankCode: z
      .string('Informe um código de banco válido com 3 dígitos')
      .length(3, 'Informe um código de banco válido com 3 dígitos')
      .regex(/^\d{3}$/, 'Informe um código de banco válido com 3 dígitos'),
    branchNumber: z
      .string('Informe um número de agência válido (apenas números, máximo 5 dígitos)')
      .min(1, 'Informe um número de agência válido (apenas números, máximo 5 dígitos)')
      .max(5, 'Informe um número de agência válido (apenas números, máximo 5 dígitos)')
      .regex(/^\d+$/, 'Informe um número de agência válido (apenas números, máximo 5 dígitos)'),
    accountNumber: z
      .string(
        'Informe um número de conta válido (apenas números e opcionalmente um dígito verificador separado por hífen)'
      )
      .min(
        1,
        'Informe um número de conta válido (apenas números e opcionalmente um dígito verificador separado por hífen)'
      )
      .max(
        12,
        'Informe um número de conta válido (apenas números e opcionalmente um dígito verificador separado por hífen)'
      )
      .regex(
        /^\d+(-\d)?$/,
        'Informe um número de conta válido (apenas números e opcionalmente um dígito verificador separado por hífen)'
      ),
  })
  .refine((data) => data.committedIncome <= data.monthlyIncome, {
    message: 'A renda comprometida não pode ser maior que a renda mensal',
    path: ['committedIncome'],
  });

export {
  SUBCATEGORIES,
  PURPOSE_CATEGORIES,
  PAYMENT_TERMS,
  PAYMENT_METHODS,
  PROFESSIONAL_SITUATIONS,
};
