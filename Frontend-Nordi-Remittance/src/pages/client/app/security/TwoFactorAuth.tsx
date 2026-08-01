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
import { useClientSecuritySettings, useEnable2FA } from "../../client-usecase/usesecurity-client-usecase";
import { useToastStore } from "@store/toast.store";

const TwoFactorAuth: React.FC = () => {
  const { settings: securityData } = useClientSecuritySettings();
  const enable2FA = useEnable2FA();
  const { showToast } = useToastStore();
  const is2FAEnabled = (securityData._raw as any)?.twoFactorEnabled ?? false;

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
              <div
                className={`rounded-xl p-2.5 ${is2FAEnabled ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400" : "bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400"}`}
              >
                <Shield size={20} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white sm:text-base">
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
                    <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                      <m.icon size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-gray-900 dark:text-white sm:text-sm">{m.label}</h4>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 sm:text-xs">{m.desc}</p>
                    </div>
                  </div>
                  <motion.button
                    onClick={handle2FA}
                    disabled={enable2FA.isPending}
                    className="rounded-lg border border-gray-200 bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
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
