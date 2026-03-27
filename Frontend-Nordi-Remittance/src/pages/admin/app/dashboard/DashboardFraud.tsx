import React from "react";
import { useNavigate } from "react-router-dom";
import { DashCard, SectionHeader, StatusBadge } from "@components/shared/DashboardPrimitives";
import { SkeletonBlock } from "@components/skeletons/Skeletons";
import { FiShield, FiAlertOctagon, FiEye, FiSlash } from "react-icons/fi";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface DashboardFraudProps {
  fraudData: {
    totalCases: number;
    openCases: number;
    resolvedCases: number;
    blockedTransactions: number;
    highRiskUsers: number;
    riskScore: number;
    recentCases: any[];
  };
  isLoading: boolean;
}

const DashboardFraud: React.FC<DashboardFraudProps> = ({ fraudData, isLoading }) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <DashCard>
        <SkeletonBlock className="h-5 w-44 mb-4" />
        <div className="grid grid-cols-2 gap-3">
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

  const riskLevel = fraudData.riskScore >= 70 ? "critical" : fraudData.riskScore >= 40 ? "warning" : "low";
  const riskColor = riskLevel === "critical" ? "text-rose-500" : riskLevel === "warning" ? "text-amber-500" : "text-emerald-500";
  const riskBg = riskLevel === "critical" ? "bg-rose-50 dark:bg-rose-950/50" : riskLevel === "warning" ? "bg-amber-50 dark:bg-amber-950/50" : "bg-emerald-50 dark:bg-emerald-950/50";

  const fraudMetrics = [
    {
      icon: <FiAlertOctagon size={14} />,
      label: "Open Cases",
      value: fraudData.openCases.toLocaleString(),
      color: "text-rose-500",
      bg: "bg-rose-50 dark:bg-rose-950/50",
    },
    {
      icon: <FiShield size={14} />,
      label: "Resolved",
      value: fraudData.resolvedCases.toLocaleString(),
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-950/50",
    },
    {
      icon: <FiSlash size={14} />,
      label: "Blocked Txns",
      value: fraudData.blockedTransactions.toLocaleString(),
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-950/50",
    },
    {
      icon: <FiEye size={14} />,
      label: "High Risk Users",
      value: fraudData.highRiskUsers.toLocaleString(),
      color: "text-indigo-500",
      bg: "bg-indigo-50 dark:bg-indigo-950/50",
    },
  ];

  return (
    <DashCard hover onClick={() => navigate("/admin/fraud")}>
      <SectionHeader
        title="Fraud & Security"
        subtitle={`${fraudData.totalCases} total cases`}
        onActionClick={() => navigate("/admin/fraud")}
      />

      {/* Risk Score Badge */}
      <div className={`flex items-center justify-between p-3 rounded-xl mb-4 ${riskBg}`}>
        <div className="flex items-center gap-2">
          <FiShield size={16} className={riskColor} />
          <div>
            <p className="text-xs font-medium text-gray-800 dark:text-gray-200">System Risk Score</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">Based on recent activity</p>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-lg font-bold ${riskColor}`}>{fraudData.riskScore}</p>
          <p className={`text-[10px] font-medium capitalize ${riskColor}`}>{riskLevel}</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {fraudMetrics.map(({ icon, label, value, color, bg }) => (
          <div key={label} className={`flex items-center gap-2 p-2.5 rounded-xl ${bg}`}>
            <span className={color}>{icon}</span>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{value}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Cases */}
      {fraudData.recentCases.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Recent Cases</p>
          {fraudData.recentCases.slice(0, 3).map((c: any, idx: number) => (
            <div
              key={c.id || idx}
              className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
                  {c.title || c.description || "Fraud Case"}
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                  {c.type || "Suspicious Activity"} • {c.time || c.createdAt || ""}
                </p>
              </div>
              <StatusBadge status={c.severity || c.status || "pending"} />
            </div>
          ))}
        </div>
      )}
    </DashCard>
  );
};

export default DashboardFraud;
