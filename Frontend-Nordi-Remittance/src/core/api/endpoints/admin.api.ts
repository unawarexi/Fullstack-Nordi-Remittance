// ============================================================================
// ADMIN API - Admin-specific endpoints for dashboard and management
// ============================================================================

import apiClient, { ApiResponse, PaginatedResponse } from "../client";
const ADMIN_BASE = "/admin";
const OPS_BASE = "/admin/operations";

// ============================================================================
// ADMIN API FUNCTIONS
// ============================================================================

export const adminApi = {
  // ==========================================================================
  // AUTH
  // ==========================================================================
  login: async (data: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.post<ApiResponse<any>>(
      `${ADMIN_BASE}/login`,
      data,
    );
    return response.data;
  },
  logout: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.post<ApiResponse<any>>(
      `${ADMIN_BASE}/logout`,
    );
    return response.data;
  },

  // ==========================================================================
  // DASHBOARD & ANALYTICS
  // ==========================================================================
  getDashboardStats: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>(
      `${ADMIN_BASE}/dashboard`,
    );
    return response.data;
  },
  getAnalytics: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>(
      `${ADMIN_BASE}/analytics`,
    );
    return response.data;
  },

  // ==========================================================================
  // USER MANAGEMENT
  // ==========================================================================
  searchUsers: async (params?: any): Promise<PaginatedResponse<User>> => {
    const response = await apiClient.get<PaginatedResponse<User>>(
      `${ADMIN_BASE}/users/search`,
      { params },
    );
    return response.data;
  },
  getUserDetails: async (userId: UUID): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>(
      `${ADMIN_BASE}/users/${userId}`,
    );
    return response.data;
  },
  updateUserStatus: async (
    userId: UUID,
    data: { status: UserStatus; reason?: string },
  ): Promise<ApiResponse<User>> => {
    const response = await apiClient.put<ApiResponse<User>>(
      `${ADMIN_BASE}/users/${userId}/status`,
      data,
    );
    return response.data;
  },
  resetUserPassword: async (
    userId: UUID,
  ): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      `${ADMIN_BASE}/users/${userId}/reset-password`,
    );
    return response.data;
  },

  // ==========================================================================
  // ADMIN USER MANAGEMENT
  // ==========================================================================
  getAdminUsers: async (
    params?: any,
  ): Promise<PaginatedResponse<AdminUser>> => {
    const response = await apiClient.get<PaginatedResponse<AdminUser>>(
      `${ADMIN_BASE}/admins`,
      { params },
    );
    return response.data;
  },
  createAdminUser: async (data: any): Promise<ApiResponse<AdminUser>> => {
    const response = await apiClient.post<ApiResponse<AdminUser>>(
      `${ADMIN_BASE}/admins`,
      data,
    );
    return response.data;
  },
  updateAdminUser: async (
    adminId: UUID,
    data: any,
  ): Promise<ApiResponse<AdminUser>> => {
    const response = await apiClient.put<ApiResponse<AdminUser>>(
      `${ADMIN_BASE}/admins/${adminId}`,
      data,
    );
    return response.data;
  },
  deactivateAdminUser: async (
    adminId: UUID,
  ): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(
      `${ADMIN_BASE}/admins/${adminId}`,
    );
    return response.data;
  },

  // ==========================================================================
  // SYSTEM SETTINGS
  // ==========================================================================
  getSystemSettings: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>(
      `${ADMIN_BASE}/settings`,
    );
    return response.data;
  },
  updateSystemSetting: async (
    key: string,
    value: any,
  ): Promise<ApiResponse<any>> => {
    const response = await apiClient.put<ApiResponse<any>>(
      `${ADMIN_BASE}/settings/${key}`,
      { value },
    );
    return response.data;
  },

  // ==========================================================================
  // AUDIT LOGS & TASKS
  // ==========================================================================
  getAuditLogs: async (params?: any): Promise<PaginatedResponse<AuditLog>> => {
    const response = await apiClient.get<PaginatedResponse<AuditLog>>(
      `${ADMIN_BASE}/audit-logs`,
      { params },
    );
    return response.data;
  },
  getOperationalTasks: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>(
      `${ADMIN_BASE}/tasks`,
    );
    return response.data;
  },
  createOperationalTask: async (data: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.post<ApiResponse<any>>(
      `${ADMIN_BASE}/tasks`,
      data,
    );
    return response.data;
  },
  updateOperationalTask: async (
    taskId: UUID,
    data: any,
  ): Promise<ApiResponse<any>> => {
    const response = await apiClient.put<ApiResponse<any>>(
      `${ADMIN_BASE}/tasks/${taskId}`,
      data,
    );
    return response.data;
  },

  // ==========================================================================
  // OPERATIONS - WALLET
  // ==========================================================================
  creditUserWallet: async (data: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.post<ApiResponse<any>>(
      `${OPS_BASE}/credit`,
      data,
    );
    return response.data;
  },
  debitUserWallet: async (data: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.post<ApiResponse<any>>(
      `${OPS_BASE}/debit`,
      data,
    );
    return response.data;
  },
  adminTransfer: async (data: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.post<ApiResponse<any>>(
      `${OPS_BASE}/transfer`,
      data,
    );
    return response.data;
  },
  bulkCredit: async (data: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.post<ApiResponse<any>>(
      `${OPS_BASE}/bulk/credit`,
      data,
    );
    return response.data;
  },

  // ==========================================================================
  // OPERATIONS - LOANS
  // ==========================================================================
  approveLoan: async (loanId: UUID, data: any): Promise<ApiResponse<Loan>> => {
    const response = await apiClient.post<ApiResponse<Loan>>(
      `${OPS_BASE}/loans/${loanId}/approve`,
      data,
    );
    return response.data;
  },
  rejectLoan: async (
    loanId: UUID,
    reason: string,
  ): Promise<ApiResponse<Loan>> => {
    const response = await apiClient.post<ApiResponse<Loan>>(
      `${OPS_BASE}/loans/${loanId}/reject`,
      { reason },
    );
    return response.data;
  },
  disburseLoan: async (loanId: UUID): Promise<ApiResponse<Loan>> => {
    const response = await apiClient.post<ApiResponse<Loan>>(
      `${OPS_BASE}/loans/${loanId}/disburse`,
    );
    return response.data;
  },

  // ==========================================================================
  // OPERATIONS - CARDS & INVESTMENTS
  // ==========================================================================
  approveCard: async (cardId: UUID): Promise<ApiResponse<any>> => {
    const response = await apiClient.post<ApiResponse<any>>(
      `${OPS_BASE}/cards/${cardId}/approve`,
    );
    return response.data;
  },
  rejectCard: async (
    cardId: UUID,
    reason: string,
  ): Promise<ApiResponse<any>> => {
    const response = await apiClient.post<ApiResponse<any>>(
      `${OPS_BASE}/cards/${cardId}/reject`,
      { reason },
    );
    return response.data;
  },
  approveInvestment: async (investmentId: UUID): Promise<ApiResponse<any>> => {
    const response = await apiClient.post<ApiResponse<any>>(
      `${OPS_BASE}/investments/${investmentId}/approve`,
    );
    return response.data;
  },
  addInvestmentReturns: async (
    investmentId: UUID,
    data: any,
  ): Promise<ApiResponse<any>> => {
    const response = await apiClient.post<ApiResponse<any>>(
      `${OPS_BASE}/investments/${investmentId}/add-returns`,
      data,
    );
    return response.data;
  },

  // ==========================================================================
  // OPERATIONS - TRANSACTIONS
  // ==========================================================================
  getPendingTransactions: async (
    params?: any,
  ): Promise<PaginatedResponse<Transaction>> => {
    const response = await apiClient.get<PaginatedResponse<Transaction>>(
      `${OPS_BASE}/transactions/pending`,
      { params },
    );
    return response.data;
  },
  approveTransaction: async (
    transactionId: UUID,
    note?: string,
  ): Promise<ApiResponse<Transaction>> => {
    const response = await apiClient.post<ApiResponse<Transaction>>(
      `${OPS_BASE}/transactions/${transactionId}/approve`,
      { note },
    );
    return response.data;
  },
  rejectTransaction: async (
    transactionId: UUID,
    reason: string,
  ): Promise<ApiResponse<Transaction>> => {
    const response = await apiClient.post<ApiResponse<Transaction>>(
      `${OPS_BASE}/transactions/${transactionId}/reject`,
      { reason },
    );
    return response.data;
  },
  reverseTransaction: async (
    transactionId: UUID,
    reason: string,
  ): Promise<ApiResponse<Transaction>> => {
    const response = await apiClient.post<ApiResponse<Transaction>>(
      `${OPS_BASE}/transactions/${transactionId}/reverse`,
      { reason },
    );
    return response.data;
  },
};

export default adminApi;
