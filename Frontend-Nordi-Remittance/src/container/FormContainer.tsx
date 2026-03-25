/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { ReactNode, useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Shield, Globe, CreditCard } from "lucide-react";
import Images from "@utils/constants/Image_strings";
import GetLocation from "@utils/GetLocation";
import useThemeStore from "@store/theme.store";
import { lightTheme, darkTheme, gradients } from "@constants/colors";

interface FormContainerProps {
  children: ReactNode;
  step: number;
  totalSteps: number;
}

const FormContainer: React.FC<FormContainerProps> = ({ children, step, totalSteps = 7 }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.includes("admin");
  const { isDarkMode } = useThemeStore();
  const theme = useMemo(() => (isDarkMode ? darkTheme : lightTheme), [isDarkMode]);

  // Create step titles for better user understanding
  const getStepTitle = (index: number) => {
    switch (index) {
      case 1: return "Personal";
      case 2: return "Identity";
      case 3: return "Contact";
      case 4: return "Banking";
      case 5: return "Account";
      case 6: return "Security";
      case 7: return "Verify";
      default: return `Step ${index}`;
    }
  };

  // Feature items for the sidebar
  const features = [
    { icon: <Shield className="w-5 h-5" />, title: "Secure Registration", desc: "Bank-grade encryption" },
    { icon: <Globe className="w-5 h-5" />, title: "Global Access", desc: "Bank from anywhere" },
    { icon: <CreditCard className="w-5 h-5" />, title: "Smart Banking", desc: "Modern financial tools" },
  ];

  return (
    <section className="relative flex min-h-screen w-full overflow-hidden">
      {/* LEFT SECTION - Form */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex w-full flex-col p-4 md:p-6 lg:p-8 lg:w-[65%]"
        style={{ backgroundColor: theme.background.secondary }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Link to="/" className="flex items-center">
            <motion.img
              whileHover={{ scale: 1.05 }}
              src={Images.headerLogo}
              alt="Nordea"
              className="h-8 md:h-10 w-auto"
            />
          </Link>
          <GetLocation />
        </div>

        {/* Title Section */}
        <div className="text-center mb-4">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold" style={{ color: theme.text.primary }}>
            {isAdminRoute ? "Create and Authorize Account" : "Banking Account Registration"}
          </h1>
          <p className="mt-2 text-sm md:text-base" style={{ color: theme.text.secondary }}>
            Complete all required information to set up your account
          </p>
          {!isAdminRoute && (
            <p className="mt-2 text-sm" style={{ color: theme.text.tertiary }}>
              Already have an account?{" "}
              <Link to="/auth/login" className="hover:underline font-semibold" style={{ color: theme.text.link }}>
                Login
              </Link>
            </p>
          )}
        </div>

        {/* Progress Stepper */}
        <div className="mb-6">
          <div className="flex items-center justify-between gap-1 md:gap-2 overflow-x-auto py-2">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((index) => (
              <div key={index} className="flex items-center flex-1 min-w-0">
                <div className="flex flex-col items-center flex-shrink-0">
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: index === step ? 1.1 : 1 }}
                    className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full font-semibold text-sm transition-all duration-300"
                    style={{
                      backgroundColor:
                        index < step
                          ? "#10B981"
                          : index === step
                          ? theme.text.link
                          : theme.surface.tertiary,
                      color:
                        index <= step ? "#FFFFFF" : theme.text.muted,
                      boxShadow: index === step ? `0 4px 12px ${theme.text.link}40` : undefined,
                    }}
                  >
                    {index < step ? <Check className="w-4 h-4" /> : index}
                  </motion.div>
                  <span
                    className="mt-1 text-[10px] md:text-xs whitespace-nowrap"
                    style={{
                      color: index === step ? theme.text.link : theme.text.muted,
                      fontWeight: index === step ? 600 : 400,
                    }}
                  >
                    {getStepTitle(index)}
                  </span>
                </div>
                {index < totalSteps && (
                  <div
                    className="flex-1 h-0.5 mx-1 md:mx-2 transition-colors duration-300"
                    style={{ backgroundColor: index < step ? "#10B981" : theme.border.primary }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>

        {/* Back to home link */}
        <div className="mt-4 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm transition-colors"
            style={{ color: theme.text.secondary }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Homepage
          </Link>
        </div>

        {/* Footer */}
        <div
          className="mt-4 pt-4 border-t text-center text-xs"
          style={{ borderColor: theme.border.primary, color: theme.text.muted }}
        >
          <p>© 2024 Nordea Bank PLC. (Licensed by the International Monetary Fund)</p>
        </div>
      </motion.div>

      {/* RIGHT SECTION - Visual */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="hidden lg:flex lg:w-[35%] flex-col items-center justify-center p-8 relative overflow-hidden"
        style={{
          background: isDarkMode
            ? gradients.dark
            : "linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #1E40AF 100%)",
        }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
        </div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-sm">
          {/* Card Image */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <img
              src={Images.authCard2}
              alt="Banking Card"
              className="w-full max-w-xs mx-auto drop-shadow-2xl"
            />
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mb-6"
          >
            <h2 className="text-2xl font-bold text-white mb-2">Join Nordea Banking</h2>
            <p className="text-white/80 text-sm">Start your journey to better banking today</p>
          </motion.div>

          {/* Features */}
          <div className="space-y-3">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-xl backdrop-blur-sm"
                style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
              >
                <div className="p-2 rounded-lg text-white" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>{feature.icon}</div>
                <div>
                  <p className="font-semibold text-white text-sm">{feature.title}</p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Progress indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-8 text-center"
          >
            <p className="text-white/80 text-sm">Step {step} of {totalSteps}</p>
            <div className="w-full bg-white/20 rounded-full h-2 mt-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(step / totalSteps) * 100}%` }}
                transition={{ duration: 0.5 }}
                className="bg-white h-2 rounded-full"
              />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default FormContainer;