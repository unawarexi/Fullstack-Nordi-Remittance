// ============================================================================
// INVESTMENTS HOOKS - TanStack Query hooks for investments and savings
// ============================================================================


// ============================================================================
// QUERY PARAMETER TYPES
// ============================================================================

interface InvestmentFilters {
  type?: InvestmentType;
  status?: InvestmentStatus;
  page?: number;
  limit?: number;
}

interface ProductFilters {
  type?: InvestmentType;
  minInvestment?: number;
  riskLevel?: "low" | "medium" | "high";
}

// ============================================================================
// QUERIES - INVESTMENTS
// ============================================================================

/**
 * Get all user investments
 */
export const useInvestments = (filters?: InvestmentFilters) => {
  return useQuery({
    queryKey: queryKeys.investments.list(filters),
    queryFn: async () => {
      const response = await investmentsApi.getAll(filters);
      return response;
    },
  });
};

/**
 * Get investment by ID
 */
export const useInvestment = (investmentId: UUID) => {
  return useQuery({
    queryKey: queryKeys.investments.detail(investmentId),
    queryFn: async () => {
      const response = await investmentsApi.getById(investmentId);
      return response.data;
    },
    enabled: !!investmentId,
  });
};

/**
 * Get investment portfolio summary
 */
export const useInvestmentPortfolio = () => {
  return useQuery({
    queryKey: [...queryKeys.investments.all, "portfolio"],
    queryFn: async () => {
      const response = await investmentsApi.getPortfolio();
      return response.data;
    },
  });
};

/**
 * Get available investment products
 */
export const useInvestmentProducts = (filters?: ProductFilters) => {
  return useQuery({
    queryKey: queryKeys.investments.products(filters),
    queryFn: async () => {
      const response = await investmentsApi.getProducts(filters);
      return response.data;
    },
  });
};

/**
 * Get investment product by ID
 */
export const useInvestmentProduct = (productId: UUID) => {
  return useQuery({
    queryKey: [...queryKeys.investments.products(), productId],
    queryFn: async () => {
      const response = await investmentsApi.getProductById(productId);
      return response.data;
    },
    enabled: !!productId,
  });
};

/**
 * Get investment performance
 */
export const useInvestmentPerformance = (
  investmentId: UUID,
  period?: "1M" | "3M" | "6M" | "1Y" | "ALL",
) => {
  return useQuery({
    queryKey: [
      ...queryKeys.investments.detail(investmentId),
      "performance",
      period,
    ],
    queryFn: async () => {
      const response = await investmentsApi.getPerformance(
        investmentId,
        period,
      );
      return response.data;
    },
    enabled: !!investmentId,
  });
};

/**
 * Get investment transactions
 */
export const useInvestmentTransactions = (
  investmentId: UUID,
  params?: { page?: number; limit?: number },
) => {
  return useQuery({
    queryKey: [
      ...queryKeys.investments.detail(investmentId),
      "transactions",
      params,
    ],
    queryFn: async () => {
      const response = await investmentsApi.getTransactions(
        investmentId,
        params,
      );
      return response;
    },
    enabled: !!investmentId,
  });
};

// ============================================================================
// QUERIES - SAVINGS GOALS
// ============================================================================

/**
 * Get all savings goals
 */
export const useSavingsGoals = () => {
  return useQuery({
    queryKey: queryKeys.investments.savingsGoals(),
    queryFn: async () => {
      const response = await investmentsApi.getSavingsGoals();
      return response.data;
    },
  });
};

/**
 * Get savings goal by ID
 */
export const useSavingsGoal = (goalId: UUID) => {
  return useQuery({
    queryKey: queryKeys.investments.savingsGoal(goalId),
    queryFn: async () => {
      const response = await investmentsApi.getSavingsGoalById(goalId);
      return response.data;
    },
    enabled: !!goalId,
  });
};

/**
 * Get savings goal progress
 */
export const useSavingsGoalProgress = (goalId: UUID) => {
  return useQuery({
    queryKey: [...queryKeys.investments.savingsGoal(goalId), "progress"],
    queryFn: async () => {
      const response = await investmentsApi.getSavingsGoalProgress(goalId);
      return response.data;
    },
    enabled: !!goalId,
  });
};

// ============================================================================
// MUTATIONS - INVESTMENTS
// ============================================================================

/**
 * Create investment mutation
 */
export const useCreateInvestment = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (data: CreateInvestmentRequest) => {
      const response = await investmentsApi.create(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.investments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
      showToast("Investment created successfully", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to create investment", "error");
    },
  });
};

/**
 * Top up investment mutation
 */
export const useTopUpInvestment = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async ({
      investmentId,
      data,
    }: {
      investmentId: UUID;
      data: { amount: number; accountId: UUID; pin?: string };
    }) => {
      const response = await investmentsApi.topUp(investmentId, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.investments.detail(variables.investmentId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.investments.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
      showToast("Top-up successful", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to top up investment", "error");
    },
  });
};

/**
 * Withdraw from investment mutation
 */
