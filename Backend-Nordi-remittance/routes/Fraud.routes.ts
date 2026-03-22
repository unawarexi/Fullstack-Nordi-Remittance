// ============================================================================
// FRAUD ROUTES
// ============================================================================

import { Router } from "express";
import FraudController from "../controllers/Fraud.controller.js";
import {
  authenticate,
  requireAdmin,
  verifyAccountStatus,
} from "../middleware/auth.middleware.js";
import { sanitizeInput } from "../middleware/security.middleware.js";
import {
  requestLoggingMiddleware,
  auditLogMiddleware,
} from "../middleware/core.middleware.js";

const router = Router();

// Apply common middleware
router.use(requestLoggingMiddleware);
router.use(sanitizeInput);
router.use(authenticate);

// ============================================================================
// USER ROUTES (View own security events)
// ============================================================================

/**
 * @route   GET /api/fraud/behavior-profile
 * @desc    Get user's behavior profile
 * @access  Private
 */
router.get(
  "/behavior-profile",
  verifyAccountStatus,
  FraudController.getBehaviorProfile,
);

// ============================================================================
// ADMIN ROUTES
// ============================================================================

router.use(requireAdmin);

// ============================================================================
// FRAUD SIGNALS
// ============================================================================

/**
 * @route   GET /api/fraud/signals
 * @desc    Get fraud signals
 * @access  Admin
 */
router.get("/signals", FraudController.getFraudSignals);

/**
 * @route   GET /api/fraud/signals/:signalId
 * @desc    Get specific fraud signal
 * @access  Admin
 */
router.get("/signals/:signalId", FraudController.getFraudSignalById);

/**
 * @route   PUT /api/fraud/signals/:signalId
 * @desc    Update fraud signal status
 * @access  Admin
 */
router.put(
  "/signals/:signalId",
  auditLogMiddleware,
  FraudController.updateFraudSignal,
);

// ============================================================================
// FRAUD CASES
// ============================================================================

/**
 * @route   GET /api/fraud/cases
 * @desc    Get all fraud cases
 * @access  Admin
 */
router.get("/cases", FraudController.getFraudCases);

/**
 * @route   POST /api/fraud/cases
 * @desc    Create new fraud case
 * @access  Admin
 */
router.post("/cases", auditLogMiddleware, FraudController.createFraudCase);

/**
 * @route   GET /api/fraud/cases/:caseId
 * @desc    Get fraud case details
 * @access  Admin
 */
router.get("/cases/:caseId", FraudController.getFraudCaseById);

/**
 * @route   PUT /api/fraud/cases/:caseId
 * @desc    Update fraud case
 * @access  Admin
 */
router.put(
  "/cases/:caseId",
  auditLogMiddleware,
  FraudController.updateFraudCase,
);

/**
 * @route   POST /api/fraud/cases/:caseId/comments
 * @desc    Add comment to fraud case
 * @access  Admin
 */
router.post("/cases/:caseId/comments", FraudController.addCaseComment);

// ============================================================================
// VELOCITY RULES
// ============================================================================

/**
 * @route   GET /api/fraud/velocity-rules
 * @desc    Get all velocity rules
 * @access  Admin
 */
router.get("/velocity-rules", FraudController.getVelocityRules);

/**
 * @route   POST /api/fraud/velocity-rules
 * @desc    Create new velocity rule
 * @access  Admin
 */
router.post(
  "/velocity-rules",
  auditLogMiddleware,
  FraudController.createVelocityRule,
);

/**
 * @route   PUT /api/fraud/velocity-rules/:ruleId
 * @desc    Update velocity rule
 * @access  Admin
 */
router.put(
  "/velocity-rules/:ruleId",
  auditLogMiddleware,
  FraudController.updateVelocityRule,
);

/**
 * @route   DELETE /api/fraud/velocity-rules/:ruleId
 * @desc    Delete velocity rule
 * @access  Admin
 */
router.delete(
  "/velocity-rules/:ruleId",
  auditLogMiddleware,
  FraudController.deleteVelocityRule,
);

// ============================================================================
// BEHAVIOR PROFILES (Admin)
// ============================================================================

/**
 * @route   GET /api/fraud/users/:userId/behavior-profile
 * @desc    Get user's behavior profile (admin view)
 * @access  Admin
 */
router.get(
  "/users/:userId/behavior-profile",
  FraudController.getBehaviorProfile,
);

/**
 * @route   PUT /api/fraud/users/:userId/behavior-profile
 * @desc    Update user's behavior profile
 * @access  Admin
 */
router.put(
  "/users/:userId/behavior-profile",
  auditLogMiddleware,
  FraudController.updateBehaviorProfile,
);

// ============================================================================
// SECURITY EVENTS
// ============================================================================

/**
 * @route   GET /api/fraud/security-events
 * @desc    Get security events
 * @access  Admin
 */
router.get("/security-events", FraudController.getSecurityEvents);

/**
 * @route   POST /api/fraud/security-events
 * @desc    Log security event
 * @access  Admin
 */
router.post("/security-events", FraudController.logSecurityEvent);

// ============================================================================
// ANALYTICS
// ============================================================================

/**
 * @route   GET /api/fraud/analytics
 * @desc    Get fraud analytics
 * @access  Admin
 */
router.get("/analytics", FraudController.getFraudAnalytics);

export default router;
