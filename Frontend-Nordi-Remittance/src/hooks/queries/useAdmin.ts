import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../core/api/endpoints/admin.api";
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
      const response = await adminApi.getDashboardStats();
      return response.data;
    },
    refetchInterval: 60000,
  });
};

export const useAdminAnalytics = () => {
  return useQuery({
    queryKey: ["admin", "analytics"],
    queryFn: async () => {
      const response = await adminApi.getAnalytics();
      return response.data;
    },
  });
};

export const useSearchUsers = (params?: any) => {
  return useQuery({
    queryKey: queryKeys.admin.users(params),
    queryFn: async () => {
      const response = await adminApi.searchUsers(params);
      return response;
    },
  });
};

export const useAdminUserDetails = (userId: UUID) => {
  return useQuery({
    queryKey: queryKeys.admin.userDetail(userId),
    queryFn: async () => {
      const response = await adminApi.getUserDetails(userId);
      return response.data;
    },
    enabled: !!userId,
  });
};

export const useAdminUserFinancialData = (userId: string) => {
  return useQuery({
    queryKey: [...queryKeys.admin.userDetail(userId as UUID), "financial"],
    queryFn: async () => {
      const response = await adminApi.getUserDetails(userId as UUID);
      return response.data;
    },
    enabled: !!userId,
  });
};

export const useAdminUsersList = (params?: any) => {
  return useQuery({
    queryKey: queryKeys.admin.admins(params),
    queryFn: async () => {
      const response = await adminApi.getAdminUsers(params);
      return response;
    },
  });
};

export const useSystemSettings = () => {
  return useQuery({
    queryKey: queryKeys.admin.settings(),
    queryFn: async () => {
      const response = await adminApi.getSystemSettings();
      return response.data;
    },
  });
};

export const useAuditLogs = (params?: any) => {
  return useQuery({
    queryKey: queryKeys.admin.auditLogs(params),
    queryFn: async () => {
      const response = await adminApi.getAuditLogs(params);
      return response;
    },
  });
};

export const useOperationalTasks = () => {
  return useQuery({
    queryKey: ["admin", "tasks"],
    queryFn: async () => {
      const response = await adminApi.getOperationalTasks();
      return response.data;
    },
  });
};

export const usePendingTransactions = (params?: any) => {
  return useQuery({
    queryKey: ["admin", "transactions", "pending", params],
    queryFn: async () => {
      const response = await adminApi.getPendingTransactions(params);
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
      const response = await adminApi.login(data);
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
      const response = await adminApi.updateUserStatus(userId, data);
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
      const response = await adminApi.resetUserPassword(userId);
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
      const response = await adminApi.createAdminUser(data);
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
      const response = await adminApi.approveTransaction(transactionId, note);
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
      const response = await adminApi.rejectTransaction(transactionId, reason);
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
      const response = await adminApi.approveLoan(loanId, data);
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
      const response = await adminApi.rejectLoan(loanId, reason);
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
      const response = await adminApi.updateSystemSetting(key, value);
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
      const response = await adminApi.deleteUser(userId);
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
      const response = await adminApi.updateUser(userId, data);
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
      (await adminApi.creditUserWallet(data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
    onError: () => {
      showToast("Failed to credit wallet", "error");
    },
  });

  const debitWallet = useMutation({
    mutationFn: async (data: any) =>
      (await adminApi.debitUserWallet(data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
    onError: () => {
      showToast("Failed to debit wallet", "error");
    },
  });

  const transfer = useMutation({
    mutationFn: async (data: any) => (await adminApi.adminTransfer(data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries();
      showToast("Transfer successful", "success");
    },
  });

  return { creditWallet, debitWallet, transfer };
};
