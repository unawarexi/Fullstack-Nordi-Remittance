// ============================================================================
// FRAUD API - Fraud monitoring and alerts endpoints
// ============================================================================

import apiClient, { ApiResponse, PaginatedResponse } from "../client";

const FRAUD_BASE = "/fraud";
// ============================================================================
// FRAUD API FUNCTIONS
// ============================================================================

export const fraudApi = {
  // USER: Behavior Profile
  getBehaviorProfile: async (): Promise<ApiResponse<BehaviorProfile>> => {
    const response = await apiClient.get<ApiResponse<BehaviorProfile>>(
      `${FRAUD_BASE}/behavior-profile`,
    );
    return response.data;
  },

  // ADMIN: Fraud Signals
  getSignals: async (): Promise<PaginatedResponse<FraudSignal>> => {
    const response = await apiClient.get<PaginatedResponse<FraudSignal>>(
      `${FRAUD_BASE}/signals`,
    );
    return response.data;
  },
  getSignalById: async (signalId: UUID): Promise<ApiResponse<FraudSignal>> => {
    const response = await apiClient.get<ApiResponse<FraudSignal>>(
      `${FRAUD_BASE}/signals/${signalId}`,
    );
    return response.data;
  },
  updateSignal: async (
    signalId: UUID,
    data: Partial<FraudSignal>,
  ): Promise<ApiResponse<FraudSignal>> => {
    const response = await apiClient.put<ApiResponse<FraudSignal>>(
      `${FRAUD_BASE}/signals/${signalId}`,
      data,
    );
    return response.data;
  },

  // ADMIN: Fraud Cases
  getCases: async (): Promise<PaginatedResponse<FraudCase>> => {
    const response = await apiClient.get<PaginatedResponse<FraudCase>>(
      `${FRAUD_BASE}/cases`,
    );
    return response.data;
  },
  createCase: async (
    data: Partial<FraudCase>,
  ): Promise<ApiResponse<FraudCase>> => {
    const response = await apiClient.post<ApiResponse<FraudCase>>(
      `${FRAUD_BASE}/cases`,
      data,
    );
    return response.data;
  },
  getCaseById: async (caseId: UUID): Promise<ApiResponse<FraudCase>> => {
    const response = await apiClient.get<ApiResponse<FraudCase>>(
      `${FRAUD_BASE}/cases/${caseId}`,
    );
    return response.data;
  },
  updateCase: async (
    caseId: UUID,
    data: Partial<FraudCase>,
  ): Promise<ApiResponse<FraudCase>> => {
    const response = await apiClient.put<ApiResponse<FraudCase>>(
      `${FRAUD_BASE}/cases/${caseId}`,
      data,
    );
    return response.data;
  },
  addCaseComment: async (
    caseId: UUID,
    comment: { author: string; content: string },
  ): Promise<ApiResponse<FraudCase>> => {
    const response = await apiClient.post<ApiResponse<FraudCase>>(
      `${FRAUD_BASE}/cases/${caseId}/comments`,
      comment,
    );
    return response.data;
  },

  // ADMIN: Velocity Rules
  getVelocityRules: async (): Promise<PaginatedResponse<VelocityRule>> => {
    const response = await apiClient.get<PaginatedResponse<VelocityRule>>(
      `${FRAUD_BASE}/velocity-rules`,
    );
    return response.data;
  },
  createVelocityRule: async (
    data: Partial<VelocityRule>,
  ): Promise<ApiResponse<VelocityRule>> => {
    const response = await apiClient.post<ApiResponse<VelocityRule>>(
      `${FRAUD_BASE}/velocity-rules`,
      data,
    );
    return response.data;
  },
  updateVelocityRule: async (
    ruleId: UUID,
    data: Partial<VelocityRule>,
  ): Promise<ApiResponse<VelocityRule>> => {
    const response = await apiClient.put<ApiResponse<VelocityRule>>(
      `${FRAUD_BASE}/velocity-rules/${ruleId}`,
      data,
    );
    return response.data;
  },
  deleteVelocityRule: async (
    ruleId: UUID,
  ): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(
      `${FRAUD_BASE}/velocity-rules/${ruleId}`,
    );
    return response.data;
  },

  // ADMIN: Behavior Profiles
  getAdminBehaviorProfile: async (
    userId: UUID,
  ): Promise<ApiResponse<BehaviorProfile>> => {
    const response = await apiClient.get<ApiResponse<BehaviorProfile>>(
      `${FRAUD_BASE}/users/${userId}/behavior-profile`,
    );
    return response.data;
  },
  updateAdminBehaviorProfile: async (
    userId: UUID,
    data: Partial<BehaviorProfile>,
  ): Promise<ApiResponse<BehaviorProfile>> => {
    const response = await apiClient.put<ApiResponse<BehaviorProfile>>(
      `${FRAUD_BASE}/users/${userId}/behavior-profile`,
      data,
    );
    return response.data;
  },

  // ADMIN/SYSTEM: Security Events
  getSecurityEvents: async (): Promise<PaginatedResponse<SecurityEvent>> => {
    const response = await apiClient.get<PaginatedResponse<SecurityEvent>>(
      `${FRAUD_BASE}/security-events`,
    );
    return response.data;
  },
  logSecurityEvent: async (
    data: Partial<SecurityEvent>,
  ): Promise<ApiResponse<SecurityEvent>> => {
    const response = await apiClient.post<ApiResponse<SecurityEvent>>(
      `${FRAUD_BASE}/security-events`,
      data,
    );
    return response.data;
  },

  // ADMIN: Analytics
  getAnalytics: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>(
      `${FRAUD_BASE}/analytics`,
    );
    return response.data;
  },
};

export default fraudApi;
