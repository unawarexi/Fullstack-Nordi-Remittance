// ============================================================================
// ATTACHMENT ROUTES
// ============================================================================

import { Router } from "express";
import AttachmentController from "../controllers/Attachment.controller.js";
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
router.use(verifyAccountStatus);

// ============================================================================
// USER ATTACHMENT ROUTES
// ============================================================================

/**
 * @route   GET /api/attachments
 * @desc    Get user's attachments
 * @access  Private
 */
router.get("/", AttachmentController.getAttachments);

/**
 * @route   GET /api/attachments/categories
 * @desc    Get attachment categories
 * @access  Private
 */
router.get("/categories", AttachmentController.getCategories);

/**
 * @route   GET /api/attachments/:attachmentId
 * @desc    Get specific attachment
 * @access  Private
 */
router.get("/:attachmentId", AttachmentController.getAttachmentById);

/**
 * @route   POST /api/attachments
 * @desc    Upload new attachment
 * @access  Private
 */
router.post("/", auditLogMiddleware, AttachmentController.uploadAttachment);

/**
 * @route   PUT /api/attachments/:attachmentId
 * @desc    Update attachment metadata
 * @access  Private
 */
router.put(
  "/:attachmentId",
  auditLogMiddleware,
  AttachmentController.updateAttachment,
);

/**
 * @route   DELETE /api/attachments/:attachmentId
 * @desc    Delete attachment
 * @access  Private
 */
router.delete(
  "/:attachmentId",
  auditLogMiddleware,
  AttachmentController.deleteAttachment,
);

// ============================================================================
// KYC DOCUMENT ROUTES
// ============================================================================

/**
 * @route   GET /api/attachments/kyc/documents
 * @desc    Get user's KYC documents
 * @access  Private
 */
router.get("/kyc/documents", AttachmentController.getKycDocuments);

/**
 * @route   POST /api/attachments/kyc/documents
 * @desc    Upload KYC document
 * @access  Private
 */
router.post(
  "/kyc/documents",
  auditLogMiddleware,
  AttachmentController.uploadKycDocument,
);

// ============================================================================
// ADMIN ROUTES
// ============================================================================

/**
 * @route   GET /api/attachments/admin/all
 * @desc    Get all attachments (admin)
 * @access  Admin
 */
router.get("/admin/all", requireAdmin, AttachmentController.getAllAttachments);

/**
 * @route   GET /api/attachments/admin/users/:userId/kyc
 * @desc    Get user's KYC documents (admin)
 * @access  Admin
 */
router.get(
  "/admin/users/:userId/kyc",
  requireAdmin,
  AttachmentController.getUserKycDocuments,
);

/**
 * @route   PUT /api/attachments/admin/kyc/:documentId/review
 * @desc    Review KYC document
 * @access  Admin
 */
router.put(
  "/admin/kyc/:documentId/review",
  requireAdmin,
  auditLogMiddleware,
  AttachmentController.reviewKycDocument,
);

export default router;
