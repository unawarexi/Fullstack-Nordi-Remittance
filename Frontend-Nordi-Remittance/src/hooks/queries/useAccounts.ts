// ============================================================================
// ACCOUNTS HOOKS - TanStack Query hooks for account management
// ============================================================================

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { accountsApi } from '../../core/api';
import { queryKeys } from '../../core/api/queryClient';
import { useToastStore } from '../../store/toast.store';
import type { AccountType, Currency, UUID } from '../../types/api.types';

// ============================================================================
// QUERY PARAMETER TYPES
// ============================================================================

interface AccountFilters {
  type?: AccountType;
  status?: string;
  currency?: Currency;
  page?: number;
  limit?: number;
}

interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  type?: string;
  page?: number;
  limit?: number;
}

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get account summary with all accounts and recent transactions
 */
export const useAccountSummary = () => {
  return useQuery({
    queryKey: queryKeys.accounts.summary(),
    queryFn: async () => {
      const response = await accountsApi.getSummary();
      return response.data;
    },
  });
};

/**
 * Get all user accounts
 */
export const useAccounts = (filters?: AccountFilters) => {
  return useQuery({
    queryKey: queryKeys.accounts.list(filters as Record<string, unknown>),
    queryFn: async () => {
      const response = await accountsApi.getAll(filters);
      return response;
    },
  });
};

/**
 * Get account by ID
 */
export const useAccount = (accountId: UUID) => {
  return useQuery({
    queryKey: queryKeys.accounts.detail(accountId),
    queryFn: async () => {
      const response = await accountsApi.getById(accountId);
      return response.data;
    },
    enabled: !!accountId,
  });
};

/**
 * Get default account
 */
export const useDefaultAccount = () => {
  return useQuery({
    queryKey: [...queryKeys.accounts.all, 'default'],
    queryFn: async () => {
      const response = await accountsApi.getDefault();
      return response.data;
    },
  });
};

/**
 * Get account balance
 */
export const useAccountBalance = (accountId: UUID) => {
  return useQuery({
    queryKey: queryKeys.accounts.balance(accountId),
    queryFn: async () => {
      const response = await accountsApi.getBalance(accountId);
      return response.data;
    },
    enabled: !!accountId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

/**
 * Get account transactions
 */
export const useAccountTransactions = (accountId: UUID, filters?: TransactionFilters) => {
  return useQuery({
    queryKey: queryKeys.accounts.transactions(accountId, filters as Record<string, unknown>),
    queryFn: async () => {
      const response = await accountsApi.getTransactions(accountId, filters);
      return response;
    },
    enabled: !!accountId,
  });
};

/**
 * Get account limits
 */
export const useAccountLimits = (accountId: UUID) => {
  return useQuery({
    queryKey: queryKeys.accounts.limits(accountId),
    queryFn: async () => {
      const response = await accountsApi.getLimits(accountId);
      return response.data;
    },
    enabled: !!accountId,
  });
};

/**
 * Get supported currencies
 */
export const useSupportedCurrencies = () => {
  return useQuery({
    queryKey: queryKeys.accounts.currencies(),
    queryFn: async () => {
      const response = await accountsApi.getSupportedCurrencies();
      return response.data;
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
};

/**
 * Get exchange rates
 */
export const useExchangeRates = (baseCurrency?: Currency) => {
  return useQuery({
    queryKey: queryKeys.accounts.exchangeRates(baseCurrency),
    queryFn: async () => {
      const response = await accountsApi.getExchangeRates(baseCurrency);
      return response.data;
    },
    refetchInterval: 60000, // Refresh every minute
  });
};

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create account mutation
 */
export const useCreateAccount = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (data: { accountType: AccountType; currency: Currency; name?: string }) => {
      const response = await accountsApi.create(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
      showToast('Account created successfully', 'success');
    },
    onError: (error: Error) => {
      showToast(error.message || 'Failed to create account', 'error');
    },
  });
};

/**
 * Update account mutation
 */
export const useUpdateAccount = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async ({ 
      accountId, 
      data 
    }: { 
      accountId: UUID; 
      data: { name?: string; dailyLimit?: number; monthlyLimit?: number } 
    }) => {
      const response = await accountsApi.update(accountId, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.list() });
      showToast('Account updated successfully', 'success');
    },
    onError: (error: Error) => {
      showToast(error.message || 'Failed to update account', 'error');
    },
  });
};

/**
 * Set default account mutation
 */
export const useSetDefaultAccount = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (accountId: UUID) => {
      const response = await accountsApi.setDefault(accountId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
      showToast('Default account updated', 'success');
    },
    onError: (error: Error) => {
      showToast(error.message || 'Failed to set default account', 'error');
    },
  });
};

/**
 * Close account mutation
 */
export const useCloseAccount = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (accountId: UUID) => {
      const response = await accountsApi.close(accountId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
      showToast('Account closed successfully', 'success');
    },
    onError: (error: Error) => {
      showToast(error.message || 'Failed to close account', 'error');
    },
  });
};

/**
 * Request limit increase mutation
 */
export const useRequestLimitIncrease = () => {
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async ({ 
      accountId, 
      data 
    }: { 
      accountId: UUID; 
      data: { limitType: 'daily' | 'monthly'; requestedLimit: number; reason: string } 
    }) => {
      const response = await accountsApi.requestLimitIncrease(accountId, data);
      return response.data;
    },
    onSuccess: () => {
      showToast('Limit increase request submitted', 'success');
    },
    onError: (error: Error) => {
      showToast(error.message || 'Failed to submit request', 'error');
    },
  });
};

/**
 * Get account statement mutation (returns download URL)
 */
export const useGetAccountStatement = () => {
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async ({ 
      accountId, 
      params 
    }: { 
      accountId: UUID; 
      params: { startDate: string; endDate: string; format?: 'pdf' | 'csv' } 
    }) => {
      const response = await accountsApi.getStatement(accountId, params);
      return response.data;
    },
    onSuccess: () => {
      showToast('Statement generated', 'success');
    },
    onError: (error: Error) => {
      showToast(error.message || 'Failed to generate statement', 'error');
    },
  });
};

/**
 * Convert currency mutation
 */
export const useConvertCurrency = () => {
  return useMutation({
    mutationFn: async (data: { fromCurrency: Currency; toCurrency: Currency; amount: number }) => {
      const response = await accountsApi.convertCurrency(data);
      return response.data;
    },
  });
};
