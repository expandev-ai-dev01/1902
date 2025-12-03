/**
 * @summary
 * Credit request endpoint controller.
 * Handles credit request creation, listing, details, and actions.
 *
 * @api {post} /api/v1/internal/credit-request Create Credit Request
 * @api {get} /api/v1/internal/credit-request List Credit Requests
 * @api {get} /api/v1/internal/credit-request/stats Get Request Statistics
 * @api {get} /api/v1/internal/credit-request/:id Get Request Details
 * @api {post} /api/v1/internal/credit-request/:id/cancel Cancel Request
 * @api {get} /api/v1/internal/credit-request/:id/receipt Download Receipt
 * @api {get} /api/v1/internal/credit-request/export Export History
 * @api {get} /api/v1/internal/credit-request/:id/evaluation-detail Get Evaluation Details
 * @api {post} /api/v1/internal/credit-request/:id/approve Approve Request
 * @api {post} /api/v1/internal/credit-request/:id/reject Reject Request
 * @api {post} /api/v1/internal/credit-request/:id/return Return Request
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  creditRequestCreate,
  creditRequestList,
  creditRequestGet,
  creditRequestGetStats,
  creditRequestCancel,
  creditRequestGetDetail,
  creditRequestApprove,
  creditRequestReject,
  creditRequestReturn,
  PurposeCategory,
  PaymentTerm,
  PaymentMethod,
  ProfessionalSituation,
  RequestStatus,
} from '@/services/creditRequest';
import { successResponse, errorResponse } from '@/utils/response';

/**
 * @rule {be-zod-validation}
 * Request body validation schema for creation
 */
const createBodySchema = z
  .object({
    creditAmount: z
      .number()
      .positive('creditAmountMustBePositive')
      .refine((val) => Number.isFinite(val), 'creditAmountInvalid'),
    purposeCategory: z.nativeEnum(PurposeCategory, {
      errorMap: () => ({ message: 'purposeCategoryInvalid' }),
    }),
    purposeSubcategory: z
      .string()
      .min(1, 'purposeSubcategoryRequired')
      .max(100, 'purposeSubcategoryTooLong'),
    paymentTerm: z.nativeEnum(PaymentTerm, {
      errorMap: () => ({ message: 'paymentTermInvalid' }),
    }),
    paymentMethod: z.nativeEnum(PaymentMethod, {
      errorMap: () => ({ message: 'paymentMethodInvalid' }),
    }),
    monthlyIncome: z
      .number()
      .positive('monthlyIncomeMustBePositive')
      .refine((val) => Number.isFinite(val), 'monthlyIncomeInvalid'),
    committedIncome: z
      .number()
      .min(0, 'committedIncomeMustBeNonNegative')
      .refine((val) => Number.isFinite(val), 'committedIncomeInvalid'),
    professionalSituation: z.nativeEnum(ProfessionalSituation, {
      errorMap: () => ({ message: 'professionalSituationInvalid' }),
    }),
    bankCode: z
      .string()
      .length(3, 'bankCodeInvalidLength')
      .regex(/^\d{3}$/, 'bankCodeInvalidFormat'),
    branchNumber: z
      .string()
      .min(1, 'branchNumberRequired')
      .max(5, 'branchNumberTooLong')
      .regex(/^\d+$/, 'branchNumberInvalidFormat'),
    accountNumber: z
      .string()
      .min(1, 'accountNumberRequired')
      .max(12, 'accountNumberTooLong')
      .regex(/^\d+(-\d)?$/, 'accountNumberInvalidFormat'),
  })
  .refine((data) => data.committedIncome <= data.monthlyIncome, {
    message: 'committedIncomeExceedsMonthlyIncome',
    path: ['committedIncome'],
  });

/**
 * @rule {be-zod-validation}
 * Query parameters validation schema for listing
 */
const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(10),
  status: z
    .string()
    .optional()
    .transform((val) => (val ? val.split(',').map((s) => s.trim() as RequestStatus) : undefined)),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  searchTerm: z.string().optional(),
});

/**
 * @rule {be-zod-validation}
 * Validation schemas for evaluation actions
 */
const approveBodySchema = z.object({
  approvedAmount: z.number().positive(),
  interestRate: z.number().positive(),
  finalTerm: z.number().int().positive(),
});

const rejectBodySchema = z.object({
  rejectionReason: z.string().min(20).max(1000),
});

const returnBodySchema = z.object({
  documentsToCorrect: z.array(z.number().int().positive()).min(1),
  correctionInstructions: z.string().min(20).max(1000),
});

/**
 * @summary
 * Handles credit request creation POST request
 */
export async function postHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const validatedData = createBodySchema.parse(req.body);
    const idClient = (req as any).user?.idClient || 1;

    const result = await creditRequestCreate({
      idClient,
      ...validatedData,
    });

    res.status(201).json(successResponse(result));
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json(errorResponse(error.errors[0].message, 'VALIDATION_ERROR'));
    } else if (
      ['clientNotFound', 'emailNotVerified', 'committedIncomeExceedsMonthlyIncome'].includes(
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
 * Handles credit request listing GET request
 */
export async function listHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const validatedQuery = listQuerySchema.parse(req.query);
    const idClient = (req as any).user?.idClient || 1;

    const result = await creditRequestList(idClient, validatedQuery);

    res.json(
      successResponse(result.data, {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
      })
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json(errorResponse(error.errors[0].message, 'VALIDATION_ERROR'));
    } else {
      next(error);
    }
  }
}

/**
 * @summary
 * Handles credit request statistics GET request
 */
export async function statsHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const idClient = (req as any).user?.idClient || 1;
    const result = await creditRequestGetStats(idClient);
    res.json(successResponse(result));
  } catch (error: any) {
    next(error);
  }
}

