import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  CreditCard,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  ArrowUpRight,
} from "lucide-react";
import { useDashboardOverview, useWallets } from "@hooks/queries";
import {
  StatsGridSkeleton,
  SkeletonBlock,
} from "@components/skeletons/Skeletons";
import {
  StatCard,
  StatsGrid,
  DashCard,
  SectionHeader,
} from "@components/shared/DashboardPrimitives";
import { dashboardItemVariants, cardRevealVariants } from "@core/animation/Animation";

/* eslint-disable @typescript-eslint/no-explicit-any */

const accountTypeMap: Record<string, { icon: React.ReactNode; color: string }> = {
  savings: { icon: <Wallet size={16} />, color: "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400" },
  checking: { icon: <CreditCard size={16} />, color: "bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400" },
  business: { icon: <TrendingUp size={16} />, color: "bg-pink-50 dark:bg-pink-950/50 text-pink-600 dark:text-pink-400" },
  investment: { icon: <TrendingUp size={16} />, color: "bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400" },
  default: { icon: <Wallet size={16} />, color: "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400" },
};

const AccountSummaryPanel: React.FC = () => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showBalance, setShowBalance] = useState(true);

  const { data: overview, isLoading: overviewLoading } = useDashboardOverview();
  const { data: walletsRes, isLoading: walletsLoading } = useWallets();

  const wallets: any[] = Array.isArray(walletsRes)
    ? walletsRes
    : Array.isArray((walletsRes as any)?.data)
      ? (walletsRes as any).data
      : [];
  const stats: any = (overview as any) || {};

  const totalBalance =
    stats?.totalBalance ??
    wallets.reduce((s: number, w: any) => s + (w.balance || 0), 0);
  const monthlyIncome = stats?.monthlyIncome ?? 0;
  const monthlyExpenses = stats?.monthlyExpenses ?? 0;

  const formatCurrency = (v: number) =>
    showBalance
      ? `$${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : "••••••";

  if (overviewLoading && walletsLoading) {
    return <StatsGridSkeleton count={4} />;
  }

  return (
    <motion.div className="mb-4" variants={dashboardItemVariants}>
      {/* Stats Cards */}
      <StatsGrid cols={4}>
        <StatCard
          label="Total Balance"
          value={formatCurrency(totalBalance)}
          icon={<Wallet size={20} />}
          iconColor="from-indigo-500 to-purple-500"
          index={0}
          onClick={() => navigate("/customer/accounts")}
        />
        <StatCard
          label="Monthly Income"
          value={formatCurrency(monthlyIncome)}
          icon={<TrendingUp size={20} />}
          iconColor="from-emerald-500 to-teal-500"
          index={1}
          onClick={() => navigate("/customer/transactions")}
        />
        <StatCard
          label="Monthly Expenses"
          value={formatCurrency(monthlyExpenses)}
          icon={<TrendingDown size={20} />}
          iconColor="from-rose-500 to-pink-500"
          index={2}
          onClick={() => navigate("/customer/transactions")}
        />
        <StatCard
          label="Active Accounts"
          value={wallets.length}
          icon={<CreditCard size={20} />}
          iconColor="from-purple-500 to-violet-500"
          index={3}
          onClick={() => navigate("/customer/accounts")}
        />
      </StatsGrid>

      {/* Wallet List */}
      <DashCard>
        <SectionHeader
          title="My Accounts"
          subtitle="Balances across all wallets"
          action={
            <div className="flex gap-1.5">
              <motion.button
                className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowBalance(!showBalance)}
              >
                {showBalance ? <EyeOff size={16} /> : <Eye size={16} />}
              </motion.button>
              <motion.button
                className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </motion.button>
            </div>
          }
        />

        {walletsLoading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <SkeletonBlock key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : (
          <>
            <motion.div
              className="space-y-2"
              animate={{
                height: isExpanded ? "auto" : wallets.length > 0 ? "72px" : "auto",
              }}
              initial={false}
              transition={{ duration: 0.3 }}
              style={{ overflow: "hidden" }}
            >
              {wallets.length === 0 ? (
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  No accounts found
                </p>
              ) : (
                wallets.map((wallet: any, index: number) => {
                  const typeInfo =
                    accountTypeMap[
                      (wallet.type || wallet.accountType || "default").toLowerCase()
                    ] || accountTypeMap.default;

                  return (
                    <motion.div
                      key={wallet._id || wallet.id || index}
                      className="border border-gray-100 dark:border-gray-800 rounded-lg p-2.5 flex justify-between items-center hover:border-gray-300 dark:hover:border-gray-700 transition-colors cursor-pointer"
                      custom={index}
                      variants={cardRevealVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover={{ x: 2 }}
                      onClick={() => navigate("/customer/accounts")}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`p-1.5 rounded-lg ${typeInfo.color}`}>
                          {typeInfo.icon}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm">
                            {wallet.name || wallet.accountName || "Account"}
                          </h4>
                          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                            ****{(wallet.accountNumber || wallet.number || "0000").slice(-4)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm">
                          {formatCurrency(wallet.balance || 0)}
                        </p>
                        <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500">
                          {wallet.currency || "USD"}
                        </p>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </motion.div>

            {!isExpanded && wallets.length > 1 && (
              <motion.button
                className="w-full text-center text-[10px] sm:text-xs text-indigo-600 dark:text-indigo-400 mt-2 hover:text-indigo-800 dark:hover:text-indigo-300"
                whileHover={{ scale: 1.01 }}
                onClick={() => setIsExpanded(true)}
              >
                View All {wallets.length} Accounts
              </motion.button>
            )}
          </>
        )}
      </DashCard>
    </motion.div>
  );
};

export default AccountSummaryPanel;