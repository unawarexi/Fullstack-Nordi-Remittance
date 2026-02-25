// ============================================================================
// MOBILE SUB-PAGES — App, Device Mgmt, QR Payments, Notifications
// Dark mode + DashboardPrimitives + grey borders + responsive typography
// ============================================================================

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Smartphone, Monitor, QrCode, Bell, Shield, Download,
  Trash2, CheckCircle2, Fingerprint, Send, PieChart,
  ToggleLeft, ToggleRight, Tablet,
} from "lucide-react";
import PageHeader from "@components/shared/PageHeader";
import {
  PageContainer, DashCard,
} from "@components/shared/DashboardPrimitives";
import { dashboardItemVariants } from "@core/animation/Animation";

/* ═══════ MOBILE APP ═══════ */
export const MobileApp: React.FC = () => {
  const features = [
    { icon: Send, title: "Quick Transfers", desc: "Send money in seconds", gradient: "from-indigo-500 to-purple-500" },
    { icon: Fingerprint, title: "Biometric Login", desc: "Face ID & fingerprint access", gradient: "from-emerald-500 to-teal-500" },
    { icon: Bell, title: "Real-time Alerts", desc: "Instant transaction notifications", gradient: "from-amber-500 to-orange-500" },
    { icon: PieChart, title: "Budget Tracking", desc: "Track spending by category", gradient: "from-pink-500 to-rose-500" },
    { icon: QrCode, title: "QR Payments", desc: "Scan & pay instantly", gradient: "from-cyan-500 to-blue-500" },
    { icon: Shield, title: "Bank-grade Security", desc: "End-to-end encryption", gradient: "from-violet-500 to-purple-500" },
  ];

  return (
    <PageContainer>
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Mobile App"
          subtitle="Bank on the go with our mobile app"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Mobile Banking", href: "/customer/mobile" },
            { label: "App" },
          ]}
        />
      </motion.div>

      <DashCard className="mb-6 text-center py-8 sm:py-12">
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center text-white mb-4">
          <Smartphone size={28} />
        </div>
        <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Nordi Mobile Banking
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-lg mx-auto mb-6">
          Experience seamless banking from your phone. Available on iOS and Android.
        </p>
        <div className="flex items-center justify-center gap-3">
          <motion.button
            className="flex items-center gap-2 px-4 sm:px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-xs sm:text-sm font-medium"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Download size={16} /> App Store
          </motion.button>
          <motion.button
            className="flex items-center gap-2 px-4 sm:px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-xs sm:text-sm font-medium"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Download size={16} /> Google Play
          </motion.button>
        </div>
      </DashCard>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((f) => (
          <motion.div key={f.title} variants={dashboardItemVariants}>
            <DashCard className="h-full">
              <div className={`w-10 h-10 bg-gradient-to-br ${f.gradient} rounded-xl flex items-center justify-center text-white mb-3`}>
                <f.icon size={18} />
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">{f.title}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{f.desc}</p>
            </DashCard>
          </motion.div>
        ))}
      </div>
    </PageContainer>
  );
};

