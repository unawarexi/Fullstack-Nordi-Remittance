import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminRepository } from '../../domain/repository/admin.repository';
import { queryKeys } from "../../core/lib/queryClient";
import { useToastStore } from "../../store/toast.store";
// ============================================================================
// ADMIN HOOKS - TanStack Query hooks for admin & operations
// ============================================================================

// --- QUERIES ---

export const useAdminDashboardStats = () => {
  return useQuery({
    queryKey: queryKeys.admin.dashboard(),
    queryFn: async () => {
      const response = await AdminRepository.getDashboardStats();
      return response.data;
    },
    refetchInterval: 60000,
  });
};

export const useAdminAnalytics = () => {
  return useQuery({
    queryKey: ["admin", "analytics"],
    queryFn: async () => {
      const response = await AdminRepository.getAnalytics();
      return response.data;
    },
  });
};

export const useSearchUsers = (params?: any) => {
  return useQuery({
    queryKey: queryKeys.admin.users(params),
    queryFn: async () => {
      const response = await AdminRepository.searchUsers(params);
      return response;
    },
  });
};

export const useAdminUserDetails = (userId: UUID) => {
  return useQuery({
    queryKey: queryKeys.admin.userDetail(userId),
    queryFn: async () => {
      const response = await AdminRepository.getUserDetails(userId);
      return response.data;
    },
    enabled: !!userId,
  });
};

export const useAdminUserFinancialData = (userId: string) => {
  return useQuery({
    queryKey: [...queryKeys.admin.userDetail(userId as UUID), "financial"],
    queryFn: async () => {
      const response = await AdminRepository.getUserDetails(userId as UUID);
      return response.data;
    },
    enabled: !!userId,
  });
};

export const useAdminUsersList = (params?: any) => {
  return useQuery({
    queryKey: queryKeys.admin.admins(params),
    queryFn: async () => {
      const response = await AdminRepository.getAdminUsers(params);
      return response;
    },
  });
};

export const useSystemSettings = () => {
  return useQuery({
    queryKey: queryKeys.admin.settings(),
    queryFn: async () => {
      const response = await AdminRepository.getSystemSettings();
      return response.data;
    },
  });
};

export const useAuditLogs = (params?: any) => {
  return useQuery({
    queryKey: queryKeys.admin.auditLogs(params),
    queryFn: async () => {
      const response = await AdminRepository.getAuditLogs(params);
      return response;
    },
  });
};

export const useOperationalTasks = () => {
  return useQuery({
    queryKey: ["admin", "tasks"],
    queryFn: async () => {
      const response = await AdminRepository.getOperationalTasks();
      return response.data;
    },
  });
};

export const usePendingTransactions = (params?: any) => {
  return useQuery({
    queryKey: ["admin", "transactions", "pending", params],
    queryFn: async () => {
      const response = await AdminRepository.getPendingTransactions(params);
      return response;
    },
  });
};

export const useAdminProfile = () => {
  return useQuery({
    queryKey: ["admin", "profile"],
    queryFn: async () => {
      const response = await AdminRepository.getAdminProfile();
      return response.data;
    },
  });
};


export const useAdminPendingApplicationsQuery = (params?: any) => {
  return useQuery({
    queryKey: ["admin", "applications", "pending", params],
    queryFn: async () => {
      const response = await AdminRepository.getPendingApplications(params);
      return response;
    },
  });
};

// --- MUTATIONS ---

export const useAdminLogin = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await AdminRepository.login(data);
      return response.data;
    },
    onSuccess: () => {
      showToast("Admin login successful", "success");
      queryClient.invalidateQueries();
    },
    onError: (e: Error) => showToast(e.message || "Login failed", "error"),
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async ({
      userId,
      data,
    }: {
      userId: UUID;
      data: { status: UserStatus; reason?: string };
    }) => {
      const response = await AdminRepository.updateUserStatus(userId, data);
      return response.data;
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.userDetail(userId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users() });
      showToast("User status updated", "success");
    },
    onError: (e: Error) =>
      showToast(e.message || "Failed to update user", "error"),
  });
};

export const useAdminResetUserPassword = () => {
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (userId: UUID) => {
      const response = await AdminRepository.resetUserPassword(userId);
      return response.data;
    },
    onSuccess: () => showToast("Password reset initiated", "success"),
    onError: (e: Error) =>
      showToast(e.message || "Failed to reset password", "error"),
  });
};

export const useCreateAdminUser = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await AdminRepository.createAdminUser(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.admins() });
      showToast("Admin user created", "success");
    },
    onError: (e: Error) =>
      showToast(e.message || "Failed to create admin", "error"),
  });
};

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
      const response = await AdminRepository.approveTransaction(transactionId, note);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "transactions"] });
      showToast("Transaction approved", "success");
    },
  });
};

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
      const response = await AdminRepository.rejectTransaction(transactionId, reason);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "transactions"] });
      showToast("Transaction rejected", "success");
    },
  });
};

