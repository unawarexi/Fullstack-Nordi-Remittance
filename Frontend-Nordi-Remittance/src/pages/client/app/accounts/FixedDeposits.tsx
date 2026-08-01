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

const FixedDeposits: React.FC = () => {
  const navigate = useNavigate();
  const show = useUIStore((s) => s.preferences.showBalances);
  const { wallets: allWallets, isLoading } = useClientWallets();
  const deposits = allWallets.filter((w: any) => (w.type || w.accountType || "").toLowerCase().includes("fixed"));

  return (
    <PageContainer>
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Fixed Deposits"
          subtitle="Earn higher interest with term deposits"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Accounts", href: "/customer/accounts" },
            { label: "Fixed Deposits" },
          ]}
          actions={
            <motion.button
              onClick={() => navigate("/customer/accounts")}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-3 py-2 text-xs font-medium text-white sm:px-4 sm:text-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus size={16} /> New Deposit
            </motion.button>
          }
        />
      </motion.div>

      {isLoading ? (
        <StatsGridSkeleton count={3} />
      ) : (
        <StatsGrid cols={3}>
          <StatCard
            label="Total Deposits"
            value={show ? fmt(deposits.reduce((a: number, w: any) => a + (w.balance || w.amount || 0), 0)) : "••••••"}
            icon={<Lock size={20} />}
            iconColor="from-indigo-500 to-purple-500"
          />
          <StatCard
            label="Interest Rate"
            value="5.25% p.a."
            icon={<Percent size={20} />}
            iconColor="from-emerald-500 to-teal-500"
          />
          <StatCard
            label="Active Deposits"
            value={String(deposits.length)}
            icon={<Shield size={20} />}
            iconColor="from-amber-500 to-orange-500"
          />
        </StatsGrid>
      )}

      {deposits.length === 0 && !isLoading ? (
        <EmptyState
          title="No Fixed Deposits"
          description="Lock in a great rate with a fixed deposit. Choose your term and earn guaranteed returns."
          action={{ label: "Create Fixed Deposit", onClick: () => navigate("/customer/accounts") }}
        />
      ) : (
        <DashCard padding="none" className="mt-6">
          <div className="border-b border-gray-200 p-4 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white sm:text-base">Your Fixed Deposits</h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {deposits.map((d: any, i: number) => (
              <div key={i} className="p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="text-xs font-medium text-gray-900 dark:text-white sm:text-sm">
                    {d.name || `Fixed Deposit #${i + 1}`}
                  </h4>
                  <StatusBadge status="active" />
                </div>
                <div className="flex gap-4 sm:gap-6">
                  <div>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 sm:text-xs">Amount</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {show ? fmt(d.balance || d.amount || 0) : "••••••"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 sm:text-xs">Rate</p>
                    <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      {d.interestRate || "5.25"}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 sm:text-xs">Maturity</p>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{d.maturityDate || "—"}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DashCard>
      )}
    </PageContainer>
  );
};

export default FixedDeposits;
