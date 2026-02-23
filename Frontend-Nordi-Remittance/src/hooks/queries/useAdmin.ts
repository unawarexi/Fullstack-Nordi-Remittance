// ============================================================================
// ADMIN HOOKS - TanStack Query hooks for admin panel operations
// ============================================================================


// ============================================================================
// QUERY PARAMETER TYPES (matching admin.api.ts)
// ============================================================================

interface AdminUserFilters {
  status?: UserStatus;
  role?: string;
  kycStatus?: KycStatus;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

interface AdminTransactionFilters {
  status?: string;
  type?: string;
  minAmount?: number;
  maxAmount?: number;
  userId?: UUID;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

interface AdminLoanFilters {
  status?: LoanStatus;
  type?: string;
  userId?: UUID;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  limit?: number;
}

interface AuditLogFilters {
  userId?: UUID;
  action?: string;
  resource?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// ============================================================================
// QUERIES - DASHBOARD
// ============================================================================

/**
 * Get admin dashboard statistics
 */
export const useAdminDashboardStats = () => {
  return useQuery({
    queryKey: queryKeys.admin.dashboard(),
    queryFn: async () => {
      const response = await adminApi.getDashboardStats();
      return response.data;
    },
    refetchInterval: 60000, // Refresh every minute
  });
};

/**
 * Get real-time metrics
 */
export const useRealTimeMetrics = () => {
  return useQuery({
    queryKey: queryKeys.admin.realtime(),
    queryFn: async () => {
      const response = await adminApi.getRealTimeMetrics();
      return response.data;
    },
    refetchInterval: 10000, // Refresh every 10 seconds
  });
};

// ============================================================================
// QUERIES - USER MANAGEMENT
// ============================================================================

/**
 * Get all users (admin)
 */
export const useAdminUsers = (filters?: AdminUserFilters) => {
  return useQuery({
    queryKey: queryKeys.admin.users(filters as Record<string, unknown>),
    queryFn: async () => {
      const response = await adminApi.getUsers(filters);
      return response;
    },
  });
};

/**
 * Get user details (admin)
 */
export const useAdminUser = (userId: UUID) => {
  return useQuery({
    queryKey: queryKeys.admin.userDetail(userId),
    queryFn: async () => {
      const response = await adminApi.getUserById(userId);
      return response.data;
    },
    enabled: !!userId,
  });
};

/**
 * Get admin users list
 */
export const useAdminUsersList = (filters?: {
  role?: string;
  department?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: queryKeys.admin.admins(filters as Record<string, unknown>),
    queryFn: async () => {
      const response = await adminApi.getAdminUsers(filters);
      return response;
    },
  });
};

// ============================================================================
// QUERIES - TRANSACTIONS
// ============================================================================

/**
 * Get all transactions (admin)
 */
export const useAdminTransactions = (filters?: AdminTransactionFilters) => {
  return useQuery({
    queryKey: queryKeys.admin.transactions(filters as Record<string, unknown>),
    queryFn: async () => {
      const response = await adminApi.getTransactions(filters);
      return response;
    },
  });
};

/**
 * Get transaction details (admin)
 */
export const useAdminTransaction = (transactionId: UUID) => {
  return useQuery({
    queryKey: [...queryKeys.admin.transactions(), transactionId],
    queryFn: async () => {
      const response = await adminApi.getTransactionById(transactionId);
      return response.data;
    },
    enabled: !!transactionId,
  });
};

// ============================================================================
// QUERIES - LOANS
// ============================================================================

/**
 * Get all loans (admin)
 */
export const useAdminLoans = (filters?: AdminLoanFilters) => {
  return useQuery({
    queryKey: queryKeys.admin.loans(filters as Record<string, unknown>),
    queryFn: async () => {
      const response = await adminApi.getLoans(filters);
      return response;
    },
  });
};

/**
 * Get loan details (admin)
 */
export const useAdminLoanDetails = (loanId: UUID) => {
  return useQuery({
    queryKey: [...queryKeys.admin.loans(), loanId],
    queryFn: async () => {
      const response = await adminApi.getLoanById(loanId);
      return response.data;
    },
    enabled: !!loanId,
  });
};

// ============================================================================
// QUERIES - KYC
// ============================================================================

/**
 * Get pending KYC verifications
 */
export const usePendingKycVerifications = (filters?: {
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: queryKeys.admin.pendingKyc(filters as Record<string, unknown>),
    queryFn: async () => {
      const response = await adminApi.getPendingKyc(filters);
      return response;
    },
  });
};

// ============================================================================
// QUERIES - FRAUD
// ============================================================================

/**
 * Get fraud alerts (admin)
 */
export const useAdminFraudAlerts = (filters?: {
  severity?: string;
  status?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: queryKeys.admin.fraudAlerts(filters as Record<string, unknown>),
    queryFn: async () => {
      const response = await adminApi.getFraudAlerts(filters);
      return response;
    },
  });
};

