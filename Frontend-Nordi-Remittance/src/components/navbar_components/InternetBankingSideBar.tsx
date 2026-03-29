// ============================================================================
// INTERNET BANKING SIDEBAR - Sliding sidebar for quick banking access
// ============================================================================

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { Globe, User, Building, ArrowRight, X } from "lucide-react";
import { cn } from "@utils/cn";
import { useNavbar } from "@contexts/navbar-context";
import Images from '@constants/images';

// ========================
// ANIMATION VARIANTS
// ========================
const sidebarVariants = {
  hidden: { x: "100%", opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
  exit: {
    x: "100%",
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

// ========================
// COMPONENT
// ========================
const InternetBankingSideBar: React.FC = () => {
  const { isSidebarOpen, closeSidebar } = useNavbar();
  const navigate = useNavigate();
  const location = useLocation();

  // Close sidebar automatically on route change (e.g., when reaching auth/login)
  React.useEffect(() => {
    if (isSidebarOpen) {
      closeSidebar();
    }
  }, [location.pathname, closeSidebar]);

  // Do not show the sidebar on authentication routes
  if (location.pathname.startsWith("/auth")) {
    return null;
  }

  // Handle navigation with sidebar close
  const handleNavigate = (path: string) => {
    closeSidebar();
    navigate(path);
  };

  return (
    <AnimatePresence>
      {isSidebarOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99] bg-black/40 backdrop-blur-sm"
            onClick={closeSidebar}
          />

          {/* Sidebar */}
          <motion.div
            key="sidebar"
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              "fixed right-0 top-0 z-[100] h-screen",
              "w-[85%] sm:w-[350px] md:w-[380px] lg:w-[400px]",
              "bg-slate-50 shadow-2xl",
              "flex flex-col",
            )}
          >
            {/* Header */}
            <div className="border-b border-neutral-100 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-blue-100 p-2">
                    <Globe className="h-5 w-5 text-blue-600 sm:h-6 sm:w-6" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-neutral-800 sm:text-lg">
                      Internet Banking
                    </p>
                    <p className="text-xs text-neutral-500">Quick Access</p>
                  </div>
                </div>
                <button
                  onClick={closeSidebar}
                  className="rounded-lg p-2 transition-colors hover:bg-neutral-100"
                >
                  <X className="h-5 w-5 text-neutral-500" />
                </button>
              </div>
            </div>

            {/* Options */}
            <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
              {/* Individual/Business Login */}
              <button
                onClick={() => handleNavigate("/auth/login")}
                className={cn(
                  "block w-full rounded-xl p-4 text-left",
                  "bg-gradient-to-r from-lime-500 to-lime-600",
                  "hover:from-lime-600 hover:to-lime-700",
                  "transform transition-all duration-300 hover:scale-[1.02]",
                  "shadow-lg hover:shadow-xl",
                )}
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
                    <User className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white sm:text-base">
                      Individual or Business
                    </p>
                    <p className="text-xs text-white/70">
                      Sign in to your account
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-white/70" />
                </div>
              </button>

              {/* Open Account */}
              <button
                onClick={() => handleNavigate("/auth/signup")}
                className={cn(
                  "block w-full rounded-xl p-4 text-left",
                  "bg-gradient-to-r from-indigo-500 to-indigo-600",
                  "hover:from-indigo-600 hover:to-indigo-700",
                  "transform transition-all duration-300 hover:scale-[1.02]",
                  "shadow-lg hover:shadow-xl",
                )}
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
                    <Building className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white sm:text-base">
                      Open Nordea IBanking
                    </p>
                    <p className="text-xs text-white/70">
                      Create a new account
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-white/70" />
                </div>
              </button>

              {/* Divider */}
              <div className="my-4 h-px bg-neutral-200" />

              {/* Promo Images */}
              <div className="space-y-4">
                <motion.img
                  whileHover={{ scale: 1.02 }}
                  src={Images.sideBar2}
                  alt="Banking promotion"
                  className="w-full rounded-xl object-cover shadow-md"
                />
                <motion.img
                  whileHover={{ scale: 1.02 }}
                  src={Images.sideBar3}
                  alt="Banking services"
                  className="w-full rounded-xl object-cover shadow-md"
                />
              </div>
            </div>

            {/* Footer */}
            <div
              className={cn(
                "p-4 sm:p-5",
                "bg-gradient-to-r from-indigo-600 to-indigo-700",
                "text-center",
              )}
            >
              <p className="text-sm font-semibold text-white sm:text-base">
                More than banking
              </p>
              <p className="mt-1 text-xs text-white/70">
                Experience the Nordea difference
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default InternetBankingSideBar;
