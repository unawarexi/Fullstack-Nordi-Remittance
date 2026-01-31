// ============================================================================
// API EXPORTS - Central export file for all API modules
// ============================================================================

// Base client and utilities
export { default as apiClient, TokenManager, getErrorMessage } from './client';
export type { ApiResponse, PaginatedResponse, ApiError } from './client';

// API Endpoints
export { default as authApi, authApi as authService } from './endpoints/auth.api';
export { default as usersApi, usersApi as usersService } from './endpoints/users.api';
export { default as accountsApi } from './endpoints/accounts.api';
export { default as transactionsApi, recipientsApi } from './endpoints/transactions.api';
export { default as cardsApi } from './endpoints/cards.api';
export { default as loansApi } from './endpoints/loans.api';
export { default as investmentsApi } from './endpoints/investments.api';
export { default as notificationsApi } from './endpoints/notifications.api';
export { default as securityApi } from './endpoints/security.api';
export { default as kycApi } from './endpoints/kyc.api';
export { default as fraudApi } from './endpoints/fraud.api';
export { default as legalApi } from './endpoints/legal.api';
export { default as statisticsApi } from './endpoints/statistics.api';
export { default as attachmentsApi } from './endpoints/attachments.api';
export { default as integrationsApi } from './endpoints/integrations.api';
export { default as adminApi } from './endpoints/admin.api';

// Re-export types
export * from '../../types/api.types';
