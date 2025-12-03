/**
 * @summary
 * Business logic for document upload and management.
 * Handles file validation, storage simulation, and document operations.
 *
 * @module services/document/documentLogic
 */

import { creditRequestGet } from '@/services/creditRequest';
import {
  DocumentUploadRequest,
  DocumentUploadResponse,
  DocumentListRequest,
  DocumentListResponse,
  DocumentDeleteRequest,
  DocumentFinalizeRequest,
  DocumentEntity,
  DocumentCategory,
  DocumentUploadStatus,
  DocumentFileType,
  MANDATORY_CATEGORIES,
  MAX_FILE_SIZE,
} from './documentTypes';

/**
 * @summary
 * In-memory storage for documents (temporary implementation)
 */
const documents: DocumentEntity[] = [];
let nextDocumentId = 1;

/**
 * @summary
 * Simulate file storage and return storage URL
 */
function simulateFileStorage(fileName: string, fileBuffer: Buffer): string {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(7);
  return `https://storage.creditudo.com/documents/${timestamp}-${randomId}-${fileName}`;
}

/**
 * @summary
 * Validate file type from buffer (simplified)
 */
function validateFileType(fileName: string, fileType: DocumentFileType): boolean {
  const extension = fileName.split('.').pop()?.toUpperCase();
  return extension === fileType;
}

/**
 * @summary
 * Uploads a document for a credit request
 *
 * @function documentUpload
 * @module services/document/documentLogic
 *
 * @param {DocumentUploadRequest} params - Document upload parameters
 *
 * @returns {Promise<DocumentUploadResponse>} Upload result with document ID
 *
 * @throws {Error} When validation fails or request status is invalid
 */
export async function documentUpload(
  params: DocumentUploadRequest
): Promise<DocumentUploadResponse> {
  /**
   * @validation Request existence and ownership check
   */
  const request = await creditRequestGet(params.idClient, params.idCreditRequest);
  if (!request) {
    throw new Error('requestNotFound');
  }

  /**
   * @validation Request status check
   */
  if (request.status !== 'Aguardando Documentação') {
    throw new Error('invalidRequestStatus');
  }

  /**
   * @validation File size check
   */
  if (params.fileSize > MAX_FILE_SIZE) {
    throw new Error('fileSizeExceeded');
  }

  /**
   * @validation File type check
   */
  if (!validateFileType(params.fileName, params.fileType)) {
    throw new Error('invalidFileType');
  }

  /**
   * @rule {fn-document-upload} Store document
   */
  const storageUrl = simulateFileStorage(params.fileName, params.fileBuffer);
  const idDocument = nextDocumentId++;

  const document: DocumentEntity = {
    idDocument,
    idCreditRequest: params.idCreditRequest,
    idClient: params.idClient,
    category: params.category,
    description: params.description || null,
    fileName: params.fileName,
    fileSize: params.fileSize,
    fileType: params.fileType,
    uploadDate: new Date().toISOString(),
    uploadStatus: DocumentUploadStatus.Concluido,
    storageUrl,
    deleted: false,
  };

  documents.push(document);

  return { idDocument };
}

/**
 * @summary
 * Lists all documents for a credit request
 *
 * @function documentList
 * @module services/document/documentLogic
 *
 * @param {DocumentListRequest} params - List request parameters
 *
 * @returns {Promise<DocumentListResponse>} List of documents with mandatory status
 *
 * @throws {Error} When request not found or ownership mismatch
 */
export async function documentList(params: DocumentListRequest): Promise<DocumentListResponse> {
  /**
   * @validation Request existence and ownership check
   */
  const request = await creditRequestGet(params.idClient, params.idCreditRequest);
  if (!request) {
    throw new Error('requestNotFound');
  }

  /**
   * @rule {fn-document-listing} Get documents for request
   */
  const requestDocuments = documents.filter(
    (doc) => doc.idCreditRequest === params.idCreditRequest && !doc.deleted
  );

  /**
   * @rule {fn-mandatory-check} Check mandatory categories
   */
  const mandatoryCategories = MANDATORY_CATEGORIES.map((category) => ({
    category,
    hasDocument: requestDocuments.some((doc) => doc.category === category),
  }));

  return {
    documents: requestDocuments,
    mandatoryCategories,
  };
}

/**
 * @summary
 * Deletes a document (soft delete)
 *
 * @function documentDelete
 * @module services/document/documentLogic
 *
 * @param {DocumentDeleteRequest} params - Delete request parameters
 *
 * @returns {Promise<boolean>} True if deleted successfully
 *
 * @throws {Error} When document not found, ownership mismatch, or invalid status
 */
export async function documentDelete(params: DocumentDeleteRequest): Promise<boolean> {
  /**
   * @validation Document existence and ownership check
   */
  const document = documents.find((doc) => doc.idDocument === params.idDocument && !doc.deleted);

  if (!document || document.idClient !== params.idClient) {
    throw new Error('documentNotFound');
  }

  /**
   * @validation Request status check
   */
  const request = await creditRequestGet(params.idClient, document.idCreditRequest);
  if (!request || request.status !== 'Aguardando Documentação') {
    throw new Error('cannotDeleteDocument');
  }

  /**
   * @rule {fn-document-deletion} Soft delete document
   */
  document.deleted = true;

  return true;
}

/**
 * @summary
 * Finalizes document submission for a credit request
 *
 * @function documentFinalize
 * @module services/document/documentLogic
 *
 * @param {DocumentFinalizeRequest} params - Finalize request parameters
 *
 * @returns {Promise<boolean>} True if finalized successfully
 *
 * @throws {Error} When validation fails or mandatory documents missing
 */
export async function documentFinalize(params: DocumentFinalizeRequest): Promise<boolean> {
  /**
   * @validation Request existence and ownership check
   */
  const request = await creditRequestGet(params.idClient, params.idCreditRequest);
  if (!request) {
    throw new Error('requestNotFound');
  }

  /**
   * @validation Request status check
   */
  if (request.status !== 'Aguardando Documentação') {
    throw new Error('invalidRequestStatus');
  }

  /**
   * @validation Mandatory categories check
   */
  const requestDocuments = documents.filter(
    (doc) => doc.idCreditRequest === params.idCreditRequest && !doc.deleted
  );

  const missingCategories: string[] = [];
  MANDATORY_CATEGORIES.forEach((category) => {
    if (!requestDocuments.some((doc) => doc.category === category)) {
      missingCategories.push(category);
    }
  });

  if (missingCategories.length > 0) {
    const error: any = new Error('mandatoryCategoriesMissing');
    error.missingCategories = missingCategories;
    throw error;
  }

  /**
   * @rule {fn-document-finalization} Update request status
   * Note: This would normally update the creditRequest status to 'Em Análise'
   * For in-memory implementation, we'll update the request directly
   */
  request.status = 'Em Análise' as any;

  return true;
}
