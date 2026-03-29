// ============================================================================
// LOANS & CREDITS — Main loans dashboard (Dark mode + Shared Primitives)
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  Plus,
  Calculator,
  FileText,
  TrendingUp,
  ChevronRight,
  DollarSign,
  BarChart3,
  ArrowRight,
  Shield,
} from "lucide-react";
import PageHeader from "@components/shared/PageHeader";
import { EmptyState } from "@components/shared/EmptyState";
import {
  StatsGridSkeleton,
  TableSkeleton,
} from "@components/skeletons";
import {
  useClientLoans,
  useClientLoanProducts,
} from "../../domain/useLoansDomain";
import { useUIStore } from "@store/ui.store";
import {
  PageContainer,
  StatCard,
  StatsGrid,
  DashCard,
  StatusBadge,
  ProgressBar,
  ActionButton,
} from "@components/shared/DashboardPrimitives";
import { dashboardItemVariants, listItemRevealVariants } from "@core/animation/Animation";

/* eslint-disable @typescript-eslint/no-explicit-any */

const Loans_Credits: React.FC = () => {
  const navigate = useNavigate();
  const showBalances = useUIStore((s) => s.preferences.showBalances);

  const { loans, isLoading: loansLoading } = useClientLoans();
  const { products, isLoading: productsLoading } = useClientLoanProducts();

  const isLoading = loansLoading || productsLoading;

  const formatCurrency = (amount: number, currency = "USD") =>
    new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 2 }).format(amount);

  const totalBorrowed = loans.reduce((a: number, l: any) => a + (l.amount || l.principal || 0), 0);
  const totalOutstanding = loans.reduce((a: number, l: any) => a + (l.outstandingBalance || l.remainingAmount || 0), 0);
  const activeLoans = loans.filter((l: any) => l.status === "active" || l.status === "disbursed");

  return (
    <PageContainer>
      {/* Header */}
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Loans & Credit"
          subtitle="Manage your loans, credit lines, and applications"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Loans & Credit" },
          ]}
          actions={
            <div className="flex gap-2 sm:gap-3">
              <ActionButton label="Calculator" icon={<Calculator size={16} />} variant="secondary" onClick={() => navigate("/customer/loans/calculator")} />
              <ActionButton label="Apply for Loan" icon={<Plus size={16} />} onClick={() => navigate("/customer/loans/apply")} />
            </div>
          }
        />
      </motion.div>

      {/* Stats */}
      {isLoading ? (
        <StatsGridSkeleton count={4} />
      ) : (
        <StatsGrid cols={4}>
          <StatCard label="Active Loans" value={activeLoans.length} icon={<Briefcase size={20} />} iconColor="from-indigo-500 to-purple-500" index={0} />
          <StatCard label="Total Borrowed" value={showBalances ? formatCurrency(totalBorrowed) : "••••••"} icon={<DollarSign size={20} />} iconColor="from-emerald-500 to-teal-500" index={1} />
          <StatCard label="Outstanding" value={showBalances ? formatCurrency(totalOutstanding) : "••••••"} icon={<BarChart3 size={20} />} iconColor="from-amber-500 to-orange-500" index={2} />
          <StatCard label="Credit Score" value="750" icon={<Shield size={20} />} iconColor="from-violet-500 to-purple-500" index={3} />
        </StatsGrid>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Active Loans */}
        <motion.div className="lg:col-span-2" variants={dashboardItemVariants}>
          {isLoading ? (
            <TableSkeleton rows={4} cols={5} />
          ) : loans.length === 0 ? (
            <EmptyState
              title="No Loans Yet"
              description="Explore our loan products and apply for financing that suits your needs."
              action={{ label: "Browse Products", onClick: () => navigate("/customer/loans/apply") }}
            />
          ) : (
            <DashCard padding="none">
              <div className="p-3 sm:p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">My Loans</h3>
                <motion.button
                  onClick={() => navigate("/customer/loans/overview")}
                  className="text-[10px] sm:text-xs text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1 hover:text-indigo-700 dark:hover:text-indigo-300"
                  whileHover={{ x: 2 }}
                >
                  View All <ChevronRight size={14} />
                </motion.button>
              </div>

              <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {loans.slice(0, 5).map((loan: any, i: number) => {
                  const status = loan.status?.toLowerCase() || "active";
                  const progress = loan.amount
                    ? ((loan.amount - (loan.outstandingBalance || loan.remainingAmount || 0)) / loan.amount) * 100
                    : 0;

                  return (
                    <motion.div
                      key={loan._id || loan.id || i}
                      className="p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                      custom={i}
                      variants={listItemRevealVariants}
                      initial="hidden"
                      animate="visible"
                      onClick={() => navigate("/customer/loans/overview")}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                            {loan.name || loan.loanType || loan.productName || "Personal Loan"}
                          </h4>
                          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                            {loan.reference || loan.loanId || `Loan #${i + 1}`}
                          </p>
                        </div>
                        <StatusBadge status={status} />
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                          {showBalances ? formatCurrency(loan.amount || loan.principal || 0) : "••••••"}
                        </span>
                        <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                          {loan.interestRate || loan.rate || "0"}% APR
                        </span>
                      </div>
                      <ProgressBar value={Math.min(progress, 100)} color="from-indigo-500 to-purple-500" />
                      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {progress.toFixed(0)}% repaid
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </DashCard>
          )}
        </motion.div>

        {/* Loan Products */}
        <motion.div variants={dashboardItemVariants} className="space-y-3 sm:space-y-4">
          <DashCard>
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Available Products
            </h3>
            <div className="space-y-2 sm:space-y-3">
              {(products.length > 0
                ? products.slice(0, 4)
                : [
                    { name: "Personal Loan", rate: "8.5%", maxAmount: 50000 },
                    { name: "Business Loan", rate: "10.2%", maxAmount: 200000 },
                    { name: "Education Loan", rate: "6.8%", maxAmount: 100000 },
                    { name: "Home Improvement", rate: "7.5%", maxAmount: 75000 },
                  ]
              ).map((p: any, i: number) => (
                <motion.div
                  key={i}
                  className="p-2.5 sm:p-3 rounded-lg border border-gray-100 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-all"
                  whileHover={{ x: 3 }}
                  onClick={() => navigate("/customer/loans/apply")}
                >
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                      {p.name || p.productName}
                    </h4>
                    <ArrowRight size={14} className="text-indigo-400 dark:text-indigo-500" />
                  </div>
                  <div className="flex gap-3 sm:gap-4 mt-1">
                    <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                      From {p.rate || p.interestRate || "—"}
                    </span>
                    <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                      Up to {formatCurrency(p.maxAmount || p.maximumAmount || 0)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </DashCard>

          {/* Quick Links */}
          <div className="space-y-1.5 sm:space-y-2">
            {[
              { label: "Loan Calculator", icon: <Calculator size={16} />, route: "/customer/loans/calculator" },
              { label: "Credit Score", icon: <TrendingUp size={16} />, route: "/customer/loans/credit-score" },
              { label: "Application Status", icon: <FileText size={16} />, route: "/customer/loans/overview" },
            ].map((link) => (
              <DashCard key={link.label} padding="sm" className="cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 transition-all" hover>
                <motion.div
                  className="flex items-center gap-2.5 sm:gap-3"
                  onClick={() => navigate(link.route)}
                  whileHover={{ x: 3 }}
                >
                  <span className="text-indigo-500 dark:text-indigo-400">{link.icon}</span>
                  <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">{link.label}</span>
                  <ChevronRight size={14} className="text-gray-400 dark:text-gray-500 ml-auto" />
                </motion.div>
              </DashCard>
            ))}
          </div>
        </motion.div>
      </div>
    </PageContainer>
  );
};

export default Loans_Credits;
