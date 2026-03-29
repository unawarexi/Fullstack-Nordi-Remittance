// ============================================================================
// COMMUNICATION PREFERENCES — Notification settings
// Uses useUserNotificationPreferences + useUpdateUserNotificationPreferences
// Dark mode + DashboardPrimitives + grey borders + responsive
// ============================================================================

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Bell, Mail, Phone, Smartphone, Shield, CreditCard,
  TrendingUp, User, Loader2, Check,
} from "@constants/icons";
import PageHeader from "@components/shared/PageHeader";
import { PageContainer, DashCard } from "@components/shared/DashboardPrimitives";
import { dashboardItemVariants } from "@core/animation/Animation";
import {
  useClientNotificationPreferences,
  useUpdateUserNotificationPreferences,
} from "../../domain/useProfileDomain";

/* ── Types ───────────────────────────────────────────────────────────── */
interface ChannelPrefs {
  transactions: boolean;
  security: boolean;
  marketing: boolean;
  account: boolean;
}
interface SmsPrefs {
  transactions: boolean;
  security: boolean;
}
interface NotifPrefs {
  email: ChannelPrefs;
  push: ChannelPrefs;
  sms: SmsPrefs;
}

const defaultPrefs: NotifPrefs = {
  email: { transactions: true, security: true, marketing: false, account: true },
  push: { transactions: true, security: true, marketing: false, account: true },
  sms: { transactions: false, security: true },
};

/* ── Category metadata ───────────────────────────────────────────────── */
const categories = [
  {
    key: "transactions" as const,
    label: "Transactions",
    description: "Payment confirmations, transfers, and receipts",
    icon: <CreditCard size={16} />,
    iconBg: "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400",
    channels: ["email", "push", "sms"] as const,
  },
  {
    key: "security" as const,
    label: "Security Alerts",
    description: "Login attempts, password changes, and suspicious activity",
    icon: <Shield size={16} />,
    iconBg: "bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400",
    channels: ["email", "push", "sms"] as const,
  },
  {
    key: "marketing" as const,
    label: "Marketing & Promotions",
    description: "New features, special offers, and product updates",
    icon: <TrendingUp size={16} />,
    iconBg: "bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400",
    channels: ["email", "push"] as const,
  },
  {
    key: "account" as const,
    label: "Account Updates",
    description: "Profile changes, KYC status, and account notifications",
    icon: <User size={16} />,
    iconBg: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400",
    channels: ["email", "push"] as const,
  },
];

const channelMeta: Record<string, { label: string; icon: React.ReactNode }> = {
  email: { label: "Email", icon: <Mail size={14} /> },
  push: { label: "Push", icon: <Smartphone size={14} /> },
  sms: { label: "SMS", icon: <Phone size={14} /> },
};

/* ── Toggle Component ────────────────────────────────────────────────── */
const Toggle: React.FC<{ on: boolean; onChange: () => void }> = ({ on, onChange }) => (
  <button
    type="button"
    onClick={onChange}
    className={`relative inline-flex w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
      on ? "bg-indigo-600" : "bg-gray-300 dark:bg-gray-700"
    }`}
  >
    <span
      className={`inline-block w-5 h-5 mt-0.5 ml-0.5 rounded-full bg-white transition-transform ${
        on ? "translate-x-5" : "translate-x-0"
      }`}
    />
  </button>
);

