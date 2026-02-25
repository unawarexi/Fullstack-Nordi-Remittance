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
} from "lucide-react";
import PageHeader from "@components/shared/PageHeader";
import { EmptyState } from "@components/shared/EmptyState";
import {
  PageContainer, DashCard, StatCard, StatsGrid, SectionHeader, StatusBadge,
} from "@components/shared/DashboardPrimitives";
import { StatsGridSkeleton, FormSkeleton } from "@components/skeletons";
import { dashboardItemVariants } from "@core/animation/Animation";
import { useWallets } from "@hooks/queries/useAccounts";
import { useUIStore } from "@store/ui.store";

const fmt = (n: number, c = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: c, minimumFractionDigits: 2 }).format(n);

/* ═══════ SAVINGS ACCOUNT ═══════ */
export const SavingsAccount: React.FC = () => {
  const navigate = useNavigate();
  const show = useUIStore((s) => s.preferences.showBalances);
  const { data: walletsData, isLoading } = useWallets();
  const allWallets = (walletsData as any)?.data ?? walletsData ?? [];
  const wallets = allWallets.filter(
    (w: any) => (w.type || w.accountType || "").toLowerCase() === "savings"
  );

  return (
    <PageContainer>
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Savings Account"
          subtitle="Grow your savings with competitive interest rates"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Accounts", href: "/customer/accounts" },
            { label: "Savings" },
          ]}
        />
      </motion.div>

      {isLoading ? (
        <StatsGridSkeleton count={3} />
      ) : (
        <StatsGrid cols={3}>
          <StatCard label="Savings Balance" value={show ? fmt(wallets.reduce((a: number, w: any) => a + (w.balance || 0), 0)) : "••••••"} icon={<PiggyBank size={20} />} iconColor="from-emerald-500 to-teal-500" />
          <StatCard label="Interest Earned" value={show ? fmt(wallets.reduce((a: number, w: any) => a + (w.interestEarned || 0), 0)) : "••••••"} icon={<Percent size={20} />} iconColor="from-indigo-500 to-purple-500" />
          <StatCard label="Accounts" value={String(wallets.length)} icon={<PiggyBank size={20} />} iconColor="from-amber-500 to-orange-500" />
        </StatsGrid>
      )}

      {wallets.length === 0 && !isLoading ? (
        <EmptyState
          title="No Savings Accounts"
          description="Open a savings account to start earning interest on your deposits."
          action={{ label: "Open Savings Account", onClick: () => navigate("/customer/accounts") }}
        />
      ) : (
        <DashCard padding="none" className="mt-6">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">Savings Accounts</h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {wallets.map((w: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                    <PiggyBank size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{w.name || "Savings Account"}</h4>
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                      {w.accountNumber ? `•••• ${w.accountNumber.slice(-4)}` : w.currency || "USD"}
                    </p>
                  </div>
                </div>
                <p className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white">
                  {show ? fmt(w.balance || 0) : "••••••"}
                </p>
              </div>
            ))}
          </div>
        </DashCard>
      )}
    </PageContainer>
  );
};

