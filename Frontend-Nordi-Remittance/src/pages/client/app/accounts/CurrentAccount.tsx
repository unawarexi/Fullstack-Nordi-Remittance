// ============================================================================
// ACCOUNTS SUB-PAGES — Savings, Current, Fixed Deposits, Statements
// Dark mode + DashboardPrimitives + grey borders + responsive typography
// ============================================================================

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { PiggyBank, Building2, Lock, Download, FileText, TrendingUp, Percent, Shield, Plus } from "@constants/icons";
import PageHeader from "@components/shared/PageHeader";
import { EmptyState } from "@components/shared/EmptyState";
import {
  PageContainer,
  DashCard,
  StatCard,
  StatsGrid,
  SectionHeader,
  StatusBadge,
} from "@components/shared/DashboardPrimitives";
import { StatsGridSkeleton, FormSkeleton } from "@components/skeletons";
import { dashboardItemVariants } from "@core/animation/Animation";
import { useClientWallets } from "../../client-usecase/useaccounts-client-usecase";
import { useUIStore } from "@store/ui.store";

const fmt = (n: number, c = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: c, minimumFractionDigits: 2 }).format(n);

const CurrentAccount: React.FC = () => {
  const navigate = useNavigate();
  const show = useUIStore((s) => s.preferences.showBalances);
  const { wallets: allWallets, isLoading } = useClientWallets();
  const wallets = allWallets.filter((w: any) =>
    ["current", "checking"].includes((w.type || w.accountType || "").toLowerCase()),
  );

  return (
    <PageContainer>
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Current Account"
          subtitle="Manage your everyday banking transactions"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Accounts", href: "/customer/accounts" },
            { label: "Current" },
          ]}
        />
      </motion.div>

      {isLoading ? (
        <StatsGridSkeleton count={3} />
      ) : (
        <StatsGrid cols={3}>
          <StatCard
            label="Current Balance"
            value={show ? fmt(wallets.reduce((a: number, w: any) => a + (w.balance || 0), 0)) : "••••••"}
            icon={<Building2 size={20} />}
            iconColor="from-indigo-500 to-purple-500"
          />
          <StatCard
            label="Monthly Turnover"
            value={show ? fmt(wallets.reduce((a: number, w: any) => a + (w.monthlyTurnover || 0), 0)) : "••••••"}
            icon={<TrendingUp size={20} />}
            iconColor="from-blue-500 to-cyan-500"
          />
          <StatCard
            label="Accounts"
            value={String(wallets.length)}
            icon={<Building2 size={20} />}
            iconColor="from-amber-500 to-orange-500"
          />
        </StatsGrid>
      )}

      {wallets.length === 0 && !isLoading ? (
        <EmptyState
          title="No Current Accounts"
          description="Open a current account for your daily transactions."
          action={{ label: "Open Current Account", onClick: () => navigate("/customer/accounts") }}
        />
      ) : (
        <DashCard padding="none" className="mt-6">
          <div className="border-b border-gray-200 p-4 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white sm:text-base">Current Accounts</h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {wallets.map((w: any, i: number) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                    <Building2 size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-gray-900 dark:text-white sm:text-sm">
                      {w.name || "Current Account"}
                    </h4>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 sm:text-xs">
                      {w.accountNumber ? `•••• ${w.accountNumber.slice(-4)}` : w.currency || "USD"}
                    </p>
                  </div>
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-white sm:text-lg">
                  {show ? fmt(w.balance || 0) : "••••••"}
                </p>
              </div>
            ))}
          </div>
        </DashCard>
      )}
    </PageContainer>
  );
};

export default CurrentAccount;
