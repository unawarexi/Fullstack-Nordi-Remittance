// ============================================================================
// ACCOUNTS SUB-PAGES — Savings, Current, Fixed Deposits, Statements
// Dark mode + DashboardPrimitives + grey borders + responsive typography
// ============================================================================

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  PiggyBank, Building2, Lock, Download, FileText,
  TrendingUp, Percent, Shield, Plus,
} from "@constants/icons";
import PageHeader from "@components/shared/PageHeader";
import { EmptyState } from "@components/shared/EmptyState";
import {
  PageContainer, DashCard, StatCard, StatsGrid, SectionHeader, StatusBadge,
} from "@components/shared/DashboardPrimitives";
import { StatsGridSkeleton, FormSkeleton } from "@components/skeletons";
import { dashboardItemVariants } from "@core/animation/Animation";
import { useClientWallets } from "../../domain/useAccountsDomain";
import { useUIStore } from "@store/ui.store";

const fmt = (n: number, c = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: c, minimumFractionDigits: 2 }).format(n);


const AccountStatements: React.FC = () => {
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [format, setFormat] = useState("pdf");
  const { wallets, isLoading } = useClientWallets();
  const [selectedAccount, setSelectedAccount] = useState("");

  const inputCls =
    "w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors";
  const labelCls = "block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";

  return (
    <PageContainer>
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Account Statements"
          subtitle="Download and view your account statements"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Accounts", href: "/customer/accounts" },
            { label: "Statements" },
          ]}
        />
      </motion.div>

      {isLoading ? (
        <FormSkeleton fields={4} />
      ) : (
        <div className="max-w-2xl">
          <DashCard>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Generate Statement
            </h3>
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Select Account</label>
                <select value={selectedAccount} onChange={(e) => setSelectedAccount(e.target.value)} className={inputCls}>
                  <option value="">Choose an account</option>
                  {wallets.map((w: any, i: number) => (
                    <option key={i} value={w._id || w.id}>
                      {w.name || `Account ${i + 1}`} — {w.accountNumber ? `•••• ${w.accountNumber.slice(-4)}` : w.currency}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>From Date</label>
                  <input type="date" value={dateRange.from} onChange={(e) => setDateRange((p) => ({ ...p, from: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>To Date</label>
                  <input type="date" value={dateRange.to} onChange={(e) => setDateRange((p) => ({ ...p, to: e.target.value }))} className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Format</label>
                <div className="flex gap-3">
                  {["pdf", "csv", "excel"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFormat(f)}
                      className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                        format === f
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      {f.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <motion.button
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-xs sm:text-sm font-medium mt-4"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Download size={16} /> Generate Statement
              </motion.button>
            </div>
          </DashCard>

          <DashCard className="mt-6">
            <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white mb-4">
              Recent Statements
            </h3>
            <div className="space-y-2">
              {["March 2025", "February 2025", "January 2025"].map((month) => (
                <div
                  key={month}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                      <FileText size={16} />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{month} Statement</p>
                      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Generated automatically</p>
                    </div>
                  </div>
                  <Download size={16} className="text-indigo-500 dark:text-indigo-400" />
                </div>
              ))}
            </div>
          </DashCard>
        </div>
      )}
    </PageContainer>
  );
};

export default AccountStatements;
