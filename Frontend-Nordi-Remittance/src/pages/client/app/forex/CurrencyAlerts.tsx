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


const CurrencyAlerts: React.FC = () => {
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

export default CurrencyAlerts;
