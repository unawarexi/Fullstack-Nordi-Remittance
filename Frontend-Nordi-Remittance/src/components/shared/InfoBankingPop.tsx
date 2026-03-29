import { useEffect } from "react";
import confirmed from "@assets/confirmed.png";
import error from "@assets/error.png";
import { AnimatePresence, motion } from "framer-motion";
import { fadeInUp } from "@core/animation/Animation";

export const Success: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Close after 3 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        {...fadeInUp}
        className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800  bg-opacity-75 backdrop-blur-lg"
      >
        <div className="w-[80%] items-center justify-center rounded-lg bg-white dark:bg-neutral-800 p-8 text-center lg:w-[30%] ">
          <p className="text-md mb-4 mt-2 font-bold text-blue-700 lg:text-lg">
            NORDEA
          </p>
          <img src={confirmed} alt="error png" className="mx-auto w-[50%]" />
          <p className="text-md mt-4 font-bold text-lime-500 lg:text-4xl">
            Sent Successfully
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export const Error: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Close after 3 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        {...fadeInUp}
        className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-75 backdrop-blur-lg"
      >
        <div className="w-[80%] items-center justify-center rounded-lg bg-white dark:bg-neutral-800 p-8 text-center shadow-lg lg:w-[30%] ">
          <p className="text-md mb-4 mt-2 font-bold text-blue-700 lg:text-lg">
            NORDEA
          </p>
          <img src={confirmed} alt="error png" className=" mx-auto w-[50%]" />
          <p className="text-md mt-4 font-bold text-red-500 lg:text-4xl">
            Error Submitting
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
