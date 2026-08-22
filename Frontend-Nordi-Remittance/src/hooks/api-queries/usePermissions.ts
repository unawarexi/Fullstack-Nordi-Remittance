import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PermissionsRepository } from "../../domain/repository/permissions.repository";
import { useToastStore } from "../../store/toast.store";

// ============================================================================
// ADMIN PERMISSIONS HOOKS
// ============================================================================

export const useAdminAvailablePermissions = () => {
  return useQuery({
    queryKey: ["admin", "permissions", "available"],
    queryFn: async () => {
      const response = await PermissionsRepository.getAvailablePermissions();
      return response.data;
    },
  });
};

export const useAdminPermissions = (adminId: UUID) => {
  return useQuery({
    queryKey: ["admin", "permissions", adminId],
    queryFn: async () => {
      const response = await PermissionsRepository.getAdminPermissions(adminId);
      return response.data;
    },
    enabled: !!adminId,
  });
};

export const useAdminPermissionsOperations = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  const updatePermissions = useMutation({
    mutationFn: async ({ adminId, data }: { adminId: UUID; data: any }) => 
      (await PermissionsRepository.updateAdminPermissions(adminId, data)).data,
    onSuccess: (_, { adminId }) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "permissions", adminId] });
      showToast("Permissions updated", "success");
    },
    onError: (e: Error) => showToast(e.message || "Failed to update permissions", "error"),
  });

  const setPreset = useMutation({
    mutationFn: async ({ adminId, data }: { adminId: UUID; data: any }) => 
      (await PermissionsRepository.setPermissionPreset(adminId, data)).data,
    onSuccess: (_, { adminId }) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "permissions", adminId] });
      showToast("Permission preset applied", "success");
    },
    onError: (e: Error) => showToast(e.message || "Failed to apply preset", "error"),
  });

  const revokeAll = useMutation({
    mutationFn: async (adminId: UUID) => (await PermissionsRepository.revokeAllPermissions(adminId)).data,
    onSuccess: (_, adminId) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "permissions", adminId] });
      showToast("All permissions revoked", "success");
    },
    onError: (e: Error) => showToast(e.message || "Failed to revoke permissions", "error"),
  });

  return { updatePermissions, setPreset, revokeAll };
};

// ============================================================================
// USER PERMISSIONS HOOKS (Managed by Admin)
// ============================================================================

export const usePermissionCategories = () => {
  return useQuery({
    queryKey: ["permissions", "categories"],
    queryFn: async () => {
      const response = await PermissionsRepository.getPermissionCategories();
      return response.data;
    },
  });
};

export const useUserPermissions = (userId: UUID) => {
  return useQuery({
    queryKey: ["permissions", "user", userId],
    queryFn: async () => {
      const response = await PermissionsRepository.getUserPermissions(userId);
      return response.data;
    },
    enabled: !!userId,
  });
};

export const useAllUserPermissions = () => {
  return useQuery({
    queryKey: ["permissions", "users", "all"],
    queryFn: async () => {
      const response = await PermissionsRepository.getAllUserPermissions();
      return response.data;
    },
  });
};

export const useUserPermissionsOperations = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  const updatePermissions = useMutation({
    mutationFn: async ({ userId, data }: { userId: UUID; data: any }) => 
      (await PermissionsRepository.updateUserPermissions(userId, data)).data,
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["permissions", "user", userId] });
      queryClient.invalidateQueries({ queryKey: ["permissions", "users", "all"] });
      showToast("User permissions updated", "success");
    },
    onError: (e: Error) => showToast(e.message || "Failed to update permissions", "error"),
  });

  const updateField = useMutation({
    mutationFn: async ({ userId, field, value }: { userId: UUID; field: string; value: any }) => 
      (await PermissionsRepository.updateUserPermissionField(userId, field, value)).data,
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["permissions", "user", userId] });
      showToast("Permission field updated", "success");
    },
    onError: (e: Error) => showToast(e.message || "Failed to update permission field", "error"),
  });

  const resetToDefaults = useMutation({
    mutationFn: async (userId: UUID) => (await PermissionsRepository.deleteUserPermissions(userId)).data,
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ["permissions", "user", userId] });
      showToast("User permissions reset to defaults", "success");
    },
    onError: (e: Error) => showToast(e.message || "Failed to reset permissions", "error"),
  });

  const bulkUpdate = useMutation({
    mutationFn: async (data: { userIds: UUID[]; permissions: any }) => 
      (await PermissionsRepository.bulkUpdateUserPermissions(data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions", "user"] });
      queryClient.invalidateQueries({ queryKey: ["permissions", "users", "all"] });
      showToast("Bulk permissions update successful", "success");
    },
    onError: (e: Error) => showToast(e.message || "Failed to bulk update permissions", "error"),
  });

  return { updatePermissions, updateField, resetToDefaults, bulkUpdate };
};
