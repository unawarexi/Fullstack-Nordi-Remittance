// ============================================================================
// MY ACCOUNTS — Main accounts dashboard (Dark mode + Shared Primitives)
// ============================================================================

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Wallet,
  Plus,
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownLeft,
  MoreHorizontal,
  CreditCard,
  PiggyBank,
  Building2,
  Briefcase,
  TrendingUp,
  Download,
  ChevronRight,
} from "lucide-react";
import PageHeader from "@components/shared/PageHeader";
import { EmptyState } from "@components/shared/EmptyState";
import {
  StatsGridSkeleton,
  AccountListSkeleton,
} from "@components/skeletons";
import { useWallets, useAccountSummary } from "@hooks/queries/useAccounts";
import { useAuthStore } from "@store/auth.store";
import { useUIStore } from "@store/ui.store";
import {
  PageContainer,
  StatCard,
  StatsGrid,
  DashCard,
  FilterPill,
  ActionButton,
  QuickLinkCard,
  QuickLinksGrid,
} from "@components/shared/DashboardPrimitives";
import { dashboardItemVariants, cardRevealVariants } from "@core/animation/Animation";

/* eslint-disable @typescript-eslint/no-explicit-any */

const accountTypeIcons: Record<string, React.ReactNode> = {
  savings: <PiggyBank size={20} />,
  current: <Building2 size={20} />,
  checking: <Building2 size={20} />,
  business: <Briefcase size={20} />,
  investment: <TrendingUp size={20} />,
  credit: <CreditCard size={20} />,
};

const accountTypeColors: Record<string, string> = {
  savings: "from-emerald-500 to-teal-600",
  current: "from-indigo-500 to-purple-600",
  checking: "from-indigo-500 to-purple-600",
  business: "from-amber-500 to-orange-600",
  investment: "from-violet-500 to-purple-600",
  credit: "from-rose-500 to-pink-600",
};

