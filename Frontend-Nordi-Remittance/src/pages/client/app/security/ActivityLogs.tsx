// ============================================================================
// SECURITY SUB-PAGES — Settings, 2FA, Biometric, Activity, Alerts
// Dark mode + DashboardPrimitives + grey borders + responsive typography
// ============================================================================

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield, Lock, Fingerprint, Eye, EyeOff, Clock,
  Smartphone, AlertTriangle, CheckCircle2, XCircle,
  Key, RefreshCw, MonitorSmartphone, Mail, Bell,
} from "@constants/icons";
import PageHeader from "@components/shared/PageHeader";
import { EmptyState } from "@components/shared/EmptyState";
import {
  PageContainer, DashCard, StatCard, StatsGrid, StatusBadge,
} from "@components/shared/DashboardPrimitives";
import { StatsGridSkeleton, TableSkeleton } from "@components/skeletons";
import { dashboardItemVariants } from "@core/animation/Animation";
import { useClientSecurityActivityLog, useClientLoginHistory } from "../../domain/useSecurityDomain";
import { useToastStore } from "@store/toast.store";


const ActivityLogs: React.FC = () => {
  const { events: logs, isLoading } = useClientSecurityActivityLog();

  const { history: logins } = useClientLoginHistory();
  const allLogs = [...logs, ...logins].sort(
    (a: any, b: any) => new Date(b.timestamp || b.date || 0).getTime() - new Date(a.timestamp || a.date || 0).getTime()
  );

  const logIcon = (type: string) => {
    const t = (type || "").toLowerCase();
    if (t.includes("login")) return <MonitorSmartphone size={14} />;
    if (t.includes("password")) return <Key size={14} />;
    if (t.includes("transfer")) return <RefreshCw size={14} />;
    return <Shield size={14} />;
  };

  return (
    <PageContainer>
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Activity Logs"
          subtitle="Review your account activity and login history"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Security", href: "/customer/security" },
            { label: "Activity" },
          ]}
        />
      </motion.div>

      {isLoading ? (
        <TableSkeleton rows={8} cols={4} />
      ) : allLogs.length === 0 ? (
        <EmptyState title="No Activity Logs" description="Your account activity will appear here." />
      ) : (
        <DashCard padding="none">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">Recent Activity</h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {allLogs.slice(0, 20).map((log: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    {logIcon(log.type || log.action || "")}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                      {log.action || log.type || "Activity"}
                    </h4>
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                      {log.ip || log.location || ""} • {log.device || ""}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                    {(log.timestamp || log.date) ? new Date(log.timestamp || log.date).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "—"}
                  </p>
                  {log.status && <StatusBadge status={log.status} />}
                </div>
              </div>
            ))}
          </div>
        </DashCard>
      )}
    </PageContainer>
  );
};

export default ActivityLogs;
