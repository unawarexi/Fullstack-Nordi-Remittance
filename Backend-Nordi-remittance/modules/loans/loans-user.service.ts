// ============================================================================
// LOANS USER SERVICE
// ============================================================================

import mongoose from "mongoose";
import {
  Loans,
  LoanApplications,
  CreditAssessments,
  RepaymentSchedules,
  LoanRepayments,
} from "./loans.model.js";
import { Wallets, LedgerEntries } from "../accounts/accounts.model.js";
import Transactions from "../transactions/transactions.model.js";
import Users from "../users/users.model.js";
import { generateReferenceNumber } from "../../core/helpers/generator.js";
import {
  ValidationError,
  NotFoundError,
} from "../../core/errors/AppError.js";
import { queueTemplatedMail } from "../../services/workers.js";
import EmailContentGenerator from "../../core/mail/Mail-content.js";
import { emitToUser } from "../../services/websocket.service.js";
import { WS } from "../../core/constants/ws-events.js";
import { validateUserEligibility } from "../../core/guards/user-eligibility.guard.js";

const emailGenerator = new EmailContentGenerator();

export class LoansUserService {
  // --------------------------------------------------------------------------
  // GET LOANS
  // --------------------------------------------------------------------------
  static async getLoans(userId: string, query: any) {
    const page = parseInt(query.page as string) || 1;
    const limit = Math.min(parseInt(query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;

    const filter: any = { user: userId };
    if (query.status) filter.status = query.status;

    const [loans, total] = await Promise.all([
      Loans.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("application")
        .lean(),
      Loans.countDocuments(filter),
    ]);

    return { loans, page, limit, total };
  }

  // --------------------------------------------------------------------------
  // GET SINGLE LOAN
  // --------------------------------------------------------------------------
  static async getLoanById(userId: string, id: string) {
    const loan = await Loans.findOne({
      $or: [{ _id: id }, { loanId: id }],
      user: userId,
    })
      .populate("application")
      .lean();

    if (!loan) throw new NotFoundError("Loan not found");

    const schedule = await RepaymentSchedules.find({ loan: loan._id })
      .sort({ dueDate: 1 })
      .lean();

    const payments = await LoanRepayments.find({ loan: loan._id })
      .sort({ paymentDate: -1 })
      .lean();

    return { loan, schedule, payments };
  }

  // --------------------------------------------------------------------------
  // CHECK ELIGIBILITY
  // --------------------------------------------------------------------------
  static async checkEligibility(userId: string) {
    const user = await Users.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    if (user.kycStatus !== "approved") {
      return {
        eligible: false,
        reason: "KYC verification required",
        maxAmount: 0,
      };
    }

    const activeLoans = await Loans.find({
      user: userId,
      status: { $in: ["active", "pending"] },
    })
      .select("outstandingBalance status")
      .lean();

    const totalOutstanding = activeLoans.reduce(
      (sum, loan) => sum + (loan.outstandingBalance || 0),
      0,
    );

    let creditAssessment = await CreditAssessments.findOne({
      user: userId,
    }).sort({ createdAt: -1 });

    const userCreatedAt = (user as any).createdAt;
    const accountAge = Math.floor(
      (Date.now() - new Date(userCreatedAt).getTime()) /
        (1000 * 60 * 60 * 24),
    );

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

    let maxAmount = 0;
    if (creditScore >= 550) maxAmount = Math.min(monthlyIncome * 2, 5000);
    if (creditScore >= 600) maxAmount = Math.min(monthlyIncome * 3, 10000);
    if (creditScore >= 650) maxAmount = Math.min(monthlyIncome * 4, 25000);
    if (creditScore >= 700) maxAmount = Math.min(monthlyIncome * 5, 50000);

    maxAmount = Math.max(0, maxAmount - totalOutstanding);

    if (!creditAssessment) {
      creditAssessment = new CreditAssessments({
        user: userId,
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

    return {
      eligible: maxAmount > 0,
      creditScore,
      maxAmount,
      monthlyIncome,
      outstandingDebt: totalOutstanding,
      accountAgeDays: accountAge,
      reason: maxAmount > 0 ? null : "Insufficient credit history or income",
    };
  }

  // --------------------------------------------------------------------------
  // APPLY FOR LOAN
  // --------------------------------------------------------------------------
  static async applyForLoan(userId: string, body: any) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      await validateUserEligibility(userId, "loan application");

      const { amount, purpose, termMonths, disbursementWalletId } = body;

      const user = await Users.findById(userId).session(session);
      if (!user) throw new NotFoundError("User not found");

      if (amount < 100) throw new ValidationError("Minimum loan amount is $100");
      if (amount > 50000)
        throw new ValidationError("Maximum loan amount is $50,000");
      if (termMonths < 1 || termMonths > 60) {
        throw new ValidationError("Loan term must be between 1 and 60 months");
      }

      const wallet = await Wallets.findOne({
        _id: disbursementWalletId,
        userId: userId,
        status: "active",
      }).session(session);

      if (!wallet) throw new NotFoundError("Disbursement wallet not found");

      const pendingApp = await LoanApplications.findOne({
        user: userId,
        status: "pending",
      }).session(session);

      if (pendingApp) {
        throw new ValidationError("You already have a pending loan application");
      }

      const creditAssessment = await CreditAssessments.findOne({ user: userId })
        .sort({ createdAt: -1 })
        .session(session);

      let interestRate = 15;
      if (creditAssessment) {
        if (creditAssessment.creditScore >= 700) interestRate = 8;
        else if (creditAssessment.creditScore >= 650) interestRate = 10;
        else if (creditAssessment.creditScore >= 600) interestRate = 12;
      }

      if (termMonths > 24) interestRate += 1;
      if (termMonths > 36) interestRate += 1;

      const monthlyRate = interestRate / 100 / 12;
      const monthlyPayment =
        (amount * (monthlyRate * Math.pow(1 + monthlyRate, termMonths))) /
        (Math.pow(1 + monthlyRate, termMonths) - 1);
      const totalRepayment = monthlyPayment * termMonths;

      const application = new LoanApplications({
        user: userId,
        loanType: purpose,
        requestedAmount: amount,
        term: termMonths,
        purpose,
        status: "submitted",
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

      queueTemplatedMail((user as any).email, emailContent).catch(console.error);

      emitToUser(userId, WS.LOAN.APPLICATION_SUBMITTED, {
        applicationId: application.applicationId || application._id,
        amount,
        termMonths,
        status: application.status,
        timestamp: new Date().toISOString(),
      });

      return {
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
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // --------------------------------------------------------------------------
  // GET LOAN APPLICATIONS
  // --------------------------------------------------------------------------
  static async getApplications(userId: string) {
    const applications = await LoanApplications.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean();
    return { applications };
  }

  // --------------------------------------------------------------------------
  // MAKE PAYMENT
  // --------------------------------------------------------------------------
  static async makePayment(userId: string, id: string, body: any) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      await validateUserEligibility(userId, "loan payment");

      const { amount, walletId, paymentType } = body;

      const loan = await Loans.findOne({
        $or: [{ _id: id }, { loanId: id }],
        user: userId,
        status: { $in: ["active", "pending"] },
      }).session(session);

      if (!loan) throw new NotFoundError("Active loan not found");

      const wallet = await Wallets.findOne({
        _id: walletId,
        user: userId,
        status: "active",
      }).session(session);

      if (!wallet) throw new NotFoundError("Wallet not found");

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

      if (!wallet.balances) {
        wallet.balances = new Map();
      }
      wallet.balances.set(currency, walletBalance - paymentAmount);
      await wallet.save({ session });

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
            initiatedBy: userId,
            description: `Loan payment - ${loan.loanId}`,
          },
        ],
        { session },
      );

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

      const interestPortion = Math.min(
        paymentAmount,
        loan.outstandingBalance * (loan.interestRate / 100 / 12),
      );
      const principalPortion = paymentAmount - interestPortion;

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

      loan.outstandingBalance -= paymentAmount;
      if (loan.outstandingBalance <= 0) {
        loan.status = "paid";
        loan.closedAt = new Date();
      }
      await loan.save({ session });

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

      emitToUser(userId, WS.LOAN.PAYMENT_MADE, {
        loanId: loan.loanId || loan._id,
        paymentAmount,
        reference,
        outstandingBalance: loan.outstandingBalance,
        loanStatus: loan.status,
        timestamp: new Date().toISOString(),
      });

      return {
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
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // --------------------------------------------------------------------------
  // GET REPAYMENT SCHEDULE
  // --------------------------------------------------------------------------
  static async getRepaymentSchedule(userId: string, id: string) {
    const loan = await Loans.findOne({
      $or: [{ _id: id }, { loanId: id }],
      user: userId,
    });

    if (!loan) throw new NotFoundError("Loan not found");

    const schedule = await RepaymentSchedules.findOne({ loan: loan._id }).lean();

    if (!schedule) {
      return { schedule: null, summary: null };
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
      overduePayments: installments.filter((s: any) => s.status === "overdue").length,
    };

    return { schedule, summary };
  }
}