const MyAccounts: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const showBalances = useUIStore((s) => s.preferences.showBalances);
  const toggleShowBalances = useUIStore((s) => s.toggleShowBalances);
  const [selectedType, setSelectedType] = useState<string>("all");

  const { data: walletsData, isLoading: walletsLoading } = useWallets();
  const { data: summaryData, isLoading: summaryLoading } = useAccountSummary();

  const wallets = (walletsData as any)?.data ? (walletsData as any).data : walletsData || [];
  const summary = summaryData?.data;
  const isLoading = walletsLoading || summaryLoading;

  const filteredWallets =
    selectedType === "all"
      ? wallets
      : wallets.filter((w: any) => w.type?.toLowerCase() === selectedType || w.accountType?.toLowerCase() === selectedType);

  const formatCurrency = (amount: number, currency = "USD") =>
    new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 2 }).format(amount);

  const accountTypes = ["all", "savings", "current", "business", "investment"];

  return (
    <PageContainer>
      {/* Header */}
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="My Accounts"
          subtitle="Manage all your bank accounts in one place"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "My Accounts" },
          ]}
          actions={
            <div className="flex gap-2 sm:gap-3">
              <ActionButton
                label={showBalances ? "Hide" : "Show"}
                icon={showBalances ? <EyeOff size={16} /> : <Eye size={16} />}
                variant="secondary"
                onClick={() => toggleShowBalances()}
              />
              <ActionButton
                label="New Account"
                icon={<Plus size={16} />}
                onClick={() => navigate("/customer/accounts/statements")}
              />
            </div>
          }
        />
      </motion.div>

      {/* Stats */}
      {isLoading ? (
        <StatsGridSkeleton count={4} />
      ) : (
        <StatsGrid cols={4}>
          <StatCard label="Total Balance" value={showBalances ? formatCurrency(summary?.totalBalance || 0) : "••••••"} icon={<Wallet size={20} />} iconColor="from-indigo-500 to-purple-500" change="+2.5%" positive index={0} />
          <StatCard label="Income (30d)" value={showBalances ? formatCurrency(summary?.totalIncome || 0) : "••••••"} icon={<ArrowDownLeft size={20} />} iconColor="from-emerald-500 to-teal-500" change="+12.3%" positive index={1} />
          <StatCard label="Expenses (30d)" value={showBalances ? formatCurrency(summary?.totalExpenses || 0) : "••••••"} icon={<ArrowUpRight size={20} />} iconColor="from-rose-500 to-pink-500" change="-5.1%" positive={false} index={2} />
          <StatCard label="Active Accounts" value={wallets.length || 0} icon={<CreditCard size={20} />} iconColor="from-amber-500 to-orange-500" index={3} />
        </StatsGrid>
      )}

      {/* Filter Tabs */}
      <motion.div className="flex gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2 scrollbar-hide" variants={dashboardItemVariants}>
        {accountTypes.map((type) => (
          <FilterPill
            key={type}
            label={type.charAt(0).toUpperCase() + type.slice(1)}
            active={selectedType === type}
            onClick={() => setSelectedType(type)}
          />
        ))}
      </motion.div>

      {/* Account Cards */}
      {isLoading ? (
        <AccountListSkeleton count={3} />
      ) : filteredWallets.length === 0 ? (
        <EmptyState
          title="No Accounts Found"
          description={
            selectedType === "all"
              ? "You don't have any accounts yet. Open your first account to get started."
              : `No ${selectedType} accounts found.`
          }
          action={{ label: "Open Account", onClick: () => navigate("/customer/accounts/savings") }}
        />
      ) : (
        <motion.div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {filteredWallets.map((wallet: any, index: number) => {
            const type = wallet.type?.toLowerCase() || wallet.accountType?.toLowerCase() || "savings";
            return (
              <motion.div
                key={wallet._id || wallet.id || index}
                custom={index}
                variants={cardRevealVariants}
                initial="hidden"
                animate="visible"
              >
                <DashCard
                  className="overflow-hidden hover:border-indigo-300 dark:hover:border-indigo-700 cursor-pointer transition-all"
                  padding="none"
                  hover
                >
                  {/* Card Header Gradient */}
                  <div className={`h-1.5 bg-gradient-to-r ${accountTypeColors[type] || "from-indigo-500 to-purple-600"}`} />
                  <div className="p-4 sm:p-5" onClick={() => navigate(`/customer/accounts/${type}`)}>
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <div className={`p-2 sm:p-2.5 rounded-xl bg-gradient-to-br ${accountTypeColors[type] || "from-indigo-500 to-purple-600"} text-white`}>
                          {accountTypeIcons[type] || <Wallet size={20} />}
                        </div>
                        <div>
                          <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                            {wallet.name || wallet.accountName || `${type.charAt(0).toUpperCase() + type.slice(1)} Account`}
                          </h3>
                          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                            {wallet.accountNumber ? `•••• ${wallet.accountNumber.slice(-4)}` : wallet.currency || "USD"}
                          </p>
                        </div>
                      </div>
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <MoreHorizontal size={16} className="text-gray-400 dark:text-gray-500" />
                      </button>
                    </div>

                    {/* Balance */}
                    <div className="mb-3 sm:mb-4">
                      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Available Balance</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                        {showBalances ? formatCurrency(wallet.balance || wallet.availableBalance || 0, wallet.currency || "USD") : "••••••"}
                      </p>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2">
                      <motion.button
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 sm:py-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm font-medium hover:bg-indigo-100 dark:hover:bg-indigo-950/80 transition-colors"
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => { e.stopPropagation(); navigate("/customer/send/domestic"); }}
                      >
                        <ArrowUpRight size={14} />
                        Send
                      </motion.button>
                      <motion.button
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 sm:py-2 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 text-xs sm:text-sm font-medium hover:bg-purple-100 dark:hover:bg-purple-950/80 transition-colors"
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => { e.stopPropagation(); navigate("/customer/accounts/statements"); }}
                      >
                        <Download size={14} />
                        Statement
                      </motion.button>
                    </div>
                  </div>
                </DashCard>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Quick Links */}
      <QuickLinksGrid>
        <QuickLinkCard label="Savings Account" icon={<PiggyBank size={20} />} route="/customer/accounts/savings" iconColor="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50" />
        <QuickLinkCard label="Current Account" icon={<Building2 size={20} />} route="/customer/accounts/current" iconColor="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50" />
        <QuickLinkCard label="Fixed Deposits" icon={<Briefcase size={20} />} route="/customer/accounts/fixed-deposits" iconColor="text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50" />
        <QuickLinkCard label="Statements" icon={<Download size={20} />} route="/customer/accounts/statements" iconColor="text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50" />
      </QuickLinksGrid>
    </PageContainer>
  );
};

export default MyAccounts;
