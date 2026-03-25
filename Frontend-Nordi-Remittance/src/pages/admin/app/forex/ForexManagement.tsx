import React, { useState } from "react";
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
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
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

const sectionTabs = [
  { id: "rates", label: "Exchange Rates", icon: <TrendingUp size={16} /> },
  { id: "transactions", label: "Forex Transactions", icon: <ArrowRightLeft size={16} /> },
  { id: "remittances", label: "Remittances", icon: <Globe size={16} /> },
];

const exchangeRates = [
  { pair: "EUR/USD", rate: 1.0842, change: +0.23, bid: 1.0840, ask: 1.0844, high24h: 1.0890, low24h: 1.0785, volume: "2.4B" },
  { pair: "EUR/GBP", rate: 0.8568, change: -0.12, bid: 0.8566, ask: 0.8570, high24h: 0.8595, low24h: 0.8540, volume: "1.8B" },
  { pair: "EUR/SEK", rate: 11.2450, change: +0.08, bid: 11.2430, ask: 11.2470, high24h: 11.2800, low24h: 11.2100, volume: "450M" },
  { pair: "EUR/NOK", rate: 11.5820, change: -0.15, bid: 11.5800, ask: 11.5840, high24h: 11.6200, low24h: 11.5500, volume: "380M" },
  { pair: "EUR/DKK", rate: 7.4612, change: +0.01, bid: 7.4610, ask: 7.4614, high24h: 7.4650, low24h: 7.4580, volume: "290M" },
  { pair: "EUR/NGN", rate: 1620.50, change: -0.45, bid: 1619.00, ask: 1622.00, high24h: 1635.00, low24h: 1615.00, volume: "120M" },
  { pair: "EUR/KES", rate: 148.25, change: +0.32, bid: 148.10, ask: 148.40, high24h: 149.00, low24h: 147.50, volume: "85M" },
  { pair: "EUR/GHS", rate: 14.85, change: -0.21, bid: 14.80, ask: 14.90, high24h: 15.10, low24h: 14.75, volume: "45M" },
];

const rateHistory = [
  { time: "00:00", EURUSD: 1.0810, EURGBP: 0.8572, EURSEK: 11.2200 },
  { time: "04:00", EURUSD: 1.0825, EURGBP: 0.8565, EURSEK: 11.2300 },
  { time: "08:00", EURUSD: 1.0830, EURGBP: 0.8560, EURSEK: 11.2350 },
  { time: "12:00", EURUSD: 1.0850, EURGBP: 0.8570, EURSEK: 11.2400 },
  { time: "16:00", EURUSD: 1.0838, EURGBP: 0.8575, EURSEK: 11.2500 },
  { time: "20:00", EURUSD: 1.0842, EURGBP: 0.8568, EURSEK: 11.2450 },
];

const forexTransactions = [
  { id: "FX-001", user: "Erik Lundgren", from: "EUR", to: "USD", fromAmount: 5000, toAmount: 5421, rate: 1.0842, fee: 12.50, status: "completed", date: "2026-03-22T14:30:00" },
  { id: "FX-002", user: "Anna Johansson", from: "EUR", to: "GBP", fromAmount: 3000, toAmount: 2570.40, rate: 0.8568, fee: 8.00, status: "completed", date: "2026-03-22T13:15:00" },
  { id: "FX-003", user: "Lars Nilsson", from: "EUR", to: "NGN", fromAmount: 2000, toAmount: 3241000, rate: 1620.50, fee: 25.00, status: "pending", date: "2026-03-22T12:00:00" },
  { id: "FX-004", user: "Sofia Bergman", from: "EUR", to: "SEK", fromAmount: 1500, toAmount: 16867.50, rate: 11.2450, fee: 5.00, status: "completed", date: "2026-03-22T10:45:00" },
  { id: "FX-005", user: "Henrik Berg", from: "EUR", to: "KES", fromAmount: 500, toAmount: 74125, rate: 148.25, fee: 15.00, status: "failed", date: "2026-03-21T16:20:00" },
];

const remittances = [
  { id: "REM-001", sender: "Erik Lundgren", recipient: "Kwame Asante", corridor: "SE → GH", amount: 1000, received: 14850, currency: "GHS", fee: 12, status: "completed", date: "2026-03-22T14:00:00" },
  { id: "REM-002", sender: "Anna Johansson", recipient: "Oluwaseun Adeyemi", corridor: "SE → NG", amount: 2500, received: 4051250, currency: "NGN", fee: 30, status: "processing", date: "2026-03-22T12:30:00" },
  { id: "REM-003", sender: "Lars Nilsson", recipient: "Wanjiku Kamau", corridor: "FI → KE", amount: 800, received: 118600, currency: "KES", fee: 18, status: "completed", date: "2026-03-21T15:00:00" },
  { id: "REM-004", sender: "Sofia Bergman", recipient: "Amara Diallo", corridor: "DK → SN", amount: 600, received: 393600, currency: "XOF", fee: 14, status: "pending", date: "2026-03-21T10:00:00" },
];