// ============================================================================
// QUERIES - AUDIT LOGS
// ============================================================================

/**
 * Get audit logs
 */
export const useAuditLogs = (filters?: AuditLogFilters) => {
  return useQuery({
    queryKey: queryKeys.admin.auditLogs(filters as Record<string, unknown>),
    queryFn: async () => {
      const response = await adminApi.getAuditLogs(filters);
      return response;
    },
  });
};

// ============================================================================
// QUERIES - SYSTEM SETTINGS
// ============================================================================

/**
 * Get system settings
 */
export const useSystemSettings = () => {
  return useQuery({
    queryKey: queryKeys.admin.settings(),
    queryFn: async () => {
      const response = await adminApi.getSystemSettings();
      return response.data;
    },
  });
};

// ============================================================================
// MUTATIONS - USER MANAGEMENT
// ============================================================================

/**
 * Update user status mutation
 */
export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async ({
      userId,
      data,
    }: {
      userId: UUID;
      data: {
        status: UserStatus;
        reason?: string;
      };
    }) => {
      const response = await adminApi.updateUserStatus(userId, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.userDetail(variables.userId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users() });
      showToast("User status updated", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to update user status", "error");
    },
  });
};

/**
 * Update user KYC status mutation
 */
export const useUpdateUserKycStatus = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async ({
      userId,
      data,
    }: {
      userId: UUID;
      data: {
        status: KycStatus;
        level?: string;
        reason?: string;
      };
    }) => {
      const response = await adminApi.updateUserKycStatus(userId, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.userDetail(variables.userId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.pendingKyc() });
      showToast("KYC status updated", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to update KYC status", "error");
    },
  });
};

/**
 * Reset user password mutation
 */
export const useAdminResetUserPassword = () => {
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (userId: UUID) => {
      const response = await adminApi.resetUserPassword(userId);
      return response.data;
    },
    onSuccess: () => {
      showToast("Password reset email sent", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to reset password", "error");
    },
  });
};

/**
 * Force logout user mutation
 */
export const useForceLogoutUser = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (userId: UUID) => {
      const response = await adminApi.forceLogoutUser(userId);
      return response.data;
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.userDetail(userId),
      });
      showToast("User logged out from all devices", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to logout user", "error");
    },
  });
};

// ============================================================================
// MUTATIONS - ADMIN USERS
// ============================================================================

/**
 * Create admin user mutation
 */
export const useCreateAdminUser = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (data: {
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      permissions: string[];
      department?: string;
    }) => {
      const response = await adminApi.createAdminUser(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.admins() });
      showToast("Admin user created", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to create admin user", "error");
    },
  });
};

/**
 * Update admin user mutation
 */
export const useUpdateAdminUser = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async ({
      adminId,
      data,
    }: {
      adminId: UUID;
      data: Partial<{
        role: string;
        permissions: string[];
        department: string;
        status: string;
      }>;
    }) => {
      const response = await adminApi.updateAdminUser(adminId, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.admins() });
      showToast("Admin user updated", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to update admin user", "error");
    },
  });
};

/**
 * Delete admin user mutation
 */
export const useDeleteAdminUser = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (adminId: UUID) => {
      const response = await adminApi.deleteAdminUser(adminId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.admins() });
      showToast("Admin user deleted", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to delete admin user", "error");
    },
  });
};

// ============================================================================
// MUTATIONS - TRANSACTIONS
// ============================================================================

/**
 * Approve transaction mutation
 */
