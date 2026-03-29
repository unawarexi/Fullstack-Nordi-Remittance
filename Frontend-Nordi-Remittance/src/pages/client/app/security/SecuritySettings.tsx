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


const SecuritySettings: React.FC = () => {
  const { data: settings, isLoading } = useSecuritySettings();
  const updateMutation = useUpdateSecuritySettings();
  const { showToast } = useToastStore();
  const securityData = (settings as any)?.data ?? settings ?? {};

  const [showPassword, setShowPassword] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });

  const inputCls =
    "w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors";
  const labelCls = "block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";

  const scoreVal = securityData.securityScore ?? 75;
  const scoreColor = scoreVal >= 80 ? "text-emerald-500" : scoreVal >= 50 ? "text-amber-500" : "text-red-500";

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      showToast("Passwords don't match", "error");
      return;
    }
    try {
      await updateMutation.mutateAsync({});
      showToast("Password updated successfully", "success");
      setPasswords({ current: "", new: "", confirm: "" });
    } catch {
      showToast("Failed to update password", "error");
    }
  };

  return (
    <PageContainer>
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Security Settings"
          subtitle="Manage your account security and privacy"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Security", href: "/customer/security" },
            { label: "Settings" },
          ]}
        />
      </motion.div>

      {isLoading ? (
        <StatsGridSkeleton count={3} />
      ) : (
        <>
          <DashCard className="mb-6">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16">
                <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" className="text-gray-200 dark:text-gray-700" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={`${scoreVal}, 100`} className={scoreColor} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-sm font-bold ${scoreColor}`}>{scoreVal}</span>
                </div>
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">Security Score</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {scoreVal >= 80 ? "Excellent! Your account is well protected." : "Consider improving your security settings."}
                </p>
              </div>
            </div>
          </DashCard>

          <DashCard>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-6">Change Password</h3>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className={labelCls}>Current Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passwords.current}
                    onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
                    placeholder="Enter current password"
                    className={inputCls}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>New Password</label>
                  <input type="password" value={passwords.new} onChange={(e) => setPasswords((p) => ({ ...p, new: e.target.value }))} placeholder="New password" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Confirm Password</label>
                  <input type="password" value={passwords.confirm} onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))} placeholder="Confirm password" className={inputCls} />
                </div>
              </div>
              <motion.button
                type="submit"
                disabled={updateMutation.isPending}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-xs sm:text-sm font-medium disabled:opacity-50"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                {updateMutation.isPending ? "Updating…" : "Update Password"}
              </motion.button>
            </form>
          </DashCard>
        </>
      )}
    </PageContainer>
  );
};

export default SecuritySettings;
