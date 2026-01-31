// ============================================================================
// AUTH VALIDATORS - Zod schemas for authentication forms
// ============================================================================

import { z } from 'zod';

// ============================================================================
// COMMON VALIDATORS
// ============================================================================

export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character');

export const phoneSchema = z
  .string()
  .min(10, 'Phone number must be at least 10 digits')
  .regex(/^\+?[0-9\s\-()]+$/, 'Please enter a valid phone number');

export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must be less than 50 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes');

// ============================================================================
// LOGIN SCHEMA
// ============================================================================

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// ============================================================================
// SIGNUP STEP SCHEMAS
// ============================================================================

// Step 1: Personal Details
export const personalDetailsSchema = z.object({
  firstName: nameSchema,
  middleName: z.string().optional(),
  lastName: nameSchema,
  dateOfBirth: z.date({ message: 'Date of birth is required' }).refine(
    (date) => {
      const today = new Date();
      const birthDate = new Date(date);
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        return age - 1 >= 18;
      }
      return age >= 18;
    },
    { message: 'You must be at least 18 years old' }
  ),
  gender: z.string().min(1, 'Gender is required'),
  nationality: z.string().min(1, 'Nationality is required'),
  countryOfResidence: z.string().min(1, 'Country of residence is required'),
  maritalStatus: z.string().optional(),
});

// Step 2: Identity Verification
export const identityVerificationSchema = z.object({
  profilePicture: z.custom<File>((val) => val instanceof File, {
    message: 'Profile picture is required',
  }),
  governmentId: z.custom<File>((val) => val instanceof File, {
    message: 'Government ID is required',
  }),
  idType: z.string().min(1, 'ID type is required'),
  idNumber: z.string().min(1, 'ID number is required'),
  idExpiryDate: z.date({ message: 'ID expiry date is required' }).refine(
    (date) => date > new Date(),
    { message: 'ID must not be expired' }
  ),
  proofOfAddress: z.custom<File>((val) => val instanceof File, {
    message: 'Proof of address is required',
  }),
  addressDocType: z.string().min(1, 'Address document type is required'),
  socialSecurityNumber: z.string().optional(),
  taxIdentificationNumber: z.string().min(1, 'Tax identification number is required'),
});

// Step 3: Contact Information
export const contactInfoSchema = z.object({
  email: emailSchema,
  mobileNumber: phoneSchema,
  alternativePhone: z.string().optional(),
  homeAddress: z.string().min(5, 'Home address is required'),
  city: z.string().min(2, 'City is required'),
  stateProvince: z.string().min(2, 'State/Province is required'),
  zipCode: z.string().min(3, 'ZIP/Postal code is required'),
  country: z.string().min(1, 'Country is required'),
});

// Step 4: Banking Preferences
export const bankingPreferencesSchema = z.object({
  accountType: z.string().min(1, 'Account type is required'),
  currency: z.string().min(1, 'Currency is required'),
  sourceOfIncome: z.string().min(1, 'Source of income is required'),
  monthlyIncomeRange: z.string().min(1, 'Monthly income range is required'),
  initialDeposit: z.number().min(100, 'Minimum deposit of 100 required'),
  employmentStatus: z.string().min(1, 'Employment status is required'),
  employerName: z.string().optional(),
  occupation: z.string().min(1, 'Occupation is required'),
}).refine(
  (data) => {
    if (data.employmentStatus === 'employed' || data.employmentStatus === 'self-employed') {
      return !!data.employerName && data.employerName.length > 0;
    }
    return true;
  },
  {
    message: 'Employer name is required for employed individuals',
    path: ['employerName'],
  }
);

// Step 5: Bank Account Details
export const bankAccountSchema = z.object({
  accountName: z.string().min(1, 'Account name is required'),
  accountNumber: z.string().min(1, 'Account number is required'),
  bankName: z.string().min(1, 'Bank name is required'),
  bankAddress: z.string().min(1, 'Bank address is required'),
  ibanNumber: z.string().optional(),
  routingNumber: z.string().optional(),
  swiftBic: z.string().min(1, 'SWIFT/BIC is required'),
  useIban: z.boolean(),
}).refine(
  (data) => {
    if (data.useIban) {
      return !!data.ibanNumber && data.ibanNumber.length > 0;
    }
    return !!data.routingNumber && data.routingNumber.length > 0;
  },
  {
    message: 'Either IBAN or Routing number is required',
    path: ['ibanNumber'],
  }
);

