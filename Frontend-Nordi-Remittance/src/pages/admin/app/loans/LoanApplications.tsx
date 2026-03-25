import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Banknote,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Eye,
  Download,
  RefreshCw,
  Calendar,
  Percent,
  Users,
} from "lucide-react";
import {
  PageContainer,
  DashCard,
  StatCard,
  StatsGrid,
  FilterBar,
  FilterSelect,
  FilterPill,
  ActionButton,
  StatusBadge,
  SectionHeader,
  ProgressBar,
} from "@components/shared/DashboardPrimitives";
import { PageHeader } from "@components/shared/PageHeader";
import { useToast } from "@store/toast.store";

const statusFilters = ["All", "Pending", "Approved", "Rejected", "Active", "Delinquent", "Completed"];

const sampleLoans = [
  { id: "LN-001", user: "Anna Johansson", email: "anna@example.com", type: "personal", amount: 25000, currency: "EUR", rate: 5.9, term: 36, monthlyPayment: 760, outstanding: 18500, status: "active", appliedAt: "2026-01-15", disbursedAt: "2026-01-20", nextPayment: "2026-04-01" },
  { id: "LN-002", user: "Erik Lundgren", email: "erik@example.com", type: "business", amount: 150000, currency: "EUR", rate: 4.5, term: 60, monthlyPayment: 2800, outstanding: 150000, status: "pending", appliedAt: "2026-03-20", disbursedAt: null, nextPayment: null },
  { id: "LN-003", user: "Sofia Bergman", email: "sofia@example.com", type: "mortgage", amount: 350000, currency: "EUR", rate: 3.2, term: 240, monthlyPayment: 1980, outstanding: 342000, status: "active", appliedAt: "2025-06-10", disbursedAt: "2025-07-01", nextPayment: "2026-04-01" },
  { id: "LN-004", user: "Lars Nilsson", email: "lars@example.com", type: "personal", amount: 10000, currency: "EUR", rate: 7.2, term: 24, monthlyPayment: 450, outstanding: 4200, status: "delinquent", appliedAt: "2025-08-05", disbursedAt: "2025-08-10", nextPayment: "2026-03-01", daysOverdue: 21 },
  { id: "LN-005", user: "Maria Svensson", email: "maria@example.com", type: "auto", amount: 45000, currency: "EUR", rate: 4.8, term: 48, monthlyPayment: 1030, outstanding: 45000, status: "pending", appliedAt: "2026-03-21", disbursedAt: null, nextPayment: null },
  { id: "LN-006", user: "Olof Andersson", email: "olof@example.com", type: "personal", amount: 5000, currency: "EUR", rate: 8.5, term: 12, monthlyPayment: 440, outstanding: 0, status: "completed", appliedAt: "2025-03-01", disbursedAt: "2025-03-05", nextPayment: null },
  { id: "LN-007", user: "Karin Holm", email: "karin@example.com", type: "business", amount: 80000, currency: "EUR", rate: 5.1, term: 48, monthlyPayment: 1850, outstanding: 80000, status: "rejected", appliedAt: "2026-03-18", disbursedAt: null, nextPayment: null, rejectionReason: "Insufficient credit score" },
];

const typeLabels: Record<string, string> = {
  personal: "Personal Loan",
  business: "Business Loan",
  mortgage: "Mortgage",
  auto: "Auto Loan",
};

