// ============================================================================
// BILLS SUB-PAGES — Pay Bills, Scheduled, Utilities, Autopay
// ============================================================================

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Receipt, Calendar, Zap, Clock, ChevronRight, Search,
  Wifi, Smartphone, Droplets, Flame, Building2, Tv,
  Shield, Plus, CheckCircle2, AlertTriangle,
} from "lucide-react";
import PageHeader from "@components/shared/PageHeader";
import { EmptyState } from "@components/shared/EmptyState";
import { StatsGridSkeleton } from "@components/skeletons";
import { useUIStore } from "@store/ui.store";

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);

// ========================
// PAY BILLS
// ========================
export const PayBills: React.FC = () => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState("");

  const billers = [
    { id: "1", name: "Electric Company", category: "Electricity", icon: <Zap size={20} />, color: "bg-amber-50 text-amber-600", lastAmount: 125.50 },
    { id: "2", name: "Water Works", category: "Water", icon: <Droplets size={20} />, color: "bg-blue-50 text-blue-600", lastAmount: 48.00 },
    { id: "3", name: "Gas Utility", category: "Gas", icon: <Flame size={20} />, color: "bg-orange-50 text-orange-600", lastAmount: 67.30 },
    { id: "4", name: "Internet Plus", category: "Internet", icon: <Wifi size={20} />, color: "bg-indigo-50 text-indigo-600", lastAmount: 79.99 },
    { id: "5", name: "Mobile Carrier", category: "Phone", icon: <Smartphone size={20} />, color: "bg-emerald-50 text-emerald-600", lastAmount: 55.00 },
    { id: "6", name: "Cable TV", category: "Entertainment", icon: <Tv size={20} />, color: "bg-purple-50 text-purple-600", lastAmount: 89.99 },
    { id: "7", name: "Insurance Co.", category: "Insurance", icon: <Shield size={20} />, color: "bg-rose-50 text-rose-600", lastAmount: 200.00 },
    { id: "8", name: "Rent/Mortgage", category: "Housing", icon: <Building2 size={20} />, color: "bg-gray-50 text-gray-600", lastAmount: 1500.00 },
  ];

  const filtered = billers.filter((b) => !search || b.name.toLowerCase().includes(search.toLowerCase()) || b.category.toLowerCase().includes(search.toLowerCase()));

  return (
    <motion.div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-full" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <PageHeader title="Pay Bills" subtitle="Make quick bill payments"
          breadcrumbs={[{ label: "Dashboard", href: "/customer/dashboard" }, { label: "Bills & Pay", href: "/customer/bills" }, { label: "Pay" }]} />
      </motion.div>

      <motion.div className="bg-white rounded-xl shadow-sm p-4 mb-6" variants={itemVariants}>
        <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input placeholder="Search billers..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" /></div>
      </motion.div>

      <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" variants={containerVariants}>
        {filtered.map((biller) => (
          <motion.div key={biller.id} variants={itemVariants}
            className={`bg-white rounded-xl shadow-sm p-5 cursor-pointer transition-all border-2 ${selected === biller.id ? "border-indigo-500 shadow-md" : "border-transparent hover:shadow-md"}`}
            whileHover={{ y: -3 }} onClick={() => setSelected(biller.id)}>
            <div className={`p-3 rounded-xl ${biller.color} w-fit mb-3`}>{biller.icon}</div>
            <h3 className="font-semibold text-gray-900 text-sm">{biller.name}</h3>
            <p className="text-xs text-gray-500">{biller.category}</p>
            <p className="text-sm font-bold text-indigo-900 mt-2">Last: {fmt(biller.lastAmount)}</p>
          </motion.div>
        ))}
      </motion.div>

      {selected && (
        <motion.div className="mt-6 bg-white rounded-xl shadow-sm p-6 max-w-lg" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h3 className="font-semibold text-indigo-900 mb-4">Payment Details</h3>
          <div className="space-y-4">
            <div><label className="text-sm font-medium text-gray-700 mb-1.5 block">Account/Reference Number</label><input className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Enter account number" /></div>
            <div><label className="text-sm font-medium text-gray-700 mb-1.5 block">Amount</label><input type="number" className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="0.00" /></div>
            <motion.button className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-medium" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>Pay Now</motion.button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

// ========================
// SCHEDULED PAYMENTS
// ========================
export const ScheduledPayments: React.FC = () => {
  const show = useUIStore((s) => s.preferences.showBalances);

  const scheduled = [
    { id: "1", name: "Electric Company", amount: 125.50, nextDate: "2024-02-05", frequency: "Monthly", status: "active" },
    { id: "2", name: "Internet Plus", amount: 79.99, nextDate: "2024-02-10", frequency: "Monthly", status: "active" },
    { id: "3", name: "Insurance Co.", amount: 200.00, nextDate: "2024-03-01", frequency: "Quarterly", status: "active" },
    { id: "4", name: "Rent Payment", amount: 1500.00, nextDate: "2024-02-01", frequency: "Monthly", status: "paused" },
  ];

  return (
    <motion.div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-full" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <PageHeader title="Scheduled Payments" subtitle="Manage your upcoming bill payments"
          breadcrumbs={[{ label: "Dashboard", href: "/customer/dashboard" }, { label: "Bills & Pay", href: "/customer/bills" }, { label: "Scheduled" }]} />
      </motion.div>

      <motion.div className="space-y-4 max-w-3xl" variants={containerVariants}>
        {scheduled.map((item) => (
          <motion.div key={item.id} className="bg-white rounded-xl shadow-sm p-5 flex items-center justify-between" variants={itemVariants}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${item.status === "active" ? "bg-indigo-50 text-indigo-600" : "bg-gray-100 text-gray-400"}`}><Calendar size={20} /></div>
              <div>
                <h3 className="font-semibold text-gray-900">{item.name}</h3>
                <p className="text-sm text-gray-500">{item.frequency} · Next: {new Date(item.nextDate).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-lg font-bold text-indigo-900">{show ? fmt(item.amount) : "••••••"}</p>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${item.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>{item.status}</span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

// ========================
// UTILITIES
// ========================
export const Utilities: React.FC = () => {
  const categories = [
    { name: "Electricity", icon: <Zap size={24} />, color: "from-amber-400 to-amber-600", providers: 12, popular: "City Power Co." },
    { name: "Water", icon: <Droplets size={24} />, color: "from-blue-400 to-blue-600", providers: 5, popular: "Metro Water" },
    { name: "Gas", icon: <Flame size={24} />, color: "from-orange-400 to-orange-600", providers: 8, popular: "National Gas" },
    { name: "Internet", icon: <Wifi size={24} />, color: "from-indigo-400 to-indigo-600", providers: 15, popular: "FiberNet" },
    { name: "Phone", icon: <Smartphone size={24} />, color: "from-emerald-400 to-emerald-600", providers: 10, popular: "Mobile One" },
    { name: "Television", icon: <Tv size={24} />, color: "from-purple-400 to-purple-600", providers: 7, popular: "Stream TV" },
  ];

  return (
    <motion.div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-full" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <PageHeader title="Utilities" subtitle="Browse and pay utility bills"
          breadcrumbs={[{ label: "Dashboard", href: "/customer/dashboard" }, { label: "Bills & Pay", href: "/customer/bills" }, { label: "Utilities" }]} />
      </motion.div>

      <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" variants={containerVariants}>
        {categories.map((cat) => (
          <motion.div key={cat.name} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer" variants={itemVariants} whileHover={{ y: -3 }}>
            <div className={`inline-flex p-3.5 rounded-xl bg-gradient-to-br ${cat.color} text-white mb-4`}>{cat.icon}</div>
            <h3 className="text-lg font-semibold text-gray-900">{cat.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{cat.providers} providers available</p>
            <p className="text-xs text-gray-400 mt-2">Popular: {cat.popular}</p>
            <button className="mt-4 text-sm text-indigo-600 font-medium flex items-center gap-1 hover:text-indigo-700">Browse <ChevronRight size={14} /></button>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

// ========================
// AUTOPAY SETUP
// ========================
export const AutopaySetup: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    { title: "Never Miss a Payment", desc: "Bills are paid automatically before the due date", icon: <CheckCircle2 size={20} /> },
    { title: "Set Spending Limits", desc: "Control maximum auto-debit amounts per biller", icon: <Shield size={20} /> },
    { title: "Smart Reminders", desc: "Get notified before each autopay deduction", icon: <Clock size={20} /> },
    { title: "Easy Management", desc: "Pause, modify, or cancel any autopay anytime", icon: <Zap size={20} /> },
  ];

  return (
    <motion.div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-full" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <PageHeader title="Autopay Setup" subtitle="Automate your bill payments"
          breadcrumbs={[{ label: "Dashboard", href: "/customer/dashboard" }, { label: "Bills & Pay", href: "/customer/bills" }, { label: "Autopay" }]} />
      </motion.div>

      <div className="max-w-3xl">
        <motion.div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-8 text-white mb-6" variants={itemVariants}>
          <h2 className="text-2xl font-bold mb-2">Set Up Autopay</h2>
          <p className="text-indigo-200 text-sm mb-6">Never worry about missing a bill payment again. Set up automatic payments for all your recurring bills.</p>
          <motion.button onClick={() => navigate("/customer/bills/pay")} className="px-6 py-3 bg-white text-indigo-700 rounded-xl text-sm font-semibold" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            Get Started
          </motion.button>
        </motion.div>

        <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-4" variants={containerVariants}>
          {features.map((f) => (
            <motion.div key={f.title} className="bg-white rounded-xl shadow-sm p-5 flex items-start gap-4" variants={itemVariants}>
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">{f.icon}</div>
              <div><h3 className="font-semibold text-gray-900 text-sm">{f.title}</h3><p className="text-xs text-gray-500 mt-1">{f.desc}</p></div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};
