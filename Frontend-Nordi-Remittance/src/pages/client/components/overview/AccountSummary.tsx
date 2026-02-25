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

/* eslint-disable @typescript-eslint/no-explicit-any */

// Animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.3, ease: "easeOut" },
  }),
};

const accountTypeMap: Record<string, { icon: React.ReactNode; color: string }> = {
  savings: { icon: <Wallet size={16} />, color: "bg-indigo-100 text-indigo-600" },
  checking: { icon: <CreditCard size={16} />, color: "bg-purple-100 text-purple-600" },
  business: { icon: <TrendingUp size={16} />, color: "bg-pink-100 text-pink-600" },
  investment: { icon: <TrendingUp size={16} />, color: "bg-amber-100 text-amber-600" },
  default: { icon: <Wallet size={16} />, color: "bg-indigo-100 text-indigo-600" },
};

const AccountSummaryPanel: React.FC = () => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showBalance, setShowBalance] = useState(true);

  const { data: overview, isLoading: overviewLoading } = useDashboardOverview();
  const { data: walletsRes, isLoading: walletsLoading } = useWallets();

  const wallets: any[] = (walletsRes as any) || [];
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

  // Stat cards — clickable
  const statCards = [
    {
      label: "Total Balance",
      value: totalBalance,
      icon: <Wallet size={20} />,
      color: "bg-indigo-100 text-indigo-600",
      route: "/customer/accounts",
      isCurrency: true,
    },
    {
      label: "Monthly Income",
      value: monthlyIncome,
      icon: <TrendingUp size={20} />,
      color: "bg-emerald-100 text-emerald-600",
      route: "/customer/transactions",
      isCurrency: true,
    },
    {
      label: "Monthly Expenses",
      value: monthlyExpenses,
      icon: <TrendingDown size={20} />,
      color: "bg-rose-100 text-rose-600",
      route: "/customer/transactions",
      isCurrency: true,
    },
    {
      label: "Active Accounts",
      value: wallets.length,
      icon: <CreditCard size={20} />,
      color: "bg-purple-100 text-purple-600",
      route: "/customer/accounts",
      isCurrency: false,
    },
  ];

  if (overviewLoading && walletsLoading) {
    return <StatsGridSkeleton count={4} />;
  }

  return (
    <motion.div
      className="mb-4"
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            className="bg-white rounded-xl shadow-sm p-3 cursor-pointer hover:shadow-md transition-shadow"
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(card.route)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg ${card.color}`}>{card.icon}</div>
              <ArrowUpRight size={14} className="text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 mb-0.5">{card.label}</p>
            <p className="text-lg font-bold text-indigo-900">
              {card.isCurrency
                ? formatCurrency(card.value as number)
                : card.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Wallet List */}
      <motion.div
        className="bg-white rounded-xl shadow-sm p-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        <div className="flex justify-between items-center mb-3">
          <div>
            <h2 className="text-base font-semibold text-indigo-900">
              My Accounts
            </h2>
            <p className="text-xs text-purple-500">
              Balances across all wallets
            </p>
          </div>
          <div className="flex gap-1.5">
            <motion.button
              className="p-1.5 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowBalance(!showBalance)}
            >
              {showBalance ? <EyeOff size={16} /> : <Eye size={16} />}
            </motion.button>
            <motion.button
              className="p-1.5 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </motion.button>
          </div>
        </div>

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
                height:
                  isExpanded ? "auto" : wallets.length > 0 ? "72px" : "auto",
              }}
              initial={false}
              transition={{ duration: 0.3 }}
              style={{ overflow: "hidden" }}
            >
              {wallets.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
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
                      className="border border-indigo-100 rounded-lg p-2.5 flex justify-between items-center hover:shadow-sm transition-shadow cursor-pointer"
                      custom={index}
                      variants={cardVariants}
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
                          <h4 className="font-medium text-indigo-900 text-sm">
                            {wallet.name || wallet.accountName || "Account"}
                          </h4>
                          <p className="text-xs text-gray-500">
                            ****
                            {(
                              wallet.accountNumber ||
                              wallet.number ||
                              "0000"
                            ).slice(-4)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-indigo-900 text-sm">
                          {formatCurrency(wallet.balance || 0)}
                        </p>
                        <p className="text-xs text-gray-400">
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
                className="w-full text-center text-xs text-purple-600 mt-2 hover:text-purple-800"
                whileHover={{ scale: 1.01 }}
                onClick={() => setIsExpanded(true)}
              >
                View All {wallets.length} Accounts
              </motion.button>
            )}
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

export default AccountSummaryPanel;