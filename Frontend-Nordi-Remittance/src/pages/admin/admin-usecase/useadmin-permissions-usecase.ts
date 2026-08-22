import { useState, useMemo } from 'react';
import {
  useAdminAvailablePermissions,
  useAdminPermissionsOperations,
  usePermissionCategories,
  useUserPermissionsOperations,
  useAllUserPermissions,
} from '../../../hooks/api-queries/usePermissions';
import { useAdminUsersList, useSearchUsers } from '../../../hooks/api-queries/useAdmin';
import { useToastStore } from '../../../store/toast.store';
import { usePermissionsStore } from '../../../store/permissions.store';

export const useAdminPermissionsUseCase = () => {
  const { showToast } = useToastStore();

  // --------------------------------------------------------------------------
  // STATE MANAGEMENT
  // --------------------------------------------------------------------------
  const {
    selectedAdminId,
    setSelectedAdminId,
    selectedUserId,
    setSelectedUserId,
    adminPage,
    setAdminPage,
    userPage,
    setUserPage,
    searchQuery,
    setSearchQuery,
  } = usePermissionsStore();

  // --------------------------------------------------------------------------
  // ADMIN PERMISSIONS (What other admins can do)
  // --------------------------------------------------------------------------
  
  // Queries
  const { 
    data: adminsData, 
    isLoading: isLoadingAdmins 
  } = useAdminUsersList({ page: adminPage, search: searchQuery });

  const { 
    data: availableAdminPermissionsData, 
    isLoading: isLoadingAvailableAdminPermissions 
  } = useAdminAvailablePermissions();

  // Mutations
  const { 
    updatePermissions: updateAdminPermissions, 
    setPreset, 
    revokeAll 
  } = useAdminPermissionsOperations();

  // Admin Permission Handlers
  const handleUpdateAdminPermissions = async (adminId: UUID, permissions: Partial<AdminPermissions>) => {
    try {
      await updateAdminPermissions.mutateAsync({ adminId, data: permissions });
    } catch (error) {
      console.error('Failed to update admin permissions:', error);
    }
  };

  const handleApplyPreset = async (adminId: UUID, preset: 'full' | 'limited' | 'readonly' | 'support' | 'compliance') => {
    try {
      await setPreset.mutateAsync({ adminId, data: { preset } });
    } catch (error) {
      console.error('Failed to apply preset:', error);
    }
  };

  const handleRevokeAllAdminPermissions = async (adminId: UUID) => {
    try {
      await revokeAll.mutateAsync(adminId);
    } catch (error) {
      console.error('Failed to revoke admin permissions:', error);
    }
  };


  // --------------------------------------------------------------------------
  // USER PERMISSIONS (What users can do, managed by admins)
  // --------------------------------------------------------------------------

  // Queries
  const { 
    data: usersData, 
    isLoading: isLoadingUsers 
  } = useSearchUsers({ page: userPage, search: searchQuery });

  const { 
    data: userPermissionCategoriesData, 
    isLoading: isLoadingCategories 
  } = usePermissionCategories();

  // Mutations
  const { 
    updatePermissions: updateUserPermissions, 
    updateField: updateUserPermissionField,
    resetToDefaults,
    bulkUpdate
  } = useUserPermissionsOperations();

  // User Permission Handlers
  const handleUpdateUserPermissions = async (userId: UUID, permissions: Partial<UserPermissions>) => {
    try {
      await updateUserPermissions.mutateAsync({ userId, data: permissions });
    } catch (error) {
      console.error('Failed to update user permissions:', error);
    }
  };

  const handleToggleUserFeature = async (userId: UUID, field: keyof UserPermissions, value: boolean) => {
    try {
      await updateUserPermissionField.mutateAsync({ userId, field: field as string, value });
    } catch (error) {
      console.error('Failed to toggle user feature:', error);
    }
  };

  const handleResetUserPermissions = async (userId: UUID) => {
    try {
      await resetToDefaults.mutateAsync(userId);
    } catch (error) {
      console.error('Failed to reset user permissions:', error);
    }
  };

  const handleBulkUpdateUserPermissions = async (userIds: UUID[], permissions: Partial<UserPermissions>) => {
    try {
      await bulkUpdate.mutateAsync({ userIds, permissions });
    } catch (error) {
      console.error('Failed to bulk update user permissions:', error);
    }
  };


  // --------------------------------------------------------------------------
  // EXPORTS
  // --------------------------------------------------------------------------
  return {
    // State & Setters
    selectedAdminId,
    setSelectedAdminId,
    selectedUserId,
    setSelectedUserId,
    adminPage,
    setAdminPage,
    userPage,
    setUserPage,
    searchQuery,
    setSearchQuery,

    // Admin Perms
    admins: (adminsData?.data as any)?.data || (Array.isArray(adminsData?.data) ? adminsData.data : []),
    isLoadingAdmins,
    availableAdminPermissions: availableAdminPermissionsData?.permissions || {},
    isLoadingAvailableAdminPermissions,
    
    // Admin Handlers
    handleUpdateAdminPermissions,
    handleApplyPreset,
    handleRevokeAllAdminPermissions,
    isUpdatingAdmin: updateAdminPermissions.isPending || setPreset.isPending || revokeAll.isPending,

    // User Perms
    users: (usersData?.data as any)?.data || (Array.isArray(usersData?.data) ? usersData.data : []),
    isLoadingUsers,
    userPermissionCategories: userPermissionCategoriesData?.categories || {},
    isLoadingCategories,

    // User Handlers
    handleUpdateUserPermissions,
    handleToggleUserFeature,
    handleResetUserPermissions,
    handleBulkUpdateUserPermissions,
    isUpdatingUser: updateUserPermissions.isPending || updateUserPermissionField.isPending || resetToDefaults.isPending || bulkUpdate.isPending,
  };
};

export default useAdminPermissionsUseCase;
