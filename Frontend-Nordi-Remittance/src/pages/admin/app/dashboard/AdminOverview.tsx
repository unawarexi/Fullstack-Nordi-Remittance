import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { PageContainer } from "@components/shared/DashboardPrimitives";
import { dashboardContainerVariants, dashboardItemVariants } from "@core/animation/Animation";
import { FullPageSkeleton } from "@components/skeletons/Skeletons";
import { useAdminDashboard } from "../../admin-usecase/useadmin-dashboard-usecase";
import DashboardStats from "./DashboardStats";
import DashboardMain from "./DashboardMain";
import DashboardSidebar from "./DashboardSidebar";
import DashboardLoans from "./DashboardLoans";
import DashboardInvestments from "./DashboardInvestments";
import DashboardCards from "./DashboardCards";
import DashboardFraud from "./DashboardFraud";
import TransferSection from "./TransferSection";

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
    loansData,
    investmentsData,
    cardsData,
    fraudData,
    transferStats,
    isLoading,
    isChartsLoading,
    isAlertsLoading,
    isLoansLoading,
    isInvestmentsLoading,
    isCardsLoading,
    isFraudLoading,
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

        {/* Main Charts + Sidebar */}
        <motion.div variants={dashboardItemVariants} className="flex flex-col gap-6 lg:flex-row">
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

        {/* Loans & Investments Row */}
        <motion.div variants={dashboardItemVariants} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <DashboardLoans loansData={loansData} isLoading={isLoansLoading} />
          <DashboardInvestments investmentsData={investmentsData} isLoading={isInvestmentsLoading} />
        </motion.div>

        {/* Cards & Fraud Row */}
        <motion.div variants={dashboardItemVariants} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <DashboardCards cardsData={cardsData} isLoading={isCardsLoading} />
          <DashboardFraud fraudData={fraudData} isLoading={isFraudLoading} />
        </motion.div>

        {/* Transfer History — Full-width section: table ~80% + sidebar ~20% */}
        <TransferSection transferStats={transferStats} />
      </motion.div>
    </PageContainer>
  );
};

export default NordeaBankingAdmin;
