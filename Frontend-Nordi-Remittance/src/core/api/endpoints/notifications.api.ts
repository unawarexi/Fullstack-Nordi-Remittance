// ============================================================================
// NOTIFICATIONS API - Notification management endpoints
// ============================================================================

import apiClient, { ApiResponse, PaginatedResponse } from '../client';

const NOTIFICATIONS_BASE = '/notifications';

// ============================================================================
// REQUEST TYPES
// ============================================================================

export interface NotificationFilters {
  type?: NotificationType;
  isRead?: boolean;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// ============================================================================
// NOTIFICATIONS API FUNCTIONS
// ============================================================================

export const notificationsApi = {
  // ==========================================================================
  // NOTIFICATIONS
  // ==========================================================================

  /**
   * Get all notifications
   */
  getAll: async (params?: NotificationFilters): Promise<PaginatedResponse<AppNotification>> => {
    const response = await apiClient.get<PaginatedResponse<AppNotification>>(
      NOTIFICATIONS_BASE,
      { params }
    );
    return response.data;
  },

  /**
   * Get notification by ID
   */
  getById: async (notificationId: UUID): Promise<ApiResponse<AppNotification>> => {
    const response = await apiClient.get<ApiResponse<AppNotification>>(
      `${NOTIFICATIONS_BASE}/${notificationId}`
    );
    return response.data;
  },

  /**
   * Get unread notifications count
   */
  getUnreadCount: async (): Promise<ApiResponse<{ count: number }>> => {
    const response = await apiClient.get<ApiResponse<{ count: number }>>(
      `${NOTIFICATIONS_BASE}/unread-count`
    );
    return response.data;
  },

  /**
   * Get unread notifications (uses main endpoint with isRead=false filter)
   */
  getUnread: async (limit?: number): Promise<ApiResponse<AppNotification[]>> => {
    const response = await apiClient.get<ApiResponse<AppNotification[]>>(
      NOTIFICATIONS_BASE,
      { params: { isRead: false, limit } }
    );
    return response.data;
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (notificationId: UUID): Promise<ApiResponse<AppNotification>> => {
    const response = await apiClient.put<ApiResponse<AppNotification>>(
      `${NOTIFICATIONS_BASE}/${notificationId}/read`
    );
    return response.data;
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<ApiResponse<{ message: string; count: number }>> => {
    const response = await apiClient.put<ApiResponse<{ message: string; count: number }>>(
      `${NOTIFICATIONS_BASE}/read-all`
    );
    return response.data;
  },

  /**
   * Delete notification
   */
  delete: async (notificationId: UUID): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(
      `${NOTIFICATIONS_BASE}/${notificationId}`
    );
    return response.data;
  },

  /**
   * Delete all read notifications
   */
  deleteAllRead: async (): Promise<ApiResponse<{ message: string; count: number }>> => {
    const response = await apiClient.delete<ApiResponse<{ message: string; count: number }>>(
      `${NOTIFICATIONS_BASE}/read`
    );
    return response.data;
  },

  // ==========================================================================
  // PREFERENCES
  // ==========================================================================

  /**
   * Get notification preferences
   */
  getPreferences: async (): Promise<ApiResponse<NotificationPreferences>> => {
    const response = await apiClient.get<ApiResponse<NotificationPreferences>>(
      `${NOTIFICATIONS_BASE}/preferences`
    );
    return response.data;
  },

  /**
   * Update notification preferences
   */
  updatePreferences: async (
    data: Partial<NotificationPreferences>
  ): Promise<ApiResponse<NotificationPreferences>> => {
    const response = await apiClient.put<ApiResponse<NotificationPreferences>>(
      `${NOTIFICATIONS_BASE}/preferences`,
      data
    );
    return response.data;
  },

  // ==========================================================================
  // PUSH NOTIFICATIONS
  // ==========================================================================

  /**
   * Register push notification token
   */
  registerPushToken: async (data: {
    token: string;
    platform: 'web' | 'ios' | 'android';
    deviceId: string;
  }): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      `${NOTIFICATIONS_BASE}/push/register`,
      data
    );
    return response.data;
  },

  /**
   * Unregister push notification token
   */
  unregisterPushToken: async (deviceId: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(
      `${NOTIFICATIONS_BASE}/push/unregister`,
      { data: { deviceId } }
    );
    return response.data;
  },

  /**
   * Test push notification
   */
  testPushNotification: async (): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      `${NOTIFICATIONS_BASE}/push/test`
    );
    return response.data;
  },
};

export default notificationsApi;
