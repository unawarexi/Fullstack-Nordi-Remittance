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


const Utilities: React.FC = () => {
  const utilityGroups = [
    {
      type: "Electricity",
      icon: Zap,
      color: "from-amber-500 to-yellow-500",
      providers: [
        { name: "City Power Co.", account: "EP-2839401", lastPaid: "Mar 15, 2025" },
        { name: "Green Energy Ltd.", account: "GE-0019283", lastPaid: "Feb 28, 2025" },
      ],
    },
    {
      type: "Water",
      icon: Droplets,
      color: "from-cyan-500 to-blue-500",
      providers: [
        { name: "AquaWorks", account: "AW-8827364", lastPaid: "Mar 10, 2025" },
      ],
    },
    {
      type: "Internet & Phone",
      icon: Wifi,
      color: "from-indigo-500 to-purple-500",
      providers: [
        { name: "SpeedNet Fiber", account: "SN-5501982", lastPaid: "Mar 1, 2025" },
        { name: "MobilePlus", account: "MP-7728391", lastPaid: "Mar 5, 2025" },
      ],
    },
  ];

  return (
    <PageContainer>
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Utilities"
          subtitle="Manage your utility service payments"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Bills & Payments", href: "/customer/bills" },
            { label: "Utilities" },
          ]}
        />
      </motion.div>

      <div className="space-y-6">
        {utilityGroups.map((group) => (
          <motion.div key={group.type} variants={dashboardItemVariants}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-8 h-8 bg-gradient-to-br ${group.color} rounded-xl flex items-center justify-center text-white`}>
                <group.icon size={16} />
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">{group.type}</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {group.providers.map((p) => (
                <DashCard key={p.name}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{p.name}</h4>
                      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                        {p.account} • Last paid: {p.lastPaid}
                      </p>
                    </div>
                    <motion.button
                      className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-xs font-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Pay Now
                    </motion.button>
                  </div>
                </DashCard>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </PageContainer>
  );
};

export default Utilities;
