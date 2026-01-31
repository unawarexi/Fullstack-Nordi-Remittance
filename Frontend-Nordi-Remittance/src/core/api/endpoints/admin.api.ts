// ============================================================================
// ADMIN API - Admin-specific endpoints for dashboard and management
// ============================================================================

import apiClient, { ApiResponse, PaginatedResponse } from '../client';
import type {
  User,
  AdminUser,
  DashboardStats,
  AuditLog,
  Account,
  Transaction,
  Loan,
  Card,
  FraudAlert,
  KycDocument,
  UserStatus,
  KycStatus,
  LoanStatus,
  UUID,
} from '../../../types/api.types';

const ADMIN_BASE = '/admin';

// ============================================================================
// REQUEST TYPES
// ============================================================================

export interface AdminUserFilters {
  status?: UserStatus;
  role?: string;
  kycStatus?: KycStatus;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface AdminTransactionFilters {
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

export interface AdminLoanFilters {
  status?: LoanStatus;
  type?: string;
  userId?: UUID;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  limit?: number;
}

// ============================================================================
// ADMIN API FUNCTIONS
// ============================================================================

export const adminApi = {
  // ==========================================================================
  // DASHBOARD
  // ==========================================================================

  /**
   * Get dashboard statistics
   */
  getDashboardStats: async (): Promise<ApiResponse<DashboardStats>> => {
    const response = await apiClient.get<ApiResponse<DashboardStats>>(
      `${ADMIN_BASE}/dashboard`
    );
    return response.data;
  },

  /**
   * Get real-time metrics
   */
  getRealTimeMetrics: async (): Promise<ApiResponse<{
    onlineUsers: number;
    activeTransactions: number;
    pendingWithdrawals: number;
    pendingKyc: number;
    systemHealth: {
      api: 'healthy' | 'degraded' | 'down';
      database: 'healthy' | 'degraded' | 'down';
      payment: 'healthy' | 'degraded' | 'down';
    };
    lastUpdated: string;
  }>> => {
    const response = await apiClient.get<ApiResponse<{
      onlineUsers: number;
      activeTransactions: number;
      pendingWithdrawals: number;
      pendingKyc: number;
      systemHealth: {
        api: 'healthy' | 'degraded' | 'down';
        database: 'healthy' | 'degraded' | 'down';
        payment: 'healthy' | 'degraded' | 'down';
      };
      lastUpdated: string;
    }>>(`${ADMIN_BASE}/dashboard/realtime`);
    return response.data;
  },

  // ==========================================================================
  // USER MANAGEMENT
  // ==========================================================================

  /**
   * Get all users
   */
  getUsers: async (params?: AdminUserFilters): Promise<PaginatedResponse<User>> => {
    const response = await apiClient.get<PaginatedResponse<User>>(
      `${ADMIN_BASE}/users`,
      { params }
    );
    return response.data;
  },

  /**
   * Get user by ID (detailed)
   */
  getUserById: async (userId: UUID): Promise<ApiResponse<User & {
    accounts: Account[];
    recentTransactions: Transaction[];
    kycDocuments: KycDocument[];
    loginHistory: Array<{
      timestamp: string;
      ip: string;
      location?: string;
      device: string;
      status: 'success' | 'failed';
    }>;
  }>> => {
    const response = await apiClient.get<ApiResponse<User & {
      accounts: Account[];
      recentTransactions: Transaction[];
      kycDocuments: KycDocument[];
      loginHistory: Array<{
        timestamp: string;
        ip: string;
        location?: string;
        device: string;
        status: 'success' | 'failed';
      }>;
    }>>(`${ADMIN_BASE}/users/${userId}`);
    return response.data;
  },

  /**
   * Update user status
   */
  updateUserStatus: async (
    userId: UUID,
    data: { status: UserStatus; reason?: string }
  ): Promise<ApiResponse<User>> => {
    const response = await apiClient.patch<ApiResponse<User>>(
      `${ADMIN_BASE}/users/${userId}/status`,
      data
    );
    return response.data;
  },

  /**
   * Update user KYC status
   */
  updateUserKycStatus: async (
    userId: UUID,
    data: { status: KycStatus; level?: string; reason?: string }
  ): Promise<ApiResponse<User>> => {
    const response = await apiClient.patch<ApiResponse<User>>(
      `${ADMIN_BASE}/users/${userId}/kyc-status`,
      data
    );
    return response.data;
  },

  /**
   * Reset user password
   */
  resetUserPassword: async (userId: UUID): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      `${ADMIN_BASE}/users/${userId}/reset-password`
    );
    return response.data;
  },

