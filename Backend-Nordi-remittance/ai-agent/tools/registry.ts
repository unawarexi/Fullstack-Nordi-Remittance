// ============================================================================
// AGENT TOOL REGISTRY — Banking operations available to the LLM
// ============================================================================
import type { AgentToolDefinition, AgentState } from '../types.js';
import { Wallets, AccountBalances, LedgerEntries } from '../../models/AccountsModel.js';
import Transactions from '../../models/TransactionModel.js';
import Users from '../../models/UserModel.js';
import { FraudCases, FraudSignals } from '../../models/FraudSecurityModel.js';
import { LedgerEngine } from '../../ledger/ledger-engine.js';
import { Journal } from '../../ledger/journal.js';
import { FraudDetectionEngine } from '../../core/algo/fraud-detection.js';
import { RiskScoringEngine } from '../../core/algo/risk-scoring.js';

// ============================================================================
// TOOL DEFINITIONS
// ============================================================================

const getAccountBalance: AgentToolDefinition = {
  name: 'get_account_balance',
  description: 'Get the balance of a user wallet. Returns available, ledger, pending, and reserved balances.',
  parameters: {
    type: 'object',
    properties: {
      walletId: { type: 'string', description: 'The wallet ID to check' },
      currency: { type: 'string', description: 'Currency code (e.g., USD, EUR, GBP)' },
    },
    required: ['walletId', 'currency'],
  },
  async execute(args) {
    const balance = await LedgerEngine.getBalance(args.walletId as string, args.currency as string);
    return balance;
  },
};

const getTransactionHistory: AgentToolDefinition = {
  name: 'get_transaction_history',
  description: 'Get recent transactions for a wallet. Returns the last N transactions with details.',
  parameters: {
    type: 'object',
    properties: {
      walletId: { type: 'string', description: 'The wallet ID' },
      limit: { type: 'number', description: 'Number of transactions to return (max 50)' },
    },
    required: ['walletId'],
  },
  async execute(args) {
    const limit = Math.min((args.limit as number) || 20, 50);
    const transactions = await Transactions.find({ wallet: args.walletId as string })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('type amount currency status description referenceNumber createdAt completedAt recipientName')
      .lean();
    return { transactions, count: transactions.length };
  },
};

const getAccountStatement: AgentToolDefinition = {
  name: 'get_account_statement',
  description: 'Generate an account statement for a wallet over a date range.',
  parameters: {
    type: 'object',
    properties: {
      walletId: { type: 'string', description: 'The wallet ID' },
      currency: { type: 'string', description: 'Currency code' },
      fromDate: { type: 'string', description: 'Start date (ISO format)' },
      toDate: { type: 'string', description: 'End date (ISO format)' },
    },
    required: ['walletId', 'currency', 'fromDate', 'toDate'],
  },
  async execute(args) {
    return Journal.statement(
      args.walletId as string,
      args.currency as string,
      new Date(args.fromDate as string),
      new Date(args.toDate as string),
    );
  },
};

const lookupUser: AgentToolDefinition = {
  name: 'lookup_user',
  description: 'Look up a user by email or user ID. Returns basic profile info (no sensitive data).',
  parameters: {
    type: 'object',
    properties: {
      userId: { type: 'string', description: 'User ID' },
      email: { type: 'string', description: 'User email address' },
    },
  },
  async execute(args) {
    const query = args.userId ? { _id: args.userId } : { email: args.email };
    const user = await Users.findOne(query)
      .select('firstName lastName email phoneNumber kycStatus role accountStatus createdAt')
      .lean();
    if (!user) return { found: false };
    return { found: true, user };
  },
};

const getUserWallets: AgentToolDefinition = {
  name: 'get_user_wallets',
  description: 'Get all wallets belonging to a user.',
  parameters: {
    type: 'object',
    properties: {
      userId: { type: 'string', description: 'The user ID' },
    },
    required: ['userId'],
  },
  async execute(args) {
    const wallets = await Wallets.find({ user: args.userId as string, status: 'active' })
      .select('walletNumber balances status walletType isPrimary createdAt')
      .lean();
    return { wallets, count: wallets.length };
  },
};

