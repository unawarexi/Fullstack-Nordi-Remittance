// @ts-nocheck
import { Wallets } from "./accounts.model.js";
import { Loans } from "../loans/loans.model.js";
import { InvestmentAccounts } from "../investments/investments.model.js";
import { Cards } from "../cards/cards.model.js";
import {
  ValidationError,
  NotFoundError,
  ForbiddenError,
} from "../../core/errors/AppError.js";

export class WalletProductLinkService {
  /**
   * Link a loan to a wallet (one-time, immutable binding)
   */
  static async linkLoanToWallet(loanId: string, walletId: string, userId: string) {
    const loan = await Loans.findOne({ loanId, user: userId });
    if (!loan) throw new NotFoundError("Loan not found");

    if (loan.walletLocked) {
      throw new ForbiddenError("This loan is already bound to a wallet. Loan-wallet bindings are immutable.");
    }

    const wallet = await Wallets.findOne({ _id: walletId, user: userId, isDeleted: false, status: "active" });
    if (!wallet) throw new NotFoundError("Wallet not found or inactive");

    // Bind the loan to the wallet (the pre-save hook will set walletLocked = true)
    loan.wallet = wallet._id as any;
    loan.updatedAt = new Date();
    await loan.save();

    // Track the loan on the wallet
    wallet.linkedLoans = wallet.linkedLoans || [];
    if (!wallet.linkedLoans.some((l: any) => l.toString() === loan._id.toString())) {
      wallet.linkedLoans.push(loan._id as any);
      wallet.updatedAt = new Date();
      await wallet.save();
    }

    return { loan, wallet };
  }

  /**
   * Link an investment account to a wallet (one-time, immutable binding)
   */
  static async linkInvestmentToWallet(investmentId: string, walletId: string, userId: string) {
    const investment = await InvestmentAccounts.findOne({ accountId: investmentId, user: userId });
    if (!investment) throw new NotFoundError("Investment account not found");

    if (investment.walletLocked) {
      throw new ForbiddenError("This investment is already bound to a wallet. Investment-wallet bindings are immutable.");
    }

    const wallet = await Wallets.findOne({ _id: walletId, user: userId, isDeleted: false, status: "active" });
    if (!wallet) throw new NotFoundError("Wallet not found or inactive");

    // Bind the investment to the wallet
    investment.wallet = wallet._id as any;
    investment.updatedAt = new Date();
    await investment.save();

    // Track the investment on the wallet
    wallet.linkedInvestments = wallet.linkedInvestments || [];
    if (!wallet.linkedInvestments.some((i: any) => i.toString() === investment._id.toString())) {
      wallet.linkedInvestments.push(investment._id as any);
      wallet.updatedAt = new Date();
      await wallet.save();
    }

    return { investment, wallet };
  }

  /**
   * Get all products linked to a wallet (cards, loans, investments)
   */
  static async getWalletProducts(walletId: string, userId: string) {
    const wallet = await Wallets.findOne({ _id: walletId, user: userId });
    if (!wallet) throw new NotFoundError("Wallet not found");

    const [cards, loans, investments] = await Promise.all([
      Cards.find({
        $or: [
          { wallet: walletId },
          { "linkedWallets.wallet": walletId, "linkedWallets.isActive": true },
        ],
        user: userId,
      }).select("cardId cardType cardBrand status lastUsedDate fundingSource"),

      Loans.find({ wallet: walletId, user: userId })
        .select("loanId loanType status outstandingBalance currency nextPaymentDate nextPaymentAmount"),

      InvestmentAccounts.find({ wallet: walletId, user: userId })
        .select("accountId accountType status totalInvested currentValue totalReturns currency"),
    ]);

    return {
      wallet: {
        _id: wallet._id,
        walletNumber: wallet.walletNumber,
        walletType: wallet.walletType,
        status: wallet.status,
      },
      cards,
      loans,
      investments,
      summary: {
        totalCards: cards.length,
        totalLoans: loans.length,
        totalInvestments: investments.length,
        totalLoanOutstanding: loans.reduce((sum: number, l: any) => sum + (l.outstandingBalance || 0), 0),
        totalInvestmentValue: investments.reduce((sum: number, i: any) => sum + (i.currentValue || 0), 0),
      },
    };
  }
}

export default WalletProductLinkService;
