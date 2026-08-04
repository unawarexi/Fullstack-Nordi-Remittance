import mongoose, { Schema } from 'mongoose';

const StatisticsSchema: Schema = new Schema({
  date: { type: Date, required: true },
  period: { type: String, enum: ['hourly', 'daily', 'weekly', 'monthly', 'yearly'], required: true },
  
  users: {
    total: { type: Number, default: 0 },
    active: { type: Number, default: 0 },
    new: { type: Number, default: 0 },
    suspended: { type: Number, default: 0 },
    kycPending: { type: Number, default: 0 },
    kycVerified: { type: Number, default: 0 }
  },
  
  transactions: {
    total: { type: Number, default: 0 },
    volume: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
    byType: {
      deposit: { type: Number, default: 0 },
      withdrawal: { type: Number, default: 0 },
      transfer: { type: Number, default: 0 },
      payment: { type: Number, default: 0 }
    },
    byStatus: {
      completed: { type: Number, default: 0 },
      pending: { type: Number, default: 0 },
      failed: { type: Number, default: 0 }
    },
    averageAmount: { type: Number, default: 0 },
    fees: { type: Number, default: 0 }
  },
  
  cards: {
    totalIssued: { type: Number, default: 0 },
    active: { type: Number, default: 0 },
    blocked: { type: Number, default: 0 },
    transactions: { type: Number, default: 0 },
    volume: { type: Number, default: 0 }
  },
  
  loans: {
    totalActive: { type: Number, default: 0 },
    totalDisbursed: { type: Number, default: 0 },
    totalRepaid: { type: Number, default: 0 },
    outstanding: { type: Number, default: 0 },
    defaulted: { type: Number, default: 0 },
    applications: { type: Number, default: 0 }
  },
  
  investments: {
    totalAccounts: { type: Number, default: 0 },
    totalValue: { type: Number, default: 0 },
    returns: { type: Number, default: 0 },
    transactions: { type: Number, default: 0 }
  },
  
  accounts: {
    totalActive: { type: Number, default: 0 },
    totalClosed: { type: Number, default: 0 },
    newThisPeriod: { type: Number, default: 0 },
    totalBalance: { type: Number, default: 0 },
    averageBalance: { type: Number, default: 0 },
    byType: {
      personal: { type: Number, default: 0 },
      business: { type: Number, default: 0 },
      savings: { type: Number, default: 0 },
      current: { type: Number, default: 0 },
      fixed_deposit: { type: Number, default: 0 }
    }
  },
  
  security: {
    fraudSignals: { type: Number, default: 0 },
    fraudCases: { type: Number, default: 0 },
    disputes: { type: Number, default: 0 },
    chargebacks: { type: Number, default: 0 },
    blockedTransactions: { type: Number, default: 0 }
  },
  
  support: {
    openTickets: { type: Number, default: 0 },
    closedTickets: { type: Number, default: 0 },
    averageResponseTime: { type: Number, default: 0 },
    satisfactionScore: { type: Number, default: 0 }
  },
  
  revenue: {
    transactionFees: { type: Number, default: 0 },
    cardFees: { type: Number, default: 0 },
    loanInterest: { type: Number, default: 0 },
    other: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' }
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes
StatisticsSchema.index({ date: 1, period: 1 }, { unique: true });
StatisticsSchema.index({ period: 1, date: -1 });

const Statistics = mongoose.model('Statistics', StatisticsSchema);
export default Statistics;