/* ══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════════════════ */
const Communication: React.FC = () => {
  const { preferences: prefData, isLoading } = useClientNotificationPreferences();
  const updatePrefs = useUpdateUserNotificationPreferences();

  const [prefs, setPrefs] = useState<NotifPrefs>(defaultPrefs);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (prefData) {
      const d = prefData as any;
      setPrefs({
        email: { ...defaultPrefs.email, ...(d.email || {}) },
        push: { ...defaultPrefs.push, ...(d.push || {}) },
        sms: { ...defaultPrefs.sms, ...(d.sms || {}) },
      });
    }
  }, [prefData]);

  const toggle = (channel: "email" | "push" | "sms", category: string) => {
    setPrefs((prev) => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        [category]: !(prev[channel] as any)[category],
      },
    }));
    setDirty(true);
  };

  const save = () => {
    updatePrefs.mutate(prefs, { onSuccess: () => setDirty(false) });
  };

  /* Channel summary counts */
  const channelEnabled = (ch: "email" | "push" | "sms") =>
    Object.values(prefs[ch]).filter(Boolean).length;
  const channelTotal = (ch: "email" | "push" | "sms") =>
    Object.values(prefs[ch]).length;

  return (
    <PageContainer>
      {/* ── Header ── */}
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Communication Preferences"
          subtitle="Control how and when we reach out to you"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Profile", href: "/customer/profile" },
            { label: "Communication" },
          ]}
          actions={
            <motion.button
              onClick={save}
              disabled={!dirty || updatePrefs.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs sm:text-sm font-medium rounded-xl transition-colors"
              whileHover={{ scale: dirty ? 1.02 : 1 }}
              whileTap={{ scale: 0.98 }}
            >
              {updatePrefs.isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              Save Changes
            </motion.button>
          }
        />
      </motion.div>

      {/* ── Loading ── */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
              <div className="h-5 w-40 bg-gray-200 dark:bg-gray-800 rounded mb-4" />
              <div className="space-y-3">
                <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-xl" />
                <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* ── Channel Overview Cards ── */}
          <motion.div variants={dashboardItemVariants} className="mb-4 sm:mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(["email", "push", "sms"] as const).map((ch) => (
                <DashCard key={ch}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${
                      ch === "email"
                        ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400"
                        : ch === "push"
                        ? "bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400"
                        : "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400"
                    }`}>
                      {channelMeta[ch].icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {channelMeta[ch].label}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {channelEnabled(ch)} of {channelTotal(ch)} enabled
                      </p>
                    </div>
                  </div>
                </DashCard>
              ))}
            </div>
          </motion.div>

          {/* ── Category Preferences ── */}
          <div className="space-y-3 sm:space-y-4">
            {categories.map((cat) => (
              <motion.div key={cat.key} variants={dashboardItemVariants}>
                <DashCard>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Category info */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`p-2.5 rounded-xl flex-shrink-0 ${cat.iconBg}`}>
                        {cat.icon}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                          {cat.label}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {cat.description}
                        </p>
                      </div>
                    </div>
                    {/* Channel toggles */}
                    <div className="flex items-center gap-4 sm:gap-6 pl-12 sm:pl-0">
                      {cat.channels.map((ch) => (
                        <div key={ch} className="flex flex-col items-center gap-1.5">
                          <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase">
                            {channelMeta[ch].label}
                          </span>
                          <Toggle
                            on={(prefs[ch] as any)[cat.key] ?? false}
                            onChange={() => toggle(ch, cat.key)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </DashCard>
              </motion.div>
            ))}
          </div>

          {/* ── Quick Actions ── */}
          <motion.div variants={dashboardItemVariants} className="mt-4 sm:mt-6">
            <DashCard>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  <Bell size={14} />
                </div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Quick Actions</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    setPrefs({
                      email: { transactions: true, security: true, marketing: true, account: true },
                      push: { transactions: true, security: true, marketing: true, account: true },
                      sms: { transactions: true, security: true },
                    });
                    setDirty(true);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Enable All
                </button>
                <button
                  onClick={() => {
                    setPrefs({
                      email: { transactions: true, security: true, marketing: false, account: true },
                      push: { transactions: true, security: true, marketing: false, account: false },
                      sms: { transactions: false, security: true },
                    });
                    setDirty(true);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Essential Only
                </button>
                <button
                  onClick={() => {
                    setPrefs({
                      email: { transactions: false, security: false, marketing: false, account: false },
                      push: { transactions: false, security: false, marketing: false, account: false },
                      sms: { transactions: false, security: false },
                    });
                    setDirty(true);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  Disable All
                </button>
              </div>
            </DashCard>
          </motion.div>

          {/* ── Privacy Note ── */}
          <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 text-center mt-4">
            We respect your privacy. Security alerts for critical account events may still be sent regardless of your preferences.
          </p>
        </>
      )}
    </PageContainer>
  );
};

export default Communication;