/* ═══════ DEVICE MANAGEMENT ═══════ */
export const DeviceManagement: React.FC = () => {
  const [devices, setDevices] = useState([
    { id: 1, name: "iPhone 15 Pro", type: "phone", lastActive: "Just now", location: "New York, US", current: true },
    { id: 2, name: "MacBook Pro", type: "desktop", lastActive: "2 hours ago", location: "New York, US", current: false },
    { id: 3, name: "iPad Air", type: "tablet", lastActive: "3 days ago", location: "Boston, US", current: false },
  ]);

  const deviceIcon = (type: string) => {
    switch (type) {
      case "phone": return <Smartphone size={18} />;
      case "desktop": return <Monitor size={18} />;
      case "tablet": return <Tablet size={18} />;
      default: return <Smartphone size={18} />;
    }
  };

  const removeDevice = (id: number) =>
    setDevices((prev) => prev.filter((d) => d.id !== id));

  return (
    <PageContainer>
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Device Management"
          subtitle="Manage devices connected to your account"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Mobile Banking", href: "/customer/mobile" },
            { label: "Devices" },
          ]}
        />
      </motion.div>

      <div className="space-y-3">
        {devices.map((d) => (
          <motion.div key={d.id} variants={dashboardItemVariants}>
            <DashCard>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${d.current ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400" : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"}`}>
                    {deviceIcon(d.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{d.name}</h4>
                      {d.current && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">
                          This device
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                      {d.lastActive} • {d.location}
                    </p>
                  </div>
                </div>
                {!d.current && (
                  <button
                    onClick={() => removeDevice(d.id)}
                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </DashCard>
          </motion.div>
        ))}
      </div>
    </PageContainer>
  );
};

/* ═══════ QR PAYMENTS ═══════ */
export const QRPayments: React.FC = () => {
  const [tab, setTab] = useState<"scan" | "generate">("scan");

  return (
    <PageContainer>
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="QR Payments"
          subtitle="Pay or receive money using QR codes"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Mobile Banking", href: "/customer/mobile" },
            { label: "QR Payments" },
          ]}
        />
      </motion.div>

      <div className="max-w-lg mx-auto">
        <div className="flex gap-2 mb-6">
          {(["scan", "generate"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                tab === t
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
              }`}
            >
              {t === "scan" ? "Scan QR" : "My QR Code"}
            </button>
          ))}
        </div>

        <DashCard className="text-center py-8 sm:py-12">
          {tab === "scan" ? (
            <>
              <div className="w-48 h-48 mx-auto rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center mb-4">
                <QrCode size={64} className="text-gray-300 dark:text-gray-600" />
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-2">Scan QR Code</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Point your camera at a QR code to pay</p>
              <motion.button
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Open Camera
              </motion.button>
            </>
          ) : (
            <>
              <div className="w-48 h-48 mx-auto rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center mb-4 p-4">
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-lg flex items-center justify-center">
                  <QrCode size={48} className="text-gray-400 dark:text-gray-500" />
                </div>
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-2">Your QR Code</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Share this code to receive payments</p>
              <motion.button
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-sm font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Download QR
              </motion.button>
            </>
          )}
        </DashCard>

        <DashCard className="mt-6">
          <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-3">How It Works</h3>
          <div className="space-y-3">
            {[
              { step: "1", text: "Open the QR scanner or generate your code" },
              { step: "2", text: "Scan the recipient's code or share yours" },
              { step: "3", text: "Confirm the amount and complete the payment" },
            ].map((s) => (
              <div key={s.step} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {s.step}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300">{s.text}</p>
              </div>
            ))}
          </div>
        </DashCard>
      </div>
    </PageContainer>
  );
};

/* ═══════ PUSH NOTIFICATIONS ═══════ */
export const PushNotifications: React.FC = () => {
  const [prefs, setPrefs] = useState({
    transactions: true,
    security: true,
    marketing: false,
    reminders: true,
    promotions: false,
  });

  const toggle = (key: keyof typeof prefs) =>
    setPrefs((p) => ({ ...p, [key]: !p[key] }));

  const categories = [
    { key: "transactions" as const, title: "Transaction Alerts", desc: "Get notified for every transaction on your account" },
    { key: "security" as const, title: "Security Alerts", desc: "Login attempts, password changes, and suspicious activity" },
    { key: "marketing" as const, title: "Marketing", desc: "New products, features, and special offers" },
    { key: "reminders" as const, title: "Payment Reminders", desc: "Upcoming bill payments and due dates" },
    { key: "promotions" as const, title: "Promotions", desc: "Exclusive deals and cashback offers" },
  ];

  return (
    <PageContainer>
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Push Notifications"
          subtitle="Control what notifications you receive"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Mobile Banking", href: "/customer/mobile" },
            { label: "Notifications" },
          ]}
        />
      </motion.div>

      <div className="max-w-2xl space-y-3">
        {categories.map((cat) => (
          <motion.div key={cat.key} variants={dashboardItemVariants}>
            <DashCard>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${prefs[cat.key] ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400" : "bg-gray-100 dark:bg-gray-800 text-gray-400"}`}>
                    <Bell size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{cat.title}</h4>
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">{cat.desc}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggle(cat.key)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${prefs[cat.key] ? "bg-indigo-600" : "bg-gray-300 dark:bg-gray-600"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${prefs[cat.key] ? "translate-x-5" : ""}`} />
                </button>
              </div>
            </DashCard>
          </motion.div>
        ))}

        <DashCard className="mt-6">
          <motion.button
            className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-xs sm:text-sm font-medium"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            Send Test Notification
          </motion.button>
        </DashCard>
      </div>
    </PageContainer>
  );
};
