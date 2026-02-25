// ============================================================================
// MY ACCOUNTS — Main accounts dashboard
// ============================================================================

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Wallet,
  Plus,
  Eye,
  EyeOff,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  MoreHorizontal,
  CreditCard,
  PiggyBank,
  Building2,
  Briefcase,
  ChevronRight,
  Download,
  RefreshCw,
} from "lucide-react";
import PageHeader from "@components/shared/PageHeader";
import { Card, CardContent, CardHeader } from "@components/ui";
import { EmptyState } from "@components/shared/EmptyState";
import {
  StatsGridSkeleton,
  AccountListSkeleton,
  ChartSkeleton,
} from "@components/skeletons";
import { useWallets, useAccountSummary } from "@hooks/queries/useAccounts";
import { useAuthStore } from "@store/auth.store";
import { useUIStore } from "@store/ui.store";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// Account type icon map
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

  // Hooks
  const { data: walletsData, isLoading: walletsLoading } = useWallets();
  const { data: summaryData, isLoading: summaryLoading } = useAccountSummary();

  const wallets = (walletsData as any)?.data ? (walletsData as any).data : walletsData || [];
  const summary = summaryData?.data;

  const isLoading = walletsLoading || summaryLoading;

  // Filter accounts by type
  const filteredWallets =
    selectedType === "all"
      ? wallets
      : wallets.filter(
          (w: any) =>
            w.type?.toLowerCase() === selectedType ||
            w.accountType?.toLowerCase() === selectedType
        );

  const formatCurrency = (amount: number, currency = "USD") =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(amount);

  const accountTypes = ["all", "savings", "current", "business", "investment"];

  return (
    <motion.div
      className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <PageHeader
          title="My Accounts"
          subtitle="Manage all your bank accounts in one place"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "My Accounts" },
          ]}
          actions={
            <div className="flex gap-3">
              <motion.button
                onClick={() => toggleShowBalances()}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {showBalances ? <EyeOff size={16} /> : <Eye size={16} />}
                {showBalances ? "Hide" : "Show"} Balances
              </motion.button>
              <motion.button
                onClick={() => navigate("/customer/accounts/statements")}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-sm text-sm font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus size={16} />
                New Account
              </motion.button>
            </div>
          }
        />
      </motion.div>

      {/* Stats Summary */}
      {isLoading ? (
        <StatsGridSkeleton count={4} />
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
          variants={itemVariants}
        >
          {[
            {
              label: "Total Balance",
              value: formatCurrency(summary?.totalBalance || 0),
              icon: <Wallet size={20} />,
              color: "from-indigo-500 to-purple-500",
              change: "+2.5%",
              positive: true,
            },
            {
              label: "Income (30d)",
              value: formatCurrency(summary?.totalIncome || 0),
              icon: <ArrowDownLeft size={20} />,
              color: "from-emerald-500 to-teal-500",
              change: "+12.3%",
              positive: true,
            },
            {
              label: "Expenses (30d)",
              value: formatCurrency(summary?.totalExpenses || 0),
              icon: <ArrowUpRight size={20} />,
              color: "from-rose-500 to-pink-500",
              change: "-5.1%",
              positive: false,
            },
            {
              label: "Active Accounts",
              value: String(wallets.length || 0),
              icon: <CreditCard size={20} />,
              color: "from-amber-500 to-orange-500",
              change: "",
              positive: true,
            },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow"
              whileHover={{ y: -2 }}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.color} text-white`}
                >
                  {stat.icon}
                </div>
                {stat.change && (
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      stat.positive
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-rose-50 text-rose-600"
                    }`}
                  >
                    {stat.change}
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold text-indigo-900">
                {showBalances ? stat.value : "••••••"}
              </p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Filter Tabs */}
      <motion.div
        className="flex gap-2 mb-6 overflow-x-auto pb-2"
        variants={itemVariants}
      >
        {accountTypes.map((type) => (
          <motion.button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              selectedType === type
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                : "bg-white text-gray-600 hover:bg-indigo-50 shadow-sm"
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </motion.button>
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
          action={{
            label: "Open Account",
            onClick: () => navigate("/customer/accounts/savings"),
          }}
        />
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
          variants={containerVariants}
        >
          {filteredWallets.map((wallet: any, index: number) => {
            const type =
              wallet.type?.toLowerCase() ||
              wallet.accountType?.toLowerCase() ||
              "savings";
            return (
              <motion.div
                key={wallet._id || wallet.id || index}
                className="bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden hover:shadow-md transition-all cursor-pointer"
                variants={itemVariants}
                whileHover={{ y: -4 }}
                onClick={() =>
                  navigate(`/customer/accounts/${type}`)
                }
              >
                {/* Card Header Gradient */}
                <div
                  className={`h-2 bg-gradient-to-r ${
                    accountTypeColors[type] || "from-indigo-500 to-purple-600"
                  }`}
                />
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2.5 rounded-xl bg-gradient-to-br ${
                          accountTypeColors[type] ||
                          "from-indigo-500 to-purple-600"
                        } text-white`}
                      >
                        {accountTypeIcons[type] || <Wallet size={20} />}
                      </div>
                      <div>
                        <h3 className="font-semibold text-indigo-900">
                          {wallet.name ||
                            wallet.accountName ||
                            `${type.charAt(0).toUpperCase() + type.slice(1)} Account`}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {wallet.accountNumber
                            ? `•••• ${wallet.accountNumber.slice(-4)}`
                            : wallet.currency || "USD"}
                        </p>
                      </div>
                    </div>
                    <button className="p-1.5 rounded-lg hover:bg-gray-100">
                      <MoreHorizontal size={16} className="text-gray-400" />
                    </button>
                  </div>

                  {/* Balance */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Available Balance</p>
                    <p className="text-2xl font-bold text-indigo-900">
                      {showBalances
                        ? formatCurrency(
                            wallet.balance || wallet.availableBalance || 0,
                            wallet.currency || "USD"
                          )
                        : "••••••"}
                    </p>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2">
                    <motion.button
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-indigo-50 text-indigo-600 text-sm font-medium hover:bg-indigo-100"
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/customer/send/domestic");
                      }}
                    >
                      <ArrowUpRight size={14} />
                      Send
                    </motion.button>
                    <motion.button
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-purple-50 text-purple-600 text-sm font-medium hover:bg-purple-100"
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/customer/accounts/statements");
                      }}
                    >
                      <Download size={14} />
                      Statement
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Quick Links */}
      <motion.div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4" variants={itemVariants}>
        {[
          {
            label: "Savings Account",
            icon: <PiggyBank size={20} />,
            route: "/customer/accounts/savings",
            color: "text-emerald-600 bg-emerald-50",
          },
          {
            label: "Current Account",
            icon: <Building2 size={20} />,
            route: "/customer/accounts/current",
            color: "text-indigo-600 bg-indigo-50",
          },
          {
            label: "Fixed Deposits",
            icon: <Briefcase size={20} />,
            route: "/customer/accounts/fixed-deposits",
            color: "text-amber-600 bg-amber-50",
          },
          {
            label: "Statements",
            icon: <Download size={20} />,
            route: "/customer/accounts/statements",
            color: "text-purple-600 bg-purple-50",
          },
        ].map((link) => (
          <motion.button
            key={link.label}
            onClick={() => navigate(link.route)}
            className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow text-left"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className={`p-2 rounded-lg ${link.color}`}>{link.icon}</div>
            <div>
              <p className="text-sm font-medium text-indigo-900">
                {link.label}
              </p>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                View <ChevronRight size={12} />
              </p>
            </div>
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default MyAccounts;
