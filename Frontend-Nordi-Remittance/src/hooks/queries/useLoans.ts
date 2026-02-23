import { loansApi } from '../../core/api/endpoints/loans.api';
import { useToastStore } from '../../store/toast.store';
import { queryKeys } from '../../core/lib/queryClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// ============================================================================
// LOANS HOOKS - TanStack Query hooks for loan management
// ============================================================================


// ============================================================================
// QUERY PARAMETER TYPES
// ============================================================================

interface LoanFilters {
  type?: LoanType;
  status?: LoanStatus;
  page?: number;
  limit?: number;
}

interface LoanProductFilters {
  type?: LoanType;
  minAmount?: number;
  maxAmount?: number;
}

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get all user loans
 */
export const useLoans = (filters?: LoanFilters) => {
  return useQuery({
    queryKey: queryKeys.loans.list(filters),
    queryFn: async () => {
      const response = await loansApi.getAll(filters);
      return response;
    },
  });
};

/**
 * Get loan by ID
 */
export const useLoan = (loanId: UUID) => {
  return useQuery({
    queryKey: queryKeys.loans.detail(loanId),
    queryFn: async () => {
      const response = await loansApi.getById(loanId);
      return response.data;
    },
    enabled: !!loanId,
  });
};

/**
 * Get available loan products
 */
export const useLoanProducts = (filters?: LoanProductFilters) => {
  return useQuery({
    queryKey: [...queryKeys.loans.all, "products", filters],
    queryFn: async () => {
      const response = await loansApi.getProducts(filters);
      return response.data;
    },
  });
};

/**
 * Check loan eligibility
 */
export const useLoanEligibility = (data: {
  type: LoanType;
  amount: number;
  termMonths: number;
}) => {
  return useQuery({
    queryKey: [...queryKeys.loans.all, "eligibility", data],
    queryFn: async () => {
      const response = await loansApi.checkEligibility(data);
      return response.data;
    },
    enabled: !!data.type && !!data.amount && !!data.termMonths,
  });
};

/**
 * Get loan schedule/amortization
 */
export const useLoanSchedule = (loanId: UUID) => {
  return useQuery({
    queryKey: queryKeys.loans.schedule(loanId),
    queryFn: async () => {
      const response = await loansApi.getSchedule(loanId);
      return response.data;
    },
    enabled: !!loanId,
  });
};

/**
 * Get loan payment history
 */
export const useLoanPayments = (
  loanId: UUID,
  params?: { page?: number; limit?: number },
) => {
  return useQuery({
    queryKey: queryKeys.loans.payments(loanId, params),
    queryFn: async () => {
      const response = await loansApi.getPayments(loanId, params);
      return response;
    },
    enabled: !!loanId,
  });
};

/**
 * Get loan documents
 */
export const useLoanDocuments = (loanId: UUID) => {
  return useQuery({
    queryKey: [...queryKeys.loans.detail(loanId), "documents"],
    queryFn: async () => {
      const response = await loansApi.getDocuments(loanId);
      return response.data;
    },
    enabled: !!loanId,
  });
};

/**
 * Get next payment info
 */
export const useNextLoanPayment = (loanId: UUID) => {
  return useQuery({
    queryKey: [...queryKeys.loans.detail(loanId), "next-payment"],
    queryFn: async () => {
      const response = await loansApi.getNextPayment(loanId);
      return response.data;
    },
    enabled: !!loanId,
  });
};

/**
 * Calculate EMI
 */
export const useCalculateEmi = (data: {
  principal: number;
  annualRate: number;
  termMonths: number;
}) => {
  return useQuery({
    queryKey: [...queryKeys.loans.all, "emi-calculator", data],
    queryFn: async () => {
      const response = await loansApi.calculateEmi(data);
      return response.data;
    },
    enabled: !!data.principal && !!data.annualRate && !!data.termMonths,
  });
};

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Apply for loan mutation
 */
