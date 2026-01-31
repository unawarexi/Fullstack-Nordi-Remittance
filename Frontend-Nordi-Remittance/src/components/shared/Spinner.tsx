import React from "react";
import { Bars, Rings } from "react-loader-spinner";
import { AnimatePresence, motion } from "framer-motion";
import { smoothPopIn } from "@core/animation/Animation";

export const ConfirmSpinner: React.FC<{ visible: boolean }> = ({ visible }) => {
  if (!visible) return null;
  return (
    <AnimatePresence>
      <motion.div
        {...smoothPopIn}
        className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-75 backdrop-blur-lg"
      >
        <div className="container mx-auto flex flex-col items-center justify-center">
          <Bars
            visible={true}
            height={192}
            width={192}
            color="#6366F1"
            ariaLabel="bars-loading"
            wrapperStyle={{}}
            wrapperClass=""
          />
          <div className="mt-8 w-full text-center lg:w-2/3">
            <p className="title-font text-md mb-4 flex justify-center font-medium text-white  lg:text-4xl">
              Verifying ID...
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export const SubmitSpinner: React.FC<{ visible: boolean }> = ({ visible }) => {
  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        {...smoothPopIn}
        className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-75 backdrop-blur-lg"
      >
        <div className="container mx-auto flex flex-col items-center justify-center">
          <Rings
            visible={true}
            height={192}
            width={192}
            color="#6366F1"
            ariaLabel="rings-loading"
            wrapperStyle={{}}
            wrapperClass=""
          />
          <div className="mt-8 w-full text-center lg:w-2/3">
            <p className="title-font text-md mb-4 flex justify-center font-medium text-white  lg:text-4xl">
              Submitting Remittance! Loading...
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
