import { LoansRepository } from '../../domain/repository/loans.repository';
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
    queryKey: queryKeys.loans.list(filters as Record<string, unknown>),
    queryFn: async () => {
      const response = await LoansRepository.getAll(filters);
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
      const response = await LoansRepository.getById(loanId);
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
      const response = await LoansRepository.getProducts();
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
      const response = await LoansRepository.checkEligibility({ type: data.type, amount: data.amount, term: data.termMonths });
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
      const response = await LoansRepository.getSchedule(loanId);
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
      const response = await LoansRepository.getPayments(loanId, params);
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
      const response = await LoansRepository.getDocuments(loanId);
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
      const response = await LoansRepository.getSummary();
      return { amount: response.data.nextPaymentAmount, date: response.data.nextPaymentDate };
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
      const response = await LoansRepository.calculate({ type: 'personal' as any, amount: data.principal, term: data.termMonths });
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
      const response = await LoansRepository.apply(data);
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
      const response = await LoansRepository.makePayment({ loanId, amount: data.amount, sourceAccountId: data.accountId, pin: data.pin || '' });
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
      const response = await LoansRepository.setupAutoPayment(loanId, { sourceAccountId: data.accountId, dayOfMonth: data.paymentDay });
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
      const response = await LoansRepository.cancelAutoPayment(loanId);
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
      const response = await LoansRepository.requestDeferral(loanId, { months: data.extensionMonths, reason: data.reason });
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
      const response = await LoansRepository.requestDeferral(loanId, { months: data.deferralMonths, reason: data.reason });
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
      const response = await LoansRepository.requestRefinance(loanId, { newTerm: data.newTermMonths, reason: 'Refinance request' });
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
      const results = await Promise.all(documents.map(doc => LoansRepository.uploadDocument(loanId, doc, 'document')));
      return results;
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
      const response = await LoansRepository.getPayoffQuote(loanId);
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
      const response = await LoansRepository.cancelApplication(loanId);
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

// ============================================================================
// USER — APPLICATIONS & ELIGIBILITY
// ============================================================================

/** Get current user's loan applications  GET /loans/applications */
export const useUserApplications = () => {
  return useQuery({
    queryKey: [...queryKeys.loans.all, "user-applications"],
    queryFn: async () => {
      const response = await LoansRepository.getUserApplications();
      return response;
    },
  });
};

/** Check eligibility for current user  GET /loans/eligibility/check */
export const useEligibilityCheck = () => {
  return useQuery({
    queryKey: [...queryKeys.loans.all, "eligibility-check"],
    queryFn: async () => {
      const response = await LoansRepository.checkEligibilityStatus();
      return response;
    },
    retry: false,
  });
};

// ============================================================================
// ADMIN — LOAN APPLICATIONS
// ============================================================================

/** Admin: list all loan applications  GET /loans/admin/applications */
export const useAdminLoanApplications = (params?: {
  status?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ["admin", "loans", "applications", params],
    queryFn: async () => {
      const response = await LoansRepository.getAdminApplications(params);
      return response;
    },
  });
};

/** Admin: approve or reject a loan application */
export const useReviewLoanApplication = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();
  return useMutation({
    mutationFn: async ({
      applicationId,
      data,
    }: {
      applicationId: UUID;
      data: { decision: "approve" | "reject"; approvedAmount?: number; notes?: string; reason?: string };
    }) => {
      const response = await LoansRepository.reviewAdminApplication(applicationId, data);
      return response.data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "loans"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.loans.all });
      showToast(`Application ${vars.data.decision}d successfully`, "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Review failed", "error");
    },
  });
};

/** Admin: disburse an approved loan  POST /loans/admin/:loanId/disburse */
export const useDisburseAdminLoan = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();
  return useMutation({
    mutationFn: async (loanId: UUID) => {
      const response = await LoansRepository.disburseAdminLoan(loanId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "loans"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.loans.all });
      showToast("Loan disbursed successfully", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Disbursement failed", "error");
    },
  });
};
