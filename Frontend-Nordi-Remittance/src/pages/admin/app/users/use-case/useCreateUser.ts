import { useState, useEffect, useCallback, useMemo } from "react";
import Banks from "@core/data/Banks";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ============================================================================
// useCreateUser — Multi-step user creation form logic (UI only)
// ============================================================================

export interface Country {
  value: string;
  label: string;
  code: string;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface FilePreviews {
  profilePicture: string | null;
  governmentId: string | null;
  proofOfAddress: string | null;
  selfieWithId: string | null;
  signature: string | null;
}

const TOTAL_STEPS = 7;

const STEP_FIELDS: Record<number, string[]> = {
  1: ["firstName", "middleName", "lastName", "dateOfBirth", "gender", "nationality", "countryOfResidence", "maritalStatus"],
  2: ["profilePicture", "governmentId", "idType", "idNumber", "idExpiryDate", "proofOfAddress", "addressDocType", "socialSecurityNumber", "taxIdentificationNumber"],
  3: ["email", "mobileNumber", "alternativePhone", "homeAddress", "city", "stateProvince", "zipCode", "country"],
  4: ["accountType", "currency", "sourceOfIncome", "monthlyIncomeRange", "initialDeposit", "employmentStatus", "employerName", "occupation"],
  5: ["accountName", "accountNumber", "bankName", "bankAddress", "ibanNumber", "routingNumber", "swiftBic"],
  6: ["password", "confirmPassword", "securityQuestion", "securityAnswer", "enableTwoFactor", "twoFactorMethod"],
  7: ["agreeToTerms", "agreeToPrivacy", "agreeToDataSharing", "referralCode", "selfieWithId", "signature", "inviteCode"],
};

const STEP_TITLES = [
  "Personal Details",
  "Identity Verification",
  "Contact Information",
  "Banking Preferences",
  "Bank Account Details",
  "Security Setup",
  "Terms & Verification",
];

export function useCreateUser() {
  const [step, setStep] = useState(1);
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const [filePreviews, setFilePreviews] = useState<FilePreviews>({
    profilePicture: null,
    governmentId: null,
    proofOfAddress: null,
    selfieWithId: null,
    signature: null,
  });

  // Fetch countries
  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all?fields=name,cca2,idd")
      .then((res) => res.json())
      .then((data: any[]) => {
        const opts = data
          .map((c: any) => ({
            value: c.cca2,
            label: c.name.common,
            code: c.idd.root + (c.idd.suffixes?.[0] ?? ""),
          }))
          .sort((a: Country, b: Country) => a.label.localeCompare(b.label));
        setCountries(opts);
      })
      .catch(() => {});
  }, []);

  const banks: SelectOption[] = useMemo(
    () =>
      Banks.banks
        .map((b) => ({ value: b, label: b }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [],
  );

  const isLastStep = step === TOTAL_STEPS;

  const nextStep = useCallback(() => {
    if (step < TOTAL_STEPS) setStep((s) => s + 1);
  }, [step]);

  const prevStep = useCallback(() => {
    if (step > 1) setStep((s) => s - 1);
  }, [step]);

  const goToStep = useCallback((s: number) => {
    if (s >= 1 && s <= TOTAL_STEPS) setStep(s);
  }, []);

  const getFieldsForStep = useCallback(
    (s: number) => STEP_FIELDS[s] || [],
    [],
  );

  const handleFileChange = useCallback(
    (
      event: React.ChangeEvent<HTMLInputElement>,
      setFieldValue: (field: string, value: any) => void,
      fieldName: keyof FilePreviews,
    ) => {
      const file = event.currentTarget.files?.[0];
      if (!file) return;
      setFieldValue(fieldName, file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreviews((prev) => ({
          ...prev,
          [fieldName]: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    },
    [],
  );

  return {
    // Stepper
    step,
    totalSteps: TOTAL_STEPS,
    isLastStep,
    stepTitle: STEP_TITLES[step - 1],
    stepTitles: STEP_TITLES,
    nextStep,
    prevStep,
    goToStep,
    getFieldsForStep,

    // Dropdown data
    countries,
    banks,
    selectedCountry,
    setSelectedCountry,

    // File handling
    filePreviews,
    handleFileChange,

    // Result popups
    showSuccess,
    showError,
    setShowSuccess,
    setShowError,
  };
}
