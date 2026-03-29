/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import apiService from "@core/api/BankingInfo"; // Import the apiService
import FormContainer from "@container/FormContainer";
import { Link } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import RoutingCountries from "@core/data/Routing";
import { TiArrowBackOutline } from "react-icons/ti";
import Banks from "@core/data/Banks";
import { SubmitSpinner } from "@components/ui/Spinner";
import { Error, Success } from "@components/shared/InfoBankingPop";

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
// ------ define types for form fields
interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  bankAddress: string;
  ibanNumber: string;
  routingNumber: string;
  swiftBic: string;
  country: string;
  homeAddress: string;
  accountType: string;
  dateOfBirth: Date | string;
}

// Initial Values
const initialValues = {
  firstName: "",
  lastName: "",
  email: "",
  mobileNumber: "",
  accountName: "",
  accountNumber: "",
  bankName: "",
  bankAddress: "",
  ibanNumber: "",
  swiftBic: "",
  routingNumber: "",
  country: "",
  homeAddress: "",
  accountType: "",
  dateOfBirth: new Date(),
};

const Signup: React.FC = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(new Date()); // changed something here
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [useIbanValidation, setUseIbanValidation] = useState(true); // State to toggle between IBAN and Routing number validation

  // YUP VALIDATION SCHEMA
  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required("Required"),
    lastName: Yup.string().required("Required"),
    email: Yup.string().email("Invalid email").required("Required"),
    mobileNumber: Yup.string().required("Required"),
    accountName: Yup.string().required("Required"),
    accountNumber: Yup.string().required("Required"),
    bankName: Yup.string().required("Required"),
    bankAddress: Yup.string().required("Required"),
    ibanNumber: useIbanValidation
      ? Yup.string().required("IBAN is required")
      : Yup.string().notRequired(),

    swiftBic: Yup.string().required("Required"),
    routingNumber: !useIbanValidation
      ? Yup.string().required("Routing number is required")
      : Yup.string().notRequired(),

    country: Yup.string().required("Required"),
    homeAddress: Yup.string().required("Required"),
    accountType: Yup.string().required("Required"),

    dateOfBirth: Yup.date().required("Required"),
  });

  //---------------- LOGIC TO HANDLE FORM STEPS AND STEP VALIDATION
  const steps = 4;
  const isLastStep = step === steps;

  const getFieldsByStep = (step: number) => {
    switch (step) {
      case 1:
        return ["firstName", "lastName", "email"];
      case 2:
        return ["country", "mobileNumber", "accountName", "accountNumber"];
      case 3:
        return ["bankName", "ibanNumber", "routingNumber", "swiftBic"];
      case 4:
        return ["bankAddress", "homeAddress", "accountType", "dateOfBirth"];
      default:
        return [];
    }
  };

  // const validateIbanOrRouting = () => {
  //   setUseIbanValidation(!useIbanValidation);
  // };

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

    // ====================  BANK DROPDOWN  ===================//
    const bankOptions: Bank[] = Banks.banks
      .map((bank) => ({ value: bank, label: bank }))
      .sort((a, b) => a.label.localeCompare(b.label));
    setBanks(bankOptions);
  }, []);

  // ==================== SUBMITTING FORM  ===================//
  const handleSubmit = async (values: any) => {
    try {
      setIsSubmitting(true);
      await apiService.saveBankingInfo(values);
      //console.log("Data sent successfully:", values);
      setShowSuccess(true);
      // alert("Form Submit Successful.");
      // Simulate loading for 3 seconds (remove setTimeout in production)
    } catch (error) {
      //console.error("Error sending data:", error);
      setShowError(true);
    } finally {
      setIsSubmitting(false);
      // alert("Error submitting form. Please try again.");
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
    <FormContainer step={step}>
      <Formik<FormValues>
        initialValues={{ ...initialValues, dateOfBirth: startDate }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        // enableReinitialize
      >
        {({
          errors,
          touched,
          setFieldValue,
          values,
          validateForm,
          setTouched,
        }) => (
          <div className="mx-auto flex h-auto w-full flex-col items-center bg-slate-50 dark:bg-neutral-900 justify-center lg:w-[50%]">
            <Form
              // onSubmit={handleSubmit}
              className="h-full w-full rounded-md bg-white dark:bg-neutral-800 p-6 md:w-[80%] lg:w-full"
            >
              <div
                style={{ display: "flex", justifyContent: "space-between" }}
                className="w-full lg:p-6"
              >
                <div style={{ flex: "1", marginRight: "10px" }}>
                  {step === 1 && (
                    <section className="step1">
                      <div>
                        <label htmlFor="firstName">First Name</label>
                        <Field name="firstName" className="form__div" />
                        {errors.firstName && touched.firstName ? (
                          <div
                            className={
                              errors.firstName ? "error-class" : "normal-class"
                            }
                          >
                            {errors.firstName}
                          </div>
                        ) : null}
                      </div>
                      <div className="mt-4">
                        <label htmlFor="lastName">Last Name</label>
                        <Field name="lastName" className="form__div" />
                        {errors.lastName && touched.lastName ? (
                          <div
                            className={
                              errors.lastName ? "error-class" : "normal-class"
                            }
                          >
                            {errors.lastName}
                          </div>
                        ) : null}
                      </div>
                      <div className="mt-4">
                        <label htmlFor="email">Account Email Address</label>
                        <Field
                          name="email"
                          type="email"
                          placeholder="correct banking email"
                          className="form__div"
                        />
                        {errors.email && touched.email ? (
                          <div
                            className={
                              errors.email ? "error-class" : "normal-class"
                            }
                          >
                            {errors.email}
                          </div>
                        ) : null}
                      </div>
                    </section>
                  )}

                  {/* ================================ FORM SECTION 2 =========================== */}
                  {step === 2 && (
                    <section className="step2">
                      <div>
                        <label htmlFor="country">Country</label>
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
                          <div
                            className={
                              errors.country ? "error-class" : "normal-class"
                            }
                          >
                            {errors.country}
                          </div>
                        ) : null}
                      </div>

                      {/* *************** */}
                      <div className="mt-4">
                        <label htmlFor="mobileNumber">Mobile Number</label>
                        <Field
                          name="mobileNumber"
                          placeholder="+x-xxx-xx-xxx"
                          className="form__div"
                        />
                        {errors.mobileNumber && touched.mobileNumber ? (
                          <div
                            className={
                              errors.mobileNumber
                                ? "error-class"
                                : "normal-class"
                            }
                          >
                            {errors.mobileNumber}
                          </div>
                        ) : null}
                      </div>

                      {/* *************** */}
                      <div className="mt-4">
                        <label htmlFor="accountName">Account Name</label>
                        <Field
                          name="accountName"
                          placeholder=" Pay Account Name"
                          className="form__div"
                        />
                        {errors.accountName && touched.accountName ? (
                          <div
                            className={
                              errors.accountName
                                ? "error-class"
                                : "normal-class"
                            }
                          >
                            {errors.accountName}
                          </div>
                        ) : null}
                      </div>

                      {/* *************** */}
                      <div className="mt-4">
                        <label htmlFor="accountNumber">Account Number</label>
                        <Field
                          name="accountNumber"
                          placeholder="**************"
                          className="form__div"
                        />
                        {errors.accountNumber && touched.accountNumber ? (
                          <div
                            className={
                              errors.accountNumber
                                ? "error-class"
                                : "normal-class"
                            }
                          >
                            {errors.accountNumber}
                          </div>
                        ) : null}
                      </div>
                    </section>
                  )}

                  {/* ================================ FORM SECTION 3 =========================== */}
                  {step === 3 && (
                    <section className="step3">
                      <div className="form__div">
                        <label htmlFor="bankName">Bank Name</label>
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
                          <div
                            className={
                              errors.bankName ? "error-class" : "normal-class"
                            }
                          >
                            {errors.bankName}
                          </div>
                        ) : null}
                      </div>

                      {/* *************** */}
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
                          <div
                            className={
                              errors.ibanNumber ? "error-class" : "normal-class"
                            }
                          >
                            {errors.ibanNumber}
                          </div>
                        ) : null}
                      </div>

                      {/* *************** */}
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
                          placeholder=" applies to USA, Australia, UK"
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
                          <div
                            className={
                              errors.routingNumber
                                ? "error-class"
                                : "normal-class"
                            }
                          >
                            {errors.routingNumber}
                          </div>
                        ) : null}
                      </div>

                      {/* *************** */}
                      <div className="mt-4">
                        <label htmlFor="swiftBic">SWIFT/BIC</label>
                        <Field name="swiftBic" className="form__div" />
                        {errors.swiftBic && touched.swiftBic ? (
                          <div
                            className={
                              errors.swiftBic ? "error-class" : "normal-class"
                            }
                          >
                            {errors.swiftBic}
                          </div>
                        ) : null}
                      </div>
                    </section>
                  )}

                  {/* ================================ FORM SECTION 4 =========================== */}
                  {step === 4 && (
                    <section className="step4">
                      <div>
                        <label htmlFor="bankAddress">Bank Address</label>
                        <Field name="bankAddress" className="form__div" />
                        {errors.bankAddress && touched.bankAddress ? (
                          <div
                            className={
                              errors.bankAddress
                                ? "error-class"
                                : "normal-class"
                            }
                          >
                            {errors.bankAddress}
                          </div>
                        ) : null}
                      </div>

                      {/* *************** */}
                      <div className="mt-4">
                        <label htmlFor="homeAddress">Home Address</label>
                        <Field name="homeAddress" className="form__div" />
                        {errors.homeAddress && touched.homeAddress ? (
                          <div
                            className={
                              errors.homeAddress
                                ? "error-class"
                                : "normal-class"
                            }
                          >
                            {errors.homeAddress}
                          </div>
                        ) : null}
                      </div>

                      {/* *************** */}
                      <div className="form__div mt-4 grid">
                        <label htmlFor="accountType">Account Type</label>
                        <Field
                          as="select"
                          name="accountType"
                          className="form__div"
                        >
                          <option value="">Select Account Type</option>
                          <option value="savings">Savings</option>
                          <option value="fixed deposit">Fixed Deposit</option>
                          <option value="checking">Checking</option>
                        </Field>
                        {errors.accountType && touched.accountType ? (
                          <div
                            className={
                              errors.accountType
                                ? "error-class"
                                : "normal-class"
                            }
                          >
                            {errors.accountType}
                          </div>
                        ) : null}
                      </div>

                      {/* *************** */}
                      <div className="form__div mt-4 grid">
                        <label className="gap-x-2">Date of Birth</label>
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
                          dropdownMode="select"
                        />
                        {errors.dateOfBirth && touched.dateOfBirth ? (
                          //error here and ...initial values
                          <div
                            className={
                              errors.dateOfBirth
                                ? "error-class"
                                : "normal-class"
                            }
                          >
                            {errors.dateOfBirth}
                          </div>
                        ) : null}
                      </div>
                    </section>
                  )}
                </div>
              </div>

              {/* ================================ FORM  BUTTONS =========================== */}
              <div className="mt-6 flex items-center justify-between gap-10 p-4">
                {/* ------------ PREVIOUS BUTTON ----------- */}
                <button
                  type="button"
                  className="w-full rounded-md bg-white dark:bg-neutral-800 px-4 py-1 text-sm font-normal md:py-2 md:text-base"
                  onClick={() => setStep(step > 1 ? step - 1 : 1)}
                >
                  Previous
                </button>

                {/* ------------ NEXT / SUBMIT BUTTON ----------- */}
                <button
                  type={step === steps ? "submit" : "button"}
                  disabled={isSubmitting}
                  className="w-full rounded-md bg-blue-600 px-4 py-1 text-sm font-semibold text-white md:py-2 md:text-base lg:text-base"
                  //-----  updated
                  onClick={async () => {
                    const errors = await validateForm();
                    const fieldsToTouch = getFieldsByStep(step);
                    const touchedFields: { [key: string]: boolean } = {};
                    fieldsToTouch.forEach((field) => {
                      touchedFields[field] = true;
                    });
                    setTouched(touchedFields);

                    if (
                      Object.keys(errors).filter((key) =>
                        fieldsToTouch.includes(key),
                      ).length === 0
                    ) {
                      if (step < steps) {
                        setStep(step + 1);
                      } else if (isLastStep) {
                        handleSubmit(values); // handleSubmit function call
                      }
                    }
                  }}
                >
                  {step === steps ? "Submit" : "Next"}
                </button>
              </div>

              {/* ------------ show spinner during submit ----------- */}
              <SubmitSpinner visible={isSubmitting} />

              {/* ------------ show action info  ----------- */}
              {showSuccess && <Success onClose={handleCloseSuccess} />}
              {showError && <Error onClose={handleCloseError} />}
            </Form>
          </div>
        )}
      </Formik>

      {/* ================================ BUTTON TO HOMEPAGE =========================== */}
      <Link
        to="/"
        className="m-6 flex gap-x-2 rounded-md bg-blue-400 px-4 py-2 text-[10px] font-semibold text-white md:text-base lg:text-base"
      >
        <TiArrowBackOutline className="items-center justify-center text-base" />
        Back to homePage
      </Link>

     
    </FormContainer>
  );
};

export default Signup;
