import { z } from 'zod';
import { documentUploadSchema } from '../validations/document';

export type DocumentUploadInput = z.input<typeof documentUploadSchema>;
export type DocumentUploadOutput = z.output<typeof documentUploadSchema>;
