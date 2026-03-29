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


const PayBills: React.FC = () => {
  const [search, setSearch] = useState("");

  const categories = [
    { name: "Electricity", icon: Zap, gradient: "from-amber-500 to-yellow-500" },
    { name: "Water", icon: Droplets, gradient: "from-cyan-500 to-blue-500" },
    { name: "Internet", icon: Wifi, gradient: "from-indigo-500 to-purple-500" },
    { name: "Gas", icon: Flame, gradient: "from-orange-500 to-red-500" },
    { name: "Insurance", icon: Shield, gradient: "from-emerald-500 to-teal-500" },
    { name: "Phone", icon: Phone, gradient: "from-pink-500 to-rose-500" },
  ];

  const popularBillers = [
    { name: "City Power Co.", category: "Electricity", lastPaid: "Mar 15", amount: 142.50 },
    { name: "AquaWorks", category: "Water", lastPaid: "Mar 10", amount: 65.00 },
    { name: "SpeedNet Fiber", category: "Internet", lastPaid: "Mar 1", amount: 79.99 },
    { name: "SafeGuard Insurance", category: "Insurance", lastPaid: "Feb 28", amount: 250.00 },
  ];

  const filtered = popularBillers.filter(
    (b) => !search || b.name.toLowerCase().includes(search.toLowerCase()) || b.category.toLowerCase().includes(search.toLowerCase())
  );

  const inputCls =
    "w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors";

  return (
    <PageContainer>
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Pay Bills"
          subtitle="Quick and easy bill payments"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Bills & Payments", href: "/customer/bills" },
            { label: "Pay Bills" },
          ]}
        />
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6">
        {categories.map((cat) => (
          <motion.div key={cat.name} variants={dashboardItemVariants}>
            <DashCard className="cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors text-center py-5">
              <div className={`w-12 h-12 mx-auto bg-gradient-to-br ${cat.gradient} rounded-2xl flex items-center justify-center text-white mb-3`}>
                <cat.icon size={20} />
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{cat.name}</p>
            </DashCard>
          </motion.div>
        ))}
      </div>

      <DashCard className="mb-6">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search billers…" className={`${inputCls} pl-10`} />
        </div>
      </DashCard>

      <DashCard padding="none">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">Popular Billers</h3>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {filtered.map((b) => (
            <div key={b.name} className="flex items-center justify-between p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                  <Receipt size={16} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{b.name}</h4>
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">{b.category} • Last paid: {b.lastPaid}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">{fmt(b.amount)}</span>
                <motion.button
                  className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-xs font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Pay
                </motion.button>
              </div>
            </div>
          ))}
        </div>
      </DashCard>
    </PageContainer>
  );
};

export default PayBills;
