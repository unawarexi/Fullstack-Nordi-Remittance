/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import apiService from "@core/api/AuthService";
import FormContainer from "@container/FormContainer";
import { Link } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import RoutingCountries from "@core/data/Routing";
import { TiArrowBackOutline } from "react-icons/ti";
import Banks from "@core/data/Banks";
import { SubmitSpinner } from "@components/shared/Spinner";
import { Error, Success } from "@components/shared/InfoBankingPop";
import { addressDocTypes, currencies, employmentStatuses, genders, idTypes, incomeRanges, incomeSources, maritalStatuses, securityQuestions, twoFactorMethods } from "@core/data/FormData";

// Types
interface Country {
  value: string;
  label: string;
  code: string; // Country dialing code
}

interface Bank {
  value: string;
  label: string;
}

// Define types for form fields
interface FormValues {
  // Step 1: Personal Details
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: Date | string;
  gender: string;
  nationality: string;
  countryOfResidence: string;
  maritalStatus: string;

  // Step 2: Identity Verification
  profilePicture: File | null;
  governmentId: File | null;
  idType: string;
  idNumber: string;
  idExpiryDate: Date | string;
  proofOfAddress: File | null;
  addressDocType: string;
  socialSecurityNumber: string;
  taxIdentificationNumber: string;

  // Step 3: Contact Information
  email: string;
  mobileNumber: string;
  alternativePhone: string;
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
  employerName: string;
  occupation: string;

  // Step 5: Bank Account Details
  accountName: string;
  accountNumber: string;
  bankName: string;
  bankAddress: string;
  ibanNumber: string;
  routingNumber: string;
  swiftBic: string;

  // Step 6: Security Setup
  password: string;
  confirmPassword: string;
  securityQuestion: string;
  securityAnswer: string;
  enableTwoFactor: boolean;
  twoFactorMethod: string;

  // Step 7: Terms and Verification
  agreeToTerms: boolean;
  agreeToPrivacy: boolean;
  agreeToDataSharing: boolean;
  referralCode: string;
  selfieWithId: File | null;
  signature: File | null;
  inviteCode: string;
}

