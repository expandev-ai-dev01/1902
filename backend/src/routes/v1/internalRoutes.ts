/**
 * @summary
 * Internal API routes configuration for authenticated endpoints.
 * Handles all authenticated user operations and protected resources.
 *
 * @module routes/v1/internalRoutes
 */

import { Router } from 'express';
import * as creditRequestController from '@/api/v1/internal/credit-request/controller';

const router = Router();

/**
 * @rule {be-credit-request-routes}
 * Credit request routes
 */
router.post('/credit-request', creditRequestController.postHandler);

export default router;
