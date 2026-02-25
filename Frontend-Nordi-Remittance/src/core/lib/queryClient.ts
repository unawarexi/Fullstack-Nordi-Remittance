// ============================================================================
// QUERY CLIENT - TanStack Query configuration
// ============================================================================

import { QueryClient } from '@tanstack/react-query';
import axios from 'axios';

// ============================================================================
// RETRY FILTER — Never retry 401/403 (auth errors handled by interceptor)
// ============================================================================

const shouldRetry = (failureCount: number, error: unknown): boolean => {
  // Don't retry auth errors — the interceptor handles token refresh / logout
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status === 401 || status === 403) return false;
    // Don't retry client errors (4xx) except rate-limit (429)
    if (status && status >= 400 && status < 500 && status !== 429) return false;
  }
  return failureCount < 3;
};

// ============================================================================
// DEFAULT OPTIONS
// ============================================================================

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is considered fresh for 5 minutes
      staleTime: 5 * 60 * 1000,
      
      // Cache data for 30 minutes
      gcTime: 30 * 60 * 1000,
      
      // Smart retry: skip auth errors, retry server errors up to 3x
      retry: shouldRetry,
      
      // Retry delay with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Don't refetch on window focus for better UX
      refetchOnWindowFocus: false,
      
      // Refetch on reconnect
      refetchOnReconnect: true,
    },
    mutations: {
      // Smart retry for mutations too
      retry: (failureCount, error) => shouldRetry(failureCount, error),
      
      // Retry delay
      retryDelay: 1000,
    },
  },
});

// ============================================================================
// QUERY KEYS FACTORY
// ============================================================================

