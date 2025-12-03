/**
 * @summary
 * Type definitions for document management.
 * Defines interfaces for document upload, listing, and finalization.
 *
 * @module services/document/documentTypes
 */

/**
 * @enum DocumentCategory
 * @description Document category values
 */
export enum DocumentCategory {
  DocumentoIdentificacao = 'Documento de Identificação',
  ComprovanteRenda = 'Comprovante de Renda',
  ComprovanteResidencia = 'Comprovante de Residência',
  ExtratoBancario = 'Extrato Bancário',
  Outros = 'Outros',
}

/**
 * @enum DocumentUploadStatus
 * @description Document upload status values
 */
export enum DocumentUploadStatus {
  EmAndamento = 'Em Andamento',
  Concluido = 'Concluído',
  Erro = 'Erro',
}

/**
 * @enum DocumentFileType
 * @description Allowed file types
 */
export enum DocumentFileType {
  PDF = 'PDF',
  JPG = 'JPG',
  PNG = 'PNG',
}

/**
 * @interface DocumentEntity
 * @description Represents a document entity
 */
export interface DocumentEntity {
  idDocument: number;
  idCreditRequest: number;
  idClient: number;
  category: DocumentCategory;
  description: string | null;
  fileName: string;
  fileSize: number;
  fileType: DocumentFileType;
  uploadDate: string;
  uploadStatus: DocumentUploadStatus;
  storageUrl: string;
  deleted: boolean;
}

/**
 * @interface DocumentUploadRequest
 * @description Request parameters for document upload
 */
export interface DocumentUploadRequest {
  idCreditRequest: number;
  idClient: number;
  category: DocumentCategory;
  description?: string;
  fileName: string;
  fileSize: number;
  fileType: DocumentFileType;
  fileBuffer: Buffer;
}

/**
 * @interface DocumentUploadResponse
 * @description Response data from document upload
 */
export interface DocumentUploadResponse {
  idDocument: number;
}

/**
 * @interface DocumentListRequest
 * @description Request parameters for document listing
 */
export interface DocumentListRequest {
  idCreditRequest: number;
  idClient: number;
}

/**
 * @interface DocumentListResponse
 * @description Response data from document listing
 */
export interface DocumentListResponse {
  documents: DocumentEntity[];
  mandatoryCategories: {
    category: DocumentCategory;
    hasDocument: boolean;
  }[];
}

/**
 * @interface DocumentDeleteRequest
 * @description Request parameters for document deletion
 */
export interface DocumentDeleteRequest {
  idDocument: number;
  idClient: number;
}

/**
 * @interface DocumentFinalizeRequest
 * @description Request parameters for document finalization
 */
export interface DocumentFinalizeRequest {
  idCreditRequest: number;
  idClient: number;
}

/**
 * @constant MANDATORY_CATEGORIES
 * @description List of mandatory document categories
 */
export const MANDATORY_CATEGORIES: DocumentCategory[] = [
  DocumentCategory.DocumentoIdentificacao,
  DocumentCategory.ComprovanteRenda,
  DocumentCategory.ComprovanteResidencia,
];

/**
 * @constant MAX_FILE_SIZE
 * @description Maximum file size in bytes (10MB)
 */
export const MAX_FILE_SIZE = 10485760;

/**
 * @constant ALLOWED_FILE_TYPES
 * @description Allowed file MIME types
 */
export const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
