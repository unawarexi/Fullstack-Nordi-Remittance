import React from "react";
import { useNavigate } from "react-router-dom";
import { DashCard, SectionHeader } from "@components/shared/DashboardPrimitives";
import { FiTrendingUp, FiArrowUpRight, FiArrowDownRight, FiClock, FiRefreshCw } from "react-icons/fi";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface TransferSidebarProps {
  stats: {
    todayVolume: number;
    todayCount: number;
    avgTransferSize: number;
    successRate: number;
    pendingCount: number;
    failedCount: number;
  };
}

const formatAmount = (v: number) => {
  if (v >= 1_000_000) return `€${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `€${(v / 1_000).toFixed(1)}K`;
  return `€${v.toLocaleString()}`;
};

const TransferSidebar: React.FC<TransferSidebarProps> = ({ stats }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      {/* Today's Summary */}
      <DashCard>
        <SectionHeader title="Today's Summary" />
        <div className="space-y-3">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50">
            <div className="flex items-center gap-2">
              <FiTrendingUp size={14} className="text-indigo-500" />
              <span className="text-xs text-gray-600 dark:text-gray-400">Volume</span>
            </div>
            <span className="text-sm font-bold text-gray-900 dark:text-white">{formatAmount(stats.todayVolume)}</span>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50">
            <div className="flex items-center gap-2">
              <FiArrowUpRight size={14} className="text-emerald-500" />
              <span className="text-xs text-gray-600 dark:text-gray-400">Transfers</span>
            </div>
            <span className="text-sm font-bold text-gray-900 dark:text-white">{stats.todayCount}</span>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/50">
            <div className="flex items-center gap-2">
              <FiArrowDownRight size={14} className="text-purple-500" />
              <span className="text-xs text-gray-600 dark:text-gray-400">Avg Size</span>
            </div>
            <span className="text-sm font-bold text-gray-900 dark:text-white">{formatAmount(stats.avgTransferSize)}</span>
          </div>
        </div>
      </DashCard>

      {/* Transfer Health */}
      <DashCard>
        <SectionHeader title="Transfer Health" />
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600 dark:text-gray-400">Success Rate</span>
            <span className="text-xs font-bold text-gray-900 dark:text-white">{stats.successRate}%</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${stats.successRate >= 95 ? "bg-emerald-500" : stats.successRate >= 80 ? "bg-amber-500" : "bg-rose-500"}`}
              style={{ width: `${Math.min(stats.successRate, 100)}%` }}
            />
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="flex items-center gap-1.5 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/50">
              <FiClock size={12} className="text-amber-500" />
              <div>
                <p className="text-xs font-bold text-gray-900 dark:text-white">{stats.pendingCount}</p>
                <p className="text-[9px] text-gray-500 dark:text-gray-400">Pending</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 p-2 rounded-lg bg-rose-50 dark:bg-rose-950/50">
              <FiRefreshCw size={12} className="text-rose-500" />
              <div>
                <p className="text-xs font-bold text-gray-900 dark:text-white">{stats.failedCount}</p>
                <p className="text-[9px] text-gray-500 dark:text-gray-400">Failed</p>
              </div>
            </div>
          </div>
        </div>
      </DashCard>

      {/* Quick Actions */}
      <DashCard>
        <SectionHeader title="Quick Actions" />
        <div className="space-y-2">
          {[
            { label: "View All Transactions", route: "/admin/transactions/all", color: "text-indigo-500" },
            { label: "Pending Approvals", route: "/admin/transactions/pending", color: "text-amber-500" },
            { label: "Failed Transactions", route: "/admin/transactions/failed", color: "text-rose-500" },
          ].map(({ label, route, color }) => (
            <button
              key={label}
              onClick={() => navigate(route)}
              className="w-full flex items-center justify-between p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors text-left"
            >
              <span className={`text-xs font-medium ${color}`}>{label}</span>
              <FiArrowUpRight size={12} className="text-gray-400" />
            </button>
          ))}
        </div>
      </DashCard>
    </div>
  );
};

export default TransferSidebar;
