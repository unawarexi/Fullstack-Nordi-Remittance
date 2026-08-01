import { ApiEndpoints } from "../../core/api/endpoint";
// ============================================================================
// INTEGRATIONS API - Webhooks and API key management endpoints
// ============================================================================

import apiClient, { ApiResponse, PaginatedResponse } from "@core/api/client";

// ============================================================================
// REQUEST TYPES
// ============================================================================

export interface CreateWebhookRequest {
  url: string;
  events: string[];
  description?: string;
}

export interface CreateApiKeyRequest {
  name: string;
  permissions: string[];
  expiresAt?: string;
}

// ============================================================================
// INTEGRATIONS API FUNCTIONS
// ============================================================================

export const IntegrationsRepository = {
  // ==========================================================================
  // WEBHOOKS
  // ==========================================================================

  /**
   * Get all webhooks
   */
  getWebhooks: async (): Promise<ApiResponse<Webhook[]>> => {
    const response = await apiClient.get<ApiResponse<Webhook[]>>(ApiEndpoints.integrationsWebhooks);
    return response.data;
  },

  /**
   * Get webhook by ID
   */
  getWebhookById: async (
    webhookId: UUID,
  ): Promise<
    ApiResponse<
      Webhook & {
        deliveryHistory: Array<{
          id: UUID;
          event: string;
          status: "success" | "failed";
          statusCode?: number;
          responseTime?: number;
          timestamp: string;
          error?: string;
        }>;
      }
    >
  > => {
    const response = await apiClient.get<
      ApiResponse<
        Webhook & {
          deliveryHistory: Array<{
            id: UUID;
            event: string;
            status: "success" | "failed";
            statusCode?: number;
            responseTime?: number;
            timestamp: string;
            error?: string;
          }>;
        }
      >
    >(ApiEndpoints.integrationWebhook(webhookId));
    return response.data;
  },

  /**
   * Create a webhook
   */
  createWebhook: async (data: CreateWebhookRequest): Promise<ApiResponse<Webhook>> => {
    const response = await apiClient.post<ApiResponse<Webhook>>(ApiEndpoints.integrationsWebhooks, data);
    return response.data;
  },

  /**
   * Update a webhook
   */
  updateWebhook: async (webhookId: UUID, data: Partial<CreateWebhookRequest>): Promise<ApiResponse<Webhook>> => {
    const response = await apiClient.patch<ApiResponse<Webhook>>(ApiEndpoints.integrationWebhook(webhookId), data);
    return response.data;
  },

  /**
   * Delete a webhook
   */
  deleteWebhook: async (webhookId: UUID): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(
      ApiEndpoints.integrationWebhook(webhookId),
    );
    return response.data;
  },

  /**
   * Toggle webhook active status
   */
  toggleWebhookStatus: async (webhookId: UUID): Promise<ApiResponse<Webhook>> => {
    const response = await apiClient.patch<ApiResponse<Webhook>>(ApiEndpoints.integrationWebhookToggle(webhookId));
    return response.data;
  },

  /**
   * Regenerate webhook secret
   */
  regenerateWebhookSecret: async (
    webhookId: UUID,
  ): Promise<
    ApiResponse<{
      secret: string;
    }>
  > => {
    const response = await apiClient.post<
      ApiResponse<{
        secret: string;
      }>
    >(ApiEndpoints.integrationWebhookRegenerateSecret(webhookId));
    return response.data;
  },

  /**
   * Test a webhook
   */
  testWebhook: async (
    webhookId: UUID,
    event?: string,
  ): Promise<
    ApiResponse<{
      success: boolean;
      statusCode: number;
      responseTime: number;
      error?: string;
    }>
  > => {
    const response = await apiClient.post<
      ApiResponse<{
        success: boolean;
        statusCode: number;
        responseTime: number;
        error?: string;
      }>
    >(ApiEndpoints.integrationWebhookTest(webhookId), { event });
    return response.data;
  },

  /**
   * Get available webhook events
   */
  getWebhookEvents: async (): Promise<
    ApiResponse<
      Array<{
        event: string;
        description: string;
        category: string;
        payload: Record<string, unknown>;
      }>
    >
  > => {
    const response = await apiClient.get<
      ApiResponse<
        Array<{
          event: string;
          description: string;
          category: string;
          payload: Record<string, unknown>;
        }>
      >
    >(ApiEndpoints.integrationsWebhookEvents);
    return response.data;
  },

  // ==========================================================================
  // API KEYS
  // ==========================================================================

  /**
   * Get all API keys
   */
  getApiKeys: async (): Promise<ApiResponse<ApiKey[]>> => {
    const response = await apiClient.get<ApiResponse<ApiKey[]>>(ApiEndpoints.integrationsApiKeys);
    return response.data;
  },

  /**
   * Get API key by ID
   */
  getApiKeyById: async (
    keyId: UUID,
  ): Promise<
    ApiResponse<
      ApiKey & {
        usageStats: {
          totalRequests: number;
          requestsThisMonth: number;
          lastUsedAt?: string;
          topEndpoints: Array<{
            endpoint: string;
            count: number;
          }>;
        };
      }
    >
  > => {
    const response = await apiClient.get<
      ApiResponse<
        ApiKey & {
          usageStats: {
            totalRequests: number;
            requestsThisMonth: number;
            lastUsedAt?: string;
            topEndpoints: Array<{
              endpoint: string;
              count: number;
            }>;
          };
        }
      >
    >(ApiEndpoints.integrationApiKey(keyId));
    return response.data;
  },

  /**
   * Create an API key
   */
  createApiKey: async (
    data: CreateApiKeyRequest,
  ): Promise<
    ApiResponse<
      ApiKey & {
        fullKey: string; // Only returned on creation
      }
    >
  > => {
    const response = await apiClient.post<
      ApiResponse<
        ApiKey & {
          fullKey: string;
        }
      >
    >(ApiEndpoints.integrationsApiKeys, data);
    return response.data;
  },

  /**
   * Update an API key
   */
  updateApiKey: async (
    keyId: UUID,
    data: Partial<Omit<CreateApiKeyRequest, "expiresAt">>,
  ): Promise<ApiResponse<ApiKey>> => {
    const response = await apiClient.patch<ApiResponse<ApiKey>>(ApiEndpoints.integrationApiKey(keyId), data);
    return response.data;
  },

  /**
   * Delete an API key
   */
  deleteApiKey: async (keyId: UUID): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(ApiEndpoints.integrationApiKey(keyId));
    return response.data;
  },

  /**
   * Toggle API key active status
   */
  toggleApiKeyStatus: async (keyId: UUID): Promise<ApiResponse<ApiKey>> => {
    const response = await apiClient.patch<ApiResponse<ApiKey>>(ApiEndpoints.integrationApiKeyToggle(keyId));
    return response.data;
  },

  /**
   * Regenerate API key
   */
  regenerateApiKey: async (
    keyId: UUID,
  ): Promise<
    ApiResponse<{
      key: ApiKey;
      fullKey: string;
    }>
  > => {
    const response = await apiClient.post<
      ApiResponse<{
        key: ApiKey;
        fullKey: string;
      }>
    >(ApiEndpoints.integrationApiKeyRegenerate(keyId));
    return response.data;
  },

  /**
   * Get available API permissions
   */
  getApiPermissions: async (): Promise<
    ApiResponse<
      Array<{
        permission: string;
        description: string;
        category: string;
        includes?: string[];
      }>
    >
  > => {
    const response = await apiClient.get<
      ApiResponse<
        Array<{
          permission: string;
          description: string;
          category: string;
          includes?: string[];
        }>
      >
    >(ApiEndpoints.integrationsApiPermissions);
    return response.data;
  },

  // ==========================================================================
  // THIRD-PARTY INTEGRATIONS
  // ==========================================================================

  /**
   * Get connected integrations
   */
  getConnectedIntegrations: async (): Promise<
    ApiResponse<
      Array<{
        id: UUID;
        provider: string;
        name: string;
        status: "connected" | "disconnected" | "error";
        connectedAt: string;
        lastSyncAt?: string;
        metadata?: Record<string, unknown>;
      }>
    >
  > => {
    const response = await apiClient.get<
      ApiResponse<
        Array<{
          id: UUID;
          provider: string;
          name: string;
          status: "connected" | "disconnected" | "error";
          connectedAt: string;
          lastSyncAt?: string;
          metadata?: Record<string, unknown>;
        }>
      >
    >(ApiEndpoints.integrationsExternalAccounts);
    return response.data;
  },

  /**
   * Disconnect an integration
   */
  disconnectIntegration: async (integrationId: UUID): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(
      ApiEndpoints.integrationExternalAccount(integrationId),
    );
    return response.data;
  },

  /**
   * Sync integration data
   */
  syncIntegration: async (
    integrationId: UUID,
  ): Promise<
    ApiResponse<{
      message: string;
      syncedAt: string;
    }>
  > => {
    const response = await apiClient.post<
      ApiResponse<{
        message: string;
        syncedAt: string;
      }>
    >(ApiEndpoints.integrationExternalAccountSync(integrationId));
    return response.data;
  },
};

export default IntegrationsRepository;
