// ============================================================================
// SIGNUP STEPS - Individual step components for signup form
// ============================================================================

// React and RHF
import React from "react";
import {
  UseFormRegister,
  FieldErrors,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";

// Components
import {
  Input,
  Select,
  FileUpload,
  Textarea,
  DatePicker,
} from "@components/ui";

// Types
import type { SignupFormValues } from "@utils/validators/auth.validators";

// Helpers
import { datePickerConfig } from "@utils/helpers/date.helpers";
import { getBankingRequirements } from "@utils/helpers/banking.helpers";

// Form Options
import {
  genderOptions,
  maritalStatusOptions,
  idTypeOptions,
  addressDocTypeOptions,
  accountTypeOptions,
  currencyOptions,
  sourceOfIncomeOptions,
  monthlyIncomeRangeOptions,
  employmentStatusOptions,
  securityQuestionOptions,
  twoFactorMethodOptions,
} from "@utils/constants/form-options";

// ============================================================================
// TYPES
// ============================================================================

interface StepProps {
  register: UseFormRegister<SignupFormValues>;
  errors: FieldErrors<SignupFormValues>;
  setValue: UseFormSetValue<SignupFormValues>;
  watch: UseFormWatch<SignupFormValues>;
  countries: SelectOption[];
  banks: SelectOption[];
}

// ============================================================================
// STEP 1: PERSONAL DETAILS
// ============================================================================

export const PersonalDetailsStep = ({
  register,
  errors,
  setValue,
  watch,
  countries,
}: StepProps) => {
  const dateOfBirth = watch("dateOfBirth");
  const gender = watch("gender");
  const nationality = watch("nationality");
  const countryOfResidence = watch("countryOfResidence");
  const maritalStatus = watch("maritalStatus");

  return (
    <section className="space-y-4">
      <h2 className="mb-4 text-xl font-semibold text-gray-900">
        Personal Details
      </h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label="First Name"
          placeholder="As per ID"
          error={errors.firstName?.message}
          isRequired
          {...register("firstName")}
        />

        <Input
          label="Middle Name"
          placeholder="Optional"
          error={errors.middleName?.message}
          {...register("middleName")}
        />
      </div>

      <Input
        label="Last Name"
        placeholder="As per ID"
        error={errors.lastName?.message}
        isRequired
        {...register("lastName")}
      />

      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-700">
          Date of Birth <span className="text-error-500">*</span>
        </label>
        <DatePicker
          selected={dateOfBirth}
          onChange={(date) => setValue("dateOfBirth", date)}
          className="h-10 w-full rounded-lg border border-neutral-300 px-4 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          {...datePickerConfig.dateOfBirth}
        />
        {errors.dateOfBirth && (
          <p className="mt-1.5 text-xs text-error-500">
            {errors.dateOfBirth.message}
          </p>
        )}
      </div>

      <Select
        label="Gender"
        options={genderOptions}
        value={gender}
        onChange={(value) => setValue("gender", value)}
        error={errors.gender?.message}
        isRequired
      />

      <Select
        label="Nationality"
        options={countries}
        value={nationality}
        onChange={(value) => setValue("nationality", value)}
        error={errors.nationality?.message}
        isRequired
        searchable
      />

      <Select
        label="Country of Residence"
        options={countries}
        value={countryOfResidence}
        onChange={(value) => setValue("countryOfResidence", value)}
        error={errors.countryOfResidence?.message}
        isRequired
        searchable
      />

      <Select
        label="Marital Status"
        options={maritalStatusOptions}
        value={maritalStatus}
        onChange={(value) => setValue("maritalStatus", value)}
        error={errors.maritalStatus?.message}
      />
    </section>
  );
};

// ============================================================================
// STEP 2: IDENTITY VERIFICATION
// ============================================================================

export const IdentityVerificationStep = ({
  register,
  errors,
  setValue,
  watch,
}: StepProps) => {
  const idExpiryDate = watch("idExpiryDate");
  const idType = watch("idType");
  const addressDocType = watch("addressDocType");
  const profilePicture = watch("profilePicture");
  const governmentId = watch("governmentId");
  const proofOfAddress = watch("proofOfAddress");

  return (
    <section className="space-y-4">
      <h2 className="mb-4 text-xl font-semibold text-gray-900">
        Identity Verification (KYC)
      </h2>

      <FileUpload
        id="profilePicture"
        label="Profile Picture"
        accept="image/*"
        description="PNG, JPG up to 5MB"
        error={errors.profilePicture?.message as string}
        onChange={(file) => setValue("profilePicture", file)}
        value={profilePicture}
        required
      />

      <FileUpload
        id="governmentId"
        label="Government ID"
        accept="image/*,.pdf"
        description="Passport, National ID, or Driver's License"
        error={errors.governmentId?.message as string}
        onChange={(file) => setValue("governmentId", file)}
        value={governmentId}
        required
      />

      <Select
        label="ID Type"
        options={idTypeOptions}
        value={idType}
        onChange={(value) => setValue("idType", value)}
        error={errors.idType?.message}
        isRequired
      />

      <Input
        label="ID Number"
        placeholder="As shown on your ID"
        error={errors.idNumber?.message}
        isRequired
        {...register("idNumber")}
      />

      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-700">
          ID Expiry Date <span className="text-error-500">*</span>
        </label>
        <DatePicker
          selected={idExpiryDate}
          onChange={(date) => setValue("idExpiryDate", date)}
          className="h-10 w-full rounded-lg border border-neutral-300 px-4 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          {...datePickerConfig.idExpiry}
        />
        {errors.idExpiryDate && (
          <p className="mt-1.5 text-xs text-error-500">
            {errors.idExpiryDate.message}
          </p>
        )}
      </div>

      <FileUpload
        id="proofOfAddress"
        label="Proof of Address"
        accept="image/*,.pdf"
        description="Utility bill, bank statement (within 3 months)"
        error={errors.proofOfAddress?.message as string}
        onChange={(file) => setValue("proofOfAddress", file)}
        value={proofOfAddress}
        required
      />

      <Select
        label="Address Document Type"
        options={addressDocTypeOptions}
        value={addressDocType}
        onChange={(value) => setValue("addressDocType", value)}
        error={errors.addressDocType?.message}
        isRequired
      />

      <Input
        label="Social Security Number"
        placeholder="Optional"
        error={errors.socialSecurityNumber?.message}
        {...register("socialSecurityNumber")}
      />

      <Input
        label="Tax Identification Number"
        placeholder="Required for tax reporting"
        error={errors.taxIdentificationNumber?.message}
        isRequired
        {...register("taxIdentificationNumber")}
      />
    </section>
  );
};

// ============================================================================
// STEP 3: CONTACT INFORMATION
// ============================================================================

export const ContactInfoStep = ({
  register,
  errors,
  setValue,
  watch,
  countries,
}: StepProps) => {
  const country = watch("country");

  return (
    <section className="space-y-4">
      <h2 className="mb-4 text-xl font-semibold text-gray-900">
        Contact Information
      </h2>

      <Input
        label="Email Address"
        type="email"
        placeholder="For verification"
        error={errors.email?.message}
        isRequired
        {...register("email")}
      />

      <Input
        label="Mobile Number"
        placeholder="With country code (e.g., +1234567890)"
        error={errors.mobileNumber?.message}
        isRequired
        {...register("mobileNumber")}
      />

      <Input
        label="Alternative Phone"
        placeholder="Optional"
        error={errors.alternativePhone?.message}
        {...register("alternativePhone")}
      />

      <Textarea
        label="Home Address"
        placeholder="Full street address"
        error={errors.homeAddress?.message}
        isRequired
        {...register("homeAddress")}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label="City"
          placeholder="City"
          error={errors.city?.message}
          isRequired
          {...register("city")}
        />

        <Input
          label="State/Province"
          placeholder="State or Province"
          error={errors.stateProvince?.message}
          isRequired
          {...register("stateProvince")}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label="ZIP/Postal Code"
          placeholder="ZIP Code"
          error={errors.zipCode?.message}
          isRequired
          {...register("zipCode")}
        />

        <Select
          label="Country"
          options={countries}
          value={country}
          onChange={(value) => setValue("country", value)}
          error={errors.country?.message}
          isRequired
          searchable
        />
      </div>
    </section>
  );
};

// ============================================================================
// STEP 4: BANKING PREFERENCES
// ============================================================================

export const BankingPreferencesStep = ({
  register,
  errors,
  setValue,
  watch,
}: StepProps) => {
  const accountType = watch("accountType");
  const currency = watch("currency");
  const sourceOfIncome = watch("sourceOfIncome");
  const monthlyIncomeRange = watch("monthlyIncomeRange");
  const employmentStatus = watch("employmentStatus");

  const showEmployerName =
    employmentStatus === "employed" || employmentStatus === "self-employed";

  return (
    <section className="space-y-4">
      <h2 className="mb-4 text-xl font-semibold text-gray-900">
        Banking Preferences
      </h2>

      <Select
        label="Account Type"
        options={accountTypeOptions}
        value={accountType}
        onChange={(value) => setValue("accountType", value)}
        error={errors.accountType?.message}
        isRequired
      />

      <Select
        label="Preferred Currency"
        options={currencyOptions}
        value={currency}
        onChange={(value) => setValue("currency", value)}
        error={errors.currency?.message}
        isRequired
        searchable
      />

      <Select
        label="Primary Source of Income"
        options={sourceOfIncomeOptions}
        value={sourceOfIncome}
        onChange={(value) => setValue("sourceOfIncome", value)}
        error={errors.sourceOfIncome?.message}
        isRequired
      />

      <Select
        label="Monthly Income Range"
        options={monthlyIncomeRangeOptions}
        value={monthlyIncomeRange}
        onChange={(value) => setValue("monthlyIncomeRange", value)}
        error={errors.monthlyIncomeRange?.message}
        isRequired
      />

      <Input
        label="Initial Deposit Amount"
        type="number"
        placeholder="Minimum $100"
        error={errors.initialDeposit?.message}
        isRequired
        {...register("initialDeposit", { valueAsNumber: true })}
      />

      <Select
        label="Employment Status"
        options={employmentStatusOptions}
        value={employmentStatus}
        onChange={(value) => setValue("employmentStatus", value)}
        error={errors.employmentStatus?.message}
        isRequired
      />

      {showEmployerName && (
        <Input
          label="Employer Name"
          placeholder="Company or Business Name"
          error={errors.employerName?.message}
          isRequired
          {...register("employerName")}
        />
      )}

      <Input
        label="Occupation"
        placeholder="Your job title or role"
        error={errors.occupation?.message}
        isRequired
        {...register("occupation")}
      />
    </section>
  );
};

// ============================================================================
// STEP 5: BANK ACCOUNT DETAILS
// ============================================================================

export const BankAccountStep = ({
  register,
  errors,
  setValue,
  watch,
  banks,
}: StepProps) => {
  const bankName = watch("bankName");
  const country = watch("country");

  // Get banking requirements based on country
  const bankingReqs = getBankingRequirements(country || "US");

  return (
    <section className="space-y-4">
      <h2 className="mb-4 text-xl font-semibold text-gray-900">
        Bank Account Details
      </h2>
      <p className="mb-4 text-sm text-neutral-500">
        Link your existing bank account for transfers and withdrawals.
      </p>

      <Input
        label="Account Holder Name"
        placeholder="Name as it appears on your bank account"
        error={errors.accountName?.message}
        isRequired
        {...register("accountName")}
      />

      <Input
        label="Account Number"
        placeholder="Your bank account number"
        error={errors.accountNumber?.message}
        isRequired
        {...register("accountNumber")}
      />

      <Select
        label="Bank Name"
        options={banks}
        value={bankName}
        onChange={(value) => setValue("bankName", value)}
        error={errors.bankName?.message}
        isRequired
        searchable
      />

      <Input
        label="Bank Address"
        placeholder="Bank branch address"
        error={errors.bankAddress?.message}
        isRequired
        {...register("bankAddress")}
      />

      {/* Conditional IBAN or Routing Number based on country */}
      {bankingReqs.useIban ? (
        <Input
          label="IBAN"
          placeholder="International Bank Account Number"
          error={errors.ibanNumber?.message}
          isRequired
          helperText="IBAN is required for your selected country"
          {...register("ibanNumber")}
        />
      ) : (
        <Input
          label={bankingReqs.routingLabel}
          placeholder={`Enter your ${bankingReqs.routingLabel.toLowerCase()}`}
          error={errors.routingNumber?.message}
          isRequired
          {...register("routingNumber")}
        />
      )}

      <Input
        label="SWIFT/BIC Code"
        placeholder="Bank's SWIFT/BIC code"
        error={errors.swiftBic?.message}
        isRequired
        helperText="Required for international transfers"
        {...register("swiftBic")}
      />
    </section>
  );
};

// ============================================================================
// STEP 6: SECURITY SETUP
// ============================================================================

export const SecuritySetupStep = ({
  register,
  errors,
  setValue,
  watch,
}: StepProps) => {
  const securityQuestion = watch("securityQuestion");
  const enableTwoFactor = watch("enableTwoFactor");
  const twoFactorMethod = watch("twoFactorMethod");

  return (
    <section className="space-y-4">
      <h2 className="mb-4 text-xl font-semibold text-gray-900">
        Security Setup
      </h2>
      <p className="mb-4 text-sm text-neutral-500">
        Create a strong password and set up additional security measures.
      </p>

      <Input
        label="Password"
        type="password"
        placeholder="Create a strong password"
        error={errors.password?.message}
        showPasswordToggle
        isRequired
        helperText="Min 8 characters with uppercase, lowercase, number, and special character"
        {...register("password")}
      />

      <Input
        label="Confirm Password"
        type="password"
        placeholder="Confirm your password"
        error={errors.confirmPassword?.message}
        showPasswordToggle
        isRequired
        {...register("confirmPassword")}
      />

      <Select
        label="Security Question"
        options={securityQuestionOptions}
        value={securityQuestion}
        onChange={(value) => setValue("securityQuestion", value)}
        error={errors.securityQuestion?.message}
        isRequired
      />

      <Input
        label="Security Answer"
        placeholder="Your answer to the security question"
        error={errors.securityAnswer?.message}
        isRequired
        {...register("securityAnswer")}
      />

      <div className="flex items-center gap-3 rounded-lg bg-neutral-50 p-4">
        <input
          type="checkbox"
          id="enableTwoFactor"
          className="h-5 w-5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
          {...register("enableTwoFactor")}
        />
        <label htmlFor="enableTwoFactor" className="text-sm text-neutral-700">
          <span className="font-medium">Enable Two-Factor Authentication</span>
          <p className="text-neutral-500">Recommended for enhanced security</p>
        </label>
      </div>

      {enableTwoFactor && (
        <Select
          label="2FA Method"
          options={twoFactorMethodOptions}
          value={twoFactorMethod}
          onChange={(value) => setValue("twoFactorMethod", value)}
          error={errors.twoFactorMethod?.message}
          isRequired
        />
      )}
    </section>
  );
};

// ============================================================================
// STEP 7: TERMS AND VERIFICATION
// ============================================================================

export const TermsVerificationStep = ({
  register,
  errors,
  setValue,
  watch,
}: StepProps) => {
  const selfieWithId = watch("selfieWithId");
  const signature = watch("signature");

  return (
    <section className="space-y-4">
      <h2 className="mb-4 text-xl font-semibold text-gray-900">
        Terms & Verification
      </h2>

      <FileUpload
        id="selfieWithId"
        label="Selfie with ID"
        accept="image/*"
        description="Take a selfie holding your government ID"
        error={errors.selfieWithId?.message as string}
        onChange={(file) => setValue("selfieWithId", file)}
        value={selfieWithId}
        required
      />

      <FileUpload
        id="signature"
        label="Digital Signature"
        accept="image/*"
        description="Upload an image of your signature (optional)"
        error={errors.signature?.message as string}
        onChange={(file) => setValue("signature", file)}
        value={signature}
      />

      <Input
        label="Referral Code"
        placeholder="Optional - Enter if you have one"
        {...register("referralCode")}
      />

      <Input
        label="Invite Code"
        placeholder="Optional - Corporate or partner invite code"
        {...register("inviteCode")}
      />

      {/* Terms Checkboxes */}
      <div className="mt-6 space-y-3">
        <div className="flex items-start gap-3 rounded-lg bg-neutral-50 p-4">
          <input
            type="checkbox"
            id="agreeToTerms"
            className="mt-0.5 h-5 w-5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
            {...register("agreeToTerms")}
          />
          <label htmlFor="agreeToTerms" className="text-sm text-neutral-700">
            I agree to the{" "}
            <a
              href="/terms"
              className="text-primary-600 hover:underline"
              target="_blank"
            >
              Terms and Conditions
            </a>
            <span className="ml-1 text-error-500">*</span>
          </label>
        </div>
        {errors.agreeToTerms && (
          <p className="ml-4 text-xs text-error-500">
            {errors.agreeToTerms.message}
          </p>
        )}

        <div className="flex items-start gap-3 rounded-lg bg-neutral-50 p-4">
          <input
            type="checkbox"
            id="agreeToPrivacy"
            className="mt-0.5 h-5 w-5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
            {...register("agreeToPrivacy")}
          />
          <label htmlFor="agreeToPrivacy" className="text-sm text-neutral-700">
            I agree to the{" "}
            <a
              href="/privacy"
              className="text-primary-600 hover:underline"
              target="_blank"
            >
              Privacy Policy
            </a>
            <span className="ml-1 text-error-500">*</span>
          </label>
        </div>
        {errors.agreeToPrivacy && (
          <p className="ml-4 text-xs text-error-500">
            {errors.agreeToPrivacy.message}
          </p>
        )}

        <div className="flex items-start gap-3 rounded-lg bg-neutral-50 p-4">
          <input
            type="checkbox"
            id="agreeToDataSharing"
            className="mt-0.5 h-5 w-5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
            {...register("agreeToDataSharing")}
          />
          <label
            htmlFor="agreeToDataSharing"
            className="text-sm text-neutral-700"
          >
            I consent to sharing my data with regulatory authorities as required
            by law (optional)
          </label>
        </div>
      </div>
    </section>
  );
};
