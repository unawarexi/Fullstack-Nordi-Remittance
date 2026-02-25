// ============================================================================
// FOREX SUB-PAGES — Exchange, Live Rates, Alerts, History
// ============================================================================

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeftRight, TrendingUp, Bell, Clock, RefreshCw,
  Search, ChevronRight, ArrowUp, ArrowDown, Plus,
  DollarSign, Globe, BarChart3, Star,
} from "lucide-react";
import PageHeader from "@components/shared/PageHeader";
import { EmptyState } from "@components/shared/EmptyState";
import { useUIStore } from "@store/ui.store";

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);

const currencies = [
  { code: "EUR", name: "Euro", flag: "🇪🇺", rate: 0.9234, change: 0.15 },
  { code: "GBP", name: "British Pound", flag: "🇬🇧", rate: 0.7912, change: -0.08 },
  { code: "JPY", name: "Japanese Yen", flag: "🇯🇵", rate: 148.52, change: 0.32 },
  { code: "CAD", name: "Canadian Dollar", flag: "🇨🇦", rate: 1.3456, change: 0.05 },
  { code: "AUD", name: "Australian Dollar", flag: "🇦🇺", rate: 1.5432, change: -0.12 },
  { code: "CHF", name: "Swiss Franc", flag: "🇨🇭", rate: 0.8765, change: 0.02 },
  { code: "CNY", name: "Chinese Yuan", flag: "🇨🇳", rate: 7.2345, change: -0.18 },
  { code: "INR", name: "Indian Rupee", flag: "🇮🇳", rate: 83.12, change: 0.22 },
  { code: "NOK", name: "Norwegian Krone", flag: "🇳🇴", rate: 10.52, change: -0.05 },
  { code: "SEK", name: "Swedish Krona", flag: "🇸🇪", rate: 10.34, change: 0.10 },
];

