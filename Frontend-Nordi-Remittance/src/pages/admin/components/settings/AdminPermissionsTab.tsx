import React from "react";
import { Shield, User, Search, AlertTriangle } from "lucide-react";
import { DashCard, SectionHeader } from "@components/shared/DashboardPrimitives";
import { SettingRow, ToggleSwitch } from "./PermissionToggle";

const adminPermissionGroups = [
  {
    title: "User Management",
    keys: ["canViewUsers", "canEditUsers", "canSuspendUsers", "canDeleteUsers", "canVerifyKyc"],
    descriptions: {
      canViewUsers: "Allows the admin to view user profiles and data.",
      canEditUsers: "Allows the admin to modify user details.",
      canSuspendUsers: "Allows the admin to suspend or block users.",
      canDeleteUsers: "Allows the admin to permanently delete users.",
      canVerifyKyc: "Allows the admin to approve or reject KYC documents.",
    },
  },
  {
    title: "Transaction Management",
    keys: ["canViewTransactions", "canReverseTransactions", "canRefundTransactions", "canAdjustBalances"],
    descriptions: {
      canViewTransactions: "Allows the admin to view all platform transactions.",
      canReverseTransactions: "Allows the admin to reverse completed transactions.",
      canRefundTransactions: "Allows the admin to initiate refunds to users.",
      canAdjustBalances: "Allows the admin to manually credit or debit user wallets.",
    },
  },
  {
    title: "Financial Operations",
    keys: ["canManageLoans", "canApproveLoans", "canManageInvestments", "canManageCards"],
    descriptions: {
      canManageLoans: "Allows the admin to view and manage loan products.",
      canApproveLoans: "Allows the admin to approve or reject loan applications.",
      canManageInvestments: "Allows the admin to configure investment offerings.",
      canManageCards: "Allows the admin to manage physical and virtual cards.",
    },
  },
  {
    title: "Fraud & Security",
    keys: ["canViewFraudCases", "canManageFraudCases", "canBlockAccounts", "canAccessSecurityLogs"],
    descriptions: {
      canViewFraudCases: "Allows the admin to view flagged fraud cases.",
      canManageFraudCases: "Allows the admin to take action on fraud alerts.",
      canBlockAccounts: "Allows the admin to freeze suspicious accounts immediately.",
      canAccessSecurityLogs: "Allows the admin to view system audit and security logs.",
    },
  },
  {
    title: "System Configuration",
    keys: ["canManageSettings", "canManageAdmins", "canViewReports", "canExportData"],
    descriptions: {
      canManageSettings: "Allows the admin to modify global system settings.",
      canManageAdmins: "Allows the admin to create or manage other admins.",
      canViewReports: "Allows the admin to view analytics and reports.",
      canExportData: "Allows the admin to export system data.",
    },
  },
  {
    title: "Support",
    keys: ["canManageTickets", "canViewCustomerData"],
    descriptions: {
      canManageTickets: "Allows the admin to handle customer support tickets.",
      canViewCustomerData: "Allows the admin to access sensitive customer data for support.",
    },
  },
];

interface AdminPermissionsTabProps {
  admins: any[];
  selectedAdminId: string | null;
  setSelectedAdminId: (id: string) => void;
  localAdminPerms: Record<string, boolean>;
  toggleAdminPerm: (key: string) => void;
  isUpdatingAdmin: boolean;
  applyAdminPreset: (preset: "full" | "readonly" | "support") => void;
  handleRevokeAll: () => void;
}

export function AdminPermissionsTab({
  admins,
  selectedAdminId,
  setSelectedAdminId,
  localAdminPerms,
  toggleAdminPerm,
  isUpdatingAdmin,
  applyAdminPreset,
  handleRevokeAll,
}: AdminPermissionsTabProps) {
  const selectStyles =
    "w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none";

  return (
    <div className="space-y-6">
      {/* TOP CONTROLS */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Admin Selection */}
        <div className="lg:col-span-2">
          <DashCard>
            <SectionHeader title="Select Admin" subtitle="Choose an admin to manage their permissions" />
            <div className="mt-4">
              <select
                className={selectStyles}
                value={selectedAdminId || ""}
                onChange={(e) => setSelectedAdminId(e.target.value)}
              >
                <option value="" disabled>
                  Select an admin...
                </option>
                {admins?.map((admin: any) => (
                  <option key={admin?._id || admin?.id || Math.random()} value={admin?._id || admin?.id || ""}>
                    {admin?.firstName} {admin?.lastName} ({admin?.email})
                  </option>
                ))}
              </select>
            </div>
          </DashCard>
        </div>

        {/* Quick Presets */}
        <div className="lg:col-span-2">
          <DashCard>
            <SectionHeader title="Quick Presets" subtitle="Apply predefined permission sets" />
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <button
                disabled={!selectedAdminId}
                onClick={() => applyAdminPreset("full")}
                className="flex flex-col items-center justify-center gap-2 rounded-lg border border-indigo-100 bg-indigo-50/50 p-3 text-indigo-700 transition-colors hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-indigo-900/30 dark:bg-indigo-900/10 dark:text-indigo-400 dark:hover:bg-indigo-900/30"
              >
                <Shield size={16} />
                <span className="text-xs font-medium">Full Access</span>
              </button>
              <button
                disabled={!selectedAdminId}
                onClick={() => applyAdminPreset("support")}
                className="flex flex-col items-center justify-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50/50 p-3 text-emerald-700 transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-emerald-900/30 dark:bg-emerald-900/10 dark:text-emerald-400 dark:hover:bg-emerald-900/30"
              >
                <User size={16} />
                <span className="text-xs font-medium">Support Agent</span>
              </button>
              <button
                disabled={!selectedAdminId}
                onClick={() => applyAdminPreset("readonly")}
                className="flex flex-col items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <Search size={16} />
                <span className="text-xs font-medium">Read Only</span>
              </button>
              <button
                disabled={!selectedAdminId}
                onClick={handleRevokeAll}
                className="flex flex-col items-center justify-center gap-2 rounded-lg border border-rose-100 bg-rose-50/50 p-3 text-rose-700 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-rose-900/30 dark:bg-rose-900/10 dark:text-rose-400 dark:hover:bg-rose-900/30"
              >
                <AlertTriangle size={16} />
                <span className="text-xs font-medium">Revoke All</span>
              </button>
            </div>
          </DashCard>
        </div>
      </div>

      {/* PERMISSIONS GRID */}
      <DashCard>
        {!selectedAdminId ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Shield size={48} className="mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-lg font-medium text-gray-900 dark:text-white">No Admin Selected</p>
            <p className="text-sm">Select an admin above to manage their permissions.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {adminPermissionGroups.map((group) => (
              <div key={group.title} className="rounded-xl border border-gray-100 p-4 dark:border-gray-800">
                <SectionHeader title={group.title} />
                <div className="mt-2">
                  {group.keys.map((key) => (
                    <SettingRow
                      key={key}
                      label={key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                      description={(group.descriptions as any)[key]}
                    >
                      <ToggleSwitch
                        enabled={!!localAdminPerms[key]}
                        onChange={() => toggleAdminPerm(key)}
                        disabled={isUpdatingAdmin}
                      />
                    </SettingRow>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </DashCard>
    </div>
  );
}
