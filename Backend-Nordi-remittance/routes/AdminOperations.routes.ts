// ============================================================================
// ADMIN OPERATIONS ROUTES
// ============================================================================
// Routes for admin-initiated financial operations
// ============================================================================

import { Router } from 'express';
import AdminOperationsController from '../controllers/AdminOperations.controller.js';
import { authenticate, requireAdmin, requireSuperAdmin, requirePermission } from '../middleware/Auth.middleware.js';
import { sanitizeInput } from '../middleware/Security.middleware.js';
import { requestLoggingMiddleware, auditLogMiddleware } from '../middleware/Core.middleware.js';

const router = Router();

// Apply common middleware
router.use(requestLoggingMiddleware);
router.use(sanitizeInput);

// All routes require authentication and admin access
router.use(authenticate);
router.use(requireAdmin);

// Apply audit logging to all routes (auto-detects action from URL)
router.use(auditLogMiddleware);

// ============================================================================
// WALLET OPERATIONS (Credit/Debit)
// ============================================================================

/**
 * @route   POST /api/admin/operations/credit
 * @desc    Credit a user's wallet (Admin initiated deposit/funding)
 * @access  Admin with canAdjustBalances permission
 */
router.post(
  '/credit',
  requirePermission('canAdjustBalances'),
  AdminOperationsController.creditUserWallet
);

/**
 * @route   POST /api/admin/operations/debit
 * @desc    Debit a user's wallet (Admin initiated withdrawal/deduction)
 * @access  Admin with canAdjustBalances permission
 */
router.post(
  '/debit',
  requirePermission('canAdjustBalances'),
  AdminOperationsController.debitUserWallet
);

/**
 * @route   POST /api/admin/operations/transfer
 * @desc    Transfer funds between two users (Admin initiated)
 * @access  Admin with canAdjustBalances permission
 */
router.post(
  '/transfer',
  requirePermission('canAdjustBalances'),
  AdminOperationsController.adminTransfer
);

// ============================================================================
// LOAN MANAGEMENT
// ============================================================================

/**
 * @route   POST /api/admin/operations/loans/:loanId/approve
 * @desc    Approve a loan application
 * @access  Admin with canApproveLoans permission
 */
router.post(
  '/loans/:loanId/approve',
  requirePermission('canApproveLoans'),
  AdminOperationsController.approveLoan
);

/**
 * @route   POST /api/admin/operations/loans/:loanId/reject
 * @desc    Reject a loan application
 * @access  Admin with canManageLoans permission
 */
router.post(
  '/loans/:loanId/reject',
  requirePermission('canManageLoans'),
  AdminOperationsController.rejectLoan
);

/**
 * @route   POST /api/admin/operations/loans/:loanId/disburse
 * @desc    Disburse an approved loan to user's wallet
 * @access  Admin with canApproveLoans permission
 */
router.post(
  '/loans/:loanId/disburse',
  requirePermission('canApproveLoans'),
  AdminOperationsController.disburseLoan
);

// ============================================================================
// CARD MANAGEMENT
// ============================================================================

/**
 * @route   POST /api/admin/operations/cards/:cardId/approve
 * @desc    Approve a card application
 * @access  Admin with canManageCards permission
 */
router.post(
  '/cards/:cardId/approve',
  requirePermission('canManageCards'),
  AdminOperationsController.approveCard
);

/**
 * @route   POST /api/admin/operations/cards/:cardId/reject
 * @desc    Reject a card application
 * @access  Admin with canManageCards permission
 */
router.post(
  '/cards/:cardId/reject',
  requirePermission('canManageCards'),
  AdminOperationsController.rejectCard
);

// ============================================================================
// INVESTMENT MANAGEMENT
// ============================================================================

/**
 * @route   POST /api/admin/operations/investments/:investmentId/approve
 * @desc    Approve an investment
 * @access  Admin with canManageInvestments permission
 */
router.post(
  '/investments/:investmentId/approve',
  requirePermission('canManageInvestments'),
  AdminOperationsController.approveInvestment
);

/**
 * @route   POST /api/admin/operations/investments/:investmentId/add-returns
 * @desc    Add returns/earnings to an investment
 * @access  Admin with canManageInvestments permission
 */
router.post(
  '/investments/:investmentId/add-returns',
  requirePermission('canManageInvestments'),
  AdminOperationsController.addInvestmentReturns
);

// ============================================================================
// TRANSACTION MANAGEMENT
// ============================================================================

/**
 * @route   GET /api/admin/operations/transactions/pending
 * @desc    Get all pending transactions for review
 * @access  Admin with canViewTransactions permission
 */
router.get(
  '/transactions/pending',
  requirePermission('canViewTransactions'),
  AdminOperationsController.getPendingTransactions
);

/**
 * @route   POST /api/admin/operations/transactions/:transactionId/approve
 * @desc    Approve a pending transaction
 * @access  Admin with canReverseTransactions permission
 */
router.post(
  '/transactions/:transactionId/approve',
  requirePermission('canReverseTransactions'),
  AdminOperationsController.approveTransaction
);

/**
 * @route   POST /api/admin/operations/transactions/:transactionId/reject
 * @desc    Reject a pending transaction
 * @access  Admin with canReverseTransactions permission
 */
router.post(
  '/transactions/:transactionId/reject',
  requirePermission('canReverseTransactions'),
  AdminOperationsController.rejectTransaction
);

/**
 * @route   POST /api/admin/operations/transactions/:transactionId/reverse
 * @desc    Reverse/refund a completed transaction
 * @access  Admin with canReverseTransactions permission
 */
router.post(
  '/transactions/:transactionId/reverse',
  requirePermission('canReverseTransactions'),
  AdminOperationsController.reverseTransaction
);

// ============================================================================
// BULK OPERATIONS (Super Admin Only)
// ============================================================================

/**
 * @route   POST /api/admin/operations/bulk/credit
 * @desc    Bulk credit multiple users
 * @access  Super Admin only
 */
router.post(
  '/bulk/credit',
  requireSuperAdmin,
  AdminOperationsController.bulkCredit
);

export default router;
