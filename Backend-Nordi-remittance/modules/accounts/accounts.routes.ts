// ============================================================================
// ACCOUNT ROUTES
// ============================================================================

import { Router } from "express";
import AccountsController from "./accounts.controller.js";
import AccountApplicationsController from "./account-applications.controller.js";
import {
  authenticate,
  requireAdmin,
  verifyAccountStatus,
} from "../../middleware/auth.middleware.js";
import { rateLimit, sanitizeInput } from "../../middleware/security.middleware.js";
import {
  requestLoggingMiddleware,
  auditLogMiddleware,
} from "../../middleware/core.middleware.js";

const router = Router();

// Apply common middleware
router.use(requestLoggingMiddleware);
router.use(sanitizeInput);
router.use(authenticate); // All account routes require authentication

// ============================================================================
// WALLET ROUTES
// ============================================================================

/**
 * @route   GET /api/accounts/wallets
 * @desc    Get user's wallets
 * @access  Private
 */
router.get("/wallets", AccountsController.getWallets);

/**
 * @route   POST /api/accounts/wallets
 * @desc    Create new wallet
 * @access  Private
 */
router.post(
  "/wallets",
  verifyAccountStatus,
  rateLimit({ maxRequests: 5, windowMs: 3600000 }), // 5 wallets per hour
  AccountsController.createWallet,
);

/**
 * @route   GET /api/accounts/wallets/:id
 * @desc    Get specific wallet
 * @access  Private
 */
router.get("/wallets/:id", AccountsController.getWalletById);

/**
 * @route   PATCH /api/accounts/wallets/:id
 * @desc    Update wallet settings
 * @access  Private
 */
router.patch("/wallets/:id", AccountsController.updateWallet);

/**
 * @route   POST /api/accounts/wallets/:id/close
 * @desc    Close/Deactivate wallet
 * @access  Private
 */
router.post(
  "/wallets/:id/close",
  auditLogMiddleware,
  AccountsController.closeWallet,
);

/**
 * @route   GET /api/accounts/wallets/:id/history
 * @desc    Get wallet balance history (ledger entries)
 * @access  Private
 */
router.get("/wallets/:id/history", AccountsController.getBalanceHistory);

// ============================================================================
// ACCOUNT INFO ROUTES
// ============================================================================

/**
 * @route   GET /api/accounts/limits
 * @desc    Get account limits and usage
 * @access  Private
 */
router.get("/limits", AccountsController.getAccountLimits);

/**
 * @route   GET /api/accounts/summary
 * @desc    Get account summary/dashboard data
 * @access  Private
 */
router.get("/summary", AccountsController.getAccountSummary);

// ============================================================================
// BENEFICIARY ROUTES
// ============================================================================

/**
 * @route   GET /api/accounts/beneficiaries
 * @desc    Get saved beneficiaries
 * @access  Private
 */
router.get("/beneficiaries", AccountsController.getBeneficiaries);

/**
 * @route   POST /api/accounts/beneficiaries
 * @desc    Add new beneficiary
 * @access  Private
 */
router.post(
  "/beneficiaries",
  rateLimit({ maxRequests: 10, windowMs: 3600000 }), // 10 beneficiaries per hour
  AccountsController.addBeneficiary,
);

/**
 * @route   DELETE /api/accounts/beneficiaries/:id
 * @desc    Remove beneficiary
 * @access  Private
 */
router.delete("/beneficiaries/:id", AccountsController.removeBeneficiary);

// ============================================================================
// ADMIN ROUTES
// ============================================================================

/**
 * @route   GET /api/accounts/admin/wallets
 * @desc    Get all wallets (admin only)
 * @access  Private/Admin
 */
router.get("/admin/wallets", requireAdmin, AccountsController.getAllWallets);

/**
 * @route   PATCH /api/accounts/admin/wallets/:id/status
 * @desc    Update wallet status (admin only)
 * @access  Private/Admin
 */
router.patch(
  "/admin/wallets/:id/status",
  requireAdmin,
  auditLogMiddleware,
  AccountsController.updateWalletStatus,
);

// ============================================================================
// ACCOUNT APPLICATIONS ROUTES
// ============================================================================

/**
 * @route   GET /api/accounts/applications
 * @desc    Get user's account applications
 * @access  Private
 */
router.get("/applications", AccountApplicationsController.getUserApplications);

/**
 * @route   POST /api/accounts/applications/apply
 * @desc    Submit a new account application
 * @access  Private
 */
router.post(
  "/applications/apply",
  verifyAccountStatus,
  rateLimit({ maxRequests: 5, windowMs: 3600000 }),
  AccountApplicationsController.applyForAccount,
);

/**
 * @route   DELETE /api/accounts/applications/:id/cancel
 * @desc    Cancel a pending application
 * @access  Private
 */
router.delete("/applications/:id/cancel", AccountApplicationsController.cancelApplication);

// ============================================================================
// CARD-WALLET LINKING ROUTES
// ============================================================================

/**
 * @route   POST /api/accounts/wallets/:walletId/cards/:cardId/link
 * @desc    Link a card to an additional wallet
 * @access  Private
 */
router.post("/wallets/:walletId/cards/:cardId/link", AccountsController.linkCardToWallet);

/**
 * @route   DELETE /api/accounts/wallets/:walletId/cards/:cardId/unlink
 * @desc    Unlink a card from a wallet
 * @access  Private
 */
router.delete("/wallets/:walletId/cards/:cardId/unlink", AccountsController.unlinkCardFromWallet);

/**
 * @route   PATCH /api/accounts/cards/:cardId/funding-source
 * @desc    Set which wallet funds a card
 * @access  Private
 */
router.patch("/cards/:cardId/funding-source", AccountsController.setCardFundingSource);

// ============================================================================
// WALLET PRODUCT LINKING ROUTES
// ============================================================================

/**
 * @route   GET /api/accounts/wallets/:walletId/products
 * @desc    Get all products (cards, loans, investments) linked to a wallet
 * @access  Private
 */
router.get("/wallets/:walletId/products", AccountsController.getWalletProducts);

// ============================================================================
// CLOSED WALLETS / HISTORY
// ============================================================================

/**
 * @route   GET /api/accounts/wallets/closed
 * @desc    Get user's closed/deleted wallets for history viewing
 * @access  Private
 */
router.get("/wallets/closed", AccountsController.getClosedWallets);

// ============================================================================
// WALLET LIFECYCLE / POLICIES
// ============================================================================

/**
 * @route   GET /api/accounts/consolidated-limits
 * @desc    Get consolidated limits across all user wallets
 * @access  Private
 */
router.get("/consolidated-limits", AccountsController.getConsolidatedLimits);

/**
 * @route   GET /api/accounts/credit-score
 * @desc    Calculate and return user's credit score
 * @access  Private
 */
router.get("/credit-score", AccountsController.getCreditScore);

// ============================================================================
// EXPORT
// ============================================================================

export default router;
