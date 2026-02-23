import { integrationsApi } from '../../core/api/endpoints/integrations.api';
import { useToastStore } from '../../store/toast.store';
import { queryKeys } from '../../core/lib/queryClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// ============================================================================
// INTEGRATIONS HOOKS - TanStack Query hooks for webhooks and API keys
// ============================================================================


// ============================================================================
// QUERY PARAMETER TYPES
// ============================================================================

interface WebhookFilters {
  status?: "active" | "inactive" | "failed";
  eventType?: string;
  page?: number;
  limit?: number;
}

interface ApiKeyFilters {
  status?: "active" | "revoked" | "expired";
  page?: number;
  limit?: number;
}

// ============================================================================
// QUERIES - WEBHOOKS
// ============================================================================

/**
 * Get all webhooks
 */
export const useWebhooks = (filters?: WebhookFilters) => {
  return useQuery({
    queryKey: queryKeys.integrations.webhooks(filters),
    queryFn: async () => {
      const response = await integrationsApi.getWebhooks(filters);
      return response;
    },
  });
};

/**
 * Get webhook by ID
 */
export const useWebhook = (webhookId: UUID) => {
  return useQuery({
    queryKey: queryKeys.integrations.webhook(webhookId),
    queryFn: async () => {
      const response = await integrationsApi.getWebhookById(webhookId);
      return response.data;
    },
    enabled: !!webhookId,
  });
};

/**
 * Get webhook events (supported event types)
 */
export const useWebhookEvents = () => {
  return useQuery({
    queryKey: [...queryKeys.integrations.all, "webhook-events"],
    queryFn: async () => {
      const response = await integrationsApi.getWebhookEvents();
      return response.data;
    },
    staleTime: Infinity, // Event types don't change frequently
  });
};

/**
 * Get webhook delivery history
 */
export const useWebhookDeliveries = (
  webhookId: UUID,
  params?: { page?: number; limit?: number },
) => {
  return useQuery({
    queryKey: [
      ...queryKeys.integrations.webhook(webhookId),
      "deliveries",
      params,
    ],
    queryFn: async () => {
      const response = await integrationsApi.getWebhookDeliveries(
        webhookId,
        params,
      );
      return response;
    },
    enabled: !!webhookId,
  });
};

/**
 * Get webhook secret
 */
export const useWebhookSecret = (webhookId: UUID) => {
  return useQuery({
    queryKey: [...queryKeys.integrations.webhook(webhookId), "secret"],
    queryFn: async () => {
      const response = await integrationsApi.getWebhookSecret(webhookId);
      return response.data;
    },
    enabled: !!webhookId,
    staleTime: 0, // Always fetch fresh (sensitive data)
  });
};

// ============================================================================
// QUERIES - API KEYS
// ============================================================================

/**
 * Get all API keys
 */
export const useApiKeys = (filters?: ApiKeyFilters) => {
  return useQuery({
    queryKey: queryKeys.integrations.apiKeys(filters),
    queryFn: async () => {
      const response = await integrationsApi.getApiKeys(filters);
      return response;
    },
  });
};

/**
 * Get API key by ID
 */
export const useApiKey = (keyId: UUID) => {
  return useQuery({
    queryKey: queryKeys.integrations.apiKey(keyId),
    queryFn: async () => {
      const response = await integrationsApi.getApiKeyById(keyId);
      return response.data;
    },
    enabled: !!keyId,
  });
};

/**
 * Get API key usage statistics
 */
export const useApiKeyUsage = (
  keyId: UUID,
  params?: { startDate?: string; endDate?: string },
) => {
  return useQuery({
    queryKey: [...queryKeys.integrations.apiKey(keyId), "usage", params],
    queryFn: async () => {
      const response = await integrationsApi.getApiKeyUsage(keyId, params);
      return response.data;
    },
    enabled: !!keyId,
  });
};

/**
 * Get available API scopes
 */
export const useApiScopes = () => {
  return useQuery({
    queryKey: [...queryKeys.integrations.all, "api-scopes"],
    queryFn: async () => {
      const response = await integrationsApi.getApiScopes();
      return response.data;
    },
    staleTime: Infinity,
  });
};

// ============================================================================
// QUERIES - CONNECTED INTEGRATIONS
// ============================================================================

/**
 * Get connected integrations
 */
export const useConnectedIntegrations = () => {
  return useQuery({
    queryKey: queryKeys.integrations.connected(),
    queryFn: async () => {
      const response = await integrationsApi.getConnectedIntegrations();
      return response.data;
    },
  });
};

/**
 * Get available integrations
 */
export const useAvailableIntegrations = () => {
  return useQuery({
    queryKey: [...queryKeys.integrations.all, "available"],
    queryFn: async () => {
      const response = await integrationsApi.getAvailableIntegrations();
      return response.data;
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
};

// ============================================================================
// MUTATIONS - WEBHOOKS
// ============================================================================

/**
 * Create webhook mutation
 */
export const useCreateWebhook = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      url: string;
      events: string[];
      description?: string;
      secret?: string;
      headers?: Record<string, string>;
      active?: boolean;
    }) => {
      const response = await integrationsApi.createWebhook(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.integrations.webhooks(),
      });
      showToast("Webhook created successfully", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to create webhook", "error");
    },
  });
};

/**
 * Update webhook mutation
 */
