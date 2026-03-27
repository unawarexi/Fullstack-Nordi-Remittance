import React from "react";
import { useNavigate } from "react-router-dom";
import { DashCard, SectionHeader, StatusBadge, ProgressBar } from "@components/shared/DashboardPrimitives";
import { SkeletonBlock } from "@components/skeletons/Skeletons";
import { FiDollarSign, FiClock, FiAlertTriangle, FiCheckCircle } from "react-icons/fi";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface DashboardLoansProps {
  loansData: {
    totalLoans: number;
    activeLoans: number;
    totalDisbursed: number;
    totalRepaid: number;
    overdueLoans: number;
    pendingApplications: number;
    repaymentRate: number;
    recentLoans: any[];
  };
  isLoading: boolean;
}

const formatAmount = (v: number) => {
  if (v >= 1_000_000) return `€${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `€${(v / 1_000).toFixed(1)}K`;
  return `€${v.toLocaleString()}`;
};

const DashboardLoans: React.FC<DashboardLoansProps> = ({ loansData, isLoading }) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <DashCard>
        <SkeletonBlock className="h-5 w-40 mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <SkeletonBlock className="h-8 w-full" />
              <SkeletonBlock className="h-3 w-20" />
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-10 w-full" />
          ))}
        </div>
      </DashCard>
    );
  }

  const loanMetrics = [
    {
      icon: <FiDollarSign size={14} />,
      label: "Total Disbursed",
      value: formatAmount(loansData.totalDisbursed),
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
      label: "Pending Apps",
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
    <DashCard hover onClick={() => navigate("/admin/loans")}>
      <SectionHeader
        title="Loans Overview"
        subtitle={`${loansData.totalLoans} total loans`}
        onActionClick={() => navigate("/admin/loans")}
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
          <span className="text-xs text-gray-600 dark:text-gray-400">Repayment Rate</span>
          <span className="text-xs font-semibold text-gray-900 dark:text-white">{loansData.repaymentRate}%</span>
        </div>
        <ProgressBar
          value={loansData.repaymentRate}
          color={loansData.repaymentRate >= 80 ? "bg-gradient-to-r from-emerald-500 to-teal-500" : "bg-gradient-to-r from-amber-500 to-orange-500"}
          height="sm"
        />
      </div>

      {/* Recent Loans */}
      {loansData.recentLoans.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Recent Applications</p>
          {loansData.recentLoans.slice(0, 3).map((loan: any) => (
            <div
              key={loan.id}
              className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
                  {loan.user || loan.borrowerName || "Applicant"}
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                  {loan.type || "Personal"} • {formatAmount(loan.amount || 0)}
                </p>
              </div>
              <StatusBadge status={loan.status || "pending"} />
            </div>
          ))}
        </div>
      )}
    </DashCard>
  );
};

export default DashboardLoans;
