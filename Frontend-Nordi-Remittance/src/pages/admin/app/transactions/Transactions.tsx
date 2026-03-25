import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Activity,
  Globe,
  Filter,
  RotateCcw,
} from "lucide-react";
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
import { useAdminDashboardStats, usePendingTransactions, useApproveTransaction, useRejectTransaction } from "@hooks/queries";
import { useToast } from "@store/toast.store";

const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "completed", label: "Completed" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
  { value: "processing", label: "Processing" },
  { value: "cancelled", label: "Cancelled" },
];

const typeOptions = [
  { value: "all", label: "All Types" },
  { value: "transfer", label: "Transfer" },
  { value: "deposit", label: "Deposit" },
  { value: "withdrawal", label: "Withdrawal" },
  { value: "remittance", label: "International" },
];

const timeFilters = ["Today", "This Week", "This Month", "This Quarter", "All Time"];

// Sample data for admin transactions management
const sampleTransactions = [
  { id: "TXN-001", user: "Anna Johansson", email: "anna@example.com", type: "transfer", amount: 5200, currency: "EUR", status: "completed", date: "2026-03-22T10:30:00", from: "SE1234****5678", to: "FI9876****4321", reference: "REF-2026-001" },
  { id: "TXN-002", user: "Erik Lundgren", email: "erik@example.com", type: "remittance", amount: 12500, currency: "USD", status: "pending", date: "2026-03-22T09:15:00", from: "SE5678****1234", to: "NG2345****6789", reference: "REF-2026-002" },
  { id: "TXN-003", user: "Sofia Bergman", email: "sofia@example.com", type: "withdrawal", amount: 3400, currency: "GBP", status: "failed", date: "2026-03-21T16:45:00", from: "SE4321****8765", to: "External Bank", reference: "REF-2026-003" },
  { id: "TXN-004", user: "Lars Nilsson", email: "lars@example.com", type: "deposit", amount: 25000, currency: "EUR", status: "completed", date: "2026-03-21T14:20:00", from: "External", to: "SE8765****4321", reference: "REF-2026-004" },
  { id: "TXN-005", user: "Maria Svensson", email: "maria@example.com", type: "transfer", amount: 890, currency: "USD", status: "processing", date: "2026-03-21T11:00:00", from: "SE1111****2222", to: "SE3333****4444", reference: "REF-2026-005" },
  { id: "TXN-006", user: "Olof Andersson", email: "olof@example.com", type: "remittance", amount: 7800, currency: "EUR", status: "pending", date: "2026-03-20T08:30:00", from: "SE5555****6666", to: "KE7777****8888", reference: "REF-2026-006" },
  { id: "TXN-007", user: "Karin Holm", email: "karin@example.com", type: "transfer", amount: 1500, currency: "GBP", status: "completed", date: "2026-03-20T15:10:00", from: "SE9999****0000", to: "SE1111****2222", reference: "REF-2026-007" },
  { id: "TXN-008", user: "Henrik Berg", email: "henrik@example.com", type: "withdrawal", amount: 45000, currency: "EUR", status: "pending", date: "2026-03-19T12:00:00", from: "SE2222****3333", to: "External Bank", reference: "REF-2026-008" },
];

const typeIcons: Record<string, React.ReactNode> = {
  transfer: <ArrowUpRight size={14} />,
  deposit: <ArrowDownLeft size={14} />,
  withdrawal: <ArrowUpRight size={14} />,
  remittance: <Globe size={14} />,
};

