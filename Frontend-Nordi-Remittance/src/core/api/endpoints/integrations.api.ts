// ============================================================================
// INTEGRATIONS API - Webhooks and API key management endpoints
// ============================================================================

import apiClient, { ApiResponse, PaginatedResponse } from '../client';
import type {
  Webhook,
  ApiKey,
  UUID,
} from '../../../types/api.types';

const INTEGRATIONS_BASE = '/integrations';

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

export const integrationsApi = {
  // ==========================================================================
  // WEBHOOKS
  // ==========================================================================

  /**
   * Get all webhooks
   */
  getWebhooks: async (): Promise<ApiResponse<Webhook[]>> => {
    const response = await apiClient.get<ApiResponse<Webhook[]>>(
      `${INTEGRATIONS_BASE}/webhooks`
    );
    return response.data;
  },

  /**
   * Get webhook by ID
   */
  getWebhookById: async (webhookId: UUID): Promise<ApiResponse<Webhook & {
    deliveryHistory: Array<{
      id: UUID;
      event: string;
      status: 'success' | 'failed';
      statusCode?: number;
      responseTime?: number;
      timestamp: string;
      error?: string;
    }>;
  }>> => {
    const response = await apiClient.get<ApiResponse<Webhook & {
      deliveryHistory: Array<{
        id: UUID;
        event: string;
        status: 'success' | 'failed';
        statusCode?: number;
        responseTime?: number;
        timestamp: string;
        error?: string;
      }>;
    }>>(`${INTEGRATIONS_BASE}/webhooks/${webhookId}`);
    return response.data;
  },

  /**
   * Create a webhook
   */
  createWebhook: async (data: CreateWebhookRequest): Promise<ApiResponse<Webhook>> => {
    const response = await apiClient.post<ApiResponse<Webhook>>(
      `${INTEGRATIONS_BASE}/webhooks`,
      data
    );
    return response.data;
  },

  /**
   * Update a webhook
   */
  updateWebhook: async (
    webhookId: UUID,
    data: Partial<CreateWebhookRequest>
  ): Promise<ApiResponse<Webhook>> => {
    const response = await apiClient.patch<ApiResponse<Webhook>>(
      `${INTEGRATIONS_BASE}/webhooks/${webhookId}`,
      data
    );
    return response.data;
  },

  /**
   * Delete a webhook
   */
  deleteWebhook: async (webhookId: UUID): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(
      `${INTEGRATIONS_BASE}/webhooks/${webhookId}`
    );
    return response.data;
  },

  /**
   * Toggle webhook active status
   */
  toggleWebhookStatus: async (webhookId: UUID): Promise<ApiResponse<Webhook>> => {
    const response = await apiClient.patch<ApiResponse<Webhook>>(
      `${INTEGRATIONS_BASE}/webhooks/${webhookId}/toggle`
    );
    return response.data;
  },

  /**
   * Regenerate webhook secret
   */
  regenerateWebhookSecret: async (webhookId: UUID): Promise<ApiResponse<{
    secret: string;
  }>> => {
    const response = await apiClient.post<ApiResponse<{
      secret: string;
    }>>(`${INTEGRATIONS_BASE}/webhooks/${webhookId}/regenerate-secret`);
    return response.data;
  },

  /**
   * Test a webhook
   */
  testWebhook: async (webhookId: UUID, event?: string): Promise<ApiResponse<{
    success: boolean;
    statusCode: number;
    responseTime: number;
    error?: string;
  }>> => {
    const response = await apiClient.post<ApiResponse<{
      success: boolean;
      statusCode: number;
      responseTime: number;
      error?: string;
    }>>(`${INTEGRATIONS_BASE}/webhooks/${webhookId}/test`, { event });
    return response.data;
  },

  /**
   * Get available webhook events
   */
  getWebhookEvents: async (): Promise<ApiResponse<Array<{
    event: string;
    description: string;
    category: string;
    payload: Record<string, unknown>;
  }>>> => {
    const response = await apiClient.get<ApiResponse<Array<{
      event: string;
      description: string;
      category: string;
      payload: Record<string, unknown>;
    }>>>(`${INTEGRATIONS_BASE}/webhooks/events`);
    return response.data;
  },

  // ==========================================================================
  // API KEYS
  // ==========================================================================

  /**
   * Get all API keys
   */
  getApiKeys: async (): Promise<ApiResponse<ApiKey[]>> => {
    const response = await apiClient.get<ApiResponse<ApiKey[]>>(
      `${INTEGRATIONS_BASE}/api-keys`
    );
    return response.data;
  },

  /**
   * Get API key by ID
   */
  getApiKeyById: async (keyId: UUID): Promise<ApiResponse<ApiKey & {
    usageStats: {
      totalRequests: number;
      requestsThisMonth: number;
      lastUsedAt?: string;
      topEndpoints: Array<{
        endpoint: string;
        count: number;
      }>;
    };
  }>> => {
    const response = await apiClient.get<ApiResponse<ApiKey & {
      usageStats: {
        totalRequests: number;
        requestsThisMonth: number;
        lastUsedAt?: string;
        topEndpoints: Array<{
          endpoint: string;
          count: number;
        }>;
      };
    }>>(`${INTEGRATIONS_BASE}/api-keys/${keyId}`);
    return response.data;
  },

  /**
   * Create an API key
   */
  createApiKey: async (data: CreateApiKeyRequest): Promise<ApiResponse<ApiKey & {
    fullKey: string; // Only returned on creation
  }>> => {
    const response = await apiClient.post<ApiResponse<ApiKey & {
      fullKey: string;
    }>>(`${INTEGRATIONS_BASE}/api-keys`, data);
    return response.data;
  },

  /**
   * Update an API key
   */
  updateApiKey: async (
    keyId: UUID,
    data: Partial<Omit<CreateApiKeyRequest, 'expiresAt'>>
  ): Promise<ApiResponse<ApiKey>> => {
    const response = await apiClient.patch<ApiResponse<ApiKey>>(
      `${INTEGRATIONS_BASE}/api-keys/${keyId}`,
      data
    );
    return response.data;
  },

  /**
   * Delete an API key
   */
  deleteApiKey: async (keyId: UUID): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(
      `${INTEGRATIONS_BASE}/api-keys/${keyId}`
    );
    return response.data;
  },

  /**
   * Toggle API key active status
   */
  toggleApiKeyStatus: async (keyId: UUID): Promise<ApiResponse<ApiKey>> => {
    const response = await apiClient.patch<ApiResponse<ApiKey>>(
      `${INTEGRATIONS_BASE}/api-keys/${keyId}/toggle`
    );
    return response.data;
  },

  /**
   * Regenerate API key
   */
  regenerateApiKey: async (keyId: UUID): Promise<ApiResponse<{
    key: ApiKey;
    fullKey: string;
  }>> => {
    const response = await apiClient.post<ApiResponse<{
      key: ApiKey;
      fullKey: string;
    }>>(`${INTEGRATIONS_BASE}/api-keys/${keyId}/regenerate`);
    return response.data;
  },

  /**
   * Get available API permissions
   */
  getApiPermissions: async (): Promise<ApiResponse<Array<{
    permission: string;
    description: string;
    category: string;
    includes?: string[];
  }>>> => {
    const response = await apiClient.get<ApiResponse<Array<{
      permission: string;
      description: string;
      category: string;
      includes?: string[];
    }>>>(`${INTEGRATIONS_BASE}/api-keys/permissions`);
    return response.data;
  },

  // ==========================================================================
  // THIRD-PARTY INTEGRATIONS
  // ==========================================================================

  /**
   * Get connected integrations
   */
  getConnectedIntegrations: async (): Promise<ApiResponse<Array<{
    id: UUID;
    provider: string;
    name: string;
    status: 'connected' | 'disconnected' | 'error';
    connectedAt: string;
    lastSyncAt?: string;
    metadata?: Record<string, unknown>;
  }>>> => {
    const response = await apiClient.get<ApiResponse<Array<{
      id: UUID;
      provider: string;
      name: string;
      status: 'connected' | 'disconnected' | 'error';
      connectedAt: string;
      lastSyncAt?: string;
      metadata?: Record<string, unknown>;
    }>>>(`${INTEGRATIONS_BASE}/connected`);
    return response.data;
  },

  /**
   * Disconnect an integration
   */
  disconnectIntegration: async (integrationId: UUID): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(
      `${INTEGRATIONS_BASE}/connected/${integrationId}`
    );
    return response.data;
  },

  /**
   * Sync integration data
   */
  syncIntegration: async (integrationId: UUID): Promise<ApiResponse<{
    message: string;
    syncedAt: string;
  }>> => {
    const response = await apiClient.post<ApiResponse<{
      message: string;
      syncedAt: string;
    }>>(`${INTEGRATIONS_BASE}/connected/${integrationId}/sync`);
    return response.data;
  },
};

export default integrationsApi;
