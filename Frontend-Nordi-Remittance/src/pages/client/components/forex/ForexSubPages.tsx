// ============================================================================
// FOREX SUB-PAGES — Currency Exchange, Live Rates, Alerts, History
// Dark mode + DashboardPrimitives + grey borders + responsive typography
// ============================================================================

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeftRight, TrendingUp, TrendingDown, Bell, Clock,
  DollarSign, Plus, AlertTriangle, RefreshCw,
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

const currencies = ["USD", "EUR", "GBP", "JPY", "CHF", "CAD", "AUD", "NGN", "KES", "ZAR"];

/* ═══════ CURRENCY EXCHANGE ═══════ */
export const CurrencyExchange: React.FC = () => {
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("EUR");
  const [amount, setAmount] = useState("");
  const rate = 0.92; // mock
  const converted = amount ? (parseFloat(amount) * rate).toFixed(2) : "0.00";

  const inputCls =
    "w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors";
  const labelCls = "block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";

  const swap = () => { setFrom(to); setTo(from); };

  return (
    <PageContainer>
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Currency Exchange"
          subtitle="Convert currencies at competitive rates"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Forex", href: "/customer/forex" },
            { label: "Exchange" },
          ]}
        />
      </motion.div>

      <div className="max-w-2xl">
        <DashCard>
          <div className="space-y-5">
            <div>
              <label className={labelCls}>You Send</label>
              <div className="flex gap-3">
                <select value={from} onChange={(e) => setFrom(e.target.value)} className={`${inputCls} w-28`}>
                  {currencies.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className={`${inputCls} flex-1`}
                />
              </div>
            </div>

            <div className="flex justify-center">
              <motion.button
                onClick={swap}
                className="p-3 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
              >
                <ArrowLeftRight size={18} className="text-indigo-600 dark:text-indigo-400" />
              </motion.button>
            </div>

            <div>
              <label className={labelCls}>They Receive</label>
              <div className="flex gap-3">
                <select value={to} onChange={(e) => setTo(e.target.value)} className={`${inputCls} w-28`}>
                  {currencies.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <div className={`${inputCls} flex-1 flex items-center bg-gray-50 dark:bg-gray-800`}>
                  <span className="text-gray-900 dark:text-white font-semibold">{converted}</span>
                </div>
              </div>
            </div>

            <DashCard className="!bg-gray-50 dark:!bg-gray-800/50">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-500 dark:text-gray-400">Exchange Rate</span>
                <span className="font-medium text-gray-900 dark:text-white">1 {from} = {rate} {to}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm mt-2">
                <span className="text-gray-500 dark:text-gray-400">Transfer Fee</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">$0.00</span>
              </div>
            </DashCard>

            <motion.button
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-xs sm:text-sm font-medium"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              Convert Now
            </motion.button>
          </div>
        </DashCard>
      </div>
    </PageContainer>
  );
};

