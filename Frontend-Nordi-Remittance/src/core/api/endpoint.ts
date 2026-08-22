// ============================================================================
// ENDPOINTS - Centralized API endpoint paths matching backend routes.
//
// Audited against: module-registry.ts + all *.routes.ts files (2026-07-31).
// ============================================================================

export class ApiEndpoints {
  private constructor() {}

  // ──────────── Auth ────────────
  static readonly authLogin = "/auth/login";
  static readonly authRegister = "/auth/register";
  static readonly authRegisterFull = "/auth/register/full";
  static readonly authLogout = "/auth/logout";
  static readonly authRefresh = "/auth/refresh";
  static readonly authMe = "/auth/me";
  static readonly authForgotPassword = "/auth/forgot-password";
  static readonly authResetPassword = "/auth/reset-password";
  static readonly authVerifyEmail = "/auth/verify-email";
  static readonly authResendVerification = "/auth/resend-verification";
  static readonly authVerify2fa = "/auth/verify-2fa";
  static readonly authChangePassword = "/auth/change-password";
  // Clerk-based auth
  static readonly authClerkSync = "/auth/clerk-sync";
  static readonly authClerkSyncAdmin = "/auth/clerk-sync/admin";
  static readonly authVerifyClerkOtp = "/auth/verify-clerk-otp";
  static readonly authResendClerkOtp = "/auth/resend-clerk-otp";
  static readonly authClerkWebhook = "/auth/clerk-webhook"; // Svix-signed webhook, not called from client apps

  // ──────────── Users ────────────
  static readonly userProfile = "/users/profile"; // GET / PATCH
  static readonly userUpdateEmail = "/users/update-email";
  static readonly userConfirmEmailChange = "/users/confirm-email-change";
  static readonly userUpdatePhone = "/users/update-phone";
  static readonly userConfirmPhoneChange = "/users/confirm-phone-change";
  static readonly userEnable2fa = "/users/enable-2fa";
  static readonly userVerify2faSetup = "/users/verify-2fa-setup";
  static readonly userDisable2fa = "/users/disable-2fa";
  static readonly userActivity = "/users/activity";
  static readonly userNotifications = "/users/notifications";
  static readonly userNotificationsReadAll = "/users/notifications/read-all";
  static readonly userDeleteAccount = "/users/delete-account";
  static readonly userConfirmDeletion = "/users/confirm-deletion";
  static userNotificationRead(id: string) {
    return `/users/notifications/${id}/read`;
  }

  // Admin (user management — mounted under /users, requires admin role)
  static readonly userAdminList = "/users"; // GET (list all) / DELETE (delete all)
  static userAdminById(id: string) {
    return `/users/${id}`;
  } // GET / PUT / PATCH / DELETE
  static userAdminStatus(id: string) {
    return `/users/${id}/status`;
  }
  static userAdminKyc(id: string) {
    return `/users/${id}/kyc`;
  }

  // ──────────── KYC ────────────
  static readonly kycStatus = "/kyc/status";
  static readonly kycRequirements = "/kyc/requirements";
  static readonly kycDocuments = "/kyc/documents";
  static kycDocument(id: string) {
    return `/kyc/documents/${id}`;
  } // GET / DELETE
  static readonly kycUploadIdentity = "/kyc/documents/identity"; // corrected, was '/kyc/submit/identity'
  static readonly kycUploadAddress = "/kyc/documents/address"; // corrected, was '/kyc/submit/address'
  static readonly kycUploadSelfie = "/kyc/documents/selfie"; // corrected, was '/kyc/submit/selfie'
  static readonly kycVerify = "/kyc/verify";
  static kycVerificationStatus(verificationId: string) {
    return `/kyc/verify/${verificationId}`;
  }
  static readonly kycReverify = "/kyc/reverify";
  // Admin
  static readonly kycAdminStats = "/kyc/admin/stats";
  static readonly kycAdminPending = "/kyc/admin/pending";
  static kycAdminUser(userId: string) {
    return `/kyc/admin/users/${userId}`;
  }
  static kycAdminReview(userId: string) {
    return `/kyc/admin/users/${userId}/review`;
  }

  // ──────────── Accounts & Wallets ────────────