  /**
   * Force logout user
   */
  forceLogoutUser: async (userId: UUID): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      `${ADMIN_BASE}/users/${userId}/force-logout`
    );
    return response.data;
  },

  // ==========================================================================
  // ADMIN USERS
  // ==========================================================================

  /**
   * Get all admin users
   */
  getAdminUsers: async (params?: {
    role?: string;
    department?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<AdminUser>> => {
    const response = await apiClient.get<PaginatedResponse<AdminUser>>(
      `${ADMIN_BASE}/admins`,
      { params }
    );
    return response.data;
  },

  /**
   * Create admin user
   */
  createAdminUser: async (data: {
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    permissions: string[];
    department?: string;
  }): Promise<ApiResponse<AdminUser>> => {
    const response = await apiClient.post<ApiResponse<AdminUser>>(
      `${ADMIN_BASE}/admins`,
      data
    );
    return response.data;
  },

  /**
   * Update admin user
   */
  updateAdminUser: async (
    adminId: UUID,
    data: Partial<{
      role: string;
      permissions: string[];
      department: string;
      status: string;
    }>
  ): Promise<ApiResponse<AdminUser>> => {
    const response = await apiClient.patch<ApiResponse<AdminUser>>(
      `${ADMIN_BASE}/admins/${adminId}`,
      data
    );
    return response.data;
  },

  /**
   * Delete admin user
   */
  deleteAdminUser: async (adminId: UUID): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(
      `${ADMIN_BASE}/admins/${adminId}`
    );
    return response.data;
  },

  // ==========================================================================
  // TRANSACTION MANAGEMENT
  // ==========================================================================

  /**
   * Get all transactions (admin view)
   */
  getTransactions: async (params?: AdminTransactionFilters): Promise<PaginatedResponse<Transaction & {
    user: { id: UUID; email: string; firstName: string; lastName: string };
  }>> => {
    const response = await apiClient.get<PaginatedResponse<Transaction & {
      user: { id: UUID; email: string; firstName: string; lastName: string };
    }>>(`${ADMIN_BASE}/transactions`, { params });
    return response.data;
  },

  /**
   * Get transaction by ID (detailed)
   */
  getTransactionById: async (transactionId: UUID): Promise<ApiResponse<Transaction & {
    user: User;
    relatedTransactions?: Transaction[];
    auditLogs: AuditLog[];
  }>> => {
    const response = await apiClient.get<ApiResponse<Transaction & {
      user: User;
      relatedTransactions?: Transaction[];
      auditLogs: AuditLog[];
    }>>(`${ADMIN_BASE}/transactions/${transactionId}`);
    return response.data;
  },

  /**
   * Approve transaction
   */
  approveTransaction: async (
    transactionId: UUID,
    note?: string
  ): Promise<ApiResponse<Transaction>> => {
    const response = await apiClient.post<ApiResponse<Transaction>>(
      `${ADMIN_BASE}/transactions/${transactionId}/approve`,
      { note }
    );
    return response.data;
  },

  /**
   * Reject transaction
   */
  rejectTransaction: async (
    transactionId: UUID,
    reason: string
  ): Promise<ApiResponse<Transaction>> => {
    const response = await apiClient.post<ApiResponse<Transaction>>(
      `${ADMIN_BASE}/transactions/${transactionId}/reject`,
      { reason }
    );
    return response.data;
  },

  /**
   * Reverse transaction
   */
  reverseTransaction: async (
    transactionId: UUID,
    reason: string
  ): Promise<ApiResponse<Transaction>> => {
    const response = await apiClient.post<ApiResponse<Transaction>>(
      `${ADMIN_BASE}/transactions/${transactionId}/reverse`,
      { reason }
    );
    return response.data;
  },

  // ==========================================================================
  // LOAN MANAGEMENT
  // ==========================================================================

  /**
   * Get all loans (admin view)
   */
  getLoans: async (params?: AdminLoanFilters): Promise<PaginatedResponse<Loan & {
    user: { id: UUID; email: string; firstName: string; lastName: string };
  }>> => {
    const response = await apiClient.get<PaginatedResponse<Loan & {
      user: { id: UUID; email: string; firstName: string; lastName: string };
    }>>(`${ADMIN_BASE}/loans`, { params });
    return response.data;
  },

  /**
   * Get loan by ID (detailed)
   */
  getLoanById: async (loanId: UUID): Promise<ApiResponse<Loan & {
    user: User;
    payments: Array<{ date: string; amount: number; status: string }>;
    documents: Array<{ id: UUID; name: string; url: string }>;
  }>> => {
    const response = await apiClient.get<ApiResponse<Loan & {
      user: User;
      payments: Array<{ date: string; amount: number; status: string }>;
      documents: Array<{ id: UUID; name: string; url: string }>;
    }>>(`${ADMIN_BASE}/loans/${loanId}`);
    return response.data;
  },

  /**
   * Approve loan
   */
  approveLoan: async (
    loanId: UUID,
    data: {
      approvedAmount: number;
      interestRate: number;
      term: number;
      note?: string;
    }
  ): Promise<ApiResponse<Loan>> => {
    const response = await apiClient.post<ApiResponse<Loan>>(
      `${ADMIN_BASE}/loans/${loanId}/approve`,
      data
    );
    return response.data;
  },

  /**
   * Reject loan
   */
  rejectLoan: async (loanId: UUID, reason: string): Promise<ApiResponse<Loan>> => {
    const response = await apiClient.post<ApiResponse<Loan>>(
      `${ADMIN_BASE}/loans/${loanId}/reject`,
      { reason }
    );
    return response.data;
  },

  /**
   * Disburse loan
   */
  disburseLoan: async (loanId: UUID): Promise<ApiResponse<Loan>> => {
    const response = await apiClient.post<ApiResponse<Loan>>(
      `${ADMIN_BASE}/loans/${loanId}/disburse`
    );
    return response.data;
  },

  // ==========================================================================
  // KYC MANAGEMENT
  // ==========================================================================

  /**
   * Get pending KYC verifications
   */
  getPendingKyc: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<{
    user: { id: UUID; email: string; firstName: string; lastName: string };
    documents: KycDocument[];
    submittedAt: string;
    currentLevel: string;
    targetLevel: string;
  }>> => {
    const response = await apiClient.get<PaginatedResponse<{
      user: { id: UUID; email: string; firstName: string; lastName: string };
      documents: KycDocument[];
      submittedAt: string;
      currentLevel: string;
      targetLevel: string;
    }>>(`${ADMIN_BASE}/kyc/pending`, { params });
    return response.data;
  },

  /**
   * Approve KYC document
   */
  approveKycDocument: async (documentId: UUID): Promise<ApiResponse<KycDocument>> => {
    const response = await apiClient.post<ApiResponse<KycDocument>>(
      `${ADMIN_BASE}/kyc/documents/${documentId}/approve`
    );
    return response.data;
  },

  /**
   * Reject KYC document
   */
  rejectKycDocument: async (
    documentId: UUID,
    reason: string
  ): Promise<ApiResponse<KycDocument>> => {
    const response = await apiClient.post<ApiResponse<KycDocument>>(
      `${ADMIN_BASE}/kyc/documents/${documentId}/reject`,
      { reason }
    );
    return response.data;
  },

  // ==========================================================================
  // FRAUD MANAGEMENT
  // ==========================================================================

  /**
   * Get fraud alerts (admin view)
   */
  getFraudAlerts: async (params?: {
    severity?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<FraudAlert & {
    user: { id: UUID; email: string; firstName: string; lastName: string };
  }>> => {
    const response = await apiClient.get<PaginatedResponse<FraudAlert & {
      user: { id: UUID; email: string; firstName: string; lastName: string };
    }>>(`${ADMIN_BASE}/fraud/alerts`, { params });
    return response.data;
  },

  /**
   * Resolve fraud alert
   */
  resolveFraudAlert: async (
    alertId: UUID,
    data: { resolution: string; action?: 'none' | 'warn' | 'suspend' | 'block' }
  ): Promise<ApiResponse<FraudAlert>> => {
    const response = await apiClient.post<ApiResponse<FraudAlert>>(
      `${ADMIN_BASE}/fraud/alerts/${alertId}/resolve`,
      data
    );
    return response.data;
  },

  // ==========================================================================
  // AUDIT LOGS
  // ==========================================================================

  /**
   * Get audit logs
   */
  getAuditLogs: async (params?: {
    userId?: UUID;
    action?: string;
    resource?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<AuditLog & {
    user?: { id: UUID; email: string; firstName: string; lastName: string };
  }>> => {
    const response = await apiClient.get<PaginatedResponse<AuditLog & {
      user?: { id: UUID; email: string; firstName: string; lastName: string };
    }>>(`${ADMIN_BASE}/audit-logs`, { params });
    return response.data;
  },

  // ==========================================================================
  // SYSTEM SETTINGS
  // ==========================================================================

  /**
   * Get system settings
   */
  getSystemSettings: async (): Promise<ApiResponse<{
    maintenance: boolean;
    maintenanceMessage?: string;
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
  }>> => {
    const response = await apiClient.get<ApiResponse<{
      maintenance: boolean;
      maintenanceMessage?: string;
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
    }>>(`${ADMIN_BASE}/settings`);
    return response.data;
  },

  /**
   * Update system settings
   */
  updateSystemSettings: async (data: Partial<{
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
  }>): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.patch<ApiResponse<{ message: string }>>(
      `${ADMIN_BASE}/settings`,
      data
    );
    return response.data;
  },
};

export default adminApi;
