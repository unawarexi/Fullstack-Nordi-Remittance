// ============================================================================
// LOANS CONTROLLER
// ============================================================================

import { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../../types/index.js";
import {
  sendSuccess,
  sendCreated,
  sendPaginated,
} from "../../core/helpers/response.helper.js";
import { UnauthorizedError } from "../../core/errors/AppError.js";
import { LoansUserService } from "./loans-user.service.js";
import { LoansAdminService } from "./loans-admin.service.js";

// ============================================================================
// GET USER LOANS
// ============================================================================

export async function getLoans(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const result = await LoansUserService.getLoans(req.user.userId, req.query);

    sendPaginated(res, result.loans, {
      page: result.page,
      limit: result.limit,
      total: result.total,
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// GET SINGLE LOAN
// ============================================================================

export async function getLoanById(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const { id } = req.params;
    const result = await LoansUserService.getLoanById(req.user.userId, id as string);

    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// CHECK LOAN ELIGIBILITY
// ============================================================================

export async function checkEligibility(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const result = await LoansUserService.checkEligibility(req.user.userId);

    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// APPLY FOR LOAN
// ============================================================================

export async function applyForLoan(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const result = await LoansUserService.applyForLoan(
      req.user.userId,
      req.body,
    );

    sendCreated(res, result, "Loan application submitted successfully");
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// GET LOAN APPLICATIONS
// ============================================================================

export async function getApplications(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const result = await LoansUserService.getApplications(req.user.userId);

    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// MAKE LOAN PAYMENT
// ============================================================================

export async function makePayment(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const { id } = req.params;
    const result = await LoansUserService.makePayment(
      req.user.userId,
      id as string,
      req.body,
    );

    sendSuccess(res, result, "Payment processed successfully");
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// GET REPAYMENT SCHEDULE
// ============================================================================

export async function getRepaymentSchedule(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const { id } = req.params;
    const result = await LoansUserService.getRepaymentSchedule(
      req.user.userId,
      id as string,
    );

    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// ADMIN: GET ALL APPLICATIONS
// ============================================================================

export async function getAllApplications(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const result = await LoansAdminService.getAllApplications(req.query);

    sendPaginated(res, result.applications, {
      page: result.page,
      limit: result.limit,
      total: result.total,
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// ADMIN: REVIEW APPLICATION
// ============================================================================

export async function reviewApplication(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const { id } = req.params;
    const result = await LoansAdminService.reviewApplication(
      req.user.userId,
      id as string,
      req.body,
    );

    sendSuccess(
      res,
      { application: result.application },
      `Application ${result.decision}ed successfully`,
    );
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// ADMIN: DISBURSE LOAN
// ============================================================================

export async function disburseLoan(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const { id } = req.params;
    const result = await LoansAdminService.disburseLoan(req.user.userId, id as string);

    sendSuccess(res, result, "Loan disbursed successfully");
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export default {
  getLoans,
  getLoanById,
  checkEligibility,
  applyForLoan,
  getApplications,
  makePayment,
  getRepaymentSchedule,
  getAllApplications,
  reviewApplication,
  disburseLoan,
};
