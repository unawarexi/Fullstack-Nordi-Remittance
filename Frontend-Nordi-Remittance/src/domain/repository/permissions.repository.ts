import apiClient, { ApiResponse } from "@core/api/client";
import { ApiEndpoints } from "../../core/api/endpoint";

export const PermissionsRepository = {
  // ==========================================================================
  // ADMIN PERMISSIONS (What an admin is allowed to do)
  // ==========================================================================
  getAvailablePermissions: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>(ApiEndpoints.adminPermissionsAvailable);
    return response.data;
  },
  getAdminPermissions: async (adminId: UUID): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>(ApiEndpoints.adminAdminPermissions(adminId));
    return response.data;
  },
  updateAdminPermissions: async (adminId: UUID, data: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.put<ApiResponse<any>>(ApiEndpoints.adminAdminPermissions(adminId), data);
    return response.data;
  },
  setPermissionPreset: async (adminId: UUID, data: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.post<ApiResponse<any>>(ApiEndpoints.adminAdminPermissionsPreset(adminId), data);
    return response.data;
  },
  revokeAllPermissions: async (adminId: UUID): Promise<ApiResponse<any>> => {
    const response = await apiClient.delete<ApiResponse<any>>(ApiEndpoints.adminAdminPermissions(adminId));
    return response.data;
  },

  // ==========================================================================
  // USER PERMISSIONS (What a user is allowed to do, managed by admin)
  // ==========================================================================
  getUserPermissions: async (userId: UUID): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>(ApiEndpoints.permissionsUser(userId));
    return response.data;
  },
  getAllUserPermissions: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>(ApiEndpoints.permissionsUsers);
    return response.data;
  },
  getPermissionCategories: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>(ApiEndpoints.permissionsCategories);
    return response.data;
  },
  updateUserPermissions: async (userId: UUID, data: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.put<ApiResponse<any>>(ApiEndpoints.permissionsUser(userId), data);
    return response.data;
  },
  updateUserPermissionField: async (userId: UUID, field: string, value: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.patch<ApiResponse<any>>(ApiEndpoints.permissionsUserField(userId), { field, value });
    return response.data;
  },
  deleteUserPermissions: async (userId: UUID): Promise<ApiResponse<any>> => {
    const response = await apiClient.delete<ApiResponse<any>>(ApiEndpoints.permissionsUser(userId));
    return response.data;
  },
  bulkUpdateUserPermissions: async (data: { userIds: UUID[]; permissions: any }): Promise<ApiResponse<any>> => {
    const response = await apiClient.post<ApiResponse<any>>(ApiEndpoints.permissionsBulkUpdate, data);
    return response.data;
  },
};

export default PermissionsRepository;
