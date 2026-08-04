// ============================================================================
// LOANS ADMIN SERVICE
// ============================================================================

import mongoose from "mongoose";
import {
  Loans,
  LoanApplications,
  RepaymentSchedules,
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

const emailGenerator = new EmailContentGenerator();

export class LoansAdminService {
  // --------------------------------------------------------------------------
  // GET ALL APPLICATIONS
  // --------------------------------------------------------------------------
  static async getAllApplications(query: any) {
    const page = parseInt(query.page as string) || 1;
    const limit = Math.min(parseInt(query.limit as string) || 50, 200);
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (query.status) filter.status = query.status;

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

    return { applications, page, limit, total };
  }

  // --------------------------------------------------------------------------
  // REVIEW APPLICATION
  // --------------------------------------------------------------------------
  static async reviewApplication(adminId: string, id: string, body: any) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { decision, approvedAmount, notes, reason } = body;

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
        application.reviewedBy = adminId as any;
        application.reviewedAt = new Date();
        application.reviewNotes = notes;

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

        queueTemplatedMail(user.email, approvalEmailContent).catch(console.error);
      } else if (decision === "reject") {
        application.status = "rejected";
        application.rejectionReason = reason;
        application.reviewedBy = adminId as any;
        application.reviewedAt = new Date();
        application.reviewNotes = notes;

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

        queueTemplatedMail(user.email, rejectionEmailContent).catch(console.error);
      }

      await application.save({ session });
      await session.commitTransaction();

      emitToUser(String(application.user), WS.LOAN.APPLICATION_REVIEWED, {
        applicationId: application.applicationId || application._id,
        decision,
        timestamp: new Date().toISOString(),
      });

      return { application, decision };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // --------------------------------------------------------------------------
  // DISBURSE LOAN
  // --------------------------------------------------------------------------
  static async disburseLoan(adminId: string, id: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const loan = await Loans.findOne({
        $or: [{ _id: id }, { loanId: id }],
        status: "pending",
      }).session(session);

      if (!loan) throw new NotFoundError("Pending approved loan not found");

      const wallet = await Wallets.findById(loan.wallet).session(session);
      if (!wallet) throw new NotFoundError("Disbursement wallet not found");

      const walletCurrency =
        wallet.balances instanceof Map
          ? Array.from(wallet.balances.keys())[0] || "USD"
          : Object.keys(wallet.balances || {})[0] || "USD";

      const getWalletBalance = (w: any, currency: string = "USD"): number => {
        if (!w || !w.balances) return 0;
        const balances =
          w.balances instanceof Map
            ? w.balances
            : new Map(Object.entries(w.balances));
        return balances.get(currency) || 0;
      };

      const currentBalance = getWalletBalance(wallet, walletCurrency);
      
      if (!wallet.balances) {
        wallet.balances = new Map();
      }
      wallet.balances.set(walletCurrency, currentBalance + loan.principalAmount);
      await wallet.save({ session });

      const reference = generateReferenceNumber();
      const transaction = new Transactions({
        wallet: wallet._id,
        type: "deposit",
        category: "loans",
        amount: loan.principalAmount,
        currency: walletCurrency,
        status: "completed",
        referenceNumber: reference,
        initiatedBy: adminId,
        description: `Loan disbursement - ${loan.loanId || loan._id}`,
        completedAt: new Date(),
      });
      await transaction.save({ session });

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

        queueTemplatedMail((user as any).email, disbursementEmailContent).catch(
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

      return {
        loan: {
          id: loan._id,
          loanId: loan.loanId,
          status: loan.status,
          disbursementDate: (loan as any).disbursementDate,
          disbursementReference: reference,
        },
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
