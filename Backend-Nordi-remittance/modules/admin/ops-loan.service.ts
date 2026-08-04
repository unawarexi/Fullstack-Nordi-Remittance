import mongoose from 'mongoose';
import Users from '../users/users.model.js';
import { Wallets } from '../accounts/accounts.model.js';
import Transactions from '../transactions/transactions.model.js';
import { Loans, LoanApplications } from '../loans/loans.model.js';
import { generateReferenceNumber } from '../../core/helpers/generator.js';
import { ValidationError, NotFoundError, ForbiddenError } from '../../core/errors/AppError.js';
import { queueTemplatedMail } from '../../services/workers.js';
import { validateUserEligibility } from '../../core/guards/user-eligibility.guard.js';
import EmailContentGenerator from '../../core/mail/Mail-content.js';
const emailGenerator = new EmailContentGenerator();
import {
  hasPermission,
  logAdminAction,
  notifyUser,
  calculateMonthlyPayment,
  getWalletBalance,
  updateWalletBalance
} from './ops.helpers.js';

export class OpsLoanService {
  /**
   * Approve a loan application
   */
  static async approveLoan(currentUserId: string, loanId: string, data: any, ip: string, userAgent: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const canApprove = await hasPermission(currentUserId, 'canApproveLoans');
      if (!canApprove) {
        throw new ForbiddenError('You do not have permission to approve loans');
      }

      const { approvedAmount, interestRate, termMonths, disbursementDate, notes } = data;

      const application = await LoanApplications.findById(loanId).session(session);
      if (!application) throw new NotFoundError('Loan application not found');

      await validateUserEligibility(String(application.user), 'loan approval');

      if (application.status !== 'submitted' && application.status !== 'under_review') {
        throw new ValidationError(`Cannot approve loan with status: ${application.status}`);
      }

      const finalAmount = approvedAmount || application.requestedAmount;
      const finalRate = interestRate || 12; // Default 12% APR
      const finalTerm = termMonths || application.term || 12;

      application.status = 'approved';
      application.approvedAmount = finalAmount;
      application.approvedRate = finalRate;
      application.approvedTerm = finalTerm;
      application.reviewedBy = currentUserId as any;
      application.reviewedAt = new Date();
      application.reviewNotes = notes;
      await application.save({ session });

      const wallet = await Wallets.findOne({ user: application.user }).session(session);
      if (!wallet) throw new NotFoundError('User wallet not found');

      const monthlyPayment = calculateMonthlyPayment(finalAmount, finalRate, finalTerm);
      const totalInterest = monthlyPayment * finalTerm - finalAmount;
      const totalRepayment = finalAmount + totalInterest;

      const startDate = disbursementDate ? new Date(disbursementDate) : new Date();
      const maturityDate = new Date(startDate);
      maturityDate.setMonth(maturityDate.getMonth() + finalTerm);

      const loan = new Loans({
        user: application.user,
        wallet: wallet._id,
        loanType: application.loanType || 'personal',
        principalAmount: finalAmount,
        outstandingBalance: totalRepayment,
        interestRate: finalRate,
        term: finalTerm,
        startDate,
        maturityDate,
        monthlyPayment,
        totalInterest,
        totalRepayment,
        status: 'pending',
        currency: 'USD',
        disbursementMethod: 'wallet',
        purpose: application.purpose,
        approvedBy: currentUserId,
        approvedAt: new Date(),
      });

      application.loan = loan._id as any;
      await application.save({ session });
      await loan.save({ session });

      const user = await Users.findById(application.user).session(session);

      await logAdminAction(
        currentUserId,
        'APPROVE_LOAN',
        'loan',
        (loan._id as any).toString(),
        { applicationId: application._id, approvedAmount: finalAmount, interestRate: finalRate, termMonths: finalTerm },
        ip,
        userAgent,
        'success',
      );

      await session.commitTransaction();

      if (user) {
        await notifyUser(
          (user._id as any).toString(),
          'Loan Approved!',
          `Your loan application for USD ${finalAmount.toFixed(2)} has been approved!`,
          'loan',
          { loanId: loan._id, amount: finalAmount }
        );

        try {
          const emailContent = emailGenerator.loanApplicationEmail({
            applicantName: user.firstName,
            status: 'approved',
            currency: loan.currency || 'USD',
            amount: String(finalAmount),
            requestedAmount: String(application.requestedAmount),
            loanType: application.loanType || 'Personal Loan',
            term: finalTerm,
            applicationId: String(application._id),
            loanId: String(loan._id)
          });
          await queueTemplatedMail(String(user.email), emailContent);
        } catch (emailError) {
          console.error('Failed to send loan approval email:', emailError);
        }
      }

      return {
        loan: {
          id: loan._id, applicationId: application._id, principalAmount: finalAmount,
          interestRate: finalRate, termMonths: finalTerm, monthlyPayment, totalRepayment,
          status: loan.status, startDate: loan.startDate, maturityDate: loan.maturityDate,
        },
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Reject a loan application
   */
  static async rejectLoan(currentUserId: string, loanId: string, data: any, ip: string, userAgent: string) {
    const canManage = await hasPermission(currentUserId, 'canManageLoans');
    if (!canManage) {
      throw new ForbiddenError('You do not have permission to reject loans');
    }

    const { reason, notes } = data;

    const application = await LoanApplications.findById(loanId);
    if (!application) throw new NotFoundError('Loan application not found');

    if (application.status !== 'submitted' && application.status !== 'under_review') {
      throw new ValidationError(`Cannot reject loan with status: ${application.status}`);
    }

    application.status = 'rejected';
    application.rejectionReason = reason;
    application.reviewNotes = notes;
    application.reviewedBy = currentUserId as any;
    application.reviewedAt = new Date();
    await application.save();

    const user = await Users.findById(application.user);

    await logAdminAction(
      currentUserId,
      'REJECT_LOAN',
      'loan_application',
      (application._id as any).toString(),
      { reason, notes },
      ip,
      userAgent,
      'success',
    );

    if (user) {
      await notifyUser(
        (user._id as any).toString(),
        'Loan Application Update',
        `Your loan application has been reviewed. Unfortunately, we cannot approve it at this time. Reason: ${reason}`,
        'loan',
        { applicationId: application._id }
      );

      try {
        const emailContent = emailGenerator.loanApplicationEmail({
          applicantName: user.firstName,
          status: 'rejected',
          currency: application.currency || 'USD',
          amount: String(application.requestedAmount),
          requestedAmount: String(application.requestedAmount),
          loanType: application.loanType || 'Personal Loan',
          term: application.termMonths,
          applicationId: String(application._id)
        });
        await queueTemplatedMail(String(user.email), emailContent);
      } catch (emailError) {
        console.error('Failed to send loan rejection email:', emailError);
      }
    }

    return { application: { id: application._id, status: application.status, rejectionReason: reason } };
  }

  /**
   * Disburse an approved loan
   */
  static async disburseLoan(currentUserId: string, loanId: string, ip: string, userAgent: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const canDisburse = await hasPermission(currentUserId, 'canApproveLoans');
      if (!canDisburse) {
        throw new ForbiddenError('You do not have permission to disburse loans');
      }

      const loan = await Loans.findById(loanId).session(session);
      if (!loan) throw new NotFoundError('Loan not found');

      await validateUserEligibility(String(loan.user), 'loan disbursement');

      if (loan.status !== 'pending') {
        throw new ValidationError('Loan must be in pending status for disbursement');
      }

      const wallet = await Wallets.findOne({ user: loan.user, status: 'active' }).session(session);
      if (!wallet) throw new NotFoundError('User wallet not found');

      const currency = loan.currency || 'USD';
      const previousBalance = getWalletBalance(wallet, currency);

      updateWalletBalance(wallet, currency, loan.principalAmount);
      const newBalance = getWalletBalance(wallet, currency);

      await wallet.save({ session });

      const referenceNumber = generateReferenceNumber();
      const transaction = new Transactions({
        wallet: wallet._id,
        referenceNumber,
        type: 'deposit',
        category: 'loans',
        categoryItemId: (loan._id as any).toString(),
        amount: loan.principalAmount,
        currency,
        status: 'completed',
        description: `Loan disbursement - Loan ID: ${loan._id}`,
        initiatedBy: loan.user,
        meta: {
          loanId: loan._id, adminInitiated: true, adminId: currentUserId,
          previousBalance, newBalance,
        },
        completedAt: new Date(),
        channel: 'web',
      });

      await transaction.save({ session });

      loan.status = 'active';
      loan.disbursementDate = new Date();
      await loan.save({ session });

      await logAdminAction(
        currentUserId,
        'DISBURSE_LOAN',
        'loan',
        (loan._id as any).toString(),
        { amount: loan.principalAmount, walletId: wallet._id, previousBalance, newBalance, referenceNumber },
        ip,
        userAgent,
        'success',
      );

      await session.commitTransaction();

      const user = await Users.findById(loan.user);
      if (user) {
        await notifyUser(
          (user._id as any).toString(),
          'Loan Disbursed',
          `Your loan of ${currency} ${loan.principalAmount.toFixed(2)} has been disbursed to your wallet!`,
          'loan',
          { loanId: loan._id, amount: loan.principalAmount }
        );
      }

      return {
        loan: { id: loan._id, status: loan.status, disbursedAmount: loan.principalAmount, disbursementDate: loan.disbursementDate },
        wallet: { previousBalance, newBalance },
        transactionReference: referenceNumber,
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
