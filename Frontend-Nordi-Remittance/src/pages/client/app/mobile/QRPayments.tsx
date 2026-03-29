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


const QRPayments: React.FC = () => {
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

export default QRPayments;
