// ============================================================================
// TRANSACTION ROUTES
// ============================================================================

import { Router } from "express";
import TransactionController from "./transactions.controller.js";
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
import {
  validateTransactionRequest,
  validateTransferRequest,
  checkSufficientBalance,
  checkTransactionLimits,
  idempotencyMiddleware,
  detectDuplicateTransaction,
  basicFraudCheck,
} from "../../middleware/transaction.middleware.js";
import {
  requireKycVerified,
  enforceKycLimits,
  checkGeographicRestrictions,
  amlScreening,
} from "../../middleware/kyc.middleware.js";

const router = Router();

// Apply common middleware
router.use(requestLoggingMiddleware);
router.use(sanitizeInput);
router.use(authenticate); // All transaction routes require authentication
router.use(verifyAccountStatus); // Verify account is active

// ============================================================================
// USER TRANSACTION ROUTES
// ============================================================================

/**
 * @route   POST /api/transactions/transfer
 * @desc    Transfer to another user's wallet
 * @access  Private
 */
router.post(
  "/transfer",
  transactionRateLimit,
  idempotencyMiddleware,
  requireKycVerified,
  validateTransferRequest,
  enforceKycLimits,
  checkSufficientBalance,
  checkTransactionLimits,
  detectDuplicateTransaction,
  checkGeographicRestrictions,
  amlScreening,
  basicFraudCheck,
  auditLogMiddleware,
  TransactionController.internalTransfer,
);

/**
 * @route   POST /api/transactions/deposit
 * @desc    Deposit funds to wallet
 * @access  Private
 */
router.post(
  "/deposit",
  transactionRateLimit,
  idempotencyMiddleware,
  validateTransactionRequest,
  amlScreening,
  auditLogMiddleware,
  TransactionController.deposit,
);

/**
 * @route   POST /api/transactions/withdraw
 * @desc    Withdraw funds from wallet
 * @access  Private
 */
router.post(
  "/withdraw",
  transactionRateLimit,
  idempotencyMiddleware,
  requireKycVerified,
  validateTransactionRequest,
  enforceKycLimits,
  checkSufficientBalance,
  checkTransactionLimits,
  amlScreening,
  basicFraudCheck,
  auditLogMiddleware,
  TransactionController.withdraw,
);

/**
 * @route   GET /api/transactions
 * @desc    Get user's transactions
 * @access  Private
 */
router.get("/", TransactionController.getTransactions);

/**
 * @route   GET /api/transactions/stats
 * @desc    Get user's transaction statistics
 * @access  Private
 */
router.get("/stats", TransactionController.getTransactionStats);

/**
 * @route   GET /api/transactions/reference/:reference
 * @desc    Get transaction by reference number
 * @access  Private
 */
router.get(
  "/reference/:reference",
  TransactionController.getTransactionByReference,
);

/**
 * @route   GET /api/transactions/:id
 * @desc    Get single transaction by ID
 * @access  Private
 */
router.get("/:id", TransactionController.getTransactionById);

/**
 * @route   POST /api/transactions/:id/cancel
 * @desc    Cancel a pending transaction
 * @access  Private
 */
router.post(
  "/:id/cancel",
  auditLogMiddleware,
  TransactionController.cancelTransaction,
);

// ============================================================================
// ADMIN TRANSACTION ROUTES
// ============================================================================

/**
 * @route   GET /api/transactions/admin/all
 * @desc    Get all transactions (admin only)
 * @access  Private/Admin
 */
router.get(
  "/admin/all",
  requireAdmin,
  TransactionController.getAllTransactions,
);

/**
 * @route   PATCH /api/transactions/admin/:id/status
 * @desc    Update transaction status (admin only)
 * @access  Private/Admin
 */
router.patch(
  "/admin/:id/status",
  requireAdmin,
  auditLogMiddleware,
  TransactionController.updateTransactionStatus,
);

// ============================================================================
// EXPORT
// ============================================================================

export default router;