export const useUpdateWebhook = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async ({
      webhookId,
      data,
    }: {
      webhookId: UUID;
      data: Partial<{
        name: string;
        url: string;
        events: string[];
        description: string;
        headers: Record<string, string>;
        active: boolean;
      }>;
    }) => {
      const response = await integrationsApi.updateWebhook(webhookId, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.integrations.webhook(variables.webhookId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.integrations.webhooks(),
      });
      showToast("Webhook updated", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to update webhook", "error");
    },
  });
};

/**
 * Delete webhook mutation
 */
export const useDeleteWebhook = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (webhookId: UUID) => {
      const response = await integrationsApi.deleteWebhook(webhookId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.integrations.webhooks(),
      });
      showToast("Webhook deleted", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to delete webhook", "error");
    },
  });
};

/**
 * Toggle webhook active status mutation
 */
export const useToggleWebhookStatus = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (webhookId: UUID) => {
      const response = await integrationsApi.toggleWebhookStatus(webhookId);
      return response.data;
    },
    onSuccess: (data, webhookId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.integrations.webhook(webhookId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.integrations.webhooks(),
      });
      showToast(
        data.active ? "Webhook activated" : "Webhook deactivated",
        "success",
      );
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to update webhook", "error");
    },
  });
};

/**
 * Test webhook mutation
 */
export const useTestWebhook = () => {
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async ({
      webhookId,
      eventType,
    }: {
      webhookId: UUID;
      eventType?: string;
    }) => {
      const response = await integrationsApi.testWebhook(webhookId, eventType);
      return response.data;
    },
    onSuccess: () => {
      showToast("Test event sent", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to send test event", "error");
    },
  });
};

/**
 * Regenerate webhook secret mutation
 */
export const useRegenerateWebhookSecret = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (webhookId: UUID) => {
      const response = await integrationsApi.regenerateWebhookSecret(webhookId);
      return response.data;
    },
    onSuccess: (_, webhookId) => {
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.integrations.webhook(webhookId), "secret"],
      });
      showToast("Secret regenerated", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to regenerate secret", "error");
    },
  });
};

/**
 * Retry failed webhook delivery mutation
 */
export const useRetryWebhookDelivery = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async ({
      webhookId,
      deliveryId,
    }: {
      webhookId: UUID;
      deliveryId: UUID;
    }) => {
      const response = await integrationsApi.retryWebhookDelivery(
        webhookId,
        deliveryId,
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          ...queryKeys.integrations.webhook(variables.webhookId),
          "deliveries",
        ],
      });
      showToast("Delivery retried", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to retry delivery", "error");
    },
  });
};

// ============================================================================
// MUTATIONS - API KEYS
// ============================================================================

/**
 * Create API key mutation
 */
export const useCreateApiKey = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      scopes: string[];
      description?: string;
      expiresAt?: string;
      ipWhitelist?: string[];
    }) => {
      const response = await integrationsApi.createApiKey(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.integrations.apiKeys(),
      });
      showToast("API key created. Make sure to copy it now!", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to create API key", "error");
    },
  });
};

/**
 * Update API key mutation
 */
export const useUpdateApiKey = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async ({
      keyId,
      data,
    }: {
      keyId: UUID;
      data: Partial<{
        name: string;
        description: string;
        scopes: string[];
        ipWhitelist: string[];
      }>;
    }) => {
      const response = await integrationsApi.updateApiKey(keyId, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.integrations.apiKey(variables.keyId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.integrations.apiKeys(),
      });
      showToast("API key updated", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to update API key", "error");
    },
  });
};

/**
 * Revoke API key mutation
 */
export const useRevokeApiKey = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (keyId: UUID) => {
      const response = await integrationsApi.revokeApiKey(keyId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.integrations.apiKeys(),
      });
      showToast("API key revoked", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to revoke API key", "error");
    },
  });
};

/**
 * Regenerate API key mutation
 */
export const useRegenerateApiKey = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (keyId: UUID) => {
      const response = await integrationsApi.regenerateApiKey(keyId);
      return response.data;
    },
    onSuccess: (_, keyId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.integrations.apiKey(keyId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.integrations.apiKeys(),
      });
      showToast("New API key generated. Make sure to copy it now!", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to regenerate API key", "error");
    },
  });
};

// ============================================================================
// MUTATIONS - CONNECTED INTEGRATIONS
// ============================================================================

/**
 * Connect integration mutation
 */
export const useConnectIntegration = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (data: {
      integrationType: string;
      config?: Record<string, unknown>;
      authCode?: string;
    }) => {
      const response = await integrationsApi.connectIntegration(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.integrations.connected(),
      });
      showToast("Integration connected", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to connect integration", "error");
    },
  });
};

/**
 * Disconnect integration mutation
 */
export const useDisconnectIntegration = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (integrationId: UUID) => {
      const response =
        await integrationsApi.disconnectIntegration(integrationId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.integrations.connected(),
      });
      showToast("Integration disconnected", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to disconnect integration", "error");
    },
  });
};

/**
 * Update integration settings mutation
 */
export const useUpdateIntegrationSettings = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async ({
      integrationId,
      settings,
    }: {
      integrationId: UUID;
      settings: Record<string, unknown>;
    }) => {
      const response = await integrationsApi.updateIntegrationSettings(
        integrationId,
        settings,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.integrations.connected(),
      });
      showToast("Integration settings updated", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to update settings", "error");
    },
  });
};

/**
 * Refresh integration connection mutation
 */
export const useRefreshIntegration = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (integrationId: UUID) => {
      const response = await integrationsApi.refreshIntegration(integrationId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.integrations.connected(),
      });
      showToast("Integration refreshed", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to refresh integration", "error");
    },
  });
};
