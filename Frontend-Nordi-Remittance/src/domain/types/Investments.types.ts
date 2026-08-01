// ============================================================================
// INVESTMENTS TYPES — Mirrors InvestmentsModel.ts
// SavingsGoal, InterestPlan, InvestmentAccount, Asset,
// Portfolio, PortfolioTransaction
// ============================================================================

declare global {
  interface SavingsGoal extends Timestamps {
    goalId: UUID;
    user: UUID;
    wallet: UUID;
    name: string;
    description?: string;
    targetAmount: number;
    currentAmount: number;
    currency: string;
    targetDate: ISO8601Date;
    status: 'active' | 'completed' | 'cancelled' | 'paused';
    category: 'emergency_fund' | 'vacation' | 'home' | 'car' | 'education' | 'retirement' | 'other';
    autoSaveEnabled: boolean;
    autoSaveAmount?: number;
    autoSaveFrequency?: 'daily' | 'weekly' | 'monthly';
    nextAutoSaveDate?: ISO8601Date;
    completedAt?: ISO8601Date;
  }

  interface InterestPlan {
    planId: UUID;
    name: string;
    description: string;
    interestRate: number;
    compoundingFrequency: 'daily' | 'monthly' | 'quarterly' | 'annually';
    minimumBalance: number;
    maximumBalance?: number;
    currency: string;
    accountType: 'savings' | 'fixed_deposit' | 'investment';
    term?: number;
    earlyWithdrawalPenalty?: number;
    status: 'active' | 'inactive';
    effectiveDate: ISO8601Date;
    expiryDate?: ISO8601Date;
    createdAt: ISO8601Date;
    updatedAt: ISO8601Date;
  }

  interface InvestmentAccount extends Timestamps {
    accountId: UUID;
    user: UUID;
    wallet: UUID;
    accountType: 'stocks' | 'crypto' | 'mutual_funds' | 'bonds' | 'etf' | 'commodities';
    status: 'active' | 'suspended' | 'closed';
    totalInvested: number;
    currentValue: number;
    totalReturns: number;
    returnPercentage: number;
    currency: string;
    riskProfile: 'conservative' | 'moderate' | 'aggressive';
    closedAt?: ISO8601Date;
  }

  interface Asset {
    assetId: UUID;
    symbol: string;
    name: string;
    assetType: 'stock' | 'crypto' | 'mutual_fund' | 'bond' | 'etf' | 'commodity';
    exchange?: string;
    currentPrice: number;
    currency: string;
    priceChange24h?: number;
    priceChangePercentage24h?: number;
    marketCap?: number;
    volume24h?: number;
    high24h?: number;
    low24h?: number;
    isActive: boolean;
    metadata?: Record<string, unknown>;
    lastUpdated: ISO8601Date;
    createdAt: ISO8601Date;
  }

  interface Portfolio extends Timestamps {
    portfolioId: UUID;
    user: UUID;
    investmentAccount: UUID;
    asset: UUID;
    quantity: number;
    averageBuyPrice: number;
    totalInvested: number;
    currentValue: number;
    unrealizedGain: number;
    unrealizedGainPercentage: number;
    realizedGain: number;
    currency: string;
    firstPurchaseDate: ISO8601Date;
    lastPurchaseDate?: ISO8601Date;
  }

  interface PortfolioTransaction {
    transactionId: UUID;
    user: UUID;
    investmentAccount: UUID;
    portfolio?: UUID;
    asset: UUID;
    transactionType: 'buy' | 'sell' | 'dividend' | 'fee' | 'bonus';
    quantity: number;
    pricePerUnit: number;
    totalAmount: number;
    fee: number;
    currency: string;
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    executionDate: ISO8601Date;
    settlementDate?: ISO8601Date;
    orderId?: string;
    orderType: 'market' | 'limit' | 'stop_loss' | 'stop_limit';
    limitPrice?: number;
    stopPrice?: number;
    failureReason?: string;
    transaction?: UUID;
    metadata?: Record<string, unknown>;
    createdAt: ISO8601Date;
  }

  // Legacy investment interface for backward compat
  interface Investment extends Timestamps {
    id: UUID;
    userId: UUID;
    type: InvestmentType;
    status: InvestmentStatus;
    name: string;
    principal: number;
    currency: Currency;
    interestRate: number;
    term: number;
    expectedReturns: number;
    currentValue: number;
    accruedInterest: number;
    startDate: ISO8601Date;
    maturityDate: ISO8601Date;
    autoRenew: boolean;
    sourceAccountId: UUID;
  }

  interface CreateInvestmentRequest {
    type: InvestmentType;
    amount: number;
    term: number;
    sourceAccountId: UUID;
    autoRenew?: boolean;
  }

  interface InvestmentProduct {
    id: UUID;
    type: InvestmentType;
    name: string;
    description: string;
    minAmount: number;
    maxAmount: number;
    minTerm: number;
    maxTerm: number;
    interestRate: number;
    riskLevel: 'low' | 'medium' | 'high';
    isAvailable: boolean;
  }
}

export {};
