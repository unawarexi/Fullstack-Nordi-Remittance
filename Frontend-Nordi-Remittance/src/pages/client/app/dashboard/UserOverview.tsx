import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { dashboardContainerVariants } from "@core/animation/Animation";
import { PageContainer } from "@components/shared/DashboardPrimitives";
import { FullPageSkeleton } from "@components/skeletons/Skeletons";
import { useClientDashboard } from "../../domain/useClientDashboard";
import { useClientSpending } from "../../domain/useClientSpending";
import AccountSummaryPanel from "./AccountSummary";
import DashboardMain from "./DashbaordMain";
import DashboardSidebar from "./DashBoardSideBar";

const UserDashboardOverview: React.FC = () => {
  const dashboard = useClientDashboard();
  const spending = useClientSpending();

  useEffect(() => {
    document.title = "Dashboard — Nordi Remittance";
  }, []);

  if (dashboard.isAccountLoading) return <FullPageSkeleton />;

  return (
    <PageContainer>
      <motion.div
        className="flex-1"
        variants={dashboardContainerVariants}
        initial="hidden"
        animate="visible"
      >
        <AccountSummaryPanel data={dashboard.account} isLoading={dashboard.isAccountLoading} />

        <div className="flex flex-col lg:flex-row gap-4">
          <DashboardMain
            transactions={dashboard.recentTransactions}
            spending={spending}
            budgets={dashboard.budgets}
            investments={dashboard.investments}
            loans={dashboard.loans}
            isTransactionsLoading={dashboard.isTransactionsLoading}
            isBudgetsLoading={dashboard.isBudgetsLoading}
            isInvestmentsLoading={dashboard.isInvestmentsLoading}
            isLoansLoading={dashboard.isLoansLoading}
          />
          <DashboardSidebar
            cards={dashboard.cards}
            savingsGoals={dashboard.savingsGoals}
            security={dashboard.security}
            notifications={dashboard.notifications}
            unreadCount={dashboard.unreadCount}
            insights={dashboard.insights}
            isCardsLoading={dashboard.isCardsLoading}
            isSavingsLoading={dashboard.isSavingsLoading}
            isSecurityLoading={dashboard.isSecurityLoading}
            isNotificationsLoading={dashboard.isNotificationsLoading}
            isInsightsLoading={dashboard.isInsightsLoading}
          />
        </div>
      </motion.div>
    </PageContainer>
  );
};

export default UserDashboardOverview;
