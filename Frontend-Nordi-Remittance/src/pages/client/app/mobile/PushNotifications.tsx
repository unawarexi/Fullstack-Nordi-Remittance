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
} from "@constants/icons";
import PageHeader from "@components/shared/PageHeader";
import {
  PageContainer, DashCard,
} from "@components/shared/DashboardPrimitives";
import { dashboardItemVariants } from "@core/animation/Animation";


const PushNotifications: React.FC = () => {
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

export default PushNotifications;
