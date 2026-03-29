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


const MobileApp: React.FC = () => {
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

export default MobileApp;
