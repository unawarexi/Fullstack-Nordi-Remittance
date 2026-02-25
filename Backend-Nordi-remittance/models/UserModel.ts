import mongoose, { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

// Create schema
const UserSchema: Schema = new Schema({
  _id: { type: String, default: uuidv4 },
  // Step 1: Personal Details
  firstName: { type: String, required: true },
  middleName: { type: String },
  lastName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, required: true },
  nationality: { type: String, required: true },
  countryOfResidence: { type: String, required: true },
  maritalStatus: { type: String },

  // Step 2: Identity Verification
  profilePicture: { type: Schema.Types.Mixed },
  governmentId: { type: Schema.Types.Mixed },
  idType: { type: String, required: true },
  idNumber: { type: String, required: true },
  idExpiryDate: { type: Date, required: true },
  proofOfAddress: { type: Schema.Types.Mixed },
  addressDocType: { type: String, required: true },
  socialSecurityNumber: { type: String },
  taxIdentificationNumber: { type: String, required: true },

  // Step 3: Contact Information
  email: { type: String, required: true, unique: true },
  mobileNumber: { type: String, required: true },
  alternativePhone: { type: String },
  homeAddress: { type: String, required: true },
  city: { type: String, required: true },
  stateProvince: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, required: true },

  // Step 4: Banking Preferences
  accountType: { type: String, required: true },
  currency: { type: String, required: true },
  sourceOfIncome: { type: String, required: true },
  monthlyIncomeRange: { type: String, required: true },
  initialDeposit: { type: Number, required: true },
  employmentStatus: { type: String, required: true },
  employerName: { type: String },
  occupation: { type: String, required: true },

  // Step 5: Bank Account Details
  accountName: { type: String, required: true },
  externalAccountNumber: { type: String, required: true },
  bankName: { type: String, required: true },
  bankAddress: { type: String, required: true },
  ibanNumber: {
    type: String,
    validate: {
      validator: function (this: any, value?: string): boolean {
        return !!this.routingNumber || !!value;
      },
      message: "Either ibanNumber or routingNumber must be provided.",
    },
  },
  routingNumber: {
    type: String,
    validate: {
      validator: function (this: any, value?: string): boolean {
        return !!this.ibanNumber || !!value;
      },
      message: "Either routingNumber or ibanNumber must be provided.",
    },
  },
  swiftBic: { type: String, required: true },

  // Step 6: Security Setup
  password: { type: String, required: true },
  securityQuestion: { type: String, required: true },
  securityAnswer: { type: String, required: true },
  enableTwoFactor: { type: Boolean, required: true },
  twoFactorMethod: { type: String },

  // Step 7: Terms and Verification
  agreeToTerms: { type: Boolean, required: true },
  agreeToPrivacy: { type: Boolean, required: true },
  agreeToDataSharing: { type: Boolean },
  referralCode: { type: String },
  selfieWithId: { type: Schema.Types.Mixed },
  signature: { type: Schema.Types.Mixed },
  inviteCode: { type: String },

  // Additional fields from controller
  role: { type: String, enum: ["user", "admin", "support"], default: "user" },
  accountNumber: { type: String, unique: true, sparse: true },
  emailVerified: { type: Boolean, default: false },
  phoneVerified: { type: Boolean, default: false },
  status: { type: String, enum: ["active", "inactive", "suspended", "banned"], default: "active" },
  activationToken: { type: String },
  isActive: { type: Boolean, default: false },
  kycStatus: { type: String, default: "pending" },
  kycNotes: { type: String },
  lastLogin: { type: Date },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  twoFactorToken: { type: String },
  twoFactorExpiry: { type: Date },
  verificationCode: { type: String },
  verificationCodeExpiry: { type: Date },
  isLocked: { type: Boolean, default: false },
  lockReason: { type: String },
  lockedAt: { type: Date },
  unlockNotes: { type: String },
  unlockedAt: { type: Date },
  mustChangePassword: { type: Boolean, default: false },
  loginAttempts: [
    {
      timestamp: { type: Date },
      successful: { type: Boolean },
      ipAddress: { type: String },
      userAgent: { type: String },
    },
  ],
  lastLogout: { type: Date },

  // Active sessions for multi-device management
  activeSessions: [
    {
      sessionId: { type: String, required: true },
      deviceId: { type: String },
      deviceType: { type: String },
      browser: { type: String },
      os: { type: String },
      ipAddress: { type: String },
      location: { type: String },
      createdAt: { type: Date, default: Date.now },
      lastActiveAt: { type: Date, default: Date.now },
    },
  ],

  // Two-factor authentication
  twoFactorSecret: { type: String },
  twoFactorEnabled: { type: Boolean, default: false },
  backupCodes: [{ type: String }],

  // Trusted devices
  trustedDevices: [
    {
      deviceId: { type: String, required: true },
      deviceName: { type: String },
      deviceType: { type: String },
      browser: { type: String },
      os: { type: String },
      trustedAt: { type: Date, default: Date.now },
      lastUsedAt: { type: Date, default: Date.now },
    },
  ],

  // Security settings
  securitySettings: {
    loginNotifications: { type: Boolean, default: true },
    transactionNotifications: { type: Boolean, default: true },
    marketingEmails: { type: Boolean, default: false },
  },

  // Account status
  accountStatus: {
    type: String,
    enum: ["active", "suspended", "banned", "restricted"],
    default: "active",
  },
});

// pre-save hook to validate that either iban or routing is provided.
UserSchema.pre("save", function () {
  if (!this._id) {
    this._id = uuidv4();
  }
  if (!this.ibanNumber && !this.routingNumber) {
    throw new Error("Either ibanNumber or routingNumber must be provided.");
  }
});

// ==========================================================================
// INDEXES — Critical for search performance
// ==========================================================================
// Exact match indexes (high selectivity)
UserSchema.index({ mobileNumber: 1 }, { unique: true, sparse: true });
UserSchema.index({ idNumber: 1 }, { sparse: true });

// Filter/sort compound indexes
UserSchema.index({ accountStatus: 1, kycStatus: 1 });
UserSchema.index({ kycStatus: 1 });
UserSchema.index({ isActive: 1 });

// Text index for admin user search (replaces unanchored regex scans)
UserSchema.index(
  { email: "text", firstName: "text", lastName: "text", mobileNumber: "text" },
  { name: "idx_users_text_search", weights: { email: 10, firstName: 5, lastName: 5, mobileNumber: 3 } },
);

// Create and export model
const Users = mongoose.model("Users", UserSchema);
export default Users;
