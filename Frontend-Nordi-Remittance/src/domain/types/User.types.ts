// ============================================================================
// USER TYPES — Mirrors UserModel.ts
// ============================================================================

declare global {
  interface User extends Timestamps {
    id: UUID;
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    avatar?: string;
    dateOfBirth?: ISO8601Date;
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
    nationality?: string;
    countryOfResidence?: string;
    maritalStatus?: string;
    role: UserRole;
    status: UserStatus;
    kycStatus: KycStatus;
    kycLevel: KycLevel;
    twoFactorEnabled: boolean;
    emailVerified: boolean;
    phoneVerified: boolean;
    lastLoginAt?: ISO8601Date;
    lastLoginIp?: string;
    referralCode?: string;
    referredBy?: UUID;
    // Clerk integration
    clerkUserId?: string;
    authProvider?: 'local' | 'clerk' | 'google';
    isActive: boolean;
    accountNumber?: string;
    accountStatus?: 'active' | 'suspended' | 'banned' | 'restricted';
    // Security
    isLocked?: boolean;
    lockReason?: string;
    mustChangePassword?: boolean;
  }

  interface UserProfile extends User {
    address?: Address;
    employment?: EmploymentInfo;
    bankAccounts: BankAccount[];
    documents: KycDocument[];
  }

  interface Address {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    unit?: string;
  }

  interface EmploymentInfo {
    status: 'employed' | 'self_employed' | 'unemployed' | 'retired' | 'student';
    employer?: string;
    jobTitle?: string;
    industry?: string;
    annualIncome?: number;
    sourceOfFunds: string;
  }

  interface KycDocument extends Timestamps {
    id: UUID;
    type: KycDocumentType;
    status: 'pending' | 'approved' | 'rejected';
    frontImageUrl?: string;
    backImageUrl?: string;
    expiryDate?: ISO8601Date;
    documentNumber?: string;
    rejectionReason?: string;
  }

  interface BankAccount extends Timestamps {
    id: UUID;
    bankName: string;
    accountNumber: string;
    accountName: string;
    routingNumber?: string;
    swiftCode?: string;
    iban?: string;
    currency: Currency;
    isVerified: boolean;
    isPrimary: boolean;
  }

  interface UserSession {
    sessionId: string;
    deviceId?: string;
    deviceType?: string;
    browser?: string;
    os?: string;
    ipAddress?: string;
    location?: string;
    createdAt: ISO8601Date;
    lastActiveAt: ISO8601Date;
  }

  interface TrustedDevice {
    id: UUID;
    name: string;
    deviceInfo: DeviceInfo;
    addedAt: ISO8601Date;
    lastUsedAt: ISO8601Date;
  }

  // ==========================================================================
  // AUTH REQUEST/RESPONSE TYPES
  // ==========================================================================

  interface LoginRequest {
    email: string;
    password: string;
    deviceId?: string;
    deviceInfo?: DeviceInfo;
  }

  interface LoginResponse {
    user: User;
    tokens?: {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    };
    accessToken?: string;
    refreshToken?: string;
    expiresIn?: number;
    wallet?: any;
    requiresTwoFactor?: boolean;
    requires2FA?: boolean;
    tempToken?: string;
    twoFactorToken?: string;
    method?: string;
    twoFactorMethod?: 'sms' | 'email' | 'authenticator';
  }

  interface ClerkSyncResponse {
    requiresOtp: boolean;
    otpSessionToken?: string;
    email?: string;
    isAdmin?: boolean;
    user?: User;
    admin?: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      avatar?: string;
      profilePicture?: string;
      kycStatus?: string;
      emailVerified?: boolean;
      phoneVerified?: boolean;
    };
    tokens?: {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    };
    accessToken?: string;
    refreshToken?: string;
    expiresIn?: number;
    wallet?: any;
  }

  interface RegisterRequest {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    phone: string;
    dateOfBirth?: ISO8601Date;
    referralCode?: string;
    acceptTerms: boolean;
  }

  interface FullKycRegisterRequest {
    firstName: string;
    middleName?: string;
    lastName: string;
    dateOfBirth: ISO8601Date;
    gender: string;
    nationality: string;
    countryOfResidence: string;
    maritalStatus?: string;
    idType: string;
    idNumber: string;
    idExpiryDate: ISO8601Date;
    addressDocType: string;
    socialSecurityNumber?: string;
    taxIdentificationNumber: string;
    email: string;
    mobileNumber: string;
    alternativePhone?: string;
    homeAddress: string;
    city: string;
    stateProvince: string;
    zipCode: string;
    country: string;
    accountType: string;
    currency: string;
    sourceOfIncome: string;
    monthlyIncomeRange: string;
    initialDeposit: number;
    employmentStatus: string;
    employerName?: string;
    occupation: string;
    accountName: string;
    externalAccountNumber: string;
    bankName: string;
    bankAddress: string;
    ibanNumber?: string;
    routingNumber?: string;
    swiftBic: string;
    profilePicture?: File;
    governmentId?: File;
    proofOfAddress?: File;
    selfieWithId?: File;
    signature?: File;
    password: string;
    confirmPassword: string;
    securityQuestion: string;
    securityAnswer: string;
    enableTwoFactor: boolean;
    twoFactorMethod?: string;
    agreeToTerms: boolean;
    agreeToPrivacy: boolean;
    agreeToDataSharing?: boolean;
    referralCode?: string;
    inviteCode?: string;
  }

  interface TwoFactorAuthRequest {
    code: string;
    tempToken: string;
  }

  interface ResetPasswordRequest {
    email: string;
  }

  interface ConfirmResetPasswordRequest {
    token: string;
    password: string;
    confirmPassword: string;
  }

  interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }

  interface SecuritySession extends Timestamps {
    id: UUID;
    userId: UUID;
    deviceInfo: DeviceInfo;
    ipAddress: string;
    location?: string;
    isActive: boolean;
    lastActiveAt: ISO8601Date;
    expiresAt: ISO8601Date;
  }

  interface SecuritySettings {
    twoFactorEnabled: boolean;
    twoFactorMethod?: 'sms' | 'email' | 'authenticator';
    loginNotifications: boolean;
    transactionNotifications: boolean;
    biometricEnabled: boolean;
    trustedDevices: TrustedDevice[];
  }
}

export {};