  static readonly accountWallets = "/accounts/wallets"; // GET (list) / POST (create)
  static accountWallet(id: string) {
    return `/accounts/wallets/${id}`;
  } // GET / PATCH
  static accountWalletClose(id: string) {
    return `/accounts/wallets/${id}/close`;
  }
  static accountWalletHistory(id: string) {
    return `/accounts/wallets/${id}/history`;
  }
  static readonly accountWalletsClosed = "/accounts/wallets/closed"; // GET

  // Wallet Products / Linking
  static accountWalletProducts(walletId: string) {
    return `/accounts/wallets/${walletId}/products`;
  }
  static accountWalletCardLink(walletId: string, cardId: string) {
    return `/accounts/wallets/${walletId}/cards/${cardId}/link`;
  }
  static accountWalletCardUnlink(walletId: string, cardId: string) {
    return `/accounts/wallets/${walletId}/cards/${cardId}/unlink`;
  }
  static accountCardFundingSource(cardId: string) {
    return `/accounts/cards/${cardId}/funding-source`;
  }

  // Limits / Score
  static readonly accountLimits = "/accounts/limits";
  static readonly accountConsolidatedLimits = "/accounts/consolidated-limits";
  static readonly accountCreditScore = "/accounts/credit-score";

  static readonly accountSummary = "/accounts/summary";
  static readonly accountBeneficiaries = "/accounts/beneficiaries"; // GET / POST
  static accountBeneficiary(id: string) {
    return `/accounts/beneficiaries/${id}`;
  } // DELETE

  // Applications
  static readonly accountApplications = "/accounts/applications";
  static readonly accountApplicationsApply = "/accounts/applications/apply";
  static accountApplicationCancel(id: string) {
    return `/accounts/applications/${id}/cancel`;
  }

  // Admin
  static readonly accountAdminWallets = "/accounts/admin/wallets";
  static accountAdminWalletStatus(id: string) {
    return `/accounts/admin/wallets/${id}/status`;
  }
  // Admin — account applications (via admin-operations router)
  static readonly accountAdminApplicationsPending = "/admin/operations/accounts/applications/pending";
  static accountAdminApplicationApprove(id: string) {
    return `/admin/operations/accounts/applications/${id}/approve`;
  }
  static accountAdminApplicationReject(id: string) {
    return `/admin/operations/accounts/applications/${id}/reject`;
  }

  // ──────────── Transactions ────────────
  static readonly transactions = "/transactions";
  static readonly transactionsTransfer = "/transactions/transfer";
  static readonly transactionsDeposit = "/transactions/deposit";
  static readonly transactionsWithdraw = "/transactions/withdraw";
  static readonly transactionsStats = "/transactions/stats";
  static transaction(id: string) {
    return `/transactions/${id}`;
  }
  static transactionByReference(reference: string) {
    return `/transactions/reference/${reference}`;
  }
  static transactionCancel(id: string) {
    return `/transactions/${id}/cancel`;
  }
  // Admin
  static readonly transactionsAdminAll = "/transactions/admin/all";
  static transactionAdminStatus(id: string) {
    return `/transactions/admin/${id}/status`;
  }

  // ──────────── Secure Transfer (3-step verification) ────────────
  static readonly secureTransferInitiate = "/transactions/secure-transfer/initiate";
  static readonly secureTransferRequestCode = "/transactions/secure-transfer/request-code";
  static readonly secureTransferVerifyCode = "/transactions/secure-transfer/verify-code";
  static secureTransferStatus(verificationId: string) {
    return `/transactions/secure-transfer/status/${verificationId}`;
  }
  static readonly secureTransferCancel = "/transactions/secure-transfer/cancel";
  static readonly secureTransferPending = "/transactions/secure-transfer/pending";

