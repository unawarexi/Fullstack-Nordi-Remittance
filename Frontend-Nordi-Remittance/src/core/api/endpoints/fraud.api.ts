// ============================================================================
// FRAUD API - Fraud monitoring and alerts endpoints
// ============================================================================

import apiClient, { ApiResponse, PaginatedResponse } from '../client';
import type {
  FraudAlert,
  FraudAlertSeverity,
  FraudAlertStatus,
  UUID,
} from '../../../types/api.types';

const FRAUD_BASE = '/fraud';

// ============================================================================
// REQUEST TYPES
// ============================================================================

export interface FraudAlertFilters {
  severity?: FraudAlertSeverity;
  status?: FraudAlertStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// ============================================================================
// FRAUD API FUNCTIONS
// ============================================================================

export const fraudApi = {
  // ==========================================================================
  // ALERTS
  // ==========================================================================

  /**
   * Get all fraud alerts
   */
  getAlerts: async (params?: FraudAlertFilters): Promise<PaginatedResponse<FraudAlert>> => {
    const response = await apiClient.get<PaginatedResponse<FraudAlert>>(
      `${FRAUD_BASE}/alerts`,
      { params }
    );
    return response.data;
  },

  /**
   * Get alert by ID
   */
  getAlertById: async (alertId: UUID): Promise<ApiResponse<FraudAlert>> => {
    const response = await apiClient.get<ApiResponse<FraudAlert>>(
      `${FRAUD_BASE}/alerts/${alertId}`
    );
    return response.data;
  },

  /**
   * Get unresolved alerts count
   */
  getUnresolvedCount: async (): Promise<ApiResponse<{
    total: number;
    bySeverity: Record<FraudAlertSeverity, number>;
  }>> => {
    const response = await apiClient.get<ApiResponse<{
      total: number;
      bySeverity: Record<FraudAlertSeverity, number>;
    }>>(`${FRAUD_BASE}/alerts/unresolved/count`);
    return response.data;
  },

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert: async (alertId: UUID): Promise<ApiResponse<FraudAlert>> => {
    const response = await apiClient.patch<ApiResponse<FraudAlert>>(
      `${FRAUD_BASE}/alerts/${alertId}/acknowledge`
    );
    return response.data;
  },

  /**
   * Mark alert as false positive
   */
  markAsFalsePositive: async (
    alertId: UUID,
    reason: string
  ): Promise<ApiResponse<FraudAlert>> => {
    const response = await apiClient.patch<ApiResponse<FraudAlert>>(
      `${FRAUD_BASE}/alerts/${alertId}/false-positive`,
      { reason }
    );
    return response.data;
  },

  // ==========================================================================
  // REPORTING
  // ==========================================================================

  /**
   * Report suspicious activity
   */
  reportSuspiciousActivity: async (data: {
    type: 'unauthorized_access' | 'suspicious_transaction' | 'phishing' | 'other';
    description: string;
    transactionId?: UUID;
    attachments?: UUID[];
  }): Promise<ApiResponse<{
    reportId: UUID;
    message: string;
  }>> => {
    const response = await apiClient.post<ApiResponse<{
      reportId: UUID;
      message: string;
    }>>(`${FRAUD_BASE}/report`, data);
    return response.data;
  },

  /**
   * Get my fraud reports
   */
  getMyReports: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<{
    id: UUID;
    type: string;
    status: 'open' | 'investigating' | 'resolved';
    description: string;
    createdAt: string;
    resolvedAt?: string;
    resolution?: string;
  }>> => {
    const response = await apiClient.get<PaginatedResponse<{
      id: UUID;
      type: string;
      status: 'open' | 'investigating' | 'resolved';
      description: string;
      createdAt: string;
      resolvedAt?: string;
      resolution?: string;
    }>>(`${FRAUD_BASE}/reports`, { params });
    return response.data;
  },

  // ==========================================================================
  // ACCOUNT PROTECTION
  // ==========================================================================

  /**
   * Lock account (emergency)
   */
  lockAccount: async (reason: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      `${FRAUD_BASE}/lock-account`,
      { reason }
    );
    return response.data;
  },

  /**
   * Request account unlock
   */
  requestUnlock: async (data: {
    reason: string;
    verificationMethod: 'email' | 'phone' | 'document';
  }): Promise<ApiResponse<{
    requestId: UUID;
    message: string;
    nextSteps: string[];
  }>> => {
    const response = await apiClient.post<ApiResponse<{
      requestId: UUID;
      message: string;
      nextSteps: string[];
    }>>(`${FRAUD_BASE}/unlock-request`, data);
    return response.data;
  },

  /**
   * Block card (emergency)
   */
  blockCard: async (cardId: UUID, reason: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      `${FRAUD_BASE}/block-card`,
      { cardId, reason }
    );
    return response.data;
  },
};

export default fraudApi;
