// ============================================================================
// AUTH FORM TYPES - Type definitions for authentication forms
// ============================================================================

import type { ReactNode } from 'react';

// ============================================================================
// FORM OPTION TYPES
// ============================================================================

export interface SelectOption {
  value: string;
  label: string;
  code?: string; // For country codes
  disabled?: boolean;
}

export interface CountryOption extends SelectOption {
  code: string; // Country dialing code
}

export interface BankOption extends SelectOption {}

// ============================================================================
// LOGIN FORM TYPES
// ============================================================================

export interface LoginFormValues {
  email: string;
  password: string;
}

// ============================================================================
// SIGNUP FORM TYPES
// ============================================================================

export interface SignupFormValues {
  // Step 1: Personal Details
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: Date | null;
  gender: string;
  nationality: string;
  countryOfResidence: string;
  maritalStatus?: string;

  // Step 2: Identity Verification
  profilePicture: File | null;
  governmentId: File | null;
  idType: string;
  idNumber: string;
  idExpiryDate: Date | null;
  proofOfAddress: File | null;
  addressDocType: string;
  socialSecurityNumber?: string;
  taxIdentificationNumber: string;

  // Step 3: Contact Information
  email: string;
  mobileNumber: string;
  alternativePhone?: string;
  homeAddress: string;
  city: string;
  stateProvince: string;
  zipCode: string;
  country: string;

  // Step 4: Banking Preferences
  accountType: string;
  currency: string;
  sourceOfIncome: string;
  monthlyIncomeRange: string;
  initialDeposit: number;
  employmentStatus: string;
  employerName?: string;
  occupation: string;

  // Step 5: Bank Account Details
  accountName: string;
  accountNumber: string;
  bankName: string;
  bankAddress: string;
  ibanNumber?: string;
  routingNumber?: string;
  swiftBic: string;

  // Step 6: Security Setup
  password: string;
  confirmPassword: string;
  securityQuestion: string;
  securityAnswer: string;
  enableTwoFactor: boolean;
  twoFactorMethod?: string;

  // Step 7: Terms and Verification
  agreeToTerms: boolean;
  agreeToPrivacy: boolean;
  agreeToDataSharing?: boolean;
  referralCode?: string;
  selfieWithId: File | null;
  signature?: File | null;
  inviteCode?: string;
}

// ============================================================================
// SIGNUP STEP INFO
// ============================================================================

export interface SignupStepInfo {
  title: string;
  description: string;
  fields: (keyof SignupFormValues)[];
}

export const signupSteps: Record<number, SignupStepInfo> = {
  1: {
    title: 'Personal Details',
    description: 'Tell us about yourself',
    fields: ['firstName', 'middleName', 'lastName', 'dateOfBirth', 'gender', 'nationality', 'countryOfResidence', 'maritalStatus'],
  },
  2: {
    title: 'Identity Verification',
    description: 'Upload your documents for KYC',
    fields: ['profilePicture', 'governmentId', 'idType', 'idNumber', 'idExpiryDate', 'proofOfAddress', 'addressDocType', 'socialSecurityNumber', 'taxIdentificationNumber'],
  },
  3: {
    title: 'Contact Information',
    description: 'How can we reach you?',
    fields: ['email', 'mobileNumber', 'alternativePhone', 'homeAddress', 'city', 'stateProvince', 'zipCode', 'country'],
  },
  4: {
    title: 'Banking Preferences',
    description: 'Set up your account preferences',
    fields: ['accountType', 'currency', 'sourceOfIncome', 'monthlyIncomeRange', 'initialDeposit', 'employmentStatus', 'employerName', 'occupation'],
  },
  5: {
    title: 'Bank Account Details',
    description: 'Link your existing bank account',
    fields: ['accountName', 'accountNumber', 'bankName', 'bankAddress', 'ibanNumber', 'routingNumber', 'swiftBic'],
  },
  6: {
    title: 'Security Setup',
    description: 'Secure your account',
    fields: ['password', 'confirmPassword', 'securityQuestion', 'securityAnswer', 'enableTwoFactor', 'twoFactorMethod'],
  },
  7: {
    title: 'Terms & Verification',
    description: 'Review and accept terms',
    fields: ['agreeToTerms', 'agreeToPrivacy', 'agreeToDataSharing', 'referralCode', 'selfieWithId', 'signature', 'inviteCode'],
  },
};

// ============================================================================
// SIGNUP INITIAL VALUES
// ============================================================================

export const signupInitialValues: SignupFormValues = {
  // Step 1: Personal Details
  firstName: '',
  middleName: '',
  lastName: '',
  dateOfBirth: null,
  gender: '',
  nationality: '',
  countryOfResidence: '',
  maritalStatus: '',

  // Step 2: Identity Verification
  profilePicture: null,
  governmentId: null,
  idType: '',
  idNumber: '',
  idExpiryDate: null,
  proofOfAddress: null,
  addressDocType: '',
  socialSecurityNumber: '',
  taxIdentificationNumber: '',

  // Step 3: Contact Information
  email: '',
  mobileNumber: '',
  alternativePhone: '',
  homeAddress: '',
  city: '',
  stateProvince: '',
  zipCode: '',
  country: '',

  // Step 4: Banking Preferences
  accountType: '',
  currency: '',
  sourceOfIncome: '',
  monthlyIncomeRange: '',
  initialDeposit: 0,
  employmentStatus: '',
  employerName: '',
  occupation: '',

  // Step 5: Bank Account Details
  accountName: '',
  accountNumber: '',
  bankName: '',
  bankAddress: '',
  ibanNumber: '',
  routingNumber: '',
  swiftBic: '',

  // Step 6: Security Setup
  password: '',
  confirmPassword: '',
  securityQuestion: '',
  securityAnswer: '',
  enableTwoFactor: true,
  twoFactorMethod: 'SMS',

  // Step 7: Terms and Verification
  agreeToTerms: false,
  agreeToPrivacy: false,
  agreeToDataSharing: false,
  referralCode: '',
  selfieWithId: null,
  signature: null,
  inviteCode: '',
};

// ============================================================================
// AUTH LAYOUT TYPES
// ============================================================================

export interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export interface FormContainerProps {
  children: ReactNode;
  step?: number;
  totalSteps?: number;
  className?: string;
}

// ============================================================================
// FILE UPLOAD TYPES
// ============================================================================

export interface FileUploadState {
  profilePicture: string | null;
  governmentId: string | null;
  proofOfAddress: string | null;
  selfieWithId: string | null;
  signature: string | null;
}

export interface FileUploadProps {
  id: string;
  label: string;
  accept?: string;
  description?: string;
  preview?: string | null;
  error?: string;
  onChange: (file: File | null) => void;
  required?: boolean;
}
