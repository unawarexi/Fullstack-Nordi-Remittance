import { ApiEndpoints } from "../../core/api/endpoint";
// ============================================================================
// FRAUD API - Fraud monitoring and alerts endpoints
// ============================================================================

import apiClient, { ApiResponse, PaginatedResponse } from "@core/api/client";

// ============================================================================
// FRAUD API FUNCTIONS
// ============================================================================

export const FraudRepository = {
  // USER: Behavior Profile
  getBehaviorProfile: async (): Promise<ApiResponse<BehaviorProfile>> => {
    const response = await apiClient.get<ApiResponse<BehaviorProfile>>(ApiEndpoints.fraudBehaviorProfile);
    return response.data;
  },

  // ADMIN: Fraud Signals
  getSignals: async (): Promise<PaginatedResponse<FraudSignal>> => {
    const response = await apiClient.get<PaginatedResponse<FraudSignal>>(ApiEndpoints.fraudSignals);
    return response.data;
  },
  getSignalById: async (signalId: UUID): Promise<ApiResponse<FraudSignal>> => {
    const response = await apiClient.get<ApiResponse<FraudSignal>>(ApiEndpoints.fraudSignal(signalId));
    return response.data;
  },
  updateSignal: async (signalId: UUID, data: Partial<FraudSignal>): Promise<ApiResponse<FraudSignal>> => {
    const response = await apiClient.put<ApiResponse<FraudSignal>>(ApiEndpoints.fraudSignal(signalId), data);
    return response.data;
  },

  // ADMIN: Fraud Cases
  getCases: async (): Promise<PaginatedResponse<FraudCase>> => {
    const response = await apiClient.get<PaginatedResponse<FraudCase>>(ApiEndpoints.fraudCases);
    return response.data;
  },
  createCase: async (data: Partial<FraudCase>): Promise<ApiResponse<FraudCase>> => {
    const response = await apiClient.post<ApiResponse<FraudCase>>(ApiEndpoints.fraudCases, data);
    return response.data;
  },
  getCaseById: async (caseId: UUID): Promise<ApiResponse<FraudCase>> => {
    const response = await apiClient.get<ApiResponse<FraudCase>>(ApiEndpoints.fraudCase(caseId));
    return response.data;
  },
  updateCase: async (caseId: UUID, data: Partial<FraudCase>): Promise<ApiResponse<FraudCase>> => {
    const response = await apiClient.put<ApiResponse<FraudCase>>(ApiEndpoints.fraudCase(caseId), data);
    return response.data;
  },
  addCaseComment: async (
    caseId: UUID,
    comment: { author: string; content: string },
  ): Promise<ApiResponse<FraudCase>> => {
    const response = await apiClient.post<ApiResponse<FraudCase>>(ApiEndpoints.fraudCaseComments(caseId), comment);
    return response.data;
  },

  // ADMIN: Velocity Rules
  getVelocityRules: async (): Promise<PaginatedResponse<VelocityRule>> => {
    const response = await apiClient.get<PaginatedResponse<VelocityRule>>(ApiEndpoints.fraudVelocityRules);
    return response.data;
  },
  createVelocityRule: async (data: Partial<VelocityRule>): Promise<ApiResponse<VelocityRule>> => {
    const response = await apiClient.post<ApiResponse<VelocityRule>>(ApiEndpoints.fraudVelocityRules, data);
    return response.data;
  },
  updateVelocityRule: async (ruleId: UUID, data: Partial<VelocityRule>): Promise<ApiResponse<VelocityRule>> => {
    const response = await apiClient.put<ApiResponse<VelocityRule>>(ApiEndpoints.fraudVelocityRule(ruleId), data);
    return response.data;
  },
  deleteVelocityRule: async (ruleId: UUID): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(ApiEndpoints.fraudVelocityRule(ruleId));
    return response.data;
  },

  // ADMIN: Behavior Profiles
  getAdminBehaviorProfile: async (userId: UUID): Promise<ApiResponse<BehaviorProfile>> => {
    const response = await apiClient.get<ApiResponse<BehaviorProfile>>(
      ApiEndpoints.fraudUserBehaviorProfile(userId),
    );
    return response.data;
  },
  updateAdminBehaviorProfile: async (
    userId: UUID,
    data: Partial<BehaviorProfile>,
  ): Promise<ApiResponse<BehaviorProfile>> => {
    const response = await apiClient.put<ApiResponse<BehaviorProfile>>(
      ApiEndpoints.fraudUserBehaviorProfile(userId),
      data,
    );
    return response.data;
  },

  // ADMIN/SYSTEM: Security Events
  getSecurityEvents: async (): Promise<PaginatedResponse<SecurityEvent>> => {
    const response = await apiClient.get<PaginatedResponse<SecurityEvent>>(ApiEndpoints.fraudSecurityEvents);
    return response.data;
  },
  logSecurityEvent: async (data: Partial<SecurityEvent>): Promise<ApiResponse<SecurityEvent>> => {
    const response = await apiClient.post<ApiResponse<SecurityEvent>>(ApiEndpoints.fraudSecurityEvents, data);
    return response.data;
  },

  // ADMIN: Analytics
  getAnalytics: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>(ApiEndpoints.fraudAnalytics);
    return response.data;
  },
};

export default FraudRepository;
