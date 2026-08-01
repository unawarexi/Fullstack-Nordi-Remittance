// ============================================================================
// SECURITY SUB-PAGES — Settings, 2FA, Biometric, Activity, Alerts
// Dark mode + DashboardPrimitives + grey borders + responsive typography
// ============================================================================

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Lock,
  Fingerprint,
  Eye,
  EyeOff,
  Clock,
  Smartphone,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Key,
  RefreshCw,
  MonitorSmartphone,
  Mail,
  Bell,
} from "@constants/icons";
import PageHeader from "@components/shared/PageHeader";
import { EmptyState } from "@components/shared/EmptyState";
import { PageContainer, DashCard, StatCard, StatsGrid, StatusBadge } from "@components/shared/DashboardPrimitives";
import { StatsGridSkeleton, TableSkeleton } from "@components/skeletons";
import { dashboardItemVariants } from "@core/animation/Animation";
import { useClientSecuritySettings } from "../../client-usecase/usesecurity-client-usecase";
import { useToastStore } from "@store/toast.store";

const SecurityAlertsList: React.FC = () => {
  const alerts = [
    {
      id: 1,
      title: "New login detected",
      desc: "Login from Chrome on MacOS in New York",
      time: "2 hours ago",
      severity: "info",
    },
    {
      id: 2,
      title: "Password changed",
      desc: "Your password was successfully updated",
      time: "1 day ago",
      severity: "success",
    },
    {
      id: 3,
      title: "Failed login attempt",
      desc: "3 failed attempts from unknown IP",
      time: "3 days ago",
      severity: "warning",
    },
  ];

  const severityColor = (s: string) => {
    switch (s) {
      case "success":
        return "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400";
      case "warning":
        return "bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400";
      case "danger":
        return "bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400";
      default:
        return "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400";
    }
  };

  const severityIcon = (s: string) => {
    switch (s) {
      case "success":
        return <CheckCircle2 size={16} />;
      case "warning":
        return <AlertTriangle size={16} />;
      case "danger":
        return <XCircle size={16} />;
      default:
        return <Bell size={16} />;
    }
  };

  return (
    <PageContainer>
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Security Alerts"
          subtitle="Important security notifications for your account"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Security", href: "/customer/security" },
            { label: "Alerts" },
          ]}
        />
      </motion.div>

      {alerts.length === 0 ? (
        <EmptyState title="No Alerts" description="You're all clear — no security alerts at this time." />
      ) : (
        <div className="space-y-3">
          {alerts.map((a) => (
            <motion.div key={a.id} variants={dashboardItemVariants}>
              <DashCard>
                <div className="flex items-start gap-3">
                  <div className={`rounded-xl p-2 ${severityColor(a.severity)} mt-0.5 flex-shrink-0`}>
                    {severityIcon(a.severity)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-medium text-gray-900 dark:text-white sm:text-sm">{a.title}</h4>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 sm:text-xs">{a.time}</span>
                    </div>
                    <p className="mt-0.5 text-[10px] text-gray-500 dark:text-gray-400 sm:text-xs">{a.desc}</p>
                  </div>
                </div>
              </DashCard>
            </motion.div>
          ))}
        </div>
      )}
    </PageContainer>
  );
};

export default SecurityAlertsList;
