// ============================================================================
// SIGNUP PAGE - Multi-step registration with react-hook-form and Zod
// ============================================================================

// React
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

// Components
import { Button, Spinner } from "@components/ui";
import Modal from "@components/ui/Modal";
import { FormContainer } from "@components/shared/FormContainer";
import AuthLayout from "@components/auth_components/AuthLayout";

// Steps
import {
  PersonalDetailsStep,
  IdentityVerificationStep,
  ContactInfoStep,
  BankingPreferencesStep,
  BankAccountStep,
  SecuritySetupStep,
  TermsVerificationStep,
} from "./SignupSteps";

// Schema
import {
  signupSchema,
  signupInitialValues,
  type SignupFormValues,
} from "@utils/validators/auth.validators";

// Hooks
import { useRegisterFullKyc } from "@hooks/queries/useAuth";

// Types

// Utils
import { fetchAllCountries } from "@utils/helpers";

// Data
import Banks from "@core/data/Banks";

// ============================================================================
// CONSTANTS
// ============================================================================

const TOTAL_STEPS = 7;

const stepTitles = [
  "Personal Details",
  "Identity Verification",
  "Contact Information",
  "Banking Preferences",
  "Bank Account Details",
  "Security Setup",
  "Terms & Verification",
];

// ============================================================================
// COMPONENT
// ============================================================================

