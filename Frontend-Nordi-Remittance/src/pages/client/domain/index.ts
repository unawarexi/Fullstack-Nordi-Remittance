// ============================================================================
// Domain Barrel Export
// All domain use-case hooks re-exported from a single entry point
// ============================================================================

export * from "./useAccountsDomain";
export * from "./useTransactionsDomain";
export * from "./useCardsDomain";
export * from "./useLoansDomain";
export * from "./useInvestmentsDomain";
export * from "./useSavingsDomain";
export * from "./useSecurityDomain";
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
} from "./useProfileDomain";
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
} from "./useNotificationsDomain";
export * from "./useAuthDomain";
export * from "./useClientDashboard";
export * from "./useClientSpending";