export const useApproveTransaction = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async ({
      transactionId,
      note,
    }: {
      transactionId: UUID;
      note?: string;
    }) => {
      const response = await adminApi.approveTransaction(transactionId, note);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.transactions(),
      });
      showToast("Transaction approved", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to approve transaction", "error");
    },
  });
};

/**
 * Reject transaction mutation
 */
export const useRejectTransaction = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async ({
      transactionId,
      reason,
    }: {
      transactionId: UUID;
      reason: string;
    }) => {
      const response = await adminApi.rejectTransaction(transactionId, reason);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.transactions(),
      });
      showToast("Transaction rejected", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to reject transaction", "error");
    },
  });
};

/**
 * Reverse transaction mutation
 */
export const useReverseTransaction = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async ({
      transactionId,
      reason,
    }: {
      transactionId: UUID;
      reason: string;
    }) => {
      const response = await adminApi.reverseTransaction(transactionId, reason);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.transactions(),
      });
      showToast("Transaction reversed", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to reverse transaction", "error");
    },
  });
};

// ============================================================================
// MUTATIONS - LOANS
// ============================================================================

/**
 * Approve loan mutation
 */
export const useApproveLoan = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async ({
      loanId,
      data,
    }: {
      loanId: UUID;
      data: {
        approvedAmount: number;
        interestRate: number;
        term: number;
        note?: string;
      };
    }) => {
      const response = await adminApi.approveLoan(loanId, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.loans() });
      showToast("Loan approved", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to approve loan", "error");
    },
  });
};

/**
 * Reject loan mutation
 */
export const useRejectLoan = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async ({
      loanId,
      reason,
    }: {
      loanId: UUID;
      reason: string;
    }) => {
      const response = await adminApi.rejectLoan(loanId, reason);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.loans() });
      showToast("Loan rejected", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to reject loan", "error");
    },
  });
};

/**
 * Disburse loan mutation
 */
export const useDisburseLoan = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (loanId: UUID) => {
      const response = await adminApi.disburseLoan(loanId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.loans() });
      showToast("Loan disbursed", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to disburse loan", "error");
    },
  });
};

// ============================================================================
// MUTATIONS - KYC
// ============================================================================

/**
 * Approve KYC document mutation
 */
export const useApproveKycDocument = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (documentId: UUID) => {
      const response = await adminApi.approveKycDocument(documentId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.pendingKyc() });
      showToast("KYC document approved", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to approve document", "error");
    },
  });
};

/**
 * Reject KYC document mutation
 */
export const useRejectKycDocument = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async ({
      documentId,
      reason,
    }: {
      documentId: UUID;
      reason: string;
    }) => {
      const response = await adminApi.rejectKycDocument(documentId, reason);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.pendingKyc() });
      showToast("KYC document rejected", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to reject document", "error");
    },
  });
};

// ============================================================================
// MUTATIONS - FRAUD
// ============================================================================

/**
 * Resolve fraud alert mutation
 */
export const useResolveFraudAlert = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async ({
      alertId,
      data,
    }: {
      alertId: UUID;
      data: {
        resolution: string;
        action?: "none" | "warn" | "suspend" | "block";
      };
    }) => {
      const response = await adminApi.resolveFraudAlert(alertId, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.fraudAlerts(),
      });
      showToast("Fraud alert resolved", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to resolve alert", "error");
    },
  });
};

// ============================================================================
// MUTATIONS - SYSTEM SETTINGS
// ============================================================================

/**
 * Update system settings mutation
 */
export const useUpdateSystemSettings = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (
      data: Partial<{
        maintenance: boolean;
        maintenanceMessage: string;
        registrationEnabled: boolean;
        withdrawalsEnabled: boolean;
        depositsEnabled: boolean;
        remittanceEnabled: boolean;
        kycRequired: boolean;
        minKycLevel: string;
        transactionLimits: {
          daily: number;
          monthly: number;
          perTransaction: number;
        };
        fees: {
          transfer: number;
          withdrawal: number;
          remittance: number;
        };
      }>,
    ) => {
      const response = await adminApi.updateSystemSettings(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.settings() });
      showToast("Settings updated", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to update settings", "error");
    },
  });
};
