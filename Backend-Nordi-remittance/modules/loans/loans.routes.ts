// ============================================================================
// LOAN ROUTES
// ============================================================================

import { Router } from "express";
import LoansController from "./loans.controller.js";
import {
  authenticate,
  requireAdmin,
  verifyAccountStatus,
} from "../../middleware/auth.middleware.js";
import {
  transactionRateLimit,
  sanitizeInput,
} from "../../middleware/security.middleware.js";
import {
  requestLoggingMiddleware,
  auditLogMiddleware,
} from "../../middleware/core.middleware.js";
import { requireKycVerified } from "../../middleware/kyc.middleware.js";

const router = Router();

// Apply common middleware
router.use(requestLoggingMiddleware);
router.use(sanitizeInput);
router.use(authenticate);
router.use(verifyAccountStatus);

// ============================================================================
// USER LOAN ROUTES
// ============================================================================

/**
 * @route   GET /api/loans
 * @desc    Get user's loans
 * @access  Private
 */
router.get("/", LoansController.getLoans);

/**
 * @route   GET /api/loans/:loanId
 * @desc    Get specific loan details
 * @access  Private
 */
router.get("/:loanId", LoansController.getLoanById);

/**
 * @route   GET /api/loans/eligibility/check
 * @desc    Check loan eligibility
 * @access  Private
 */
router.get(
  "/eligibility/check",
  requireKycVerified,
  LoansController.checkEligibility,
);

/**
 * @route   POST /api/loans/apply
 * @desc    Apply for a new loan
 * @access  Private
 */
router.post(
  "/apply",
  transactionRateLimit,
  requireKycVerified,
  auditLogMiddleware,
  // auditLogMiddleware('loan_application'),
  LoansController.applyForLoan,
);

/**
 * @route   GET /api/loans/applications
 * @desc    Get user's loan applications
 * @access  Private
 */
router.get("/applications", LoansController.getApplications);

/**
 * @route   GET /api/loans/:loanId/schedule
 * @desc    Get loan repayment schedule
 * @access  Private
 */
router.get("/:loanId/schedule", LoansController.getRepaymentSchedule);

/**
 * @route   POST /api/loans/:loanId/pay
 * @desc    Make a loan payment
 * @access  Private
 */
router.post(
  "/:loanId/pay",
  transactionRateLimit,
  auditLogMiddleware,
  // auditLogMiddleware('loan_payment'),
  LoansController.makePayment,
);

// ============================================================================
// ADMIN ROUTES
// ============================================================================

/**
 * @route   GET /api/loans/admin/applications
 * @desc    Get all loan applications
 * @access  Admin
 */
router.get(
  "/admin/applications",
  requireAdmin,
  LoansController.getAllApplications,
);

/**
 * @route   POST /api/loans/admin/applications/:applicationId/review
 * @desc    Review loan application
 * @access  Admin
 */
router.post(
  "/admin/applications/:applicationId/review",
  requireAdmin,
  // auditLogMiddleware('loan_review'),
  auditLogMiddleware,
  LoansController.reviewApplication,
);

/**
 * @route   POST /api/loans/admin/:loanId/disburse
 * @desc    Disburse approved loan
 * @access  Admin
 */
router.post(
  "/admin/:loanId/disburse",
  requireAdmin,
  // auditLogMiddleware('loan_disbursement'),
  auditLogMiddleware,
  LoansController.disburseLoan,
);

export default router;
