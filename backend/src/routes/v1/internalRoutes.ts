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
// List and Create
router.get('/credit-request', creditRequestController.listHandler);
router.post('/credit-request', creditRequestController.postHandler);

// Statistics and Export
router.get('/credit-request/stats', creditRequestController.statsHandler);
router.get('/credit-request/export', creditRequestController.exportHandler);

// Specific Resource Operations
router.get('/credit-request/:id', creditRequestController.getHandler);
router.post('/credit-request/:id/cancel', creditRequestController.cancelHandler);
router.get('/credit-request/:id/receipt', creditRequestController.receiptHandler);

export default router;
