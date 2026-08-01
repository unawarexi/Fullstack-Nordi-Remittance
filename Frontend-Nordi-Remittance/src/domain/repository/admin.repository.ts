import { ApiEndpoints } from "../../core/api/endpoint";
// ============================================================================
// ADMIN API - Admin-specific endpoints for dashboard and management
// ============================================================================

import apiClient, { ApiResponse, PaginatedResponse } from "@core/api/client";

// ============================================================================
// ADMIN API FUNCTIONS
// ============================================================================

export const AdminRepository = {
  // ==========================================================================
  // AUTH
  // ==========================================================================
  login: async (data: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.post<ApiResponse<any>>(ApiEndpoints.adminLogin, data);
    return response.data;
  },
  logout: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.post<ApiResponse<any>>(ApiEndpoints.adminLogout);
    return response.data;
  },

  // ==========================================================================
  // DASHBOARD & ANALYTICS
  // ==========================================================================
  getDashboardStats: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>(ApiEndpoints.adminDashboard);
    return response.data;
  },
  getAnalytics: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>(ApiEndpoints.adminAnalytics);
    return response.data;
  },

  // ==========================================================================
  // USER MANAGEMENT
  // ==========================================================================
  searchUsers: async (params?: any): Promise<PaginatedResponse<User>> => {
    const response = await apiClient.get<PaginatedResponse<User>>(ApiEndpoints.adminUsersSearch, { params });
    return response.data;
  },
  getUserDetails: async (userId: UUID): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>(ApiEndpoints.adminUser(userId));
    return response.data;
  },
  updateUserStatus: async (userId: UUID, data: { status: UserStatus; reason?: string }): Promise<ApiResponse<User>> => {
    const response = await apiClient.put<ApiResponse<User>>(ApiEndpoints.adminUserStatus(userId), data);
    return response.data;
  },
  resetUserPassword: async (userId: UUID): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      ApiEndpoints.adminUserResetPassword(userId)
    );
    return response.data;
  },
  deleteUser: async (userId: UUID): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(ApiEndpoints.adminUser(userId));
    return response.data;
  },
  updateUser: async (userId: UUID, data: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.put<ApiResponse<any>>(ApiEndpoints.adminUser(userId), data);
    return response.data;
  },

  // ==========================================================================
  // ADMIN USER MANAGEMENT
  // ==========================================================================
  getAdminUsers: async (params?: any): Promise<PaginatedResponse<AdminUser>> => {
    const response = await apiClient.get<PaginatedResponse<AdminUser>>(ApiEndpoints.adminAdmins, { params });
    return response.data;
  },
  createAdminUser: async (data: any): Promise<ApiResponse<AdminUser>> => {
    const response = await apiClient.post<ApiResponse<AdminUser>>(ApiEndpoints.adminAdmins, data);
    return response.data;
  },
  updateAdminUser: async (adminId: UUID, data: any): Promise<ApiResponse<AdminUser>> => {
    const response = await apiClient.put<ApiResponse<AdminUser>>(ApiEndpoints.adminAdminUser(adminId), data);
    return response.data;
  },
  deactivateAdminUser: async (adminId: UUID): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(ApiEndpoints.adminAdminUser(adminId));
    return response.data;
  },

  // ==========================================================================
  // SYSTEM SETTINGS
  // ==========================================================================
  getSystemSettings: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>(ApiEndpoints.adminSettings);
    return response.data;
  },
  updateSystemSetting: async (key: string, value: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.put<ApiResponse<any>>(ApiEndpoints.adminSetting(key), { value });
    return response.data;
  },

  // ==========================================================================
  // AUDIT LOGS & TASKS
  // ==========================================================================
  getAuditLogs: async (params?: any): Promise<PaginatedResponse<AuditLog>> => {
    const response = await apiClient.get<PaginatedResponse<AuditLog>>(ApiEndpoints.adminAuditLogs, { params });
    return response.data;
  },
  getOperationalTasks: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>(ApiEndpoints.adminTasks);
    return response.data;
  },
  createOperationalTask: async (data: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.post<ApiResponse<any>>(ApiEndpoints.adminTasks, data);
    return response.data;
  },
  updateOperationalTask: async (taskId: UUID, data: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.put<ApiResponse<any>>(ApiEndpoints.adminTask(taskId), data);
    return response.data;
  },

  // ==========================================================================
  // OPERATIONS - WALLET
  // ==========================================================================
  creditUserWallet: async (data: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.post<ApiResponse<any>>(ApiEndpoints.adminOpsCredit, data);
    return response.data;
  },
  debitUserWallet: async (data: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.post<ApiResponse<any>>(ApiEndpoints.adminOpsDebit, data);
    return response.data;
  },
  adminTransfer: async (data: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.post<ApiResponse<any>>(ApiEndpoints.adminOpsTransfer, data);
    return response.data;
  },
  bulkCredit: async (data: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.post<ApiResponse<any>>(ApiEndpoints.adminOpsBulkCredit, data);
    return response.data;
  },

  // ==========================================================================
  // OPERATIONS - LOANS
  // ==========================================================================
  approveLoan: async (loanId: UUID, data: any): Promise<ApiResponse<Loan>> => {
    const response = await apiClient.post<ApiResponse<Loan>>(ApiEndpoints.adminOpsLoanApprove(loanId), data);
    return response.data;
  },
  rejectLoan: async (loanId: UUID, reason: string): Promise<ApiResponse<Loan>> => {
    const response = await apiClient.post<ApiResponse<Loan>>(ApiEndpoints.adminOpsLoanReject(loanId), { reason });
    return response.data;
  },
  disburseLoan: async (loanId: UUID): Promise<ApiResponse<Loan>> => {
    const response = await apiClient.post<ApiResponse<Loan>>(ApiEndpoints.adminOpsLoanDisburse(loanId));
    return response.data;
  },

  // ==========================================================================
  // OPERATIONS - CARDS & INVESTMENTS
  // ==========================================================================
  approveCard: async (cardId: UUID): Promise<ApiResponse<any>> => {
    const response = await apiClient.post<ApiResponse<any>>(ApiEndpoints.adminOpsCardApprove(cardId));
    return response.data;
  },
  rejectCard: async (cardId: UUID, reason: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.post<ApiResponse<any>>(ApiEndpoints.adminOpsCardReject(cardId), { reason });
    return response.data;
  },
  approveInvestment: async (investmentId: UUID): Promise<ApiResponse<any>> => {
    const response = await apiClient.post<ApiResponse<any>>(ApiEndpoints.adminOpsInvestmentApprove(investmentId));
    return response.data;
  },
  addInvestmentReturns: async (investmentId: UUID, data: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.post<ApiResponse<any>>(
      ApiEndpoints.adminOpsInvestmentAddReturns(investmentId),
      data,
    );
    return response.data;
  },

  // ==========================================================================
  // OPERATIONS - TRANSACTIONS
  // ==========================================================================
  getPendingTransactions: async (params?: any): Promise<PaginatedResponse<Transaction>> => {
    const response = await apiClient.get<PaginatedResponse<Transaction>>(ApiEndpoints.adminOpsTransactionsPending, {
      params,
    });
    return response.data;
  },
  approveTransaction: async (transactionId: UUID, note?: string): Promise<ApiResponse<Transaction>> => {
    const response = await apiClient.post<ApiResponse<Transaction>>(
      ApiEndpoints.adminOpsTransactionApprove(transactionId),
      { note },
    );
    return response.data;
  },
  rejectTransaction: async (transactionId: UUID, reason: string): Promise<ApiResponse<Transaction>> => {
    const response = await apiClient.post<ApiResponse<Transaction>>(
      ApiEndpoints.adminOpsTransactionReject(transactionId),
      { reason },
    );
    return response.data;
  },
  reverseTransaction: async (transactionId: UUID, reason: string): Promise<ApiResponse<Transaction>> => {
    const response = await apiClient.post<ApiResponse<Transaction>>(
      ApiEndpoints.adminOpsTransactionReverse(transactionId),
      { reason },
    );
    return response.data;
  },
};

export default AdminRepository;
