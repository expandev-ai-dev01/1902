/**
 * @summary
 * Document management endpoint controller.
 * Handles document upload, listing, deletion, and finalization.
 *
 * @api {post} /api/v1/internal/credit-request/:id/documents Upload Document
 * @api {get} /api/v1/internal/credit-request/:id/documents List Documents
 * @api {delete} /api/v1/internal/credit-request/:id/documents/:idDocument Delete Document
 * @api {post} /api/v1/internal/credit-request/:id/documents/finalize Finalize Documents
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  documentUpload,
  documentList,
  documentDelete,
  documentFinalize,
  DocumentCategory,
  DocumentFileType,
  MAX_FILE_SIZE,
} from '@/services/document';
import { successResponse, errorResponse } from '@/utils/response';

/**
 * @rule {be-zod-validation}
 * Request body validation schema for upload
 */
const uploadBodySchema = z.object({
  category: z.nativeEnum(DocumentCategory, {
    errorMap: () => ({ message: 'categoryInvalid' }),
  }),
  description: z.string().max(100, 'descriptionTooLong').optional(),
  fileName: z.string().min(1, 'fileNameRequired').max(255, 'fileNameTooLong'),
  fileSize: z.number().int().positive('fileSizeInvalid').max(MAX_FILE_SIZE, 'fileSizeExceeded'),
  fileType: z.nativeEnum(DocumentFileType, {
    errorMap: () => ({ message: 'fileTypeInvalid' }),
  }),
  fileData: z.string().min(1, 'fileDataRequired'),
});

/**
 * @summary
 * Handles document upload POST request
 *
 * @function uploadHandler
 * @module api/v1/internal/credit-request/documents/controller
 */
export async function uploadHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const idCreditRequest = parseInt(req.params.id);
    const idClient = (req as any).user?.idClient || 1;

    if (isNaN(idCreditRequest)) {
      res.status(400).json(errorResponse('invalidRequestId'));
      return;
    }

    const validatedData = uploadBodySchema.parse(req.body);

    // Convert base64 file data to Buffer
    const fileBuffer = Buffer.from(validatedData.fileData, 'base64');

    const result = await documentUpload({
      idCreditRequest,
      idClient,
      category: validatedData.category,
      description: validatedData.description,
      fileName: validatedData.fileName,
      fileSize: validatedData.fileSize,
      fileType: validatedData.fileType,
      fileBuffer,
    });

    res.status(201).json(successResponse(result));
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json(errorResponse(error.errors[0].message, 'VALIDATION_ERROR'));
    } else if (
      ['requestNotFound', 'invalidRequestStatus', 'fileSizeExceeded', 'invalidFileType'].includes(
        error.message
      )
    ) {
      res.status(400).json(errorResponse(error.message));
    } else {
      next(error);
    }
  }
}

/**
 * @summary
 * Handles document listing GET request
 *
 * @function listHandler
 * @module api/v1/internal/credit-request/documents/controller
 */
export async function listHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const idCreditRequest = parseInt(req.params.id);
    const idClient = (req as any).user?.idClient || 1;

    if (isNaN(idCreditRequest)) {
      res.status(400).json(errorResponse('invalidRequestId'));
      return;
    }

    const result = await documentList({
      idCreditRequest,
      idClient,
    });

    res.json(successResponse(result));
  } catch (error: any) {
    if (error.message === 'requestNotFound') {
      res.status(404).json(errorResponse(error.message, 'NOT_FOUND'));
    } else {
      next(error);
    }
  }
}

/**
 * @summary
 * Handles document deletion DELETE request
 *
 * @function deleteHandler
 * @module api/v1/internal/credit-request/documents/controller
 */
export async function deleteHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const idDocument = parseInt(req.params.idDocument);
    const idClient = (req as any).user?.idClient || 1;

    if (isNaN(idDocument)) {
      res.status(400).json(errorResponse('invalidDocumentId'));
      return;
    }

    await documentDelete({
      idDocument,
      idClient,
    });

    res.json(successResponse({ message: 'documentDeleted' }));
  } catch (error: any) {
    if (['documentNotFound', 'cannotDeleteDocument'].includes(error.message)) {
      res.status(400).json(errorResponse(error.message));
    } else {
      next(error);
    }
  }
}

/**
 * @summary
 * Handles document finalization POST request
 *
 * @function finalizeHandler
 * @module api/v1/internal/credit-request/documents/controller
 */
export async function finalizeHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const idCreditRequest = parseInt(req.params.id);
    const idClient = (req as any).user?.idClient || 1;

    if (isNaN(idCreditRequest)) {
      res.status(400).json(errorResponse('invalidRequestId'));
      return;
    }

    await documentFinalize({
      idCreditRequest,
      idClient,
    });

    res.json(successResponse({ message: 'documentsFinalized' }));
  } catch (error: any) {
    if (error.message === 'mandatoryCategoriesMissing') {
      res.status(400).json(
        errorResponse(error.message, 'VALIDATION_ERROR', {
          missingCategories: error.missingCategories,
        })
      );
    } else if (['requestNotFound', 'invalidRequestStatus'].includes(error.message)) {
      res.status(400).json(errorResponse(error.message));
    } else {
      next(error);
    }
  }
}
