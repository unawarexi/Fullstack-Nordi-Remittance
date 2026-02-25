// ============================================================================
// INDEX MIGRATION SCRIPT — Production-Grade Index Creation
// ============================================================================
// Run this script as a migration step, NOT at runtime.
// Usage: npx tsx scripts/create-indexes.ts
// ============================================================================

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function createIndexes(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ MONGODB_URI is not defined");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("✅ Connected to MongoDB");

  const db = mongoose.connection.db;
  if (!db) {
    console.error("❌ Database connection not established");
    process.exit(1);
  }

  const results: { collection: string; index: string; status: string }[] = [];

  async function safeCreateIndex(
    collectionName: string,
    indexSpec: Record<string, any>,
    options: Record<string, any> = {},
  ): Promise<void> {
    const indexName =
      options.name ||
      Object.entries(indexSpec)
        .map(([k, v]) => `${k}_${v}`)
        .join("_");
    try {
      await db!.collection(collectionName).createIndex(indexSpec, options);
      results.push({ collection: collectionName, index: indexName, status: "✅ Created" });
    } catch (err: any) {
      if (err.code === 85 || err.code === 86) {
        results.push({ collection: collectionName, index: indexName, status: "⚠️ Already exists (compatible)" });
      } else {
        results.push({ collection: collectionName, index: indexName, status: `❌ Error: ${err.message}` });
      }
    }
  }

  console.log("\n🔧 Creating indexes...\n");

  // ==========================================================================
  // USERS COLLECTION
  // ==========================================================================
  await safeCreateIndex("users", { email: 1 }, { unique: true, name: "idx_users_email_unique" });
  await safeCreateIndex("users", { mobileNumber: 1 }, { unique: true, sparse: true, name: "idx_users_mobile_unique" });
  await safeCreateIndex("users", { kycStatus: 1 }, { name: "idx_users_kycStatus" });
  await safeCreateIndex("users", { accountStatus: 1 }, { name: "idx_users_accountStatus" });
  await safeCreateIndex("users", { isActive: 1 }, { name: "idx_users_isActive" });
  await safeCreateIndex("users", { accountStatus: 1, kycStatus: 1 }, { name: "idx_users_status_kyc" });
  // Text index for admin search (replaces unanchored regex)
  await safeCreateIndex(
    "users",
    { email: "text", firstName: "text", lastName: "text", mobileNumber: "text" },
    { name: "idx_users_text_search", weights: { email: 10, firstName: 5, lastName: 5, mobileNumber: 3 } },
  );

  // ==========================================================================
  // WALLETS COLLECTION
  // ==========================================================================
  await safeCreateIndex("wallets", { user: 1 }, { unique: true, name: "idx_wallets_user_unique" });
  await safeCreateIndex("wallets", { walletNumber: 1 }, { unique: true, name: "idx_wallets_walletNumber_unique" });
  await safeCreateIndex("wallets", { status: 1 }, { name: "idx_wallets_status" });
  await safeCreateIndex("wallets", { user: 1, status: 1 }, { name: "idx_wallets_user_status" });
  await safeCreateIndex("wallets", { user: 1, isPrimary: 1 }, { name: "idx_wallets_user_primary" });

  // ==========================================================================
  // ACCOUNT BALANCES COLLECTION
  // ==========================================================================
  await safeCreateIndex("accountbalances", { wallet: 1, currency: 1 }, { unique: true, name: "idx_accountbalances_wallet_currency" });

  // ==========================================================================
  // LEDGER ENTRIES COLLECTION
  // ==========================================================================
  await safeCreateIndex("ledgerentries", { wallet: 1, createdAt: -1 }, { name: "idx_ledger_wallet_date" });
  await safeCreateIndex("ledgerentries", { transaction: 1 }, { name: "idx_ledger_transaction" });
  await safeCreateIndex("ledgerentries", { wallet: 1, entryType: 1, createdAt: -1 }, { name: "idx_ledger_wallet_type_date" });

  // ==========================================================================
  // ACCOUNT LIMITS COLLECTION
  // ==========================================================================
  await safeCreateIndex("accountlimits", { wallet: 1, limitType: 1, category: 1 }, { name: "idx_accountlimits_wallet_type_cat" });
  await safeCreateIndex("accountlimits", { wallet: 1, isActive: 1 }, { name: "idx_accountlimits_wallet_active" });

  // ==========================================================================
  // ACCOUNT STATUS HISTORIES COLLECTION
  // ==========================================================================
  await safeCreateIndex("accountstatushistories", { wallet: 1, createdAt: -1 }, { name: "idx_acctstatushistory_wallet_date" });

  // ==========================================================================
  // TRANSACTIONS COLLECTION
  // ==========================================================================
  await safeCreateIndex("transactions", { wallet: 1, createdAt: -1 }, { name: "idx_tx_wallet_date" });
  await safeCreateIndex("transactions", { wallet: 1, status: 1 }, { name: "idx_tx_wallet_status" });
  await safeCreateIndex("transactions", { wallet: 1, category: 1 }, { name: "idx_tx_wallet_category" });
  await safeCreateIndex("transactions", { wallet: 1, status: 1, createdAt: -1 }, { name: "idx_tx_wallet_status_date" });
  await safeCreateIndex("transactions", { initiatedBy: 1, createdAt: -1 }, { name: "idx_tx_initiatedBy_date" });
  await safeCreateIndex("transactions", { initiatedBy: 1, status: 1, createdAt: -1 }, { name: "idx_tx_initiatedBy_status_date" });
  await safeCreateIndex("transactions", { status: 1, createdAt: -1 }, { name: "idx_tx_status_date" });
  await safeCreateIndex("transactions", { referenceNumber: 1 }, { unique: true, name: "idx_tx_reference_unique" });
  await safeCreateIndex("transactions", { category: 1 }, { name: "idx_tx_category" });
  await safeCreateIndex("transactions", { createdAt: -1 }, { name: "idx_tx_date" });
  await safeCreateIndex("transactions", { type: 1, status: 1, createdAt: -1 }, { name: "idx_tx_type_status_date" });
  // Text index for reference search (replaces unanchored regex)
  await safeCreateIndex("transactions", { referenceNumber: "text" }, { name: "idx_tx_reference_text" });

  // ==========================================================================
  // ADMIN USERS COLLECTION
  // ==========================================================================
  await safeCreateIndex("adminusers", { email: 1 }, { unique: true, name: "idx_adminusers_email_unique" });
  await safeCreateIndex("adminusers", { role: 1, isActive: 1 }, { name: "idx_adminusers_role_active" });

  // ==========================================================================
  // ADMIN PERMISSIONS COLLECTION
  // ==========================================================================
  await safeCreateIndex("adminpermissions", { admin: 1 }, { unique: true, name: "idx_adminpermissions_admin_unique" });

  // ==========================================================================
  // ADMIN ACTION LOGS COLLECTION
  // ==========================================================================
  await safeCreateIndex("adminactionlogs", { admin: 1, createdAt: -1 }, { name: "idx_adminlogs_admin_date" });
  await safeCreateIndex("adminactionlogs", { resource: 1, resourceId: 1 }, { name: "idx_adminlogs_resource" });
  await safeCreateIndex("adminactionlogs", { createdAt: -1 }, { name: "idx_adminlogs_date" });

  // ==========================================================================
  // SYSTEM SETTINGS COLLECTION
  // ==========================================================================
  await safeCreateIndex("systemsettings", { key: 1 }, { unique: true, name: "idx_systemsettings_key_unique" });
  await safeCreateIndex("systemsettings", { category: 1 }, { name: "idx_systemsettings_category" });

  // ==========================================================================
  // OPERATIONAL TASKS COLLECTION
  // ==========================================================================
  await safeCreateIndex("operationaltasks", { assignedTo: 1, status: 1 }, { name: "idx_optasks_assigned_status" });
  await safeCreateIndex("operationaltasks", { taskType: 1, status: 1 }, { name: "idx_optasks_type_status" });
  await safeCreateIndex("operationaltasks", { status: 1, priority: 1, dueDate: 1 }, { name: "idx_optasks_status_priority_due" });

  // ==========================================================================
  // SUPPORT TICKETS COLLECTION
  // ==========================================================================
  await safeCreateIndex("supporttickets", { user: 1, status: 1 }, { name: "idx_tickets_user_status" });
  await safeCreateIndex("supporttickets", { assignedTo: 1, status: 1 }, { name: "idx_tickets_assigned_status" });
  await safeCreateIndex("supporttickets", { status: 1, priority: 1, createdAt: -1 }, { name: "idx_tickets_status_priority_date" });

  // ==========================================================================
  // SUPPORT MESSAGES COLLECTION
  // ==========================================================================
  await safeCreateIndex("supportmessages", { ticket: 1, createdAt: 1 }, { name: "idx_supportmsgs_ticket_date" });

  // ==========================================================================
  // AUDIT LOGS COLLECTION
  // ==========================================================================
  await safeCreateIndex("auditlogs", { actor: 1, createdAt: -1 }, { name: "idx_auditlogs_actor_date" });
  await safeCreateIndex("auditlogs", { eventType: 1, createdAt: -1 }, { name: "idx_auditlogs_type_date" });
  await safeCreateIndex("auditlogs", { resource: 1, resourceId: 1 }, { name: "idx_auditlogs_resource" });
  await safeCreateIndex("auditlogs", { severity: 1, status: 1 }, { name: "idx_auditlogs_severity_status" });
  // Text index for audit log search
  await safeCreateIndex(
    "auditlogs",
    { action: "text", resource: "text" },
    { name: "idx_auditlogs_text_search" },
  );

  // ==========================================================================
  // ACTIVITY LOGS COLLECTION
  // ==========================================================================
  await safeCreateIndex("activitylogs", { user: 1, createdAt: -1 }, { name: "idx_activitylogs_user_date" });
  await safeCreateIndex("activitylogs", { activityType: 1, createdAt: -1 }, { name: "idx_activitylogs_type_date" });

  // ==========================================================================
  // DATA ACCESS LOGS COLLECTION
  // ==========================================================================
  await safeCreateIndex("dataaccesslogs", { dataOwner: 1, createdAt: -1 }, { name: "idx_dataaccesslogs_owner_date" });
  await safeCreateIndex("dataaccesslogs", { accessor: 1, createdAt: -1 }, { name: "idx_dataaccesslogs_accessor_date" });
  await safeCreateIndex("dataaccesslogs", { dataType: 1, accessMethod: 1 }, { name: "idx_dataaccesslogs_type_method" });

  // ==========================================================================
  // ERROR LOGS COLLECTION
  // ==========================================================================
  await safeCreateIndex("errorlogs", { errorType: 1, severity: 1 }, { name: "idx_errorlogs_type_severity" });
  await safeCreateIndex("errorlogs", { isResolved: 1, createdAt: -1 }, { name: "idx_errorlogs_resolved_date" });
  await safeCreateIndex("errorlogs", { userId: 1, createdAt: -1 }, { name: "idx_errorlogs_user_date" });

  // ==========================================================================
  // WEBHOOK EVENTS COLLECTION
  // ==========================================================================
  await safeCreateIndex("webhookevents", { provider: 1, eventType: 1 }, { name: "idx_webhookevents_provider_type" });
  await safeCreateIndex("webhookevents", { status: 1, nextRetryAt: 1 }, { name: "idx_webhookevents_status_retry" });
  await safeCreateIndex("webhookevents", { createdAt: -1 }, { name: "idx_webhookevents_date" });

  // ==========================================================================
  // COMPLIANCE REPORTS COLLECTION
  // ==========================================================================
  await safeCreateIndex("compliancereports", { reportType: 1, status: 1 }, { name: "idx_compliance_type_status" });
  await safeCreateIndex("compliancereports", { generatedBy: 1, createdAt: -1 }, { name: "idx_compliance_author_date" });
  await safeCreateIndex("compliancereports", { periodStart: 1, periodEnd: 1 }, { name: "idx_compliance_period" });

  // ==========================================================================
  // SYSTEM AUDIT TRAILS COLLECTION
  // ==========================================================================
  await safeCreateIndex("systemaudittrails", { component: 1, createdAt: -1 }, { name: "idx_sysaudit_component_date" });
  await safeCreateIndex("systemaudittrails", { eventType: 1, severity: 1 }, { name: "idx_sysaudit_type_severity" });
  await safeCreateIndex("systemaudittrails", { timestamp: -1 }, { name: "idx_sysaudit_timestamp" });

  // ==========================================================================
  // CONFIRMATION TOKENS COLLECTION
  // ==========================================================================
  await safeCreateIndex("confirmationtokens", { token: 1, type: 1, used: 1 }, { name: "idx_confirmtokens_token_type_used" });
  await safeCreateIndex("confirmationtokens", { userId: 1, type: 1 }, { name: "idx_confirmtokens_user_type" });
  await safeCreateIndex("confirmationtokens", { expiresAt: 1 }, { expireAfterSeconds: 0, name: "idx_confirmtokens_ttl" });

  // ==========================================================================
  // LOGIN ATTEMPTS COLLECTION
  // ==========================================================================
  await safeCreateIndex("loginattempts", { email: 1, createdAt: -1 }, { name: "idx_loginattempts_email_date" });
  await safeCreateIndex("loginattempts", { ipAddress: 1, createdAt: -1 }, { name: "idx_loginattempts_ip_date" });
  await safeCreateIndex("loginattempts", { success: 1, createdAt: -1 }, { name: "idx_loginattempts_success_date" });
  await safeCreateIndex("loginattempts", { createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60, name: "idx_loginattempts_ttl" });

  // ==========================================================================
  // SECURITY EVENTS COLLECTION (ConfirmModel)
  // ==========================================================================
  await safeCreateIndex("securityevents", { userId: 1, type: 1, createdAt: -1 }, { name: "idx_secevents_user_type_date" });
  await safeCreateIndex("securityevents", { type: 1, severity: 1, createdAt: -1 }, { name: "idx_secevents_type_severity_date" });
  await safeCreateIndex("securityevents", { ipAddress: 1, createdAt: -1 }, { name: "idx_secevents_ip_date" });
  await safeCreateIndex("securityevents", { resolved: 1, severity: 1 }, { name: "idx_secevents_resolved_severity" });

  // ==========================================================================
  // BLOCKED IPS COLLECTION
  // ==========================================================================
  await safeCreateIndex("blockedips", { ipAddress: 1 }, { unique: true, name: "idx_blockedips_ip_unique" });
  await safeCreateIndex("blockedips", { expiresAt: 1 }, { expireAfterSeconds: 0, name: "idx_blockedips_ttl" });

  // ==========================================================================
  // USER DEVICES COLLECTION
  // ==========================================================================
  await safeCreateIndex("userdevices", { userId: 1, deviceId: 1 }, { unique: true, name: "idx_userdevices_user_device" });
  await safeCreateIndex("userdevices", { userId: 1, trusted: 1 }, { name: "idx_userdevices_user_trusted" });

  // ==========================================================================
  // CARDS COLLECTION
  // ==========================================================================
  await safeCreateIndex("cards", { user: 1, status: 1 }, { name: "idx_cards_user_status" });
  await safeCreateIndex("cards", { wallet: 1 }, { name: "idx_cards_wallet" });
  await safeCreateIndex("cards", { cardNumber: 1 }, { unique: true, name: "idx_cards_number_unique" });
  await safeCreateIndex("cards", { status: 1 }, { name: "idx_cards_status" });

  // ==========================================================================
  // CARD APPLICATIONS COLLECTION
  // ==========================================================================
  await safeCreateIndex("cardapplications", { user: 1, status: 1 }, { name: "idx_cardapps_user_status" });
  await safeCreateIndex("cardapplications", { status: 1, createdAt: -1 }, { name: "idx_cardapps_status_date" });

  // ==========================================================================
  // CARD TRANSACTIONS COLLECTION
  // ==========================================================================
  await safeCreateIndex("cardtransactions", { card: 1, createdAt: -1 }, { name: "idx_cardtx_card_date" });
  await safeCreateIndex("cardtransactions", { merchant: 1 }, { name: "idx_cardtx_merchant" });
  await safeCreateIndex("cardtransactions", { card: 1, status: 1, createdAt: -1 }, { name: "idx_cardtx_card_status_date" });

  // ==========================================================================
  // CARD TOKENS COLLECTION
  // ==========================================================================
  await safeCreateIndex("cardtokens", { card: 1 }, { name: "idx_cardtokens_card" });
  await safeCreateIndex("cardtokens", { token: 1 }, { unique: true, name: "idx_cardtokens_token_unique" });

  // ==========================================================================
  // MERCHANTS COLLECTION
  // ==========================================================================
  await safeCreateIndex("merchants", { merchantId: 1 }, { unique: true, name: "idx_merchants_id_unique" });
  await safeCreateIndex("merchants", { mcc: 1 }, { name: "idx_merchants_mcc" });

  // ==========================================================================
  // CARD LIMITS & CONTROLS COLLECTION
  // ==========================================================================
  await safeCreateIndex("cardlimits", { card: 1 }, { name: "idx_cardlimits_card" });
  await safeCreateIndex("cardcontrols", { card: 1 }, { name: "idx_cardcontrols_card" });

  // ==========================================================================
  // FRAUD SIGNALS COLLECTION
  // ==========================================================================
  await safeCreateIndex("fraudsignals", { user: 1, status: 1 }, { name: "idx_fraudsignals_user_status" });
  await safeCreateIndex("fraudsignals", { severity: 1, status: 1 }, { name: "idx_fraudsignals_severity_status" });
  await safeCreateIndex("fraudsignals", { detectedAt: -1 }, { name: "idx_fraudsignals_detected" });
  await safeCreateIndex("fraudsignals", { user: 1, createdAt: -1 }, { name: "idx_fraudsignals_user_date" });

  // ==========================================================================
  // FRAUD CASES COLLECTION
  // ==========================================================================
  await safeCreateIndex("fraudcases", { user: 1, status: 1 }, { name: "idx_fraudcases_user_status" });
  await safeCreateIndex("fraudcases", { assignedTo: 1, status: 1 }, { name: "idx_fraudcases_assigned_status" });
  await safeCreateIndex("fraudcases", { priority: 1, status: 1 }, { name: "idx_fraudcases_priority_status" });
  await safeCreateIndex("fraudcases", { status: 1, createdAt: -1 }, { name: "idx_fraudcases_status_date" });

  // ==========================================================================
  // VELOCITY RULES COLLECTION
  // ==========================================================================
  await safeCreateIndex("velocityrules", { isActive: 1 }, { name: "idx_velocityrules_active" });

  // ==========================================================================
  // BEHAVIOR PROFILES COLLECTION
  // ==========================================================================
  await safeCreateIndex("behaviorprofiles", { user: 1 }, { unique: true, name: "idx_behaviorprofiles_user_unique" });

  // ==========================================================================
  // NOTIFICATIONS COLLECTION
  // ==========================================================================
  await safeCreateIndex("notifications", { user: 1, isRead: 1, createdAt: -1 }, { name: "idx_notifications_user_read_date" });
  await safeCreateIndex("notifications", { type: 1, createdAt: -1 }, { name: "idx_notifications_type_date" });
  await safeCreateIndex("notifications", { expiresAt: 1 }, { name: "idx_notifications_expiry" });

  // ==========================================================================
  // EMAIL MESSAGES COLLECTION
  // ==========================================================================
  await safeCreateIndex("emailmessages", { user: 1, createdAt: -1 }, { name: "idx_emailmsgs_user_date" });
  await safeCreateIndex("emailmessages", { status: 1, lastAttemptAt: 1 }, { name: "idx_emailmsgs_status_attempt" });

  // ==========================================================================
  // SMS MESSAGES COLLECTION
  // ==========================================================================
  await safeCreateIndex("smsmessages", { user: 1, createdAt: -1 }, { name: "idx_smsmsgs_user_date" });
  await safeCreateIndex("smsmessages", { status: 1, lastAttemptAt: 1 }, { name: "idx_smsmsgs_status_attempt" });

  // ==========================================================================
  // PUSH NOTIFICATIONS COLLECTION
  // ==========================================================================
  await safeCreateIndex("pushnotifications", { user: 1, createdAt: -1 }, { name: "idx_pushnotifs_user_date" });
  await safeCreateIndex("pushnotifications", { status: 1 }, { name: "idx_pushnotifs_status" });

  // ==========================================================================
  // NOTIFICATION PREFERENCES COLLECTION
  // ==========================================================================
  await safeCreateIndex("notificationpreferences", { user: 1 }, { unique: true, name: "idx_notifprefs_user_unique" });

  // ==========================================================================
  // PERMISSIONS COLLECTION
  // ==========================================================================
  await safeCreateIndex("permissions", { userId: 1 }, { unique: true, name: "idx_permissions_user_unique" });

  // ==========================================================================
  // TRANSFER VERIFICATIONS COLLECTION
  // ==========================================================================
  await safeCreateIndex("transferverifications", { user: 1, status: 1 }, { name: "idx_transferverif_user_status" });
  await safeCreateIndex("transferverifications", { transaction: 1 }, { name: "idx_transferverif_transaction" });
  await safeCreateIndex("transferverifications", { verificationId: 1 }, { name: "idx_transferverif_verificationId" });
  await safeCreateIndex("transferverifications", { status: 1, expiresAt: 1 }, { name: "idx_transferverif_status_expiry" });

  // ==========================================================================
  // TRANSACTION TAXES COLLECTION
  // ==========================================================================
  await safeCreateIndex("transactiontaxes", { user: 1, createdAt: -1 }, { name: "idx_txtaxes_user_date" });
  await safeCreateIndex("transactiontaxes", { transaction: 1 }, { name: "idx_txtaxes_transaction" });
  await safeCreateIndex("transactiontaxes", { status: 1 }, { name: "idx_txtaxes_status" });

  // ==========================================================================
  // STATISTICS COLLECTION
  // ==========================================================================
  await safeCreateIndex("statistics", { date: 1, period: 1 }, { unique: true, name: "idx_statistics_date_period" });
  await safeCreateIndex("statistics", { period: 1, date: -1 }, { name: "idx_statistics_period_date" });

  // ==========================================================================
  // LEGAL MODELS
  // ==========================================================================
  await safeCreateIndex("legaldocuments", { documentType: 1, status: 1 }, { name: "idx_legaldocs_type_status" });
  await safeCreateIndex("legaldocuments", { effectiveDate: -1 }, { name: "idx_legaldocs_effective" });
  await safeCreateIndex("userconsents", { user: 1, document: 1 }, { name: "idx_userconsents_user_doc" });
  await safeCreateIndex("userconsents", { user: 1, documentType: 1 }, { name: "idx_userconsents_user_type" });
  await safeCreateIndex("policyversions", { documentType: 1, version: -1 }, { name: "idx_policyversions_type_version" });
  await safeCreateIndex("disputeclaims", { user: 1, status: 1 }, { name: "idx_disputeclaims_user_status" });
  await safeCreateIndex("disputeclaims", { transaction: 1 }, { name: "idx_disputeclaims_transaction" });
  await safeCreateIndex("regulatoryfilings", { filingType: 1, status: 1 }, { name: "idx_regfilings_type_status" });

  // ==========================================================================
  // LOANS MODELS
  // ==========================================================================
  await safeCreateIndex("loans", { user: 1, status: 1 }, { name: "idx_loans_user_status" });
  await safeCreateIndex("loans", { status: 1, createdAt: -1 }, { name: "idx_loans_status_date" });
  await safeCreateIndex("loanapplications", { user: 1, status: 1 }, { name: "idx_loanapps_user_status" });
  await safeCreateIndex("loanapplications", { status: 1, createdAt: -1 }, { name: "idx_loanapps_status_date" });
  await safeCreateIndex("creditassessments", { user: 1 }, { name: "idx_creditassessments_user" });
  await safeCreateIndex("repaymentschedules", { loan: 1 }, { name: "idx_repaymentschedules_loan" });
  await safeCreateIndex("loanrepayments", { loan: 1, paymentDate: -1 }, { name: "idx_loanrepayments_loan_date" });
  await safeCreateIndex("collaterals", { loan: 1 }, { name: "idx_collaterals_loan" });

  // ==========================================================================
  // INVESTMENTS MODELS
  // ==========================================================================
  await safeCreateIndex("savingsgoals", { user: 1, status: 1 }, { name: "idx_savingsgoals_user_status" });
  await safeCreateIndex("interestplans", { isActive: 1 }, { name: "idx_interestplans_active" });
  await safeCreateIndex("investmentaccounts", { user: 1, status: 1 }, { name: "idx_investaccts_user_status" });
  await safeCreateIndex("assets", { assetType: 1, isActive: 1 }, { name: "idx_assets_type_active" });
  await safeCreateIndex("assets", { symbol: 1 }, { unique: true, name: "idx_assets_symbol_unique" });
  await safeCreateIndex("portfolios", { user: 1, investmentAccount: 1 }, { name: "idx_portfolios_user_account" });
  await safeCreateIndex("portfolios", { asset: 1 }, { name: "idx_portfolios_asset" });
  await safeCreateIndex("portfoliotransactions", { user: 1, createdAt: -1 }, { name: "idx_portfoliotx_user_date" });
  await safeCreateIndex("portfoliotransactions", { investmentAccount: 1 }, { name: "idx_portfoliotx_account" });

  // ==========================================================================
  // INTEGRATIONS MODELS
  // ==========================================================================
  await safeCreateIndex("bankintegrations", { status: 1 }, { name: "idx_bankintegrations_status" });
  await safeCreateIndex("paymentgateways", { provider: 1, status: 1 }, { name: "idx_paymentgateways_provider_status" });
  await safeCreateIndex("paymentgateways", { isDefault: 1 }, { name: "idx_paymentgateways_default" });
  await safeCreateIndex("webhooksubscriptions", { user: 1, status: 1 }, { name: "idx_webhooksubs_user_status" });
  await safeCreateIndex("thirdpartyaccounts", { user: 1, status: 1 }, { name: "idx_thirdparty_user_status" });
  await safeCreateIndex("apikeys", { user: 1, status: 1 }, { name: "idx_apikeys_user_status" });
  await safeCreateIndex("apikeys", { key: 1 }, { name: "idx_apikeys_key" });
  await safeCreateIndex("apikeys", { keyPrefix: 1 }, { name: "idx_apikeys_prefix" });

  // ==========================================================================
  // ATTACHMENTS COLLECTION
  // ==========================================================================
  await safeCreateIndex("attachments", { user: 1, category: 1 }, { name: "idx_attachments_user_category" });
  await safeCreateIndex("attachments", { relatedEntity: 1, relatedEntityId: 1 }, { name: "idx_attachments_entity" });
  await safeCreateIndex("attachments", { isDeleted: 1, expiresAt: 1 }, { name: "idx_attachments_deleted_expiry" });
  await safeCreateIndex("attachments", { user: 1, createdAt: -1 }, { name: "idx_attachments_user_date" });

  // ==========================================================================
  // FEATURE/GROWTH MODELS
  // ==========================================================================
  await safeCreateIndex("featureflags", { isEnabled: 1, environment: 1 }, { name: "idx_featureflags_enabled_env" });
  await safeCreateIndex("referrals", { referrer: 1, status: 1 }, { name: "idx_referrals_referrer_status" });
  await safeCreateIndex("referrals", { referee: 1 }, { name: "idx_referrals_referee" });
  await safeCreateIndex("referrals", { referralCode: 1 }, { name: "idx_referrals_code" });
  await safeCreateIndex("rewards", { user: 1, status: 1 }, { name: "idx_rewards_user_status" });
  await safeCreateIndex("rewards", { source: 1, createdAt: -1 }, { name: "idx_rewards_source_date" });
  await safeCreateIndex("promotions", { status: 1, startDate: 1, endDate: 1 }, { name: "idx_promotions_status_dates" });

  // ==========================================================================
  // PRINT RESULTS
  // ==========================================================================
  console.log("\n📊 Index Creation Results:\n");
  console.log("─".repeat(80));
  console.log(
    `${"Collection".padEnd(30)} ${"Index".padEnd(35)} ${"Status"}`,
  );
  console.log("─".repeat(80));

  for (const r of results) {
    console.log(
      `${r.collection.padEnd(30)} ${r.index.padEnd(35)} ${r.status}`,
    );
  }

  console.log("─".repeat(80));

  const created = results.filter((r) => r.status.includes("Created")).length;
  const existing = results.filter((r) => r.status.includes("exists")).length;
  const errors = results.filter((r) => r.status.includes("Error")).length;

  console.log(`\n✅ Created: ${created}`);
  console.log(`⚠️  Already existing: ${existing}`);
  console.log(`❌ Errors: ${errors}`);
  console.log(`📦 Total: ${results.length}`);

  await mongoose.disconnect();
  console.log("\n✅ Disconnected from MongoDB");
}

createIndexes().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
