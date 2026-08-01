// ============================================================================
// STATISTICS TYPES — Mirrors StatisticsModel.ts
// ============================================================================

declare global {
  interface PlatformStatistics extends Timestamps {
    date: ISO8601Date;
    period: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly';

    users: {
      total: number;
      active: number;
      new: number;
      suspended: number;
      kycPending: number;
      kycVerified: number;
    };

    transactions: {
      total: number;
      volume: number;
      currency: string;
      byType: {
        deposit: number;
        withdrawal: number;
        transfer: number;
        payment: number;
      };
      byStatus: {
        completed: number;
        pending: number;
        failed: number;
      };
      averageAmount: number;
      fees: number;
    };

    cards: {
      totalIssued: number;
      active: number;
      blocked: number;
      transactions: number;
      volume: number;
    };

    loans: {
      totalActive: number;
      totalDisbursed: number;
      totalRepaid: number;
      outstanding: number;
      defaulted: number;
      applications: number;
    };

    investments: {
      totalAccounts: number;
      totalValue: number;
      returns: number;
      transactions: number;
    };

    security: {
      fraudSignals: number;
      fraudCases: number;
      disputes: number;
      chargebacks: number;
      blockedTransactions: number;
    };

    support: {
      openTickets: number;
      closedTickets: number;
      averageResponseTime: number;
      satisfactionScore: number;
    };

    revenue: {
      transactionFees: number;
      cardFees: number;
      loanInterest: number;
      other: number;
      total: number;
      currency: string;
    };
  }
}

export {};
