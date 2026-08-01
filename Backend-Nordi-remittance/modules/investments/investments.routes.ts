// ============================================================================
// INVESTMENT ROUTES
// ============================================================================

import { Router } from "express";
import InvestmentController from "./investments.controller.js";
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
  requireKycVerified,
  enforceKycLimits,
} from "../../middleware/kyc.middleware.js";

const router = Router();

// Apply common middleware
router.use(requestLoggingMiddleware);
router.use(sanitizeInput);
router.use(authenticate);
router.use(verifyAccountStatus);

// ============================================================================
// SAVINGS GOALS
// ============================================================================

/**
 * @route   GET /api/investments/savings
 * @desc    Get user's savings goals
 * @access  Private
 */
router.get("/savings", InvestmentController.getSavingsGoals);

/**
 * @route   POST /api/investments/savings
 * @desc    Create a new savings goal
 * @access  Private
 */
router.post(
  "/savings",
  auditLogMiddleware,
  InvestmentController.createSavingsGoal,
);

/**
 * @route   POST /api/investments/savings/:goalId/deposit
 * @desc    Deposit to savings goal
 * @access  Private
 */
router.post(
  "/savings/:goalId/deposit",
  transactionRateLimit,
  enforceKycLimits,
  auditLogMiddleware,
  InvestmentController.depositToGoal,
);

/**
 * @route   POST /api/investments/savings/:goalId/withdraw
 * @desc    Withdraw from savings goal
 * @access  Private
 */
router.post(
  "/savings/:goalId/withdraw",
  transactionRateLimit,
  auditLogMiddleware,
  InvestmentController.withdrawFromGoal,
);

/**
 * @route   DELETE /api/investments/savings/:goalId
 * @desc    Delete a savings goal
 * @access  Private
 */
router.delete(
  "/savings/:goalId",
  auditLogMiddleware,
  InvestmentController.deleteSavingsGoal,
);

// ============================================================================
// INVESTMENT ACCOUNT & PORTFOLIO
// ============================================================================

/**
 * @route   GET /api/investments/account
 * @desc    Get user's investment account
 * @access  Private
 */
router.get("/account", InvestmentController.getInvestmentAccount);

/**
 * @route   POST /api/investments/account
 * @desc    Create investment account
 * @access  Private
 */
router.post(
  "/account",
  requireKycVerified,
  auditLogMiddleware,
  InvestmentController.createInvestmentAccount,
);

/**
 * @route   GET /api/investments/portfolio
 * @desc    Get user's investment portfolio
 * @access  Private
 */
router.get("/portfolio", InvestmentController.getPortfolio);

/**
 * @route   GET /api/investments/portfolio/transactions
 * @desc    Get portfolio transaction history
 * @access  Private
 */
router.get(
  "/portfolio/transactions",
  InvestmentController.getPortfolioTransactions,
);

/**
 * @route   GET /api/investments/summary
 * @desc    Get investment summary and performance
 * @access  Private
 */
router.get("/summary", InvestmentController.getInvestmentSummary);

// ============================================================================
// ASSETS & TRADING
// ============================================================================

/**
 * @route   GET /api/investments/assets
 * @desc    Get available investment assets
 * @access  Private
 */
router.get("/assets", InvestmentController.getAssets);

/**
 * @route   GET /api/investments/assets/:assetId
 * @desc    Get specific asset details
 * @access  Private
 */
router.get("/assets/:assetId", InvestmentController.getAssetById);

/**
 * @route   POST /api/investments/buy
 * @desc    Buy investment asset
 * @access  Private
 */
router.post(
  "/buy",
  transactionRateLimit,
  requireKycVerified,
  enforceKycLimits,
  auditLogMiddleware,
  InvestmentController.buyAsset,
);

/**
 * @route   POST /api/investments/sell
 * @desc    Sell investment asset
 * @access  Private
 */
router.post(
  "/sell",
  transactionRateLimit,
  requireKycVerified,
  auditLogMiddleware,
  InvestmentController.sellAsset,
);

// ============================================================================
// INTEREST PLANS
// ============================================================================

/**
 * @route   GET /api/investments/plans
 * @desc    Get available interest/investment plans
 * @access  Private
 */
router.get("/plans", InvestmentController.getInterestPlans);

export default router;
