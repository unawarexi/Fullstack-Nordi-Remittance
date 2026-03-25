import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { PageContainer } from "@components/shared/DashboardPrimitives";
import { dashboardContainerVariants, dashboardItemVariants } from "@core/animation/Animation";
import { FullPageSkeleton } from "@components/skeletons/Skeletons";
import { useAdminDashboard } from "./use-case/useAdminDashboard";
import DashboardStats from "./DashboardStats";
import DashboardMain from "./DashboardMain";
import DashboardSidebar from "./DashboardSidebar";

const NordeaBankingAdmin: React.FC = () => {
  useEffect(() => {
    document.title = "Nordea Banking Admin";
  }, []);

  const {
    stats,
    revenueData,
    accountDistribution,
    activityData,
    weeklyTransactions,
    alerts,
    pendingApprovals,
    isLoading,
    isChartsLoading,
    isAlertsLoading,
  } = useAdminDashboard();

  if (isLoading && isChartsLoading && isAlertsLoading) {
    return <FullPageSkeleton />;
  }

  const quickStats = {
    activeUsers: stats.activeUsers,
    successRate: stats.successRate,
    avgResponseTime: stats.avgResponseTime ? `${stats.avgResponseTime}s` : "—",
    countriesActive: stats.countriesActive,
  };

  return (
    <PageContainer className="[&>div]:max-w-full">
      <motion.div
        variants={dashboardContainerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="space-y-6"
      >
        {/* KPI Stats */}
        <motion.div variants={dashboardItemVariants}>
          <DashboardStats stats={stats} isLoading={isLoading} />
        </motion.div>

        {/* Main + Sidebar */}
        <motion.div variants={dashboardItemVariants} className="flex flex-col lg:flex-row gap-6">
          <DashboardMain
            revenueData={revenueData}
            weeklyTransactions={weeklyTransactions}
            accountDistribution={accountDistribution}
            activityData={activityData}
            isChartsLoading={isChartsLoading}
          />
          <DashboardSidebar
            alerts={alerts}
            pendingApprovals={pendingApprovals}
            quickStats={quickStats}
            isAlertsLoading={isAlertsLoading}
          />
        </motion.div>
      </motion.div>
    </PageContainer>
  );
};

export default NordeaBankingAdmin;