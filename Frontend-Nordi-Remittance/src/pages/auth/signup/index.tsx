// ============================================================================
// SIGNUP PAGE - Multi-step registration with react-hook-form and Zod
// ============================================================================

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

// Components
import { Button, Spinner, Modal } from '@components/ui';
import FormContainer from '@container/FormContainer';

// Step Components
import {
  PersonalDetailsStep,
  IdentityVerificationStep,
  ContactInfoStep,
  BankingPreferencesStep,
  BankAccountStep,
  SecuritySetupStep,
  TermsVerificationStep,
} from './SignupSteps';

// Auth hooks
import { useRegisterFullKyc } from '@hooks/queries/useAuth';

// Validation
import { signupSchema, getStepSchema } from '@utils/validators/auth.validators';

// Types
import type { SignupFormValues, SelectOption } from '@types';
import { signupInitialValues } from '../../../types/auth.types';

// Data
import Banks from '@core/data/Banks';

// ============================================================================
// CONSTANTS
// ============================================================================

const TOTAL_STEPS = 7;

const stepTitles = [
  'Personal Details',
  'Identity Verification',
  'Contact Information',
  'Banking Preferences',
  'Bank Account Details',
  'Security Setup',
  'Terms & Verification',
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
    mode: 'onBlur',
  });

  // Fetch countries on mount
  useEffect(() => {
    fetch('https://restcountries.com/v3.1/all')
      .then((response) => response.json())
      .then((data) => {
        const countryOptions: SelectOption[] = data
          .map((country: { cca2: string; name: { common: string }; idd: { root?: string; suffixes?: string[] } }) => ({
            value: country.cca2,
            label: country.name.common,
            code: country.idd.root + (country.idd.suffixes?.[0] || ''),
          }))
          .sort((a: SelectOption, b: SelectOption) => a.label.localeCompare(b.label));
        setCountries(countryOptions);
      })
      .catch((error) => {
        console.error('Error fetching countries:', error);
      });

    // Setup banks
    const bankOptions: SelectOption[] = Banks.banks
      .map((bank: string) => ({ value: bank, label: bank }))
      .sort((a: SelectOption, b: SelectOption) => a.label.localeCompare(b.label));
    setBanks(bankOptions);
  }, []);

  // Get fields for current step
  const getStepFields = (currentStep: number): (keyof SignupFormValues)[] => {
    const stepFieldsMap: Record<number, (keyof SignupFormValues)[]> = {
      1: ['firstName', 'lastName', 'dateOfBirth', 'gender', 'nationality', 'countryOfResidence'],
      2: ['profilePicture', 'governmentId', 'idType', 'idNumber', 'idExpiryDate', 'proofOfAddress', 'addressDocType', 'taxIdentificationNumber'],
      3: ['email', 'mobileNumber', 'homeAddress', 'city', 'stateProvince', 'zipCode', 'country'],
      4: ['accountType', 'currency', 'sourceOfIncome', 'monthlyIncomeRange', 'initialDeposit', 'employmentStatus', 'occupation'],
      5: ['accountName', 'accountNumber', 'bankName', 'bankAddress', 'swiftBic'],
      6: ['password', 'confirmPassword', 'securityQuestion', 'securityAnswer'],
      7: ['agreeToTerms', 'agreeToPrivacy', 'selfieWithId'],
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
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Form submission handler
  const onSubmit = async (data: SignupFormValues) => {
    try {
      // Transform form data to match API request
      await registerMutation.mutateAsync({
        // Personal Details
        firstName: data.firstName,
        middleName: data.middleName || undefined,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth?.toISOString() || '',
        gender: data.gender,
        nationality: data.nationality,
        countryOfResidence: data.countryOfResidence,
        maritalStatus: data.maritalStatus || undefined,
        // Identity Verification
        idType: data.idType,
        idNumber: data.idNumber,
        idExpiryDate: data.idExpiryDate?.toISOString() || '',
        addressDocType: data.addressDocType,
        socialSecurityNumber: data.socialSecurityNumber || undefined,
        taxIdentificationNumber: data.taxIdentificationNumber,
        // Contact Information
        email: data.email,
        mobileNumber: data.mobileNumber,
        alternativePhone: data.alternativePhone || undefined,
        homeAddress: data.homeAddress,
        city: data.city,
        stateProvince: data.stateProvince,
        zipCode: data.zipCode,
        country: data.country,
        // Banking Preferences
        accountType: data.accountType,
        currency: data.currency,
        sourceOfIncome: data.sourceOfIncome,
        monthlyIncomeRange: data.monthlyIncomeRange,
        initialDeposit: Number(data.initialDeposit) || 0,
        employmentStatus: data.employmentStatus,
        employerName: data.employerName || undefined,
        occupation: data.occupation,
        // Bank Account Details
        accountName: data.accountName,
        bankName: data.bankName,
        bankAddress: data.bankAddress,
        ibanNumber: data.ibanNumber || undefined,
        routingNumber: data.routingNumber || undefined,
        swiftBic: data.swiftBic,
        // Security Setup
        password: data.password,
        confirmPassword: data.confirmPassword,
        securityQuestion: data.securityQuestion,
        securityAnswer: data.securityAnswer,
        enableTwoFactor: data.enableTwoFactor,
        twoFactorMethod: data.twoFactorMethod || undefined,
        // Terms and Verification
        agreeToTerms: data.agreeToTerms,
        agreeToPrivacy: data.agreeToPrivacy,
        agreeToDataSharing: data.agreeToDataSharing || undefined,
        referralCode: data.referralCode || undefined,
        inviteCode: data.inviteCode || undefined,
      });

      setShowSuccess(true);
    } catch (error) {
      console.error('Registration failed:', error);
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
    <FormContainer step={step} totalSteps={TOTAL_STEPS}>
      <div className="mx-auto flex h-auto w-full flex-col items-center justify-center rounded-lg bg-slate-50 lg:w-[50%]">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full rounded-md bg-white p-6 md:w-[80%] lg:w-full"
        >
          {/* Step Content */}
          <div className="w-full lg:p-6">
            {renderStep()}
          </div>

          {/* Navigation Buttons */}
          <div className="mt-8 flex items-center justify-between gap-4 p-4">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handlePrevious}
              disabled={step === 1}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Previous
            </Button>

            {step === TOTAL_STEPS ? (
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isSubmitting || registerMutation.isPending}
                rightIcon={!isSubmitting && <Check className="w-4 h-4" />}
              >
                {isSubmitting || registerMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <Spinner size="sm" variant="white" />
                    Submitting...
                  </span>
                ) : (
                  'Complete Registration'
                )}
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="lg"
                onClick={handleNext}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Next
              </Button>
            )}
          </div>

          {/* Error Display */}
          {registerMutation.error && (
            <div className="mx-4 mb-4 rounded-lg bg-error-50 p-3 text-sm text-error-600">
              {registerMutation.error.message || 'Registration failed. Please try again.'}
            </div>
          )}
        </form>

        {/* Back to home link */}
        <Link
          to="/"
          className="m-6 flex items-center gap-2 rounded-md bg-primary-100 px-4 py-2 text-sm font-medium text-primary-700 hover:bg-primary-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Homepage
        </Link>
      </div>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          navigate('/auth/login');
        }}
        title="Registration Successful!"
        size="md"
      >
        <div className="text-center py-6">
          <div className="mx-auto w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mb-4">
            <Check className="w-8 h-8 text-success-600" />
          </div>
          <p className="text-neutral-600 mb-6">
            Your account has been created successfully. Please check your email to verify your account before logging in.
          </p>
          <Button
            variant="primary"
            onClick={() => {
              setShowSuccess(false);
              navigate('/auth/login');
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
        <div className="text-center py-6">
          <div className="mx-auto w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <p className="text-neutral-600 mb-6">
            We couldn't complete your registration. Please check your information and try again.
          </p>
          <Button
            variant="primary"
            onClick={() => setShowError(false)}
          >
            Try Again
          </Button>
        </div>
      </Modal>
    </FormContainer>
  );
};

export default Signup;
