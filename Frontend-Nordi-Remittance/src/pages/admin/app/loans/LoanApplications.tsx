import React from "react";
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
import { useLoansManagement } from "../../domain/useLoansManagement";

const statusFilters = ["All", "Pending", "Approved", "Rejected", "Active", "Delinquent", "Completed"];

const typeLabels: Record<string, string> = {
  personal: "Personal Loan",
  business: "Business Loan",
  mortgage: "Mortgage",
  auto: "Auto Loan",
};

export default function LoanApplications() {
  const toast = useToast();
  const {
    loans: filtered,
    stats,
    search,
    setSearch,
    statusFilter: activeStatus,
    setStatusFilter: setActiveStatus,
    typeFilter,
    setTypeFilter,
    approveLoan,
    rejectLoan,
    refetch,
    isLoading,
  } = useLoansManagement();

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
            <ActionButton label="Refresh" icon={<RefreshCw size={14} />} onClick={() => refetch()} />
          </div>
        }
      />

      <StatsGrid>
        <StatCard label="Total Portfolio" value={`€${(stats.totalDisbursed / 1000).toFixed(0)}K`} icon={<DollarSign size={18} />} iconColor="from-blue-500 to-blue-600" positive index={0} />
        <StatCard label="Active Loans" value={stats.activeLoans} icon={<Banknote size={18} />} iconColor="from-emerald-500 to-emerald-600" index={1} />
        <StatCard label="Pending Applications" value={stats.pendingApplications} icon={<Clock size={18} />} iconColor="from-amber-500 to-amber-600" index={2} />
        <StatCard label="Overdue" value={stats.overdueLoans} icon={<AlertTriangle size={18} />} iconColor="from-rose-500 to-rose-600" change={stats.overdueLoans > 0 ? "Attention needed" : ""} positive={false} index={3} />
      </StatsGrid>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {statusFilters.map((s) => (
          <FilterPill key={s} label={s} active={activeStatus === s} onClick={() => setActiveStatus(s as any)} />
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
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{loan.applicant}</p>
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
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{loan.interestRate}%</p>
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