  // ──────────── Cards ────────────
  static readonly cards = "/cards";
  static readonly cardsCreateVirtual = "/cards/virtual";
  static readonly cardsRequestPhysical = "/cards/physical"; // aliased at /cards/physical/request too
  static card(id: string) {
    return `/cards/${id}`;
  }
  static cardDetails(id: string) {
    return `/cards/${id}/details`;
  } // POST
  static cardTransactions(id: string) {
    return `/cards/${id}/transactions`;
  }
  static cardFund(id: string) {
    return `/cards/${id}/fund`;
  }
  static cardWithdraw(id: string) {
    return `/cards/${id}/withdraw`;
  }
  static cardActivate(id: string) {
    return `/cards/${id}/activate`;
  }
  static cardBlock(id: string) {
    return `/cards/${id}/block`;
  }
  static cardUnblock(id: string) {
    return `/cards/${id}/unblock`;
  }
  static cardFreeze(id: string) {
    return `/cards/${id}/freeze`;
  } // PATCH/POST toggles freeze state
  static cardCancel(id: string) {
    return `/cards/${id}/cancel`;
  }
  static cardReportLost(id: string) {
    return `/cards/${id}/report-lost`;
  }
  static cardLimits(id: string) {
    return `/cards/${id}/limits`;
  }
  static cardControls(id: string) {
    return `/cards/${id}/controls`;
  }
  static cardChangePin(id: string) {
    return `/cards/${id}/change-pin`;
  } // aliased at /cards/${id}/pin/change

  // Admin
  static readonly cardsAdminAll = "/cards/admin/all";
  static readonly cardsAdminApplications = "/cards/admin/applications";
  static cardAdminFund(id: string) {
    return `/cards/admin/${id}/fund`;
  }
  static cardAdminWithdraw(id: string) {
    return `/cards/admin/${id}/withdraw`;
  }
  static cardAdminUpgradeLimit(id: string) {
    return `/cards/admin/${id}/upgrade-limit`;
  }
  static cardAdminApprove(id: string) {
    return `/cards/admin/${id}/approve`;
  }
  static cardAdminReject(id: string) {
    return `/cards/admin/${id}/reject`;
  } // aliased at /decline
  static cardAdminStatus(id: string) {
    return `/cards/admin/${id}/status`;
  }

  // ──────────── Loans ────────────
  static readonly loans = "/loans";
  static readonly loansApply = "/loans/apply";
  static readonly loansApplications = "/loans/applications";
  static readonly loansEligibility = "/loans/eligibility/check"; // corrected, was '/loans/eligibility'
  static loan(id: string) {
    return `/loans/${id}`;
  }
  static loanPay(id: string) {
    return `/loans/${id}/pay`;
  } // corrected, was loanRepay → '/repay'
  static loanSchedule(id: string) {
    return `/loans/${id}/schedule`;
  }

  // Admin
  static readonly loansAdminApplications = "/loans/admin/applications";
  static loanAdminReview(applicationId: string) {
    return `/loans/admin/applications/${applicationId}/review`;
  }
  static loanAdminDisburse(id: string) {
    return `/loans/admin/${id}/disburse`;
  }

  // ──────────── Investments ────────────

  static readonly investmentsSavings = "/investments/savings"; // GET / POST
  static investmentSavingsDeposit(goalId: string) {
    return `/investments/savings/${goalId}/deposit`;
  }
  static investmentSavingsWithdraw(goalId: string) {
    return `/investments/savings/${goalId}/withdraw`;
  }
  static investmentSavingsGoal(goalId: string) {
    return `/investments/savings/${goalId}`;
  } // DELETE
  static readonly investmentsAccount = "/investments/account"; // GET / POST
  static readonly investmentsPortfolio = "/investments/portfolio";
  static readonly investmentsPortfolioTransactions = "/investments/portfolio/transactions";
  static readonly investmentsSummary = "/investments/summary";
  static readonly investmentsAssets = "/investments/assets";
  static investmentAsset(id: string) {
    return `/investments/assets/${id}`;
  }
  static readonly investmentsBuy = "/investments/buy"; // corrected, was '/investments/assets/:id/buy'
  static readonly investmentsSell = "/investments/sell"; // corrected, was '/investments/assets/:id/sell'
  static readonly investmentsPlans = "/investments/plans";

