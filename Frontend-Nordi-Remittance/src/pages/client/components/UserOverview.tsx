import React from "react";
import { motion } from "framer-motion";
import { dashboardContainerVariants } from "@core/animation/Animation";
import AccountSummaryPanel from "./overview/AccountSummary";
import DashboardMain from "./overview/DashbaordMain";
import DashboardSidebar from "./overview/DashBoardSideBar";

const UserDashboardOverview: React.FC = () => {
  return (
    <motion.div
      className="flex-1 p-3 sm:p-4 lg:p-6 bg-gray-50 dark:bg-gray-950 overflow-y-auto transition-colors duration-200"
      variants={dashboardContainerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-7xl mx-auto">
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