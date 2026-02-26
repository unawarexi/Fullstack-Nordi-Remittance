// ============================================================================
// KYC ROUTES — Know Your Customer verification endpoints
//
// User routes:  status, requirements, documents CRUD, submit verification
// Admin routes: pending queue, user detail, approve/reject, stats
//
// Only admins can verify / approve / reject / complete KYC for users.
// ============================================================================

import { Router } from "express";
import KycController from "../controllers/Kyc.controller.js";
import {
  authenticate,
  requireAdmin,
  verifyAccountStatus,
} from "../middleware/Auth.middleware.js";
import { sanitizeInput } from "../middleware/Security.middleware.js";
import {
  requestLoggingMiddleware,
  auditLogMiddleware,
} from "../middleware/Core.middleware.js";
import { upload } from "../services/Cloudinary.service.js";

const router = Router();

// Apply common middleware to all KYC routes
router.use(requestLoggingMiddleware);
router.use(sanitizeInput);
router.use(authenticate);
router.use(verifyAccountStatus);

// ============================================================================
// USER KYC ROUTES
// ============================================================================

/**
 * @route   GET /api/v1/kyc/status
 * @desc    Get authenticated user's KYC status, level, steps, and limits
 * @access  Private
 */
router.get("/status", KycController.getStatus);

/**
 * @route   GET /api/v1/kyc/requirements
 * @desc    Get KYC requirements for next level (optional ?targetLevel=)
 * @access  Private
 */
router.get("/requirements", KycController.getRequirements);

// ============================================================================
// DOCUMENT ROUTES
// ============================================================================

/**
 * @route   GET /api/v1/kyc/documents
 * @desc    Get user's KYC documents (from Attachments + User model)
 * @access  Private
 */
router.get("/documents", KycController.getDocuments);

/**
 * @route   GET /api/v1/kyc/documents/:documentId
 * @desc    Get a specific KYC document
 * @access  Private
 */
router.get("/documents/:documentId", KycController.getDocumentById);

/**
 * @route   POST /api/v1/kyc/documents/identity
 * @desc    Upload identity document (passport, national ID, driver's license)
 * @access  Private
 * @body    multipart: type, frontImage (required), backImage (optional),
 *          documentNumber, expiryDate, issuingCountry
 */
router.post(
  "/documents/identity",
  upload.fields([
    { name: "frontImage", maxCount: 1 },
    { name: "backImage", maxCount: 1 },
  ]),
  auditLogMiddleware,
  KycController.uploadIdentityDocument,
);

/**
 * @route   POST /api/v1/kyc/documents/address
 * @desc    Upload proof of address (utility bill, bank statement)
 * @access  Private
 * @body    multipart: type, document (required), issueDate
 */
router.post(
  "/documents/address",
  upload.single("document"),
  auditLogMiddleware,
  KycController.uploadProofOfAddress,
);

/**
 * @route   POST /api/v1/kyc/documents/selfie
 * @desc    Upload selfie with ID
 * @access  Private
 * @body    multipart: selfie (required)
 */
router.post(
  "/documents/selfie",
  upload.single("selfie"),
  auditLogMiddleware,
  KycController.uploadSelfie,
);

/**
 * @route   DELETE /api/v1/kyc/documents/:documentId
 * @desc    Delete a KYC document (only if not already approved)
 * @access  Private
 */
router.delete(
  "/documents/:documentId",
  auditLogMiddleware,
  KycController.deleteDocument,
);

// ============================================================================
// VERIFICATION ROUTES
// ============================================================================

/**
 * @route   POST /api/v1/kyc/verify
 * @desc    Submit KYC for verification (moves status to in_review)
 * @access  Private
 */
router.post("/verify", auditLogMiddleware, KycController.submitVerification);

/**
 * @route   GET /api/v1/kyc/verify/:verificationId
 * @desc    Get verification status / progress
 * @access  Private
 */
router.get("/verify/:verificationId", KycController.getVerificationStatus);

/**
 * @route   POST /api/v1/kyc/reverify
 * @desc    Request re-verification (only after rejection/expiry)
 * @access  Private
 */
router.post(
  "/reverify",
  auditLogMiddleware,
  KycController.requestReverification,
);

// ============================================================================
// ADMIN KYC ROUTES — Only admins can approve / reject / review
// ============================================================================

/**
 * @route   GET /api/v1/kyc/admin/stats
 * @desc    Get KYC statistics (counts by status, recent submissions)
 * @access  Admin
 */
router.get("/admin/stats", requireAdmin, KycController.getAdminKycStats);

/**
 * @route   GET /api/v1/kyc/admin/pending
 * @desc    Get paginated list of users pending KYC review
 * @access  Admin
 * @query   page, limit, status (default: in_review)
 */
router.get("/admin/pending", requireAdmin, KycController.getAdminPendingReviews);

/**
 * @route   GET /api/v1/kyc/admin/users/:userId
 * @desc    Get complete KYC detail for a specific user
 * @access  Admin
 */
router.get(
  "/admin/users/:userId",
  requireAdmin,
  KycController.getAdminUserKyc,
);

/**
 * @route   PATCH /api/v1/kyc/admin/users/:userId/review
 * @desc    Approve, reject, or reset a user's KYC status
 * @access  Admin
 * @body    { status: "approved" | "rejected" | "pending", notes?: string }
 */
router.patch(
  "/admin/users/:userId/review",
  requireAdmin,
  auditLogMiddleware,
  KycController.adminReviewKyc,
);

export default router;
