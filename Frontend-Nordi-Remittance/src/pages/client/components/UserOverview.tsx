import React from "react";
import { motion } from "framer-motion";
import AccountSummaryPanel from "./overview/AccountSummary";
import DashboardMain from "./overview/DashbaordMain";
import DashboardSidebar from "./overview/DashBoardSideBar";

const UserDashboardOverview: React.FC = () => {
  return (
    <motion.div 
      className="flex-1 p-6 bg-indigo-50 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-4">
            <img
              src="https://randomuser.me/api/portraits/men/32.jpg"
              alt="User Avatar"
              className="w-32 h-32 rounded-full border-4 border-purple-600 object-cover"
            />
            <div>
              <h1 className="text-2xl font-bold text-indigo-900">Good afternoon, User</h1>
              <p className="text-purple-600">Welcome back to your dashboard</p>
            </div>
          </div>
        </motion.div>
        
        {/* Account Summary Panel */}
        <AccountSummaryPanel />
        
        {/* Main Dashboard Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          <DashboardMain />
          <DashboardSidebar />
        </div>
      </div>
    </motion.div>
  );
};

export default UserDashboardOverview;