export const useWithdrawInvestment = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async ({
      investmentId,
      data,
    }: {
      investmentId: UUID;
      data: { amount: number; accountId: UUID; pin?: string };
    }) => {
      const response = await investmentsApi.withdraw(investmentId, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.investments.detail(variables.investmentId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.investments.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
      showToast("Withdrawal successful", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to withdraw", "error");
    },
  });
};

/**
 * Close investment mutation
 */
export const useCloseInvestment = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async ({
      investmentId,
      data,
    }: {
      investmentId: UUID;
      data: { destinationAccountId: UUID; pin?: string; reason?: string };
    }) => {
      const response = await investmentsApi.close(investmentId, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.investments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
      showToast("Investment closed", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to close investment", "error");
    },
  });
};

/**
 * Setup recurring investment mutation
 */
export const useSetupRecurringInvestment = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async ({
      investmentId,
      data,
    }: {
      investmentId: UUID;
      data: {
        amount: number;
        accountId: UUID;
        frequency: "daily" | "weekly" | "biweekly" | "monthly";
        dayOfWeek?: number;
        dayOfMonth?: number;
        startDate?: string;
      };
    }) => {
      const response = await investmentsApi.setupRecurring(investmentId, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.investments.detail(variables.investmentId),
      });
      showToast("Recurring investment setup", "success");
    },
    onError: (error: Error) => {
      showToast(
        error.message || "Failed to setup recurring investment",
        "error",
      );
    },
  });
};

/**
 * Cancel recurring investment mutation
 */
export const useCancelRecurringInvestment = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (investmentId: UUID) => {
      const response = await investmentsApi.cancelRecurring(investmentId);
      return response.data;
    },
    onSuccess: (_, investmentId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.investments.detail(investmentId),
      });
      showToast("Recurring investment cancelled", "success");
    },
    onError: (error: Error) => {
      showToast(
        error.message || "Failed to cancel recurring investment",
        "error",
      );
    },
  });
};

// ============================================================================
// MUTATIONS - SAVINGS GOALS
// ============================================================================

/**
 * Create savings goal mutation
 */
export const useCreateSavingsGoal = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      targetAmount: number;
      targetDate: string;
      accountId: UUID;
      category?: string;
      imageUrl?: string;
      autoSave?: {
        enabled: boolean;
        amount: number;
        frequency: "daily" | "weekly" | "biweekly" | "monthly";
      };
    }) => {
      const response = await investmentsApi.createSavingsGoal(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.investments.savingsGoals(),
      });
      showToast("Savings goal created", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to create savings goal", "error");
    },
  });
};

/**
 * Update savings goal mutation
 */
export const useUpdateSavingsGoal = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async ({
      goalId,
      data,
    }: {
      goalId: UUID;
      data: Partial<{
        name: string;
        targetAmount: number;
        targetDate: string;
        category: string;
        imageUrl: string;
      }>;
    }) => {
      const response = await investmentsApi.updateSavingsGoal(goalId, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.investments.savingsGoal(variables.goalId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.investments.savingsGoals(),
      });
      showToast("Savings goal updated", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to update savings goal", "error");
    },
  });
};

/**
 * Add to savings goal mutation
 */
export const useAddToSavingsGoal = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async ({
      goalId,
      data,
    }: {
      goalId: UUID;
      data: { amount: number; accountId: UUID; pin?: string };
    }) => {
      const response = await investmentsApi.addToSavingsGoal(goalId, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.investments.savingsGoal(variables.goalId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.investments.savingsGoals(),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
      showToast("Added to savings goal", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to add to savings goal", "error");
    },
  });
};

/**
 * Withdraw from savings goal mutation
 */
export const useWithdrawFromSavingsGoal = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async ({
      goalId,
      data,
    }: {
      goalId: UUID;
      data: { amount: number; accountId: UUID; pin?: string; reason?: string };
    }) => {
      const response = await investmentsApi.withdrawFromSavingsGoal(
        goalId,
        data,
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.investments.savingsGoal(variables.goalId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.investments.savingsGoals(),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
      showToast("Withdrawal successful", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to withdraw", "error");
    },
  });
};

/**
 * Delete savings goal mutation
 */
export const useDeleteSavingsGoal = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async ({
      goalId,
      transferAccountId,
    }: {
      goalId: UUID;
      transferAccountId: UUID;
    }) => {
      const response = await investmentsApi.deleteSavingsGoal(
        goalId,
        transferAccountId,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.investments.savingsGoals(),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
      showToast("Savings goal deleted", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to delete savings goal", "error");
    },
  });
};

/**
 * Update auto-save settings mutation
 */
export const useUpdateAutoSave = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async ({
      goalId,
      data,
    }: {
      goalId: UUID;
      data: {
        enabled: boolean;
        amount?: number;
        frequency?: "daily" | "weekly" | "biweekly" | "monthly";
        accountId?: UUID;
      };
    }) => {
      const response = await investmentsApi.updateAutoSave(goalId, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.investments.savingsGoal(variables.goalId),
      });
      showToast(
        variables.data.enabled ? "Auto-save enabled" : "Auto-save disabled",
        "success",
      );
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to update auto-save", "error");
    },
  });
};