const Signup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [countries, setCountries] = useState<SelectOption[]>([]);
  const [banks, setBanks] = useState<SelectOption[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  // Registration mutation
  const registerMutation = useRegisterFullKyc();

  // Form setup with Zod validation
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

  // Fetch countries on mount
  useEffect(() => {
    const loadCountries = async () => {
      const countryOptions = await fetchAllCountries();
      setCountries(countryOptions);
    };

    loadCountries();

    // Setup banks
    const bankOptions: SelectOption[] = Banks.banks
      .map((bank: string) => ({ value: bank, label: bank }))
      .sort((a: SelectOption, b: SelectOption) =>
        a.label.localeCompare(b.label),
      );
    setBanks(bankOptions);
  }, []);

  // Get fields for current step
  const getStepFields = (currentStep: number): (keyof SignupFormValues)[] => {
    const stepFieldsMap: Record<number, (keyof SignupFormValues)[]> = {
      1: [
        "firstName",
        "lastName",
        "dateOfBirth",
        "gender",
        "nationality",
        "countryOfResidence",
      ],
      2: [
        "profilePicture",
        "governmentId",
        "idType",
        "idNumber",
        "idExpiryDate",
        "proofOfAddress",
        "addressDocType",
        "taxIdentificationNumber",
      ],
      3: [
        "email",
        "mobileNumber",
        "homeAddress",
        "city",
        "stateProvince",
        "zipCode",
        "country",
      ],
      4: [
        "accountType",
        "currency",
        "sourceOfIncome",
        "monthlyIncomeRange",
        "initialDeposit",
        "employmentStatus",
        "occupation",
      ],
      5: [
        "accountName",
        "accountNumber",
        "bankName",
        "bankAddress",
        "swiftBic",
      ],
      6: ["password", "confirmPassword", "securityQuestion", "securityAnswer"],
      7: ["agreeToTerms", "agreeToPrivacy", "selfieWithId"],
    };
    return stepFieldsMap[currentStep] || [];
  };

  // Handle next step
  const handleNext = async () => {
    const fieldsToValidate = getStepFields(step);
    const isValid = await trigger(fieldsToValidate);

    if (isValid) {
      if (step < TOTAL_STEPS) {
        setStep(step + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Form submission handler
  const onSubmit = async (data: SignupFormValues) => {
    try {
      // Transform form data to match API request using FormData
      const formData = new FormData();

      // Helper to append only string-able or file values
      const appendIfPresent = (key: string, value: any) => {
        if (value !== undefined && value !== null && value !== "") {
          if (value instanceof File) {
            formData.append(key, value);
          } else {
            formData.append(key, String(value));
          }
        }
      };

      // Personal Details
      appendIfPresent("firstName", data.firstName);
      appendIfPresent("middleName", data.middleName);
      appendIfPresent("lastName", data.lastName);
      appendIfPresent("dateOfBirth", data.dateOfBirth?.toISOString());
      appendIfPresent("gender", data.gender);
      appendIfPresent("nationality", data.nationality);
      appendIfPresent("countryOfResidence", data.countryOfResidence);
      appendIfPresent("maritalStatus", data.maritalStatus);

      // Identity Verification
      appendIfPresent("idType", data.idType);
      appendIfPresent("idNumber", data.idNumber);
      appendIfPresent("idExpiryDate", data.idExpiryDate?.toISOString());
      appendIfPresent("addressDocType", data.addressDocType);
      appendIfPresent("socialSecurityNumber", data.socialSecurityNumber);
      appendIfPresent("taxIdentificationNumber", data.taxIdentificationNumber);

      // Contact Information
      appendIfPresent("email", data.email);
      appendIfPresent("mobileNumber", data.mobileNumber);
      appendIfPresent("alternativePhone", data.alternativePhone);
      appendIfPresent("homeAddress", data.homeAddress);
      appendIfPresent("city", data.city);
      appendIfPresent("stateProvince", data.stateProvince);
      appendIfPresent("zipCode", data.zipCode);
      appendIfPresent("country", data.country);

      // Banking Preferences
      appendIfPresent("accountType", data.accountType);
      appendIfPresent("currency", data.currency);
      appendIfPresent("sourceOfIncome", data.sourceOfIncome);
      appendIfPresent("monthlyIncomeRange", data.monthlyIncomeRange);
      appendIfPresent("initialDeposit", Number(data.initialDeposit) || 0);
      appendIfPresent("employmentStatus", data.employmentStatus);
      appendIfPresent("employerName", data.employerName);
      appendIfPresent("occupation", data.occupation);

      // Bank Account Details
      appendIfPresent("accountName", data.accountName);
      appendIfPresent("externalAccountNumber", data.accountNumber);
      appendIfPresent("bankName", data.bankName);
      appendIfPresent("bankAddress", data.bankAddress);
      appendIfPresent("ibanNumber", data.ibanNumber);
      appendIfPresent("routingNumber", data.routingNumber);
      appendIfPresent("swiftBic", data.swiftBic);

      // File Uploads
      appendIfPresent("profilePicture", data.profilePicture);
      appendIfPresent("governmentId", data.governmentId);
      appendIfPresent("proofOfAddress", data.proofOfAddress);
      appendIfPresent("selfieWithId", data.selfieWithId);
      appendIfPresent("signature", data.signature);

      // Security Setup
      appendIfPresent("password", data.password);
      appendIfPresent("confirmPassword", data.confirmPassword);
      appendIfPresent("securityQuestion", data.securityQuestion);
      appendIfPresent("securityAnswer", data.securityAnswer);
      appendIfPresent("enableTwoFactor", data.enableTwoFactor);
      appendIfPresent("twoFactorMethod", data.twoFactorMethod);

      // Terms and Verification
      appendIfPresent("agreeToTerms", data.agreeToTerms);
      appendIfPresent("agreeToPrivacy", data.agreeToPrivacy);
      appendIfPresent("agreeToDataSharing", data.agreeToDataSharing);
      appendIfPresent("referralCode", data.referralCode);
      appendIfPresent("inviteCode", data.inviteCode);

      // @ts-ignore - FormData payload replaces FullKycRegisterRequest
      await registerMutation.mutateAsync(formData);

      setShowSuccess(true);
    } catch (error) {
      console.error("Registration failed:", error);
      setShowError(true);
    }
  };

  // Render current step
  const renderStep = () => {
    const stepProps = {
      register,
      errors,
      setValue,
      watch,
      countries,
      banks,
    };

    switch (step) {
      case 1:
        return <PersonalDetailsStep {...stepProps} />;
      case 2:
        return <IdentityVerificationStep {...stepProps} />;
      case 3:
        return <ContactInfoStep {...stepProps} />;
      case 4:
        return <BankingPreferencesStep {...stepProps} />;
      case 5:
        return <BankAccountStep {...stepProps} />;
      case 6:
        return <SecuritySetupStep {...stepProps} />;
      case 7:
        return <TermsVerificationStep {...stepProps} />;
      default:
        return null;
    }
  };

  return (
    <AuthLayout
      title="Join Nordea Banking"
      subtitle="Complete your registration in a few easy steps."
      variant="signup"
      contentClassName="max-w-full"
      alternateAction={{
        text: "Already have an account?",
        linkText: "Sign in",
        href: "/auth/login",
      }}
    >
      <FormContainer step={step} totalSteps={TOTAL_STEPS}>
        <div className="mx-auto flex h-auto w-full flex-col items-center justify-center rounded-lg bg-white shadow-sm">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full rounded-lg bg-white p-4 md:p-6"
          >
            {/* Step Content */}
            <div className="w-full">{renderStep()}</div>

            {/* Navigation Buttons */}
            <div className="mt-6 flex items-center justify-between gap-4 border-t border-neutral-100 pt-4">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handlePrevious}
                disabled={step === 1}
                leftIcon={<ArrowLeft className="h-4 w-4" />}
                className="max-w-[140px] flex-1"
              >
                Previous
              </Button>

              {step === TOTAL_STEPS ? (
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isSubmitting || registerMutation.isPending}
                  rightIcon={!isSubmitting && <Check className="h-4 w-4" />}
                  className="max-w-[200px] flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting || registerMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <Spinner size="sm" variant="white" />
                      Submitting...
                    </span>
                  ) : (
                    "Complete Registration"
                  )}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  onClick={handleNext}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                  className="max-w-[140px] flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Next
                </Button>
              )}
            </div>

            {/* Error Display */}
            {registerMutation.error && (
              <div className="mt-4 rounded-lg border border-error-200 bg-error-50 p-3 text-sm text-error-600">
                {registerMutation.error.message ||
                  "Registration failed. Please try again."}
              </div>
            )}
          </form>
        </div>

        {/* Success Modal */}
        <Modal
          isOpen={showSuccess}
          onClose={() => {
            setShowSuccess(false);
            navigate("/auth/login");
          }}
          title="Registration Successful!"
          size="md"
        >
          <div className="py-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success-100">
              <Check className="h-8 w-8 text-success-600" />
            </div>
            <p className="mb-6 text-neutral-600">
              Your account has been created successfully. Please check your
              email to verify your account before logging in.
            </p>
            <Button
              variant="primary"
              onClick={() => {
                setShowSuccess(false);
                navigate("/auth/login");
              }}
            >
              Go to Login
            </Button>
          </div>
        </Modal>

        {/* Error Modal */}
        <Modal
          isOpen={showError}
          onClose={() => setShowError(false)}
          title="Registration Failed"
          size="md"
        >
          <div className="py-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-error-100">
              <span className="text-2xl">❌</span>
            </div>
            <p className="mb-6 text-neutral-600">
              We couldn't complete your registration. Please check your
              information and try again.
            </p>
            <Button variant="primary" onClick={() => setShowError(false)}>
              Try Again
            </Button>
          </div>
        </Modal>
      </FormContainer>
    </AuthLayout>
  );
};

export default Signup;
