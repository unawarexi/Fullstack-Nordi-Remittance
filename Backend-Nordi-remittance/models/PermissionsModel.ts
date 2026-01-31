import mongoose from 'mongoose';

const { Schema } = mongoose;

const PermissionsSchema = new Schema({
  userId: { type: String, ref: 'Users', unique: true, required: true },

  // 1. User Account Status
  canActivate: { type: Boolean, default: false },
  canFreeze: { type: Boolean, default: false },
  canBlock: { type: Boolean, default: false },
  canLockOnSuspicious: { type: Boolean, default: false },
  maintenanceMode: { type: Boolean, default: false }, // global toggle
  notificationsEnabled: { type: Boolean, default: true },
  forcePasswordReset: { type: Boolean, default: false },
  allowAccountDeletion: { type: Boolean, default: false },

  // 2. Feature Access Toggles
  enableDomesticTransfers: { type: Boolean, default: true },
  enableInternationalTransfers: { type: Boolean, default: false },
  enableWalletToWallet: { type: Boolean, default: true },
  enableCardPayments: { type: Boolean, default: false },
  enableQrPayments: { type: Boolean, default: false },
  enableCryptoTransfers: { type: Boolean, default: false },
  enableScheduledTransfers: { type: Boolean, default: false },
  enableBillPayments: { type: Boolean, default: false },
  enableRequestMoney: { type: Boolean, default: false },
  enableChequeRequest: { type: Boolean, default: false },

  // 3. Fund / Withdraw Controls (Admin-Initiated)
  canFundWallet: { type: Boolean, default: false },
  canWithdraw: { type: Boolean, default: false },
  canAdjustBalance: { type: Boolean, default: false },
  canRevertTransaction: { type: Boolean, default: false },
  canSendRefund: { type: Boolean, default: false },
  canReprocessTransaction: { type: Boolean, default: false },

  // 4. KYC & Compliance
  kycVerified: { type: Boolean, default: false },
  canRequestKycReupload: { type: Boolean, default: false },
  enhancedDueDiligence: { type: Boolean, default: false },
  documentExpiryAlerts: { type: Boolean, default: false },
  faceIdVerification: { type: Boolean, default: false },

  // 5. Security & Access Controls
  enable2fa: { type: Boolean, default: false },
  transactionOtp: { type: Boolean, default: false },
  allowLoginNewDevices: { type: Boolean, default: true },
  locationBasedLogin: { type: Boolean, default: false },
  ipWhitelisting: { type: Boolean, default: false },
  allowApiAccess: { type: Boolean, default: false },
  adminNotesEnabled: { type: Boolean, default: false },

  // 6. User Role & Permissions
  userRole: { type: String, enum: ['Admin', 'Support', 'Business', 'Personal'], default: 'Personal' },
  businessPrivileges: { type: Boolean, default: false },
  developerMode: { type: Boolean, default: false },
  staffDelegation: { type: Boolean, default: false },

  // 7. AI, Insights & Recommendations
  smartBudgeting: { type: Boolean, default: false },
  spendingAlerts: { type: Boolean, default: false },
  netWorthTracker: { type: Boolean, default: false },
  investmentRecommendations: { type: Boolean, default: false },
  cashFlowForecasting: { type: Boolean, default: false },

  // 8. Other Functional Toggles
  languageCustomization: { type: Boolean, default: false },
  accessibilityMode: { type: Boolean, default: false },
  darkModeDefault: { type: Boolean, default: false },
  customThemes: { type: Boolean, default: false },
  supportChat: { type: Boolean, default: false },
  promotionalEmails: { type: Boolean, default: false },
  feedbackSubmission: { type: Boolean, default: false }
}, { timestamps: true });

const Permissions = mongoose.model('Permissions', PermissionsSchema);
export default Permissions;