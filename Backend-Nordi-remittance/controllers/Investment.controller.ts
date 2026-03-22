// ============================================================================
// INVESTMENT CONTROLLER
// ============================================================================

import { Response, NextFunction } from "express";
import mongoose from "mongoose";
import type { AuthenticatedRequest } from "../types/index.js";
import {
  SavingsGoals,
  InvestmentAccounts,
  Portfolios,
  PortfolioTransactions,
  Assets,
  InterestPlans,
} from "../models/InvestmentsModel.js";
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

// ============================================================================
// SAVINGS GOALS
// ============================================================================

// Helper function to get wallet balance for a currency
function getWalletBalance(wallet: any, currency: string = "USD"): number {
  if (!wallet || !wallet.balances) return 0;
  const balances =
    wallet.balances instanceof Map
      ? wallet.balances
      : new Map(Object.entries(wallet.balances));
  return balances.get(currency) || 0;
}

// Helper function to update wallet balance
function updateWalletBalance(
  wallet: any,
  currency: string,
  amount: number,
): void {
  if (!wallet.balances) {
    wallet.balances = new Map();
  }
  const current = getWalletBalance(wallet, currency);
  wallet.balances.set(currency, current + amount);
}

export async function getSavingsGoals(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const goals = await SavingsGoals.find({ user: req.user.userId })
      .populate("wallet", "walletNumber balances")
      .sort({ createdAt: -1 })
      .lean();

    sendSuccess(res, { goals });
  } catch (error) {
    next(error);
  }
}

export async function createSavingsGoal(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const {
      name,
      targetAmount,
      targetDate,
      walletId,
      autoSaveEnabled,
      autoSaveFrequency,
      autoSaveAmount,
      category,
    } = req.body;

    const user = await Users.findById(req.user.userId).session(session);
    if (!user) throw new NotFoundError("User not found");

    // Validate target amount
    if (targetAmount < 10) {
      throw new ValidationError("Minimum target amount is $10");
    }

    // Validate target date
    const target = new Date(targetDate);
    if (target <= new Date()) {
      throw new ValidationError("Target date must be in the future");
    }

    // Check max goals (5 per user)
    const existingGoals = await SavingsGoals.countDocuments({
      user: req.user.userId,
      status: "active",
    });

    if (existingGoals >= 5) {
      throw new ForbiddenError("Maximum 5 active savings goals allowed");
    }

    // Verify wallet if provided
    let wallet = null;
    if (walletId) {
      wallet = await Wallets.findOne({
        _id: walletId,
        userId: req.user.userId,
        status: "active",
      }).session(session);

      if (!wallet) throw new NotFoundError("Wallet not found");
    }

    // Calculate suggested monthly deposit
    const monthsToTarget = Math.max(
      1,
      Math.ceil((target.getTime() - Date.now()) / (30 * 24 * 60 * 60 * 1000)),
    );
    const suggestedMonthly = Math.ceil(targetAmount / monthsToTarget);

    const goal = new SavingsGoals({
      user: req.user.userId,
      wallet: wallet?._id,
      name,
      description: req.body.description,
      targetAmount,
      currentAmount: 0,
      currency: "USD",
      targetDate: target,
      status: "active",
      category: category || "other",
      autoSaveEnabled: autoSaveEnabled || false,
      autoSaveFrequency: autoSaveFrequency || "monthly",
      autoSaveAmount: autoSaveAmount || suggestedMonthly,
    });

    await goal.save({ session });
    await session.commitTransaction();

    emitToUser(req.user!.userId, WS.INVESTMENT.SAVINGS_GOAL_CREATED, {
      goalId: goal.goalId || goal._id,
      name: goal.name,
      targetAmount: goal.targetAmount,
      timestamp: new Date().toISOString(),
    });

    sendCreated(
      res,
      {
        goal: {
          id: goal._id,
          goalId: goal.goalId,
          name: goal.name,
          targetAmount: goal.targetAmount,
          targetDate: goal.targetDate,
          suggestedMonthlyDeposit: suggestedMonthly,
          autoSaveEnabled: goal.autoSaveEnabled,
        },
      },
      "Savings goal created successfully",
    );
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
}

