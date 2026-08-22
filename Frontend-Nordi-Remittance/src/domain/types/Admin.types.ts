// ============================================================================
// ADMIN TYPES — Mirrors AdminModel.ts
// AdminUser, AdminPermission, AdminActionLog, SystemSetting,
// OperationalTask, SupportTicket, SupportMessage
// ============================================================================

declare global {
  interface AdminUser extends Omit<User, 'phone' | 'avatar' | 'permissions'> {
    permissions: string[];
    department?: string;
    lastActivity?: ISO8601Date;
    phone?: string;
    avatar?: string;
    adminRole: 'super_admin' | 'admin' | 'compliance_officer' | 'support_agent' | 'analyst';
    isActive: boolean;
    loginAttempts: number;
    isLocked: boolean;
    lockReason?: string;
    lockedAt?: ISO8601Date;
    twoFactorEnabled: boolean;
    twoFactorSecret?: string;
    twoFactorBackupCodes?: string[];
    passwordChangedAt?: ISO8601Date;
    mustChangePassword: boolean;
    passwordHistory?: string[];
    isSuperAdmin?: boolean;
    createdBy?: UUID;
    updatedBy?: UUID;
    activeSessions?: Array<{
      sessionId: string;
      deviceInfo: string;
      ipAddress: string;
      createdAt: ISO8601Date;
      lastActivity: ISO8601Date;
    }>;
    pendingOtp?: {
      code: string;
      purpose: string;
      expiresAt: ISO8601Date;
      attempts: number;
    };
  }

  interface AdminPermission {
    id: UUID;
    admin: UUID;
    permissionId: string;
    // User Management
    canViewUsers: boolean;
    canEditUsers: boolean;
    canSuspendUsers: boolean;
    canDeleteUsers: boolean;
    canVerifyKyc: boolean;
    // Transaction Management
    canViewTransactions: boolean;
    canReverseTransactions: boolean;
    canRefundTransactions: boolean;
    canAdjustBalances: boolean;
    // Financial Operations
    canManageLoans: boolean;
    canApproveLoans: boolean;
    canManageInvestments: boolean;
    canManageCards: boolean;
    // Fraud & Security
    canViewFraudCases: boolean;
    canManageFraudCases: boolean;
    canBlockAccounts: boolean;
    canAccessSecurityLogs: boolean;
    // System
    canManageSettings: boolean;
    canManageAdmins: boolean;
    canViewReports: boolean;
    canExportData: boolean;
    // Support
    canManageTickets: boolean;
    canViewCustomerData: boolean;
    createdAt: ISO8601Date;
    updatedAt: ISO8601Date;
  }

  interface AdminActionLog {
    logId: UUID;
    admin: UUID;
    action: string;
    resource: string;
    resourceId: string;
    changes?: Record<string, unknown>;
    ipAddress: string;
    userAgent: string;
    status: 'success' | 'failed';
    failureReason?: string;
    createdAt: ISO8601Date;
  }

  interface SystemSetting {
    key: string;
    value: unknown;
    category: 'general' | 'security' | 'payment' | 'compliance' | 'notification' | 'feature';
    description: string;
    isEditable: boolean;
    dataType: 'string' | 'number' | 'boolean' | 'json';
    updatedBy?: string;
    createdAt: ISO8601Date;
    updatedAt: ISO8601Date;
  }

  interface OperationalTask {
    taskId: UUID;
    title: string;
    description: string;
    taskType: 'kyc_review' | 'loan_approval' | 'transaction_review' | 'fraud_investigation' | 'customer_verification' | 'other';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    assignedTo?: string;
    relatedUser?: string;
    relatedTransaction?: UUID;
    relatedCase?: UUID;
    dueDate?: ISO8601Date;
    completedAt?: ISO8601Date;
    completedBy?: string;
    notes?: string;
    createdAt: ISO8601Date;
    updatedAt: ISO8601Date;
  }

  interface SupportTicket {
    ticketId: UUID;
    user: UUID;
    subject: string;
    category: 'account' | 'transaction' | 'card' | 'loan' | 'technical' | 'billing' | 'other';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'open' | 'pending' | 'in_progress' | 'resolved' | 'closed';
    assignedTo?: string;
    description: string;
    attachments?: string[];
    resolution?: string;
    createdAt: ISO8601Date;
    updatedAt: ISO8601Date;
    closedAt?: ISO8601Date;
  }

  interface SupportMessage {
    ticket: UUID;
    messageId: UUID;
    sender: string;
    senderType: 'user' | 'admin';
    message: string;
    attachments?: string[];
    isInternal: boolean;
    createdAt: ISO8601Date;
  }

  interface DashboardStats {
    totalUsers: number;
    activeUsers: number;
    totalTransactions: number;
    transactionVolume: number;
    totalAccounts: number;
    totalBalance: number;
    pendingKyc: number;
    activeLoans: number;
    fraudAlerts: number;
    growth: {
      users: number;
      transactions: number;
      volume: number;
    };
  }

  interface UserStats {
    totalUsers: number;
    newUsers: number;
    activeUsers: number;
    verifiedUsers: number;
    byCountry: Record<string, number>;
    byKycLevel: Record<KycLevel, number>;
  }
}

export {};
