// ============================================================================
// STATISTICS ROUTES
// ============================================================================

import { Router } from "express";
import StatisticsController from "../controllers/Statistics.controller.js";
import {
  authenticate,
  requireAdmin,
  verifyAccountStatus,
} from "../middleware/auth.middleware.js";
import { sanitizeInput } from "../middleware/security.middleware.js";
import { requestLoggingMiddleware } from "../middleware/core.middleware.js";

const router = Router();

// Apply common middleware
router.use(requestLoggingMiddleware);
router.use(sanitizeInput);
router.use(authenticate);
router.use(verifyAccountStatus);

// ============================================================================
// USER STATISTICS
// ============================================================================

/**
 * @route   GET /api/statistics/user
 * @desc    Get user's statistics and metrics
 * @access  Private
 */
router.get("/user", StatisticsController.getUserStatistics);

/**
 * @route   GET /api/statistics/transactions
 * @desc    Get user's transaction analytics
 * @access  Private
 */
router.get("/transactions", StatisticsController.getTransactionAnalytics);

/**
 * @route   GET /api/statistics/spending
 * @desc    Get user's spending insights
 * @access  Private
 */
router.get("/spending", StatisticsController.getSpendingInsights);

// ============================================================================
// ADMIN STATISTICS
// ============================================================================

/**
 * @route   GET /api/statistics/platform
 * @desc    Get platform-wide statistics
 * @access  Admin
 */
router.get(
  "/platform",
  requireAdmin,
  StatisticsController.getPlatformStatistics,
);

/**
 * @route   GET /api/statistics/growth
 * @desc    Get platform growth metrics
 * @access  Admin
 */
router.get("/growth", requireAdmin, StatisticsController.getGrowthMetrics);

/**
 * @route   POST /api/statistics/reports/daily
 * @desc    Generate daily report
 * @access  Admin
 */
router.post(
  "/reports/daily",
  requireAdmin,
  StatisticsController.generateDailyReport,
);

export default router;
