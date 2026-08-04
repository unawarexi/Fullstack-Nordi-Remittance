import { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../../types/index.js";
import { UnauthorizedError } from "../../core/errors/AppError.js";
import { sendSuccess, sendCreated } from "../../core/helpers/response.helper.js";
import { TransferVerificationService } from "./transfer-verification.service.js";

export async function initiateSecureTransfer(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const result = await TransferVerificationService.initiateSecureTransfer(
      req.user.userId,
      req.body,
      req.clientIp || req.ip || "",
      req.headers["user-agent"] as string || ""
    );
    sendCreated(res, result, "Transfer initiated - verification required");
  } catch (error) {
    next(error);
  }
}

export async function requestVerificationCode(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const result = await TransferVerificationService.requestVerificationCode(req.user.userId, req.body);
    sendSuccess(res, {
      message: result.message,
      verification: result.verification,
      nextAction: result.nextAction,
    }, `${result.codeTypeLabel} code sent to your email`);
  } catch (error) {
    next(error);
  }
}

export async function verifySecurityCode(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const result = await TransferVerificationService.verifySecurityCode(req.user.userId, req.body);
    
    if (result.fullyVerified) {
      sendSuccess(res, {
        message: result.message,
        verification: result.verification,
        transaction: result.transaction,
      }, "Transfer completed successfully");
    } else {
      sendSuccess(res, {
        message: result.message,
        verification: result.verification,
        nextAction: result.nextAction,
      }, result.stepStr);
    }
  } catch (error) {
    next(error);
  }
}

export async function getVerificationStatus(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const result = await TransferVerificationService.getVerificationStatus(req.user.userId, req.params.verificationId as string);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function cancelVerification(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const result = await TransferVerificationService.cancelVerification(req.user.userId, req.body);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function getPendingVerifications(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const result = await TransferVerificationService.getPendingVerifications(req.user.userId);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export default {
  initiateSecureTransfer,
  requestVerificationCode,
  verifySecurityCode,
  getVerificationStatus,
  cancelVerification,
  getPendingVerifications,
};
