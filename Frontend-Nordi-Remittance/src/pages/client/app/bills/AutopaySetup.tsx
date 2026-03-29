// ============================================================================
// BILLS SUB-PAGES — Pay Bills, Scheduled, Utilities, Autopay
// Dark mode + DashboardPrimitives + grey borders + responsive typography
// ============================================================================

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Zap, Droplets, Wifi, Flame, Shield, Phone, Search,
  Calendar, Clock, Plus, ToggleLeft, ToggleRight,
  Receipt, CreditCard, CheckCircle2, AlertTriangle,
} from "@constants/icons";
import PageHeader from "@components/shared/PageHeader";
import { EmptyState } from "@components/shared/EmptyState";
import {
  PageContainer, DashCard, StatCard, StatsGrid, StatusBadge,
} from "@components/shared/DashboardPrimitives";
import { StatsGridSkeleton } from "@components/skeletons";
import { dashboardItemVariants } from "@core/animation/Animation";
import { useUIStore } from "@store/ui.store";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);


const AutopaySetup: React.FC = () => {
  const [rules, setRules] = useState([
    { id: 1, name: "SpeedNet Fiber", amount: 79.99, day: 1, enabled: true },
    { id: 2, name: "City Power Co.", amount: 150.00, day: 15, enabled: true },
    { id: 3, name: "AquaWorks", amount: 65.00, day: 10, enabled: false },
  ]);

  const toggle = (id: number) =>
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));

  return (
    <PageContainer>
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Autopay Setup"
          subtitle="Automate your recurring bill payments"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Bills & Payments", href: "/customer/bills" },
            { label: "Autopay" },
          ]}
          actions={
            <motion.button
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-xs sm:text-sm font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus size={16} /> Add Autopay
            </motion.button>
          }
        />
      </motion.div>

      <DashCard className="mb-6">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 mt-0.5">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">How Autopay Works</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Set up automatic payments for your recurring bills. We'll debit your account on the specified day each month. You'll receive a notification before each payment.
            </p>
          </div>
        </div>
      </DashCard>

      <div className="space-y-3">
        {rules.map((rule) => (
          <motion.div key={rule.id} variants={dashboardItemVariants}>
            <DashCard>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${rule.enabled ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400" : "bg-gray-100 dark:bg-gray-800 text-gray-400"}`}>
                    <CreditCard size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{rule.name}</h4>
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                      {fmt(rule.amount)} • Day {rule.day} of each month
                    </p>
                  </div>
                </div>
                <button onClick={() => toggle(rule.id)} className="focus:outline-none">
                  {rule.enabled ? (
                    <ToggleRight size={28} className="text-indigo-600 dark:text-indigo-400" />
                  ) : (
                    <ToggleLeft size={28} className="text-gray-400 dark:text-gray-600" />
                  )}
                </button>
              </div>
            </DashCard>
          </motion.div>
        ))}
      </div>
    </PageContainer>
  );
};

export default AutopaySetup;