  // ──────────── Admin ────────────
  static readonly adminLogin = "/admin/login";
  static readonly adminLogout = "/admin/logout";
  static readonly adminDashboard = "/admin/dashboard";
  static readonly adminAnalytics = "/admin/analytics";
  static readonly adminUsersSearch = "/admin/users/search";
  static readonly adminUsers = "/admin/users"; // DELETE = delete all users
  static adminUser(id: string) {
    return `/admin/users/${id}`;
  } // GET / PUT / PATCH / DELETE
  static adminUserStatus(id: string) {
    return `/admin/users/${id}/status`;
  }
  static adminUserResetPassword(id: string) {
    return `/admin/users/${id}/reset-password`;
  }
  static readonly adminAdmins = "/admin/admins"; // GET / POST — super admin
  static adminAdminUser(adminId: string) {
    return `/admin/admins/${adminId}`;
  } // PUT / DELETE — super admin
  static readonly adminSettings = "/admin/settings";
  static adminSetting(key: string) {
    return `/admin/settings/${key}`;
  } // super admin
  static readonly adminAuditLogs = "/admin/audit-logs";
  static readonly adminTasks = "/admin/tasks"; // GET / POST
  static adminTask(taskId: string) {
    return `/admin/tasks/${taskId}`;
  }
  static readonly adminProfile = "/admin/profile"; // GET / PUT
  static readonly adminRequestOtp = "/admin/request-otp";
  static readonly adminChangePassword = "/admin/change-password";
  static readonly adminChangeEmail = "/admin/change-email";
  // ──────────── Admin (Super Admin) Permissions ────────────
  static readonly adminPermissionsAvailable = "/admin/permissions/available";
  static adminAdminPermissions(adminId: string) {
    return `/admin/admins/${adminId}/permissions`;
  } // GET / PUT / DELETE — super admin
  static adminAdminPermissionsPreset(adminId: string) {
    return `/admin/admins/${adminId}/permissions/preset`;
  } // super admin

  // ──────────── User Permissions (Managed by Admin) ────────────
  static readonly permissionsUsers = "/permissions/users"; // GET all
  static permissionsUser(userId: string) {
    return `/permissions/users/${userId}`;
  } // GET / PUT / DELETE
  static permissionsUserField(userId: string) {
    return `/permissions/users/${userId}/field`;
  } // PATCH
  static readonly permissionsCategories = "/permissions/categories"; // GET
  static readonly permissionsBulkUpdate = "/permissions/users/bulk"; // POST

  // ──────────── Admin Operations (admin-initiated financial ops) ────────────
  static readonly adminOpsCredit = "/admin/operations/credit";
  static readonly adminOpsDebit = "/admin/operations/debit";
  static readonly adminOpsTransfer = "/admin/operations/transfer";
  static adminOpsLoanApprove(loanId: string) {
    return `/admin/operations/loans/${loanId}/approve`;
  }
  static adminOpsLoanReject(loanId: string) {
    return `/admin/operations/loans/${loanId}/reject`;
  }
  static adminOpsLoanDisburse(loanId: string) {
    return `/admin/operations/loans/${loanId}/disburse`;
  }
  static adminOpsCardApprove(cardId: string) {
    return `/admin/operations/cards/${cardId}/approve`;
  }
  static adminOpsCardReject(cardId: string) {
    return `/admin/operations/cards/${cardId}/reject`;
  }
  static adminOpsCardFundFromWallet(cardId: string) {
    return `/admin/operations/cards/${cardId}/fund-from-wallet`;
  }
  static adminOpsInvestmentApprove(investmentId: string) {
    return `/admin/operations/investments/${investmentId}/approve`;
  }
  static adminOpsInvestmentAddReturns(investmentId: string) {
    return `/admin/operations/investments/${investmentId}/add-returns`;
  }
  static readonly adminOpsTransactionsPending = "/admin/operations/transactions/pending";
  static adminOpsTransactionApprove(transactionId: string) {
    return `/admin/operations/transactions/${transactionId}/approve`;
  }
  static adminOpsTransactionReject(transactionId: string) {
    return `/admin/operations/transactions/${transactionId}/reject`;
  }
  static adminOpsTransactionReverse(transactionId: string) {
    return `/admin/operations/transactions/${transactionId}/reverse`;
  }
  static readonly adminOpsBulkCredit = "/admin/operations/bulk/credit"; // super admin only

  // ──────────── Statistics & Analytics ────────────
  static readonly statisticsUser = "/statistics/user";
  static readonly statisticsTransactions = "/statistics/transactions";
  static readonly statisticsSpending = "/statistics/spending";
  // Admin
  static readonly statisticsPlatform = "/statistics/platform";
  static readonly statisticsGrowth = "/statistics/growth";
  static readonly statisticsDailyReport = "/statistics/reports/daily"; // POST, generates report

