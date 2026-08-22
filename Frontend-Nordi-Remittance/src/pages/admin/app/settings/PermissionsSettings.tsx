import React, { useEffect } from "react";
import { Shield, UserCheck } from "lucide-react";
import { PageContainer } from "@components/shared/DashboardPrimitives";
import { PageHeader } from "@components/shared/PageHeader";
import { useToast } from "@store/toast.store";
import { useAdminPermissionsUseCase } from "../../admin-usecase/useadmin-permissions-usecase";
import { useAdminPermissions, useUserPermissions } from "../../../../hooks/api-queries/usePermissions";
import { AdminPermissionsTab } from "../../components/settings/AdminPermissionsTab";
import { UserPermissionsTab } from "../../components/settings/UserPermissionsTab";
import { usePermissionsStore } from "../../../../store/permissions.store";

export default function PermissionsSettings() {
  const toast = useToast();
  
  const {
    activeTab,
    setActiveTab,
    localAdminPerms,
    setLocalAdminPerms,
    localUserPerms,
    setLocalUserPerms
  } = usePermissionsStore();

  const {
    admins,
    users,
    searchQuery,
    setSearchQuery,
    selectedAdminId,
    setSelectedAdminId,
    selectedUserId,
    setSelectedUserId,
    handleUpdateAdminPermissions,
    handleToggleUserFeature,
    handleApplyPreset,
    handleRevokeAllAdminPermissions,
    handleResetUserPermissions,
    isUpdatingAdmin,
    isUpdatingUser,
  } = useAdminPermissionsUseCase();

  // Fetch actual permissions for selected targets
  const { data: adminPermsData } = useAdminPermissions(selectedAdminId as any);
  const { data: userPermsData } = useUserPermissions(selectedUserId as any);

  // Sync selected admin's permissions to local state
  useEffect(() => {
    if (selectedAdminId && adminPermsData?.permissions) {
      setLocalAdminPerms(adminPermsData.permissions as Record<string, boolean>);
    } else {
      setLocalAdminPerms({});
    }
  }, [selectedAdminId, adminPermsData]);

  // Sync selected user's permissions to local state
  useEffect(() => {
    if (selectedUserId && userPermsData?.permissions) {
      setLocalUserPerms(userPermsData.permissions as Record<string, boolean>);
    } else {
      setLocalUserPerms({});
    }
  }, [selectedUserId, userPermsData]);

  const toggleAdminPerm = async (key: string) => {
    if (!selectedAdminId) {
      toast.error("Please select an admin first");
      return;
    }
    const newValue = !localAdminPerms[key];
    setLocalAdminPerms((prev) => ({ ...prev, [key]: newValue }));
    await handleUpdateAdminPermissions(selectedAdminId, { [key]: newValue });
  };

  const toggleUserPerm = async (key: string) => {
    if (!selectedUserId) {
      toast.error("Please select a user first");
      return;
    }
    const newValue = !localUserPerms[key];
    setLocalUserPerms((prev) => ({ ...prev, [key]: newValue }));
    await handleToggleUserFeature(selectedUserId, key as any, newValue);
  };

  const applyAdminPreset = async (preset: "full" | "readonly" | "support") => {
    if (!selectedAdminId) return;
    await handleApplyPreset(selectedAdminId, preset);
    toast.success(`Applied ${preset} preset`);
  };

  const handleRevokeAll = async () => {
    if (!selectedAdminId) return;
    await handleRevokeAllAdminPermissions(selectedAdminId);
    toast.info("All permissions revoked");
  };

  const handleResetUser = async () => {
    if (!selectedUserId) return;
    await handleResetUserPermissions(selectedUserId);
    toast.success("User permissions reset to default");
  };

  return (
    <PageContainer>
      <PageHeader
        title="Permissions & Roles"
        subtitle="Manage access controls, feature toggles, and administrative roles"
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Settings", href: "/admin/settings" },
          { label: "Permissions" },
        ]}
      />

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-gray-200 pb-2 dark:border-gray-800">
        <button
          onClick={() => setActiveTab("admin")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "admin"
              ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
              : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          }`}
        >
          <Shield size={16} />
          Admin Roles
        </button>
        <button
          onClick={() => setActiveTab("user")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "user"
              ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
              : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          }`}
        >
          <UserCheck size={16} />
          User Toggles
        </button>
      </div>

      {/* Admin Tab */}
      <div className={activeTab === "admin" ? "block" : "hidden"}>
        <AdminPermissionsTab
          admins={admins}
          selectedAdminId={selectedAdminId}
          setSelectedAdminId={setSelectedAdminId}
          localAdminPerms={localAdminPerms}
          toggleAdminPerm={toggleAdminPerm}
          isUpdatingAdmin={isUpdatingAdmin}
          applyAdminPreset={applyAdminPreset}
          handleRevokeAll={handleRevokeAll}
        />
      </div>

      {/* User Tab */}
      <div className={activeTab === "user" ? "block" : "hidden"}>
        <UserPermissionsTab
          users={users}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedUserId={selectedUserId}
          setSelectedUserId={setSelectedUserId}
          localUserPerms={localUserPerms}
          toggleUserPerm={toggleUserPerm}
          isUpdatingUser={isUpdatingUser}
          handleResetUserPermissions={handleResetUser}
        />
      </div>
    </PageContainer>
  );
}