/**
 * @summary
 * Handles credit request details GET request
 */
export async function getHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const idClient = (req as any).user?.idClient || 1;
    const idCreditRequest = parseInt(req.params.id);

    if (isNaN(idCreditRequest)) {
      res.status(400).json(errorResponse('invalidRequestId'));
      return;
    }

    const result = await creditRequestGet(idClient, idCreditRequest);

    if (!result) {
      res.status(404).json(errorResponse('requestNotFound', 'NOT_FOUND'));
      return;
    }

    res.json(successResponse(result));
  } catch (error: any) {
    next(error);
  }
}

/**
 * @summary
 * Handles credit request cancellation POST request
 */
export async function cancelHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const idClient = (req as any).user?.idClient || 1;
    const idCreditRequest = parseInt(req.params.id);

    if (isNaN(idCreditRequest)) {
      res.status(400).json(errorResponse('invalidRequestId'));
      return;
    }

    await creditRequestCancel(idClient, idCreditRequest);

    res.json(successResponse({ message: 'requestCancelled' }));
  } catch (error: any) {
    if (['requestNotFound', 'requestCannotBeCancelled'].includes(error.message)) {
      res.status(400).json(errorResponse(error.message));
    } else {
      next(error);
    }
  }
}

/**
 * @summary
 * Handles receipt download GET request (Mock)
 */
export async function receiptHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const idClient = (req as any).user?.idClient || 1;
    const idCreditRequest = parseInt(req.params.id);

    const request = await creditRequestGet(idClient, idCreditRequest);

    if (!request) {
      res.status(404).json(errorResponse('requestNotFound', 'NOT_FOUND'));
      return;
    }

    if (![RequestStatus.Aprovado, RequestStatus.Efetivada].includes(request.status)) {
      res.status(400).json(errorResponse('receiptNotAvailable'));
      return;
    }

    // Mock response - in production this would stream a PDF file
    res.json(
      successResponse({
        downloadUrl: `https://api.creditudo.com/downloads/receipts/${request.requestNumber}.pdf`,
        generatedAt: new Date().toISOString(),
      })
    );
  } catch (error: any) {
    next(error);
  }
}

/**
 * @summary
 * Handles history export GET request (Mock)
 */
export async function exportHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const validatedQuery = listQuerySchema.parse(req.query);

    // Mock response - in production this would generate and stream a PDF/CSV
    res.json(
      successResponse({
        downloadUrl: `https://api.creditudo.com/downloads/exports/history_${Date.now()}.pdf`,
        format: 'pdf',
        generatedAt: new Date().toISOString(),
      })
    );
  } catch (error: any) {
    next(error);
  }
}

/**
 * @summary
 * Handles evaluation details GET request for analysts
 */
export async function evaluationDetailHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const analystId = (req as any).user?.idClient || 0;
    const idCreditRequest = parseInt(req.params.id);

    if (isNaN(idCreditRequest)) {
      res.status(400).json(errorResponse('invalidRequestId'));
      return;
    }

    const result = await creditRequestGetDetail(idCreditRequest, analystId);

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
 * Handles approve request POST request
 */
export async function approveHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const analystId = (req as any).user?.idClient || 0;
    const idCreditRequest = parseInt(req.params.id);
    const validatedData = approveBodySchema.parse(req.body);

    if (isNaN(idCreditRequest)) {
      res.status(400).json(errorResponse('invalidRequestId'));
      return;
    }

    await creditRequestApprove({
      idCreditRequest,
      analystId,
      ...validatedData,
    });

    res.json(successResponse({ message: 'requestApproved' }));
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json(errorResponse(error.errors[0].message, 'VALIDATION_ERROR'));
    } else if (
      [
        'requestNotFound',
        'proposalNotLockedByAnalyst',
        'invalidStatusForApproval',
        'approvedAmountExceedsRequested',
      ].includes(error.message)
    ) {
      res.status(400).json(errorResponse(error.message));
    } else {
      next(error);
    }
  }
}

/**
 * @summary
 * Handles reject request POST request
 */
export async function rejectHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const analystId = (req as any).user?.idClient || 0;
    const idCreditRequest = parseInt(req.params.id);
    const validatedData = rejectBodySchema.parse(req.body);

    if (isNaN(idCreditRequest)) {
      res.status(400).json(errorResponse('invalidRequestId'));
      return;
    }

    await creditRequestReject({
      idCreditRequest,
      analystId,
      ...validatedData,
    });

    res.json(successResponse({ message: 'requestRejected' }));
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json(errorResponse(error.errors[0].message, 'VALIDATION_ERROR'));
    } else if (
      ['requestNotFound', 'proposalNotLockedByAnalyst', 'invalidStatusForRejection'].includes(
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
 * Handles return request POST request
 */
export async function returnHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const analystId = (req as any).user?.idClient || 0;
    const idCreditRequest = parseInt(req.params.id);
    const validatedData = returnBodySchema.parse(req.body);

    if (isNaN(idCreditRequest)) {
      res.status(400).json(errorResponse('invalidRequestId'));
      return;
    }

    await creditRequestReturn({
      idCreditRequest,
      analystId,
      ...validatedData,
    });

    res.json(successResponse({ message: 'requestReturned' }));
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json(errorResponse(error.errors[0].message, 'VALIDATION_ERROR'));
    } else if (
      ['requestNotFound', 'proposalNotLockedByAnalyst', 'invalidStatusForReturn'].includes(
        error.message
      )
    ) {
      res.status(400).json(errorResponse(error.message));
    } else {
      next(error);
    }
  }
}
