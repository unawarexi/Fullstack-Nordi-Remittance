// ============================================================================
// INVESTMENTS API - Savings and investment endpoints
// ============================================================================

import apiClient, { ApiResponse, PaginatedResponse } from '../client';

const INVESTMENTS_BASE = '/investments';

// ============================================================================
// REQUEST TYPES
// ============================================================================

export interface InvestmentFilters {
  type?: InvestmentType;
  status?: InvestmentStatus;
  page?: number;
  limit?: number;
}

// ============================================================================
// INVESTMENTS API FUNCTIONS
// ============================================================================

export const investmentsApi = {
  // ==========================================================================
  // INVESTMENT MANAGEMENT
  // ==========================================================================

  /**
   * Get all user investments
   */
  getAll: async (params?: InvestmentFilters): Promise<PaginatedResponse<Investment>> => {
    const response = await apiClient.get<PaginatedResponse<Investment>>(
      INVESTMENTS_BASE,
      { params }
    );
    return response.data;
  },

  /**
   * Get investment by ID
   */
  getById: async (investmentId: UUID): Promise<ApiResponse<Investment>> => {
    const response = await apiClient.get<ApiResponse<Investment>>(
      `${INVESTMENTS_BASE}/${investmentId}`
    );
    return response.data;
  },

  /**
   * Get active investments
   */
  getActive: async (): Promise<ApiResponse<Investment[]>> => {
    const response = await apiClient.get<ApiResponse<Investment[]>>(
      `${INVESTMENTS_BASE}/active`
    );
    return response.data;
  },

  /**
   * Get investment summary/portfolio
   */
  getSummary: async (): Promise<ApiResponse<{
    totalInvested: number;
    currentValue: number;
    totalReturns: number;
    returnPercentage: number;
    activeInvestments: number;
    maturedInvestments: number;
    byType: Record<InvestmentType, {
      count: number;
      invested: number;
      currentValue: number;
    }>;
  }>> => {
    const response = await apiClient.get<ApiResponse<{
      totalInvested: number;
      currentValue: number;
      totalReturns: number;
      returnPercentage: number;
      activeInvestments: number;
      maturedInvestments: number;
      byType: Record<InvestmentType, {
        count: number;
        invested: number;
        currentValue: number;
      }>;
    }>>(`${INVESTMENTS_BASE}/summary`);
    return response.data;
  },

  // ==========================================================================
  // INVESTMENT PRODUCTS
  // ==========================================================================

  /**
   * Get available investment products
   */
  getProducts: async (type?: InvestmentType): Promise<ApiResponse<InvestmentProduct[]>> => {
    const response = await apiClient.get<ApiResponse<InvestmentProduct[]>>(
      `${INVESTMENTS_BASE}/products`,
      { params: type ? { type } : undefined }
    );
    return response.data;
  },

  /**
   * Get product details
   */
  getProductDetails: async (productId: UUID): Promise<ApiResponse<InvestmentProduct & {
    historicalReturns: Array<{
      period: string;
      return: number;
    }>;
    terms: string[];
    risks: string[];
  }>> => {
    const response = await apiClient.get<ApiResponse<InvestmentProduct & {
      historicalReturns: Array<{
        period: string;
        return: number;
      }>;
      terms: string[];
      risks: string[];
    }>>(`${INVESTMENTS_BASE}/products/${productId}`);
    return response.data;
  },

  // ==========================================================================
  // CREATE & MANAGE
  // ==========================================================================

  /**
   * Create a new investment
   */
  create: async (data: CreateInvestmentRequest): Promise<ApiResponse<Investment>> => {
    const response = await apiClient.post<ApiResponse<Investment>>(
      INVESTMENTS_BASE,
      data
    );
    return response.data;
  },

  /**
   * Calculate investment returns
   */
  calculate: async (data: {
    type: InvestmentType;
    amount: number;
    term: number;
  }): Promise<ApiResponse<{
    principal: number;
    interestRate: number;
    expectedReturns: number;
    maturityValue: number;
    maturityDate: string;
  }>> => {
    const response = await apiClient.post<ApiResponse<{
      principal: number;
      interestRate: number;
      expectedReturns: number;
      maturityValue: number;
      maturityDate: string;
    }>>(`${INVESTMENTS_BASE}/calculate`, data);
    return response.data;
  },

  /**
   * Top up an existing investment
   */
  topUp: async (investmentId: UUID, data: {
    amount: number;
    sourceAccountId: UUID;
  }): Promise<ApiResponse<Investment>> => {
    const response = await apiClient.post<ApiResponse<Investment>>(
      `${INVESTMENTS_BASE}/${investmentId}/top-up`,
      data
    );
    return response.data;
  },

  /**
   * Toggle auto-renew
   */
  toggleAutoRenew: async (investmentId: UUID): Promise<ApiResponse<Investment>> => {
    const response = await apiClient.patch<ApiResponse<Investment>>(
      `${INVESTMENTS_BASE}/${investmentId}/auto-renew`
    );
    return response.data;
  },

  // ==========================================================================
  // WITHDRAWALS
  // ==========================================================================

  /**
   * Withdraw from investment
   */
  withdraw: async (investmentId: UUID, data: {
    amount?: number; // If not provided, withdraw all
    destinationAccountId: UUID;
    pin: string;
  }): Promise<ApiResponse<{
    investment: Investment;
    withdrawnAmount: number;
    penalty?: number;
    netAmount: number;
  }>> => {
    const response = await apiClient.post<ApiResponse<{
      investment: Investment;
      withdrawnAmount: number;
      penalty?: number;
      netAmount: number;
    }>>(`${INVESTMENTS_BASE}/${investmentId}/withdraw`, data);
    return response.data;
  },

  /**
   * Get early withdrawal penalty
   */
  getWithdrawalPenalty: async (investmentId: UUID, amount?: number): Promise<ApiResponse<{
    withdrawableAmount: number;
    penalty: number;
    penaltyPercentage: number;
    netAmount: number;
    accruedInterest: number;
    lostInterest: number;
  }>> => {
    const response = await apiClient.get<ApiResponse<{
      withdrawableAmount: number;
      penalty: number;
      penaltyPercentage: number;
      netAmount: number;
      accruedInterest: number;
      lostInterest: number;
    }>>(`${INVESTMENTS_BASE}/${investmentId}/withdrawal-penalty`, {
      params: amount ? { amount } : undefined,
    });
    return response.data;
  },

  // ==========================================================================
  // HISTORY & STATEMENTS
  // ==========================================================================

  /**
   * Get investment transactions
   */
  getTransactions: async (investmentId: UUID, params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<{
    id: UUID;
    type: 'deposit' | 'interest' | 'withdrawal' | 'penalty';
    amount: number;
    balance: number;
    date: string;
    description: string;
  }>> => {
    const response = await apiClient.get<PaginatedResponse<{
      id: UUID;
      type: 'deposit' | 'interest' | 'withdrawal' | 'penalty';
      amount: number;
      balance: number;
      date: string;
      description: string;
    }>>(`${INVESTMENTS_BASE}/${investmentId}/transactions`, { params });
    return response.data;
  },

  /**
   * Get interest history
   */
  getInterestHistory: async (investmentId: UUID): Promise<ApiResponse<Array<{
    date: string;
    rate: number;
    amount: number;
    balance: number;
  }>>> => {
    const response = await apiClient.get<ApiResponse<Array<{
      date: string;
      rate: number;
      amount: number;
      balance: number;
    }>>>(`${INVESTMENTS_BASE}/${investmentId}/interest-history`);
    return response.data;
  },

  /**
   * Get investment statement
   */
  getStatement: async (investmentId: UUID, params: {
    startDate: string;
    endDate: string;
    format?: 'pdf' | 'csv';
  }): Promise<ApiResponse<{ downloadUrl: string }>> => {
    const response = await apiClient.get<ApiResponse<{ downloadUrl: string }>>(
      `${INVESTMENTS_BASE}/${investmentId}/statement`,
      { params }
    );
    return response.data;
  },

  // ==========================================================================
  // SAVINGS GOALS
  // ==========================================================================

  /**
   * Get savings goals
   */
  getSavingsGoals: async (): Promise<ApiResponse<Array<{
    id: UUID;
    name: string;
    targetAmount: number;
    currentAmount: number;
    targetDate: string;
    progress: number;
    linkedInvestmentId?: UUID;
    autoSaveEnabled: boolean;
    autoSaveAmount?: number;
    autoSaveFrequency?: 'daily' | 'weekly' | 'monthly';
  }>>> => {
    const response = await apiClient.get<ApiResponse<Array<{
      id: UUID;
      name: string;
      targetAmount: number;
      currentAmount: number;
      targetDate: string;
      progress: number;
      linkedInvestmentId?: UUID;
      autoSaveEnabled: boolean;
      autoSaveAmount?: number;
      autoSaveFrequency?: 'daily' | 'weekly' | 'monthly';
    }>>>(`${INVESTMENTS_BASE}/savings`);
    return response.data;
  },

  /**
   * Create savings goal
   */
  createSavingsGoal: async (data: {
    name: string;
    targetAmount: number;
    targetDate: string;
    initialAmount?: number;
    sourceAccountId?: UUID;
    autoSaveEnabled?: boolean;
    autoSaveAmount?: number;
    autoSaveFrequency?: 'daily' | 'weekly' | 'monthly';
  }): Promise<ApiResponse<{
    id: UUID;
    name: string;
    targetAmount: number;
    currentAmount: number;
    targetDate: string;
    progress: number;
  }>> => {
    const response = await apiClient.post<ApiResponse<{
      id: UUID;
      name: string;
      targetAmount: number;
      currentAmount: number;
      targetDate: string;
      progress: number;
    }>>(`${INVESTMENTS_BASE}/savings`, data);
    return response.data;
  },

  /**
   * Update savings goal
   */
  updateSavingsGoal: async (goalId: UUID, data: {
    name?: string;
    targetAmount?: number;
    targetDate?: string;
    autoSaveEnabled?: boolean;
    autoSaveAmount?: number;
    autoSaveFrequency?: 'daily' | 'weekly' | 'monthly';
  }): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.patch<ApiResponse<{ message: string }>>(
      `${INVESTMENTS_BASE}/savings/${goalId}`,
      data
    );
    return response.data;
  },

  /**
   * Delete savings goal
   */
  deleteSavingsGoal: async (goalId: UUID): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(
      `${INVESTMENTS_BASE}/savings/${goalId}`
    );
    return response.data;
  },

  /**
   * Add funds to savings goal
   */
  addToSavingsGoal: async (goalId: UUID, data: {
    amount: number;
    sourceAccountId: UUID;
  }): Promise<ApiResponse<{ message: string; newBalance: number }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string; newBalance: number }>>(
      `${INVESTMENTS_BASE}/savings/${goalId}/deposit`,
      data
    );
    return response.data;
  },

  // ==========================================================================
  // EXTENDED METHODS (map to available backend endpoints)
  // ==========================================================================

  /** Get investment portfolio */
  getPortfolio: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>(`${INVESTMENTS_BASE}/portfolio`);
    return response.data;
  },

  /** Get product by ID — alias for getProductDetails */
  getProductById: async (productId: UUID): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>(`${INVESTMENTS_BASE}/products/${productId}`);
    return response.data;
  },

  /** Get investment performance */
  getPerformance: async (investmentId: UUID, params?: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>(`${INVESTMENTS_BASE}/${investmentId}/performance`, { params });
    return response.data;
  },

  /** Close an investment */
  close: async (investmentId: UUID, data?: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.post<ApiResponse<any>>(`${INVESTMENTS_BASE}/${investmentId}/close`, data);
    return response.data;
  },

  /** Set up recurring investment */
  setupRecurring: async (investmentId: UUID, data?: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.post<ApiResponse<any>>(`${INVESTMENTS_BASE}/${investmentId}/recurring`, data);
    return response.data;
  },

  /** Cancel recurring investment */
  cancelRecurring: async (investmentId: UUID): Promise<ApiResponse<any>> => {
    const response = await apiClient.delete<ApiResponse<any>>(`${INVESTMENTS_BASE}/${investmentId}/recurring`);
    return response.data;
  },

  /** Get savings goal by ID */
  getSavingsGoalById: async (goalId: UUID): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>(`${INVESTMENTS_BASE}/savings/${goalId}`);
    return response.data;
  },

  /** Get savings goal progress */
  getSavingsGoalProgress: async (goalId: UUID): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>(`${INVESTMENTS_BASE}/savings/${goalId}`);
    return response.data;
  },

  /** Withdraw from savings goal */
  withdrawFromSavingsGoal: async (goalId: UUID, data?: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.post<ApiResponse<any>>(`${INVESTMENTS_BASE}/savings/${goalId}/withdraw`, data);
    return response.data;
  },
};

export default investmentsApi;
