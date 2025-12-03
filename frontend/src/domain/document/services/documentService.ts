import { authenticatedClient } from '@/core/lib/api';
import type {
  DocumentListResponse,
  DocumentUploadOutput,
  Document,
  DocumentFinalizeResponse,
} from '../types';

export const documentService = {
  /**
   * Uploads a document for a credit request.
   */
  async upload(idCreditRequest: number, data: DocumentUploadOutput): Promise<Document> {
    const response = await authenticatedClient.post(
      `/credit-request/${idCreditRequest}/documents`,
      data
    );
    return response.data.data;
  },

  /**
   * Lists all documents for a credit request.
   */
  async list(idCreditRequest: number): Promise<DocumentListResponse> {
    const response = await authenticatedClient.get(`/credit-request/${idCreditRequest}/documents`);
    return response.data.data;
  },

  /**
   * Deletes a document.
   */
  async delete(idCreditRequest: number, idDocument: number): Promise<void> {
    await authenticatedClient.delete(`/credit-request/${idCreditRequest}/documents/${idDocument}`);
  },

  /**
   * Finalizes document submission for a credit request.
   */
  async finalize(idCreditRequest: number): Promise<DocumentFinalizeResponse> {
    const response = await authenticatedClient.post(
      `/credit-request/${idCreditRequest}/documents/finalize`
    );
    return response.data.data;
  },
};
