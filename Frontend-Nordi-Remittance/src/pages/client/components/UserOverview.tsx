import React from "react";
import { motion } from "framer-motion";
import { useAuth } from "@store/index";
import AccountSummaryPanel from "./overview/AccountSummary";
import DashboardMain from "./overview/DashbaordMain";
import DashboardSidebar from "./overview/DashBoardSideBar";

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const UserDashboardOverview: React.FC = () => {
  const { user } = useAuth();
  const displayName = user?.firstName || "there";
  const avatarUrl =
    user?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      (user?.firstName || "U") + " " + (user?.lastName || "")
    )}&background=4f46e5&color=fff&size=96`;

  return (
    <motion.div
      className="flex-1 p-3 sm:p-4 bg-indigo-50/60 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <motion.div
          className="mb-4"
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="flex items-center gap-3">
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-12 h-12 rounded-full border-2 border-indigo-500 object-cover"
            />
            <div>
              <h1 className="text-xl font-bold text-indigo-900">
                {getGreeting()}, {displayName}
              </h1>
              <p className="text-sm text-purple-600">
                Here&apos;s your financial overview
              </p>
            </div>
          </div>
        </motion.div>

        {/* Account Summary Panel */}
        <AccountSummaryPanel />

        {/* Main Dashboard Content */}
        <div className="flex flex-col lg:flex-row gap-4">
          <DashboardMain />
          <DashboardSidebar />
        </div>
      </div>
    </motion.div>
  );
};

export default UserDashboardOverview;