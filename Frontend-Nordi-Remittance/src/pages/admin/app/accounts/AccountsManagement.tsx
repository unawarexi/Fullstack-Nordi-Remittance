import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  CreditCard,
  Building2,
  PiggyBank,
  Clock,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  RefreshCw,
  ChevronDown,
  Search,
  Eye,
  Lock,
  Unlock,
  Ban,
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
  ProgressBar,
} from "@components/shared/DashboardPrimitives";
import { PageHeader } from "@components/shared/PageHeader";
import { useToast } from "@store/toast.store";

const accountTypeIcons: Record<string, React.ReactNode> = {
  savings: <PiggyBank size={16} />,
  current: <Building2 size={16} />,
  "fixed-deposit": <Lock size={16} />,
  wallet: <Wallet size={16} />,
};

const accountTypeColors: Record<string, string> = {
  savings: "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400",
  current: "bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400",
  "fixed-deposit": "bg-violet-100 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400",
  wallet: "bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400",
};

const statusFilters = ["All", "Active", "Dormant", "Frozen", "Closed"];
const typeFilters = ["all", "savings", "current", "fixed-deposit", "wallet"];

const sampleAccounts = [
  { id: "ACC-001", owner: "Erik Lundgren", email: "erik@example.com", type: "savings", accountNumber: "NRD-SAV-4821", balance: 24500, currency: "EUR", status: "active", interestRate: 3.5, opened: "2025-06-15", lastActivity: "2026-03-22" },
  { id: "ACC-002", owner: "Anna Johansson", email: "anna@example.com", type: "current", accountNumber: "NRD-CUR-7312", balance: 8750, currency: "EUR", status: "active", interestRate: 0.5, opened: "2025-08-20", lastActivity: "2026-03-21" },
  { id: "ACC-003", owner: "Lars Nilsson", email: "lars@example.com", type: "fixed-deposit", accountNumber: "NRD-FD-1945", balance: 50000, currency: "EUR", status: "active", interestRate: 5.2, opened: "2026-01-10", lastActivity: "2026-01-10" },
  { id: "ACC-004", owner: "Sofia Bergman", email: "sofia@example.com", type: "savings", accountNumber: "NRD-SAV-6203", balance: 3200, currency: "EUR", status: "dormant", interestRate: 3.5, opened: "2025-03-01", lastActivity: "2025-10-15" },
  { id: "ACC-005", owner: "Henrik Berg", email: "henrik@example.com", type: "wallet", accountNumber: "NRD-WAL-8891", balance: 1500, currency: "EUR", status: "active", interestRate: 0, opened: "2026-02-01", lastActivity: "2026-03-20" },
  { id: "ACC-006", owner: "Maria Svensson", email: "maria@example.com", type: "current", accountNumber: "NRD-CUR-2547", balance: 0, currency: "EUR", status: "frozen", interestRate: 0.5, opened: "2025-04-10", lastActivity: "2026-02-28" },
  { id: "ACC-007", owner: "Oskar Holm", email: "oskar@example.com", type: "fixed-deposit", accountNumber: "NRD-FD-3384", balance: 25000, currency: "EUR", status: "active", interestRate: 4.8, opened: "2025-11-01", lastActivity: "2025-11-01" },
  { id: "ACC-008", owner: "Ella Karlsson", email: "ella@example.com", type: "savings", accountNumber: "NRD-SAV-9917", balance: 0, currency: "EUR", status: "closed", interestRate: 0, opened: "2025-01-15", lastActivity: "2025-12-20" },
];

