import React from "react";
import { useNavigate } from "react-router-dom";
import { DashCard, SectionHeader, ProgressBar } from "@components/shared/DashboardPrimitives";
import { SkeletonBlock } from "@components/skeletons/Skeletons";
import { FiTrendingUp, FiTarget, FiPieChart, FiDollarSign } from "react-icons/fi";
import { formatCurrency } from "@core/algo";

interface ClientInvestmentsPanelProps {
  investmentsData: ClientInvestmentsDetailData;
  isLoading: boolean;
}

const ClientInvestmentsPanel: React.FC<ClientInvestmentsPanelProps> = ({
  investmentsData,
  isLoading,
}) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <DashCard className="flex-1">
        <SkeletonBlock className="h-5 w-44 mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <SkeletonBlock className="h-8 w-full" />
              <SkeletonBlock className="h-3 w-20" />
            </div>
          ))}
        </div>
      </DashCard>
    );
  }

  const investmentMetrics = [
    {
      icon: <FiPieChart size={14} />,
      label: "Portfolio Value",
      value: formatCurrency(investmentsData.totalPortfolioValue),
      color: "text-purple-500",
      bg: "bg-purple-50 dark:bg-purple-950/50",
    },
    {
      icon: <FiTrendingUp size={14} />,
      label: "Active",
      value: investmentsData.activeInvestments.toLocaleString(),
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-950/50",
    },
    {
      icon: <FiDollarSign size={14} />,
      label: "Total Returns",
      value: formatCurrency(investmentsData.totalReturns),
      color: "text-sky-500",
      bg: "bg-sky-50 dark:bg-sky-950/50",
    },
    {
      icon: <FiTarget size={14} />,
      label: "Savings Goals",
      value: investmentsData.savingsGoals.toLocaleString(),
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-950/50",
    },
  ];

  return (
    <DashCard className="flex-1" hover onClick={() => navigate("/customer/investments")}>
      <SectionHeader
        title="My Investments"
        subtitle={`${investmentsData.returnRate >= 0 ? "+" : ""}${investmentsData.returnRate}% avg return`}
        onActionClick={() => navigate("/customer/investments")}
      />

      {/* Metric Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {investmentMetrics.map(({ icon, label, value, color, bg }) => (
          <div key={label} className={`flex items-center gap-2 p-2.5 rounded-xl ${bg}`}>
            <span className={color}>{icon}</span>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{value}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Savings Progress */}
      {investmentsData.savingsGoals > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-gray-600 dark:text-gray-400">Savings Goal Progress</span>
            <span className="text-xs font-semibold text-gray-900 dark:text-white">
              {investmentsData.savingsProgress}%
            </span>
          </div>
          <ProgressBar
            value={investmentsData.savingsProgress}
            color="bg-gradient-to-r from-purple-500 to-violet-500"
            height="sm"
          />
        </div>
      )}

      {/* Top Products */}
      {investmentsData.topProducts.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Top Products
          </p>
          {investmentsData.topProducts.slice(0, 3).map((product, idx) => (
            <div
              key={product.id || idx}
              className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
                  {product.name}
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">{product.type}</p>
              </div>
              <span
                className={`text-xs font-semibold ${
                  product.returnRate >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {product.returnRate >= 0 ? "+" : ""}
                {product.returnRate}%
              </span>
            </div>
          ))}
        </div>
      )}
    </DashCard>
  );
};

export default ClientInvestmentsPanel;
