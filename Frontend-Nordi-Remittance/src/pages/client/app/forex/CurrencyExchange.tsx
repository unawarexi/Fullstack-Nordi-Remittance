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


const CurrencyExchange: React.FC = () => {
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

export default CurrencyExchange;
