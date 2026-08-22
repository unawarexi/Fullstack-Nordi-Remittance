import React from "react";
import { UserCheck, Search, RotateCcw } from "lucide-react";
import { DashCard, SectionHeader } from "@components/shared/DashboardPrimitives";
import { SettingRow, ToggleSwitch } from "./PermissionToggle";

const userPermissionGroups = [
  {
    title: "Feature Access Toggles",
    keys: [
      "enableDomesticTransfers",
      "enableInternationalTransfers",
      "enableWalletToWallet",
      "enableCardPayments",
      "enableQrPayments",
      "enableCryptoTransfers",
      "enableScheduledTransfers",
      "enableBillPayments",
      "enableRequestMoney",
      "enableChequeRequest",
    ],
    descriptions: {
      enableDomesticTransfers: "Allow the user to send money domestically.",
      enableInternationalTransfers: "Allow the user to send international remittances.",
      enableWalletToWallet: "Allow the user to send money to other Nordi users.",
      enableCardPayments: "Allow the user to make payments using their Nordi card.",
      enableQrPayments: "Allow the user to use QR code payments.",
      enableCryptoTransfers: "Allow the user to send or receive cryptocurrency.",
      enableScheduledTransfers: "Allow the user to set up recurring transfers.",
      enableBillPayments: "Allow the user to pay utility bills.",
      enableRequestMoney: "Allow the user to send money requests to others.",
      enableChequeRequest: "Allow the user to request cheque books.",
    },
  },
  {
    title: "Security & Access Controls",
    keys: [
      "enable2fa",
      "transactionOtp",
      "allowLoginNewDevices",
      "locationBasedLogin",
      "ipWhitelisting",
      "allowApiAccess",
      "adminNotesEnabled",
    ],
    descriptions: {
      enable2fa: "Enforce Two-Factor Authentication for this user.",
      transactionOtp: "Require OTP for all outgoing transactions.",
      allowLoginNewDevices: "Allow the user to login from unrecognized devices.",
      locationBasedLogin: "Restrict login based on the user's registered location.",
      ipWhitelisting: "Only allow login from whitelisted IP addresses.",
      allowApiAccess: "Allow the user to generate and use API keys.",
      adminNotesEnabled: "Enable admin notes visibility for this account.",
    },
  },
  {
    title: "User Account Status & Controls",
    keys: [
      "canActivate",
      "canFreeze",
      "canBlock",
      "canLockOnSuspicious",
      "maintenanceMode",
      "notificationsEnabled",
      "forcePasswordReset",
      "allowAccountDeletion",
    ],
    descriptions: {
      canActivate: "Can the user activate their account? (Usually true)",
      canFreeze: "Can the user temporarily freeze their own account?",
      canBlock: "Can the user block their account if compromised?",
      canLockOnSuspicious: "Automatically lock the account on suspicious activity.",
      maintenanceMode: "Put this specific user in maintenance mode.",
      notificationsEnabled: "Enable all notifications for this user.",
      forcePasswordReset: "Force the user to reset their password on next login.",
      allowAccountDeletion: "Allow the user to self-delete their account.",
    },
  },
  {
    title: "Fund / Withdraw Controls",
    keys: [
      "canFundWallet",
      "canWithdraw",
      "canAdjustBalance",
      "canRevertTransaction",
      "canSendRefund",
      "canReprocessTransaction",
    ],
    descriptions: {
      canFundWallet: "Allow the user to deposit funds into their wallet.",
      canWithdraw: "Allow the user to withdraw funds to external accounts.",
      canAdjustBalance: "System toggle: allow automated balance adjustments.",
      canRevertTransaction: "System toggle: allow automated transaction reversion.",
      canSendRefund: "System toggle: allow automated refunds.",
      canReprocessTransaction: "System toggle: allow automated reprocessing.",
    },
  },
];

interface UserPermissionsTabProps {
  users: any[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedUserId: string | null;
  setSelectedUserId: (id: string) => void;
  localUserPerms: Record<string, boolean>;
  toggleUserPerm: (key: string) => void;
  isUpdatingUser: boolean;
  handleResetUserPermissions: () => void;
}

export function UserPermissionsTab({
  users,
  searchQuery,
  setSearchQuery,
  selectedUserId,
  setSelectedUserId,
  localUserPerms,
  toggleUserPerm,
  isUpdatingUser,
  handleResetUserPermissions,
}: UserPermissionsTabProps) {
  const selectStyles =
    "w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none";

  return (
    <div className="space-y-6">
      {/* TOP CONTROLS */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* User Search & Selection */}
        <div className="lg:col-span-3">
          <DashCard>
            <SectionHeader title="Search User" subtitle="Find a user to toggle their features" />
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`${selectStyles} pl-10`}
                />
              </div>
              <select
                className={selectStyles}
                value={selectedUserId || ""}
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                <option value="" disabled>
                  Select a user...
                </option>
                {users?.map((user: any) => (
                  <option key={user?._id || user?.id || Math.random()} value={user?._id || user?.id || ""}>
                    {user?.firstName} {user?.lastName} ({user?.email})
                  </option>
                ))}
              </select>
            </div>
          </DashCard>
        </div>

        {/* Actions */}
        <div className="lg:col-span-1">
          <DashCard>
            <SectionHeader title="Actions" subtitle="Manage presets" />
            <div className="mt-4">
              <button
                disabled={!selectedUserId}
                onClick={handleResetUserPermissions}
                className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3 text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <span className="text-sm font-medium">Reset to Defaults</span>
                <RotateCcw size={16} />
              </button>
            </div>
          </DashCard>
        </div>
      </div>

      {/* PERMISSIONS GRID */}
      <DashCard>
        {!selectedUserId ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <UserCheck size={48} className="mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-lg font-medium text-gray-900 dark:text-white">No User Selected</p>
            <p className="text-sm">Search and select a user above to manage their feature access.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {userPermissionGroups.map((group) => (
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
                        enabled={!!localUserPerms[key]}
                        onChange={() => toggleUserPerm(key)}
                        disabled={isUpdatingUser}
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