export const useApplyForLoan = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (data: LoanApplication) => {
      const response = await loansApi.apply(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.loans.all });
      showToast("Loan application submitted successfully", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to submit loan application", "error");
    },
  });
};

/**
 * Make loan payment mutation
 */
export const useMakeLoanPayment = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async ({
      loanId,
      data,
    }: {
      loanId: UUID;
      data: {
        amount: number;
        accountId: UUID;
        paymentType?: "regular" | "extra" | "payoff";
        pin?: string;
      };
    }) => {
      const response = await loansApi.makePayment(loanId, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.loans.detail(variables.loanId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.loans.schedule(variables.loanId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.loans.payments(variables.loanId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
      showToast("Payment successful", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to process payment", "error");
    },
  });
};

/**
 * Setup auto-pay mutation
 */
export const useSetupAutoPay = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async ({
      loanId,
      data,
    }: {
      loanId: UUID;
      data: {
        accountId: UUID;
        paymentDay: number;
        autoPayAmount?: "minimum" | "full";
      };
    }) => {
      const response = await loansApi.setupAutoPay(loanId, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.loans.detail(variables.loanId),
      });
      showToast("Auto-pay enabled", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to setup auto-pay", "error");
    },
  });
};

/**
 * Cancel auto-pay mutation
 */
export const useCancelAutoPay = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (loanId: UUID) => {
      const response = await loansApi.cancelAutoPay(loanId);
      return response.data;
    },
    onSuccess: (_, loanId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.loans.detail(loanId),
      });
      showToast("Auto-pay disabled", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to cancel auto-pay", "error");
    },
  });
};

/**
 * Request loan extension mutation
 */
export const useRequestLoanExtension = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async ({
      loanId,
      data,
    }: {
      loanId: UUID;
      data: {
        extensionMonths: number;
        reason: string;
      };
    }) => {
      const response = await loansApi.requestExtension(loanId, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.loans.detail(variables.loanId),
      });
      showToast("Extension request submitted", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to request extension", "error");
    },
  });
};

/**
 * Request payment deferral mutation
 */
export const useRequestPaymentDeferral = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async ({
      loanId,
      data,
    }: {
      loanId: UUID;
      data: {
        deferralMonths: number;
        reason: string;
        supportingDocuments?: string[];
      };
    }) => {
      const response = await loansApi.requestDeferral(loanId, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.loans.detail(variables.loanId),
      });
      showToast("Deferral request submitted", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to request deferral", "error");
    },
  });
};

/**
 * Refinance loan mutation
 */
export const useRefinanceLoan = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async ({
      loanId,
      data,
    }: {
      loanId: UUID;
      data: {
        newTermMonths: number;
        newInterestRate?: number;
      };
    }) => {
      const response = await loansApi.refinance(loanId, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.loans.all });
      showToast("Refinance application submitted", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to refinance", "error");
    },
  });
};

/**
 * Upload loan documents mutation
 */
export const useUploadLoanDocuments = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async ({
      loanId,
      documents,
    }: {
      loanId: UUID;
      documents: File[];
    }) => {
      const formData = new FormData();
      documents.forEach((doc) => {
        formData.append("documents", doc);
      });
      const response = await loansApi.uploadDocuments(loanId, formData);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.loans.detail(variables.loanId), "documents"],
      });
      showToast("Documents uploaded successfully", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to upload documents", "error");
    },
  });
};

/**
 * Request payoff quote mutation
 */
export const useGetPayoffQuote = () => {
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async ({
      loanId,
      payoffDate,
    }: {
      loanId: UUID;
      payoffDate?: string;
    }) => {
      const response = await loansApi.getPayoffQuote(loanId, payoffDate);
      return response.data;
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to get payoff quote", "error");
    },
  });
};

/**
 * Cancel loan application mutation
 */
export const useCancelLoanApplication = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async ({
      loanId,
      reason,
    }: {
      loanId: UUID;
      reason?: string;
    }) => {
      const response = await loansApi.cancelApplication(loanId, reason);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.loans.all });
      showToast("Application cancelled", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to cancel application", "error");
    },
  });
};
