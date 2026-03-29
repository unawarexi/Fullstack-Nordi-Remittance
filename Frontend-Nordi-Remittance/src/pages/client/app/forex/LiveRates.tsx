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


const LiveRates: React.FC = () => {
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

export default LiveRates;
