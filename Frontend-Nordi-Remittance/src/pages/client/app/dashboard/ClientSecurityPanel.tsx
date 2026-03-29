import React from "react";
import { useNavigate } from "react-router-dom";
import { DashCard, SectionHeader } from "@components/shared/DashboardPrimitives";
import { SkeletonBlock } from "@components/skeletons/Skeletons";
import {
  FiShield,
  FiCheckCircle,
  FiAlertTriangle,
  FiLock,
  FiUnlock,
  FiUpload,
  FiChevronRight,
} from "react-icons/fi";

interface ClientSecurityPanelProps {
  security: SecurityStatus;
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
}

const ClientSecurityPanel: React.FC<ClientSecurityPanelProps> = ({
  security,
  notifications,
  unreadCount,
  isLoading,
}) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <DashCard>
        <SkeletonBlock className="h-5 w-44 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-12 w-full" />
          ))}
        </div>
      </DashCard>
    );
  }

  const overallScore = [security.kycVerified, security.twoFaEnabled].filter(Boolean).length;
  const maxScore = 2;
  const scorePercent = Math.round((overallScore / maxScore) * 100);
  const scoreLevel = scorePercent === 100 ? "excellent" : scorePercent >= 50 ? "good" : "needs attention";
  const scoreColor =
    scorePercent === 100 ? "text-emerald-500" : scorePercent >= 50 ? "text-amber-500" : "text-rose-500";
  const scoreBg =
    scorePercent === 100
      ? "bg-emerald-50 dark:bg-emerald-950/50"
      : scorePercent >= 50
        ? "bg-amber-50 dark:bg-amber-950/50"
        : "bg-rose-50 dark:bg-rose-950/50";

  const securityItems = [
    {
      label: "KYC Verification",
      ok: security.kycVerified,
      text: security.kycVerified ? "Verified" : "Pending",
      icon: security.kycVerified ? <FiCheckCircle size={14} /> : <FiAlertTriangle size={14} />,
      color: security.kycVerified ? "text-emerald-500" : "text-amber-500",
      bg: security.kycVerified
        ? "bg-emerald-50 dark:bg-emerald-950/50"
        : "bg-amber-50 dark:bg-amber-950/50",
    },
    {
      label: "Two-Factor Auth",
      ok: security.twoFaEnabled,
      text: security.twoFaEnabled ? "Enabled" : "Disabled",
      icon: security.twoFaEnabled ? <FiLock size={14} /> : <FiUnlock size={14} />,
      color: security.twoFaEnabled ? "text-emerald-500" : "text-rose-500",
      bg: security.twoFaEnabled
        ? "bg-emerald-50 dark:bg-emerald-950/50"
        : "bg-rose-50 dark:bg-rose-950/50",
    },
  ];

  return (
    <DashCard hover onClick={() => navigate("/customer/profile/documents")}>
      <SectionHeader
        title="Security & Alerts"
        subtitle={`${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`}
        onActionClick={() => navigate("/customer/profile/documents")}
      />

      {/* Security Score Badge */}
      <div className={`flex items-center justify-between p-3 rounded-xl mb-4 ${scoreBg}`}>
        <div className="flex items-center gap-2">
          <FiShield size={16} className={scoreColor} />
          <div>
            <p className="text-xs font-medium text-gray-800 dark:text-gray-200">Security Score</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">Based on your account setup</p>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-lg font-bold ${scoreColor}`}>{scorePercent}</p>
          <p className={`text-[10px] font-medium capitalize ${scoreColor}`}>{scoreLevel}</p>
        </div>
      </div>

      {/* Security Items */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {securityItems.map(({ label, text, icon, color, bg }) => (
          <div key={label} className={`flex items-center gap-2 p-2.5 rounded-xl ${bg}`}>
            <span className={color}>{icon}</span>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{text}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Documents CTA */}
      {!security.kycVerified && (
        <div
          className="flex items-center justify-between p-2.5 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg cursor-pointer mb-4"
          onClick={(e) => {
            e.stopPropagation();
            navigate("/customer/profile/documents");
          }}
        >
          <div className="flex items-center gap-2">
            <FiUpload size={14} className="text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-medium text-indigo-800 dark:text-indigo-300">
              Upload Documents
            </span>
          </div>
          <FiChevronRight size={14} className="text-indigo-600 dark:text-indigo-400" />
        </div>
      )}

      {/* Recent Notifications */}
      {notifications.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Recent Alerts
          </p>
          {notifications.slice(0, 3).map((n, idx) => (
            <div
              key={n.id || idx}
              className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
                  {n.title}
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">{n.date}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashCard>
  );
};

export default ClientSecurityPanel;
