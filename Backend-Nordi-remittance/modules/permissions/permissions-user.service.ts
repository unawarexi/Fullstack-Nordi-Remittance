// ============================================================================
// PERMISSIONS USER SERVICE
// ============================================================================

import Permissions from "./permissions.model.js";

export class PermissionsUserService {
  // --------------------------------------------------------------------------
  // GET USER PERMISSIONS
  // --------------------------------------------------------------------------
  static async getUserPermissions(targetUserId: string) {
    const permissions = await Permissions.findOne({
      userId: targetUserId,
    }).lean();

    if (!permissions) {
      return {
        permissions: null,
        message: "No custom permissions found for this user",
      };
    }

    return { permissions };
  }

  // --------------------------------------------------------------------------
  // GET PERMISSION CATEGORIES
  // --------------------------------------------------------------------------
  static async getPermissionCategories() {
    const categories = {
      accountStatus: {
        label: "User Account Status",
        fields: [
          "canActivate",
          "canFreeze",
          "canBlock",
          "canLockOnSuspicious",
          "maintenanceMode",
          "notificationsEnabled",
          "forcePasswordReset",
          "allowAccountDeletion",
        ],
      },
      featureAccess: {
        label: "Feature Access Toggles",
        fields: [
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
      },
      fundControls: {
        label: "Fund / Withdraw Controls",
        fields: [
          "canFundWallet",
          "canWithdraw",
          "canAdjustBalance",
          "canRevertTransaction",
          "canSendRefund",
          "canReprocessTransaction",
        ],
      },
      kycCompliance: {
        label: "KYC & Compliance",
        fields: [
          "kycVerified",
          "canRequestKycReupload",
          "enhancedDueDiligence",
          "documentExpiryAlerts",
          "faceIdVerification",
        ],
      },
      securityAccess: {
        label: "Security & Access Controls",
        fields: [
          "enable2fa",
          "transactionOtp",
          "allowLoginNewDevices",
          "locationBasedLogin",
          "ipWhitelisting",
          "allowApiAccess",
          "adminNotesEnabled",
        ],
      },
      userRole: {
        label: "User Role & Permissions",
        fields: [
          "userRole",
          "businessPrivileges",
          "developerMode",
          "staffDelegation",
        ],
      },
      aiInsights: {
        label: "AI, Insights & Recommendations",
        fields: [
          "smartBudgeting",
          "spendingAlerts",
          "netWorthTracker",
          "investmentRecommendations",
          "cashFlowForecasting",
        ],
      },
      functional: {
        label: "Other Functional Toggles",
        fields: [
          "languageCustomization",
          "accessibilityMode",
          "darkModeDefault",
          "customThemes",
          "supportChat",
          "promotionalEmails",
          "feedbackSubmission",
        ],
      },
    };

    return { categories };
  }
}
