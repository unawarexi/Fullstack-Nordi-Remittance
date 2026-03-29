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


const ScheduledPayments: React.FC = () => {
  const scheduled = [
    { name: "SpeedNet Fiber", amount: 79.99, nextDate: "Apr 1, 2025", frequency: "Monthly", status: "active" },
    { name: "City Power Co.", amount: 142.50, nextDate: "Apr 15, 2025", frequency: "Monthly", status: "active" },
    { name: "AquaWorks", amount: 65.00, nextDate: "Apr 10, 2025", frequency: "Monthly", status: "active" },
    { name: "Home Insurance", amount: 500.00, nextDate: "Jun 1, 2025", frequency: "Quarterly", status: "active" },
  ];

  return (
    <PageContainer>
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Scheduled Payments"
          subtitle="Your upcoming and recurring payments"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Bills & Payments", href: "/customer/bills" },
            { label: "Scheduled" },
          ]}
        />
      </motion.div>

      <StatsGrid cols={3}>
        <StatCard label="Next Payment" value="Apr 1" icon={<Calendar size={20} />} iconColor="from-indigo-500 to-purple-500" />
        <StatCard label="Monthly Total" value={fmt(scheduled.reduce((a, s) => a + (s.frequency === "Monthly" ? s.amount : 0), 0))} icon={<CreditCard size={20} />} iconColor="from-emerald-500 to-teal-500" />
        <StatCard label="Active Schedules" value={String(scheduled.length)} icon={<Clock size={20} />} iconColor="from-amber-500 to-orange-500" />
      </StatsGrid>

      <DashCard padding="none" className="mt-6">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">Upcoming Payments</h3>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {scheduled.map((s) => (
            <div key={s.name} className="flex items-center justify-between p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                  <Calendar size={16} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{s.name}</h4>
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Next: {s.nextDate} • {s.frequency}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">{fmt(s.amount)}</p>
                <StatusBadge status="active" />
              </div>
            </div>
          ))}
        </div>
      </DashCard>
    </PageContainer>
  );
};

export default ScheduledPayments;