// Step 6: Security Setup
export const securitySetupSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Password confirmation is required'),
  securityQuestion: z.string().min(1, 'Security question is required'),
  securityAnswer: z.string().min(1, 'Security answer is required'),
  enableTwoFactor: z.boolean(),
  twoFactorMethod: z.string().optional(),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }
).refine(
  (data) => {
    if (data.enableTwoFactor) {
      return !!data.twoFactorMethod;
    }
    return true;
  },
  {
    message: 'Two-factor method is required when 2FA is enabled',
    path: ['twoFactorMethod'],
  }
);

// Step 7: Terms and Verification
export const termsVerificationSchema = z.object({
  agreeToTerms: z.literal(true, { message: 'You must agree to the terms and conditions' }),
  agreeToPrivacy: z.literal(true, { message: 'You must agree to the privacy policy' }),
  agreeToDataSharing: z.boolean().optional(),
  referralCode: z.string().optional(),
  selfieWithId: z.custom<File>((val) => val instanceof File, {
    message: 'Selfie with ID is required',
  }),
  signature: z.custom<File | null>().optional(),
  inviteCode: z.string().optional(),
});

// ============================================================================
// COMPLETE SIGNUP SCHEMA
// ============================================================================

export const signupSchema = z.object({
  // Step 1: Personal Details
  firstName: nameSchema,
  middleName: z.string().optional(),
  lastName: nameSchema,
  dateOfBirth: z.date({ message: 'Date of birth is required' }),
  gender: z.string().min(1, 'Gender is required'),
  nationality: z.string().min(1, 'Nationality is required'),
  countryOfResidence: z.string().min(1, 'Country of residence is required'),
  maritalStatus: z.string().optional(),

  // Step 2: Identity Verification
  profilePicture: z.custom<File | null>(),
  governmentId: z.custom<File | null>(),
  idType: z.string().min(1, 'ID type is required'),
  idNumber: z.string().min(1, 'ID number is required'),
  idExpiryDate: z.date(),
  proofOfAddress: z.custom<File | null>(),
  addressDocType: z.string().min(1, 'Address document type is required'),
  socialSecurityNumber: z.string().optional(),
  taxIdentificationNumber: z.string().min(1, 'Tax identification number is required'),

  // Step 3: Contact Information
  email: emailSchema,
  mobileNumber: phoneSchema,
  alternativePhone: z.string().optional(),
  homeAddress: z.string().min(5, 'Home address is required'),
  city: z.string().min(2, 'City is required'),
  stateProvince: z.string().min(2, 'State/Province is required'),
  zipCode: z.string().min(3, 'ZIP/Postal code is required'),
  country: z.string().min(1, 'Country is required'),

  // Step 4: Banking Preferences
  accountType: z.string().min(1, 'Account type is required'),
  currency: z.string().min(1, 'Currency is required'),
  sourceOfIncome: z.string().min(1, 'Source of income is required'),
  monthlyIncomeRange: z.string().min(1, 'Monthly income range is required'),
  initialDeposit: z.number().min(100, 'Minimum deposit of 100 required'),
  employmentStatus: z.string().min(1, 'Employment status is required'),
  employerName: z.string().optional(),
  occupation: z.string().min(1, 'Occupation is required'),

  // Step 5: Bank Account Details
  accountName: z.string().min(1, 'Account name is required'),
  accountNumber: z.string().min(1, 'Account number is required'),
  bankName: z.string().min(1, 'Bank name is required'),
  bankAddress: z.string().min(1, 'Bank address is required'),
  ibanNumber: z.string().optional(),
  routingNumber: z.string().optional(),
  swiftBic: z.string().min(1, 'SWIFT/BIC is required'),

  // Step 6: Security Setup
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Password confirmation is required'),
  securityQuestion: z.string().min(1, 'Security question is required'),
  securityAnswer: z.string().min(1, 'Security answer is required'),
  enableTwoFactor: z.boolean(),
  twoFactorMethod: z.string().optional(),

  // Step 7: Terms and Verification
  agreeToTerms: z.boolean(),
  agreeToPrivacy: z.boolean(),
  agreeToDataSharing: z.boolean().optional(),
  referralCode: z.string().optional(),
  selfieWithId: z.custom<File | null>(),
  signature: z.custom<File | null>().optional(),
  inviteCode: z.string().optional(),
});

export type SignupFormData = z.infer<typeof signupSchema>;

// ============================================================================
// STEP SCHEMA MAP
// ============================================================================

export const stepSchemas = {
  1: personalDetailsSchema,
  2: identityVerificationSchema,
  3: contactInfoSchema,
  4: bankingPreferencesSchema,
  5: bankAccountSchema,
  6: securitySetupSchema,
  7: termsVerificationSchema,
} as const;

// Get schema for a specific step
export const getStepSchema = (step: number) => {
  return stepSchemas[step as keyof typeof stepSchemas];
};
