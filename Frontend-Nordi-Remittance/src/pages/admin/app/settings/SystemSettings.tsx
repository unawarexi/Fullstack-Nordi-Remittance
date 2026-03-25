import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  Shield,
  Bell,
  Key,
  CreditCard,
  Globe,
  Lock,
  Palette,
  Clock,
  ToggleLeft,
  ToggleRight,
  Save,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Mail,
  Smartphone,
  Wifi,
  Database,
  Server,
} from "lucide-react";
import {
  PageContainer,
  DashCard,
  SectionHeader,
  ActionButton,
} from "@components/shared/DashboardPrimitives";
import { PageHeader } from "@components/shared/PageHeader";
import { useToast } from "@store/toast.store";

const settingsSections = [
  { id: "general", label: "General", icon: <Settings size={16} /> },
  { id: "security", label: "Security", icon: <Shield size={16} /> },
  { id: "notifications", label: "Notifications", icon: <Bell size={16} /> },
  { id: "api", label: "API Keys", icon: <Key size={16} /> },
  { id: "payment-gateways", label: "Payment Gateways", icon: <CreditCard size={16} /> },
];

function ToggleSwitch({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <motion.button whileTap={{ scale: 0.95 }} onClick={onChange} className={`relative w-10 h-5.5 rounded-full transition-colors ${enabled ? "bg-indigo-600" : "bg-gray-300 dark:bg-gray-600"}`}>
      <motion.div animate={{ x: enabled ? 18 : 2 }} className="absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow-sm" />
    </motion.button>
  );
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
        {description && <p className="text-[11px] text-gray-400 mt-0.5">{description}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

export default function SystemSettings() {
  const toast = useToast();
  const [activeSection, setActiveSection] = useState("general");

  // General
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [defaultCurrency, setDefaultCurrency] = useState("EUR");
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [platformName, setPlatformName] = useState("Nordi Remittance");

  // Security
  const [require2FA, setRequire2FA] = useState(true);
  const [maxLoginAttempts, setMaxLoginAttempts] = useState("3");
  const [passwordMinLength, setPasswordMinLength] = useState("8");
  const [ipWhitelist, setIpWhitelist] = useState(false);
  const [forcePasswordReset, setForcePasswordReset] = useState(false);

  // Notifications
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [transactionAlerts, setTransactionAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  const handleSave = () => toast.success("Settings saved successfully");

  const inputStyles = "w-full sm:w-48 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all";
  const selectStyles = "px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none";

  return (
    <PageContainer>
      <PageHeader
        title="System Settings"
        subtitle="Platform configuration, security policies, and integration settings"
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "System Settings" },
        ]}
        actions={<ActionButton label="Save Changes" icon={<Save size={14} />} onClick={handleSave} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <DashCard className="!p-2">
            <nav className="space-y-0.5">
              {settingsSections.map((section) => (
                <motion.button
                  key={section.id}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    activeSection === section.id
                      ? "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  }`}
                >
                  {section.icon}
                  {section.label}
                  <ChevronRight size={14} className="ml-auto" />
                </motion.button>
              ))}
            </nav>
          </DashCard>

          {/* System Status */}
          <DashCard className="mt-4">
            <SectionHeader title="System Status" />
            <div className="space-y-3 mt-3">
              {[
                { label: "API Server", status: "operational", icon: <Server size={14} /> },
                { label: "Database", status: "operational", icon: <Database size={14} /> },
                { label: "WebSocket", status: "operational", icon: <Wifi size={14} /> },
                { label: "Payment Gateway", status: "operational", icon: <CreditCard size={14} /> },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    {s.icon}
                    {s.label}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-emerald-600 dark:text-emerald-400 capitalize">{s.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </DashCard>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {/* General Settings */}
            {activeSection === "general" && (
              <motion.div key="general" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <DashCard>
                  <SectionHeader title="General Settings" subtitle="Basic platform configuration and preferences" />
                  <SettingRow label="Platform Name" description="The name displayed across the platform">
                    <input type="text" value={platformName} onChange={(e) => setPlatformName(e.target.value)} className={inputStyles} />
                  </SettingRow>
                  <SettingRow label="Default Currency" description="Default currency for new accounts and displays">
                    <select value={defaultCurrency} onChange={(e) => setDefaultCurrency(e.target.value)} className={selectStyles}>
                      <option value="EUR">EUR (€)</option>
                      <option value="USD">USD ($)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="SEK">SEK (kr)</option>
                      <option value="NOK">NOK (kr)</option>
                    </select>
                  </SettingRow>
                  <SettingRow label="Session Timeout" description="Auto-logout after inactivity (minutes)">
                    <select value={sessionTimeout} onChange={(e) => setSessionTimeout(e.target.value)} className={selectStyles}>
                      <option value="15">15 min</option>
                      <option value="30">30 min</option>
                      <option value="60">1 hour</option>
                      <option value="120">2 hours</option>
                    </select>
                  </SettingRow>
                  <SettingRow label="Registration Open" description="Allow new users to create accounts">
                    <ToggleSwitch enabled={registrationOpen} onChange={() => setRegistrationOpen(!registrationOpen)} />
                  </SettingRow>
                  <SettingRow label="Maintenance Mode" description="Show maintenance page to all non-admin users">
                    <div className="flex items-center gap-2">
                      {maintenanceMode && <AlertTriangle size={14} className="text-amber-500" />}
                      <ToggleSwitch enabled={maintenanceMode} onChange={() => setMaintenanceMode(!maintenanceMode)} />
                    </div>
                  </SettingRow>
                </DashCard>
              </motion.div>
            )}

            {/* Security Settings */}
            {activeSection === "security" && (
              <motion.div key="security" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <DashCard>
                  <SectionHeader title="Security Settings" subtitle="Authentication policies and access control" />
                  <SettingRow label="Require Two-Factor Authentication" description="Enforce 2FA for all admin accounts">
                    <ToggleSwitch enabled={require2FA} onChange={() => setRequire2FA(!require2FA)} />
                  </SettingRow>
                  <SettingRow label="Max Login Attempts" description="Lock account after N failed attempts">
                    <select value={maxLoginAttempts} onChange={(e) => setMaxLoginAttempts(e.target.value)} className={selectStyles}>
                      <option value="3">3 attempts</option>
                      <option value="5">5 attempts</option>
                      <option value="10">10 attempts</option>
                    </select>
                  </SettingRow>
                  <SettingRow label="Minimum Password Length" description="Required minimum characters for passwords">
                    <select value={passwordMinLength} onChange={(e) => setPasswordMinLength(e.target.value)} className={selectStyles}>
                      <option value="8">8 characters</option>
                      <option value="10">10 characters</option>
                      <option value="12">12 characters</option>
                      <option value="16">16 characters</option>
                    </select>
                  </SettingRow>
                  <SettingRow label="IP Whitelist" description="Restrict admin access to whitelisted IPs only">
                    <ToggleSwitch enabled={ipWhitelist} onChange={() => setIpWhitelist(!ipWhitelist)} />
                  </SettingRow>
                  <SettingRow label="Force Password Reset" description="Require all users to reset passwords on next login">
                    <div className="flex items-center gap-2">
                      {forcePasswordReset && <AlertTriangle size={14} className="text-amber-500" />}
                      <ToggleSwitch enabled={forcePasswordReset} onChange={() => setForcePasswordReset(!forcePasswordReset)} />
                    </div>
                  </SettingRow>
                </DashCard>
              </motion.div>
            )}

            {/* Notification Settings */}
            {activeSection === "notifications" && (
              <motion.div key="notifications" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <DashCard>
                  <SectionHeader title="Notification Channels" subtitle="Configure how and when notifications are sent" />
                  <SettingRow label="Email Notifications" description="Send notifications via email">
                    <div className="flex items-center gap-2"><Mail size={14} className="text-gray-400" /><ToggleSwitch enabled={emailNotifs} onChange={() => setEmailNotifs(!emailNotifs)} /></div>
                  </SettingRow>
                  <SettingRow label="SMS Notifications" description="Send notifications via SMS">
                    <div className="flex items-center gap-2"><Smartphone size={14} className="text-gray-400" /><ToggleSwitch enabled={smsNotifs} onChange={() => setSmsNotifs(!smsNotifs)} /></div>
                  </SettingRow>
                  <SettingRow label="Push Notifications" description="Send browser push notifications">
                    <div className="flex items-center gap-2"><Bell size={14} className="text-gray-400" /><ToggleSwitch enabled={pushNotifs} onChange={() => setPushNotifs(!pushNotifs)} /></div>
                  </SettingRow>
                </DashCard>
                <DashCard className="mt-4">
                  <SectionHeader title="Alert Preferences" subtitle="Choose which events trigger admin notifications" />
                  <SettingRow label="Login Alerts" description="Notify on new admin logins">
                    <ToggleSwitch enabled={loginAlerts} onChange={() => setLoginAlerts(!loginAlerts)} />
                  </SettingRow>
                  <SettingRow label="Transaction Alerts" description="Notify on large or suspicious transactions">
                    <ToggleSwitch enabled={transactionAlerts} onChange={() => setTransactionAlerts(!transactionAlerts)} />
                  </SettingRow>
                  <SettingRow label="Weekly Digest" description="Receive a weekly summary email">
                    <ToggleSwitch enabled={weeklyDigest} onChange={() => setWeeklyDigest(!weeklyDigest)} />
                  </SettingRow>
                </DashCard>
              </motion.div>
            )}

            {/* API Keys */}
            {activeSection === "api" && (
              <motion.div key="api" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <DashCard>
                  <SectionHeader title="API Configuration" subtitle="Manage API keys and third-party integrations" />
                  {[
                    { name: "Production API Key", key: "nrd_live_••••••••••••4f8a", created: "2026-01-15", status: "active" },
                    { name: "Staging API Key", key: "nrd_test_••••••••••••7b2c", created: "2026-02-20", status: "active" },
                    { name: "Webhook Secret", key: "whsec_••••••••••••9d3e", created: "2026-01-15", status: "active" },
                  ].map((apiKey) => (
                    <div key={apiKey.name} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{apiKey.name}</p>
                        <p className="text-xs font-mono text-gray-400 mt-0.5">{apiKey.key}</p>
                        <p className="text-[10px] text-gray-400">Created {apiKey.created}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400">Active</span>
                        </div>
                        <ActionButton label="Regenerate" onClick={() => toast.warning("API key regeneration requires confirmation")} variant="secondary" />
                      </div>
                    </div>
                  ))}
                </DashCard>
              </motion.div>
            )}

            {/* Payment Gateways */}
            {activeSection === "payment-gateways" && (
              <motion.div key="gateways" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <DashCard>
                  <SectionHeader title="Payment Gateways" subtitle="Configure payment processing integrations" />
                  {[
                    { name: "Stripe", status: "connected", logo: "💳", description: "Card payments and subscriptions" },
                    { name: "PayPal", status: "connected", logo: "🅿️", description: "PayPal payments and transfers" },
                    { name: "Wise (TransferWise)", status: "connected", logo: "🌍", description: "International transfers" },
                    { name: "Flutterwave", status: "disabled", logo: "🌊", description: "African payment gateway" },
                  ].map((gw) => (
                    <div key={gw.name} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-lg">{gw.logo}</div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{gw.name}</p>
                          <p className="text-[11px] text-gray-400">{gw.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${gw.status === "connected" ? "bg-emerald-50 dark:bg-emerald-950/30" : "bg-gray-100 dark:bg-gray-800"}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${gw.status === "connected" ? "bg-emerald-500" : "bg-gray-400"}`} />
                          <span className={`text-[10px] font-medium capitalize ${gw.status === "connected" ? "text-emerald-700 dark:text-emerald-400" : "text-gray-500"}`}>{gw.status}</span>
                        </div>
                        <ActionButton label="Configure" onClick={() => toast.info(`Configuring ${gw.name}`)} variant="secondary" />
                      </div>
                    </div>
                  ))}
                </DashCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageContainer>
  );
}