  // ──────────── Fraud ────────────
  static readonly fraudBehaviorProfile = "/fraud/behavior-profile";
  // Admin
  static readonly fraudSignals = "/fraud/signals";
  static fraudSignal(signalId: string) {
    return `/fraud/signals/${signalId}`;
  }
  static readonly fraudCases = "/fraud/cases"; // GET / POST
  static fraudCase(caseId: string) {
    return `/fraud/cases/${caseId}`;
  }
  static fraudCaseComments(caseId: string) {
    return `/fraud/cases/${caseId}/comments`;
  }
  static readonly fraudVelocityRules = "/fraud/velocity-rules"; // GET / POST
  static fraudVelocityRule(ruleId: string) {
    return `/fraud/velocity-rules/${ruleId}`;
  }
  static fraudUserBehaviorProfile(userId: string) {
    return `/fraud/users/${userId}/behavior-profile`;
  } // GET / PUT
  static readonly fraudSecurityEvents = "/fraud/security-events"; // GET / POST
  static readonly fraudAnalytics = "/fraud/analytics";

  // ──────────── Security ────────────
  static readonly securityScore = "/security/score"; // corrected, was 'securityStatus' → '/security/status'
  static readonly securitySettings = "/security/settings"; // GET / PUT
  static readonly securityAlerts = "/security/alerts"; // corrected, was 'securityEvents' → '/security/events'
  static readonly securityLoginHistory = "/security/login-history";
  static readonly securitySessions = "/security/sessions"; // GET / DELETE (revoke all)
  static securitySession(id: string) {
    return `/security/sessions/${id}`;
  } // DELETE
  static readonly security2faSetup = "/security/2fa/setup";
  static readonly security2faVerify = "/security/2fa/verify"; // corrected, was 'security2faEnable' → '/security/2fa/enable'
  static readonly security2faDisable = "/security/2fa/disable";
  static readonly security2faBackupCodes = "/security/2fa/backup-codes";
  static readonly securityTrustedDevices = "/security/trusted-devices"; // corrected, was 'securityDevices' → '/security/devices'; GET / POST
  static securityTrustedDevice(id: string) {
    return `/security/trusted-devices/${id}`;
  } // corrected, was 'securityDevice'; DELETE

  // ──────────── Notifications ────────────
  static readonly notifications = "/notifications"; // GET (list) / DELETE (delete all/filtered)
  static readonly notificationsUnread = "/notifications/unread-count";
  static readonly notificationsReadAll = "/notifications/read-all";
  static readonly notificationsSettings = "/notifications/settings"; // GET / PUT
  static readonly notificationsPushToken = "/notifications/push-token"; // POST
  static notification(id: string) {
    return `/notifications/${id}`;
  } // GET / DELETE
  static notificationRead(id: string) {
    return `/notifications/${id}/read`;
  }
  static notificationPushTokenRemove(deviceId: string) {
    return `/notifications/push-token/${deviceId}`;
  } // DELETE

  // ──────────── Attachments ────────────
  static readonly attachments = "/attachments"; // GET (list) / POST (upload)
  static readonly attachmentsCategories = "/attachments/categories";
  static attachment(id: string) {
    return `/attachments/${id}`;
  } // GET / PUT / DELETE
  static readonly attachmentsKycDocuments = "/attachments/kyc/documents"; // GET / POST
  // Admin
  static readonly attachmentsAdminAll = "/attachments/admin/all";
  static attachmentAdminUserKyc(userId: string) {
    return `/attachments/admin/users/${userId}/kyc`;
  }
  static attachmentAdminKycReview(documentId: string) {
    return `/attachments/admin/kyc/${documentId}/review`;
  }

