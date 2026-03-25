import React from "react";
import { useNavigate } from "react-router-dom";
import { DashCard, SectionHeader, StatusBadge, QuickLinkCard, QuickLinksGrid } from "@components/shared/DashboardPrimitives";
import { SkeletonBlock } from "@components/skeletons/Skeletons";
import { useInView } from "@hooks/useInView";
import { FiAlertTriangle, FiClock, FiUsers, FiActivity, FiGlobe, FiCheckCircle,
  FiShield, FiDollarSign, FiFileText, FiPieChart, FiSettings, FiBarChart2 } from "react-icons/fi";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface Alert {
  id: string;
  title: string;
  severity: string;
  time: string;
}

interface PendingApproval {
  id: string;
  user: string;
  type: string;
  time: string;
}

interface QuickStats {
  activeUsers: number;
  successRate: number;
  avgResponseTime: string;
  countriesActive: number;
}

interface DashboardSidebarProps {
  alerts: Alert[];
  pendingApprovals: PendingApproval[];
  quickStats: QuickStats;
  isAlertsLoading: boolean;
}

// ========================
// SEVERITY HELPERS
// ========================
const severityIcon = (severity: string) => {
  switch (severity) {
    case "critical": return <FiAlertTriangle className="text-red-500" />;
    case "warning": return <FiAlertTriangle className="text-yellow-500" />;
    default: return <FiActivity className="text-blue-500" />;
  }
};

// ========================
// SYSTEM ALERTS
// ========================
const SystemAlerts: React.FC<{ alerts: Alert[] }> = ({ alerts }) => {
  const navigate = useNavigate();

  return (
    <DashCard hover onClick={() => navigate("/admin/fraud/alerts")}>
      <SectionHeader title="System Alerts" subtitle={`${alerts.length} active`} />
      <div className="space-y-3 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
        {alerts.length === 0 ? (
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-6">No alerts</p>
        ) : (
          alerts.slice(0, 5).map((alert) => (
            <div key={alert.id} className="flex items-start gap-2.5 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
              <div className="mt-0.5 shrink-0">{severityIcon(alert.severity)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">{alert.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={alert.severity === "critical" ? "failed" : alert.severity === "warning" ? "pending" : "processing"} />
                  <span className="text-[10px] text-gray-400">{alert.time}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </DashCard>
  );
};

// ========================
// PENDING APPROVALS
// ========================
const PendingApprovals: React.FC<{ approvals: PendingApproval[] }> = ({ approvals }) => {
  const navigate = useNavigate();

  return (
    <DashCard hover onClick={() => navigate("/admin/transactions/pending")}>
      <SectionHeader title="Pending Approvals" subtitle={`${approvals.length} awaiting review`} />
      <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
        {approvals.length === 0 ? (
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-6">All clear</p>
        ) : (
          approvals.slice(0, 5).map((item) => (
            <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
              <div className="flex items-center gap-2">
                <FiClock className="text-amber-500 shrink-0" size={14} />
                <div>
                  <p className="text-xs font-medium text-gray-800 dark:text-gray-200">{item.user}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">{item.type} • {item.time}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </DashCard>
  );
};

// ========================
// QUICK STATS
// ========================
const QuickStatsPanel: React.FC<{ stats: QuickStats }> = ({ stats }) => (
  <DashCard>
    <SectionHeader title="Quick Stats" />
    <div className="grid grid-cols-2 gap-3">
      {[
        { icon: <FiUsers size={16} />, label: "Active Users", value: stats.activeUsers?.toLocaleString() ?? "—", color: "text-indigo-500" },
        { icon: <FiCheckCircle size={16} />, label: "Success Rate", value: stats.successRate ? `${stats.successRate}%` : "—", color: "text-emerald-500" },
        { icon: <FiClock size={16} />, label: "Avg Response", value: stats.avgResponseTime ?? "—", color: "text-amber-500" },
        { icon: <FiGlobe size={16} />, label: "Countries", value: stats.countriesActive?.toString() ?? "—", color: "text-sky-500" },
      ].map(({ icon, label, value, color }) => (
        <div key={label} className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
          <div className={`mb-1 ${color}`}>{icon}</div>
          <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{value}</span>
          <span className="text-[10px] text-gray-500 dark:text-gray-400">{label}</span>
        </div>
      ))}
    </div>
  </DashCard>
);

// ========================
// QUICK LINKS
// ========================
const AdminQuickLinks: React.FC = () => {
  const navigate = useNavigate();

  const links = [
    { icon: FiShield, label: "Security", route: "/admin/security", iconColor: "text-red-500" },
    { icon: FiDollarSign, label: "Transactions", route: "/admin/transactions/all", iconColor: "text-emerald-500" },
    { icon: FiFileText, label: "Reports", route: "/admin/reports", iconColor: "text-blue-500" },
    { icon: FiPieChart, label: "Analytics", route: "/admin/reports/analytics", iconColor: "text-purple-500" },
    { icon: FiSettings, label: "Settings", route: "/admin/settings", iconColor: "text-gray-500" },
    { icon: FiBarChart2, label: "Statistics", route: "/admin/statistics", iconColor: "text-amber-500" },
  ];

  return (
    <DashCard>
      <SectionHeader title="Quick Links" />
      <QuickLinksGrid>
        {links.map(({ icon: Icon, label, route, iconColor }) => (
          <QuickLinkCard key={label} icon={<Icon size={18} />} label={label} route={route} iconColor={iconColor} />
        ))}
      </QuickLinksGrid>
    </DashCard>
  );
};

// ========================
// ALERT SKELETON
// ========================
const AlertsSkeleton: React.FC = () => (
  <DashCard>
    <SkeletonBlock className="h-5 w-32 mb-4" />
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-start gap-2.5 p-2">
          <SkeletonBlock className="h-4 w-4 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <SkeletonBlock className="h-3 w-full" />
            <SkeletonBlock className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  </DashCard>
);

// ========================
// SIDEBAR
// ========================
const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  alerts,
  pendingApprovals,
  quickStats,
  isAlertsLoading,
}) => {
  const [lowerRef, lowerInView] = useInView();

  return (
    <div className="w-full lg:w-80 xl:w-96 space-y-4 shrink-0">
      {/* Alerts + Approvals — always rendered (top of sidebar) */}
      {isAlertsLoading ? (
        <>
          <AlertsSkeleton />
          <AlertsSkeleton />
        </>
      ) : (
        <>
          <SystemAlerts alerts={alerts} />
          <PendingApprovals approvals={pendingApprovals} />
        </>
      )}

      {/* Quick Stats + Quick Links — lazy */}
      <div ref={lowerRef}>
        {lowerInView ? (
          <>
            <QuickStatsPanel stats={quickStats} />
            <div className="mt-4">
              <AdminQuickLinks />
            </div>
          </>
        ) : (
          <>
            <AlertsSkeleton />
            <AlertsSkeleton />
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardSidebar;