// ========================
// CURRENCY EXCHANGE
// ========================
export const CurrencyExchange: React.FC = () => {
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [amount, setAmount] = useState("1000");

  const rate = currencies.find((c) => c.code === toCurrency)?.rate || 1;
  const converted = Number(amount) * rate;

  return (
    <motion.div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-full" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <PageHeader title="Currency Exchange" subtitle="Convert currencies at competitive rates"
          breadcrumbs={[{ label: "Dashboard", href: "/customer/dashboard" }, { label: "Forex", href: "/customer/forex" }, { label: "Exchange" }]} />
      </motion.div>

      <div className="max-w-2xl">
        <motion.div className="bg-white rounded-xl shadow-sm p-6" variants={itemVariants}>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">You Send</label>
              <div className="flex gap-3">
                <select value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value)} className="px-4 py-2.5 border rounded-xl text-sm font-medium bg-gray-50 focus:ring-2 focus:ring-indigo-500">
                  <option value="USD">🇺🇸 USD</option>
                  {currencies.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                </select>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="flex-1 px-4 py-2.5 border rounded-xl text-right text-xl font-bold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
            </div>

            <div className="flex justify-center">
              <motion.button className="p-3 bg-indigo-50 rounded-full text-indigo-600" whileHover={{ rotate: 180 }} transition={{ duration: 0.3 }}><ArrowLeftRight size={20} /></motion.button>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">They Receive</label>
              <div className="flex gap-3">
                <select value={toCurrency} onChange={(e) => setToCurrency(e.target.value)} className="px-4 py-2.5 border rounded-xl text-sm font-medium bg-gray-50 focus:ring-2 focus:ring-indigo-500">
                  {currencies.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                </select>
                <div className="flex-1 px-4 py-2.5 border rounded-xl text-right text-xl font-bold text-indigo-900 bg-indigo-50/50">{converted.toFixed(2)}</div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
              <span className="text-sm text-gray-500">Exchange Rate</span>
              <span className="text-sm font-semibold text-gray-900">1 {fromCurrency} = {rate.toFixed(4)} {toCurrency}</span>
            </div>

            <motion.button className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-medium" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
              Exchange Now
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

// ========================
// LIVE RATES
// ========================
export const LiveRates: React.FC = () => {
  const [search, setSearch] = useState("");
  const [baseCurrency] = useState("USD");

  const filtered = currencies.filter((c) => !search || c.code.toLowerCase().includes(search.toLowerCase()) || c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <motion.div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-full" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <PageHeader title="Live Rates" subtitle={`Real-time exchange rates (Base: ${baseCurrency})`}
          breadcrumbs={[{ label: "Dashboard", href: "/customer/dashboard" }, { label: "Forex", href: "/customer/forex" }, { label: "Rates" }]} />
      </motion.div>

      <motion.div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex items-center gap-3" variants={itemVariants}>
        <div className="relative flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input placeholder="Search currencies..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" /></div>
        <button className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors"><RefreshCw size={16} /></button>
      </motion.div>

      <motion.div className="bg-white rounded-xl shadow-sm overflow-hidden" variants={itemVariants}>
        <table className="w-full">
          <thead><tr className="border-b border-gray-200 bg-gray-50">
            <th className="text-left text-xs font-medium text-gray-500 p-4">Currency</th>
            <th className="text-right text-xs font-medium text-gray-500 p-4">Rate</th>
            <th className="text-right text-xs font-medium text-gray-500 p-4">24h Change</th>
            <th className="text-right text-xs font-medium text-gray-500 p-4">Action</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((c) => {
              const up = c.change >= 0;
              return (
                <tr key={c.code} className="hover:bg-indigo-50/30 transition-colors">
                  <td className="p-4"><div className="flex items-center gap-3"><span className="text-xl">{c.flag}</span><div><p className="text-sm font-semibold text-gray-900">{c.code}</p><p className="text-xs text-gray-500">{c.name}</p></div></div></td>
                  <td className="p-4 text-right text-sm font-bold text-gray-900">{c.rate < 10 ? c.rate.toFixed(4) : c.rate.toFixed(2)}</td>
                  <td className={`p-4 text-right text-sm font-medium ${up ? "text-emerald-600" : "text-rose-600"}`}>
                    <span className="flex items-center justify-end gap-1">{up ? <ArrowUp size={12} /> : <ArrowDown size={12} />}{Math.abs(c.change).toFixed(2)}%</span>
                  </td>
                  <td className="p-4 text-right">
                    <button className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium hover:bg-indigo-100 transition-colors">Exchange</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </motion.div>
    </motion.div>
  );
};

// ========================
// CURRENCY ALERTS
// ========================
export const CurrencyAlerts: React.FC = () => {
  const alerts = [
    { id: "1", pair: "USD/EUR", target: 0.90, condition: "below", current: 0.9234, active: true },
    { id: "2", pair: "USD/GBP", target: 0.80, condition: "above", current: 0.7912, active: true },
    { id: "3", pair: "USD/JPY", target: 150.00, condition: "above", current: 148.52, active: false },
  ];

  return (
    <motion.div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-full" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <PageHeader title="Currency Alerts" subtitle="Get notified when rates hit your targets"
          breadcrumbs={[{ label: "Dashboard", href: "/customer/dashboard" }, { label: "Forex", href: "/customer/forex" }, { label: "Alerts" }]}
          actions={<motion.button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-sm text-sm font-medium" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}><Plus size={16} /> New Alert</motion.button>} />
      </motion.div>

      <motion.div className="space-y-4 max-w-3xl" variants={containerVariants}>
        {alerts.map((alert) => (
          <motion.div key={alert.id} className="bg-white rounded-xl shadow-sm p-5 flex items-center justify-between" variants={itemVariants}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${alert.active ? "bg-indigo-50 text-indigo-600" : "bg-gray-100 text-gray-400"}`}><Bell size={20} /></div>
              <div>
                <h3 className="font-semibold text-gray-900">{alert.pair}</h3>
                <p className="text-sm text-gray-500">Alert when rate goes {alert.condition} {alert.target.toFixed(4)}</p>
                <p className="text-xs text-gray-400">Current: {alert.current.toFixed(4)}</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked={alert.active} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
            </label>
          </motion.div>
        ))}

        {alerts.length === 0 && (
          <div className="p-8"><EmptyState title="No Alerts" description="Create alerts to be notified of rate changes." /></div>
        )}
      </motion.div>
    </motion.div>
  );
};

// ========================
// EXCHANGE HISTORY
// ========================
export const ExchangeHistory: React.FC = () => {
  const show = useUIStore((s) => s.preferences.showBalances);

  const history = [
    { id: "1", from: "USD", to: "EUR", fromAmount: 1000, toAmount: 923.40, rate: 0.9234, date: "2024-01-28", status: "completed" },
    { id: "2", from: "USD", to: "GBP", fromAmount: 2500, toAmount: 1978.00, rate: 0.7912, date: "2024-01-25", status: "completed" },
    { id: "3", from: "EUR", to: "USD", fromAmount: 500, toAmount: 541.50, rate: 1.0830, date: "2024-01-20", status: "completed" },
    { id: "4", from: "USD", to: "JPY", fromAmount: 3000, toAmount: 445560, rate: 148.52, date: "2024-01-15", status: "completed" },
    { id: "5", from: "USD", to: "CAD", fromAmount: 1500, toAmount: 2018.40, rate: 1.3456, date: "2024-01-10", status: "completed" },
  ];

  return (
    <motion.div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-full" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <PageHeader title="Exchange History" subtitle="Your past currency exchanges"
          breadcrumbs={[{ label: "Dashboard", href: "/customer/dashboard" }, { label: "Forex", href: "/customer/forex" }, { label: "History" }]} />
      </motion.div>

      <motion.div className="bg-white rounded-xl shadow-sm overflow-hidden" variants={itemVariants}>
        <table className="w-full">
          <thead><tr className="border-b border-gray-200 bg-gray-50">
            <th className="text-left text-xs font-medium text-gray-500 p-4">Date</th>
            <th className="text-left text-xs font-medium text-gray-500 p-4">From</th>
            <th className="text-left text-xs font-medium text-gray-500 p-4">To</th>
            <th className="text-right text-xs font-medium text-gray-500 p-4">Rate</th>
            <th className="text-right text-xs font-medium text-gray-500 p-4">Status</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-50">
            {history.map((h) => (
              <tr key={h.id} className="hover:bg-indigo-50/30 transition-colors">
                <td className="p-4 text-sm text-gray-600">{new Date(h.date).toLocaleDateString()}</td>
                <td className="p-4"><p className="text-sm font-semibold text-gray-900">{show ? h.fromAmount.toLocaleString() : "••••"} {h.from}</p></td>
                <td className="p-4"><p className="text-sm font-semibold text-indigo-900">{show ? h.toAmount.toLocaleString() : "••••"} {h.to}</p></td>
                <td className="p-4 text-sm text-gray-600 text-right">{h.rate.toFixed(4)}</td>
                <td className="p-4 text-right"><span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 capitalize">{h.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </motion.div>
  );
};
