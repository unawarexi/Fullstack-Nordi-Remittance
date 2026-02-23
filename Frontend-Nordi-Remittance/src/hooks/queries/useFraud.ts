// ============================================================================
// FRAUD HOOKS - TanStack Query hooks for fraud monitoring and alerts
// ============================================================================


// ============================================================================
// QUERY PARAMETER TYPES
// ============================================================================

interface FraudAlertFilters {
  severity?: FraudAlertSeverity;
  status?: FraudAlertStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get all fraud alerts
 */
export const useFraudAlerts = (filters?: FraudAlertFilters) => {
  return useQuery({
    queryKey: queryKeys.fraud.alerts(filters as Record<string, unknown>),
    queryFn: async () => {
      const response = await fraudApi.getAlerts(filters);
      return response;
    },
  });
};

/**
 * Get fraud alert by ID
 */
export const useFraudAlert = (alertId: UUID) => {
  return useQuery({
    queryKey: queryKeys.fraud.alertDetail(alertId),
    queryFn: async () => {
      const response = await fraudApi.getAlertById(alertId);
      return response.data;
    },
    enabled: !!alertId,
  });
};

/**
 * Get unresolved alerts count
 */
export const useUnresolvedAlertsCount = () => {
  return useQuery({
    queryKey: queryKeys.fraud.unresolvedCount(),
    queryFn: async () => {
      const response = await fraudApi.getUnresolvedCount();
      return response.data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

/**
 * Get my fraud reports
 */
export const useMyFraudReports = (params?: {
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: queryKeys.fraud.reports(params as Record<string, unknown>),
    queryFn: async () => {
      const response = await fraudApi.getMyReports(params);
      return response;
    },
  });
};

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Report suspicious activity mutation
 */
export const useReportSuspiciousActivity = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (data: {
      type:
        | "unauthorized_access"
        | "suspicious_transaction"
        | "phishing"
        | "other";
      description: string;
      transactionId?: UUID;
      attachments?: UUID[];
    }) => {
      const response = await fraudApi.reportSuspiciousActivity(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.fraud.reports() });
      showToast(
        "Suspicious activity reported. We will investigate.",
        "success",
      );
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to submit report", "error");
    },
  });
};

/**
 * Acknowledge alert mutation
 */
export const useAcknowledgeAlert = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (alertId: UUID) => {
      const response = await fraudApi.acknowledgeAlert(alertId);
      return response.data;
    },
    onSuccess: (_, alertId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.fraud.alertDetail(alertId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.fraud.alerts() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.fraud.unresolvedCount(),
      });
      showToast("Alert acknowledged", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to acknowledge alert", "error");
    },
  });
};

/**
 * Mark alert as false positive mutation
 */
export const useMarkAsFalsePositive = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async ({
      alertId,
      reason,
    }: {
      alertId: UUID;
      reason: string;
    }) => {
      const response = await fraudApi.markAsFalsePositive(alertId, reason);
      return response.data;
    },
    onSuccess: (_, { alertId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.fraud.alertDetail(alertId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.fraud.alerts() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.fraud.unresolvedCount(),
      });
      showToast("Alert marked as false positive", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to update alert", "error");
    },
  });
};

/**
 * Lock account (emergency) mutation
 */
export const useLockAccount = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (reason: string) => {
      const response = await fraudApi.lockAccount(reason);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
      showToast(
        "Account locked for security. Contact support to unlock.",
        "warning",
      );
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to lock account", "error");
    },
  });
};

/**
 * Request account unlock mutation
 */
export const useRequestUnlock = () => {
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (data: {
      reason: string;
      verificationMethod: "email" | "phone" | "document";
    }) => {
      const response = await fraudApi.requestUnlock(data);
      return response.data;
    },
    onSuccess: (data) => {
      showToast(`Unlock request submitted. ${data.nextSteps[0]}`, "info");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to submit unlock request", "error");
    },
  });
};

/**
 * Block card (emergency) mutation
 */
export const useBlockCard = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async ({
      cardId,
      reason,
    }: {
      cardId: UUID;
      reason: string;
    }) => {
      const response = await fraudApi.blockCard(cardId, reason);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cards.list() });
      showToast("Card blocked for security", "warning");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to block card", "error");
    },
  });
};
