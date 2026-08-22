// ============================================================================
// PERMISSIONS TYPES — Mirrors PermissionsModel.ts and admin.model.ts
// ============================================================================

declare global {
  // --------------------------------------------------------------------------
  // USER PERMISSIONS (managed by admin)
  // --------------------------------------------------------------------------
  interface UserPermissions {
    userId: UUID;
    // 1. User Account Status
    canActivate: boolean;
    canFreeze: boolean;
    canBlock: boolean;
    canLockOnSuspicious: boolean;
    maintenanceMode: boolean;
    notificationsEnabled: boolean;
    forcePasswordReset: boolean;
    allowAccountDeletion: boolean;
    // 2. Feature Access Toggles
    enableDomesticTransfers: boolean;
    enableInternationalTransfers: boolean;
    enableWalletToWallet: boolean;
    enableCardPayments: boolean;
    enableQrPayments: boolean;
    enableCryptoTransfers: boolean;
    enableScheduledTransfers: boolean;
    enableBillPayments: boolean;
    enableRequestMoney: boolean;
    enableChequeRequest: boolean;
    // 3. Fund / Withdraw Controls
    canFundWallet: boolean;
    canWithdraw: boolean;
    canAdjustBalance: boolean;
    canRevertTransaction: boolean;
    canSendRefund: boolean;
    canReprocessTransaction: boolean;
    // 4. KYC & Compliance
    kycVerified: boolean;
    canRequestKycReupload: boolean;
    enhancedDueDiligence: boolean;
    documentExpiryAlerts: boolean;
    faceIdVerification: boolean;
    // 5. Security & Access Controls
    enable2fa: boolean;
    transactionOtp: boolean;
    allowLoginNewDevices: boolean;
    locationBasedLogin: boolean;
    ipWhitelisting: boolean;
    allowApiAccess: boolean;
    adminNotesEnabled: boolean;
    // 6. User Role & Permissions
    userRole: 'Admin' | 'Support' | 'Business' | 'Personal';
    businessPrivileges: boolean;
    developerMode: boolean;
    staffDelegation: boolean;
    // 7. AI, Insights & Recommendations
    smartBudgeting: boolean;
    spendingAlerts: boolean;
    netWorthTracker: boolean;
    investmentRecommendations: boolean;
    cashFlowForecasting: boolean;
    // 8. Other Functional Toggles
    languageCustomization: boolean;
    accessibilityMode: boolean;
    darkModeDefault: boolean;
    customThemes: boolean;
    supportChat: boolean;
    promotionalEmails: boolean;
    feedbackSubmission: boolean;
    // 9. Account Type Permissions
    canOpenSavingsAccount?: boolean;
    canOpenCurrentAccount?: boolean;
    canOpenFixedDeposit?: boolean;
    canOpenBusinessAccount?: boolean;
    maxAccountsPerType?: number;
    createdAt?: ISO8601Date;
    updatedAt?: ISO8601Date;
  }

  // --------------------------------------------------------------------------
  // ADMIN PERMISSIONS (admin roles)
  // --------------------------------------------------------------------------
  interface AdminPermissions {
    admin: string;
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
    // System Configuration
    canManageSettings: boolean;
    canManageAdmins: boolean;
    canViewReports: boolean;
    canExportData: boolean;
    // Support
    canManageTickets: boolean;
    canViewCustomerData: boolean;
    createdAt?: ISO8601Date;
    updatedAt?: ISO8601Date;
  }

  // Legacy minimal permission/role interfaces
  interface Permission {
    id: UUID;
    name: string;
    description: string;
    resource: string;
    action: 'create' | 'read' | 'update' | 'delete' | 'manage';
  }

  interface Role extends Timestamps {
    id: UUID;
    name: string;
    description: string;
    permissions: Permission[];
    isSystem: boolean;
  }
}

export {};
