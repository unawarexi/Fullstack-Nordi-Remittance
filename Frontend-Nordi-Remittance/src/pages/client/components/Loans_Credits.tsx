// ============================================================================
// LOANS & CREDITS — Main loans dashboard
// ============================================================================

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  Plus,
  Calculator,
  FileText,
  TrendingUp,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  Percent,
  Calendar,
  BarChart3,
  ArrowRight,
  Shield,
} from "lucide-react";
import PageHeader from "@components/shared/PageHeader";
import { EmptyState } from "@components/shared/EmptyState";
import {
  StatsGridSkeleton,
  TableSkeleton,
  ChartSkeleton,
} from "@components/skeletons";
import {
  useLoans,
  useLoanProducts,
} from "@hooks/queries/useLoans";
import { useUIStore } from "@store/ui.store";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const statusColors: Record<string, { text: string; bg: string }> = {
  active: { text: "text-emerald-700", bg: "bg-emerald-50" },
  approved: { text: "text-blue-700", bg: "bg-blue-50" },
  pending: { text: "text-amber-700", bg: "bg-amber-50" },
  rejected: { text: "text-rose-700", bg: "bg-rose-50" },
  closed: { text: "text-gray-700", bg: "bg-gray-50" },
  disbursed: { text: "text-indigo-700", bg: "bg-indigo-50" },
};

const Loans_Credits: React.FC = () => {
  const navigate = useNavigate();
  const showBalances = useUIStore((s) => s.preferences.showBalances);

  const { data: loansData, isLoading: loansLoading } = useLoans();
  const { data: productsData, isLoading: productsLoading } = useLoanProducts();

  const loans = (loansData as any)?.data ? (loansData as any).data : loansData || [];
  const products = (productsData as any)?.data ? (productsData as any).data : productsData || [];

  const isLoading = loansLoading || productsLoading;

  const formatCurrency = (amount: number, currency = "USD") =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(amount);

  // Computed stats
  const totalBorrowed = loans.reduce((a: number, l: any) => a + (l.amount || l.principal || 0), 0);
  const totalOutstanding = loans.reduce((a: number, l: any) => a + (l.outstandingBalance || l.remainingAmount || 0), 0);
  const activeLoans = loans.filter((l: any) => l.status === "active" || l.status === "disbursed");

  return (
    <motion.div
      className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <PageHeader
          title="Loans & Credit"
          subtitle="Manage your loans, credit lines, and applications"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Loans & Credit" },
          ]}
          actions={
            <div className="flex gap-3">
              <motion.button
                onClick={() => navigate("/customer/loans/calculator")}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Calculator size={16} />
                Calculator
              </motion.button>
              <motion.button
                onClick={() => navigate("/customer/loans/apply")}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-sm text-sm font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus size={16} />
                Apply for Loan
              </motion.button>
            </div>
          }
        />
      </motion.div>

      {/* Stats */}
      {isLoading ? (
        <StatsGridSkeleton count={4} />
      ) : (
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6" variants={itemVariants}>
          {[
            { label: "Active Loans", value: String(activeLoans.length), icon: <Briefcase size={20} />, color: "from-indigo-500 to-purple-500" },
            { label: "Total Borrowed", value: showBalances ? formatCurrency(totalBorrowed) : "••••••", icon: <DollarSign size={20} />, color: "from-emerald-500 to-teal-500" },
            { label: "Outstanding", value: showBalances ? formatCurrency(totalOutstanding) : "••••••", icon: <BarChart3 size={20} />, color: "from-amber-500 to-orange-500" },
            { label: "Credit Score", value: "750", icon: <Shield size={20} />, color: "from-violet-500 to-purple-500" },
          ].map((stat) => (
            <motion.div key={stat.label} className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow" whileHover={{ y: -2 }}>
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.color} text-white`}>{stat.icon}</div>
              </div>
              <p className="text-2xl font-bold text-indigo-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Loans */}
        <motion.div className="lg:col-span-2" variants={itemVariants}>
          {isLoading ? (
            <TableSkeleton rows={4} cols={5} />
          ) : loans.length === 0 ? (
            <EmptyState
              title="No Loans Yet"
              description="Explore our loan products and apply for financing that suits your needs."
              action={{
                label: "Browse Products",
                onClick: () => navigate("/customer/loans/apply"),
              }}
            />
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-semibold text-indigo-900">My Loans</h3>
                <motion.button
                  onClick={() => navigate("/customer/loans/overview")}
                  className="text-sm text-indigo-600 font-medium flex items-center gap-1"
                  whileHover={{ x: 2 }}
                >
                  View All <ChevronRight size={14} />
                </motion.button>
              </div>

              <div className="divide-y divide-gray-50">
                {loans.slice(0, 5).map((loan: any, i: number) => {
                  const status = loan.status?.toLowerCase() || "active";
                  const sConfig = statusColors[status] || statusColors.active;
                  const progress = loan.amount
                    ? ((loan.amount - (loan.outstandingBalance || loan.remainingAmount || 0)) / loan.amount) * 100
                    : 0;

                  return (
                    <motion.div
                      key={loan._id || loan.id || i}
                      className="p-4 hover:bg-indigo-50/30 cursor-pointer transition-colors"
                      whileHover={{ x: 3 }}
                      onClick={() => navigate("/customer/loans/overview")}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">
                            {loan.name || loan.loanType || loan.productName || "Personal Loan"}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {loan.reference || loan.loanId || `Loan #${i + 1}`}
                          </p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${sConfig.text} ${sConfig.bg}`}>
                          {status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg font-bold text-indigo-900">
                          {showBalances ? formatCurrency(loan.amount || loan.principal || 0) : "••••••"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {loan.interestRate || loan.rate || "0"}% APR
                        </span>
                      </div>
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {progress.toFixed(0)}% repaid
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>

        {/* Loan Products */}
        <motion.div variants={itemVariants}>
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="font-semibold text-indigo-900 mb-4">
              Available Products
            </h3>
            <div className="space-y-3">
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
                  className="p-3 rounded-lg border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 cursor-pointer transition-all"
                  whileHover={{ x: 3 }}
                  onClick={() => navigate("/customer/loans/apply")}
                >
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium text-gray-900">
                      {p.name || p.productName}
                    </h4>
                    <ArrowRight size={14} className="text-indigo-400" />
                  </div>
                  <div className="flex gap-4 mt-1">
                    <span className="text-xs text-gray-500">
                      From {p.rate || p.interestRate || "—"}
                    </span>
                    <span className="text-xs text-gray-500">
                      Up to {formatCurrency(p.maxAmount || p.maximumAmount || 0)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-4 space-y-2">
            {[
              { label: "Loan Calculator", icon: <Calculator size={16} />, route: "/customer/loans/calculator" },
              { label: "Credit Score", icon: <TrendingUp size={16} />, route: "/customer/loans/credit-score" },
              { label: "Application Status", icon: <FileText size={16} />, route: "/customer/loans/overview" },
            ].map((link) => (
              <motion.button
                key={link.label}
                onClick={() => navigate(link.route)}
                className="w-full flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm hover:shadow-md text-left text-sm"
                whileHover={{ x: 3 }}
              >
                <span className="text-indigo-500">{link.icon}</span>
                <span className="font-medium text-gray-700">{link.label}</span>
                <ChevronRight size={14} className="text-gray-400 ml-auto" />
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Loans_Credits;
