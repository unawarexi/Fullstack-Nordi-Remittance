/* eslint-disable @typescript-eslint/no-explicit-any */
import Images from "@utils/constants/Image_strings";
import React, { useState } from "react";
import { FaEye, FaEyeSlash, FaLock, FaEnvelope } from "react-icons/fa";
import GetLocation from "@utils/GetLocation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { useAdminLogin } from "@hooks/queries/useAdmin";
import { SubmitSpinner } from "@components/shared/Spinner";
import { useAuthStore } from "@store/auth.store";

const AdminLogin = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible);
  const navigate = useNavigate();

  const { setAuthenticated } = useAuthStore();
  const loginMutation = useAdminLogin();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email address").required("Required"),
      password: Yup.string().required("Required"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setError(null);
      try {
        const responseData = await loginMutation.mutateAsync(values);

        if (responseData && responseData.token) {
          import("@core/api/client").then(({ TokenManager }) => {
            TokenManager.setTokens(responseData.token, responseData.token);
          });
        }

        if (responseData && responseData.admin) {
          setAuthenticated({
            id: responseData.admin.id || "admin",
            email: responseData.admin.email,
            firstName: responseData.admin.firstName || "Admin",
            lastName: responseData.admin.lastName || "",
            role: "admin",
            kycStatus: "verified",
            isEmailVerified: true,
            isPhoneVerified: true,
          });
        }
        // Notification is handled in the mutation
        navigate("/admin/dashboard");
      } catch (err: any) {
        const msg =
          err?.message || "Login failed. Please check your credentials.";
        setError(msg);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <section className="relative h-screen w-full">
      {/* LEFT SECTION */}
      <div className="absolute left-0 top-0  flex h-full flex-col items-center justify-center space-y-6 bg-slate-50 bg-opacity-30 p-10 backdrop-blur-lg">
        {/* Login Nav */}
        <div className="mb-10 flex w-full justify-between">
          <a className="title-font flex items-center font-medium text-gray-900">
            <img src={Images.headerLogo} alt="Nordea" className="w-40 px-2" />
          </a>
          <div>
            <GetLocation />
          </div>
        </div>

        {/* Text */}
        <div className="w-full px-6 text-white">
          <h1 className="mb-6 text-center text-4xl font-semibold">
            Nordea Bank Admin Login
          </h1>
          <div className="px-10 text-start">
            <p className="mb-4 text-lg">
              Please sign in with your admin credentials to access the Nordea
              Bank admin dashboard.
            </p>
            <p className="text-sm text-yellow-300">
              <strong>Authorized personnel only.</strong> If you are not an
              administrator, please return to the main site.
            </p>
          </div>
        </div>

        {/* Form */}
        <form
          className="w-full max-w-sm space-y-4"
          onSubmit={formik.handleSubmit}
        >
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 transform text-slate-500">
              <FaEnvelope />
            </div>
            <input
              placeholder="Admin E-mail"
              type="text"
              name="email"
              className="w-full rounded-lg border border-gray-300 bg-transparent py-3 pl-12 pr-4 placeholder-white focus:outline-none focus:ring-2 focus:ring-green-500"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
            />
            {formik.touched.email && formik.errors.email ? (
              <div className="px-2 pt-1 text-xs text-red-400">
                {formik.errors.email}
              </div>
            ) : null}
          </div>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 transform text-slate-500">
              <FaLock />
            </div>
            <input
              placeholder="Admin Password"
              type={passwordVisible ? "text" : "password"}
              name="password"
              className="w-full rounded-lg border border-gray-300 bg-transparent py-3 pl-12 pr-4 placeholder-white focus:outline-none focus:ring-2 focus:ring-green-500"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.password}
            />
            <div
              className="absolute right-3 top-1/2 -translate-y-1/2 transform cursor-pointer"
              onClick={togglePasswordVisibility}
            >
              {passwordVisible ? (
                <FaEyeSlash className="text-gray-500" />
              ) : (
                <FaEye className="text-gray-500" />
              )}
            </div>
            {formik.touched.password && formik.errors.password ? (
              <div className="px-2 pt-1 text-xs text-red-400">
                {formik.errors.password}
              </div>
            ) : null}
          </div>
        </form>
        {/* Show error message */}
        {error && <div className="px-2 pt-1 text-xs text-red-400">{error}</div>}

        {/* Forgot password */}
        <div className="text-center text-white">
          <p className="text-sm">
            <span className="cursor-pointer text-blue-500">
              Forgot Admin Password?
            </span>
          </p>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex w-full max-w-sm flex-col space-y-4">
          <button
            className="flex w-full items-center justify-center rounded-lg bg-blue-700 py-3 text-lg text-slate-50 transition-all hover:bg-blue-600"
            type="submit"
            onClick={(e) => {
              e.preventDefault();
              formik.handleSubmit();
            }}
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? (
              <SubmitSpinner visible={formik.isSubmitting} />
            ) : (
              "Admin Sign In"
            )}
          </button>
        </div>

        {/* Reach out */}
        <div className="mt-20 gap-y-20 text-center text-white">
          <p>
            Need help?{" "}
            <span className="cursor-pointer text-blue-500">
              Contact IT Support
            </span>
          </p>
        </div>

        {/* License */}
        <div className="bottom-0 mt-6 text-center text-sm text-white">
          <p>
            @2024 Nordea Bank PLC. (Licensed by the International Monetary Fund)
          </p>
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="right-0 top-0 h-full">
        <img
          src={Images.adminLoginBg}
          alt="auth card image"
          className="h-full w-full object-cover"
        />
      </div>
    </section>
  );
};

export default AdminLogin;