  // ──────────── Legal ────────────
  static readonly legalDocuments = "/legal/documents"; // GET list (public) / POST create (admin)
  static legalDocument(id: string) {
    return `/legal/documents/${id}`;
  } // GET (public) / PUT (admin)
  static legalDocumentByType(type: string) {
    return `/legal/documents/type/${type}`;
  }
  static legalDocumentVersions(id: string) {
    return `/legal/documents/${id}/versions`;
  }
  static readonly legalConsents = "/legal/consents"; // GET / POST
  static legalConsentWithdraw(documentId: string) {
    return `/legal/consents/${documentId}`;
  } // DELETE
  static readonly legalConsentsRequired = "/legal/consents/required";
  static readonly legalDisputes = "/legal/disputes"; // GET / POST
  static legalDispute(claimId: string) {
    return `/legal/disputes/${claimId}`;
  }
  static legalDisputeComments(claimId: string) {
    return `/legal/disputes/${claimId}/comments`;
  }
  // Admin
  static readonly legalAdminDisputes = "/legal/admin/disputes";
  static legalAdminDispute(claimId: string) {
    return `/legal/admin/disputes/${claimId}`;
  }
  static readonly legalAdminRegulatory = "/legal/admin/regulatory"; // GET / POST
  static legalAdminRegulatorySubmit(filingId: string) {
    return `/legal/admin/regulatory/${filingId}/submit`;
  }

  // ──────────── Integrations ────────────
  static readonly integrationsExternalAccounts = "/integrations/external-accounts"; // user
  static integrationExternalAccountVerify(accountId: string) {
    return `/integrations/external-accounts/${accountId}/verify`;
  } // user
  // Admin
  static readonly integrations = "/integrations"; // GET / POST
  static integration(id: string) {
    return `/integrations/${id}`;
  } // GET / PUT / DELETE
  static integrationTest(id: string) {
    return `/integrations/${id}/test`;
  }
  static integrationLogs(id: string) {
    return `/integrations/${id}/logs`;
  }
  static readonly integrationsWebhooks = "/integrations/webhooks"; // GET / POST
  static integrationWebhook(webhookId: string) {
    return `/integrations/webhooks/${webhookId}`;
  } // PUT / DELETE
  static integrationWebhookRegenerateSecret(webhookId: string) {
    return `/integrations/webhooks/${webhookId}/regenerate-secret`;
  }
  static readonly integrationsApiKeys = "/integrations/api-keys"; // GET / POST — super admin to create
  static integrationApiKey(keyId: string) {
    return `/integrations/api-keys/${keyId}`;
  } // DELETE — super admin

  // ──────────── AI Agent ────────────
  static readonly aiChat = "/ai/chat";
  static readonly aiEndSession = "/ai/end-session";
  static readonly aiHealth = "/ai/health";

  // ──────────── Added Endpoints (Resolving Type Errors) ────────────
  // Attachments
  static readonly attachmentsMultiple = "/attachments/multiple";

  // Cards
  static cardDeliveryTrack(id: string) {
    return `/cards/${id}/delivery/track`;
  }
  static cardReplace(id: string) {
    return `/cards/${id}/replace`;
  }
  static cardResetPin(id: string) {
    return `/cards/${id}/reset-pin`;
  }
  static cardSetPin(id: string) {
    return `/cards/${id}/set-pin`;
  }
  static cardSettings(id: string) {
    return `/cards/${id}/settings`;
  }
  static cardTransactionDispute(id: string, transactionId: string) {
    return `/cards/${id}/transactions/${transactionId}/dispute`;
  }
  static readonly cardsPhysicalRequest = "/cards/physical/request";
  static readonly cardsVirtual = "/cards/virtual";

  // Integrations
  static integrationApiKeyRegenerate(id: string) {
    return `/integrations/api-keys/${id}/regenerate`;
  }
  static integrationApiKeyToggle(id: string) {
    return `/integrations/api-keys/${id}/toggle`;
  }
  static integrationExternalAccount(id: string) {
    return `/integrations/external-accounts/${id}`;
  }
  static integrationExternalAccountSync(id: string) {
    return `/integrations/external-accounts/${id}/sync`;
  }
  static integrationWebhookTest(id: string) {
    return `/integrations/webhooks/${id}/test`;
  }
  static integrationWebhookToggle(id: string) {
    return `/integrations/webhooks/${id}/toggle`;
  }
  static readonly integrationsApiPermissions = "/integrations/api-permissions";
  static readonly integrationsWebhookEvents = "/integrations/webhooks/events";

