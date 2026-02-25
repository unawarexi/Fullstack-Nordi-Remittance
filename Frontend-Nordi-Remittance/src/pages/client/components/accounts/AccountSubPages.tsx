// ============================================================================
// ACCOUNTS SUB-PAGES — Savings, Current, Fixed Deposits, Statements
// ============================================================================

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  PiggyBank, Building2, Briefcase, Download, FileText,
  TrendingUp, DollarSign, ArrowUpRight, ArrowDownLeft,
  Calendar, Filter, ChevronRight, Plus, Clock,
  Shield, Percent, Lock,
} from "lucide-react";
import PageHeader from "@components/shared/PageHeader";
import { EmptyState } from "@components/shared/EmptyState";
import { StatsGridSkeleton, TransactionListSkeleton, FormSkeleton } from "@components/skeletons";
import { useWallets, useAccountSummary, useBalanceHistory } from "@hooks/queries/useAccounts";
import { useTransactions } from "@hooks/queries/useTransactions";
import { useUIStore } from "@store/ui.store";

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const fmt = (n: number, c = "USD") => new Intl.NumberFormat("en-US", { style: "currency", currency: c, minimumFractionDigits: 2 }).format(n);

// ========================
// SAVINGS ACCOUNT
// ========================
export const SavingsAccount: React.FC = () => {
  const navigate = useNavigate();
  const show = useUIStore((s) => s.preferences.showBalances);
  const { data: walletsData, isLoading } = useWallets();
  const allWallets = (walletsData as any)?.data ? (walletsData as any).data : walletsData || [];
  const wallets = allWallets.filter((w: any) => (w.type || w.accountType || "").toLowerCase() === "savings");

  return (
    <motion.div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-full" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <PageHeader title="Savings Account" subtitle="Grow your savings with competitive interest rates"
          breadcrumbs={[{ label: "Dashboard", href: "/customer/dashboard" }, { label: "Accounts", href: "/customer/accounts" }, { label: "Savings" }]} />
      </motion.div>

      {isLoading ? <StatsGridSkeleton count={3} /> : (
        <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6" variants={itemVariants}>
          {[
            { label: "Savings Balance", value: show ? fmt(wallets.reduce((a: number, w: any) => a + (w.balance || 0), 0)) : "••••••", icon: <PiggyBank size={20} />, color: "from-emerald-500 to-teal-500" },
            { label: "Interest Earned", value: show ? fmt(wallets.reduce((a: number, w: any) => a + (w.interestEarned || 0), 0)) : "••••••", icon: <Percent size={20} />, color: "from-indigo-500 to-purple-500" },
            { label: "Accounts", value: String(wallets.length), icon: <PiggyBank size={20} />, color: "from-amber-500 to-orange-500" },
          ].map((s) => (
            <motion.div key={s.label} className="bg-white rounded-xl shadow-sm p-5" whileHover={{ y: -2 }}>
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${s.color} text-white w-fit mb-3`}>{s.icon}</div>
              <p className="text-2xl font-bold text-indigo-900">{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>
      )}

      {wallets.length === 0 && !isLoading ? (
        <EmptyState title="No Savings Accounts" description="Open a savings account to start earning interest on your deposits."
          action={{ label: "Open Savings Account", onClick: () => navigate("/customer/accounts") }} />
      ) : (
        <motion.div className="bg-white rounded-xl shadow-sm" variants={itemVariants}>
          <div className="p-4 border-b border-gray-100"><h3 className="font-semibold text-indigo-900">Savings Accounts</h3></div>
          <div className="divide-y divide-gray-50">
            {wallets.map((w: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-4 hover:bg-indigo-50/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600"><PiggyBank size={18} /></div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{w.name || "Savings Account"}</h4>
                    <p className="text-xs text-gray-500">{w.accountNumber ? `•••• ${w.accountNumber.slice(-4)}` : w.currency || "USD"}</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-indigo-900">{show ? fmt(w.balance || 0) : "••••••"}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

// ========================
// CURRENT ACCOUNT
// ========================
export const CurrentAccount: React.FC = () => {
  const navigate = useNavigate();
  const show = useUIStore((s) => s.preferences.showBalances);
  const { data: walletsData, isLoading } = useWallets();
  const allWallets = (walletsData as any)?.data ? (walletsData as any).data : walletsData || [];
  const wallets = allWallets.filter((w: any) => ["current", "checking"].includes((w.type || w.accountType || "").toLowerCase()));

  return (
    <motion.div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-full" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <PageHeader title="Current Account" subtitle="Manage your everyday banking transactions"
          breadcrumbs={[{ label: "Dashboard", href: "/customer/dashboard" }, { label: "Accounts", href: "/customer/accounts" }, { label: "Current" }]} />
      </motion.div>

      {isLoading ? <StatsGridSkeleton count={3} /> : (
        <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6" variants={itemVariants}>
          {[
            { label: "Current Balance", value: show ? fmt(wallets.reduce((a: number, w: any) => a + (w.balance || 0), 0)) : "••••••", icon: <Building2 size={20} />, color: "from-indigo-500 to-purple-500" },
            { label: "Monthly Turnover", value: show ? fmt(wallets.reduce((a: number, w: any) => a + (w.monthlyTurnover || 0), 0)) : "••••••", icon: <TrendingUp size={20} />, color: "from-blue-500 to-cyan-500" },
            { label: "Accounts", value: String(wallets.length), icon: <Building2 size={20} />, color: "from-amber-500 to-orange-500" },
          ].map((s) => (
            <motion.div key={s.label} className="bg-white rounded-xl shadow-sm p-5" whileHover={{ y: -2 }}>
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${s.color} text-white w-fit mb-3`}>{s.icon}</div>
              <p className="text-2xl font-bold text-indigo-900">{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>
      )}

      {wallets.length === 0 && !isLoading ? (
        <EmptyState title="No Current Accounts" description="Open a current account for your daily transactions."
          action={{ label: "Open Current Account", onClick: () => navigate("/customer/accounts") }} />
      ) : (
        <motion.div className="bg-white rounded-xl shadow-sm" variants={itemVariants}>
          <div className="p-4 border-b border-gray-100"><h3 className="font-semibold text-indigo-900">Current Accounts</h3></div>
          <div className="divide-y divide-gray-50">
            {wallets.map((w: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-4 hover:bg-indigo-50/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600"><Building2 size={18} /></div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{w.name || "Current Account"}</h4>
                    <p className="text-xs text-gray-500">{w.accountNumber ? `•••• ${w.accountNumber.slice(-4)}` : w.currency || "USD"}</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-indigo-900">{show ? fmt(w.balance || 0) : "••••••"}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

// ========================
// FIXED DEPOSITS
// ========================
export const FixedDeposits: React.FC = () => {
  const navigate = useNavigate();
  const show = useUIStore((s) => s.preferences.showBalances);
  const { data: walletsData, isLoading } = useWallets();
  const allWallets = (walletsData as any)?.data ? (walletsData as any).data : walletsData || [];
  const deposits = allWallets.filter((w: any) => (w.type || w.accountType || "").toLowerCase().includes("fixed"));

  return (
    <motion.div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-full" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <PageHeader title="Fixed Deposits" subtitle="Earn higher interest with term deposits"
          breadcrumbs={[{ label: "Dashboard", href: "/customer/dashboard" }, { label: "Accounts", href: "/customer/accounts" }, { label: "Fixed Deposits" }]}
          actions={
            <motion.button onClick={() => navigate("/customer/accounts")} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-sm text-sm font-medium" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Plus size={16} /> New Deposit
            </motion.button>
          } />
      </motion.div>

      {isLoading ? <StatsGridSkeleton count={3} /> : (
        <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6" variants={itemVariants}>
          {[
            { label: "Total Deposits", value: show ? fmt(deposits.reduce((a: number, w: any) => a + (w.balance || w.amount || 0), 0)) : "••••••", icon: <Lock size={20} />, color: "from-indigo-500 to-purple-500" },
            { label: "Interest Rate", value: "5.25% p.a.", icon: <Percent size={20} />, color: "from-emerald-500 to-teal-500" },
            { label: "Active Deposits", value: String(deposits.length), icon: <Shield size={20} />, color: "from-amber-500 to-orange-500" },
          ].map((s) => (
            <motion.div key={s.label} className="bg-white rounded-xl shadow-sm p-5" whileHover={{ y: -2 }}>
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${s.color} text-white w-fit mb-3`}>{s.icon}</div>
              <p className="text-2xl font-bold text-indigo-900">{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>
      )}

      {deposits.length === 0 && !isLoading ? (
        <EmptyState title="No Fixed Deposits" description="Lock in a great rate with a fixed deposit. Choose your term and earn guaranteed returns."
          action={{ label: "Create Fixed Deposit", onClick: () => navigate("/customer/accounts") }} />
      ) : (
        <motion.div className="bg-white rounded-xl shadow-sm" variants={itemVariants}>
          <div className="p-4 border-b border-gray-100"><h3 className="font-semibold text-indigo-900">Your Fixed Deposits</h3></div>
          <div className="divide-y divide-gray-50">
            {deposits.map((d: any, i: number) => (
              <div key={i} className="p-4 hover:bg-indigo-50/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900">{d.name || `Fixed Deposit #${i + 1}`}</h4>
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-medium">Active</span>
                </div>
                <div className="flex gap-6">
                  <div><p className="text-xs text-gray-500">Amount</p><p className="font-semibold text-indigo-900">{show ? fmt(d.balance || d.amount || 0) : "••••••"}</p></div>
                  <div><p className="text-xs text-gray-500">Rate</p><p className="font-semibold text-emerald-600">{d.interestRate || "5.25"}%</p></div>
                  <div><p className="text-xs text-gray-500">Maturity</p><p className="font-semibold text-gray-700">{d.maturityDate || "—"}</p></div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

// ========================
// ACCOUNT STATEMENTS
// ========================
export const AccountStatements: React.FC = () => {
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [format, setFormat] = useState("pdf");
  const { data: walletsData, isLoading } = useWallets();
  const wallets = (walletsData as any)?.data ? (walletsData as any).data : walletsData || [];
  const [selectedAccount, setSelectedAccount] = useState("");

  return (
    <motion.div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-full" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <PageHeader title="Account Statements" subtitle="Download and view your account statements"
          breadcrumbs={[{ label: "Dashboard", href: "/customer/dashboard" }, { label: "Accounts", href: "/customer/accounts" }, { label: "Statements" }]} />
      </motion.div>

      {isLoading ? <FormSkeleton fields={4} /> : (
        <motion.div className="max-w-2xl" variants={itemVariants}>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-indigo-900 mb-6">Generate Statement</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Account</label>
                <select value={selectedAccount} onChange={(e) => setSelectedAccount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">Choose an account</option>
                  {wallets.map((w: any, i: number) => (
                    <option key={i} value={w._id || w.id}>{w.name || `Account ${i + 1}`} — {w.accountNumber ? `•••• ${w.accountNumber.slice(-4)}` : w.currency}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                  <input type="date" value={dateRange.from} onChange={(e) => setDateRange(p => ({ ...p, from: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                  <input type="date" value={dateRange.to} onChange={(e) => setDateRange(p => ({ ...p, to: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
                <div className="flex gap-3">
                  {["pdf", "csv", "excel"].map((f) => (
                    <button key={f} onClick={() => setFormat(f)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${format === f ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                      {f.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <motion.button
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-medium mt-4"
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              >
                <Download size={16} /> Generate Statement
              </motion.button>
            </div>
          </div>

          {/* Recent Statements */}
          <motion.div className="bg-white rounded-xl shadow-sm mt-6 p-5" variants={itemVariants}>
            <h3 className="font-semibold text-indigo-900 mb-4">Recent Statements</h3>
            <div className="space-y-2">
              {["March 2025", "February 2025", "January 2025"].map((month) => (
                <div key={month} className="flex items-center justify-between p-3 rounded-lg hover:bg-indigo-50/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-50 text-purple-600"><FileText size={16} /></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{month} Statement</p>
                      <p className="text-xs text-gray-500">Generated automatically</p>
                    </div>
                  </div>
                  <Download size={16} className="text-indigo-500" />
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};
