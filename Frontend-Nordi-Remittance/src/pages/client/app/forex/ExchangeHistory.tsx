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


const ExchangeHistory: React.FC = () => {
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

export default ExchangeHistory;