export default function AdminTransactions() {
  const navigate = useNavigate();
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [activeTime, setActiveTime] = useState("This Month");
  const [page, setPage] = useState(1);
  const [selectedTx, setSelectedTx] = useState<string | null>(null);
  const [actionModal, setActionModal] = useState<{ type: "approve" | "reject"; txId: string } | null>(null);
  const [actionNote, setActionNote] = useState("");

  const filtered = sampleTransactions.filter((tx) => {
    const matchesSearch =
      !search ||
      tx.user.toLowerCase().includes(search.toLowerCase()) ||
      tx.reference.toLowerCase().includes(search.toLowerCase()) ||
      tx.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || tx.status === statusFilter;
    const matchesType = typeFilter === "all" || tx.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    total: sampleTransactions.length,
    volume: sampleTransactions.reduce((a, t) => a + t.amount, 0),
    completed: sampleTransactions.filter((t) => t.status === "completed").length,
    pending: sampleTransactions.filter((t) => t.status === "pending").length,
  };

  const handleApprove = (txId: string) => {
    toast.success(`Transaction ${txId} approved`);
    setActionModal(null);
    setActionNote("");
  };

  const handleReject = (txId: string) => {
    toast.error(`Transaction ${txId} rejected`);
    setActionModal(null);
    setActionNote("");
  };

  return (
    <PageContainer>
      <PageHeader
        title="Transaction Management"
        subtitle="Monitor, review, and manage all platform transactions"
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Transactions" },
        ]}
        actions={
          <div className="flex gap-2">
            <ActionButton label="Export" icon={<Download size={14} />} onClick={() => {}} variant="secondary" />
            <ActionButton label="Refresh" icon={<RefreshCw size={14} />} onClick={() => {}} variant="primary" />
          </div>
        }
      />

      <StatsGrid>
        <StatCard label="Total Transactions" value={stats.total.toLocaleString()} icon={<Activity size={18} />} iconColor="from-blue-500 to-blue-600" change="+12%" positive index={0} />
        <StatCard label="Total Volume" value={`€${(stats.volume / 1000).toFixed(1)}K`} icon={<DollarSign size={18} />} iconColor="from-emerald-500 to-emerald-600" change="+8.4%" positive index={1} />
        <StatCard label="Completed" value={stats.completed} icon={<CheckCircle size={18} />} iconColor="from-green-500 to-green-600" change="+5%" positive index={2} />
        <StatCard label="Pending Review" value={stats.pending} icon={<Clock size={18} />} iconColor="from-amber-500 to-amber-600" change="+3" positive={false} index={3} />
      </StatsGrid>

      {/* Time Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {timeFilters.map((t) => (
          <FilterPill key={t} label={t} active={activeTime === t} onClick={() => setActiveTime(t)} />
        ))}
      </div>

      {/* Search & Filters */}
      <FilterBar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search by user, email, or reference...">
        <FilterSelect value={statusFilter} onChange={setStatusFilter} options={statusOptions} />
        <FilterSelect value={typeFilter} onChange={setTypeFilter} options={typeOptions} />
        {(statusFilter !== "all" || typeFilter !== "all") && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => { setStatusFilter("all"); setTypeFilter("all"); }}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-500 flex items-center gap-1"
          >
            <RotateCcw size={12} /> Reset
          </motion.button>
        )}
      </FilterBar>

      {/* Transactions Table */}
      <DashCard padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                {["Transaction", "User", "Type", "Amount", "Status", "Date", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {filtered.map((tx, i) => (
                  <motion.tr
                    key={tx.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: i * 0.03 } }}
                    exit={{ opacity: 0, x: -20 }}
                    className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{tx.reference}</p>
                      <p className="text-[10px] text-gray-400">{tx.id}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs sm:text-sm text-gray-900 dark:text-white">{tx.user}</p>
                      <p className="text-[10px] text-gray-400">{tx.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-xs capitalize text-gray-600 dark:text-gray-300">
                        {typeIcons[tx.type]} {tx.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs sm:text-sm font-semibold ${tx.type === "deposit" ? "text-emerald-600 dark:text-emerald-400" : "text-gray-900 dark:text-white"}`}>
                        {tx.type === "deposit" ? "+" : tx.type === "withdrawal" ? "-" : ""}
                        {tx.currency === "EUR" ? "€" : tx.currency === "USD" ? "$" : "£"}
                        {tx.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={tx.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                      {new Date(tx.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                      <br />
                      <span className="text-[10px]">{new Date(tx.date).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setSelectedTx(tx.id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400">
                          <Eye size={14} />
                        </motion.button>
                        {tx.status === "pending" && (
                          <>
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleApprove(tx.id)} className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                              <CheckCircle size={14} />
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleReject(tx.id)} className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-400">
                              <XCircle size={14} />
                            </motion.button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500">
            <AlertTriangle size={32} className="mb-2" />
            <p className="text-sm">No transactions found</p>
            <p className="text-xs mt-1">Try adjusting your filters</p>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-800">
          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
            Showing {filtered.length} of {sampleTransactions.length} transactions
          </p>
          <div className="flex items-center gap-2">
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setPage(Math.max(1, page - 1))} className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50" disabled={page === 1}>
              Previous
            </motion.button>
            <span className="text-xs text-gray-600 dark:text-gray-300">Page {page}</span>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setPage(page + 1)} className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
              Next
            </motion.button>
          </div>
        </div>
      </DashCard>
    </PageContainer>
  );
}