const initiateTransfer: AgentToolDefinition = {
  name: 'initiate_transfer',
  description: 'Initiate a transfer between two wallets. Requires human approval for amounts > $10,000.',
  requiresApproval: true,
  parameters: {
    type: 'object',
    properties: {
      fromWalletId: { type: 'string', description: 'Source wallet ID' },
      toWalletId: { type: 'string', description: 'Destination wallet ID' },
      amount: { type: 'number', description: 'Amount to transfer' },
      currency: { type: 'string', description: 'Currency code' },
      description: { type: 'string', description: 'Transfer description' },
    },
    required: ['fromWalletId', 'toWalletId', 'amount', 'currency', 'description'],
  },
  async execute(args, state) {
    return LedgerEngine.post({
      debitWalletId: args.fromWalletId as string,
      creditWalletId: args.toWalletId as string,
      amount: args.amount as number,
      currency: args.currency as string,
      description: args.description as string,
      transactionType: 'transfer',
      initiatedBy: state.userId || 'ai-agent',
      channel: 'api',
    });
  },
};

const checkFraudSignals: AgentToolDefinition = {
  name: 'check_fraud_signals',
  description: 'Check fraud signals for a specific transaction or user.',
  parameters: {
    type: 'object',
    properties: {
      userId: { type: 'string', description: 'User ID to check' },
      transactionId: { type: 'string', description: 'Transaction ID to check' },
    },
  },
  async execute(args) {
    const query: any = {};
    if (args.userId) query.user = args.userId;
    if (args.transactionId) query.transaction = args.transactionId;

    const signals = await FraudSignals.find(query)
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const cases = await FraudCases.find(query)
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return { signals, cases, signalCount: signals.length, caseCount: cases.length };
  },
};

const assessTransactionRisk: AgentToolDefinition = {
  name: 'assess_transaction_risk',
  description: 'Run a risk assessment on a proposed transaction before execution.',
  parameters: {
    type: 'object',
    properties: {
      userId: { type: 'string', description: 'User initiating the transaction' },
      amount: { type: 'number', description: 'Transaction amount' },
      currency: { type: 'string', description: 'Currency code' },
      recipientCountry: { type: 'string', description: 'Recipient country code' },
      transactionType: { type: 'string', description: 'Type of transaction' },
    },
    required: ['userId', 'amount', 'currency', 'transactionType'],
  },
  async execute(args) {
    // Build RiskFactors from user data + args
    const user = await Users.findById(args.userId).lean() as any;
    const txCount = await Transactions.countDocuments({ wallet: { $in: (user?.wallets || []) } });
    const avgAmount = txCount > 0
      ? (await Transactions.aggregate([{ $match: { wallet: { $in: (user?.wallets || []) } } }, { $group: { _id: null, avg: { $avg: '$amount' } } }]))[0]?.avg || 0
      : 0;
    const assessment = await RiskScoringEngine.assess({
      accountAge: user ? Math.floor((Date.now() - new Date(user.createdAt).getTime()) / 86_400_000) : 0,
      kycLevel: user?.kycLevel || 'none',
      totalTransactions: txCount,
      averageAmount: avgAmount,
      currentAmount: args.amount as number,
      isNewRecipient: true,
      isInternational: !!(args.recipientCountry && args.recipientCountry !== 'US'),
      isNewDevice: false,
      isNewIp: false,
      hourOfDay: new Date().getHours(),
      failedTxLast24h: 0,
      recipientCountry: args.recipientCountry as string | undefined,
    });
    return assessment;
  },
};

const getTransactionStats: AgentToolDefinition = {
  name: 'get_transaction_stats',
  description: 'Get aggregate transaction statistics for a wallet over a period.',
  parameters: {
    type: 'object',
    properties: {
      walletId: { type: 'string', description: 'Wallet ID' },
      periodDays: { type: 'number', description: 'Number of days to look back (default: 30)' },
    },
    required: ['walletId'],
  },
  async execute(args) {
    const days = (args.periodDays as number) || 30;
    const since = new Date(Date.now() - days * 86_400_000);

    const stats = await Transactions.aggregate([
      { $match: { wallet: args.walletId as string, status: 'completed', createdAt: { $gte: since } } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          avgAmount: { $avg: '$amount' },
          maxAmount: { $max: '$amount' },
        },
      },
    ]);

    return { periodDays: days, breakdown: stats };
  },
};

// ============================================================================
// REGISTRY
// ============================================================================

export const agentTools: AgentToolDefinition[] = [
  getAccountBalance,
  getTransactionHistory,
  getAccountStatement,
  lookupUser,
  getUserWallets,
  initiateTransfer,
  checkFraudSignals,
  assessTransactionRisk,
  getTransactionStats,
];
