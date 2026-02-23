import {
  transactionsApi,
  recipientsApi,
} from "../../core/api/endpoints/transactions.api";
import { useToastStore } from "../../store/toast.store";
import { queryKeys } from "../../core/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// ============================================================================
// TRANSACTIONS HOOKS - TanStack Query hooks for transactions
// ============================================================================

// ============================================================================
// TRANSACTION QUERIES
// ============================================================================

/**
 * Get all transactions
 */
export const useTransactions = (filters?: TransactionFilters) => {
  return useQuery({
    queryKey: queryKeys.transactions.list(filters),
    queryFn: async () => {
      const response = await transactionsApi.getAll(filters);
      return response;
    },
  });
};

/**
 * Get transaction by ID
 */
export const useTransaction = (transactionId: UUID) => {
  return useQuery({
    queryKey: queryKeys.transactions.detail(transactionId),
    queryFn: async () => {
      const response = await transactionsApi.getById(transactionId);
      return response.data;
    },
    enabled: !!transactionId,
  });
};

/**
 * Get transaction by reference
 */
export const useTransactionByReference = (reference: string) => {
  return useQuery({
    queryKey: queryKeys.transactions.byReference(reference),
    queryFn: async () => {
      const response = await transactionsApi.getByReference(reference);
      return response.data;
    },
    enabled: !!reference,
  });
};

/**
 * Get recent transactions
 */
export const useRecentTransactions = (limit?: number) => {
  return useQuery({
    queryKey: queryKeys.transactions.recent(limit),
    queryFn: async () => {
      const response = await transactionsApi.getRecent(limit);
      return response.data;
    },
  });
};

/**
 * Get deposit methods
 */
export const useDepositMethods = (currency?: Currency) => {
  return useQuery({
    queryKey: queryKeys.transactions.depositMethods(currency),
    queryFn: async () => {
      const response = await transactionsApi.getDepositMethods(currency);
      return response.data;
    },
  });
};

/**
 * Get remittance countries
 */
export const useRemittanceCountries = () => {
  return useQuery({
    queryKey: queryKeys.transactions.remittanceCountries(),
    queryFn: async () => {
      const response = await transactionsApi.getRemittanceCountries();
      return response.data;
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
};

// ============================================================================
// TRANSACTION MUTATIONS
// ============================================================================

/**
 * Internal transfer mutation
 */
export const useTransfer = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (data: TransferRequest) => {
      const response = await transactionsApi.transfer(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
      showToast("Transfer successful", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Transfer failed", "error");
    },
  });
};

/**
 * Transfer to user mutation
 */
export const useTransferToUser = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (data: {
      sourceAccountId: UUID;
      recipientEmail: string;
      amount: number;
      currency: Currency;
      description?: string;
      pin: string;
    }) => {
      const response = await transactionsApi.transferToUser(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
      showToast("Transfer successful", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Transfer failed", "error");
    },
  });
};

/**
 * Schedule transfer mutation
 */
export const useScheduleTransfer = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (
      data: TransferRequest & {
        scheduledDate: string;
        frequency?: "once" | "daily" | "weekly" | "biweekly" | "monthly";
        endDate?: string;
      },
    ) => {
      const response = await transactionsApi.scheduleTransfer(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
      showToast("Transfer scheduled successfully", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to schedule transfer", "error");
    },
  });
};

/**
 * Cancel scheduled transfer mutation
 */
export const useCancelScheduledTransfer = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (scheduleId: UUID) => {
      const response =
        await transactionsApi.cancelScheduledTransfer(scheduleId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
      showToast("Scheduled transfer cancelled", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to cancel transfer", "error");
    },
  });
};

/**
 * Send remittance mutation
 */
export const useSendRemittance = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (data: RemittanceRequest) => {
      const response = await transactionsApi.sendRemittance(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
      showToast("Remittance sent successfully", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Remittance failed", "error");
    },
  });
};

/**
 * Get remittance quote mutation
 */
export const useRemittanceQuote = () => {
  return useMutation({
    mutationFn: async (data: {
      amount: number;
      sourceCurrency: Currency;
      destinationCurrency: Currency;
      destinationCountry: string;
      deliveryMethod: "bank_transfer" | "mobile_money" | "cash_pickup";
    }) => {
      const response = await transactionsApi.getRemittanceQuote(data);
      return response.data;
    },
  });
};

