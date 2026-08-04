// ============================================================================
// STATISTICS CONTROLLER
// ============================================================================

import { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../types/index.js';
import { sendSuccess } from '../../core/helpers/response.helper.js';
import { UnauthorizedError } from '../../core/errors/AppError.js';
import { StatisticsUserService } from './statistics-user.service.js';
import { StatisticsAdminService } from './statistics-admin.service.js';

// ============================================================================
// USER STATISTICS
// ============================================================================

export async function getUserStatistics(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');
    const statistics = await StatisticsUserService.getUserStatistics(req.user.userId);
    sendSuccess(res, { statistics });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// TRANSACTION ANALYTICS
// ============================================================================

export async function getTransactionAnalytics(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');
    const analytics = await StatisticsUserService.getTransactionAnalytics(
      req.user.userId,
      req.query.period as string,
    );
    sendSuccess(res, { analytics });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// SPENDING INSIGHTS
// ============================================================================

export async function getSpendingInsights(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');
    const insights = await StatisticsUserService.getSpendingInsights(req.user.userId);
    sendSuccess(res, { insights });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// ADMIN: PLATFORM STATISTICS
// ============================================================================

export async function getPlatformStatistics(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');
    const statistics = await StatisticsAdminService.getPlatformStatistics();
    sendSuccess(res, { statistics });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// ADMIN: GROWTH METRICS
// ============================================================================

export async function getGrowthMetrics(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');
    const growth = await StatisticsAdminService.getGrowthMetrics(req.query.period as string);
    sendSuccess(res, { growth });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// ADMIN: DAILY REPORT
// ============================================================================

export async function generateDailyReport(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');
    const report = await StatisticsAdminService.generateDailyReport(
      req.query.date as string | undefined,
    );
    sendSuccess(res, { report });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export default {
  getUserStatistics,
  getTransactionAnalytics,
  getSpendingInsights,
  getPlatformStatistics,
  getGrowthMetrics,
  generateDailyReport,
};
