/**
 * @summary
 * Credit request endpoint controller.
 * Handles credit request creation with validation.
 *
 * @api {post} /api/v1/internal/credit-request Create Credit Request
 * @apiName CreateCreditRequest
 * @apiGroup CreditRequest
 * @apiVersion 1.0.0
 *
 * @apiDescription Creates a new credit request for authenticated client
 *
 * @apiParam {Number} creditAmount Credit amount requested (positive decimal)
 * @apiParam {String} purposeCategory Purpose category (CONSUMO|INVESTIMENTO|IMÓVEL|VEÍCULO)
 * @apiParam {String} purposeSubcategory Purpose subcategory
 * @apiParam {String} paymentTerm Payment term
 * @apiParam {String} paymentMethod Payment method
 * @apiParam {Number} monthlyIncome Monthly income (positive decimal)
 * @apiParam {Number} committedIncome Committed income (non-negative decimal)
 * @apiParam {String} professionalSituation Professional situation
 * @apiParam {String} bankCode Bank code (3 digits)
 * @apiParam {String} branchNumber Branch number (max 5 digits)
 * @apiParam {String} accountNumber Account number (max 12 chars)
 *
 * @apiSuccess {Boolean} success Success flag (always true)
 * @apiSuccess {Number} data.idCreditRequest Credit request identifier
 * @apiSuccess {String} data.requestNumber Generated request number
 *
 * @apiError {String} error.code Error code
 * @apiError {String} error.message Error message
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  creditRequestCreate,
  PurposeCategory,
  PaymentTerm,
  PaymentMethod,
  ProfessionalSituation,
} from '@/services/creditRequest';
import { successResponse, errorResponse } from '@/utils/response';

/**
 * @rule {be-zod-validation}
 * Request body validation schema
 */
const bodySchema = z
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
 * @summary
 * Handles credit request creation POST request
 *
 * @function postHandler
 * @module api/v1/internal/credit-request/controller
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 *
 * @returns {Promise<void>}
 */
export async function postHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    /**
     * @validation Request body validation
     */
    const validatedData = bodySchema.parse(req.body);

    /**
     * @rule {be-authentication}
     * Get authenticated client ID from request
     * TODO: Replace with actual authentication middleware
     */
    const idClient = (req as any).user?.idClient || 1;

    /**
     * @rule {fn-credit-request-creation}
     * Execute credit request creation
     */
    const result = await creditRequestCreate({
      idClient,
      creditAmount: validatedData.creditAmount,
      purposeCategory: validatedData.purposeCategory,
      purposeSubcategory: validatedData.purposeSubcategory,
      paymentTerm: validatedData.paymentTerm,
      paymentMethod: validatedData.paymentMethod,
      monthlyIncome: validatedData.monthlyIncome,
      committedIncome: validatedData.committedIncome,
      professionalSituation: validatedData.professionalSituation,
      bankCode: validatedData.bankCode,
      branchNumber: validatedData.branchNumber,
      accountNumber: validatedData.accountNumber,
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
