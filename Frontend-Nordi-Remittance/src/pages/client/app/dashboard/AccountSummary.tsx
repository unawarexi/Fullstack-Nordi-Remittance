import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Wallet, TrendingUp, TrendingDown, CreditCard, ChevronDown, ChevronRight, Eye, EyeOff } from "lucide-react";
import { StatsGridSkeleton, SkeletonBlock } from "@components/skeletons/Skeletons";
import { StatCard, StatsGrid, DashCard, SectionHeader } from "@components/shared/DashboardPrimitives";
import { dashboardItemVariants, cardRevealVariants } from "@core/animation/Animation";
import { formatCurrency as algoFormatCurrency } from "@core/algo";
import { useUIStore } from "@store/ui.store";
import { ACCOUNT_TYPE_MAP } from "../../components/dashboard.constants";

interface Props {
  data: AccountSummaryData;
  isLoading: boolean;
}

const AccountSummaryPanel: React.FC<Props> = ({ data, isLoading }) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const showBalances = useUIStore((s) => s.preferences.showBalances);
  const [localShow, setLocalShow] = useState(true);
  const showBalance = showBalances && localShow;

  const { totalBalance, monthlyIncome, monthlyExpenses, wallets } = data;

  const formatCurrency = (v: number) =>
    showBalance ? `$${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "••••••";

  if (isLoading) return <StatsGridSkeleton count={4} />;

  return (
    <motion.div variants={dashboardItemVariants}>
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

      <DashCard>
        <SectionHeader
          title="My Accounts"
          subtitle="Balances across all wallets"
          action={
            <div className="flex gap-1.5">
              <motion.button
                className="rounded-full bg-gray-100 p-1.5 text-gray-600 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                whileTap={{ scale: 0.95 }}
                onClick={() => setLocalShow(!localShow)}
              >
                {showBalance ? <EyeOff size={16} /> : <Eye size={16} />}
              </motion.button>
              <motion.button
                className="rounded-full bg-gray-100 p-1.5 text-gray-600 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </motion.button>
            </div>
          }
        />

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
            <p className="py-4 text-center text-xs text-gray-500 dark:text-gray-400 sm:text-sm">No accounts found</p>
          ) : (
            wallets.map((wallet, index) => {
              const typeInfo = ACCOUNT_TYPE_MAP[wallet.type] || ACCOUNT_TYPE_MAP.default;
              return (
                <motion.div
                  key={wallet.id || index}
                  className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-100 p-2.5 transition-colors hover:border-gray-300 dark:border-gray-800 dark:hover:border-gray-700"
                  custom={index}
                  variants={cardRevealVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ x: 2 }}
                  onClick={() => navigate("/customer/accounts")}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`rounded-lg p-1.5 ${typeInfo.color}`}>{typeInfo.icon}</div>
                    <div>
                      <h4 className="text-xs font-medium text-gray-900 dark:text-white sm:text-sm">{wallet.name}</h4>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 sm:text-xs">
                        ****{wallet.accountNumber.slice(-4)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white sm:text-sm">
                      {formatCurrency(wallet.balance)}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 sm:text-xs">{wallet.currency}</p>
                  </div>
                </motion.div>
              );
            })
          )}
        </motion.div>

        {!isExpanded && wallets.length > 1 && (
          <motion.button
            className="mt-2 w-full text-center text-[10px] text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 sm:text-xs"
            whileHover={{ scale: 1.01 }}
            onClick={() => setIsExpanded(true)}
          >
            View All {wallets.length} Accounts
          </motion.button>
        )}
      </DashCard>
    </motion.div>
  );
};

export default AccountSummaryPanel;
