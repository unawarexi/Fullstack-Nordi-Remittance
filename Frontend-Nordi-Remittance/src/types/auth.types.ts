// ============================================================================
// AUTH FORM TYPES - Type definitions for authentication forms
// ============================================================================

import type { ReactNode } from "react";

// ============================================================================
// FORM OPTION TYPES
// ============================================================================
// ============================================================================
// LOGIN FORM TYPES
// ============================================================================
// ============================================================================
// SIGNUP FORM TYPES
// ============================================================================
// ============================================================================
// SIGNUP STEP INFO
// ============================================================================
export const signupSteps: Record<number, SignupStepInfo> = {
  1: {
    title: "Personal Details",
    description: "Tell us about yourself",
    fields: [
      "firstName",
      "middleName",
      "lastName",
      "dateOfBirth",
      "gender",
      "nationality",
      "countryOfResidence",
      "maritalStatus",
    ],
  },
  2: {
    title: "Identity Verification",
    description: "Upload your documents for KYC",
    fields: [
      "profilePicture",
      "governmentId",
      "idType",
      "idNumber",
      "idExpiryDate",
      "proofOfAddress",
      "addressDocType",
      "socialSecurityNumber",
      "taxIdentificationNumber",
    ],
  },
  3: {
    title: "Contact Information",
    description: "How can we reach you?",
    fields: [
      "email",
      "mobileNumber",
      "alternativePhone",
      "homeAddress",
      "city",
      "stateProvince",
      "zipCode",
      "country",
    ],
  },
  4: {
    title: "Banking Preferences",
    description: "Set up your account preferences",
    fields: [
      "accountType",
      "currency",
      "sourceOfIncome",
      "monthlyIncomeRange",
      "initialDeposit",
      "employmentStatus",
      "employerName",
      "occupation",
    ],
  },
  5: {
    title: "Bank Account Details",
    description: "Link your existing bank account",
    fields: [
      "accountName",
      "accountNumber",
      "bankName",
      "bankAddress",
      "ibanNumber",
      "routingNumber",
      "swiftBic",
    ],
  },
  6: {
    title: "Security Setup",
    description: "Secure your account",
    fields: [
      "password",
      "confirmPassword",
      "securityQuestion",
      "securityAnswer",
      "enableTwoFactor",
      "twoFactorMethod",
    ],
  },
  7: {
    title: "Terms & Verification",
    description: "Review and accept terms",
    fields: [
      "agreeToTerms",
      "agreeToPrivacy",
      "agreeToDataSharing",
      "referralCode",
      "selfieWithId",
      "signature",
      "inviteCode",
    ],
  },
};

// ============================================================================
// SIGNUP INITIAL VALUES
// ============================================================================

export const signupInitialValues: SignupFormValues = {
  // Step 1: Personal Details
  firstName: "",
  middleName: "",
  lastName: "",
  dateOfBirth: null,
  gender: "",
  nationality: "",
  countryOfResidence: "",
  maritalStatus: "",

  // Step 2: Identity Verification
  profilePicture: null,
  governmentId: null,
  idType: "",
  idNumber: "",
  idExpiryDate: null,
  proofOfAddress: null,
  addressDocType: "",
  socialSecurityNumber: "",
  taxIdentificationNumber: "",

  // Step 3: Contact Information
  email: "",
  mobileNumber: "",
  alternativePhone: "",
  homeAddress: "",
  city: "",
  stateProvince: "",
  zipCode: "",
  country: "",

  // Step 4: Banking Preferences
  accountType: "",
  currency: "",
  sourceOfIncome: "",
  monthlyIncomeRange: "",
  initialDeposit: 0,
  employmentStatus: "",
  employerName: "",
  occupation: "",

  // Step 5: Bank Account Details
  accountName: "",
  accountNumber: "",
  bankName: "",
  bankAddress: "",
  ibanNumber: "",
  routingNumber: "",
  swiftBic: "",

  // Step 6: Security Setup
  password: "",
  confirmPassword: "",
  securityQuestion: "",
  securityAnswer: "",
  enableTwoFactor: true,
  twoFactorMethod: "SMS",

  // Step 7: Terms and Verification
  agreeToTerms: false,
  agreeToPrivacy: false,
  agreeToDataSharing: false,
  referralCode: "",
  selfieWithId: null,
  signature: null,
  inviteCode: "",
};

// ============================================================================
// AUTH LAYOUT TYPES
// ============================================================================
// ============================================================================
// FILE UPLOAD TYPES
// ============================================================================

declare global {
  interface SelectOption {
    value: string;
    label: string;
    code?: string;
    disabled?: boolean;
  }

  interface CountryOption extends SelectOption {
    code: string;
  }

  interface BankOption extends SelectOption {}

  interface LoginFormValues {
    email: string;
    password: string;
  }

  interface SignupFormValues {
    firstName: string;
    middleName?: string;
    lastName: string;
    dateOfBirth: Date | null;
    gender: string;
    nationality: string;
    countryOfResidence: string;
    maritalStatus?: string;
    profilePicture: File | null;
    governmentId: File | null;
    idType: string;
    idNumber: string;
    idExpiryDate: Date | null;
    proofOfAddress: File | null;
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
    accountNumber: string;
    bankName: string;
    bankAddress: string;
    ibanNumber?: string;
    routingNumber?: string;
    swiftBic: string;
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
    selfieWithId: File | null;
    signature?: File | null;
    inviteCode?: string;
  }

  interface SignupStepInfo {
    title: string;
    description: string;
    fields: (keyof SignupFormValues)[];
  }

  interface AuthLayoutProps {
    children: ReactNode;
    title?: string;
    subtitle?: string;
  }

  interface FormContainerProps {
    children: ReactNode;
    step?: number;
    totalSteps?: number;
    className?: string;
  }

  interface FileUploadState {
    profilePicture: string | null;
    governmentId: string | null;
    proofOfAddress: string | null;
    selfieWithId: string | null;
    signature: string | null;
  }

  interface FileUploadProps {
    id: string;
    label: string;
    accept?: string;
    description?: string;
    preview?: string | null;
    error?: string;
    onChange: (file: File | null) => void;
    required?: boolean;
  }
}