export const useApproveLoan = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();
  return useMutation({
    mutationFn: async ({ loanId, data }: { loanId: UUID; data: any }) => {
      const response = await AdminRepository.approveLoan(loanId, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      showToast("Loan approved", "success");
    },
  });
};

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
      const response = await AdminRepository.rejectLoan(loanId, reason);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      showToast("Loan rejected", "success");
    },
  });
};

export const useUpdateSystemSettings = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const response = await AdminRepository.updateSystemSetting(key, value);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.settings() });
      showToast("Settings updated", "success");
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (userId: UUID) => {
      const response = await AdminRepository.deleteUser(userId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users() });
      showToast("User deleted successfully", "success");
    },
    onError: (e: Error) =>
      showToast(e.message || "Failed to delete user", "error"),
  });
};

export const useAdminUpdateUser = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async ({ userId, data }: { userId: UUID; data: any }) => {
      const response = await AdminRepository.updateUser(userId, data);
      return response.data;
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.userDetail(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users() });
      showToast("User updated successfully", "success");
    },
    onError: (e: Error) =>
      showToast(e.message || "Failed to update user", "error"),
  });
};

export const useAdminOperations = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  const creditWallet = useMutation({
    mutationFn: async (data: any) =>
      (await AdminRepository.creditUserWallet(data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
    onError: () => {
      showToast("Failed to credit wallet", "error");
    },
  });

  const debitWallet = useMutation({
    mutationFn: async (data: any) =>
      (await AdminRepository.debitUserWallet(data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
    onError: () => {
      showToast("Failed to debit wallet", "error");
    },
  });

  const transfer = useMutation({
    mutationFn: async (data: any) => (await AdminRepository.adminTransfer(data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries();
      showToast("Transfer successful", "success");
    },
  });

  return { creditWallet, debitWallet, transfer };
};

export const useAdminProfileOperations = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  const updateProfile = useMutation({
    mutationFn: async (data: any) => (await AdminRepository.updateAdminProfile(data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "profile"] });
      showToast("Profile updated successfully", "success");
    },
    onError: (e: Error) => showToast(e.message || "Failed to update profile", "error"),
  });

  const requestOtp = useMutation({
    mutationFn: async (data: any) => (await AdminRepository.requestOtp(data)).data,
    onSuccess: () => showToast("OTP sent successfully", "success"),
    onError: (e: Error) => showToast(e.message || "Failed to request OTP", "error"),
  });

  const changePassword = useMutation({
    mutationFn: async (data: any) => (await AdminRepository.changeAdminPassword(data)).data,
    onSuccess: () => showToast("Password changed successfully", "success"),
    onError: (e: Error) => showToast(e.message || "Failed to change password", "error"),
  });

  const changeEmail = useMutation({
    mutationFn: async (data: any) => (await AdminRepository.changeAdminEmail(data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "profile"] });
      showToast("Email changed successfully", "success");
    },
    onError: (e: Error) => showToast(e.message || "Failed to change email", "error"),
  });

  return { updateProfile, requestOtp, changePassword, changeEmail };
};


export const useAdminCardOperations = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  const approveCard = useMutation({
    mutationFn: async (cardId: UUID) => (await AdminRepository.approveCard(cardId)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "cards"] });
      showToast("Card approved", "success");
    },
  });

  const rejectCard = useMutation({
    mutationFn: async ({ cardId, reason }: { cardId: UUID; reason: string }) => 
      (await AdminRepository.rejectCard(cardId, reason)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "cards"] });
      showToast("Card rejected", "success");
    },
  });

  const fundFromWallet = useMutation({
    mutationFn: async ({ cardId, data }: { cardId: UUID; data: any }) => 
      (await AdminRepository.fundCardFromWallet(cardId, data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      showToast("Card funded successfully", "success");
    },
  });

  return { approveCard, rejectCard, fundFromWallet };
};

export const useAdminInvestmentOperations = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  const approveInvestment = useMutation({
    mutationFn: async (investmentId: UUID) => (await AdminRepository.approveInvestment(investmentId)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "investments"] });
      showToast("Investment approved", "success");
    },
  });

  const addReturns = useMutation({
    mutationFn: async ({ investmentId, data }: { investmentId: UUID; data: any }) => 
      (await AdminRepository.addInvestmentReturns(investmentId, data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "investments"] });
      showToast("Returns added successfully", "success");
    },
  });

  return { approveInvestment, addReturns };
};

export const useAdminBulkOperations = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  const bulkCredit = useMutation({
    mutationFn: async (data: any) => (await AdminRepository.bulkCredit(data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      showToast("Bulk credit successful", "success");
    },
  });

  return { bulkCredit };
};

export const useAdminReverseTransaction = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async ({ transactionId, reason }: { transactionId: UUID; reason: string }) => 
      (await AdminRepository.reverseTransaction(transactionId, reason)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "transactions"] });
      showToast("Transaction reversed", "success");
    },
  });
};
