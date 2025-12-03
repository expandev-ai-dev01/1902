import { z } from 'zod';

const DOCUMENT_CATEGORIES = [
  'Documento de Identificação',
  'Comprovante de Renda',
  'Comprovante de Residência',
  'Extrato Bancário',
  'Outros',
] as const;

const FILE_TYPES = ['PDF', 'JPG', 'PNG'] as const;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

export const documentUploadSchema = z.object({
  category: z.enum(DOCUMENT_CATEGORIES, 'Selecione uma categoria de documento'),
  description: z.string().max(100, 'A descrição não pode exceder 100 caracteres').optional(),
  fileName: z
    .string('Nome do arquivo é obrigatório')
    .min(1, 'Nome do arquivo é obrigatório')
    .max(255, 'Nome do arquivo muito longo'),
  fileSize: z
    .number('Tamanho do arquivo inválido')
    .int('Tamanho do arquivo inválido')
    .positive('Tamanho do arquivo inválido')
    .max(MAX_FILE_SIZE, 'O arquivo excede o tamanho máximo permitido de 10MB'),
  fileType: z.enum(FILE_TYPES, 'Formato de arquivo não suportado'),
  fileData: z
    .string('Dados do arquivo são obrigatórios')
    .min(1, 'Dados do arquivo são obrigatórios'),
});

export { DOCUMENT_CATEGORIES, FILE_TYPES, MAX_FILE_SIZE };
