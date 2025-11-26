/**
 * @summary
 * External API routes configuration for public endpoints.
 * Handles public access routes without authentication requirements.
 *
 * @module routes/v1/externalRoutes
 */

import { Router } from 'express';
import * as clientRegisterController from '@/api/v1/external/client/register/controller';
import * as clientVerifyEmailController from '@/api/v1/external/client/verify-email/controller';
import * as clientResendVerificationController from '@/api/v1/external/client/resend-verification/controller';

const router = Router();

/**
 * @rule {be-client-registration}
 * Client registration routes
 */
router.post('/client/register', clientRegisterController.postHandler);
router.get('/client/verify-email', clientVerifyEmailController.getHandler);
router.post('/client/resend-verification', clientResendVerificationController.postHandler);

export default router;
