// ============================================================================
// CREATE USER PAGE - Admin multi-step user creation with react-hook-form + Zod
// ============================================================================

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Select, { StylesConfig } from "react-select";
import FormContainer from "@container/FormContainer";
import DatePicker from "@components/ui/DatePicker";
import RoutingCountries from "@core/data/Routing";
import { SubmitSpinner } from "@components/ui/Spinner";
import { Error, Success } from "@components/shared/InfoBankingPop";
import {
  addressDocTypes,
  currencies,
  employmentStatuses,
  genders,
  idTypes,
  incomeRanges,
  incomeSources,
  maritalStatuses,
  securityQuestions,
  twoFactorMethods,
} from "@core/data/FormData";
import useThemeStore from "@store/theme.store";
import { lightTheme, darkTheme } from "@constants/colors";
import { useCreateUser } from "../../admin-usecase/useadmin-users-usercase";
import { signupSchema, signupInitialValues, type SignupFormValues } from "@utils/validators/auth.validators";

// ============================================================================
// COMPONENT
// ============================================================================
const CreateUser: React.FC = () => {
  const { isDarkMode } = useThemeStore();
  const theme = useMemo(() => (isDarkMode ? darkTheme : lightTheme), [isDarkMode]);

  const {
    step,
    totalSteps,
    isLastStep,
    nextStep,
    prevStep,
    getFieldsForStep,
    countries,
    banks,
    selectedCountry,
    setSelectedCountry,
    filePreviews,
    handleFileChange,
    showSuccess,
    showError,
    setShowSuccess,
    setShowError,
  } = useCreateUser();

  // Form setup with Zod validation (same pattern as signup index.tsx)
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: signupInitialValues,
    mode: "onBlur",
  });

  // Watch values needed for conditional rendering
  const values = watch();

  // react-select theme styles
  const selectStyles: StylesConfig = useMemo(
    () => ({
      control: (base) => ({
        ...base,
        backgroundColor: theme.input.background,
        borderColor: theme.input.border,
        color: theme.text.primary,
        "&:hover": { borderColor: theme.input.focus },
      }),
      menu: (base) => ({
        ...base,
        backgroundColor: theme.surface.primary,
      }),
      option: (base, state) => ({
        ...base,
        backgroundColor: state.isFocused ? theme.surface.hover : theme.surface.primary,
        color: theme.text.primary,
        "&:active": { backgroundColor: theme.surface.active },
      }),
      singleValue: (base) => ({
        ...base,
        color: theme.text.primary,
      }),
      placeholder: (base) => ({
        ...base,
        color: theme.input.placeholder,
      }),
      input: (base) => ({
        ...base,
        color: theme.text.primary,
      }),
    }),
    [theme],
  );

  const inputStyle = {
    backgroundColor: theme.input.background,
    color: theme.text.primary,
    borderColor: theme.input.border,
  };

  // Handle next step with per-step validation
  const handleNext = async () => {
    const fieldsToValidate = getFieldsForStep(step) as (keyof SignupFormValues)[];
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      nextStep();
    }
  };

  // Form submission
  const onSubmit = async (_data: SignupFormValues) => {
    setShowSuccess(true);
  };

  return (
    <FormContainer step={step} totalSteps={totalSteps}>
      <div
        className="mx-auto flex w-full flex-col items-center justify-center rounded-lg lg:w-[70%]"
        style={{ backgroundColor: theme.background.secondary }}
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full rounded-md p-6 md:w-[80%] lg:w-full"
          style={{ backgroundColor: theme.surface.primary }}
        >
          <div className="w-full lg:p-6">
            {/* ================================ STEP 1: PERSONAL DETAILS =========================== */}
            {step === 1 && (
              <section className="step1">
                <h2 className="mb-4 text-xl font-semibold" style={{ color: theme.text.primary }}>
                  Personal Details
                </h2>

                <div>
                  <label htmlFor="firstName" style={{ color: theme.text.secondary }}>
                    First Name*
                  </label>
                  <input {...register("firstName")} className="form__div" placeholder="As per ID" style={inputStyle} />
                  {errors.firstName && <div className="error-class">{errors.firstName.message}</div>}
                </div>

                <div className="mt-4">
                  <label htmlFor="middleName" style={{ color: theme.text.secondary }}>
                    Middle Name (Optional)
                  </label>
                  <input {...register("middleName")} className="form__div" style={inputStyle} />
                </div>

                <div className="mt-4">
                  <label htmlFor="lastName" style={{ color: theme.text.secondary }}>
                    Last Name*
                  </label>
                  <input {...register("lastName")} className="form__div" placeholder="As per ID" style={inputStyle} />
                  {errors.lastName && <div className="error-class">{errors.lastName.message}</div>}
                </div>

                <div className="mt-4 grid">
                  <label htmlFor="dateOfBirth" style={{ color: theme.text.secondary }}>
                    Date of Birth* (Must be 18+)
                  </label>
                  <DatePicker
                    className="form__div"
                    style={inputStyle}
                    selected={values.dateOfBirth}
                    onChange={(date: Date | null) => setValue("dateOfBirth", date as any, { shouldValidate: true })}
                  />
                  {errors.dateOfBirth && <div className="error-class">{errors.dateOfBirth.message}</div>}
                </div>

                <div className="mt-4">
                  <label htmlFor="gender" style={{ color: theme.text.secondary }}>
                    Gender*
                  </label>
                  <Select
                    options={genders}
                    value={genders.find((g) => g.value === values.gender)}
                    onChange={(option) =>
                      setValue("gender", option ? (option as any).value : "", { shouldValidate: true })
                    }
                    className="form__div"
                    styles={selectStyles}
                  />
                  {errors.gender && <div className="error-class">{errors.gender.message}</div>}
                </div>

                <div className="mt-4">
                  <label htmlFor="nationality" style={{ color: theme.text.secondary }}>
                    Nationality*
                  </label>
                  <Select
                    options={countries}
                    value={countries.find((c) => c.value === values.nationality)}
                    onChange={(option) =>
                      setValue("nationality", option ? (option as any).value : "", { shouldValidate: true })
                    }
                    className="form__div"
                    styles={selectStyles}
                  />
                  {errors.nationality && <div className="error-class">{errors.nationality.message}</div>}
                </div>

                <div className="mt-4">
                  <label htmlFor="countryOfResidence" style={{ color: theme.text.secondary }}>
                    Country of Residence*
                  </label>
                  <Select
                    options={countries}
                    value={countries.find((c) => c.value === values.countryOfResidence)}
                    onChange={(option) =>
                      setValue("countryOfResidence", option ? (option as any).value : "", { shouldValidate: true })
                    }
                    className="form__div"
                    styles={selectStyles}
                  />
                  {errors.countryOfResidence && <div className="error-class">{errors.countryOfResidence.message}</div>}
                </div>

                <div className="mt-4">
                  <label htmlFor="maritalStatus" style={{ color: theme.text.secondary }}>
                    Marital Status (Optional)
                  </label>
                  <Select
                    options={maritalStatuses}
                    value={maritalStatuses.find((ms) => ms.value === values.maritalStatus)}
                    onChange={(option) => setValue("maritalStatus", option ? (option as any).value : "")}
                    className="form__div"
                    styles={selectStyles}
                  />
                </div>
              </section>
            )}

            {/* ================================ STEP 2: IDENTITY VERIFICATION =========================== */}
            {step === 2 && (
              <section className="step2">
                <h2 className="mb-4 text-xl font-semibold" style={{ color: theme.text.primary }}>
                  Identity Verification (KYC)
                </h2>

                <div className="mt-4">
                  <label htmlFor="profilePicture" style={{ color: theme.text.secondary }}>
                    Upload Profile Picture*
                  </label>
                  <input
                    type="file"
                    id="profilePicture"
                    accept="image/*"
                    className="form__div"
                    style={inputStyle}
                    onChange={(e) => handleFileChange(e, setValue, "profilePicture")}
                  />
                  {filePreviews.profilePicture && (
                    <div className="mt-2">
                      <img src={filePreviews.profilePicture} alt="Profile Preview" className="h-24 w-24 object-cover" />
                    </div>
                  )}
                  {errors.profilePicture && <div className="error-class">{errors.profilePicture.message}</div>}
                </div>

                <div className="mt-4">
                  <label htmlFor="governmentId" style={{ color: theme.text.secondary }}>
                    Upload Government ID*
                  </label>
                  <input
                    type="file"
                    id="governmentId"
                    accept="image/*,.pdf"
                    className="form__div"
                    style={inputStyle}
                    onChange={(e) => handleFileChange(e, setValue, "governmentId")}
                  />
                  {filePreviews.governmentId && filePreviews.governmentId.startsWith("data:image") && (
                    <div className="mt-2">
                      <img src={filePreviews.governmentId} alt="ID Preview" className="h-24 w-auto object-cover" />
                    </div>
                  )}
                  {errors.governmentId && <div className="error-class">{errors.governmentId.message}</div>}
                </div>

                <div className="mt-4">
                  <label htmlFor="idType" style={{ color: theme.text.secondary }}>
                    ID Type*
                  </label>
                  <Select
                    options={idTypes}
                    value={idTypes.find((type) => type.value === values.idType)}
                    onChange={(option) =>
                      setValue("idType", option ? (option as any).value : "", { shouldValidate: true })
                    }
                    className="form__div"
                    styles={selectStyles}
                  />
                  {errors.idType && <div className="error-class">{errors.idType.message}</div>}
                </div>

                <div className="mt-4">
                  <label htmlFor="idNumber" style={{ color: theme.text.secondary }}>
                    ID Number*
                  </label>
                  <input
                    {...register("idNumber")}
                    className="form__div"
                    placeholder="As shown on your ID"
                    style={inputStyle}
                  />
                  {errors.idNumber && <div className="error-class">{errors.idNumber.message}</div>}
                </div>

                <div className="mt-4 grid">
                  <label htmlFor="idExpiryDate" style={{ color: theme.text.secondary }}>
                    ID Expiry Date*
                  </label>
                  <DatePicker
                    className="form__div"
                    style={inputStyle}
                    selected={values.idExpiryDate}
                    onChange={(date: Date | null) => setValue("idExpiryDate", date as any, { shouldValidate: true })}
                  />
                  {errors.idExpiryDate && <div className="error-class">{errors.idExpiryDate.message}</div>}
                </div>

                <div className="mt-4">
                  <label htmlFor="proofOfAddress" style={{ color: theme.text.secondary }}>
                    Upload Proof of Address*
                  </label>
                  <input
                    type="file"
                    id="proofOfAddress"
                    accept="image/*,.pdf"
                    className="form__div"
                    style={inputStyle}
                    onChange={(e) => handleFileChange(e, setValue, "proofOfAddress")}
                  />
                  {filePreviews.proofOfAddress && filePreviews.proofOfAddress.startsWith("data:image") && (
                    <div className="mt-2">
                      <img
                        src={filePreviews.proofOfAddress}
                        alt="Address Proof Preview"
                        className="h-24 w-auto object-cover"
                      />
                    </div>
                  )}
                  {errors.proofOfAddress && <div className="error-class">{errors.proofOfAddress.message}</div>}
                </div>

                <div className="mt-4">
                  <label htmlFor="addressDocType" style={{ color: theme.text.secondary }}>
                    Address Document Type*
                  </label>
                  <Select
                    options={addressDocTypes}
                    value={addressDocTypes.find((type) => type.value === values.addressDocType)}
                    onChange={(option) =>
                      setValue("addressDocType", option ? (option as any).value : "", { shouldValidate: true })
                    }
                    className="form__div"
                    styles={selectStyles}
                  />
                  {errors.addressDocType && <div className="error-class">{errors.addressDocType.message}</div>}
                </div>

                <div className="mt-4">
                  <label htmlFor="socialSecurityNumber" style={{ color: theme.text.secondary }}>
                    National Insurance/Social Security Number (Optional)
                  </label>
                  <input {...register("socialSecurityNumber")} className="form__div" style={inputStyle} />
                </div>

                <div className="mt-4">
                  <label htmlFor="taxIdentificationNumber" style={{ color: theme.text.secondary }}>
                    Tax Identification Number (TIN)*
                  </label>
                  <input {...register("taxIdentificationNumber")} className="form__div" style={inputStyle} />
                  {errors.taxIdentificationNumber && (
                    <div className="error-class">{errors.taxIdentificationNumber.message}</div>
                  )}
                </div>
              </section>
            )}

            {/* ================================ STEP 3: CONTACT INFORMATION =========================== */}
            {step === 3 && (
              <section className="step3">
                <h2 className="mb-4 text-xl font-semibold" style={{ color: theme.text.primary }}>
                  Contact Information
                </h2>

                <div className="mt-4">
                  <label htmlFor="email" style={{ color: theme.text.secondary }}>
                    Email Address*
                  </label>
                  <input
                    {...register("email")}
                    type="email"
                    className="form__div"
                    placeholder="For verification"
                    style={inputStyle}
                  />
                  {errors.email && <div className="error-class">{errors.email.message}</div>}
                </div>

                <div className="mt-4">
                  <label htmlFor="mobileNumber" style={{ color: theme.text.secondary }}>
                    Phone Number*
                  </label>
                  <input
                    {...register("mobileNumber")}
                    className="form__div"
                    placeholder="With country code"
                    style={inputStyle}
                  />
                  {errors.mobileNumber && <div className="error-class">{errors.mobileNumber.message}</div>}
                </div>

                <div className="mt-4">
                  <label htmlFor="alternativePhone" style={{ color: theme.text.secondary }}>
                    Alternative Phone (Optional)
                  </label>
                  <input {...register("alternativePhone")} className="form__div" style={inputStyle} />
                </div>

                <div className="mt-4">
                  <label htmlFor="homeAddress" style={{ color: theme.text.secondary }}>
                    Residential Address*
                  </label>
                  <textarea {...register("homeAddress")} rows={3} className="form__div" style={inputStyle} />
                  {errors.homeAddress && <div className="error-class">{errors.homeAddress.message}</div>}
                </div>

                <div className="mt-4">
                  <label htmlFor="city" style={{ color: theme.text.secondary }}>
                    City*
                  </label>
                  <input {...register("city")} className="form__div" style={inputStyle} />
                  {errors.city && <div className="error-class">{errors.city.message}</div>}
                </div>

                <div className="mt-4">
                  <label htmlFor="stateProvince" style={{ color: theme.text.secondary }}>
                    State/Province*
                  </label>
                  <input {...register("stateProvince")} className="form__div" style={inputStyle} />
                  {errors.stateProvince && <div className="error-class">{errors.stateProvince.message}</div>}
                </div>

                <div className="mt-4">
                  <label htmlFor="zipCode" style={{ color: theme.text.secondary }}>
                    ZIP/Postal Code*
                  </label>
                  <input {...register("zipCode")} className="form__div" style={inputStyle} />
                  {errors.zipCode && <div className="error-class">{errors.zipCode.message}</div>}
                </div>

                <div className="mt-4">
                  <label htmlFor="country" style={{ color: theme.text.secondary }}>
                    Country*
                  </label>
                  <Select
                    className="form__div"
                    options={countries}
                    value={countries.find((c) => c.value === values.country)}
                    onChange={(option) => {
                      const sel = option as CountryOption;
                      setValue("country", sel.value, { shouldValidate: true });
                      setValue("mobileNumber", sel.code + (values.mobileNumber || "").replace(/^\+\d+/, ""));
                      setSelectedCountry(sel.label);
                    }}
                    styles={selectStyles}
                  />
                  {errors.country && <div className="error-class">{errors.country.message}</div>}
                </div>
              </section>
            )}

            {/* ================================ STEP 4: BANKING PREFERENCES =========================== */}
            {step === 4 && (
              <section className="step4">
                <h2 className="mb-4 text-xl font-semibold" style={{ color: theme.text.primary }}>
                  Banking Preferences
                </h2>

                <div className="form__div mt-4 grid">
                  <label htmlFor="accountType" style={{ color: theme.text.secondary }}>
                    Type of Account*
                  </label>
                  <select {...register("accountType")} className="form__div" style={inputStyle}>
                    <option value="">Select Account Type</option>
                    <option value="savings">Savings</option>
                    <option value="current">Current</option>
                    <option value="business">Business</option>
                    <option value="joint">Joint</option>
                    <option value="fixed deposit">Fixed Deposit</option>
                  </select>
                  {errors.accountType && <div className="error-class">{errors.accountType.message}</div>}
                </div>

                <div className="mt-4">
                  <label htmlFor="currency" style={{ color: theme.text.secondary }}>
                    Currency*
                  </label>
                  <Select
                    options={currencies}
                    value={currencies.find((c) => c.value === values.currency)}
                    onChange={(option) =>
                      setValue("currency", option ? (option as any).value : "", { shouldValidate: true })
                    }
                    className="form__div"
                    styles={selectStyles}
                  />
                  {errors.currency && <div className="error-class">{errors.currency.message}</div>}
                </div>

                <div className="mt-4">
                  <label htmlFor="sourceOfIncome" style={{ color: theme.text.secondary }}>
                    Source of Income*
                  </label>
                  <Select
                    options={incomeSources}
                    value={incomeSources.find((s) => s.value === values.sourceOfIncome)}
                    onChange={(option) =>
                      setValue("sourceOfIncome", option ? (option as any).value : "", { shouldValidate: true })
                    }
                    className="form__div"
                    styles={selectStyles}
                  />
                  {errors.sourceOfIncome && <div className="error-class">{errors.sourceOfIncome.message}</div>}
                </div>

                <div className="mt-4">
                  <label htmlFor="monthlyIncomeRange" style={{ color: theme.text.secondary }}>
                    Monthly Income Range*
                  </label>
                  <Select
                    options={incomeRanges}
                    value={incomeRanges.find((r) => r.value === values.monthlyIncomeRange)}
                    onChange={(option) =>
                      setValue("monthlyIncomeRange", option ? (option as any).value : "", { shouldValidate: true })
                    }
                    className="form__div"
                    styles={selectStyles}
                  />
                  {errors.monthlyIncomeRange && <div className="error-class">{errors.monthlyIncomeRange.message}</div>}
                </div>

                <div className="mt-4">
                  <label htmlFor="initialDeposit" style={{ color: theme.text.secondary }}>
                    Initial Deposit Amount* (Minimum: 100)
                  </label>
                  <input
                    {...register("initialDeposit", { valueAsNumber: true })}
                    type="number"
                    min="100"
                    className="form__div"
                    style={inputStyle}
                  />
                  {errors.initialDeposit && <div className="error-class">{errors.initialDeposit.message}</div>}
                </div>

                <div className="mt-4">
                  <label htmlFor="employmentStatus" style={{ color: theme.text.secondary }}>
                    Employment Status*
                  </label>
                  <Select
                    options={employmentStatuses}
                    value={employmentStatuses.find((s) => s.value === values.employmentStatus)}
                    onChange={(option) =>
                      setValue("employmentStatus", option ? (option as any).value : "", { shouldValidate: true })
                    }
                    className="form__div"
                    styles={selectStyles}
                  />
                  {errors.employmentStatus && <div className="error-class">{errors.employmentStatus.message}</div>}
                </div>

                <div className="mt-4">
                  <label htmlFor="employerName" style={{ color: theme.text.secondary }}>
                    Employer/Company Name
                    {(values.employmentStatus === "employed" || values.employmentStatus === "self-employed") && "*"}
                  </label>
                  <input
                    {...register("employerName")}
                    className="form__div"
                    style={inputStyle}
                    disabled={!["employed", "self-employed"].includes(values.employmentStatus || "")}
                  />
                  {errors.employerName && <div className="error-class">{errors.employerName.message}</div>}
                </div>

                <div className="mt-4">
                  <label htmlFor="occupation" style={{ color: theme.text.secondary }}>
                    Occupation*
                  </label>
                  <input {...register("occupation")} className="form__div" style={inputStyle} />
                  {errors.occupation && <div className="error-class">{errors.occupation.message}</div>}
                </div>
              </section>
            )}

            {/* ================================ STEP 5: BANK ACCOUNT DETAILS =========================== */}
            {step === 5 && (
              <section className="step5">
                <h2 className="mb-4 text-xl font-semibold" style={{ color: theme.text.primary }}>
                  Bank Account Details
                </h2>

                <div className="mt-4">
                  <label htmlFor="accountName" style={{ color: theme.text.secondary }}>
                    Account Name*
                  </label>
                  <input
                    {...register("accountName")}
                    placeholder="Pay Account Name"
                    className="form__div"
                    style={inputStyle}
                  />
                  {errors.accountName && <div className="error-class">{errors.accountName.message}</div>}
                </div>

                <div className="mt-4">
                  <label htmlFor="accountNumber" style={{ color: theme.text.secondary }}>
                    Account Number*
                  </label>
                  <input
                    {...register("accountNumber")}
                    placeholder="**************"
                    className="form__div"
                    style={inputStyle}
                  />
                  {errors.accountNumber && <div className="error-class">{errors.accountNumber.message}</div>}
                </div>

                <div className="form__div">
                  <label htmlFor="bankName" style={{ color: theme.text.secondary }}>
                    Bank Name*
                  </label>
                  <Select
                    options={banks}
                    value={banks.find((b) => b.value === values.bankName)}
                    onChange={(option) =>
                      setValue("bankName", option ? (option as any).value : "", { shouldValidate: true })
                    }
                    styles={selectStyles}
                  />
                  {errors.bankName && <div className="error-class">{errors.bankName.message}</div>}
                </div>

                <div className="mt-4">
                  <label htmlFor="bankAddress" style={{ color: theme.text.secondary }}>
                    Bank Address*
                  </label>
                  <input {...register("bankAddress")} className="form__div" style={inputStyle} />
                  {errors.bankAddress && <div className="error-class">{errors.bankAddress.message}</div>}
                </div>

                <div className="mt-4">
                  <label
                    htmlFor="ibanNumber"
                    style={{
                      color: theme.text.secondary,
                      opacity: RoutingCountries.includes(selectedCountry || "") ? 0.5 : 1,
                    }}
                  >
                    IBAN Number
                  </label>
                  <input
                    {...register("ibanNumber")}
                    className="form__div"
                    placeholder="(optional) for non-US"
                    disabled={RoutingCountries.includes(selectedCountry || "")}
                    style={{
                      ...inputStyle,
                      opacity: RoutingCountries.includes(selectedCountry || "") ? 0.5 : 1,
                    }}
                  />
                  {errors.ibanNumber && <div className="error-class">{errors.ibanNumber.message}</div>}
                </div>

                <div className="mt-4">
                  <label
                    htmlFor="routingNumber"
                    style={{
                      color: theme.text.secondary,
                      opacity: !RoutingCountries.includes(selectedCountry || "") ? 0.5 : 1,
                    }}
                  >
                    Routing/BSB/sort code
                  </label>
                  <input
                    {...register("routingNumber")}
                    placeholder="Applies to USA, Australia, UK"
                    className="form__div"
                    disabled={!RoutingCountries.includes(selectedCountry || "")}
                    style={{
                      ...inputStyle,
                      opacity: !RoutingCountries.includes(selectedCountry || "") ? 0.5 : 1,
                    }}
                  />
                  {errors.routingNumber && <div className="error-class">{errors.routingNumber.message}</div>}
                </div>

                <div className="mt-4">
                  <label htmlFor="swiftBic" style={{ color: theme.text.secondary }}>
                    SWIFT/BIC*
                  </label>
                  <input {...register("swiftBic")} className="form__div" style={inputStyle} />
                  {errors.swiftBic && <div className="error-class">{errors.swiftBic.message}</div>}
                </div>
              </section>
            )}

            {/* ================================ STEP 6: SECURITY SETUP =========================== */}
            {step === 6 && (
              <section className="step6">
                <h2 className="mb-4 text-xl font-semibold" style={{ color: theme.text.primary }}>
                  Security Setup
                </h2>

                <div className="mt-4">
                  <label htmlFor="password" style={{ color: theme.text.secondary }}>
                    Create Password*
                  </label>
                  <input
                    {...register("password")}
                    type="password"
                    className="form__div"
                    placeholder="Min 8 characters"
                    style={inputStyle}
                  />
                  {errors.password && <div className="error-class">{errors.password.message}</div>}
                </div>

                <div className="mt-4">
                  <label htmlFor="confirmPassword" style={{ color: theme.text.secondary }}>
                    Confirm Password*
                  </label>
                  <input {...register("confirmPassword")} type="password" className="form__div" style={inputStyle} />
                  {errors.confirmPassword && <div className="error-class">{errors.confirmPassword.message}</div>}
                </div>

                <div className="mt-4">
                  <label htmlFor="securityQuestion" style={{ color: theme.text.secondary }}>
                    Security Question*
                  </label>
                  <Select
                    options={securityQuestions}
                    value={securityQuestions.find((q) => q.value === values.securityQuestion)}
                    onChange={(option) =>
                      setValue("securityQuestion", option ? (option as any).value : "", { shouldValidate: true })
                    }
                    className="form__div"
                    styles={selectStyles}
                  />
                  {errors.securityQuestion && <div className="error-class">{errors.securityQuestion.message}</div>}
                </div>

                <div className="mt-4">
                  <label htmlFor="securityAnswer" style={{ color: theme.text.secondary }}>
                    Security Answer*
                  </label>
                  <input {...register("securityAnswer")} className="form__div" style={inputStyle} />
                  {errors.securityAnswer && <div className="error-class">{errors.securityAnswer.message}</div>}
                </div>

                <div className="mt-4 flex items-center">
                  <input
                    type="checkbox"
                    id="enableTwoFactor"
                    checked={values.enableTwoFactor}
                    onChange={() => setValue("enableTwoFactor", !values.enableTwoFactor)}
                    className="mr-2"
                  />
                  <label htmlFor="enableTwoFactor" style={{ color: theme.text.secondary }}>
                    Enable Two-Factor Authentication
                  </label>
                </div>

                {values.enableTwoFactor && (
                  <div className="mt-4">
                    <label htmlFor="twoFactorMethod" style={{ color: theme.text.secondary }}>
                      Select Preferred 2FA Method*
                    </label>
                    <Select
                      options={twoFactorMethods}
                      value={twoFactorMethods.find((m) => m.value === values.twoFactorMethod)}
                      onChange={(option) =>
                        setValue("twoFactorMethod", option ? (option as any).value : "", { shouldValidate: true })
                      }
                      className="form__div"
                      styles={selectStyles}
                    />
                    {errors.twoFactorMethod && <div className="error-class">{errors.twoFactorMethod.message}</div>}
                  </div>
                )}
              </section>
            )}

            {/* ================================ STEP 7: TERMS AND VERIFICATION =========================== */}
            {step === 7 && (
              <section className="step7">
                <h2 className="mb-4 text-xl font-semibold" style={{ color: theme.text.primary }}>
                  Terms and Verification
                </h2>

                <div className="mt-4">
                  <label htmlFor="selfieWithId" style={{ color: theme.text.secondary }}>
                    Upload Selfie with ID*
                  </label>
                  <input
                    type="file"
                    id="selfieWithId"
                    accept="image/*"
                    className="form__div"
                    style={inputStyle}
                    onChange={(e) => handleFileChange(e, setValue, "selfieWithId")}
                  />
                  {filePreviews.selfieWithId && (
                    <div className="mt-2">
                      <img
                        src={filePreviews.selfieWithId}
                        alt="Selfie with ID Preview"
                        className="h-24 w-auto object-cover"
                      />
                    </div>
                  )}
                  {errors.selfieWithId && <div className="error-class">{errors.selfieWithId.message}</div>}
                </div>

                <div className="mt-4">
                  <label htmlFor="signature" style={{ color: theme.text.secondary }}>
                    Upload Signature (Optional)
                  </label>
                  <input
                    type="file"
                    id="signature"
                    accept="image/png"
                    className="form__div"
                    style={inputStyle}
                    onChange={(e) => handleFileChange(e, setValue, "signature")}
                  />
                  {filePreviews.signature && (
                    <div className="mt-2">
                      <img
                        src={filePreviews.signature}
                        alt="Signature Preview"
                        className="h-12 w-auto object-contain"
                      />
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <label htmlFor="referralCode" style={{ color: theme.text.secondary }}>
                    Referral Code (Optional)
                  </label>
                  <input {...register("referralCode")} className="form__div" style={inputStyle} />
                </div>

                <div className="mt-4">
                  <label htmlFor="inviteCode" style={{ color: theme.text.secondary }}>
                    Invite Code (Optional)
                  </label>
                  <input {...register("inviteCode")} className="form__div" style={inputStyle} />
                </div>

                <div className="mt-6">
                  <div className="mb-4 flex items-center">
                    <input type="checkbox" id="agreeToTerms" {...register("agreeToTerms")} className="mr-2" />
                    <label htmlFor="agreeToTerms" style={{ color: theme.text.secondary }}>
                      I agree to the Terms and Conditions*
                    </label>
                  </div>
                  {errors.agreeToTerms && <div className="error-class">{errors.agreeToTerms.message}</div>}

                  <div className="mb-4 flex items-center">
                    <input type="checkbox" id="agreeToPrivacy" {...register("agreeToPrivacy")} className="mr-2" />
                    <label htmlFor="agreeToPrivacy" style={{ color: theme.text.secondary }}>
                      I agree to the Privacy Policy*
                    </label>
                  </div>
                  {errors.agreeToPrivacy && <div className="error-class">{errors.agreeToPrivacy.message}</div>}

                  <div className="mb-4 flex items-center">
                    <input
                      type="checkbox"
                      id="agreeToDataSharing"
                      {...register("agreeToDataSharing")}
                      className="mr-2"
                    />
                    <label htmlFor="agreeToDataSharing" style={{ color: theme.text.secondary }}>
                      I agree to Data Sharing/Processing
                    </label>
                  </div>
                </div>

                <div
                  className="mt-4 flex items-center justify-center border p-4"
                  style={{ borderColor: theme.border.primary }}
                >
                  <p style={{ color: theme.text.muted }}>CAPTCHA Verification Widget</p>
                </div>
              </section>
            )}
          </div>

          {/* ================================ FORM BUTTONS =========================== */}
          <div className="mt-6 flex items-center justify-between gap-10 p-4">
            <button
              type="button"
              className="w-full rounded-md px-4 py-1 text-sm font-normal md:py-2 md:text-base"
              style={{
                backgroundColor: theme.surface.secondary,
                color: theme.text.primary,
                border: `1px solid ${theme.border.primary}`,
              }}
              onClick={prevStep}
            >
              Previous
            </button>

            {isLastStep ? (
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-md px-4 py-1 text-sm font-semibold md:py-2 md:text-base lg:text-base"
                style={{ backgroundColor: theme.text.link, color: theme.text.inverse }}
              >
                Submit
              </button>
            ) : (
              <button
                type="button"
                className="w-full rounded-md px-4 py-1 text-sm font-semibold md:py-2 md:text-base lg:text-base"
                style={{ backgroundColor: theme.text.link, color: theme.text.inverse }}
                onClick={handleNext}
              >
                Next
              </button>
            )}
          </div>

          <SubmitSpinner visible={isSubmitting} />

          {showSuccess && <Success onClose={() => setShowSuccess(false)} />}
          {showError && <Error onClose={() => setShowError(false)} />}
        </form>
      </div>
    </FormContainer>
  );
};

export default CreateUser;
