// ============================================================================
// NOTIFICATIONS HOOKS - TanStack Query hooks for notifications
// ============================================================================

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../../core/api';
import { queryKeys } from '../../core/api/queryClient';
import { useToastStore } from '../../store/toast.store';
import type { NotificationType, UUID } from '../../types/api.types';

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

/**
 * Get all notifications
 */
export const useNotifications = (filters?: NotificationFilters) => {
  return useQuery({
    queryKey: queryKeys.notifications.list(filters),
    queryFn: async () => {
      const response = await notificationsApi.getAll(filters);
      return response;
    },
  });
};

/**
 * Get notification by ID
 */
export const useNotification = (notificationId: UUID) => {
  return useQuery({
    queryKey: queryKeys.notifications.detail(notificationId),
    queryFn: async () => {
      const response = await notificationsApi.getById(notificationId);
      return response.data;
    },
    enabled: !!notificationId,
  });
};

/**
 * Get unread notifications count
 */
export const useUnreadNotificationsCount = () => {
  return useQuery({
    queryKey: [...queryKeys.notifications.all, 'unread-count'],
    queryFn: async () => {
      const response = await notificationsApi.getUnreadCount();
      return response.data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

/**
 * Get notification preferences
 */
export const useNotificationPreferences = () => {
  return useQuery({
    queryKey: queryKeys.notifications.preferences(),
    queryFn: async () => {
      const response = await notificationsApi.getPreferences();
      return response.data;
    },
  });
};

/**
 * Get notification categories
 */
export const useNotificationCategories = () => {
  return useQuery({
    queryKey: [...queryKeys.notifications.all, 'categories'],
    queryFn: async () => {
      const response = await notificationsApi.getCategories();
      return response.data;
    },
    staleTime: Infinity, // Categories rarely change
  });
};

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Mark notification as read mutation
 */
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: UUID) => {
      const response = await notificationsApi.markAsRead(notificationId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
};

/**
 * Mark multiple notifications as read mutation
 */
export const useMarkMultipleAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationIds: UUID[]) => {
      const response = await notificationsApi.markMultipleAsRead(notificationIds);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
};

/**
 * Mark all notifications as read mutation
 */
export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async () => {
      const response = await notificationsApi.markAllAsRead();
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      showToast('All notifications marked as read', 'success');
    },
    onError: (error: Error) => {
      showToast(error.message || 'Failed to mark notifications as read', 'error');
    },
  });
};

/**
 * Delete notification mutation
 */
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: UUID) => {
      const response = await notificationsApi.delete(notificationId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
};

/**
 * Delete multiple notifications mutation
 */
export const useDeleteMultipleNotifications = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (notificationIds: UUID[]) => {
      const response = await notificationsApi.deleteMultiple(notificationIds);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      showToast('Notifications deleted', 'success');
    },
    onError: (error: Error) => {
      showToast(error.message || 'Failed to delete notifications', 'error');
    },
  });
};

/**
 * Clear all notifications mutation
 */
export const useClearAllNotifications = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async () => {
      const response = await notificationsApi.clearAll();
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      showToast('All notifications cleared', 'success');
    },
    onError: (error: Error) => {
      showToast(error.message || 'Failed to clear notifications', 'error');
    },
  });
};

/**
 * Update notification preferences mutation
 */
export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (data: {
      email?: {
        enabled: boolean;
        frequency?: 'instant' | 'daily' | 'weekly';
        categories?: NotificationType[];
      };
      push?: {
        enabled: boolean;
        categories?: NotificationType[];
      };
      sms?: {
        enabled: boolean;
        categories?: NotificationType[];
      };
      inApp?: {
        enabled: boolean;
        categories?: NotificationType[];
      };
    }) => {
      const response = await notificationsApi.updatePreferences(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.preferences() });
      showToast('Preferences updated', 'success');
    },
    onError: (error: Error) => {
      showToast(error.message || 'Failed to update preferences', 'error');
    },
  });
};

/**
 * Register push notification token mutation
 */
export const useRegisterPushToken = () => {
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (data: {
      token: string;
      deviceType: 'ios' | 'android' | 'web';
      deviceId?: string;
      deviceName?: string;
    }) => {
      const response = await notificationsApi.registerPushToken(data);
      return response.data;
    },
    onSuccess: () => {
      showToast('Push notifications enabled', 'success');
    },
    onError: (error: Error) => {
      showToast(error.message || 'Failed to enable push notifications', 'error');
    },
  });
};

/**
 * Unregister push notification token mutation
 */
export const useUnregisterPushToken = () => {
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (data: { token: string; deviceId?: string }) => {
      const response = await notificationsApi.unregisterPushToken(data);
      return response.data;
    },
    onSuccess: () => {
      showToast('Push notifications disabled', 'success');
    },
    onError: (error: Error) => {
      showToast(error.message || 'Failed to disable push notifications', 'error');
    },
  });
};

/**
 * Test notification mutation
 */
export const useSendTestNotification = () => {
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (channel: 'email' | 'push' | 'sms') => {
      const response = await notificationsApi.sendTestNotification(channel);
      return response.data;
    },
    onSuccess: (_, channel) => {
      showToast(`Test ${channel} notification sent`, 'success');
    },
    onError: (error: Error) => {
      showToast(error.message || 'Failed to send test notification', 'error');
    },
  });
};

/**
 * Subscribe to notification topic mutation
 */
export const useSubscribeToTopic = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (topic: string) => {
      const response = await notificationsApi.subscribeToTopic(topic);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.preferences() });
      showToast('Subscribed to notifications', 'success');
    },
    onError: (error: Error) => {
      showToast(error.message || 'Failed to subscribe', 'error');
    },
  });
};

/**
 * Unsubscribe from notification topic mutation
 */
export const useUnsubscribeFromTopic = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (topic: string) => {
      const response = await notificationsApi.unsubscribeFromTopic(topic);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.preferences() });
      showToast('Unsubscribed from notifications', 'success');
    },
    onError: (error: Error) => {
      showToast(error.message || 'Failed to unsubscribe', 'error');
    },
  });
};
