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
} from "lucide-react";
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

/* ═══════ PAY BILLS ═══════ */
export const PayBills: React.FC = () => {
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

/* ═══════ SCHEDULED PAYMENTS ═══════ */
export const ScheduledPayments: React.FC = () => {
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

/* ═══════ UTILITIES ═══════ */
export const Utilities: React.FC = () => {
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

/* ═══════ AUTOPAY SETUP ═══════ */
export const AutopaySetup: React.FC = () => {
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
