// ============================================================================
// INTEGRATIONS ROUTES
// ============================================================================

import { Router } from 'express';
import IntegrationController from '../controllers/Integration.controller.js';
import { authenticate, requireAdmin, requireSuperAdmin, verifyAccountStatus } from '../middleware/Auth.middleware.js';
import { sanitizeInput, rateLimit } from '../middleware/Security.middleware.js';
import { requestLoggingMiddleware, auditLogMiddleware } from '../middleware/Core.middleware.js';

const router = Router();

// Apply common middleware
router.use(requestLoggingMiddleware);
router.use(sanitizeInput);

// ============================================================================
// USER INTEGRATION ROUTES
// ============================================================================

router.use(authenticate);
router.use(verifyAccountStatus);

// ============================================================================
// EXTERNAL ACCOUNTS (User)
// ============================================================================

/**
 * @route   GET /api/integrations/external-accounts
 * @desc    Get user's linked external accounts
 * @access  Private
 */
router.get('/external-accounts', IntegrationController.getExternalAccounts);

/**
 * @route   POST /api/integrations/external-accounts
 * @desc    Link external account
 * @access  Private
 */
// router.post(
//   '/external-accounts',
//    rateLimit({ maxRequests: 5, windowMs: 3600000 }),
//   // auditLogMiddleware('link_external_account'),
//   auditLogMiddleware,
//   IntegrationController.addExternalAccount
// );

/**
 * @route   POST /api/integrations/external-accounts/:accountId/verify
 * @desc    Verify external account
 * @access  Private
 */
router.post(
  '/external-accounts/:accountId/verify',
  rateLimit({ maxRequests: 5, windowMs: 3600000 }),
  // auditLogMiddleware('verify_external_account'),
  auditLogMiddleware,
  IntegrationController.verifyExternalAccount
);

/**
 * @route   DELETE /api/integrations/external-accounts/:accountId
 * @desc    Remove external account
 * @access  Private
 */
// router.delete(
//   '/external-accounts/:accountId',
//    rateLimit({ maxRequests: 5, windowMs: 3600000 }),
//   // auditLogMiddleware('remove_external_account'),
//   auditLogMiddleware,
//   IntegrationController.removeExternalAccount
// );

// ============================================================================
// ADMIN ROUTES
// ============================================================================

router.use(requireAdmin);

// ============================================================================
// INTEGRATIONS (Admin)
// ============================================================================

/**
 * @route   GET /api/integrations
 * @desc    Get all integrations
 * @access  Admin
 */
router.get('/', IntegrationController.getIntegrations);

/**
 * @route   GET /api/integrations/:integrationId
 * @desc    Get specific integration
 * @access  Admin
 */
router.get('/:integrationId', IntegrationController.getIntegrationById);

/**
 * @route   POST /api/integrations
 * @desc    Create new integration
 * @access  Admin
 */
router.post(
  '/',
   rateLimit({ maxRequests: 5, windowMs: 3600000 }),
  // auditLogMiddleware('create_integration'),
  auditLogMiddleware,
  IntegrationController.createIntegration
);

/**
 * @route   PUT /api/integrations/:integrationId
 * @desc    Update integration
 * @access  Admin
 */
router.put(
  '/:integrationId',
   rateLimit({ maxRequests: 5, windowMs: 3600000 }),
  // auditLogMiddleware('update_integration'),
  auditLogMiddleware,
  IntegrationController.updateIntegration
);

/**
 * @route   DELETE /api/integrations/:integrationId
 * @desc    Delete integration
 * @access  Admin
 */
router.delete(
  '/:integrationId',
   rateLimit({ maxRequests: 5, windowMs: 3600000 }),
  // auditLogMiddleware('delete_integration'),
  auditLogMiddleware,
  IntegrationController.deleteIntegration
);

/**
 * @route   POST /api/integrations/:integrationId/test
 * @desc    Test integration connection
 * @access  Admin
 */
router.post('/:integrationId/test', IntegrationController.testIntegration);

/**
 * @route   GET /api/integrations/:integrationId/logs
 * @desc    Get integration logs
 * @access  Admin
 */
router.get('/:integrationId/logs', IntegrationController.getIntegrationLogs);

// ============================================================================
// WEBHOOKS (Admin)
// ============================================================================

/**
 * @route   GET /api/integrations/webhooks
 * @desc    Get all webhooks
 * @access  Admin
 */
router.get('/webhooks', IntegrationController.getWebhooks);

/**
 * @route   POST /api/integrations/webhooks
 * @desc    Create webhook
 * @access  Admin
 */
router.post(
  '/webhooks',
   rateLimit({ maxRequests: 5, windowMs: 3600000 }),
  // auditLogMiddleware('create_webhook'),
  auditLogMiddleware,
  IntegrationController.createWebhook
);

/**
 * @route   PUT /api/integrations/webhooks/:webhookId
 * @desc    Update webhook
 * @access  Admin
 */
router.put(
  '/webhooks/:webhookId',
   rateLimit({ maxRequests: 5, windowMs: 3600000 }),
  // auditLogMiddleware('update_webhook'),
  auditLogMiddleware,
  IntegrationController.updateWebhook
);

/**
 * @route   DELETE /api/integrations/webhooks/:webhookId
 * @desc    Delete webhook
 * @access  Admin
 */
router.delete(
  '/webhooks/:webhookId',
   rateLimit({ maxRequests: 5, windowMs: 3600000 }),
  // auditLogMiddleware('delete_webhook'),
  auditLogMiddleware,
  IntegrationController.deleteWebhook
);

/**
 * @route   POST /api/integrations/webhooks/:webhookId/regenerate-secret
 * @desc    Regenerate webhook secret
 * @access  Admin
 */
router.post(
  '/webhooks/:webhookId/regenerate-secret',
   rateLimit({ maxRequests: 5, windowMs: 3600000 }),
  // auditLogMiddleware('regenerate_webhook_secret'),
  auditLogMiddleware,
  IntegrationController.regenerateWebhookSecret
);

// ============================================================================
// API KEYS (Admin)
// ============================================================================

/**
 * @route   GET /api/integrations/api-keys
 * @desc    Get all API keys
 * @access  Admin
 */
router.get('/api-keys', IntegrationController.getApiKeys);

/**
 * @route   POST /api/integrations/api-keys
 * @desc    Create API key
 * @access  Admin
 */
router.post(
  '/api-keys',
  requireSuperAdmin,
   rateLimit({ maxRequests: 5, windowMs: 3600000 }),
  // auditLogMiddleware('create_api_key'),
  auditLogMiddleware,
  IntegrationController.createApiKey
);

/**
 * @route   DELETE /api/integrations/api-keys/:keyId
 * @desc    Revoke API key
 * @access  Admin
 */
router.delete(
  '/api-keys/:keyId',
  requireSuperAdmin,
  rateLimit({ maxRequests: 5, windowMs: 3600000 }),
  // auditLogMiddleware('revoke_api_key'),
  auditLogMiddleware,
  IntegrationController.revokeApiKey
);

export default router;
