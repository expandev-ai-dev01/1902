/**
 * @summary
 * Email verification endpoint controller.
 * Handles email verification using token from verification link.
 *
 * @api {get} /api/v1/external/client/verify-email Verify Email
 * @apiName VerifyEmail
 * @apiGroup Client
 * @apiVersion 1.0.0
 *
 * @apiDescription Verifies client email using token
 *
 * @apiParam {String} token Email verification token
 *
 * @apiSuccess {Number} idClient Client identifier
 * @apiSuccess {String} email Client email address
 *
 * @apiError {String} invalidToken Token is invalid
 * @apiError {String} tokenExpired Token has expired
 * @apiError {String} tokenAlreadyUsed Token was already used
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { clientVerifyEmail } from '@/services/client';
import { successResponse, errorResponse } from '@/utils/response';

/**
 * @rule {be-zod-validation}
 * Query parameters validation schema
 */
const querySchema = z.object({
  token: z.string().min(1, 'tokenRequired'),
});

/**
 * @summary
 * Handles email verification GET request
 *
 * @function getHandler
 * @module api/v1/external/client/verify-email/controller
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 *
 * @returns {Promise<void>}
 */
export async function getHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    /**
     * @validation Query parameters validation
     */
    const validatedData = querySchema.parse(req.query);

    /**
     * @rule {fn-email-verification}
     * Execute email verification
     */
    const result = await clientVerifyEmail({
      token: validatedData.token,
    });

    res.json(successResponse(result));
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json(errorResponse(error.errors[0].message, 'VALIDATION_ERROR'));
    } else if (['invalidToken', 'tokenExpired', 'tokenAlreadyUsed'].includes(error.message)) {
      res.status(400).json(errorResponse(error.message));
    } else {
      next(error);
    }
  }
}