export async function depositToGoal(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const { id } = req.params;
    const { amount, walletId } = req.body;

    const goal = await SavingsGoals.findOne({
      $or: [{ _id: id }, { goalId: id }],
      user: req.user.userId,
      status: "active",
    }).session(session);

    if (!goal) throw new NotFoundError("Savings goal not found");

    const wallet = await Wallets.findOne({
      _id: walletId,
      userId: req.user.userId,
      status: "active",
    }).session(session);

    if (!wallet) throw new NotFoundError("Wallet not found");

    const currency = "USD";
    const walletBalance = getWalletBalance(wallet, currency);
    if (walletBalance < amount) {
      throw new ValidationError("Insufficient wallet balance");
    }

    // Deduct from wallet
    updateWalletBalance(wallet, currency, -amount);
    await wallet.save({ session });

    // Add to goal
    goal.currentAmount += amount;

    // Check if goal reached
    if (goal.currentAmount >= goal.targetAmount) {
      goal.status = "completed";
      goal.completedAt = new Date();
    }

    await goal.save({ session });

    // Create transaction for ledger entry
    const reference = generateReferenceNumber();
    const transaction = await Transactions.create(
      [
        {
          wallet: wallet._id,
          type: "withdrawal",
          category: "investments",
          amount,
          currency,
          status: "completed",
          referenceNumber: reference,
          initiatedBy: req.user.userId,
          description: `Savings goal deposit - ${goal.name}`,
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
          amount,
          currency,
          balance: getWalletBalance(wallet, currency),
          description: `Savings goal deposit - ${goal.name}`,
          accountingDate: new Date(),
        },
      ],
      { session },
    );

    await session.commitTransaction();

    emitToUser(req.user!.userId, WS.INVESTMENT.SAVINGS_GOAL_DEPOSIT, {
      goalId: goal.goalId || goal._id,
      amount,
      currentAmount: goal.currentAmount,
      progress: Math.round((goal.currentAmount / goal.targetAmount) * 100),
      reference,
      timestamp: new Date().toISOString(),
    });

    sendSuccess(
      res,
      {
        goal: {
          id: goal._id,
          goalId: goal.goalId,
          currentAmount: goal.currentAmount,
          targetAmount: goal.targetAmount,
          progress: Math.round((goal.currentAmount / goal.targetAmount) * 100),
          status: goal.status,
        },
        deposit: { amount, reference },
      },
      "Deposit successful",
    );
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
}

export async function withdrawFromGoal(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const { id } = req.params;
    const { amount, walletId } = req.body;

    const goal = await SavingsGoals.findOne({
      $or: [{ _id: id }, { goalId: id }],
      user: req.user.userId,
      status: { $in: ["active", "completed"] },
    }).session(session);

    if (!goal) throw new NotFoundError("Savings goal not found");

    if (goal.currentAmount < amount) {
      throw new ValidationError("Insufficient goal balance");
    }

    const wallet = await Wallets.findOne({
      _id: walletId,
      userId: req.user.userId,
      status: "active",
    }).session(session);

    if (!wallet) throw new NotFoundError("Wallet not found");

    // Deduct from goal
    goal.currentAmount -= amount;

    // If completed and now withdrawn, mark as active or closed
    if (goal.status === "completed" && goal.currentAmount < goal.targetAmount) {
      goal.status = "active";
    }

    await goal.save({ session });

    // Credit to wallet
    const currency = "USD";
    updateWalletBalance(wallet, currency, amount);
    await wallet.save({ session });

    // Create transaction for ledger entry
    const reference = generateReferenceNumber();
    const transaction = await Transactions.create(
      [
        {
          wallet: wallet._id,
          type: "deposit",
          category: "investments",
          amount,
          currency,
          status: "completed",
          referenceNumber: reference,
          initiatedBy: req.user.userId,
          description: `Savings goal withdrawal - ${goal.name}`,
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
          entryType: "credit",
          amount,
          currency,
          balance: getWalletBalance(wallet, currency),
          description: `Savings goal withdrawal - ${goal.name}`,
          accountingDate: new Date(),
        },
      ],
      { session },
    );

    await session.commitTransaction();

    emitToUser(req.user!.userId, WS.INVESTMENT.SAVINGS_GOAL_WITHDRAWAL, {
      goalId: goal.goalId || goal._id,
      amount,
      currentAmount: goal.currentAmount,
      reference,
      timestamp: new Date().toISOString(),
    });

    sendSuccess(
      res,
      {
        goal: {
          id: goal._id,
          goalId: goal.goalId,
          currentAmount: goal.currentAmount,
          status: goal.status,
        },
        withdrawal: { amount, reference },
      },
      "Withdrawal successful",
    );
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
}

