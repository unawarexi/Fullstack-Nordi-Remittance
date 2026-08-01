// ============================================================================
// ACCOUNTS CONTROLLER
// ============================================================================
// Handles HTTP request/response logic and delegates business logic to services.
// ============================================================================

import { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../../types/index.js";
import {
  sendSuccess,
  sendCreated,
  sendPaginated,
} from "../../core/helpers/response.helper.js";
import { UnauthorizedError } from "../../core/errors/AppError.js";

// Services
import { WalletService } from "./wallet.service.js";
import { AccountAnalyticsService } from "./account-analytics.service.js";
import { BeneficiaryService } from "./beneficiary.service.js";

// ============================================================================
// WALLET MANAGEMENT
// ============================================================================

export async function getWallets(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const result = await WalletService.getWallets(req.user.userId);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function getWalletById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const result = await WalletService.getWalletById(req.user.userId, req.params.id as string);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function createWallet(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const result = await WalletService.createWallet(req.user.userId, req.body);
    sendCreated(res, result, "Wallet created successfully");
  } catch (error) {
    next(error);
  }
}

export async function updateWallet(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const result = await WalletService.updateWallet(req.user.userId, req.params.id as string, req.body);
    sendSuccess(res, result, "Wallet updated successfully");
  } catch (error) {
    next(error);
  }
}

export async function closeWallet(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const result = await WalletService.closeWallet(req.user.userId, req.params.id as string);
    sendSuccess(res, result, "Wallet closed successfully");
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// ACCOUNT ANALYTICS & SUMMARY
// ============================================================================

export async function getBalanceHistory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    
    const filters = {
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      type: req.query.type as string
    };

    const result = await AccountAnalyticsService.getBalanceHistory(
      req.user.userId, 
      req.params.id as string, 
      filters, 
      { page, limit }
    );
    
    sendPaginated(res, result.entries, { page: result.page, limit: result.limit, total: result.total }, "Balance history retrieved");
  } catch (error) {
    next(error);
  }
}

export async function getAccountLimits(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const result = await AccountAnalyticsService.getAccountLimits(req.user.userId);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function getAccountSummary(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const result = await AccountAnalyticsService.getAccountSummary(req.user.userId);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// BENEFICIARIES
// ============================================================================

export async function getBeneficiaries(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const result = await BeneficiaryService.getBeneficiaries(req.user.userId);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function addBeneficiary(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const result = await BeneficiaryService.addBeneficiary(req.user.userId, req.body);
    sendCreated(res, result, "Beneficiary added successfully");
  } catch (error) {
    next(error);
  }
}

export async function removeBeneficiary(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    await BeneficiaryService.removeBeneficiary(req.user.userId, req.params.id);
    sendSuccess(res, null, "Beneficiary removed successfully");
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// ADMIN: WALLETS
// ============================================================================

export async function getAllWallets(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    
    const filters = {
      status: req.query.status as string,
      userId: req.query.userId as string
    };

    const result = await WalletService.getAllWallets(filters, { page, limit });
    sendPaginated(res, result.wallets, { page: result.page, limit: result.limit, total: result.total });
  } catch (error) {
    next(error);
  }
}

export async function updateWalletStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const { status, reason } = req.body;
    const result = await WalletService.updateWalletStatus(req.params.id as string, status, reason);
    sendSuccess(res, result, `Wallet status updated to ${status}`);
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export default {
  getWallets,
  getWalletById,
  createWallet,
  updateWallet,
  closeWallet,
  getBalanceHistory,
  getAccountLimits,
  getAccountSummary,
  getBeneficiaries,
  addBeneficiary,
  removeBeneficiary,
  getAllWallets,
  updateWalletStatus,
};