/* ═══════ LIVE RATES ═══════ */
export const LiveRates: React.FC = () => {
  const rates = [
    { pair: "USD/EUR", rate: 0.9200, change: -0.12 },
    { pair: "USD/GBP", rate: 0.7860, change: 0.08 },
    { pair: "USD/JPY", rate: 149.50, change: 0.35 },
    { pair: "USD/CHF", rate: 0.8820, change: -0.05 },
    { pair: "EUR/GBP", rate: 0.8540, change: 0.15 },
    { pair: "USD/NGN", rate: 1580.00, change: 1.20 },
    { pair: "USD/KES", rate: 129.50, change: -0.30 },
    { pair: "EUR/USD", rate: 1.0870, change: 0.10 },
  ];

  return (
    <PageContainer>
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Live Rates"
          subtitle="Real-time currency exchange rates"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Forex", href: "/customer/forex" },
            { label: "Live Rates" },
          ]}
        />
      </motion.div>

      <DashCard padding="none">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">Currency Pairs</h3>
          <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <RefreshCw size={12} /> Updated just now
          </span>
        </div>
        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Pair</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Rate</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">24h Change</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {rates.map((r) => (
                <tr key={r.pair} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{r.pair}</td>
                  <td className="px-4 py-3 text-sm text-right font-mono text-gray-900 dark:text-white">{r.rate.toFixed(4)}</td>
                  <td className={`px-4 py-3 text-sm text-right font-medium ${r.change >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                    <span className="flex items-center justify-end gap-1">
                      {r.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      {r.change >= 0 ? "+" : ""}{r.change.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Trade</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Mobile list */}
        <div className="sm:hidden divide-y divide-gray-100 dark:divide-gray-800">
          {rates.map((r) => (
            <div key={r.pair} className="flex items-center justify-between p-3">
              <div>
                <p className="text-xs font-medium text-gray-900 dark:text-white">{r.pair}</p>
                <p className="text-[10px] font-mono text-gray-500 dark:text-gray-400">{r.rate.toFixed(4)}</p>
              </div>
              <span className={`text-xs font-medium flex items-center gap-1 ${r.change >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                {r.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {r.change >= 0 ? "+" : ""}{r.change.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </DashCard>
    </PageContainer>
  );
};

/* ═══════ CURRENCY ALERTS ═══════ */
export const CurrencyAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState([
    { id: 1, pair: "USD/EUR", target: 0.9000, current: 0.9200, enabled: true },
    { id: 2, pair: "USD/GBP", target: 0.8000, current: 0.7860, enabled: false },
    { id: 3, pair: "EUR/USD", target: 1.1000, current: 1.0870, enabled: true },
  ]);

  const toggle = (id: number) =>
    setAlerts((p) => p.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a)));

  return (
    <PageContainer>
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Currency Alerts"
          subtitle="Get notified when rates hit your target"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Forex", href: "/customer/forex" },
            { label: "Alerts" },
          ]}
          actions={
            <motion.button
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-xs sm:text-sm font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus size={16} /> New Alert
            </motion.button>
          }
        />
      </motion.div>

      {alerts.length === 0 ? (
        <EmptyState title="No Alerts" description="Create a currency alert to get notified when rates change." />
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <motion.div key={alert.id} variants={dashboardItemVariants}>
              <DashCard>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${alert.enabled ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400" : "bg-gray-100 dark:bg-gray-800 text-gray-400"}`}>
                      <Bell size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{alert.pair}</h4>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                          Target: <span className="font-mono font-medium text-gray-900 dark:text-white">{alert.target.toFixed(4)}</span>
                        </span>
                        <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                          Current: <span className="font-mono font-medium text-gray-900 dark:text-white">{alert.current.toFixed(4)}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => toggle(alert.id)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${alert.enabled ? "bg-indigo-600" : "bg-gray-300 dark:bg-gray-600"}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${alert.enabled ? "translate-x-5" : ""}`} />
                  </button>
                </div>
              </DashCard>
            </motion.div>
          ))}
        </div>
      )}
    </PageContainer>
  );
};

/* ═══════ EXCHANGE HISTORY ═══════ */
export const ExchangeHistory: React.FC = () => {
  const history = [
    { date: "Mar 20, 2025", from: "USD", to: "EUR", amount: 1000, rate: 0.9200, received: 920, status: "completed" },
    { date: "Mar 15, 2025", from: "EUR", to: "GBP", amount: 500, rate: 0.8540, received: 427, status: "completed" },
    { date: "Mar 10, 2025", from: "USD", to: "NGN", amount: 200, rate: 1580, received: 316000, status: "completed" },
    { date: "Mar 5, 2025", from: "GBP", to: "USD", amount: 300, rate: 1.2720, received: 381.60, status: "pending" },
  ];

  return (
    <PageContainer>
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Exchange History"
          subtitle="Your past currency exchanges"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Forex", href: "/customer/forex" },
            { label: "History" },
          ]}
        />
      </motion.div>

      <DashCard padding="none">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">Exchange History</h3>
        </div>
        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50">
                {["Date", "From", "To", "Amount", "Rate", "Received", "Status"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {history.map((h, i) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{h.date}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{h.from}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{h.to}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{h.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-600 dark:text-gray-300">{h.rate}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{h.received.toLocaleString()}</td>
                  <td className="px-4 py-3"><StatusBadge status={h.status as any} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Mobile */}
        <div className="sm:hidden divide-y divide-gray-100 dark:divide-gray-800">
          {history.map((h, i) => (
            <div key={i} className="p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-900 dark:text-white">{h.from} → {h.to}</span>
                <StatusBadge status={h.status as any} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-500 dark:text-gray-400">{h.date}</span>
                <span className="text-xs font-medium text-gray-900 dark:text-white">{h.amount} → {h.received.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </DashCard>
    </PageContainer>
  );
};
