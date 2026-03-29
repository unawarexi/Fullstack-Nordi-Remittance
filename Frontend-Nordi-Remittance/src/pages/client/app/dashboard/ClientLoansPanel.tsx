import React from "react";
import { useNavigate } from "react-router-dom";
import { DashCard, SectionHeader, StatusBadge, ProgressBar } from "@components/shared/DashboardPrimitives";
import { SkeletonBlock } from "@components/skeletons/Skeletons";
import { FiDollarSign, FiClock, FiAlertTriangle, FiCheckCircle } from "react-icons/fi";
import { formatCurrency } from "@core/algo";

interface ClientLoansPanelProps {
  loansData: ClientLoansDetailData;
  isLoading: boolean;
}

const ClientLoansPanel: React.FC<ClientLoansPanelProps> = ({ loansData, isLoading }) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <DashCard className="flex-1">
        <SkeletonBlock className="h-5 w-40 mb-4" />
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

  const loanMetrics = [
    {
      icon: <FiDollarSign size={14} />,
      label: "Total Borrowed",
      value: formatCurrency(loansData.totalDisbursed),
      color: "text-indigo-500",
      bg: "bg-indigo-50 dark:bg-indigo-950/50",
    },
    {
      icon: <FiCheckCircle size={14} />,
      label: "Active Loans",
      value: loansData.activeLoans.toLocaleString(),
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-950/50",
    },
    {
      icon: <FiClock size={14} />,
      label: "Pending",
      value: loansData.pendingApplications.toLocaleString(),
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-950/50",
    },
    {
      icon: <FiAlertTriangle size={14} />,
      label: "Overdue",
      value: loansData.overdueLoans.toLocaleString(),
      color: "text-rose-500",
      bg: "bg-rose-50 dark:bg-rose-950/50",
    },
  ];

  return (
    <DashCard className="flex-1" hover onClick={() => navigate("/customer/loans")}>
      <SectionHeader
        title="My Loans"
        subtitle={`${loansData.totalLoans} total loan${loansData.totalLoans !== 1 ? "s" : ""}`}
        onActionClick={() => navigate("/customer/loans")}
      />

      {/* Metric Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {loanMetrics.map(({ icon, label, value, color, bg }) => (
          <div key={label} className={`flex items-center gap-2 p-2.5 rounded-xl ${bg}`}>
            <span className={color}>{icon}</span>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{value}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Repayment Rate */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-gray-600 dark:text-gray-400">Repayment Progress</span>
          <span className="text-xs font-semibold text-gray-900 dark:text-white">{loansData.repaymentRate}%</span>
        </div>
        <ProgressBar
          value={loansData.repaymentRate}
          color={
            loansData.repaymentRate >= 80
              ? "bg-gradient-to-r from-emerald-500 to-teal-500"
              : "bg-gradient-to-r from-amber-500 to-orange-500"
          }
          height="sm"
        />
      </div>

      {/* Recent Loans */}
      {loansData.recentLoans.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Recent Loans
          </p>
          {loansData.recentLoans.slice(0, 3).map((loan, idx) => (
            <div
              key={loan.id || idx}
              className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
                  {loan.type}
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                  {formatCurrency(loan.amount)}
                </p>
              </div>
              <StatusBadge status={loan.status} />
            </div>
          ))}
        </div>
      )}
    </DashCard>
  );
};

export default ClientLoansPanel;
