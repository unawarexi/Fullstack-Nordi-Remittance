// ============================================================================
// INTERNET BANKING SIDEBAR - Sliding sidebar for quick banking access
// ============================================================================

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Globe, User, Building, ArrowRight, X } from "lucide-react";
import { cn } from "@utils/cn";
import { useNavbar } from "@contexts/navbar-context";
import Images from "@utils/constants/Image_strings";

// ========================
// ANIMATION VARIANTS
// ========================
const sidebarVariants = {
  hidden: { x: "100%", opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 30 }
  },
  exit: { 
    x: "100%", 
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

// ========================
// COMPONENT
// ========================
const InternetBankingSideBar: React.FC = () => {
  const { closeSidebar, handleSidebarMouseLeave } = useNavbar();

  return (
    <>
      {/* Backdrop Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[99] bg-black/40 backdrop-blur-sm"
        onClick={closeSidebar}
      />
      
      {/* Sidebar */}
      <motion.div
        variants={sidebarVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onMouseLeave={handleSidebarMouseLeave}
        className={cn(
          "fixed right-0 top-0 z-[100] h-screen",
          "w-[85%] sm:w-[350px] md:w-[380px] lg:w-[400px]",
          "bg-slate-50 shadow-2xl",
          "flex flex-col"
        )}
      >
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-neutral-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-blue-100">
              <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-base sm:text-lg font-semibold text-neutral-800">
                Internet Banking
              </p>
              <p className="text-xs text-neutral-500">Quick Access</p>
            </div>
          </div>
          <button
            onClick={closeSidebar}
            className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>
      </div>

      {/* Options */}
      <div className="flex-1 p-4 sm:p-6 space-y-4 overflow-y-auto">
        {/* Individual/Business Login */}
        <Link 
          to="/auth/login" 
          className={cn(
            "block p-4 rounded-xl",
            "bg-gradient-to-r from-lime-500 to-lime-600",
            "hover:from-lime-600 hover:to-lime-700",
            "transition-all duration-300 transform hover:scale-[1.02]",
            "shadow-lg hover:shadow-xl"
          )}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
              <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm sm:text-base font-semibold text-white">
                Individual or Business
              </p>
              <p className="text-xs text-white/70">Sign in to your account</p>
            </div>
            <ArrowRight className="w-5 h-5 text-white/70" />
          </div>
        </Link>

        {/* Open Account */}
        <Link 
          to="/auth/signup" 
          className={cn(
            "block p-4 rounded-xl",
            "bg-gradient-to-r from-indigo-500 to-indigo-600",
            "hover:from-indigo-600 hover:to-indigo-700",
            "transition-all duration-300 transform hover:scale-[1.02]",
            "shadow-lg hover:shadow-xl"
          )}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
              <Building className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm sm:text-base font-semibold text-white">
                Open Nordea IBanking
              </p>
              <p className="text-xs text-white/70">Create a new account</p>
            </div>
            <ArrowRight className="w-5 h-5 text-white/70" />
          </div>
        </Link>

        {/* Divider */}
        <div className="h-px bg-neutral-200 my-4" />

        {/* Promo Images */}
        <div className="space-y-4">
          <motion.img
            whileHover={{ scale: 1.02 }}
            src={Images.sideBar2}
            alt="Banking promotion"
            className="w-full rounded-xl shadow-md object-cover"
          />
          <motion.img
            whileHover={{ scale: 1.02 }}
            src={Images.sideBar3}
            alt="Banking services"
            className="w-full rounded-xl shadow-md object-cover"
          />
        </div>
      </div>

      {/* Footer */}
      <div className={cn(
        "p-4 sm:p-5",
        "bg-gradient-to-r from-indigo-600 to-indigo-700",
        "text-center"
      )}>
        <p className="text-sm sm:text-base font-semibold text-white">
          More than banking
        </p>
        <p className="text-xs text-white/70 mt-1">
          Experience the Nordea difference
        </p>
      </div>
      </motion.div>
    </>
  );
};

export default InternetBankingSideBar;
