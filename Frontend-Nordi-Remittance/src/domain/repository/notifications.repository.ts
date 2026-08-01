import { ApiEndpoints } from "../../core/api/endpoint";
// ============================================================================
// NOTIFICATIONS API - Notification management endpoints
// ============================================================================

import apiClient, { ApiResponse, PaginatedResponse } from "@core/api/client";


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

export const NotificationsRepository = {
  // ==========================================================================
  // NOTIFICATIONS
  // ==========================================================================

  /**
   * Get all notifications
   */
  getAll: async (params?: NotificationFilters): Promise<PaginatedResponse<AppNotification>> => {
    const response = await apiClient.get<PaginatedResponse<AppNotification>>("/notifications", { params });
    return response.data;
  },

  /**
   * Get notification by ID
   */
  getById: async (notificationId: UUID): Promise<ApiResponse<AppNotification>> => {
    const response = await apiClient.get<ApiResponse<AppNotification>>(ApiEndpoints.notification(notificationId));
    return response.data;
  },

  /**
   * Get unread notifications count
   */
  getUnreadCount: async (): Promise<ApiResponse<{ count: number }>> => {
    const response = await apiClient.get<ApiResponse<{ count: number }>>(ApiEndpoints.notificationsUnreadCount);
    return response.data;
  },

  /**
   * Get unread notifications (uses main endpoint with isRead=false filter)
   */
  getUnread: async (limit?: number): Promise<ApiResponse<AppNotification[]>> => {
    const response = await apiClient.get<ApiResponse<AppNotification[]>>("/notifications", {
      params: { isRead: false, limit },
    });
    return response.data;
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (notificationId: UUID): Promise<ApiResponse<AppNotification>> => {
    const response = await apiClient.put<ApiResponse<AppNotification>>(ApiEndpoints.notificationRead(notificationId));
    return response.data;
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<ApiResponse<{ message: string; count: number }>> => {
    const response = await apiClient.put<ApiResponse<{ message: string; count: number }>>(
      ApiEndpoints.notificationsReadAll,
    );
    return response.data;
  },

  /**
   * Delete notification
   */
  delete: async (notificationId: UUID): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(
      ApiEndpoints.notification(notificationId),
    );
    return response.data;
  },

  /**
   * Delete all read notifications
   */
  deleteAllRead: async (): Promise<ApiResponse<{ message: string; count: number }>> => {
    const response = await apiClient.delete<ApiResponse<{ message: string; count: number }>>(
      ApiEndpoints.notificationsRead,
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
    const response = await apiClient.get<ApiResponse<NotificationPreferences>>(ApiEndpoints.notificationsPreferences);
    return response.data;
  },

  /**
   * Update notification preferences
   */
  updatePreferences: async (data: Partial<NotificationPreferences>): Promise<ApiResponse<NotificationPreferences>> => {
    const response = await apiClient.put<ApiResponse<NotificationPreferences>>(
      ApiEndpoints.notificationsPreferences,
      data,
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
    platform: "web" | "ios" | "android";
    deviceId: string;
  }): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      ApiEndpoints.notificationsPushRegister,
      data,
    );
    return response.data;
  },

  /**
   * Unregister push notification token
   */
  unregisterPushToken: async (deviceId: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(ApiEndpoints.notificationsPushUnregister, {
      data: { deviceId },
    });
    return response.data;
  },

  /**
   * Test push notification
   */
  testPushNotification: async (): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(ApiEndpoints.notificationsPushTest);
    return response.data;
  },
};

export default NotificationsRepository;
