// ============================================================================
// LEGAL ROUTES
// ============================================================================

import { Router } from "express";
import LegalController from "../controllers/Legal.controller.js";
import {
  authenticate,
  requireAdmin,
  verifyAccountStatus,
  optionalAuth,
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

// ============================================================================
// PUBLIC LEGAL DOCUMENT ROUTES
// ============================================================================

/**
 * @route   GET /api/legal/documents
 * @desc    Get all legal documents
 * @access  Public
 */
router.get("/documents", LegalController.getLegalDocuments);

/**
 * @route   GET /api/legal/documents/:documentId
 * @desc    Get specific legal document
 * @access  Public
 */
router.get("/documents/:documentId", LegalController.getLegalDocumentById);

/**
 * @route   GET /api/legal/documents/type/:type
 * @desc    Get legal document by type
 * @access  Public
 */
router.get("/documents/type/:type", LegalController.getLegalDocumentByType);

/**
 * @route   GET /api/legal/documents/:documentId/versions
 * @desc    Get document version history
 * @access  Public
 */
router.get(
  "/documents/:documentId/versions",
  LegalController.getPolicyVersions,
);

// ============================================================================
// AUTHENTICATED USER ROUTES
// ============================================================================

router.use(authenticate);
router.use(verifyAccountStatus);

// ============================================================================
// USER CONSENT ROUTES
// ============================================================================

/**
 * @route   GET /api/legal/consents
 * @desc    Get user's consents
 * @access  Private
 */
router.get("/consents", LegalController.getUserConsents);

/**
 * @route   POST /api/legal/consents
 * @desc    Record user consent
 * @access  Private
 */
router.post("/consents", auditLogMiddleware, LegalController.recordConsent);

/**
 * @route   DELETE /api/legal/consents/:documentId
 * @desc    Withdraw consent
 * @access  Private
 */
router.delete(
  "/consents/:documentId",
  auditLogMiddleware,
  LegalController.withdrawConsent,
);

/**
 * @route   GET /api/legal/consents/required
 * @desc    Check required consents
 * @access  Private
 */
router.get("/consents/required", LegalController.checkRequiredConsents);

// ============================================================================
// DISPUTE CLAIM ROUTES
// ============================================================================

/**
 * @route   GET /api/legal/disputes
 * @desc    Get user's dispute claims
 * @access  Private
 */
router.get("/disputes", LegalController.getDisputeClaims);

/**
 * @route   POST /api/legal/disputes
 * @desc    Create dispute claim
 * @access  Private
 */
router.post(
  "/disputes",
  auditLogMiddleware,
  LegalController.createDisputeClaim,
);

/**
 * @route   GET /api/legal/disputes/:claimId
 * @desc    Get specific dispute claim
 * @access  Private
 */
router.get("/disputes/:claimId", LegalController.getDisputeClaimById);

/**
 * @route   POST /api/legal/disputes/:claimId/comments
 * @desc    Add comment to dispute
 * @access  Private
 */
router.post("/disputes/:claimId/comments", LegalController.addDisputeComment);

// ============================================================================
// ADMIN ROUTES
// ============================================================================

/**
 * @route   POST /api/legal/documents
 * @desc    Create legal document
 * @access  Admin
 */
router.post(
  "/documents",
  requireAdmin,
  auditLogMiddleware,
  LegalController.createLegalDocument,
);

/**
 * @route   PUT /api/legal/documents/:documentId
 * @desc    Update legal document
 * @access  Admin
 */
router.put(
  "/documents/:documentId",
  requireAdmin,
  auditLogMiddleware,
  LegalController.updateLegalDocument,
);

/**
 * @route   GET /api/legal/admin/disputes
 * @desc    Get all dispute claims
 * @access  Admin
 */
router.get(
  "/admin/disputes",
  requireAdmin,
  LegalController.getAllDisputeClaims,
);

/**
 * @route   PUT /api/legal/admin/disputes/:claimId
 * @desc    Update dispute claim
 * @access  Admin
 */
router.put(
  "/admin/disputes/:claimId",
  requireAdmin,
  auditLogMiddleware,
  LegalController.updateDisputeClaim,
);

// ============================================================================
// REGULATORY FILING ROUTES (Admin)
// ============================================================================

/**
 * @route   GET /api/legal/admin/regulatory
 * @desc    Get regulatory filings
 * @access  Admin
 */
router.get(
  "/admin/regulatory",
  requireAdmin,
  LegalController.getRegulatoryFilings,
);

/**
 * @route   POST /api/legal/admin/regulatory
 * @desc    Create regulatory filing
 * @access  Admin
 */
router.post(
  "/admin/regulatory",
  requireAdmin,
  auditLogMiddleware,
  LegalController.createRegulatoryFiling,
);

/**
 * @route   POST /api/legal/admin/regulatory/:filingId/submit
 * @desc    Submit regulatory filing
 * @access  Admin
 */
router.post(
  "/admin/regulatory/:filingId/submit",
  requireAdmin,
  auditLogMiddleware,
  LegalController.submitRegulatoryFiling,
);

export default router;