export async function deleteSavingsGoal(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const { id } = req.params;
    const { transferToWalletId } = req.body;

    const goal = await SavingsGoals.findOne({
      $or: [{ _id: id }, { goalId: id }],
      user: req.user.userId,
    }).session(session);

    if (!goal) throw new NotFoundError("Savings goal not found");

    // If there's remaining balance, transfer to wallet
    if (goal.currentAmount > 0 && transferToWalletId) {
      const wallet = await Wallets.findOne({
        _id: transferToWalletId,
        user: req.user.userId,
        status: "active",
      }).session(session);

      if (wallet) {
        const currency = "USD";
        updateWalletBalance(wallet, currency, goal.currentAmount);
        await wallet.save({ session });

        const reference = generateReferenceNumber();
        const transaction = await Transactions.create(
          [
            {
              wallet: wallet._id,
              type: "deposit",
              category: "investments",
              amount: goal.currentAmount,
              currency,
              status: "completed",
              referenceNumber: reference,
              initiatedBy: req.user.userId,
              description: `Savings goal closure - ${goal.name}`,
            },
          ],
          { session },
        );

        await LedgerEntries.create(
          [
            {
              wallet: wallet._id,
              transaction: transaction[0]._id,
              entryType: "credit",
              amount: goal.currentAmount,
              currency,
              balance: getWalletBalance(wallet, currency),
              description: `Savings goal closure - ${goal.name}`,
              accountingDate: new Date(),
            },
          ],
          { session },
        );
      }
    }

    goal.status = "cancelled";
    goal.currentAmount = 0;
    await goal.save({ session });

    await session.commitTransaction();

    emitToUser(req.user!.userId, WS.INVESTMENT.SAVINGS_GOAL_DELETED, {
      goalId: goal.goalId || goal._id,
      timestamp: new Date().toISOString(),
    });

    sendSuccess(res, null, "Savings goal deleted successfully");
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
}

// ============================================================================
// INVESTMENT ACCOUNTS
// ============================================================================

export async function getInvestmentAccount(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    let account = await InvestmentAccounts.findOne({ user: req.user.userId })
      .populate("wallet", "walletNumber balances")
      .lean();

    if (!account) {
      // Return empty state
      sendSuccess(res, {
        account: null,
        message: "No investment account found. Create one to start investing.",
      });
      return;
    }

    // Get portfolio summary
    const portfolios = await Portfolios.find({
      investmentAccount: account._id,
    }).lean();

    sendSuccess(res, { account, portfolios });
  } catch (error) {
    next(error);
  }
}

export async function createInvestmentAccount(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const { walletId, riskTolerance, investmentGoal } = req.body;

    const user = await Users.findById(req.user.userId).session(session);
    if (!user) throw new NotFoundError("User not found");

    if (user.kycStatus !== "approved") {
      throw new ForbiddenError("KYC verification required for investments");
    }

    // Check for existing account
    const existing = await InvestmentAccounts.findOne({
      user: req.user.userId,
    }).session(session);
    if (existing) {
      throw new ValidationError("Investment account already exists");
    }

    // Verify wallet
    const wallet = await Wallets.findOne({
      _id: walletId,
      userId: req.user.userId,
      status: "active",
    }).session(session);

    if (!wallet) throw new NotFoundError("Wallet not found");

    const account = new InvestmentAccounts({
      user: req.user.userId,
      wallet: wallet._id,
      accountType: req.body.accountType || "stocks",
      totalInvested: 0,
      currentValue: 0,
      totalReturns: 0,
      returnPercentage: 0,
      currency: "USD",
      riskProfile: riskTolerance || "moderate",
      status: "active",
    });

    await account.save({ session });
    await session.commitTransaction();

    emitToUser(req.user!.userId, WS.INVESTMENT.ACCOUNT_CREATED, {
      accountId: account.accountId || account._id,
      riskProfile: account.riskProfile,
      status: account.status,
      timestamp: new Date().toISOString(),
    });

    sendCreated(
      res,
      {
        account: {
          id: account._id,
          accountId: account.accountId,
          status: account.status,
          riskProfile: account.riskProfile,
        },
      },
      "Investment account created successfully",
    );
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
}

