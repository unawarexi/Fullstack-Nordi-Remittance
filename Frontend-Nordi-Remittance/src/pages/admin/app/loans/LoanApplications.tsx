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
import { useLoansManagement } from "../../admin-usecase/useLoansManagement";

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
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Loans" }]}
        actions={
          <div className="flex gap-2">
            <ActionButton label="Export" icon={<Download size={14} />} onClick={() => {}} variant="secondary" />
            <ActionButton label="Refresh" icon={<RefreshCw size={14} />} onClick={() => refetch()} />
          </div>
        }
      />

      <StatsGrid>
        <StatCard
          label="Total Portfolio"
          value={`€${(stats.totalDisbursed / 1000).toFixed(0)}K`}
          icon={<DollarSign size={18} />}
          iconColor="from-blue-500 to-blue-600"
          positive
          index={0}
        />
        <StatCard
          label="Active Loans"
          value={stats.activeLoans}
          icon={<Banknote size={18} />}
          iconColor="from-emerald-500 to-emerald-600"
          index={1}
        />
        <StatCard
          label="Pending Applications"
          value={stats.pendingApplications}
          icon={<Clock size={18} />}
          iconColor="from-amber-500 to-amber-600"
          index={2}
        />
        <StatCard
          label="Overdue"
          value={stats.overdueLoans}
          icon={<AlertTriangle size={18} />}
          iconColor="from-rose-500 to-rose-600"
          change={stats.overdueLoans > 0 ? "Attention needed" : ""}
          positive={false}
          index={3}
        />
      </StatsGrid>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
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
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                    {/* Loan Info */}
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 text-white">
                        <Banknote size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{loan.applicant}</p>
                        <p className="text-[10px] text-gray-400 sm:text-xs">
                          {loan.id} · {typeLabels[loan.type]}
                        </p>
                      </div>
                    </div>

                    {/* Amount & Rate */}
                    <div className="flex flex-shrink-0 items-center gap-6">
                      <div>
                        <p className="text-[10px] text-gray-400">Amount</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          €{loan.amount.toLocaleString()}
                        </p>
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
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          €{loan.monthlyPayment.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Repayment Progress */}
                    {loan.status === "active" || loan.status === "delinquent" || loan.status === "completed" ? (
                      <div className="hidden w-28 flex-shrink-0 lg:block">
                        <p className="mb-1 text-[10px] text-gray-400">Repaid {repaidPercent.toFixed(0)}%</p>
                        <ProgressBar
                          value={repaidPercent}
                          color={
                            loan.status === "delinquent"
                              ? "bg-rose-500"
                              : loan.status === "completed"
                                ? "bg-emerald-500"
                                : "bg-blue-500"
                          }
                        />
                      </div>
                    ) : null}

                    {/* Status */}
                    <div className="flex flex-shrink-0 items-center gap-2">
                      <StatusBadge status={loan.status} />
                      {loan.status === "delinquent" && "daysOverdue" in loan && (
                        <span className="text-[10px] font-medium text-rose-600 dark:text-rose-400">
                          {(loan as any).daysOverdue}d overdue
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-shrink-0 items-center gap-1">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                      >
                        <Eye size={14} />
                      </motion.button>
                      {loan.status === "pending" && (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => toast.success(`Loan ${loan.id} approved`)}
                            className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/50"
                          >
                            <CheckCircle size={14} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => toast.error(`Loan ${loan.id} rejected`)}
                            className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/50"
                          >
                            <XCircle size={14} />
                          </motion.button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Rejection Reason */}
                  {loan.status === "rejected" && "rejectionReason" in loan && (
                    <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-2 dark:border-rose-900 dark:bg-rose-950/30">
                      <p className="text-[10px] text-rose-600 dark:text-rose-400">
                        Rejection: {(loan as any).rejectionReason}
                      </p>
                    </div>
                  )}
                </DashCard>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <DashCard className="py-12 text-center">
          <Banknote size={32} className="mx-auto mb-2 text-gray-300 dark:text-gray-600" />
          <p className="text-sm text-gray-500 dark:text-gray-400">No loans found matching your criteria</p>
        </DashCard>
      )}
    </PageContainer>
  );
}
