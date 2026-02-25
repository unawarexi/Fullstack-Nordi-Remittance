// ============================================================================
// SECURITY SUB-PAGES — Settings, 2FA, Biometric, Logs, Alerts
// ============================================================================

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield, Lock, Fingerprint, FileText, Bell, Key,
  Smartphone, Mail, Eye, EyeOff, AlertTriangle,
  CheckCircle2, XCircle, Clock, Globe, Monitor,
  Settings, ChevronRight, RefreshCw,
} from "lucide-react";
import PageHeader from "@components/shared/PageHeader";
import { StatsGridSkeleton, TableSkeleton } from "@components/skeletons";
import { useSecuritySettings, useLoginHistory, useSecurityActivityLog, useUpdateSecuritySettings, useEnable2FA } from "@hooks/queries/useSecurity";
import { useToastStore } from "@store/toast.store";

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

// ========================
// SECURITY SETTINGS
// ========================
export const SecuritySettings: React.FC = () => {
  const { data, isLoading } = useSecuritySettings();
  const updateSettings = useUpdateSecuritySettings();
  const showToast = useToastStore((s) => s.showToast);
  const settings = data as any;

  const securityOptions = [
    { key: "twoFactorAuth", label: "Two-Factor Authentication", desc: "Add extra layer of security with 2FA", icon: <Key size={20} />, recommended: true },
    { key: "biometricLogin", label: "Biometric Login", desc: "Use Face ID / Fingerprint to log in", icon: <Fingerprint size={20} />, recommended: true },
    { key: "loginAlerts", label: "Login Alerts", desc: "Get notified of new sign-ins", icon: <Bell size={20} />, recommended: true },
    { key: "transactionAlerts", label: "Transaction Alerts", desc: "Real-time alerts for every transaction", icon: <Shield size={20} />, recommended: false },
    { key: "deviceManagement", label: "Trusted Devices Only", desc: "Allow login only from trusted devices", icon: <Monitor size={20} />, recommended: false },
    { key: "sessionTimeout", label: "Auto-Logout (15 min)", desc: "Automatic logout after inactivity", icon: <Clock size={20} />, recommended: true },
  ];

  const handleToggle = (key: string, value: boolean) => {
    updateSettings.mutate({ [key]: value } as any, {
      onSuccess: () => showToast("Security setting updated", "success"),
      onError: () => showToast("Failed to update setting", "error"),
    });
  };

  return (
    <motion.div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-full" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <PageHeader title="Security Settings" subtitle="Manage your account security"
          breadcrumbs={[{ label: "Dashboard", href: "/customer/dashboard" }, { label: "Security", href: "/customer/security" }, { label: "Settings" }]} />
      </motion.div>

      {/* Security Score */}
      <motion.div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-xl p-6 text-white mb-6 max-w-3xl" variants={itemVariants}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-indigo-200 text-sm mb-1">Security Score</p>
            <p className="text-4xl font-bold">85<span className="text-lg text-indigo-200">/100</span></p>
            <p className="text-indigo-200 text-sm mt-1">Your account is well protected</p>
          </div>
          <div className="w-20 h-20 rounded-full border-4 border-white/30 flex items-center justify-center">
            <Shield size={32} className="text-white" />
          </div>
        </div>
      </motion.div>

      <motion.div className="space-y-3 max-w-3xl" variants={containerVariants}>
        {securityOptions.map((opt) => (
          <motion.div key={opt.key} className="bg-white rounded-xl shadow-sm p-5 flex items-center justify-between" variants={itemVariants}>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">{opt.icon}</div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 text-sm">{opt.label}</h3>
                  {opt.recommended && <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">Recommended</span>}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked={settings?.[opt.key] ?? opt.recommended} onChange={(e) => handleToggle(opt.key, e.target.checked)} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
            </label>
          </motion.div>
        ))}
      </motion.div>

      <motion.div className="mt-6 bg-white rounded-xl shadow-sm p-6 max-w-3xl" variants={itemVariants}>
        <h3 className="font-semibold text-indigo-900 mb-4">Change Password</h3>
        <div className="space-y-4">
          <div><label className="text-sm font-medium text-gray-700 mb-1.5 block">Current Password</label><input type="password" className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" /></div>
          <div><label className="text-sm font-medium text-gray-700 mb-1.5 block">New Password</label><input type="password" className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" /></div>
          <div><label className="text-sm font-medium text-gray-700 mb-1.5 block">Confirm New Password</label><input type="password" className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" /></div>
          <motion.button className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-medium" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>Update Password</motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ========================
// TWO-FACTOR AUTH
// ========================
export const TwoFactorAuth: React.FC = () => {
  const enable2FA = useEnable2FA();
  const showToast = useToastStore((s) => s.showToast);
  const [method, setMethod] = useState("app");

  const methods = [
    { key: "app", label: "Authenticator App", desc: "Use Google Authenticator, Authy, or similar", icon: <Smartphone size={20} />, recommended: true },
    { key: "sms", label: "SMS Verification", desc: "Receive codes via text message", icon: <Smartphone size={20} />, recommended: false },
    { key: "email", label: "Email Verification", desc: "Receive codes via email", icon: <Mail size={20} />, recommended: false },
  ];

  return (
    <motion.div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-full" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <PageHeader title="Two-Factor Authentication" subtitle="Secure your account with an additional verification step"
          breadcrumbs={[{ label: "Dashboard", href: "/customer/dashboard" }, { label: "Security", href: "/customer/security" }, { label: "2FA" }]} />
      </motion.div>

      <div className="max-w-2xl space-y-6">
        <motion.div className="bg-white rounded-xl shadow-sm p-6" variants={itemVariants}>
          <h3 className="font-semibold text-indigo-900 mb-4">Choose Verification Method</h3>
          <div className="space-y-3">
            {methods.map((m) => (
              <button key={m.key} onClick={() => setMethod(m.key)}
                className={`w-full p-4 rounded-xl border-2 text-left flex items-center gap-4 transition-all ${method === m.key ? "border-indigo-500 bg-indigo-50" : "border-gray-100 hover:border-gray-200"}`}>
                <div className={`p-2.5 rounded-xl ${method === m.key ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500"}`}>{m.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900">{m.label}</h4>
                    {m.recommended && <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">Recommended</span>}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{m.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        {method === "app" && (
          <motion.div className="bg-white rounded-xl shadow-sm p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h3 className="font-semibold text-indigo-900 mb-4">Setup Instructions</h3>
            <ol className="space-y-3">
              {[
                "Download an authenticator app (Google Authenticator, Authy, etc.)",
                "Scan the QR code below with your authenticator app",
                "Enter the 6-digit verification code from the app",
                "Save your backup codes in a secure location",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                  <span className="text-sm text-gray-700">{step}</span>
                </li>
              ))}
            </ol>
            <div className="mt-6 flex justify-center">
              <div className="w-48 h-48 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                <p className="text-sm text-gray-400 text-center px-4">QR Code will appear after enabling</p>
              </div>
            </div>
          </motion.div>
        )}

        <motion.button onClick={() => enable2FA.mutate({ method } as any, { onSuccess: () => showToast("2FA enabled!", "success"), onError: () => showToast("Failed to enable 2FA", "error") })}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-medium shadow-md" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          Enable Two-Factor Authentication
        </motion.button>
      </div>
    </motion.div>
  );
};

// ========================
// BIOMETRIC ACCESS
// ========================
export const BiometricAccess: React.FC = () => {
  const options = [
    { name: "Face ID", desc: "Use facial recognition to log in", icon: <Eye size={24} />, supported: true, enabled: true },
    { name: "Touch ID / Fingerprint", desc: "Use fingerprint scanner", icon: <Fingerprint size={24} />, supported: true, enabled: false },
    { name: "Voice Recognition", desc: "Use voice to authenticate", icon: <Settings size={24} />, supported: false, enabled: false },
  ];

  return (
    <motion.div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-full" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <PageHeader title="Biometric Access" subtitle="Manage biometric authentication methods"
          breadcrumbs={[{ label: "Dashboard", href: "/customer/dashboard" }, { label: "Security", href: "/customer/security" }, { label: "Biometric" }]} />
      </motion.div>

      <motion.div className="space-y-4 max-w-3xl" variants={containerVariants}>
        {options.map((opt) => (
          <motion.div key={opt.name} className={`bg-white rounded-xl shadow-sm p-6 ${!opt.supported ? "opacity-60" : ""}`} variants={itemVariants}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3.5 rounded-xl ${opt.enabled ? "bg-indigo-50 text-indigo-600" : "bg-gray-100 text-gray-400"}`}>{opt.icon}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{opt.name}</h3>
                    {!opt.supported && <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">Not Available</span>}
                    {opt.enabled && <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">Active</span>}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{opt.desc}</p>
                </div>
              </div>
              {opt.supported && (
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked={opt.enabled} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                </label>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div className="mt-6 bg-indigo-50 rounded-xl p-5 border border-indigo-100 max-w-3xl" variants={itemVariants}>
        <div className="flex items-start gap-3">
          <Shield size={20} className="text-indigo-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-indigo-900">About Biometric Security</h4>
            <p className="text-sm text-gray-600 mt-1">Biometric data is stored securely on your device and never transmitted to our servers. This ensures your biometric information remains private and protected.</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ========================
// ACTIVITY LOGS
// ========================
export const ActivityLogs: React.FC = () => {
  const { data, isLoading } = useLoginHistory();
  const logs = data?.data || [];

  const defaultLogs = [
    { action: "Login", device: "iPhone 15 Pro", location: "New York, US", ip: "192.168.1.xxx", date: "2024-01-28T14:30:00", status: "success" },
    { action: "Password Change", device: "MacBook Pro", location: "New York, US", ip: "192.168.1.xxx", date: "2024-01-27T10:15:00", status: "success" },
    { action: "Login", device: "Chrome / Windows", location: "Unknown", ip: "203.45.67.xxx", date: "2024-01-26T22:45:00", status: "blocked" },
    { action: "Transfer Initiated", device: "iPhone 15 Pro", location: "New York, US", ip: "192.168.1.xxx", date: "2024-01-26T09:00:00", status: "success" },
    { action: "2FA Verified", device: "MacBook Pro", location: "New York, US", ip: "192.168.1.xxx", date: "2024-01-25T16:20:00", status: "success" },
    { action: "Login Attempt", device: "Firefox / Linux", location: "Moscow, RU", ip: "185.22.xx.xxx", date: "2024-01-25T03:12:00", status: "blocked" },
  ];

  const display = logs.length > 0 ? logs : defaultLogs;

  return (
    <motion.div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-full" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <PageHeader title="Activity Logs" subtitle="Review your account activity"
          breadcrumbs={[{ label: "Dashboard", href: "/customer/dashboard" }, { label: "Security", href: "/customer/security" }, { label: "Logs" }]} />
      </motion.div>

      {isLoading ? <TableSkeleton rows={6} cols={5} /> : (
        <motion.div className="bg-white rounded-xl shadow-sm overflow-hidden" variants={itemVariants}>
          <table className="w-full">
            <thead><tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left text-xs font-medium text-gray-500 p-4">Action</th>
              <th className="text-left text-xs font-medium text-gray-500 p-4">Device</th>
              <th className="text-left text-xs font-medium text-gray-500 p-4">Location</th>
              <th className="text-left text-xs font-medium text-gray-500 p-4">Date</th>
              <th className="text-left text-xs font-medium text-gray-500 p-4">Status</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {display.map((log: any, i: number) => (
                <tr key={i} className="hover:bg-indigo-50/30 transition-colors">
                  <td className="p-4 text-sm font-medium text-gray-900">{log.action}</td>
                  <td className="p-4 text-sm text-gray-600">{log.device}</td>
                  <td className="p-4 text-sm text-gray-600 flex items-center gap-1"><Globe size={12} /> {log.location}</td>
                  <td className="p-4 text-sm text-gray-500">{new Date(log.date).toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${log.status === "success" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                      {log.status === "success" ? <CheckCircle2 size={12} /> : <XCircle size={12} />} {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </motion.div>
  );
};

// ========================
// SECURITY ALERTS
// ========================
export const SecurityAlertsList: React.FC = () => {
  const { data, isLoading } = useSecurityActivityLog();
  const alerts = (data as any)?.data ? (data as any).data : data || [];

  const defaultAlerts = [
    { id: "1", title: "Suspicious Login Attempt", desc: "Login attempt from unknown device in Moscow, Russia was blocked", severity: "high", date: "2024-01-25T03:12:00", resolved: true },
    { id: "2", title: "Password Changed", desc: "Your account password was successfully changed", severity: "info", date: "2024-01-27T10:15:00", resolved: true },
    { id: "3", title: "New Device Added", desc: "iPad Air was added as a new device", severity: "medium", date: "2024-01-20T14:30:00", resolved: false },
    { id: "4", title: "Multiple Failed Logins", desc: "3 failed login attempts detected from Chrome/Windows", severity: "high", date: "2024-01-18T22:00:00", resolved: true },
  ];

  const display = alerts.length > 0 ? alerts : defaultAlerts;
  const severityColors: Record<string, { icon: React.ReactNode; bg: string; text: string }> = {
    high: { icon: <AlertTriangle size={16} />, bg: "bg-rose-50", text: "text-rose-600" },
    medium: { icon: <AlertTriangle size={16} />, bg: "bg-amber-50", text: "text-amber-600" },
    info: { icon: <CheckCircle2 size={16} />, bg: "bg-blue-50", text: "text-blue-600" },
    low: { icon: <Shield size={16} />, bg: "bg-gray-50", text: "text-gray-600" },
  };

  return (
    <motion.div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-full" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <PageHeader title="Security Alerts" subtitle="Stay informed about security events"
          breadcrumbs={[{ label: "Dashboard", href: "/customer/dashboard" }, { label: "Security", href: "/customer/security" }, { label: "Alerts" }]} />
      </motion.div>

      <motion.div className="space-y-4 max-w-3xl" variants={containerVariants}>
        {display.map((alert: any, i: number) => {
          const sev = severityColors[alert.severity] || severityColors.info;
          return (
            <motion.div key={alert.id || i} className="bg-white rounded-xl shadow-sm p-5" variants={itemVariants}>
              <div className="flex items-start gap-4">
                <div className={`p-2.5 rounded-xl ${sev.bg} ${sev.text}`}>{sev.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 text-sm">{alert.title}</h3>
                    {alert.resolved && <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">Resolved</span>}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{alert.desc}</p>
                  <p className="text-xs text-gray-400 mt-2">{new Date(alert.date).toLocaleString()}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
};