export const queryKeys = {
  // Auth
  auth: {
    all: ['auth'] as const,
    currentUser: () => [...queryKeys.auth.all, 'currentUser'] as const,
    me: () => [...queryKeys.auth.all, 'me'] as const,
  },

  // Users
  users: {
    all: ['users'] as const,
    profile: () => [...queryKeys.users.all, 'profile'] as const,
    detail: (id: string) => [...queryKeys.users.all, 'detail', id] as const,
    addresses: () => [...queryKeys.users.all, 'addresses'] as const,
    address: () => [...queryKeys.users.all, 'address'] as const,
    employment: () => [...queryKeys.users.all, 'employment'] as const,
    bankAccounts: () => [...queryKeys.users.all, 'bankAccounts'] as const,
    notificationPreferences: () => [...queryKeys.users.all, 'notificationPreferences'] as const,
    referrals: () => [...queryKeys.users.all, 'referrals'] as const,
  },

  // Accounts
  accounts: {
    all: ['accounts'] as const,
    summary: () => [...queryKeys.accounts.all, 'summary'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.accounts.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.accounts.all, 'detail', id] as const,
    balance: (id: string) => [...queryKeys.accounts.all, 'balance', id] as const,
    transactions: (id: string, filters?: Record<string, unknown>) => 
      [...queryKeys.accounts.all, 'transactions', id, filters] as const,
    limits: (id: string) => [...queryKeys.accounts.all, 'limits', id] as const,
    currencies: () => [...queryKeys.accounts.all, 'currencies'] as const,
    exchangeRates: (base?: string) => [...queryKeys.accounts.all, 'exchangeRates', base] as const,
  },

  // Transactions
  transactions: {
    all: ['transactions'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.transactions.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.transactions.all, 'detail', id] as const,
    byReference: (ref: string) => [...queryKeys.transactions.all, 'reference', ref] as const,
    recent: (limit?: number) => [...queryKeys.transactions.all, 'recent', limit] as const,
    depositMethods: (currency?: string) => [...queryKeys.transactions.all, 'depositMethods', currency] as const,
    remittanceCountries: () => [...queryKeys.transactions.all, 'remittanceCountries'] as const,
  },

  // Recipients
  recipients: {
    all: ['recipients'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.recipients.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.recipients.all, 'detail', id] as const,
    favorites: () => [...queryKeys.recipients.all, 'favorites'] as const,
    recent: (limit?: number) => [...queryKeys.recipients.all, 'recent', limit] as const,
  },

  // Cards
  cards: {
    all: ['cards'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.cards.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.cards.all, 'detail', id] as const,
    limits: (id: string) => [...queryKeys.cards.all, 'limits', id] as const,
    settings: (id: string) => [...queryKeys.cards.all, 'settings', id] as const,
    transactions: (id: string, filters?: Record<string, unknown>) => 
      [...queryKeys.cards.all, 'transactions', id, filters] as const,
  },

  // Loans
  loans: {
    all: ['loans'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.loans.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.loans.all, 'detail', id] as const,
    active: () => [...queryKeys.loans.all, 'active'] as const,
    summary: () => [...queryKeys.loans.all, 'summary'] as const,
    products: () => [...queryKeys.loans.all, 'products'] as const,
    payments: (id: string, filters?: Record<string, unknown>) => 
      [...queryKeys.loans.all, 'payments', id, filters] as const,
    schedule: (id: string) => [...queryKeys.loans.all, 'schedule', id] as const,
    documents: (id: string) => [...queryKeys.loans.all, 'documents', id] as const,
  },

  // Investments
  investments: {
    all: ['investments'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.investments.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.investments.all, 'detail', id] as const,
    active: () => [...queryKeys.investments.all, 'active'] as const,
    summary: () => [...queryKeys.investments.all, 'summary'] as const,
    products: (type?: string) => [...queryKeys.investments.all, 'products', type] as const,
    transactions: (id: string, filters?: Record<string, unknown>) => 
      [...queryKeys.investments.all, 'transactions', id, filters] as const,
    savingsGoals: () => [...queryKeys.investments.all, 'savingsGoals'] as const,
  },

  // Notifications
  notifications: {
    all: ['notifications'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.notifications.all, 'list', filters] as const,
    unread: (limit?: number) => [...queryKeys.notifications.all, 'unread', limit] as const,
    unreadCount: () => [...queryKeys.notifications.all, 'unreadCount'] as const,
    preferences: () => [...queryKeys.notifications.all, 'preferences'] as const,
  },

  // Security
  security: {
    all: ['security'] as const,
    settings: () => [...queryKeys.security.all, 'settings'] as const,
    sessions: () => [...queryKeys.security.all, 'sessions'] as const,
    currentSession: () => [...queryKeys.security.all, 'currentSession'] as const,
    trustedDevices: () => [...queryKeys.security.all, 'trustedDevices'] as const,
    activityLog: (filters?: Record<string, unknown>) => 
      [...queryKeys.security.all, 'activityLog', filters] as const,
  },

  // KYC
  kyc: {
    all: ['kyc'] as const,
    status: () => [...queryKeys.kyc.all, 'status'] as const,
    requirements: (level?: string) => [...queryKeys.kyc.all, 'requirements', level] as const,
    documents: () => [...queryKeys.kyc.all, 'documents'] as const,
    personalInfo: () => [...queryKeys.kyc.all, 'personalInfo'] as const,
    address: () => [...queryKeys.kyc.all, 'address'] as const,
    employment: () => [...queryKeys.kyc.all, 'employment'] as const,
  },

  // Fraud
  fraud: {
    all: ['fraud'] as const,
    alerts: (filters?: Record<string, unknown>) => [...queryKeys.fraud.all, 'alerts', filters] as const,
    alertDetail: (id: string) => [...queryKeys.fraud.all, 'alert', id] as const,
    unresolvedCount: () => [...queryKeys.fraud.all, 'unresolvedCount'] as const,
    reports: (filters?: Record<string, unknown>) => [...queryKeys.fraud.all, 'reports', filters] as const,
  },

  // Legal
  legal: {
    all: ['legal'] as const,
    disputes: (filters?: Record<string, unknown>) => [...queryKeys.legal.all, 'disputes', filters] as const,
    disputeDetail: (id: string) => [...queryKeys.legal.all, 'dispute', id] as const,
    reports: (filters?: Record<string, unknown>) => [...queryKeys.legal.all, 'reports', filters] as const,
    terms: () => [...queryKeys.legal.all, 'terms'] as const,
    privacy: () => [...queryKeys.legal.all, 'privacy'] as const,
    consent: () => [...queryKeys.legal.all, 'consent'] as const,
  },

  // Statistics
  statistics: {
    all: ['statistics'] as const,
    dashboard: () => [...queryKeys.statistics.all, 'dashboard'] as const,
    transactions: (filters?: Record<string, unknown>) => 
      [...queryKeys.statistics.all, 'transactions', filters] as const,
    volumeChart: (filters?: Record<string, unknown>) => 
      [...queryKeys.statistics.all, 'volumeChart', filters] as const,
    spendingByCategory: (filters?: Record<string, unknown>) => 
      [...queryKeys.statistics.all, 'spendingByCategory', filters] as const,
    balanceHistory: (filters?: Record<string, unknown>) => 
      [...queryKeys.statistics.all, 'balanceHistory', filters] as const,
    balanceDistribution: () => [...queryKeys.statistics.all, 'balanceDistribution'] as const,
    remittance: (filters?: Record<string, unknown>) => 
      [...queryKeys.statistics.all, 'remittance', filters] as const,
    investmentPerformance: (filters?: Record<string, unknown>) => 
      [...queryKeys.statistics.all, 'investmentPerformance', filters] as const,
    insights: () => [...queryKeys.statistics.all, 'insights'] as const,
  },

  // Attachments
  attachments: {
    all: ['attachments'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.attachments.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.attachments.all, 'detail', id] as const,
    storage: () => [...queryKeys.attachments.all, 'storage'] as const,
  },

  // Integrations
  integrations: {
    all: ['integrations'] as const,
    webhooks: () => [...queryKeys.integrations.all, 'webhooks'] as const,
    webhookDetail: (id: string) => [...queryKeys.integrations.all, 'webhook', id] as const,
    webhookEvents: () => [...queryKeys.integrations.all, 'webhookEvents'] as const,
    apiKeys: () => [...queryKeys.integrations.all, 'apiKeys'] as const,
    apiKeyDetail: (id: string) => [...queryKeys.integrations.all, 'apiKey', id] as const,
    apiPermissions: () => [...queryKeys.integrations.all, 'apiPermissions'] as const,
    connected: () => [...queryKeys.integrations.all, 'connected'] as const,
  },

  // Admin
  admin: {
    all: ['admin'] as const,
    dashboard: () => [...queryKeys.admin.all, 'dashboard'] as const,
    realtime: () => [...queryKeys.admin.all, 'realtime'] as const,
    users: (filters?: Record<string, unknown>) => [...queryKeys.admin.all, 'users', filters] as const,
    userDetail: (id: string) => [...queryKeys.admin.all, 'user', id] as const,
    admins: (filters?: Record<string, unknown>) => [...queryKeys.admin.all, 'admins', filters] as const,
    transactions: (filters?: Record<string, unknown>) => 
      [...queryKeys.admin.all, 'transactions', filters] as const,
    loans: (filters?: Record<string, unknown>) => [...queryKeys.admin.all, 'loans', filters] as const,
    pendingKyc: (filters?: Record<string, unknown>) => 
      [...queryKeys.admin.all, 'pendingKyc', filters] as const,
    fraudAlerts: (filters?: Record<string, unknown>) => 
      [...queryKeys.admin.all, 'fraudAlerts', filters] as const,
    auditLogs: (filters?: Record<string, unknown>) => 
      [...queryKeys.admin.all, 'auditLogs', filters] as const,
    settings: () => [...queryKeys.admin.all, 'settings'] as const,
  },
} as const;

export default queryClient;
