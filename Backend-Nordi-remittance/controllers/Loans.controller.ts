// ============================================================================
// LOANS CONTROLLER
// ============================================================================

import { Response, NextFunction } from "express";
import mongoose from "mongoose";
import type { AuthenticatedRequest } from "../types/index.js";
import {
  Loans,
  LoanApplications,
  CreditAssessments,
  RepaymentSchedules,
  LoanRepayments,
} from "../models/LoansModel.js";
import { Wallets, LedgerEntries } from "../models/AccountsModel.js";
import Transactions from "../models/TransactionModel.js";
import Users from "../models/UserModel.js";
import { generateReferenceNumber } from "../core/helpers/generator.js";
import {
  sendSuccess,
  sendCreated,
  sendPaginated,
} from "../core/helpers/response.helper.js";
import {
  UnauthorizedError,
  ValidationError,
  NotFoundError,
  ForbiddenError,
} from "../core/errors/AppError.js";
import { sendTemplatedMail } from "../services/mailer.service.js";
import EmailContentGenerator from "../core/mail/Mail-content.js";
import { emitToUser } from "../services/websocket.service.js";
import { WS } from "../core/constants/ws-events.js";

// Initialize email content generator
const emailGenerator = new EmailContentGenerator();

// Helper functions for wallet balance operations (Map-based)
function getWalletBalance(wallet: any, currency: string): number {
  if (wallet.balances instanceof Map) {
    return wallet.balances.get(currency) || 0;
  }
  if (wallet.balances && typeof wallet.balances === "object") {
    return wallet.balances[currency] || 0;
  }
  return 0;
}

