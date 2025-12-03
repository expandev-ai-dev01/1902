/**
 * @summary
 * Internal API routes configuration for authenticated endpoints.
 * Handles all authenticated user operations and protected resources.
 *
 * @module routes/v1/internalRoutes
 */

import { Router } from 'express';
import * as creditRequestController from '@/api/v1/internal/credit-request/controller';
import * as analysisQueueController from '@/api/v1/internal/analysis-queue/controller';
import * as documentController from '@/api/v1/internal/credit-request/documents/controller';

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

// Document Management Routes
router.post('/credit-request/:id/documents', documentController.uploadHandler);
router.get('/credit-request/:id/documents', documentController.listHandler);
router.delete('/credit-request/:id/documents/:idDocument', documentController.deleteHandler);
router.post('/credit-request/:id/documents/finalize', documentController.finalizeHandler);

// Evaluation Operations (Analyst)
router.get(
  '/credit-request/:id/evaluation-detail',
  creditRequestController.evaluationDetailHandler
);
router.post('/credit-request/:id/approve', creditRequestController.approveHandler);
router.post('/credit-request/:id/reject', creditRequestController.rejectHandler);
router.post('/credit-request/:id/return', creditRequestController.returnHandler);

/**
 * @rule {be-analysis-queue-routes}
 * Analysis Queue routes
 */
router.get('/analysis-queue', analysisQueueController.listHandler);
router.post('/analysis-queue/:id/lock', analysisQueueController.lockHandler);

export default router;
