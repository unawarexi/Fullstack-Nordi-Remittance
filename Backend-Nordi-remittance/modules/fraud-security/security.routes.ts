// ============================================================================
// SECURITY ROUTES
// ============================================================================

import { Router } from "express";
import SecurityController from "./security.controller.js";
import {
  authenticate,
  verifyAccountStatus,
} from "../../middleware/auth.middleware.js";
import {
  authRateLimit,
  sanitizeInput,
} from "../../middleware/security.middleware.js";
import {
  requestLoggingMiddleware,
  auditLogMiddleware,
} from "../../middleware/core.middleware.js";

const router = Router();

// Apply common middleware
router.use(requestLoggingMiddleware);
router.use(sanitizeInput);
router.use(authenticate);
router.use(verifyAccountStatus);

// ============================================================================
// SECURITY OVERVIEW
// ============================================================================

/**
 * @route   GET /api/security/score
 * @desc    Get account security score
 * @access  Private
 */
router.get("/score", SecurityController.getSecurityScore);

/**
 * @route   GET /api/security/settings
 * @desc    Get security settings
 * @access  Private
 */
router.get("/settings", SecurityController.getSecuritySettings);

/**
 * @route   PUT /api/security/settings
 * @desc    Update security settings
 * @access  Private
 */
router.put(
  "/settings",
  auditLogMiddleware,
  SecurityController.updateSecuritySettings,
);

/**
 * @route   GET /api/security/alerts
 * @desc    Get security alerts
 * @access  Private
 */
router.get("/alerts", SecurityController.getSecurityAlerts);

// ============================================================================
// LOGIN HISTORY & SESSIONS
// ============================================================================

/**
 * @route   GET /api/security/login-history
 * @desc    Get login history
 * @access  Private
 */
router.get("/login-history", SecurityController.getLoginHistory);

/**
 * @route   GET /api/security/sessions
 * @desc    Get active sessions
 * @access  Private
 */
router.get("/sessions", SecurityController.getActiveSessions);

/**
 * @route   DELETE /api/security/sessions/:sessionId
 * @desc    Revoke specific session
 * @access  Private
 */
router.delete(
  "/sessions/:sessionId",
  auditLogMiddleware,
  SecurityController.revokeSession,
);

/**
 * @route   DELETE /api/security/sessions
 * @desc    Revoke all sessions
 * @access  Private
 */
router.delete(
  "/sessions",
  auditLogMiddleware,
  SecurityController.revokeAllSessions,
);

// ============================================================================
// TWO-FACTOR AUTHENTICATION
// ============================================================================

/**
 * @route   POST /api/security/2fa/setup
 * @desc    Set up 2FA
 * @access  Private
 */
router.post(
  "/2fa/setup",
  authRateLimit,
  auditLogMiddleware,
  SecurityController.setup2FA,
);

/**
 * @route   POST /api/security/2fa/verify
 * @desc    Verify 2FA setup
 * @access  Private
 */
router.post(
  "/2fa/verify",
  authRateLimit,
  auditLogMiddleware,
  SecurityController.verify2FASetup,
);

/**
 * @route   POST /api/security/2fa/disable
 * @desc    Disable 2FA
 * @access  Private
 */
router.post(
  "/2fa/disable",
  authRateLimit,
  auditLogMiddleware,
  SecurityController.disable2FA,
);

/**
 * @route   POST /api/security/2fa/backup-codes
 * @desc    Regenerate backup codes
 * @access  Private
 */
router.post(
  "/2fa/backup-codes",
  authRateLimit,
  auditLogMiddleware,
  SecurityController.regenerateBackupCodes,
);

// ============================================================================
// TRUSTED DEVICES
// ============================================================================

/**
 * @route   GET /api/security/trusted-devices
 * @desc    Get trusted devices
 * @access  Private
 */
router.get("/trusted-devices", SecurityController.getTrustedDevices);

/**
 * @route   POST /api/security/trusted-devices
 * @desc    Add trusted device
 * @access  Private
 */
router.post(
  "/trusted-devices",
  auditLogMiddleware,
  SecurityController.addTrustedDevice,
);

/**
 * @route   DELETE /api/security/trusted-devices/:deviceId
 * @desc    Remove trusted device
 * @access  Private
 */
router.delete(
  "/trusted-devices/:deviceId",
  auditLogMiddleware,
  SecurityController.removeTrustedDevice,
);

export default router;