function updateWalletBalance(
  wallet: any,
  currency: string,
  newBalance: number,
): void {
  if (wallet.balances instanceof Map) {
    wallet.balances.set(currency, newBalance);
  } else if (wallet.balances && typeof wallet.balances === "object") {
    wallet.balances[currency] = newBalance;
  } else {
    wallet.balances = new Map([[currency, newBalance]]);
  }
}

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

    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;

    const filter: any = { user: req.user.userId };
    if (req.query.status) filter.status = req.query.status;

    const [loans, total] = await Promise.all([
      Loans.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("application")
        .lean(),
      Loans.countDocuments(filter),
    ]);

    sendPaginated(res, loans, { page, limit, total });
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

    const loan = await Loans.findOne({
      $or: [{ _id: id }, { loanId: id }],
      user: req.user.userId,
    })
      .populate("application")
      .lean();

    if (!loan) throw new NotFoundError("Loan not found");

    // Get repayment schedule
    const schedule = await RepaymentSchedules.find({ loan: loan._id })
      .sort({ dueDate: 1 })
      .lean();

    // Get payment history
    const payments = await LoanRepayments.find({ loan: loan._id })
      .sort({ paymentDate: -1 })
      .lean();

    sendSuccess(res, { loan, schedule, payments });
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

    const user = await Users.findById(req.user.userId);
    if (!user) throw new NotFoundError("User not found");

    // KYC check
    if (user.kycStatus !== "approved") {
      sendSuccess(res, {
        eligible: false,
        reason: "KYC verification required",
        maxAmount: 0,
      });
      return;
    }

    // Check existing active loans
    const activeLoans = await Loans.find({
      user: req.user.userId,
      status: { $in: ["active", "pending"] },
    })
      .select("outstandingBalance status")
      .lean();

    const totalOutstanding = activeLoans.reduce(
      (sum, loan) => sum + (loan.outstandingBalance || 0),
      0,
    );

    // Get credit assessment
    let creditAssessment = await CreditAssessments.findOne({
      user: req.user.userId,
    }).sort({ createdAt: -1 });

    // Calculate eligibility based on account history
    const userCreatedAt = (user as any).createdAt;
    const accountAge = Math.floor(
      (Date.now() - new Date(userCreatedAt).getTime()) /
        (1000 * 60 * 60 * 1000 * 24),
    );

    // Get transaction history for scoring
    const transactions = await Transactions.find({
      wallet: { $exists: true },
      status: "completed",
      createdAt: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
    })
      .select("amount")
      .lean();

    const monthlyIncome =
      transactions.length > 0
        ? transactions.reduce((sum, t) => sum + t.amount, 0) / 3
        : 0;

    // Simple credit scoring
    let creditScore = 500;
    if (accountAge > 30) creditScore += 50;
    if (accountAge > 90) creditScore += 50;
    if (accountAge > 180) creditScore += 50;
    if (transactions.length > 10) creditScore += 25;
    if (transactions.length > 50) creditScore += 50;
    if (monthlyIncome > 1000) creditScore += 50;
    if (monthlyIncome > 5000) creditScore += 100;
    if (activeLoans.length === 0) creditScore += 50;
    if (totalOutstanding > 0) creditScore -= 100;

    // Calculate max loan amount
    let maxAmount = 0;
    if (creditScore >= 550) maxAmount = Math.min(monthlyIncome * 2, 5000);
    if (creditScore >= 600) maxAmount = Math.min(monthlyIncome * 3, 10000);
    if (creditScore >= 650) maxAmount = Math.min(monthlyIncome * 4, 25000);
    if (creditScore >= 700) maxAmount = Math.min(monthlyIncome * 5, 50000);

    // Cap based on outstanding
    maxAmount = Math.max(0, maxAmount - totalOutstanding);

    // Save/update credit assessment
    if (!creditAssessment) {
      creditAssessment = new CreditAssessments({
        user: req.user.userId,
        creditScore,
        monthlyIncome,
        totalDebt: totalOutstanding,
        debtToIncomeRatio:
          monthlyIncome > 0 ? totalOutstanding / monthlyIncome : 0,
        recommendation: creditScore >= 550 ? "approve" : "deny",
        maxRecommendedAmount: maxAmount,
        assessmentDate: new Date(),
      });
      await creditAssessment.save();
    }

    sendSuccess(res, {
      eligible: maxAmount > 0,
      creditScore,
      maxAmount,
      monthlyIncome,
      outstandingDebt: totalOutstanding,
      accountAgeDays: accountAge,
      reason: maxAmount > 0 ? null : "Insufficient credit history or income",
    });
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
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const { amount, purpose, termMonths, disbursementWalletId } = req.body;

    const user = await Users.findById(req.user.userId).session(session);
    if (!user) throw new NotFoundError("User not found");

    if (user.kycStatus !== "approved") {
      throw new ForbiddenError("KYC verification required");
    }

    // Validate amount
    if (amount < 100) throw new ValidationError("Minimum loan amount is $100");
    if (amount > 50000)
      throw new ValidationError("Maximum loan amount is $50,000");

    // Validate term
    if (termMonths < 1 || termMonths > 60) {
      throw new ValidationError("Loan term must be between 1 and 60 months");
    }

    // Verify wallet
    const wallet = await Wallets.findOne({
      _id: disbursementWalletId,
      userId: req.user.userId,
      status: "active",
    }).session(session);

    if (!wallet) throw new NotFoundError("Disbursement wallet not found");

    // Check for pending applications
    const pendingApp = await LoanApplications.findOne({
      user: req.user.userId,
      status: "pending",
    }).session(session);

    if (pendingApp) {
      throw new ValidationError("You already have a pending loan application");
    }

    // Calculate interest rate based on term and credit score
    const creditAssessment = await CreditAssessments.findOne({
      user: req.user.userId,
    })
      .sort({ createdAt: -1 })
      .session(session);

    let interestRate = 15; // Base rate 15% per year
    if (creditAssessment) {
      if (creditAssessment.creditScore >= 700) interestRate = 8;
      else if (creditAssessment.creditScore >= 650) interestRate = 10;
      else if (creditAssessment.creditScore >= 600) interestRate = 12;
    }

    // Add term adjustment
    if (termMonths > 24) interestRate += 1;
    if (termMonths > 36) interestRate += 1;

    // Calculate monthly payment (amortization formula)
    const monthlyRate = interestRate / 100 / 12;
    const monthlyPayment =
      (amount * (monthlyRate * Math.pow(1 + monthlyRate, termMonths))) /
      (Math.pow(1 + monthlyRate, termMonths) - 1);
    const totalRepayment = monthlyPayment * termMonths;

    // Create loan application
    const application = new LoanApplications({
      user: req.user.userId,
      loanType: purpose,
      requestedAmount: amount,
      term: termMonths,
      purpose,
      status: "submitted" as const,
      employmentInfo: {
        employmentStatus: "employed",
        occupation: "Unknown",
        monthlyIncome: 0,
      },
      financialInfo: {
        monthlyExpenses: 0,
        existingDebts: 0,
        assets: 0,
      },
      submittedAt: new Date(),
    });

    await application.save({ session });

    await session.commitTransaction();

    // Send confirmation email using template
    const emailContent = emailGenerator.loanApplicationEmail({
      applicantName: (user as any).firstName || "Customer",
      applicationId: application.applicationId || application._id.toString(),
      status: "under_review",
      amount: String(amount),
      requestedAmount: String(amount),
      currency: "USD",
      loanType: purpose || "Personal Loan",
      term: termMonths,
    });

    sendTemplatedMail((user as any).email, emailContent).catch(console.error);

    emitToUser(req.user!.userId, WS.LOAN.APPLICATION_SUBMITTED, {
      applicationId: application.applicationId || application._id,
      amount,
      termMonths,
      status: application.status,
      timestamp: new Date().toISOString(),
    });

    sendCreated(
      res,
      {
        application: {
          id: application._id,
          applicationId: application.applicationId,
          status: application.status,
          requestedAmount: amount,
          interestRate,
          termMonths,
          monthlyPayment: Math.round(monthlyPayment * 100) / 100,
          totalRepayment: Math.round(totalRepayment * 100) / 100,
        },
      },
      "Loan application submitted successfully",
    );
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
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

    const applications = await LoanApplications.find({ user: req.user.userId })
      .sort({ createdAt: -1 })
      .lean();

    sendSuccess(res, { applications });
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
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const { id } = req.params;
    const { amount, walletId, paymentType } = req.body; // paymentType: 'scheduled' | 'extra' | 'full'

    const loan = await Loans.findOne({
      $or: [{ _id: id }, { loanId: id }],
      user: req.user.userId,
      status: { $in: ["active", "pending"] },
    }).session(session);

    if (!loan) throw new NotFoundError("Active loan not found");

    // Verify wallet
    const wallet = await Wallets.findOne({
      _id: walletId,
      user: req.user.userId,
      status: "active",
    }).session(session);

    if (!wallet) throw new NotFoundError("Wallet not found");

    // Helper function to get wallet balance
    const getWalletBalance = (w: any, currency: string = "USD"): number => {
      if (!w || !w.balances) return 0;
      const balances =
        w.balances instanceof Map
          ? w.balances
          : new Map(Object.entries(w.balances));
      return balances.get(currency) || 0;
    };

    const currency = loan.currency || "USD";
    const walletBalance = getWalletBalance(wallet, currency);

    // Calculate payment amount
    let paymentAmount = amount;
    if (paymentType === "full") {
      paymentAmount = loan.outstandingBalance;
    }

    if (paymentAmount > loan.outstandingBalance) {
      paymentAmount = loan.outstandingBalance;
    }

    if (walletBalance < paymentAmount) {
      throw new ValidationError("Insufficient wallet balance");
    }

    // Deduct from wallet
    if (!wallet.balances) {
      wallet.balances = new Map();
    }
    wallet.balances.set(currency, walletBalance - paymentAmount);
    await wallet.save({ session });

    // Create main transaction for ledger
    const reference = generateReferenceNumber();
    const transaction = await Transactions.create(
      [
        {
          wallet: wallet._id,
          type: "payment",
          category: "loans",
          categoryItemId: loan._id.toString(),
          amount: paymentAmount,
          currency,
          status: "completed",
          referenceNumber: reference,
          initiatedBy: req.user.userId,
          description: `Loan payment - ${loan.loanId}`,
        },
      ],
      { session },
    );

    // Create ledger entry
    await LedgerEntries.create(
      [
        {
          wallet: wallet._id,
          transaction: transaction[0]._id,
          entryType: "debit",
          amount: paymentAmount,
          currency,
          balance: getWalletBalance(wallet, currency),
          description: `Loan payment - ${loan.loanId}`,
          accountingDate: new Date(),
        },
      ],
      { session },
    );

    // Calculate interest/principal split (simplified)
    const interestPortion = Math.min(
      paymentAmount,
      loan.outstandingBalance * (loan.interestRate / 100 / 12),
    );
    const principalPortion = paymentAmount - interestPortion;

    // Create payment record
    const payment = new LoanRepayments({
      loan: loan._id,
      amount: paymentAmount,
      principalPaid: principalPortion,
      interestPaid: interestPortion,
      currency,
      paymentMethod: "wallet",
      transaction: transaction[0]._id,
      status: "completed",
      remainingBalance: loan.outstandingBalance - paymentAmount,
      paymentDate: new Date(),
    });

    await payment.save({ session });

    // Update loan
    loan.outstandingBalance -= paymentAmount;

    if (loan.outstandingBalance <= 0) {
      loan.status = "paid";
      loan.closedAt = new Date();
    }

    await loan.save({ session });

    // Update repayment schedule if exists
    if (paymentType === "scheduled" || paymentType === "extra") {
      const scheduleDoc = await RepaymentSchedules.findOne({
        loan: loan._id,
      }).session(session);

      if (scheduleDoc && scheduleDoc.installments) {
        let remaining = paymentAmount;
        for (const installment of scheduleDoc.installments) {
          if (remaining <= 0) break;

          if (
            installment.status === "pending" ||
            installment.status === "overdue" ||
            installment.status === "partially_paid"
          ) {
            const installmentTotal = installment.totalAmount || 0;
            if (remaining >= installmentTotal) {
              installment.status = "paid";
              installment.paidDate = new Date();
              installment.paidAmount = installmentTotal;
              remaining -= installmentTotal;
            } else {
              installment.paidAmount =
                (installment.paidAmount || 0) + remaining;
              installment.status = "partially_paid";
              remaining = 0;
            }
          }
        }
        await scheduleDoc.save({ session });
      }
    }

    await session.commitTransaction();

    emitToUser(req.user!.userId, WS.LOAN.PAYMENT_MADE, {
      loanId: loan.loanId || loan._id,
      paymentAmount,
      reference,
      outstandingBalance: loan.outstandingBalance,
      loanStatus: loan.status,
      timestamp: new Date().toISOString(),
    });

    sendSuccess(
      res,
      {
        payment: {
          id: payment._id,
          amount: paymentAmount,
          principalPortion,
          interestPortion,
          reference,
        },
        loan: {
          id: loan._id,
          loanId: loan.loanId,
          status: loan.status,
          outstandingBalance: loan.outstandingBalance,
        },
      },
      "Payment processed successfully",
    );
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
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

    const loan = await Loans.findOne({
      $or: [{ _id: id }, { loanId: id }],
      user: req.user.userId,
    });

    if (!loan) throw new NotFoundError("Loan not found");

    const schedule = await RepaymentSchedules.findOne({
      loan: loan._id,
    }).lean();

    if (!schedule) {
      sendSuccess(res, { schedule: null, summary: null });
      return;
    }

    const installments = (schedule as any).installments || [];
    const summary = {
      totalScheduled: installments.reduce(
        (sum: number, s: any) => sum + (s.totalAmount || 0),
        0,
      ),
      totalPaid: installments
        .filter((s: any) => s.status === "paid")
        .reduce((sum: number, s: any) => sum + (s.totalAmount || 0), 0),
      nextPayment: installments.find((s: any) => s.status === "pending"),
      overduePayments: installments.filter((s: any) => s.status === "overdue")
        .length,
    };

    sendSuccess(res, { schedule, summary });
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

    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (req.query.status) filter.status = req.query.status;

    const [applications, total] = await Promise.all([
      LoanApplications.find(filter)
        .populate("user", "firstName lastName email")
        .populate("creditAssessment")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      LoanApplications.countDocuments(filter),
    ]);

    sendPaginated(res, applications, { page, limit, total });
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
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const { id } = req.params;
    const { decision, approvedAmount, notes, reason } = req.body;

    const application = await LoanApplications.findById(id)
      .populate("user")
      .session(session);

    if (!application) throw new NotFoundError("Application not found");
    if (
      application.status !== "submitted" &&
      application.status !== "under_review"
    ) {
      throw new ValidationError(
        "Application has already been reviewed or is not ready for review",
      );
    }

    const user = application.user as any;

    if (decision === "approve") {
      const finalAmount = approvedAmount || application.requestedAmount;

      // Create loan
      const loan = new Loans({
        user: (application as any).user,
        wallet: (application as any).disbursementWallet,
        loanType: application.loanType as any,
        principalAmount: finalAmount,
        outstandingBalance:
          finalAmount * (1 + ((application as any).interestRate || 10) / 100),
        interestRate: (application as any).interestRate || 10,
        term: application.term,
        monthlyPayment:
          (application as any).monthlyPayment || finalAmount / application.term,
        totalInterest:
          (finalAmount * ((application as any).interestRate || 10)) / 100,
        totalRepayment:
          finalAmount * (1 + ((application as any).interestRate || 10) / 100),
        status: "pending",
        disbursementMethod: "wallet",
        purpose: application.purpose,
        startDate: new Date(),
        maturityDate: new Date(
          Date.now() + application.term * 30 * 24 * 60 * 60 * 1000,
        ),
      });

      await loan.save({ session });

      // Create repayment schedule with installments array
      const installments = [];
      for (let i = 1; i <= application.term; i++) {
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + i);
        const monthlyPayment =
          (application as any).monthlyPayment || finalAmount / application.term;

        installments.push({
          installmentNumber: i,
          dueDate,
          totalAmount: monthlyPayment,
          principalAmount: finalAmount / application.term,
          interestAmount: monthlyPayment - finalAmount / application.term,
          feeAmount: 0,
          status: "pending",
        });
      }

      // Create single repayment schedule document with all installments
      const repaymentSchedule = new RepaymentSchedules({
        loan: loan._id,
        user: application.user,
        currency: (application as any).currency || "USD",
        totalPrincipal: finalAmount,
        totalInterest:
          (finalAmount * ((application as any).interestRate || 10)) / 100,
        totalAmount:
          finalAmount * (1 + ((application as any).interestRate || 10) / 100),
        installments,
        generatedAt: new Date(),
      });

      await repaymentSchedule.save({ session });

      application.status = "approved";
      application.approvedAmount = finalAmount;
      application.reviewedBy = req.user.userId;
      application.reviewedAt = new Date();
      application.reviewNotes = notes;

      // Send approval email using template
      const approvalEmailContent = emailGenerator.loanApplicationEmail({
        applicantName: user.firstName || "Customer",
        applicationId: application.applicationId || application._id.toString(),
        status: "approved",
        amount: String(finalAmount),
        requestedAmount: String(application.requestedAmount),
        currency: "USD",
        loanType: application.loanType,
        term: application.term,
      });

      sendTemplatedMail(user.email, approvalEmailContent).catch(console.error);
    } else if (decision === "reject") {
      application.status = "rejected";
      application.rejectionReason = reason;
      application.reviewedBy = req.user.userId;
      application.reviewedAt = new Date();
      application.reviewNotes = notes;

      // Send rejection email using template
      const rejectionEmailContent = emailGenerator.loanApplicationEmail({
        applicantName: user.firstName || "Customer",
        applicationId: application.applicationId || application._id.toString(),
        status: "rejected",
        amount: String(application.requestedAmount),
        requestedAmount: String(application.requestedAmount),
        currency: "USD",
        loanType: application.loanType,
        term: application.term,
      });

      sendTemplatedMail(user.email, rejectionEmailContent).catch(console.error);
    }

    await application.save({ session });
    await session.commitTransaction();

    emitToUser(String(application.user), WS.LOAN.APPLICATION_REVIEWED, {
      applicationId: application.applicationId || application._id,
      decision,
      timestamp: new Date().toISOString(),
    });

    sendSuccess(res, { application }, `Application ${decision}ed successfully`);
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
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
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const { id } = req.params;

    const loan = await Loans.findOne({
      $or: [{ _id: id }, { loanId: id }],
      status: "pending",
    }).session(session);

    if (!loan) throw new NotFoundError("Pending approved loan not found");

    const wallet = await Wallets.findById(loan.wallet).session(session);
    if (!wallet) throw new NotFoundError("Disbursement wallet not found");

    // Get currency from wallet's first balance entry or default
    const walletCurrency =
      wallet.balances instanceof Map
        ? Array.from(wallet.balances.keys())[0] || "USD"
        : Object.keys(wallet.balances || {})[0] || "USD";

    // Credit the loan amount to wallet using Map-based balance
    const currentBalance = getWalletBalance(wallet, walletCurrency);
    updateWalletBalance(
      wallet,
      walletCurrency,
      currentBalance + loan.principalAmount,
    );
    await wallet.save({ session });

    // Create transaction first for ledger entry reference
    const reference = generateReferenceNumber();
    const transaction = new Transactions({
      wallet: wallet._id,
      type: "deposit",
      category: "loans",
      amount: loan.principalAmount,
      currency: walletCurrency,
      status: "completed",
      referenceNumber: reference,
      initiatedBy: req.user.userId,
      description: `Loan disbursement - ${loan.loanId || loan._id}`,
      completedAt: new Date(),
    });
    await transaction.save({ session });

    // Create ledger entry
    await LedgerEntries.create(
      [
        {
          wallet: wallet._id,
          transaction: transaction._id,
          entryType: "credit",
          amount: loan.principalAmount,
          currency: walletCurrency,
          balance: currentBalance + loan.principalAmount,
          description: `Loan disbursement - ${loan.loanId || loan._id}`,
          accountingDate: new Date(),
        },
      ],
      { session },
    );

    // Update loan status
    loan.status = "active";
    (loan as any).disbursementDate = new Date();
    await loan.save({ session });

    await session.commitTransaction();

    const user = await Users.findById(loan.user);
    if (user) {
      const disbursementEmailContent = emailGenerator.loanDisbursedEmail({
        applicantName: (user as any).firstName || "Customer",
        loanId: loan.loanId || loan._id.toString(),
        loanType: (loan as any).loanType || "Personal Loan",
        amount: String(loan.principalAmount),
        currency: walletCurrency,
        disbursedTo: wallet.walletNumber,
        disbursedAt: new Date().toISOString(),
        repaymentStartDate: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        monthlyPayment: String(loan.monthlyPayment),
      });

      sendTemplatedMail((user as any).email, disbursementEmailContent).catch(
        console.error,
      );
    }

    emitToUser(String(loan.user), WS.LOAN.DISBURSED, {
      loanId: loan.loanId || loan._id,
      amount: loan.principalAmount,
      disbursementReference: reference,
      status: loan.status,
      timestamp: new Date().toISOString(),
    });

    sendSuccess(
      res,
      {
        loan: {
          id: loan._id,
          loanId: loan.loanId,
          status: loan.status,
          disbursementDate: (loan as any).disbursementDate,
          disbursementReference: reference,
        },
      },
      "Loan disbursed successfully",
    );
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
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
