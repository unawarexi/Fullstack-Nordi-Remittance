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
import { useSecuritySettings, useLoginHistory, useSecurityActivityLog, useUpdateSecuritySettings, useEnable2FA } from "@hooks/queries/useSecurity";
import { useToastStore } from "@store/toast.store";

const safeArray = (d: unknown): any[] => Array.isArray(d) ? d : Array.isArray((d as any)?.data) ? (d as any).data : [];


const TwoFactorAuth: React.FC = () => {
  const { data: settings } = useSecuritySettings();
  const enable2FA = useEnable2FA();
  const { showToast } = useToastStore();
  const securityData = (settings as any)?.data ?? settings ?? {};
  const is2FAEnabled = securityData.twoFactorEnabled ?? false;

  const methods = [
    { key: "sms", icon: Smartphone, label: "SMS Verification", desc: "Receive codes via text message" },
    { key: "email", icon: Mail, label: "Email Verification", desc: "Receive codes via email" },
    { key: "app", icon: Key, label: "Authenticator App", desc: "Use Google/Microsoft Authenticator" },
  ];

  const handle2FA = async () => {
    try {
      await enable2FA.mutateAsync("authenticator");
      showToast("2FA settings updated", "success");
    } catch {
      showToast("Failed to update 2FA", "error");
    }
  };

  return (
    <PageContainer>
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Two-Factor Authentication"
          subtitle="Add an extra layer of security to your account"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Security", href: "/customer/security" },
            { label: "2FA" },
          ]}
        />
      </motion.div>

      <div className="max-w-2xl">
        <DashCard className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${is2FAEnabled ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400" : "bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400"}`}>
                <Shield size={20} />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                  2FA is {is2FAEnabled ? "Enabled" : "Disabled"}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {is2FAEnabled ? "Your account has extra protection" : "Enable 2FA for better security"}
                </p>
              </div>
            </div>
            <StatusBadge status={is2FAEnabled ? "active" : "inactive"} />
          </div>
        </DashCard>

        <div className="space-y-3">
          {methods.map((m) => (
            <motion.div key={m.key} variants={dashboardItemVariants}>
              <DashCard>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                      <m.icon size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{m.label}</h4>
                      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">{m.desc}</p>
                    </div>
                  </div>
                  <motion.button
                    onClick={handle2FA}
                    disabled={enable2FA.isPending}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-colors disabled:opacity-50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {enable2FA.isPending ? "…" : "Setup"}
                  </motion.button>
                </div>
              </DashCard>
            </motion.div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
};

export default TwoFactorAuth;