/**
 * Deposit mutation
 */
export const useDeposit = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (data: DepositRequest) => {
      const response = await transactionsApi.deposit(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
      showToast("Deposit initiated", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Deposit failed", "error");
    },
  });
};

/**
 * Withdraw mutation
 */
export const useWithdraw = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (data: WithdrawalRequest) => {
      const response = await transactionsApi.withdraw(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
      showToast("Withdrawal initiated", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Withdrawal failed", "error");
    },
  });
};

/**
 * Calculate fee mutation
 */
export const useCalculateFee = () => {
  return useMutation({
    mutationFn: async (data: {
      type: "transfer" | "withdrawal" | "remittance";
      amount: number;
      currency: Currency;
      destinationCurrency?: Currency;
      destinationCountry?: string;
    }) => {
      const response = await transactionsApi.calculateFee(data);
      return response.data;
    },
  });
};

/**
 * Get receipt mutation
 */
export const useGetReceipt = () => {
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (transactionId: UUID) => {
      const response = await transactionsApi.getReceipt(transactionId);
      return response.data;
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to get receipt", "error");
    },
  });
};

/**
 * Email receipt mutation
 */
export const useEmailReceipt = () => {
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async ({
      transactionId,
      email,
    }: {
      transactionId: UUID;
      email?: string;
    }) => {
      const response = await transactionsApi.emailReceipt(transactionId, email);
      return response.data;
    },
    onSuccess: () => {
      showToast("Receipt sent to email", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to send receipt", "error");
    },
  });
};

// ============================================================================
// RECIPIENT QUERIES
// ============================================================================

/**
 * Get all recipients
 */
export const useRecipients = (params?: {
  search?: string;
  country?: string;
  isFavorite?: boolean;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: queryKeys.recipients.list(params),
    queryFn: async () => {
      const response = await recipientsApi.getAll(params);
      return response;
    },
  });
};

/**
 * Get recipient by ID
 */
export const useRecipient = (recipientId: UUID) => {
  return useQuery({
    queryKey: queryKeys.recipients.detail(recipientId),
    queryFn: async () => {
      const response = await recipientsApi.getById(recipientId);
      return response.data;
    },
    enabled: !!recipientId,
  });
};

/**
 * Get favorite recipients
 */
export const useFavoriteRecipients = () => {
  return useQuery({
    queryKey: queryKeys.recipients.favorites(),
    queryFn: async () => {
      const response = await recipientsApi.getFavorites();
      return response.data;
    },
  });
};

/**
 * Get recent recipients
 */
export const useRecentRecipients = (limit?: number) => {
  return useQuery({
    queryKey: queryKeys.recipients.recent(limit),
    queryFn: async () => {
      const response = await recipientsApi.getRecent(limit);
      return response.data;
    },
  });
};

// ============================================================================
// RECIPIENT MUTATIONS
// ============================================================================

/**
 * Create recipient mutation
 */
export const useCreateRecipient = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (data: CreateRecipientRequest) => {
      const response = await recipientsApi.create(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recipients.all });
      showToast("Recipient added successfully", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to add recipient", "error");
    },
  });
};

/**
 * Update recipient mutation
 */
export const useUpdateRecipient = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async ({
      recipientId,
      data,
    }: {
      recipientId: UUID;
      data: Partial<CreateRecipientRequest>;
    }) => {
      const response = await recipientsApi.update(recipientId, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.recipients.detail(data.id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.recipients.list() });
      showToast("Recipient updated successfully", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to update recipient", "error");
    },
  });
};

/**
 * Delete recipient mutation
 */
export const useDeleteRecipient = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (recipientId: UUID) => {
      const response = await recipientsApi.delete(recipientId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recipients.all });
      showToast("Recipient deleted", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to delete recipient", "error");
    },
  });
};

/**
 * Toggle recipient favorite mutation
 */
export const useToggleRecipientFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recipientId: UUID) => {
      const response = await recipientsApi.toggleFavorite(recipientId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recipients.all });
    },
  });
};
