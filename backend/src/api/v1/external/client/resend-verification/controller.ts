/**
 * @summary
 * Resend verification email endpoint controller.
 * Handles requests to resend email verification token.
 *
 * @api {post} /api/v1/external/client/resend-verification Resend Verification Email
 * @apiName ResendVerification
 * @apiGroup Client
 * @apiVersion 1.0.0
 *
 * @apiDescription Generates and sends new email verification token
 *
 * @apiParam {String} email Client email address
 *
 * @apiSuccess {String} verificationToken New verification token
 *
 * @apiError {String} emailNotFound Email not registered
 * @apiError {String} emailAlreadyVerified Email already verified
 * @apiError {String} dailyLimitExceeded Daily request limit exceeded
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { clientResendVerification } from '@/services/client';
import { successResponse, errorResponse } from '@/utils/response';

/**
 * @rule {be-zod-validation}
 * Request body validation schema
 */
const bodySchema = z.object({
  email: z.string().email('emailInvalid').max(100, 'emailTooLong'),
});

/**
 * @summary
 * Handles resend verification POST request
 *
 * @function postHandler
 * @module api/v1/external/client/resend-verification/controller
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
     * @rule {be-ip-capture}
     * Capture client IP address
     */
    const ipAddress =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || '';

    /**
     * @rule {fn-token-regeneration}
     * Execute verification resend
     */
    const result = await clientResendVerification({
      email: validatedData.email,
      ipAddress,
    });

    res.json(successResponse(result));
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json(errorResponse(error.errors[0].message, 'VALIDATION_ERROR'));
    } else if (
      ['emailNotFound', 'emailAlreadyVerified', 'dailyLimitExceeded'].includes(error.message)
    ) {
      res.status(400).json(errorResponse(error.message));
    } else {
      next(error);
    }
  }
}
