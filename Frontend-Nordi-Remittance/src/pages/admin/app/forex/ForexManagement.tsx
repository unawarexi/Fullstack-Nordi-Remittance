import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  RefreshCw,
  Download,
  Clock,
  ArrowRightLeft,
  Search,
  Banknote,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  PageContainer,
  DashCard,
  StatCard,
  StatsGrid,
  SectionHeader,
  FilterBar,
  FilterSelect,
  FilterPill,
  ActionButton,
  StatusBadge,
} from "@components/shared/DashboardPrimitives";
import { PageHeader } from "@components/shared/PageHeader";
import { useToast } from "@store/toast.store";
import { useForexManagement } from "../../admin-usecase/useForexManagement";

const sectionTabs = [
  { id: "rates", label: "Exchange Rates", icon: <TrendingUp size={16} /> },
  { id: "transactions", label: "Forex Transactions", icon: <ArrowRightLeft size={16} /> },
  { id: "remittances", label: "Remittances", icon: <Globe size={16} /> },
];

export default function ForexManagement() {
  const toast = useToast();
  const {
    transactions,
    allTransactions,
    rawTransactions,
    exchangeRates,
    rateHistory,
    remittanceStats,
    search,
    statusFilter,
    activeTab,
    isLoading,
    setSearch,
    setStatusFilter,
    setActiveTab,
    refetch,
  } = useForexManagement();

  return (
    <PageContainer>
      <PageHeader
        title="Foreign Exchange"
        subtitle="Exchange rates, forex transactions, and remittance corridor management"
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Foreign Exchange" }]}
        actions={
          <div className="flex gap-2">
            <ActionButton label="Export" icon={<Download size={14} />} onClick={() => {}} variant="secondary" />
            <ActionButton
              label="Refresh Rates"
              icon={<RefreshCw size={14} />}
              onClick={() => {
                refetch();
                toast.success("Rates refreshed");
              }}
            />
          </div>
        }
      />

      <StatsGrid>
        <StatCard
          label="Daily FX Volume"
          value={`€${(remittanceStats.totalVolume / 1000).toFixed(1)}K`}
          icon={<ArrowRightLeft size={18} />}
          iconColor="from-indigo-500 to-indigo-600"
          change={`${remittanceStats.totalCount} transactions`}
          positive
          index={0}
        />
        <StatCard
          label="Currency Pairs"
          value={exchangeRates.length}
          icon={<Globe size={18} />}
          iconColor="from-blue-500 to-blue-600"
          index={1}
        />
        <StatCard
          label="Remittance Volume"
          value={`€${((remittanceStats.avgAmount * remittanceStats.totalCount) / 1000).toFixed(1)}K`}
          icon={<Banknote size={18} />}
          iconColor="from-emerald-500 to-emerald-600"
          change={`${remittanceStats.successRate}% success rate`}
          positive
          index={2}
        />
        <StatCard
          label="Pending"
          value={remittanceStats.pendingCount}
          icon={<TrendingUp size={18} />}
          iconColor="from-violet-500 to-violet-600"
          index={3}
        />
      </StatsGrid>

      {/* Section Tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {sectionTabs.map((tab) => (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-medium transition-all ${
              activeTab === tab.id
                ? "bg-gray-900 text-white shadow-lg dark:bg-white dark:text-gray-900"
                : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-400 dark:hover:bg-gray-800"
            }`}
          >
            {tab.icon}
            {tab.label}
          </motion.button>
        ))}
      </div>

      {/* Exchange Rates */}
      {activeTab === "rates" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Rate Chart */}
          <DashCard>
            <SectionHeader title="Transaction Volume Trend" subtitle="Volume movement over time" />
            <div className="mt-4 h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={rateHistory}>
                  <defs>
                    <linearGradient id="fxGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb40" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: "12px" }} />
                  <Area
                    type="monotone"
                    dataKey="volume"
                    stroke="#6366f1"
                    fill="url(#fxGrad)"
                    strokeWidth={2}
                    name="Volume"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </DashCard>

          {/* Rates Table */}
          <DashCard>
            <SectionHeader title="Live Exchange Rates" />
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    {["Pair", "Rate", "Change", "Volume"].map((h) => (
                      <th
                        key={h}
                        className="px-2 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {exchangeRates.map((rate: any, i: number) => (
                    <motion.tr
                      key={rate.pair}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1, transition: { delay: i * 0.03 } }}
                      className="border-b border-gray-50 transition-colors hover:bg-gray-50/50 dark:border-gray-800/50 dark:hover:bg-gray-800/30"
                    >
                      <td className="px-2 py-3 font-semibold text-gray-900 dark:text-white">{rate.pair}</td>
                      <td className="px-2 py-3 font-mono font-semibold text-gray-900 dark:text-white">
                        {Number(rate.rate).toFixed(4)}
                      </td>
                      <td className="px-2 py-3">
                        <span
                          className={`flex items-center gap-0.5 font-medium ${rate.change >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}
                        >
                          {rate.change >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                          {rate.change >= 0 ? "+" : ""}
                          {Number(rate.change).toFixed(2)}%
                        </span>
                      </td>
                      <td className="px-2 py-3 text-gray-400">{rate.volume?.toLocaleString?.() ?? rate.volume}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DashCard>
        </motion.div>
      )}

      {/* Forex Transactions */}
      {activeTab === "transactions" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <DashCard>
            <SectionHeader title="Recent Forex Transactions" subtitle="Currency exchange history" />
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    {["ID", "User", "From", "To", "Rate", "Fee", "Status", "Date"].map((h) => (
                      <th
                        key={h}
                        className="px-2 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx: any, i: number) => (
                    <motion.tr
                      key={tx.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1, transition: { delay: i * 0.04 } }}
                      className="border-b border-gray-50 transition-colors hover:bg-gray-50/50 dark:border-gray-800/50 dark:hover:bg-gray-800/30"
                    >
                      <td className="px-2 py-3 font-mono text-gray-400">{tx.id}</td>
                      <td className="px-2 py-3 font-medium text-gray-900 dark:text-white">{tx.sender}</td>
                      <td className="px-2 py-3">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          €{tx.sentAmount?.toLocaleString()}
                        </span>
                        <span className="ml-1 text-gray-400">{tx.fromCurrency}</span>
                      </td>
                      <td className="px-2 py-3">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {tx.receivedAmount?.toLocaleString()}
                        </span>
                        <span className="ml-1 text-gray-400">{tx.toCurrency}</span>
                      </td>
                      <td className="px-2 py-3 font-mono text-gray-600 dark:text-gray-300">{tx.rate}</td>
                      <td className="px-2 py-3 text-gray-400">€{Number(tx.fee).toFixed(2)}</td>
                      <td className="px-2 py-3">
                        <StatusBadge status={tx.status} />
                      </td>
                      <td className="px-2 py-3 text-gray-400">
                        {new Date(tx.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DashCard>
        </motion.div>
      )}

      {/* Remittances */}
      {activeTab === "remittances" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <SectionHeader title="Remittance Corridors" subtitle="Cross-border remittance transfers" />
          {rawTransactions.map((rem: any, i: number) => (
            <motion.div
              key={rem.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, transition: { delay: i * 0.04 } }}
            >
              <DashCard hover>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-[10px] font-bold text-white">
                    {rem.fromCurrency}→{rem.toCurrency}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{rem.sender}</p>
                      <ArrowRightLeft size={12} className="text-gray-400" />
                      <p className="text-sm text-gray-600 dark:text-gray-300">{rem.recipient}</p>
                    </div>
                    <p className="mt-0.5 text-[10px] text-gray-400">
                      {rem.reference || rem.id} · Fee: €{rem.fee}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      €{rem.sentAmount?.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      → {rem.receivedAmount?.toLocaleString()} {rem.toCurrency}
                    </p>
                  </div>
                  <StatusBadge status={rem.status} />
                  <span className="flex flex-shrink-0 items-center gap-1 text-[10px] text-gray-400">
                    <Clock size={10} />
                    {new Date(rem.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                  </span>
                </div>
              </DashCard>
            </motion.div>
          ))}
        </motion.div>
      )}
    </PageContainer>
  );
}