/* ═══════ CURRENT ACCOUNT ═══════ */
export const CurrentAccount: React.FC = () => {
  const navigate = useNavigate();
  const show = useUIStore((s) => s.preferences.showBalances);
  const { data: walletsData, isLoading } = useWallets();
  const allWallets = (walletsData as any)?.data ?? walletsData ?? [];
  const wallets = allWallets.filter(
    (w: any) => ["current", "checking"].includes((w.type || w.accountType || "").toLowerCase())
  );

  return (
    <PageContainer>
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Current Account"
          subtitle="Manage your everyday banking transactions"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Accounts", href: "/customer/accounts" },
            { label: "Current" },
          ]}
        />
      </motion.div>

      {isLoading ? (
        <StatsGridSkeleton count={3} />
      ) : (
        <StatsGrid cols={3}>
          <StatCard label="Current Balance" value={show ? fmt(wallets.reduce((a: number, w: any) => a + (w.balance || 0), 0)) : "••••••"} icon={<Building2 size={20} />} iconColor="from-indigo-500 to-purple-500" />
          <StatCard label="Monthly Turnover" value={show ? fmt(wallets.reduce((a: number, w: any) => a + (w.monthlyTurnover || 0), 0)) : "••••••"} icon={<TrendingUp size={20} />} iconColor="from-blue-500 to-cyan-500" />
          <StatCard label="Accounts" value={String(wallets.length)} icon={<Building2 size={20} />} iconColor="from-amber-500 to-orange-500" />
        </StatsGrid>
      )}

      {wallets.length === 0 && !isLoading ? (
        <EmptyState
          title="No Current Accounts"
          description="Open a current account for your daily transactions."
          action={{ label: "Open Current Account", onClick: () => navigate("/customer/accounts") }}
        />
      ) : (
        <DashCard padding="none" className="mt-6">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">Current Accounts</h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {wallets.map((w: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                    <Building2 size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{w.name || "Current Account"}</h4>
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                      {w.accountNumber ? `•••• ${w.accountNumber.slice(-4)}` : w.currency || "USD"}
                    </p>
                  </div>
                </div>
                <p className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white">
                  {show ? fmt(w.balance || 0) : "••••••"}
                </p>
              </div>
            ))}
          </div>
        </DashCard>
      )}
    </PageContainer>
  );
};

/* ═══════ FIXED DEPOSITS ═══════ */
export const FixedDeposits: React.FC = () => {
  const navigate = useNavigate();
  const show = useUIStore((s) => s.preferences.showBalances);
  const { data: walletsData, isLoading } = useWallets();
  const allWallets = (walletsData as any)?.data ?? walletsData ?? [];
  const deposits = allWallets.filter(
    (w: any) => (w.type || w.accountType || "").toLowerCase().includes("fixed")
  );

  return (
    <PageContainer>
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Fixed Deposits"
          subtitle="Earn higher interest with term deposits"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Accounts", href: "/customer/accounts" },
            { label: "Fixed Deposits" },
          ]}
          actions={
            <motion.button
              onClick={() => navigate("/customer/accounts")}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-xs sm:text-sm font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus size={16} /> New Deposit
            </motion.button>
          }
        />
      </motion.div>

      {isLoading ? (
        <StatsGridSkeleton count={3} />
      ) : (
        <StatsGrid cols={3}>
          <StatCard label="Total Deposits" value={show ? fmt(deposits.reduce((a: number, w: any) => a + (w.balance || w.amount || 0), 0)) : "••••••"} icon={<Lock size={20} />} iconColor="from-indigo-500 to-purple-500" />
          <StatCard label="Interest Rate" value="5.25% p.a." icon={<Percent size={20} />} iconColor="from-emerald-500 to-teal-500" />
          <StatCard label="Active Deposits" value={String(deposits.length)} icon={<Shield size={20} />} iconColor="from-amber-500 to-orange-500" />
        </StatsGrid>
      )}

      {deposits.length === 0 && !isLoading ? (
        <EmptyState
          title="No Fixed Deposits"
          description="Lock in a great rate with a fixed deposit. Choose your term and earn guaranteed returns."
          action={{ label: "Create Fixed Deposit", onClick: () => navigate("/customer/accounts") }}
        />
      ) : (
        <DashCard padding="none" className="mt-6">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">Your Fixed Deposits</h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {deposits.map((d: any, i: number) => (
              <div key={i} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                    {d.name || `Fixed Deposit #${i + 1}`}
                  </h4>
                  <StatusBadge status="active" />
                </div>
                <div className="flex gap-4 sm:gap-6">
                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Amount</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {show ? fmt(d.balance || d.amount || 0) : "••••••"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Rate</p>
                    <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      {d.interestRate || "5.25"}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Maturity</p>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{d.maturityDate || "—"}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DashCard>
      )}
    </PageContainer>
  );
};

/* ═══════ ACCOUNT STATEMENTS ═══════ */
export const AccountStatements: React.FC = () => {
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [format, setFormat] = useState("pdf");
  const { data: walletsData, isLoading } = useWallets();
  const wallets = (walletsData as any)?.data ?? walletsData ?? [];
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