export default function AccountsManagement() {
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [activeStatus, setActiveStatus] = useState("All");
  const [typeFilter, setTypeFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = sampleAccounts.filter((acc) => {
    const matchesSearch = !search || acc.owner.toLowerCase().includes(search.toLowerCase()) || acc.accountNumber.toLowerCase().includes(search.toLowerCase()) || acc.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = activeStatus === "All" || acc.status.toLowerCase() === activeStatus.toLowerCase();
    const matchesType = typeFilter === "all" || acc.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalBalance = sampleAccounts.reduce((sum, a) => sum + a.balance, 0);
  const activeCount = sampleAccounts.filter((a) => a.status === "active").length;
  const dormantCount = sampleAccounts.filter((a) => a.status === "dormant").length;

  return (
    <PageContainer>
      <PageHeader
        title="Bank Accounts"
        subtitle="Manage customer savings, current, fixed deposit accounts and wallets"
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Accounts" },
        ]}
        actions={
          <div className="flex gap-2">
            <ActionButton label="Export" icon={<Download size={14} />} onClick={() => {}} variant="secondary" />
            <ActionButton label="Refresh" icon={<RefreshCw size={14} />} onClick={() => {}} />
          </div>
        }
      />

      <StatsGrid>
        <StatCard label="Total Balance (AUM)" value={`€${(totalBalance / 1000).toFixed(0)}K`} icon={<Wallet size={18} />} iconColor="from-indigo-500 to-indigo-600" index={0} />
        <StatCard label="Active Accounts" value={activeCount} icon={<CreditCard size={18} />} iconColor="from-emerald-500 to-emerald-600" change="+12 this month" positive index={1} />
        <StatCard label="Dormant Accounts" value={dormantCount} icon={<Clock size={18} />} iconColor="from-amber-500 to-amber-600" index={2} />
        <StatCard label="Total Accounts" value={sampleAccounts.length} icon={<Building2 size={18} />} iconColor="from-blue-500 to-blue-600" index={3} />
      </StatsGrid>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {statusFilters.map((s) => (
          <FilterPill key={s} label={s} active={activeStatus === s} onClick={() => setActiveStatus(s)} />
        ))}
      </div>

      <FilterBar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search by name, email, or account number...">
        <FilterSelect
          value={typeFilter}
          onChange={setTypeFilter}
          options={[
            { value: "all", label: "All Types" },
            { value: "savings", label: "Savings" },
            { value: "current", label: "Current" },
            { value: "fixed-deposit", label: "Fixed Deposit" },
            { value: "wallet", label: "Wallet" },
          ]}
        />
      </FilterBar>

      {/* Accounts Table */}
      <DashCard>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                {["Account", "Owner", "Type", "Balance", "Interest", "Status", "Last Activity", "Actions"].map((h) => (
                  <th key={h} className="text-left py-3 px-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((acc, i) => (
                  <motion.tr key={acc.id} initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: i * 0.03 } }} exit={{ opacity: 0 }} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="py-3 px-2">
                      <p className="font-mono text-gray-900 dark:text-white">{acc.accountNumber}</p>
                      <p className="text-[10px] text-gray-400">{acc.id}</p>
                    </td>
                    <td className="py-3 px-2">
                      <p className="font-medium text-gray-900 dark:text-white">{acc.owner}</p>
                      <p className="text-[10px] text-gray-400">{acc.email}</p>
                    </td>
                    <td className="py-3 px-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium capitalize ${accountTypeColors[acc.type]}`}>
                        {accountTypeIcons[acc.type]}
                        {acc.type.replace("-", " ")}
                      </span>
                    </td>
                    <td className="py-3 px-2 font-semibold text-gray-900 dark:text-white">€{acc.balance.toLocaleString()}</td>
                    <td className="py-3 px-2 text-gray-600 dark:text-gray-300">{acc.interestRate > 0 ? `${acc.interestRate}%` : "—"}</td>
                    <td className="py-3 px-2"><StatusBadge status={acc.status} /></td>
                    <td className="py-3 px-2 text-gray-400">{new Date(acc.lastActivity).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-1">
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors" title="View Details">
                          <Eye size={14} />
                        </motion.button>
                        {acc.status === "active" && (
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => toast.warning(`Account ${acc.accountNumber} frozen`)} className="p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/20 text-amber-500 transition-colors" title="Freeze">
                            <Lock size={14} />
                          </motion.button>
                        )}
                        {acc.status === "frozen" && (
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => toast.success(`Account ${acc.accountNumber} unfrozen`)} className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-emerald-500 transition-colors" title="Unfreeze">
                            <Unlock size={14} />
                          </motion.button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </DashCard>

      {filtered.length === 0 && (
        <DashCard className="text-center py-12">
          <Search size={32} className="mx-auto mb-2 text-gray-300 dark:text-gray-600" />
          <p className="text-sm text-gray-500 dark:text-gray-400">No accounts match your filters</p>
        </DashCard>
      )}
    </PageContainer>
  );
}