export default function ForexManagement() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("rates");
  const [search, setSearch] = useState("");

  return (
    <PageContainer>
      <PageHeader
        title="Foreign Exchange"
        subtitle="Exchange rates, forex transactions, and remittance corridor management"
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Foreign Exchange" },
        ]}
        actions={
          <div className="flex gap-2">
            <ActionButton label="Export" icon={<Download size={14} />} onClick={() => {}} variant="secondary" />
            <ActionButton label="Refresh Rates" icon={<RefreshCw size={14} />} onClick={() => toast.success("Rates refreshed")} />
          </div>
        }
      />

      <StatsGrid>
        <StatCard label="Daily FX Volume" value="€1.2M" icon={<ArrowRightLeft size={18} />} iconColor="from-indigo-500 to-indigo-600" change="+15.4% vs yesterday" positive index={0} />
        <StatCard label="Currency Pairs" value={exchangeRates.length} icon={<Globe size={18} />} iconColor="from-blue-500 to-blue-600" index={1} />
        <StatCard label="Remittance Volume" value="€4.9K" icon={<Banknote size={18} />} iconColor="from-emerald-500 to-emerald-600" change="+8.2% this week" positive index={2} />
        <StatCard label="Avg Spread" value="0.03%" icon={<TrendingUp size={18} />} iconColor="from-violet-500 to-violet-600" index={3} />
      </StatsGrid>

      {/* Section Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {sectionTabs.map((tab) => (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-lg"
                : "bg-white dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
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
            <SectionHeader title="EUR Exchange Rate Trend (24h)" subtitle="Live rate movement for major pairs" />
            <div className="h-[250px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={rateHistory}>
                  <defs>
                    <linearGradient id="fxGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb40" />
                  <XAxis dataKey="time" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} domain={["dataMin - 0.002", "dataMax + 0.002"]} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: "12px" }} />
                  <Area type="monotone" dataKey="EURUSD" stroke="#6366f1" fill="url(#fxGrad)" strokeWidth={2} name="EUR/USD" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </DashCard>

          {/* Rates Table */}
          <DashCard>
            <SectionHeader title="Live Exchange Rates" />
            <div className="overflow-x-auto mt-3">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    {["Pair", "Rate", "Change", "Bid", "Ask", "24h High", "24h Low", "Volume"].map((h) => (
                      <th key={h} className="text-left py-3 px-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {exchangeRates.map((rate, i) => (
                    <motion.tr key={rate.pair} initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: i * 0.03 } }} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="py-3 px-2 font-semibold text-gray-900 dark:text-white">{rate.pair}</td>
                      <td className="py-3 px-2 font-mono font-semibold text-gray-900 dark:text-white">{rate.rate.toFixed(4)}</td>
                      <td className="py-3 px-2">
                        <span className={`flex items-center gap-0.5 font-medium ${rate.change >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                          {rate.change >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                          {rate.change >= 0 ? "+" : ""}{rate.change.toFixed(2)}%
                        </span>
                      </td>
                      <td className="py-3 px-2 font-mono text-gray-600 dark:text-gray-300">{rate.bid.toFixed(4)}</td>
                      <td className="py-3 px-2 font-mono text-gray-600 dark:text-gray-300">{rate.ask.toFixed(4)}</td>
                      <td className="py-3 px-2 text-emerald-600 dark:text-emerald-400">{rate.high24h.toFixed(4)}</td>
                      <td className="py-3 px-2 text-red-600 dark:text-red-400">{rate.low24h.toFixed(4)}</td>
                      <td className="py-3 px-2 text-gray-400">{rate.volume}</td>
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
            <div className="overflow-x-auto mt-3">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    {["ID", "User", "From", "To", "Rate", "Fee", "Status", "Date"].map((h) => (
                      <th key={h} className="text-left py-3 px-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {forexTransactions.map((tx, i) => (
                    <motion.tr key={tx.id} initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: i * 0.04 } }} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="py-3 px-2 font-mono text-gray-400">{tx.id}</td>
                      <td className="py-3 px-2 font-medium text-gray-900 dark:text-white">{tx.user}</td>
                      <td className="py-3 px-2">
                        <span className="font-semibold text-gray-900 dark:text-white">€{tx.fromAmount.toLocaleString()}</span>
                        <span className="text-gray-400 ml-1">{tx.from}</span>
                      </td>
                      <td className="py-3 px-2">
                        <span className="font-semibold text-gray-900 dark:text-white">{tx.toAmount.toLocaleString()}</span>
                        <span className="text-gray-400 ml-1">{tx.to}</span>
                      </td>
                      <td className="py-3 px-2 font-mono text-gray-600 dark:text-gray-300">{tx.rate}</td>
                      <td className="py-3 px-2 text-gray-400">€{tx.fee.toFixed(2)}</td>
                      <td className="py-3 px-2"><StatusBadge status={tx.status} /></td>
                      <td className="py-3 px-2 text-gray-400">{new Date(tx.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</td>
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
          {remittances.map((rem, i) => (
            <motion.div key={rem.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.04 } }}>
              <DashCard hover>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                    {rem.corridor.split(" → ").map((c) => c.trim()).join("→")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{rem.sender}</p>
                      <ArrowRightLeft size={12} className="text-gray-400" />
                      <p className="text-sm text-gray-600 dark:text-gray-300">{rem.recipient}</p>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5">{rem.id} · Fee: €{rem.fee}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">€{rem.amount.toLocaleString()}</p>
                    <p className="text-[10px] text-gray-400">→ {rem.received.toLocaleString()} {rem.currency}</p>
                  </div>
                  <StatusBadge status={rem.status} />
                  <span className="text-[10px] text-gray-400 flex items-center gap-1 flex-shrink-0">
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
