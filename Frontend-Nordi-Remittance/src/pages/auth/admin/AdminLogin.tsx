/* eslint-disable @typescript-eslint/no-explicit-any */
import Images from "@utils/constants/Image_strings";
import React, { useState } from "react";
import { FaEye, FaEyeSlash, FaLock, FaEnvelope } from "react-icons/fa";
import GetLocation from "@utils/GetLocation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { login } from "@core/api/adminApis/AdminAuthService";
import { SubmitSpinner } from "@components/shared/Spinner";
import { toast } from "sonner";

const AdminLogin = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible);
  const navigate = useNavigate();

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
        await login(values);
        toast.success("Login successful!", { position: "top-right" });
        navigate("/admin/dashboard");
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ||
          "Login failed. Please check your credentials.";
        setError(msg);
        toast.error(msg, { position: "top-right" });
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <section className="relative w-full h-screen">
      {/* LEFT SECTION */}
      <div className="absolute left-0 top-0  h-full bg-slate-50 bg-opacity-30 backdrop-blur-lg p-10 flex flex-col justify-center items-center space-y-6">
        {/* Login Nav */}
        <div className="flex justify-between w-full mb-10">
          <a className="title-font text-gray-900 flex items-center font-medium">
            <img src={Images.headerLogo} alt="Nordea" className="w-40 px-2" />
          </a>
          <div>
            <GetLocation />
          </div>
        </div>

        {/* Text */}
        <div className="w-full text-white px-6">
          <h1 className="text-center text-4xl font-semibold mb-6">Nordea Bank Admin Login</h1>
          <div className="text-start px-10">
            <p className="mb-4 text-lg">
              Please sign in with your admin credentials to access the Nordea Bank admin dashboard.
            </p>
            <p className="text-sm text-yellow-300">
              <strong>Authorized personnel only.</strong> If you are not an administrator, please return to the main site.
            </p>
          </div>
        </div>

        {/* Form */}
        <form className="w-full max-w-sm space-y-4" onSubmit={formik.handleSubmit}>
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">
              <FaEnvelope />
            </div>
            <input
              placeholder="Admin E-mail"
              type="text"
              name="email"
              className="w-full rounded-lg py-3 pl-12 pr-4 bg-transparent border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-white"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
            />
            {formik.touched.email && formik.errors.email ? (
              <div className="text-red-400 text-xs px-2 pt-1">{formik.errors.email}</div>
            ) : null}
          </div>
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">
              <FaLock />
            </div>
            <input
              placeholder="Admin Password"
              type={passwordVisible ? "text" : "password"}
              name="password"
              className="w-full rounded-lg py-3 pl-12 pr-4 bg-transparent border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-white"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.password}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer" onClick={togglePasswordVisibility}>
              {passwordVisible ? <FaEyeSlash className="text-gray-500" /> : <FaEye className="text-gray-500" />}
            </div>
            {formik.touched.password && formik.errors.password ? (
              <div className="text-red-400 text-xs px-2 pt-1">{formik.errors.password}</div>
            ) : null}
          </div>
        </form>
        {/* Show error message */}
        {error && (
          <div className="text-red-400 text-xs px-2 pt-1">{error}</div>
        )}

        {/* Forgot password */}
        <div className="text-center text-white">
          <p className="text-sm">
            <span className="text-blue-500 cursor-pointer">Forgot Admin Password?</span>
          </p>
        </div>

        {/* Buttons */}
        <div className="w-full max-w-sm flex flex-col space-y-4 mt-6">
          <button
            className="w-full py-3 rounded-lg bg-blue-700 text-slate-50 text-lg hover:bg-blue-600 transition-all flex items-center justify-center"
            type="submit"
            onClick={(e) => {
              e.preventDefault();
              formik.handleSubmit();
            }}
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? <SubmitSpinner visible={formik.isSubmitting} /> : "Admin Sign In"}
          </button>
        </div>

        {/* Reach out */}
        <div className="text-center text-white mt-20 gap-y-20">
          <p>
            Need help? <span className="text-blue-500 cursor-pointer">Contact IT Support</span>
          </p>
        </div>

        {/* License */}
        <div className="text-center bottom-0 text-white text-sm mt-6">
          <p>
            @2024 Nordea Bank PLC. (Licensed by the International Monetary Fund)
          </p>
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="right-0 top-0 h-full">
        <img src={Images.adminLoginBg} alt="auth card image" className="w-full h-full object-cover" />
      </div>
    </section>
  );
};

export default AdminLogin;