export default function LoanApplications() {
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [activeStatus, setActiveStatus] = useState("All");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = sampleLoans.filter((loan) => {
    const matchesSearch =
      !search ||
      loan.user.toLowerCase().includes(search.toLowerCase()) ||
      loan.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      activeStatus === "All" ||
      loan.status.toLowerCase() === activeStatus.toLowerCase();
    const matchesType = typeFilter === "all" || loan.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalPortfolio = sampleLoans.reduce((a, l) => a + l.outstanding, 0);
  const activeLoans = sampleLoans.filter((l) => l.status === "active").length;
  const pendingApps = sampleLoans.filter((l) => l.status === "pending").length;
  const delinquent = sampleLoans.filter((l) => l.status === "delinquent").length;

  return (
    <PageContainer>
      <PageHeader
        title="Loan Management"
        subtitle="Review applications, manage active loans, and monitor repayments"
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Loans" },
        ]}
        actions={
          <div className="flex gap-2">
            <ActionButton label="Export" icon={<Download size={14} />} onClick={() => {}} variant="secondary" />
            <ActionButton label="Refresh" icon={<RefreshCw size={14} />} onClick={() => {}} />
          </div>
        }
      />

      <StatsGrid>
        <StatCard label="Total Portfolio" value={`€${(totalPortfolio / 1000).toFixed(0)}K`} icon={<DollarSign size={18} />} iconColor="from-blue-500 to-blue-600" change="+€45K" positive index={0} />
        <StatCard label="Active Loans" value={activeLoans} icon={<Banknote size={18} />} iconColor="from-emerald-500 to-emerald-600" index={1} />
        <StatCard label="Pending Applications" value={pendingApps} icon={<Clock size={18} />} iconColor="from-amber-500 to-amber-600" index={2} />
        <StatCard label="Delinquent" value={delinquent} icon={<AlertTriangle size={18} />} iconColor="from-rose-500 to-rose-600" change={delinquent > 0 ? "Attention needed" : ""} positive={false} index={3} />
      </StatsGrid>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {statusFilters.map((s) => (
          <FilterPill key={s} label={s} active={activeStatus === s} onClick={() => setActiveStatus(s)} />
        ))}
      </div>

      <FilterBar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search by name or loan ID...">
        <FilterSelect
          value={typeFilter}
          onChange={setTypeFilter}
          options={[
            { value: "all", label: "All Types" },
            { value: "personal", label: "Personal" },
            { value: "business", label: "Business" },
            { value: "mortgage", label: "Mortgage" },
            { value: "auto", label: "Auto" },
          ]}
        />
      </FilterBar>

      {/* Loans List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((loan, i) => {
            const repaidPercent = loan.amount > 0 ? ((loan.amount - loan.outstanding) / loan.amount) * 100 : 0;
            return (
              <motion.div
                key={loan.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0, transition: { delay: i * 0.04 } }}
                exit={{ opacity: 0, x: -20 }}
              >
                <DashCard>
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Loan Info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white flex-shrink-0">
                        <Banknote size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{loan.user}</p>
                        <p className="text-[10px] sm:text-xs text-gray-400">{loan.id} · {typeLabels[loan.type]}</p>
                      </div>
                    </div>

                    {/* Amount & Rate */}
                    <div className="flex items-center gap-6 flex-shrink-0">
                      <div>
                        <p className="text-[10px] text-gray-400">Amount</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">€{loan.amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400">Rate</p>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{loan.rate}%</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400">Term</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{loan.term}mo</p>
                      </div>
                      <div className="hidden sm:block">
                        <p className="text-[10px] text-gray-400">Monthly</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">€{loan.monthlyPayment.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Repayment Progress */}
                    {loan.status === "active" || loan.status === "delinquent" || loan.status === "completed" ? (
                      <div className="w-28 flex-shrink-0 hidden lg:block">
                        <p className="text-[10px] text-gray-400 mb-1">Repaid {repaidPercent.toFixed(0)}%</p>
                        <ProgressBar
                          value={repaidPercent}
                          color={loan.status === "delinquent" ? "bg-rose-500" : loan.status === "completed" ? "bg-emerald-500" : "bg-blue-500"}
                        />
                      </div>
                    ) : null}

                    {/* Status */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <StatusBadge status={loan.status} />
                      {loan.status === "delinquent" && "daysOverdue" in loan && (
                        <span className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">{(loan as any).daysOverdue}d overdue</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400">
                        <Eye size={14} />
                      </motion.button>
                      {loan.status === "pending" && (
                        <>
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => toast.success(`Loan ${loan.id} approved`)} className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle size={14} />
                          </motion.button>
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => toast.error(`Loan ${loan.id} rejected`)} className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-400">
                            <XCircle size={14} />
                          </motion.button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Rejection Reason */}
                  {loan.status === "rejected" && "rejectionReason" in loan && (
                    <div className="mt-3 p-2 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900">
                      <p className="text-[10px] text-rose-600 dark:text-rose-400">Rejection: {(loan as any).rejectionReason}</p>
                    </div>
                  )}
                </DashCard>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <DashCard className="text-center py-12">
          <Banknote size={32} className="mx-auto mb-2 text-gray-300 dark:text-gray-600" />
          <p className="text-sm text-gray-500 dark:text-gray-400">No loans found matching your criteria</p>
        </DashCard>
      )}
    </PageContainer>
  );
}