// Initial Values
const initialValues: FormValues = {
  // Step 1: Personal Details
  firstName: "",
  middleName: "",
  lastName: "",
  dateOfBirth: new Date(),
  gender: "",
  nationality: "",
  countryOfResidence: "",
  maritalStatus: "",

  // Step 2: Identity Verification
  profilePicture: null,
  governmentId: null,
  idType: "",
  idNumber: "",
  idExpiryDate: new Date(),
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

const Signup: React.FC = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [idExpiryDate, setIdExpiryDate] = useState<Date | null>(new Date());
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [useIbanValidation, setUseIbanValidation] = useState(true);

  // File previews
  const [profilePicturePreview, setProfilePicturePreview] = useState<
    string | null
  >(null);
  const [idPreview, setIdPreview] = useState<string | null>(null);
  const [addressProofPreview, setAddressProofPreview] = useState<string | null>(
    null,
  );
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);


  // YUP VALIDATION SCHEMA
  const validationSchema = Yup.object().shape({
    // Step 1: Personal Details
    firstName: Yup.string().required("First name is required"),
    middleName: Yup.string(),
    lastName: Yup.string().required("Last name is required"),
    dateOfBirth: Yup.date()
      .required("Date of birth is required")
      .test("is-adult", "You must be at least 18 years old", function (value) {
        if (!value) return false;
        const today = new Date();
        const birthDate = new Date(value);
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
          return age - 1 >= 18;
        }
        return age >= 18;
      }),
    gender: Yup.string().required("Gender is required"),
    nationality: Yup.string().required("Nationality is required"),
    countryOfResidence: Yup.string().required(
      "Country of residence is required",
    ),
    maritalStatus: Yup.string(),

    // Step 2: Identity Verification
    profilePicture: Yup.mixed().required("Profile picture is required"),
    governmentId: Yup.mixed().required("Government ID is required"),
    idType: Yup.string().required("ID type is required"),
    idNumber: Yup.string().required("ID number is required"),
    idExpiryDate: Yup.date()
      .required("ID expiry date is required")
      .min(new Date(), "ID must not be expired"),
    proofOfAddress: Yup.mixed().required("Proof of address is required"),
    addressDocType: Yup.string().required("Address document type is required"),
    socialSecurityNumber: Yup.string(),
    taxIdentificationNumber: Yup.string().required(
      "Tax identification number is required",
    ),

    // Step 3: Contact Information
    email: Yup.string().email("Invalid email").required("Email is required"),
    mobileNumber: Yup.string().required("Mobile number is required"),
    alternativePhone: Yup.string(),
    homeAddress: Yup.string().required("Home address is required"),
    city: Yup.string().required("City is required"),
    stateProvince: Yup.string().required("State/Province is required"),
    zipCode: Yup.string().required("ZIP/Postal code is required"),
    country: Yup.string().required("Country is required"),

    // Step 4: Banking Preferences
    accountType: Yup.string().required("Account type is required"),
    currency: Yup.string().required("Currency is required"),
    sourceOfIncome: Yup.string().required("Source of income is required"),
    monthlyIncomeRange: Yup.string().required(
      "Monthly income range is required",
    ),
    initialDeposit: Yup.number()
      .min(100, "Minimum deposit of 100 required")
      .required("Initial deposit is required"),
    employmentStatus: Yup.string().required("Employment status is required"),
    employerName: Yup.string().when("employmentStatus", {
      is: (val: string) => val === "employed" || val === "self-employed",
      then: (schema) => schema.required("Employer name is required"),
      otherwise: (schema) => schema,
    }),
    occupation: Yup.string().required("Occupation is required"),

    // Step 5: Bank Account Details
    accountName: Yup.string().required("Account name is required"),
    accountNumber: Yup.string().required("Account number is required"),
    bankName: Yup.string().required("Bank name is required"),
    bankAddress: Yup.string().required("Bank address is required"),
    ibanNumber: useIbanValidation
      ? Yup.string().required("IBAN is required")
      : Yup.string(),
    routingNumber: !useIbanValidation
      ? Yup.string().required("Routing number is required")
      : Yup.string(),
    swiftBic: Yup.string().required("SWIFT/BIC is required"),

    // Step 6: Security Setup
    password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .matches(/[a-z]/, "Password must contain at least one lowercase letter")
      .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
      .matches(/[0-9]/, "Password must contain at least one number")
      .matches(
        /[^a-zA-Z0-9]/,
        "Password must contain at least one special character",
      )
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], "Passwords must match")
      .required("Password confirmation is required"),
    securityQuestion: Yup.string().required("Security question is required"),
    securityAnswer: Yup.string().required("Security answer is required"),
    enableTwoFactor: Yup.boolean(),
    twoFactorMethod: Yup.string().when("enableTwoFactor", {
      is: true,
      then: (schema) => schema.required("Two-factor method is required"),
      otherwise: (schema) => schema,
    }),

    // Step 7: Terms and Verification
    agreeToTerms: Yup.boolean().oneOf(
      [true],
      "You must agree to the terms and conditions",
    ),
    agreeToPrivacy: Yup.boolean().oneOf(
      [true],
      "You must agree to the privacy policy",
    ),
    agreeToDataSharing: Yup.boolean(),
    referralCode: Yup.string(),
    selfieWithId: Yup.mixed().required("Selfie with ID is required"),
    signature: Yup.mixed(),
    inviteCode: Yup.string(),
  });

  //---------------- LOGIC TO HANDLE FORM STEPS AND STEP VALIDATION
  const steps = 7; // Updated to 7 steps
  const isLastStep = step === steps;

  const getFieldsByStep = (step: number) => {
    switch (step) {
      case 1: // Personal Details
        return [
          "firstName",
          "middleName",
          "lastName",
          "dateOfBirth",
          "gender",
          "nationality",
          "countryOfResidence",
          "maritalStatus",
        ];
      case 2: // Identity Verification
        return [
          "profilePicture",
          "governmentId",
          "idType",
          "idNumber",
          "idExpiryDate",
          "proofOfAddress",
          "addressDocType",
          "socialSecurityNumber",
          "taxIdentificationNumber",
        ];
      case 3: // Contact Information
        return [
          "email",
          "mobileNumber",
          "alternativePhone",
          "homeAddress",
          "city",
          "stateProvince",
          "zipCode",
          "country",
        ];
      case 4: // Banking Preferences
        return [
          "accountType",
          "currency",
          "sourceOfIncome",
          "monthlyIncomeRange",
          "initialDeposit",
          "employmentStatus",
          "employerName",
          "occupation",
        ];
      case 5: // Bank Account Details
        return [
          "accountName",
          "accountNumber",
          "bankName",
          "bankAddress",
          "ibanNumber",
          "routingNumber",
          "swiftBic",
        ];
      case 6: // Security Setup
        return [
          "password",
          "confirmPassword",
          "securityQuestion",
          "securityAnswer",
          "enableTwoFactor",
          "twoFactorMethod",
        ];
      case 7: // Terms and Verification
        return [
          "agreeToTerms",
          "agreeToPrivacy",
          "agreeToDataSharing",
          "referralCode",
          "selfieWithId",
          "signature",
          "inviteCode",
        ];
      default:
        return [];
    }
  };

  // ------------------------------ Fetch countries and banks
  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all")
      .then((response) => response.json())
      .then((data) => {
        const countryOptions = data.map((country: any) => ({
          value: country.cca2,
          label: country.name.common,
          code:
            country.idd.root +
            (country.idd.suffixes ? country.idd.suffixes[0] : ""),
        }));

        countryOptions.sort((a: Country, b: Country) =>
          a.label.localeCompare(b.label),
        );
        setCountries(countryOptions);
      })
      .catch((error) => {
        console.error("Error fetching countries:", error);
      });

    // BANK DROPDOWN
    const bankOptions: Bank[] = Banks.banks
      .map((bank) => ({ value: bank, label: bank }))
      .sort((a, b) => a.label.localeCompare(b.label));
    setBanks(bankOptions);
  }, []);

  // File upload handlers
  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: (field: string, value: any) => void,
    fieldName: string,
    setPreview: (preview: string | null) => void,
  ) => {
    if (event.currentTarget.files && event.currentTarget.files[0]) {
      const file = event.currentTarget.files[0];
      setFieldValue(fieldName, file);

      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // ==================== SUBMITTING FORM  ===================//
  const handleSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      const formattedValues = {
        ...values,
        dateOfBirth:
          values.dateOfBirth instanceof Date
            ? values.dateOfBirth.toISOString()
            : values.dateOfBirth,
        idExpiryDate:
          values.idExpiryDate instanceof Date
            ? values.idExpiryDate.toISOString()
            : values.idExpiryDate,
      };
      await apiService.saveBankingInfo(formattedValues);
      setShowSuccess(true);
    } catch (error) {
      setShowError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------- HANDLE POPUP DISMISSAL----------------//
  const handleCloseSuccess = () => {
    setShowSuccess(false);
  };

  const handleCloseError = () => {
    setShowError(false);
  };

  return (
    <FormContainer step={step} totalSteps={steps}>

      <Formik<FormValues>
        initialValues={{
          ...initialValues,
          dateOfBirth: startDate,
          idExpiryDate: idExpiryDate,
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({
          errors,
          touched,
          setFieldValue,
          values,
          validateForm,
          setTouched,
        }) => (
          <div className="mx-auto flex w-full flex-col items-center justify-center rounded-lg bg-slate-50 lg:w-[70%]">
            <Form className="bg-white w-full rounded-md p-6 md:w-[80%] lg:w-full">
              <div className="w-full lg:p-6">
                {/* ================================ STEP 1: PERSONAL DETAILS =========================== */}
                {step === 1 && (
                  <section className="step1">
                    <h2 className="mb-4 text-xl font-semibold">
                      Personal Details
                    </h2>

                    <div>
                      <label htmlFor="firstName">First Name*</label>
                      <Field
                        name="firstName"
                        className="form__div"
                        placeholder="As per ID"
                      />
                      {errors.firstName && touched.firstName ? (
                        <div className="error-class">{errors.firstName}</div>
                      ) : null}
                    </div>

                    <div className="mt-4">
                      <label htmlFor="middleName">Middle Name (Optional)</label>
                      <Field name="middleName" className="form__div" />
                    </div>

                    <div className="mt-4">
                      <label htmlFor="lastName">Last Name*</label>
                      <Field
                        name="lastName"
                        className="form__div"
                        placeholder="As per ID"
                      />
                      {errors.lastName && touched.lastName ? (
                        <div className="error-class">{errors.lastName}</div>
                      ) : null}
                    </div>

                    <div className="form__div mt-4 grid">
                      <label htmlFor="dateOfBirth">
                        Date of Birth* (Must be 18+)
                      </label>
                      <DatePicker
                        className="form__div"
                        selected={startDate}
                        onChange={(date: Date | null) => {
                          setStartDate(date);
                          setFieldValue("dateOfBirth", date);
                        }}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="Select date"
                        showYearDropdown
                        scrollableYearDropdown
                        yearDropdownItemNumber={100}
                        maxDate={new Date()}
                        dropdownMode="select"
                      />
                      {errors.dateOfBirth && touched.dateOfBirth ? (
                        <div className="error-class">{errors.dateOfBirth}</div>
                      ) : null}
                    </div>

                    <div className="mt-4">
                      <label htmlFor="gender">Gender*</label>
                      <Select
                        options={genders}
                        value={genders.find((g) => g.value === values.gender)}
                        onChange={(option) =>
                          setFieldValue(
                            "gender",
                            option ? (option as any).value : "",
                          )
                        }
                        className="form__div"
                      />
                      {errors.gender && touched.gender ? (
                        <div className="error-class">{errors.gender}</div>
                      ) : null}
                    </div>

                    <div className="mt-4">
                      <label htmlFor="nationality">Nationality*</label>
                      <Select
                        options={countries}
                        value={countries.find(
                          (c) => c.value === values.nationality,
                        )}
                        onChange={(option) =>
                          setFieldValue(
                            "nationality",
                            option ? (option as any).value : "",
                          )
                        }
                        className="form__div"
                      />
                      {errors.nationality && touched.nationality ? (
                        <div className="error-class">{errors.nationality}</div>
                      ) : null}
                    </div>

                    <div className="mt-4">
                      <label htmlFor="countryOfResidence">
                        Country of Residence*
                      </label>
                      <Select
                        options={countries}
                        value={countries.find(
                          (c) => c.value === values.countryOfResidence,
                        )}
                        onChange={(option) =>
                          setFieldValue(
                            "countryOfResidence",
                            option ? (option as any).value : "",
                          )
                        }
                        className="form__div"
                      />
                      {errors.countryOfResidence &&
                      touched.countryOfResidence ? (
                        <div className="error-class">
                          {errors.countryOfResidence}
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-4">
                      <label htmlFor="maritalStatus">
                        Marital Status (Optional)
                      </label>
                      <Select
                        options={maritalStatuses}
                        value={maritalStatuses.find(
                          (ms) => ms.value === values.maritalStatus,
                        )}
                        onChange={(option) =>
                          setFieldValue(
                            "maritalStatus",
                            option ? (option as any).value : "",
                          )
                        }
                        className="form__div"
                      />
                    </div>
                  </section>
                )}

                {/* ================================ STEP 2: IDENTITY VERIFICATION =========================== */}
                {step === 2 && (
                  <section className="step2">
                    <h2 className="mb-4 text-xl font-semibold">
                      Identity Verification (KYC)
                    </h2>

                    <div className="mt-4">
                      <label htmlFor="profilePicture">
                        Upload Profile Picture*
                      </label>
                      <input
                        type="file"
                        id="profilePicture"
                        accept="image/*"
                        className="form__div"
                        onChange={(e) =>
                          handleFileChange(
                            e,
                            setFieldValue,
                            "profilePicture",
                            setProfilePicturePreview,
                          )
                        }
                      />
                      {profilePicturePreview && (
                        <div className="mt-2">
                          <img
                            src={profilePicturePreview}
                            alt="Profile Preview"
                            className="h-24 w-24 object-cover"
                          />
                        </div>
                      )}
                      {errors.profilePicture && touched.profilePicture ? (
                        <div className="error-class">
                          {errors.profilePicture as string}
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-4">
                      <label htmlFor="governmentId">
                        Upload Government ID*
                      </label>
                      <input
                        type="file"
                        id="governmentId"
                        accept="image/*,.pdf"
                        className="form__div"
                        onChange={(e) =>
                          handleFileChange(
                            e,
                            setFieldValue,
                            "governmentId",
                            setIdPreview,
                          )
                        }
                      />
                      {idPreview && idPreview.startsWith("data:image") && (
                        <div className="mt-2">
                          <img
                            src={idPreview}
                            alt="ID Preview"
                            className="h-24 w-auto object-cover"
                          />
                        </div>
                      )}
                      {errors.governmentId && touched.governmentId ? (
                        <div className="error-class">
                          {errors.governmentId as string}
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-4">
                      <label htmlFor="idType">ID Type*</label>
                      <Select
                        options={idTypes}
                        value={idTypes.find(
                          (type) => type.value === values.idType,
                        )}
                        onChange={(option) =>
                          setFieldValue(
                            "idType",
                            option ? (option as any).value : "",
                          )
                        }
                        className="form__div"
                      />
                      {errors.idType && touched.idType ? (
                        <div className="error-class">{errors.idType}</div>
                      ) : null}
                    </div>

                    <div className="mt-4">
                      <label htmlFor="idNumber">ID Number*</label>
                      <Field
                        name="idNumber"
                        className="form__div"
                        placeholder="As shown on your ID"
                      />
                      {errors.idNumber && touched.idNumber ? (
                        <div className="error-class">{errors.idNumber}</div>
                      ) : null}
                    </div>

                    <div className="form__div mt-4 grid">
                      <label htmlFor="idExpiryDate">ID Expiry Date*</label>
                      <DatePicker
                        className="form__div"
                        selected={idExpiryDate}
                        onChange={(date: Date | null) => {
                          setIdExpiryDate(date);
                          setFieldValue("idExpiryDate", date);
                        }}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="Select date"
                        minDate={new Date()}
                      />
                      {errors.idExpiryDate && touched.idExpiryDate ? (
                        <div className="error-class">{errors.idExpiryDate}</div>
                      ) : null}
                    </div>

                    <div className="mt-4">
                      <label htmlFor="proofOfAddress">
                        Upload Proof of Address*
                      </label>
                      <input
                        type="file"
                        id="proofOfAddress"
                        accept="image/*,.pdf"
                        className="form__div"
                        onChange={(e) =>
                          handleFileChange(
                            e,
                            setFieldValue,
                            "proofOfAddress",
                            setAddressProofPreview,
                          )
                        }
                      />
                      {addressProofPreview &&
                        addressProofPreview.startsWith("data:image") && (
                          <div className="mt-2">
                            <img
                              src={addressProofPreview}
                              alt="Address Proof Preview"
                              className="h-24 w-auto object-cover"
                            />
                          </div>
                        )}
                      {errors.proofOfAddress && touched.proofOfAddress ? (
                        <div className="error-class">
                          {errors.proofOfAddress as string}
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-4">
                      <label htmlFor="addressDocType">
                        Address Document Type*
                      </label>
                      <Select
                        options={addressDocTypes}
                        value={addressDocTypes.find(
                          (type) => type.value === values.addressDocType,
                        )}
                        onChange={(option) =>
                          setFieldValue(
                            "addressDocType",
                            option ? (option as any).value : "",
                          )
                        }
                        className="form__div"
                      />
                      {errors.addressDocType && touched.addressDocType ? (
                        <div className="error-class">
                          {errors.addressDocType}
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-4">
                      <label htmlFor="socialSecurityNumber">
                        National Insurance/Social Security Number (Optional)
                      </label>
                      <Field
                        name="socialSecurityNumber"
                        className="form__div"
                      />
                    </div>

                    <div className="mt-4">
                      <label htmlFor="taxIdentificationNumber">
                        Tax Identification Number (TIN)*
                      </label>
                      <Field
                        name="taxIdentificationNumber"
                        className="form__div"
                      />
                      {errors.taxIdentificationNumber &&
                      touched.taxIdentificationNumber ? (
                        <div className="error-class">
                          {errors.taxIdentificationNumber}
                        </div>
                      ) : null}
                    </div>
                  </section>
                )}

                {/* ================================ STEP 3: CONTACT INFORMATION =========================== */}
                {step === 3 && (
                  <section className="step3">
                    <h2 className="mb-4 text-xl font-semibold">
                      Contact Information
                    </h2>

                    <div className="mt-4">
                      <label htmlFor="email">Email Address*</label>
                      <Field
                        name="email"
                        type="email"
                        className="form__div"
                        placeholder="For verification"
                      />
                      {errors.email && touched.email ? (
                        <div className="error-class">{errors.email}</div>
                      ) : null}
                    </div>

                    <div className="mt-4">
                      <label htmlFor="mobileNumber">Phone Number*</label>
                      <Field
                        name="mobileNumber"
                        className="form__div"
                        placeholder="With country code"
                      />
                      {errors.mobileNumber && touched.mobileNumber ? (
                        <div className="error-class">{errors.mobileNumber}</div>
                      ) : null}
                    </div>

                    <div className="mt-4">
                      <label htmlFor="alternativePhone">
                        Alternative Phone (Optional)
                      </label>
                      <Field name="alternativePhone" className="form__div" />
                    </div>

                    <div className="mt-4">
                      <label htmlFor="homeAddress">Residential Address*</label>
                      <Field
                        name="homeAddress"
                        as="textarea"
                        rows={3}
                        className="form__div"
                      />
                      {errors.homeAddress && touched.homeAddress ? (
                        <div className="error-class">{errors.homeAddress}</div>
                      ) : null}
                    </div>

                    <div className="mt-4">
                      <label htmlFor="city">City*</label>
                      <Field name="city" className="form__div" />
                      {errors.city && touched.city ? (
                        <div className="error-class">{errors.city}</div>
                      ) : null}
                    </div>

                    <div className="mt-4">
                      <label htmlFor="stateProvince">State/Province*</label>
                      <Field name="stateProvince" className="form__div" />
                      {errors.stateProvince && touched.stateProvince ? (
                        <div className="error-class">
                          {errors.stateProvince}
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-4">
                      <label htmlFor="zipCode">ZIP/Postal Code*</label>
                      <Field name="zipCode" className="form__div" />
                      {errors.zipCode && touched.zipCode ? (
                        <div className="error-class">{errors.zipCode}</div>
                      ) : null}
                    </div>

                    <div className="mt-4">
                      <label htmlFor="country">Country*</label>
                      <Select
                        className="form__div"
                        options={countries}
                        value={countries.find(
                          (country) => country.value === values.country,
                        )}
                        onChange={(option) => {
                          const selectedCountry = option as Country;
                          setFieldValue("country", selectedCountry.value);
                          setFieldValue(
                            "mobileNumber",
                            selectedCountry.code +
                              values.mobileNumber.replace(/^\+\d+/, ""),
                          );
                          setSelectedCountry(selectedCountry.label);
                        }}
                      />
                      {errors.country && touched.country ? (
                        <div className="error-class">{errors.country}</div>
                      ) : null}
                    </div>
                  </section>
                )}

                {/* ================================ STEP 4: BANKING PREFERENCES =========================== */}
                {step === 4 && (
                  <section className="step4">
                    <h2 className="mb-4 text-xl font-semibold">
                      Banking Preferences
                    </h2>

                    <div className="form__div mt-4 grid">
                      <label htmlFor="accountType">Type of Account*</label>
                      <Field
                        as="select"
                        name="accountType"
                        className="form__div"
                      >
                        <option value="">Select Account Type</option>
                        <option value="savings">Savings</option>
                        <option value="current">Current</option>
                        <option value="business">Business</option>
                        <option value="joint">Joint</option>
                        <option value="fixed deposit">Fixed Deposit</option>
                      </Field>
                      {errors.accountType && touched.accountType ? (
                        <div className="error-class">{errors.accountType}</div>
                      ) : null}
                    </div>

                    <div className="mt-4">
                      <label htmlFor="currency">Currency*</label>
                      <Select
                        options={currencies}
                        value={currencies.find(
                          (c) => c.value === values.currency,
                        )}
                        onChange={(option) =>
                          setFieldValue(
                            "currency",
                            option ? (option as any).value : "",
                          )
                        }
                        className="form__div"
                      />
                      {errors.currency && touched.currency ? (
                        <div className="error-class">{errors.currency}</div>
                      ) : null}
                    </div>

                    <div className="mt-4">
                      <label htmlFor="sourceOfIncome">Source of Income*</label>
                      <Select
                        options={incomeSources}
                        value={incomeSources.find(
                          (source) => source.value === values.sourceOfIncome,
                        )}
                        onChange={(option) =>
                          setFieldValue(
                            "sourceOfIncome",
                            option ? (option as any).value : "",
                          )
                        }
                        className="form__div"
                      />
                      {errors.sourceOfIncome && touched.sourceOfIncome ? (
                        <div className="error-class">
                          {errors.sourceOfIncome}
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-4">
                      <label htmlFor="monthlyIncomeRange">
                        Monthly Income Range*
                      </label>
                      <Select
                        options={incomeRanges}
                        value={incomeRanges.find(
                          (range) => range.value === values.monthlyIncomeRange,
                        )}
                        onChange={(option) =>
                          setFieldValue(
                            "monthlyIncomeRange",
                            option ? (option as any).value : "",
                          )
                        }
                        className="form__div"
                      />
                      {errors.monthlyIncomeRange &&
                      touched.monthlyIncomeRange ? (
                        <div className="error-class">
                          {errors.monthlyIncomeRange}
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-4">
                      <label htmlFor="initialDeposit">
                        Initial Deposit Amount* (Minimum: 100)
                      </label>
                      <Field
                        name="initialDeposit"
                        type="number"
                        min="100"
                        className="form__div"
                      />
                      {errors.initialDeposit && touched.initialDeposit ? (
                        <div className="error-class">
                          {errors.initialDeposit}
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-4">
                      <label htmlFor="employmentStatus">
                        Employment Status*
                      </label>
                      <Select
                        options={employmentStatuses}
                        value={employmentStatuses.find(
                          (status) => status.value === values.employmentStatus,
                        )}
                        onChange={(option) =>
                          setFieldValue(
                            "employmentStatus",
                            option ? (option as any).value : "",
                          )
                        }
                        className="form__div"
                      />
                      {errors.employmentStatus && touched.employmentStatus ? (
                        <div className="error-class">
                          {errors.employmentStatus}
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-4">
                      <label htmlFor="employerName">
                        Employer/Company Name
                        {(values.employmentStatus === "employed" ||
                          values.employmentStatus === "self-employed") &&
                          "*"}
                      </label>
                      <Field
                        name="employerName"
                        className="form__div"
                        disabled={
                          !["employed", "self-employed"].includes(
                            values.employmentStatus,
                          )
                        }
                      />
                      {errors.employerName && touched.employerName ? (
                        <div className="error-class">{errors.employerName}</div>
                      ) : null}
                    </div>

                    <div className="mt-4">
                      <label htmlFor="occupation">Occupation*</label>
                      <Field name="occupation" className="form__div" />
                      {errors.occupation && touched.occupation ? (
                        <div className="error-class">{errors.occupation}</div>
                      ) : null}
                    </div>
                  </section>
                )}

                {/* ================================ STEP 5: BANK ACCOUNT DETAILS =========================== */}
                {step === 5 && (
                  <section className="step5">
                    <h2 className="mb-4 text-xl font-semibold">
                      Bank Account Details
                    </h2>

                    <div className="mt-4">
                      <label htmlFor="accountName">Account Name*</label>
                      <Field
                        name="accountName"
                        placeholder="Pay Account Name"
                        className="form__div"
                      />
                      {errors.accountName && touched.accountName ? (
                        <div className="error-class">{errors.accountName}</div>
                      ) : null}
                    </div>

                    <div className="mt-4">
                      <label htmlFor="accountNumber">Account Number*</label>
                      <Field
                        name="accountNumber"
                        placeholder="**************"
                        className="form__div"
                      />
                      {errors.accountNumber && touched.accountNumber ? (
                        <div className="error-class">
                          {errors.accountNumber}
                        </div>
                      ) : null}
                    </div>

                    <div className="form__div">
                      <label htmlFor="bankName">Bank Name*</label>
                      <Select
                        options={banks}
                        value={banks.find(
                          (bank) => bank.value === values.bankName,
                        )}
                        onChange={(option) =>
                          setFieldValue(
                            "bankName",
                            option ? (option as Bank).value : "",
                          )
                        }
                      />
                      {errors.bankName && touched.bankName ? (
                        <div className="error-class">{errors.bankName}</div>
                      ) : null}
                    </div>

                    <div className="mt-4">
                      <label htmlFor="bankAddress">Bank Address*</label>
                      <Field name="bankAddress" className="form__div" />
                      {errors.bankAddress && touched.bankAddress ? (
                        <div className="error-class">{errors.bankAddress}</div>
                      ) : null}
                    </div>

                    <div className="mt-4">
                      <label
                        htmlFor="ibanNumber"
                        style={{
                          opacity: RoutingCountries.includes(
                            selectedCountry || "",
                          )
                            ? 0.5
                            : 1,
                        }}
                      >
                        IBAN Number
                      </label>
                      <Field
                        name="ibanNumber"
                        className="form__div"
                        placeholder="(optional) for non-US"
                        disabled={RoutingCountries.includes(
                          selectedCountry || "",
                        )}
                        style={{
                          backgroundColor: RoutingCountries.includes(
                            selectedCountry || "",
                          )
                            ? "lightgrey"
                            : "white",
                          opacity: RoutingCountries.includes(
                            selectedCountry || "",
                          )
                            ? 0.5
                            : 1,
                        }}
                      />
                      {errors.ibanNumber && touched.ibanNumber ? (
                        <div className="error-class">{errors.ibanNumber}</div>
                      ) : null}
                    </div>

                    <div className="mt-4">
                      <label
                        htmlFor="routingNumber"
                        style={{
                          opacity: !RoutingCountries.includes(
                            selectedCountry || "",
                          )
                            ? 0.5
                            : 1,
                        }}
                      >
                        Routing/BSB/sort code
                      </label>
                      <Field
                        name="routingNumber"
                        placeholder="Applies to USA, Australia, UK"
                        className="form__div"
                        disabled={
                          !RoutingCountries.includes(selectedCountry || "")
                        }
                        style={{
                          backgroundColor: !RoutingCountries.includes(
                            selectedCountry || "",
                          )
                            ? "lightgrey"
                            : "white",
                          opacity: !RoutingCountries.includes(
                            selectedCountry || "",
                          )
                            ? 0.5
                            : 1,
                        }}
                      />
                      {errors.routingNumber && touched.routingNumber ? (
                        <div className="error-class">
                          {errors.routingNumber}
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-4">
                      <label htmlFor="swiftBic">SWIFT/BIC*</label>
                      <Field name="swiftBic" className="form__div" />
                      {errors.swiftBic && touched.swiftBic ? (
                        <div className="error-class">{errors.swiftBic}</div>
                      ) : null}
                    </div>
                  </section>
                )}

                {/* ================================ STEP 6: SECURITY SETUP =========================== */}
                {step === 6 && (
                  <section className="step6">
                    <h2 className="mb-4 text-xl font-semibold">
                      Security Setup
                    </h2>

                    <div className="mt-4">
                      <label htmlFor="password">Create Password*</label>
                      <Field
                        name="password"
                        type="password"
                        className="form__div"
                        placeholder="Min 8 characters"
                      />
                      {errors.password && touched.password ? (
                        <div className="error-class">{errors.password}</div>
                      ) : null}
                    </div>

                    <div className="mt-4">
                      <label htmlFor="confirmPassword">Confirm Password*</label>
                      <Field
                        name="confirmPassword"
                        type="password"
                        className="form__div"
                      />
                      {errors.confirmPassword && touched.confirmPassword ? (
                        <div className="error-class">
                          {errors.confirmPassword}
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-4">
                      <label htmlFor="securityQuestion">
                        Security Question*
                      </label>
                      <Select
                        options={securityQuestions}
                        value={securityQuestions.find(
                          (q) => q.value === values.securityQuestion,
                        )}
                        onChange={(option) =>
                          setFieldValue(
                            "securityQuestion",
                            option ? (option as any).value : "",
                          )
                        }
                        className="form__div"
                      />
                      {errors.securityQuestion && touched.securityQuestion ? (
                        <div className="error-class">
                          {errors.securityQuestion}
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-4">
                      <label htmlFor="securityAnswer">Security Answer*</label>
                      <Field name="securityAnswer" className="form__div" />
                      {errors.securityAnswer && touched.securityAnswer ? (
                        <div className="error-class">
                          {errors.securityAnswer}
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-4 flex items-center">
                      <Field
                        name="enableTwoFactor"
                        type="checkbox"
                        id="enableTwoFactor"
                        className="mr-2"
                        checked={values.enableTwoFactor}
                        onChange={() => {
                          setFieldValue(
                            "enableTwoFactor",
                            !values.enableTwoFactor,
                          );
                        }}
                      />
                      <label htmlFor="enableTwoFactor">
                        Enable Two-Factor Authentication
                      </label>
                    </div>

                    {values.enableTwoFactor && (
                      <div className="mt-4">
                        <label htmlFor="twoFactorMethod">
                          Select Preferred 2FA Method*
                        </label>
                        <Select
                          options={twoFactorMethods}
                          value={twoFactorMethods.find(
                            (m) => m.value === values.twoFactorMethod,
                          )}
                          onChange={(option) =>
                            setFieldValue(
                              "twoFactorMethod",
                              option ? (option as any).value : "",
                            )
                          }
                          className="form__div"
                        />
                        {errors.twoFactorMethod && touched.twoFactorMethod ? (
                          <div className="error-class">
                            {errors.twoFactorMethod}
                          </div>
                        ) : null}
                      </div>
                    )}
                  </section>
                )}

                {/* ================================ STEP 7: TERMS AND VERIFICATION =========================== */}
                {step === 7 && (
                  <section className="step7">
                    <h2 className="mb-4 text-xl font-semibold">
                      Terms and Verification
                    </h2>

                    <div className="mt-4">
                      <label htmlFor="selfieWithId">
                        Upload Selfie with ID*
                      </label>
                      <input
                        type="file"
                        id="selfieWithId"
                        accept="image/*"
                        className="form__div"
                        onChange={(e) =>
                          handleFileChange(
                            e,
                            setFieldValue,
                            "selfieWithId",
                            setSelfiePreview,
                          )
                        }
                      />
                      {selfiePreview && (
                        <div className="mt-2">
                          <img
                            src={selfiePreview}
                            alt="Selfie with ID Preview"
                            className="h-24 w-auto object-cover"
                          />
                        </div>
                      )}
                      {errors.selfieWithId && touched.selfieWithId ? (
                        <div className="error-class">
                          {errors.selfieWithId as string}
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-4">
                      <label htmlFor="signature">
                        Upload Signature (Optional)
                      </label>
                      <input
                        type="file"
                        id="signature"
                        accept="image/png"
                        className="form__div"
                        onChange={(e) =>
                          handleFileChange(
                            e,
                            setFieldValue,
                            "signature",
                            setSignaturePreview,
                          )
                        }
                      />
                      {signaturePreview && (
                        <div className="mt-2">
                          <img
                            src={signaturePreview}
                            alt="Signature Preview"
                            className="h-12 w-auto object-contain"
                          />
                        </div>
                      )}
                    </div>

                    <div className="mt-4">
                      <label htmlFor="referralCode">
                        Referral Code (Optional)
                      </label>
                      <Field name="referralCode" className="form__div" />
                    </div>

                    <div className="mt-4">
                      <label htmlFor="inviteCode">Invite Code (Optional)</label>
                      <Field name="inviteCode" className="form__div" />
                    </div>

                    <div className="mt-6">
                      <div className="mb-4 flex items-center">
                        <Field
                          name="agreeToTerms"
                          type="checkbox"
                          id="agreeToTerms"
                          className="mr-2"
                        />
                        <label htmlFor="agreeToTerms">
                          I agree to the Terms and Conditions*
                        </label>
                      </div>
                      {errors.agreeToTerms && touched.agreeToTerms ? (
                        <div className="error-class">{errors.agreeToTerms}</div>
                      ) : null}

                      <div className="mb-4 flex items-center">
                        <Field
                          name="agreeToPrivacy"
                          type="checkbox"
                          id="agreeToPrivacy"
                          className="mr-2"
                        />
                        <label htmlFor="agreeToPrivacy">
                          I agree to the Privacy Policy*
                        </label>
                      </div>
                      {errors.agreeToPrivacy && touched.agreeToPrivacy ? (
                        <div className="error-class">
                          {errors.agreeToPrivacy}
                        </div>
                      ) : null}

                      <div className="mb-4 flex items-center">
                        <Field
                          name="agreeToDataSharing"
                          type="checkbox"
                          id="agreeToDataSharing"
                          className="mr-2"
                        />
                        <label htmlFor="agreeToDataSharing">
                          I agree to Data Sharing/Processing
                        </label>
                      </div>
                    </div>

                    {/* CAPTCHA would be implemented here in a real application */}
                    <div className="border-gray-200 mt-4 flex items-center justify-center border p-4">
                      <p className="text-gray-500">
                        CAPTCHA Verification Widget
                      </p>
                    </div>
                  </section>
                )}
              </div>

              {/* ================================ FORM BUTTONS =========================== */}
              <div className="mt-6 flex items-center justify-between gap-10 p-4">
                {/* Previous Button */}
                <button
                  type="button"
                  className="bg-white w-full rounded-md px-4 py-1 text-sm font-normal md:py-2 md:text-base"
                  onClick={() => setStep(step > 1 ? step - 1 : 1)}
                >
                  Previous
                </button>

                {/* Next/Submit Button */}
                <button
                  type={step === steps ? "submit" : "button"}
                  disabled={isSubmitting}
                  className="text-white w-full rounded-md bg-blue-600 px-4 py-1 text-sm font-semibold md:py-2 md:text-base lg:text-base"
                  onClick={async () => {
                    // Validate current step's fields
                    const errors = await validateForm();
                    const fieldsToTouch = getFieldsByStep(step);
                    const touchedFields: { [key: string]: boolean } = {};
                    fieldsToTouch.forEach((field) => {
                      touchedFields[field] = true;
                    });
                    setTouched(touchedFields);

                    // Only proceed if current step has no errors
                    if (
                      Object.keys(errors).filter((key) =>
                        fieldsToTouch.includes(key),
                      ).length === 0
                    ) {
                      if (step < steps) {
                        setStep(step + 1);
                      } else if (isLastStep) {
                        handleSubmit(values);
                      }
                    }
                  }}
                >
                  {step === steps ? "Submit" : "Next"}
                </button>
              </div>

              {/* Show spinner during submit */}
              <SubmitSpinner visible={isSubmitting} />

              {/* Show action info */}
              {showSuccess && <Success onClose={handleCloseSuccess} />}
              {showError && <Error onClose={handleCloseError} />}
            </Form>
          </div>
        )}
      </Formik>

      {/* Button to homepage */}
      {/* <Link
        to="/"
        className="text-white m-6 flex gap-x-2 rounded-md bg-blue-400 px-4 py-2 text-[10px] font-semibold md:text-base lg:text-base"
      >
        <TiArrowBackOutline className="items-center justify-center text-base" />
        Back to homePage
      </Link> */}
    </FormContainer>
  );
};

export default Signup;
