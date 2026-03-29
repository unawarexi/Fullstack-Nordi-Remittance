// ============================================================================
// ACCOUNTS SUB-PAGES — Savings, Current, Fixed Deposits, Statements
// Dark mode + DashboardPrimitives + grey borders + responsive typography
// ============================================================================

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  PiggyBank, Building2, Lock, Download, FileText,
  TrendingUp, Percent, Shield, Plus,
} from "@constants/icons";
import PageHeader from "@components/shared/PageHeader";
import { EmptyState } from "@components/shared/EmptyState";
import {
  PageContainer, DashCard, StatCard, StatsGrid, SectionHeader, StatusBadge,
} from "@components/shared/DashboardPrimitives";
import { StatsGridSkeleton, FormSkeleton } from "@components/skeletons";
import { dashboardItemVariants } from "@core/animation/Animation";
import { useWallets } from "@hooks/queries/useAccounts";
import { useUIStore } from "@store/ui.store";

const safeArray = (d: unknown): any[] => Array.isArray(d) ? d : Array.isArray((d as any)?.data) ? (d as any).data : [];

const fmt = (n: number, c = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: c, minimumFractionDigits: 2 }).format(n);


const SavingsAccount: React.FC = () => {
  const navigate = useNavigate();
  const show = useUIStore((s) => s.preferences.showBalances);
  const { data: walletsData, isLoading } = useWallets();
  const allWallets = safeArray(walletsData);
  const wallets = allWallets.filter(
    (w: any) => (w.type || w.accountType || "").toLowerCase() === "savings"
  );

  return (
    <PageContainer>
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Savings Account"
          subtitle="Grow your savings with competitive interest rates"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Accounts", href: "/customer/accounts" },
            { label: "Savings" },
          ]}
        />
      </motion.div>

      {isLoading ? (
        <StatsGridSkeleton count={3} />
      ) : (
        <StatsGrid cols={3}>
          <StatCard label="Savings Balance" value={show ? fmt(wallets.reduce((a: number, w: any) => a + (w.balance || 0), 0)) : "••••••"} icon={<PiggyBank size={20} />} iconColor="from-emerald-500 to-teal-500" />
          <StatCard label="Interest Earned" value={show ? fmt(wallets.reduce((a: number, w: any) => a + (w.interestEarned || 0), 0)) : "••••••"} icon={<Percent size={20} />} iconColor="from-indigo-500 to-purple-500" />
          <StatCard label="Accounts" value={String(wallets.length)} icon={<PiggyBank size={20} />} iconColor="from-amber-500 to-orange-500" />
        </StatsGrid>
      )}

      {wallets.length === 0 && !isLoading ? (
        <EmptyState
          title="No Savings Accounts"
          description="Open a savings account to start earning interest on your deposits."
          action={{ label: "Open Savings Account", onClick: () => navigate("/customer/accounts") }}
        />
      ) : (
        <DashCard padding="none" className="mt-6">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">Savings Accounts</h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {wallets.map((w: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                    <PiggyBank size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{w.name || "Savings Account"}</h4>
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                      {w.accountNumber ? `•••• ${w.accountNumber.slice(-4)}` : w.currency || "USD"}
                    </p>
                  </div>
                </div>
                <p className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white">
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

export default SavingsAccount;