// ============================================================================
// PORTFOLIO MANAGEMENT
// ============================================================================

export async function getPortfolio(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const portfolios = await Portfolios.find({ user: req.user.userId })
      .populate("asset")
      .lean();

    if (!portfolios.length) {
      sendSuccess(res, { portfolios: [] });
      return;
    }

    // Calculate current values for each portfolio item
    const portfoliosWithValue = portfolios.map((portfolio: any) => {
      const asset = portfolio.asset as any;
      const currentValue =
        portfolio.quantity * (asset?.currentPrice || portfolio.averageBuyPrice);
      const gain =
        currentValue - portfolio.quantity * portfolio.averageBuyPrice;
      const gainPercent =
        portfolio.totalInvested > 0
          ? (gain / portfolio.totalInvested) * 100
          : 0;

      return {
        ...portfolio,
        calculatedCurrentValue: currentValue,
        calculatedUnrealizedGain: gain,
        calculatedUnrealizedGainPercent: Math.round(gainPercent * 100) / 100,
      };
    });

    sendSuccess(res, { portfolios: portfoliosWithValue });
  } catch (error) {
    next(error);
  }
}

export async function getPortfolioTransactions(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;

    const investmentAccount = await InvestmentAccounts.findOne({
      user: req.user.userId,
    });
    if (!investmentAccount) {
      sendPaginated(res, [], { page, limit, total: 0 });
      return;
    }

    const filter: any = { investmentAccount: investmentAccount._id };
    if (req.query.type) filter.transactionType = req.query.type;

    const [transactions, total] = await Promise.all([
      PortfolioTransactions.find(filter)
        .populate("asset", "symbol name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      PortfolioTransactions.countDocuments(filter),
    ]);

    sendPaginated(res, transactions, { page, limit, total });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// ASSETS
// ============================================================================

export async function getAssets(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const filter: any = { isActive: true };
    if (req.query.type) filter.assetType = req.query.type;

    const assets = await Assets.find(filter).sort({ symbol: 1 }).lean();

    sendSuccess(res, { assets });
  } catch (error) {
    next(error);
  }
}

export async function getAssetById(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const { id } = req.params;
    const assetId = typeof id === "string" ? id : String(id);

    const asset = await Assets.findOne({
      $or: [{ _id: assetId }, { symbol: assetId.toUpperCase() }],
      isActive: true,
    }).lean();

    if (!asset) throw new NotFoundError("Asset not found");

    sendSuccess(res, { asset });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// BUY/SELL ASSETS
// ============================================================================

export async function buyAsset(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const { assetId, amount, walletId } = req.body;
    const currency = "USD";

    // Get investment account
    const investmentAccount = await InvestmentAccounts.findOne({
      user: req.user.userId,
      status: "active",
    }).session(session);

    if (!investmentAccount) {
      throw new NotFoundError(
        "Investment account not found. Please create one first.",
      );
    }

    // Get asset
    const asset = await Assets.findOne({
      $or: [{ _id: assetId }, { symbol: assetId?.toUpperCase() }],
      isActive: true,
    }).session(session);

    if (!asset) throw new NotFoundError("Asset not found");

    // Calculate quantity
    const quantity = amount / asset.currentPrice;

    // Check minimum balance requirement if applicable
    const minBalance = (asset as any).minimumBalance;
    if (minBalance && amount < minBalance) {
      throw new ValidationError(`Minimum investment is $${minBalance}`);
    }

    // Get wallet
    const wallet = await Wallets.findOne({
      _id: walletId,
      user: req.user.userId,
      status: "active",
    }).session(session);

    if (!wallet) throw new NotFoundError("Wallet not found");

    const walletBalance = getWalletBalance(wallet, currency);
    if (walletBalance < amount) {
      throw new ValidationError("Insufficient balance");
    }

    // Deduct from wallet
    updateWalletBalance(wallet, currency, -amount);
    await wallet.save({ session });

    // Get or create portfolio for this asset
    let portfolio = await Portfolios.findOne({
      investmentAccount: investmentAccount._id,
      asset: asset._id,
    }).session(session);

    if (!portfolio) {
      portfolio = new Portfolios({
        user: req.user.userId,
        investmentAccount: investmentAccount._id,
        asset: asset._id,
        quantity: 0,
        averageBuyPrice: asset.currentPrice,
        totalInvested: 0,
        currentValue: 0,
        currency,
        firstPurchaseDate: new Date(),
      });
    }

    // Update portfolio
    const totalCost = portfolio.quantity * portfolio.averageBuyPrice + amount;
    const totalQuantity = portfolio.quantity + quantity;
    portfolio.averageBuyPrice = totalCost / totalQuantity;
    portfolio.quantity = totalQuantity;
    portfolio.totalInvested += amount;
    portfolio.currentValue = portfolio.quantity * asset.currentPrice;
    portfolio.lastPurchaseDate = new Date();
    await portfolio.save({ session });

    // Update investment account
    investmentAccount.totalInvested += amount;
    investmentAccount.currentValue += amount;
    await investmentAccount.save({ session });

    // Create portfolio transaction
    const reference = generateReferenceNumber();
    const portfolioTx = new PortfolioTransactions({
      user: req.user.userId,
      investmentAccount: investmentAccount._id,
      portfolio: portfolio._id,
      asset: asset._id,
      transactionType: "buy",
      quantity,
      pricePerUnit: asset.currentPrice,
      totalAmount: amount,
      fee: 0,
      currency,
      status: "completed",
      orderType: "market",
    });

    await portfolioTx.save({ session });

    // Create main transaction for ledger
    const transaction = await Transactions.create(
      [
        {
          wallet: wallet._id,
          type: "withdrawal",
          category: "investments",
          amount,
          currency,
          status: "completed",
          referenceNumber: reference,
          initiatedBy: req.user.userId,
          description: `Investment purchase - ${asset.symbol}`,
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
          amount,
          currency,
          balance: getWalletBalance(wallet, currency),
          description: `Investment purchase - ${asset.symbol}`,
          accountingDate: new Date(),
        },
      ],
      { session },
    );

    await session.commitTransaction();

    emitToUser(req.user!.userId, WS.INVESTMENT.PURCHASED, {
      asset: asset.symbol,
      quantity,
      pricePerUnit: asset.currentPrice,
      totalAmount: amount,
      reference,
      timestamp: new Date().toISOString(),
    });

    sendSuccess(
      res,
      {
        transaction: {
          id: portfolioTx._id,
          reference,
          asset: asset.symbol,
          quantity,
          pricePerUnit: asset.currentPrice,
          totalAmount: amount,
        },
      },
      "Asset purchased successfully",
    );
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
}

export async function sellAsset(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const { assetId, quantity, walletId } = req.body;
    const currency = "USD";

    // Get investment account
    const investmentAccount = await InvestmentAccounts.findOne({
      user: req.user.userId,
      status: "active",
    }).session(session);

    if (!investmentAccount) {
      throw new NotFoundError("Investment account not found");
    }

    // Get asset
    const asset = await Assets.findOne({
      $or: [{ _id: assetId }, { symbol: assetId?.toUpperCase() }],
    }).session(session);

    if (!asset) throw new NotFoundError("Asset not found");

    // Get portfolio for this specific asset
    const portfolio = await Portfolios.findOne({
      investmentAccount: investmentAccount._id,
      asset: asset._id,
    }).session(session);

    if (!portfolio) {
      throw new ValidationError("You do not own this asset");
    }

    if (portfolio.quantity < quantity) {
      throw new ValidationError(
        `Insufficient quantity. You have ${portfolio.quantity} units.`,
      );
    }

    // Calculate proceeds
    const proceeds = quantity * asset.currentPrice;
    const costBasis = quantity * portfolio.averageBuyPrice;
    const realizedGain = proceeds - costBasis;

    // Get wallet
    const wallet = await Wallets.findOne({
      _id: walletId,
      user: req.user.userId,
      status: "active",
    }).session(session);

    if (!wallet) throw new NotFoundError("Wallet not found");

    // Credit to wallet
    updateWalletBalance(wallet, currency, proceeds);
    await wallet.save({ session });

    // Update portfolio
    portfolio.quantity -= quantity;
    portfolio.totalInvested -= costBasis;
    portfolio.currentValue = portfolio.quantity * asset.currentPrice;
    portfolio.realizedGain += realizedGain;
    await portfolio.save({ session });

    // Update investment account
    investmentAccount.totalInvested -= costBasis;
    investmentAccount.currentValue -= costBasis;
    investmentAccount.totalReturns += realizedGain;
    await investmentAccount.save({ session });

    // Create portfolio transaction
    const reference = generateReferenceNumber();
    const portfolioTx = new PortfolioTransactions({
      user: req.user.userId,
      investmentAccount: investmentAccount._id,
      portfolio: portfolio._id,
      asset: asset._id,
      transactionType: "sell",
      quantity,
      pricePerUnit: asset.currentPrice,
      totalAmount: proceeds,
      fee: 0,
      currency,
      status: "completed",
      orderType: "market",
    });

    await portfolioTx.save({ session });

    // Create main transaction for ledger
    const transaction = await Transactions.create(
      [
        {
          wallet: wallet._id,
          type: "deposit",
          category: "investments",
          amount: proceeds,
          currency,
          status: "completed",
          referenceNumber: reference,
          initiatedBy: req.user.userId,
          description: `Investment sale - ${asset.symbol}`,
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
          entryType: "credit",
          amount: proceeds,
          currency,
          balance: getWalletBalance(wallet, currency),
          description: `Investment sale - ${asset.symbol}`,
          accountingDate: new Date(),
        },
      ],
      { session },
    );

    await session.commitTransaction();

    emitToUser(req.user!.userId, WS.INVESTMENT.SOLD, {
      asset: asset.symbol,
      quantity,
      pricePerUnit: asset.currentPrice,
      proceeds,
      realizedGain,
      reference,
      timestamp: new Date().toISOString(),
    });

    sendSuccess(
      res,
      {
        transaction: {
          id: portfolioTx._id,
          reference,
          asset: asset.symbol,
          quantity,
          pricePerUnit: asset.currentPrice,
          proceeds,
          realizedGain,
        },
      },
      "Asset sold successfully",
    );
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
}

// ============================================================================
// INTEREST PLANS
// ============================================================================

export async function getInterestPlans(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const plans = await InterestPlans.find({ status: "active" })
      .sort({ interestRate: -1 })
      .lean();

    sendSuccess(res, { plans });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// INVESTMENT SUMMARY
// ============================================================================

export async function getInvestmentSummary(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    // Get all investment data
    const [account, portfolios, goals, recentTransactions] = await Promise.all([
      InvestmentAccounts.findOne({ user: req.user.userId }).lean(),
      Portfolios.find({ user: req.user.userId }).populate("asset").lean(),
      SavingsGoals.find({ user: req.user.userId, status: "active" }).lean(),
      PortfolioTransactions.find({
        user: req.user.userId,
      })
        .populate("asset", "symbol")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    // Calculate totals
    const totalSavings = goals.reduce((sum, g) => sum + g.currentAmount, 0);
    const savingsTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);

    sendSuccess(res, {
      summary: {
        totalInvested: account?.totalInvested || 0,
        currentValue: account?.currentValue || 0,
        totalReturns: account?.totalReturns || 0,
        returnPercent: account?.totalInvested
          ? Math.round((account.totalReturns / account.totalInvested) * 10000) /
            100
          : 0,
        holdingsCount: portfolios?.length || 0,
        savingsGoals: {
          count: goals.length,
          totalSaved: totalSavings,
          totalTarget: savingsTarget,
          overallProgress:
            savingsTarget > 0
              ? Math.round((totalSavings / savingsTarget) * 100)
              : 0,
        },
        recentActivity: recentTransactions,
      },
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export default {
  getSavingsGoals,
  createSavingsGoal,
  depositToGoal,
  withdrawFromGoal,
  deleteSavingsGoal,
  getInvestmentAccount,
  createInvestmentAccount,
  getPortfolio,
  getPortfolioTransactions,
  getAssets,
  getAssetById,
  buyAsset,
  sellAsset,
  getInterestPlans,
  getInvestmentSummary,
};
