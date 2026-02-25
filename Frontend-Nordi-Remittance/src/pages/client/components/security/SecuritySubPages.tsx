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
} from "lucide-react";
import PageHeader from "@components/shared/PageHeader";
import { EmptyState } from "@components/shared/EmptyState";
import {
  PageContainer, DashCard, StatCard, StatsGrid, StatusBadge,
} from "@components/shared/DashboardPrimitives";
import { StatsGridSkeleton, TableSkeleton } from "@components/skeletons";
import { dashboardItemVariants } from "@core/animation/Animation";
import { useSecuritySettings, useLoginHistory, useSecurityActivityLog, useUpdateSecuritySettings, useEnable2FA } from "@hooks/queries/useSecurity";
import { useToastStore } from "@store/toast.store";

/* ═══════ SECURITY SETTINGS ═══════ */
export const SecuritySettings: React.FC = () => {
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

/* ═══════ TWO-FACTOR AUTH ═══════ */
export const TwoFactorAuth: React.FC = () => {
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

/* ═══════ BIOMETRIC ACCESS ═══════ */
export const BiometricAccess: React.FC = () => {
  const [bio, setBio] = useState({ faceId: true, fingerprint: false });
  const toggle = (key: keyof typeof bio) => setBio((p) => ({ ...p, [key]: !p[key] }));

  const options = [
    { key: "faceId" as const, icon: Eye, label: "Face ID", desc: "Unlock with facial recognition" },
    { key: "fingerprint" as const, icon: Fingerprint, label: "Fingerprint", desc: "Unlock with your fingerprint" },
  ];

  return (
    <PageContainer>
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Biometric Access"
          subtitle="Use biometrics for faster, secure login"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Security", href: "/customer/security" },
            { label: "Biometric" },
          ]}
        />
      </motion.div>

      <div className="max-w-2xl space-y-3">
        {options.map((opt) => (
          <motion.div key={opt.key} variants={dashboardItemVariants}>
            <DashCard>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${bio[opt.key] ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400" : "bg-gray-100 dark:bg-gray-800 text-gray-400"}`}>
                    <opt.icon size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{opt.label}</h4>
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">{opt.desc}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggle(opt.key)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${bio[opt.key] ? "bg-indigo-600" : "bg-gray-300 dark:bg-gray-600"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${bio[opt.key] ? "translate-x-5" : ""}`} />
                </button>
              </div>
            </DashCard>
          </motion.div>
        ))}

        <DashCard className="mt-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 mt-0.5">
              <AlertTriangle size={16} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">Important</h4>
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                Biometric data is stored securely on your device and never shared with our servers.
                You can always use your password as a fallback.
              </p>
            </div>
          </div>
        </DashCard>
      </div>
    </PageContainer>
  );
};

/* ═══════ ACTIVITY LOGS ═══════ */
export const ActivityLogs: React.FC = () => {
  const { data: logData, isLoading } = useSecurityActivityLog();
  const logs = (logData as any)?.data ?? logData ?? [];

  const { data: loginData } = useLoginHistory();
  const logins = (loginData as any)?.data ?? loginData ?? [];
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

/* ═══════ SECURITY ALERTS ═══════ */
export const SecurityAlertsList: React.FC = () => {
  const alerts = [
    { id: 1, title: "New login detected", desc: "Login from Chrome on MacOS in New York", time: "2 hours ago", severity: "info" },
    { id: 2, title: "Password changed", desc: "Your password was successfully updated", time: "1 day ago", severity: "success" },
    { id: 3, title: "Failed login attempt", desc: "3 failed attempts from unknown IP", time: "3 days ago", severity: "warning" },
  ];

  const severityColor = (s: string) => {
    switch (s) {
      case "success": return "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400";
      case "warning": return "bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400";
      case "danger": return "bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400";
      default: return "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400";
    }
  };

  const severityIcon = (s: string) => {
    switch (s) {
      case "success": return <CheckCircle2 size={16} />;
      case "warning": return <AlertTriangle size={16} />;
      case "danger": return <XCircle size={16} />;
      default: return <Bell size={16} />;
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
                  <div className={`p-2 rounded-xl ${severityColor(a.severity)} flex-shrink-0 mt-0.5`}>
                    {severityIcon(a.severity)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{a.title}</h4>
                      <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">{a.time}</span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5">{a.desc}</p>
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
