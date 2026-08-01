import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { dashboardContainerVariants, dashboardItemVariants } from "@core/animation/Animation";
import { PageContainer } from "@components/shared/DashboardPrimitives";
import { FullPageSkeleton } from "@components/skeletons/Skeletons";
import { useClientDashboard } from "../../client-usecase/usedashboard-client-usecase";
import { useClientSpending } from "../../client-usecase/usespending-client-usecase";
import AccountSummaryPanel from "./AccountSummary";
import DashboardMain from "./DashbaordMain";
import DashboardSidebar from "./DashBoardSideBar";
import ClientLoansPanel from "./ClientLoansPanel";
import ClientInvestmentsPanel from "./ClientInvestmentsPanel";
import ClientSecurityPanel from "./ClientSecurityPanel";

const UserDashboardOverview: React.FC = () => {
  const dashboard = useClientDashboard();
  const spending = useClientSpending();

  useEffect(() => {
    document.title = "Dashboard — Nordi Remittance";
  }, []);

  if (dashboard.isAccountLoading) return <FullPageSkeleton />;

  return (
    <PageContainer className="[&>div]:max-w-full">
      <motion.div
        variants={dashboardContainerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="space-y-5"
      >
        {/* KPI Stats Row */}
        <motion.div variants={dashboardItemVariants}>
          <AccountSummaryPanel data={dashboard.account} isLoading={dashboard.isAccountLoading} />
        </motion.div>

        {/* Main Dashboard + Sidebar */}
        <motion.div variants={dashboardItemVariants} className="flex flex-col items-start gap-5 lg:flex-row">
          <DashboardMain
            transactions={dashboard.recentTransactions}
            spending={spending}
            budgets={dashboard.budgets}
            isTransactionsLoading={dashboard.isTransactionsLoading}
            isBudgetsLoading={dashboard.isBudgetsLoading}
            cards={dashboard.cards}
            cardsData={dashboard.cardsDetail}
            isCardsLoading={dashboard.isCardsLoading}
          />
          <DashboardSidebar
            savingsGoals={dashboard.savingsGoals}
            security={dashboard.security}
            notifications={dashboard.notifications}
            unreadCount={dashboard.unreadCount}
            insights={dashboard.insights}
            isSavingsLoading={dashboard.isSavingsLoading}
            isSecurityLoading={dashboard.isSecurityLoading}
            isNotificationsLoading={dashboard.isNotificationsLoading}
            isInsightsLoading={dashboard.isInsightsLoading}
          />
        </motion.div>

        {/* Loans & Investments Row */}
        <motion.div variants={dashboardItemVariants} className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-2">
          <div className="flex">
            <ClientLoansPanel loansData={dashboard.loansDetail} isLoading={dashboard.isLoansLoading} />
          </div>
          <div className="flex">
            <ClientInvestmentsPanel
              investmentsData={dashboard.investmentsDetail}
              isLoading={dashboard.isInvestmentsLoading}
            />
          </div>
        </motion.div>

        {/* Security Row */}
        <motion.div variants={dashboardItemVariants}>
          <ClientSecurityPanel
            security={dashboard.security}
            notifications={dashboard.notifications}
            unreadCount={dashboard.unreadCount}
            isLoading={dashboard.isSecurityLoading}
          />
        </motion.div>
      </motion.div>
    </PageContainer>
  );
};

export default UserDashboardOverview;
