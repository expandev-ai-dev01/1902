export type DocumentCategory =
  | 'Documento de Identificação'
  | 'Comprovante de Renda'
  | 'Comprovante de Residência'
  | 'Extrato Bancário'
  | 'Outros';

export type DocumentFileType = 'PDF' | 'JPG' | 'PNG';

export interface Document {
  idDocument: number;
  idCreditRequest: number;
  category: DocumentCategory;
  description?: string;
  fileName: string;
  fileSize: number;
  fileType: DocumentFileType;
  uploadDate: string;
  status: 'Em Andamento' | 'Concluído' | 'Erro';
}

export interface DocumentListResponse {
  documents: Document[];
  requestStatus: string;
  mandatoryCategories: DocumentCategory[];
  uploadedCategories: DocumentCategory[];
  missingCategories: DocumentCategory[];
}

export interface DocumentFinalizeResponse {
  message: string;
  newStatus: string;
}
