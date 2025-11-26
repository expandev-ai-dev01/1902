import { z } from 'zod';

const BRAZILIAN_STATES = [
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
] as const;

function validateCPF(cpf: string): boolean {
  cpf = cpf.replace(/[^\d]/g, '');

  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cpf.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cpf.charAt(10))) return false;

  return true;
}

function validateAge(birthDate: string): boolean {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age >= 18;
}

export const clientRegisterSchema = z
  .object({
    fullName: z
      .string('Nome completo é obrigatório')
      .min(5, 'Nome deve ter no mínimo 5 caracteres')
      .max(100, 'Nome deve ter no máximo 100 caracteres')
      .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome não deve conter números ou caracteres especiais')
      .refine((val) => val.trim().split(/\s+/).length >= 2, 'Informe nome e sobrenome'),
    cpf: z
      .string('CPF é obrigatório')
      .length(11, 'CPF deve ter 11 dígitos')
      .regex(/^\d{11}$/, 'CPF deve conter apenas números')
      .refine((val) => validateCPF(val), 'CPF inválido'),
    email: z
      .string('E-mail é obrigatório')
      .email('E-mail inválido')
      .max(100, 'E-mail deve ter no máximo 100 caracteres'),
    phone: z
      .string('Telefone é obrigatório')
      .min(10, 'Telefone deve ter 10 ou 11 dígitos')
      .max(11, 'Telefone deve ter 10 ou 11 dígitos')
      .regex(/^\d{10,11}$/, 'Telefone deve conter apenas números'),
    birthDate: z
      .string('Data de nascimento é obrigatória')
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida')
      .refine((val) => !isNaN(Date.parse(val)), 'Data inválida')
      .refine((val) => new Date(val) <= new Date(), 'Data não pode ser futura')
      .refine((val) => validateAge(val), 'É necessário ter pelo menos 18 anos'),
    zipCode: z
      .string('CEP é obrigatório')
      .length(8, 'CEP deve ter 8 dígitos')
      .regex(/^\d{8}$/, 'CEP deve conter apenas números'),
    street: z
      .string('Logradouro é obrigatório')
      .min(1, 'Logradouro é obrigatório')
      .max(100, 'Logradouro deve ter no máximo 100 caracteres'),
    number: z
      .string('Número é obrigatório')
      .min(1, 'Número é obrigatório')
      .max(10, 'Número deve ter no máximo 10 caracteres'),
    complement: z.string().max(50, 'Complemento deve ter no máximo 50 caracteres').optional(),
    neighborhood: z
      .string('Bairro é obrigatório')
      .min(1, 'Bairro é obrigatório')
      .max(50, 'Bairro deve ter no máximo 50 caracteres'),
    city: z
      .string('Cidade é obrigatória')
      .min(1, 'Cidade é obrigatória')
      .max(50, 'Cidade deve ter no máximo 50 caracteres'),
    state: z
      .string('Estado é obrigatório')
      .length(2, 'Estado deve ter 2 caracteres')
      .refine((val) => BRAZILIAN_STATES.includes(val as any), 'Estado inválido'),
    password: z
      .string('Senha é obrigatória')
      .min(8, 'Senha deve ter no mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
      .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
      .regex(/[0-9]/, 'Senha deve conter pelo menos um número')
      .regex(/[^A-Za-z0-9]/, 'Senha deve conter pelo menos um caractere especial'),
    confirmPassword: z.string('Confirmação de senha é obrigatória'),
    acceptTerms: z.boolean().refine((val) => val === true, 'Você deve aceitar os termos de uso'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não conferem',
    path: ['confirmPassword'],
  });

export const resendVerificationSchema = z.object({
  email: z.string('E-mail é obrigatório').email('E-mail inválido').max(100, 'E-mail inválido'),
});
