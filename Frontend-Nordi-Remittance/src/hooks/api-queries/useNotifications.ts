import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { NotificationsRepository } from '../../domain/repository/notifications.repository';
import { queryKeys } from "../../core/lib/queryClient";
import { useToastStore } from "../../store/toast.store";
// ============================================================================
// NOTIFICATIONS HOOKS - TanStack Query hooks for notifications
// ============================================================================

// ============================================================================
// QUERY PARAMETER TYPES
// ============================================================================

interface NotificationFilters {
  type?: NotificationType;
  isRead?: boolean;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// ============================================================================
// QUERIES
// ============================================================================

export const useNotifications = (filters?: NotificationFilters) => {
  return useQuery({
    queryKey: queryKeys.notifications.list(filters as Record<string, unknown>),
    queryFn: async () => {
      const response = await NotificationsRepository.getAll(filters);
      return response;
    },
  });
};

export const useNotification = (notificationId: UUID) => {
  return useQuery({
    queryKey: [...queryKeys.notifications.all, "detail", notificationId],
    queryFn: async () => {
      const response = await NotificationsRepository.getById(notificationId);
      return response.data;
    },
    enabled: !!notificationId,
  });
};

export const useUnreadNotificationsCount = () => {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: async () => {
      const response = await NotificationsRepository.getUnreadCount();
      return response.data;
    },
    refetchInterval: 30000,
  });
};

export const useUnreadNotifications = (limit?: number) => {
  return useQuery({
    queryKey: queryKeys.notifications.unread(limit),
    queryFn: async () => {
      const response = await NotificationsRepository.getUnread(limit);
      return response.data;
    },
  });
};

export const useNotificationPreferences = () => {
  return useQuery({
    queryKey: queryKeys.notifications.preferences(),
    queryFn: async () => {
      const response = await NotificationsRepository.getPreferences();
      return response.data;
    },
  });
};

// ============================================================================
// MUTATIONS
// ============================================================================

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: UUID) => {
      const response = await NotificationsRepository.markAsRead(notificationId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async () => {
      const response = await NotificationsRepository.markAllAsRead();
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      showToast("All notifications marked as read", "success");
    },
    onError: (e: Error) =>
      showToast(e.message || "Failed to mark notifications read", "error"),
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: UUID) => {
      const response = await NotificationsRepository.delete(notificationId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
};

export const useDeleteAllReadNotifications = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async () => {
      const response = await NotificationsRepository.deleteAllRead();
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      showToast("Read notifications deleted", "success");
    },
    onError: (e: Error) =>
      showToast(e.message || "Failed to delete notifications", "error"),
  });
};

export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await NotificationsRepository.updatePreferences(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.preferences(),
      });
      showToast("Preferences updated", "success");
    },
    onError: (e: Error) =>
      showToast(e.message || "Failed to update preferences", "error"),
  });
};

export const useRegisterPushToken = () => {
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (data: {
      token: string;
      platform: "ios" | "android" | "web";
      deviceId: string;
    }) => {
      const response = await NotificationsRepository.registerPushToken(data);
      return response.data;
    },
    onSuccess: () => showToast("Push notifications enabled", "success"),
    onError: (e: Error) =>
      showToast(e.message || "Failed to enable push notifications", "error"),
  });
};

export const useUnregisterPushToken = () => {
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (deviceId: string) => {
      const response = await NotificationsRepository.unregisterPushToken(deviceId);
      return response.data;
    },
    onSuccess: () => showToast("Push notifications disabled", "success"),
    onError: (e: Error) =>
      showToast(e.message || "Failed to disable push notifications", "error"),
  });
};

export const useSendTestNotification = () => {
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async () => {
      const response = await NotificationsRepository.testPushNotification();
      return response.data;
    },
    onSuccess: () => showToast(`Test push notification sent`, "success"),
    onError: (e: Error) =>
      showToast(e.message || "Failed to send test notification", "error"),
  });
};
