import { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../../types/index.js";
import { UnauthorizedError } from "../../core/errors/AppError.js";
import { sendSuccess, sendCreated, sendPaginated } from "../../core/helpers/response.helper.js";

import { TransactionsTransferService } from "./transactions-transfer.service.js";
import { TransactionsQueryService } from "./transactions-query.service.js";
import { TransactionsAdminService } from "./transactions-admin.service.js";

// ============================================================================
// INTERNAL TRANSFER (WALLET TO WALLET)
// ============================================================================
export async function internalTransfer(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const result = await TransactionsTransferService.internalTransfer(req.user.userId, req.body, req.ip || "", req.headers["user-agent"] || "");
    sendCreated(res, result, "Transfer successful");
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// DEPOSIT
// ============================================================================
export async function deposit(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const result = await TransactionsTransferService.deposit(req.user.userId, req.body, req.ip || "", req.headers["user-agent"] || "");
    sendCreated(res, result, "Deposit successful");
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// WITHDRAWAL
// ============================================================================
export async function withdraw(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const result = await TransactionsTransferService.withdraw(req.user.userId, req.body, req.ip || "", req.headers["user-agent"] || "");
    sendCreated(res, result);
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// CANCEL PENDING TRANSACTION
// ============================================================================
export async function cancelTransaction(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const result = await TransactionsTransferService.cancelTransaction(req.user.userId, req.params.id as string, req.body.reason);
    sendSuccess(res, result, "Transaction cancelled successfully");
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// GET TRANSACTIONS
// ============================================================================
export async function getTransactions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const data = await TransactionsQueryService.getTransactions(req.user.userId, req.query);
    sendPaginated(res, data.transactions, { page: data.page, limit: data.limit, total: data.total }, data.cached ? "Transactions retrieved successfully (cached)" : "Transactions retrieved successfully");
  } catch (error) {
    next(error);
  }
}

export async function getTransactionById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const transaction = await TransactionsQueryService.getTransactionById(req.user.userId, req.params.id as string);
    sendSuccess(res, { transaction });
  } catch (error) {
    next(error);
  }
}

export async function getTransactionByReference(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const transaction = await TransactionsQueryService.getTransactionByReference(req.user.userId, req.params.reference as string);
    sendSuccess(res, { transaction });
  } catch (error) {
    next(error);
  }
}

export async function getTransactionStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const stats = await TransactionsQueryService.getTransactionStats(req.user.userId);
    sendSuccess(res, stats);
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// ADMIN: GET ALL TRANSACTIONS
// ============================================================================
export async function getAllTransactions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const data = await TransactionsAdminService.getAllTransactions(req.query);
    sendPaginated(res, data.transactions, { page: data.page, limit: data.limit, total: data.total });
  } catch (error) {
    next(error);
  }
}

export async function updateTransactionStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const transaction = await TransactionsAdminService.updateTransactionStatus(req.user.userId, req.params.id as string, req.body);
    sendSuccess(res, { transaction });
  } catch (error) {
    next(error);
  }
}

export default {
  internalTransfer,
  deposit,
  withdraw,
  getTransactions,
  getTransactionById,
  getTransactionByReference,
  getTransactionStats,
  cancelTransaction,
  getAllTransactions,
  updateTransactionStatus,
};