  // KYC
  static kycVerifyStatus(id: string) {
    return `/kyc/verify/${id}/status`;
  }

  // Legal
  static readonly legalAcceptTerms = "/legal/documents/terms/accept";
  static readonly legalConsent = "/legal/consent";
  static readonly legalDisclosures = "/legal/documents/disclosures";
  static legalDisputeCancel(id: string) {
    return `/legal/disputes/${id}/cancel`;
  }
  static legalDisputeDocuments(id: string) {
    return `/legal/disputes/${id}/documents`;
  }
  static readonly legalPrivacy = "/legal/documents/privacy";
  static legalReport(id: string) {
    return `/legal/reports/${id}`;
  }
  static legalReportDownload(id: string) {
    return `/legal/reports/${id}/download`;
  }
  static readonly legalReports = "/legal/reports";
  static readonly legalReportsHistory = "/legal/reports/transaction-history";
  static readonly legalReportsStatement = "/legal/reports/account-statement";
  static readonly legalReportsTax = "/legal/reports/tax";
  static readonly legalTerms = "/legal/documents/terms";

  // Loans
  static loanAutoPayment(id: string) {
    return `/loans/${id}/auto-payment`;
  }
  static loanCancel(id: string) {
    return `/loans/${id}/cancel`;
  }
  static loanDeferral(id: string) {
    return `/loans/${id}/deferral`;
  }
  static loanDocuments(id: string) {
    return `/loans/${id}/documents`;
  }
  static loanPayments(id: string) {
    return `/loans/${id}/payments`;
  }
  static loanPayoffQuote(id: string) {
    return `/loans/${id}/payoff-quote`;
  }
  static loanRefinance(id: string) {
    return `/loans/${id}/refinance`;
  }
  static loanStatus(id: string) {
    return `/loans/${id}/status`;
  }
  static readonly loansActive = "/loans/active";
  static readonly loansCalculate = "/loans/calculate";
  static readonly loansPayments = "/loans/payments";
  static readonly loansProducts = "/loans/products";
  static readonly loansSummary = "/loans/summary";

  // Notifications
  static readonly notificationsPreferences = "/notifications/preferences";
  static readonly notificationsPushRegister = "/notifications/push/register";
  static readonly notificationsPushTest = "/notifications/push/test";
  static readonly notificationsPushUnregister = "/notifications/push/unregister";
  static readonly notificationsRead = "/notifications/read";
  static readonly notificationsUnreadCount = "/notifications/unread-count";

  // Security
  static readonly security2FaBackupCodes = "/security/2fa/backup-codes";
  static readonly security2FaBackupCodesRegenerate = "/security/2fa/backup-codes/regenerate";
  static readonly security2FaChangeMethod = "/security/2fa/change-method";
  static readonly security2FaDisable = "/security/2fa/disable";
  static readonly security2FaSetup = "/security/2fa/setup";
  static readonly security2FaVerify = "/security/2fa/verify";
  static readonly securityActivityLog = "/security/activity-log";
  static readonly securityReviewRequest = "/security/review/request";
  static readonly securitySessionCurrent = "/security/sessions/current";
  static readonly securitySessionsOthers = "/security/sessions/others";
  static readonly securityTransactionPin = "/security/transaction-pin";
  static readonly securityTransactionPinReset = "/security/transaction-pin/reset";
  static readonly securityTransactionPinResetConfirm = "/security/transaction-pin/reset/confirm";
  static readonly securityTransactionPinVerify = "/security/transaction-pin/verify";

  // Users
  static readonly userAddress = "/users/address";
  static readonly userAvatar = "/users/avatar";
  static userBankAccount(id: string) {
    return `/users/bank-accounts/${id}`;
  }
  static userBankAccountPrimary(id: string) {
    return `/users/bank-accounts/${id}/primary`;
  }
  static userBankAccountVerify(id: string) {
    return `/users/bank-accounts/${id}/verify`;
  }
  static readonly userBankAccounts = "/users/bank-accounts";
  static readonly userEmployment = "/users/employment";
  static readonly userExportData = "/users/export-data";
  static readonly userPreferencesNotifications = "/users/preferences/notifications";
  static readonly userReferrals = "/users/referrals";
  static readonly userReferralsList = "/users/referrals/list";
}
