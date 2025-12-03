/**
 * @summary
 * Analysis Queue endpoint controller.
 * Handles listing and locking of credit proposals for analysts.
 *
 * @api {get} /api/v1/internal/analysis-queue List Analysis Queue
 * @api {post} /api/v1/internal/analysis-queue/:id/lock Lock Proposal
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { getAnalysisQueue, lockCreditRequest } from '@/services/creditRequest';
import { successResponse, errorResponse } from '@/utils/response';

/**
 * @rule {be-zod-validation}
 * Query parameters validation schema for queue listing
 */
const listQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().optional().default(1),
    pageSize: z.coerce.number().int().positive().max(100).optional().default(10),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    minAmount: z.coerce.number().positive().optional(),
    maxAmount: z.coerce.number().positive().optional(),
    searchTerm: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate);
      }
      return true;
    },
    {
      message: 'startDateMustBeBeforeEndDate',
      path: ['startDate'],
    }
  )
  .refine(
    (data) => {
      if (data.minAmount && data.maxAmount) {
        return data.minAmount <= data.maxAmount;
      }
      return true;
    },
    {
      message: 'minAmountMustBeLessThanMaxAmount',
      path: ['minAmount'],
    }
  );

/**
 * @summary
 * Handles analysis queue listing GET request
 *
 * @function listHandler
 * @module api/v1/internal/analysis-queue/controller
 */
export async function listHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const validatedQuery = listQuerySchema.parse(req.query);
    // Assuming req.user is populated by auth middleware and contains idClient/idUser
    const analystId = (req as any).user?.idClient || 0;

    const result = await getAnalysisQueue(validatedQuery, analystId);

    res.json(
      successResponse(result.data, {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        filteredTotal: result.filteredTotal,
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
 * Handles proposal locking POST request
 *
 * @function lockHandler
 * @module api/v1/internal/analysis-queue/controller
 */
export async function lockHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const idCreditRequest = parseInt(req.params.id);
    const analystId = (req as any).user?.idClient || 0;

    if (isNaN(idCreditRequest)) {
      res.status(400).json(errorResponse('invalidRequestId'));
      return;
    }

    await lockCreditRequest(idCreditRequest, analystId);

    res.json(successResponse({ message: 'proposalLocked' }));
  } catch (error: any) {
    if (['requestNotFound', 'proposalAlreadyLocked'].includes(error.message)) {
      res.status(400).json(errorResponse(error.message));
    } else {
      next(error);
    }
  }
}
