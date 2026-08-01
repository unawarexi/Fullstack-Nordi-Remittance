// ============================================================================
// Domain Barrel Export
// All domain use-case hooks re-exported from a single entry point
// ============================================================================

export * from "./useaccounts-client-usecase";
export * from "./usetransaction-client-usecase";
export * from "./useCards-client-usecase";
export * from "./useloans-client-usecase";
export * from "./useinvestments-client-usecase";
export * from "./usesavinga-client-usecase";
export * from "./usesecurity-client-usecase";
export {
  useClientProfile,
  useClientAddress,
  useClientEmployment,
  useClientBankAccounts,
  useClientNotificationPreferences,
  useClientReferralStats,
  useClientReferredUsers,
  useUpdateProfile,
  useUpdateAvatar,
  useDeleteAvatar,
  useUpdateAddress,
  useUpdateEmployment,
  useAddBankAccount,
  useUpdateBankAccount,
  useDeleteBankAccount,
  useSetPrimaryBankAccount,
  useVerifyBankAccount,
  useUpdateUserNotificationPreferences,
  useDeleteUserAccount,
  useExportUserData,
} from "./useprofile-client-usecase";
export {
  useClientNotifications,
  useClientNotification,
  useClientUnreadCount,
  useClientUnreadNotifications,
  useClientNotificationPreferences as useClientNotifPreferences,
  useMarkNotificationAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  useDeleteAllReadNotifications,
  useUpdateNotificationPreferences,
  useRegisterPushToken,
  useUnregisterPushToken,
  useSendTestNotification,
} from "./usenotification-client-usecase";
export * from "./useauth-client-usecase";
export * from "./usedashboard-client-usecase";
export * from "./usespending-client-usecase";
