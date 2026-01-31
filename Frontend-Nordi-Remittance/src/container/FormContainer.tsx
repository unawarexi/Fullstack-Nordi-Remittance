/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { ReactNode, useState, useEffect } from "react";
import bg from "@assets/bg.jpg";
import bg1 from "@assets/bg1.jpg";
import { Link, useLocation } from "react-router-dom";
import Images from "@utils/constants/Image_strings";

interface FormContainerProps {
  children: ReactNode;
  step: number;
  totalSteps: number;
}

const FormContainer: React.FC<FormContainerProps> = ({ children, step, totalSteps = 7 }) => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [bgImage, setBgImage] = useState(window.innerWidth >= 1024 ? bg1 : bg);
  const location = useLocation();
  const isAdminRoute = location.pathname.includes("admin");

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setBgImage(window.innerWidth >= 1024 ? bg1 : bg);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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

  return (
    <div className="relative h-screen w-full">
      {/* Adjust image position for admin route */}
      {isAdminRoute ? (
        <img
          src={Images.debitcard}
          alt="banking background"
          className="absolute right-0 top-1/2 -translate-y-1/2 h-full w-[50%] object-contain"
          style={{ pointerEvents: "none" }}
        />
      ) : (
        <img
          src={bgImage}
          alt="banking background"
          className="h-full w-full object-cover"
        />
      )}

      <div
        className={`absolute left-0 top-0 flex h-full w-full flex-col items-start justify-center rounded-br-md rounded-tr-md ${
          isAdminRoute ? "bg-slate-200 bg-opacity-50" : "bg-slate-200 bg-opacity-50"
        } p-4 lg:w-[70%] lg:p-8`}
      >
        <div className="mb-8 grid grid-flow-row items-center justify-center text-slate-900 md:mx-auto md:text-center">
          <h1 className="mt-10 text-2xl font-bold md:mt-2 md:text-4xl">
           {isAdminRoute ? "Create and Authorize Account" : " Banking Account Registration"}
          </h1>
          <p className="mt-4 text-sm md:p-4 md:text-2xl lg:text-lg">
            Please complete all required information carefully to ensure your account is set up correctly.
          </p>
          
          {/* LOGIN PROMPT */}
        {!isAdminRoute && (  <div className="mt-2 flex justify-center">
            <span className="text-sm">
              Already have an account?{" "}
              <Link
                to="/auth/login"
                className="text-blue-600 hover:underline font-semibold"
              >
                Login
              </Link>
            </span>
          </div>)}
        </div>

        {/* Progress indicator for 7 steps */}
        <div className="mx-auto mb-8 flex w-full items-center justify-center gap-x-2 rounded-lg bg-slate-50 p-2 text-center text-[8px] text-blue-500 shadow-lg md:w-[90%] md:gap-x-4 md:text-xs lg:text-sm overflow-x-auto">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((index) => (
            <div
              key={index}
              className={`flex space-x-1 justify-center items-center ${
                index === step
                  ? "rounded-full bg-blue-600 px-3 py-2 font-bold text-slate-50 transition-all duration-200 ease-in-out"
                  : "px-2 py-1"
              }`}
            >
              <span>{index}</span>
              <span className="mt-1">{getStepTitle(index)}</span>
            </div>
          ))}
        </div>

        <div className="mx-auto w-full max-h-[70vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default FormContainer;