import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight, ChevronLeft } from "lucide-react";
import { useTransferHistory } from "../../admin-usecase/useadmin-transaction-usecase";

const TransactionHistory = () => {
  const {
    transactions,
    total,
    isLoading,
    statusFilter,
    timeFilter,
    page,
    pagination,
    pageNumbers,
    setStatusFilter,
    setTimeFilter,
    setPage,
  } = useTransferHistory();
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const totalPages = pagination.totalPages;
  const currentPage = pagination.page;
  const timeFilters = ["3 years", "1 year", "6 months", "30 days"];
  const statusFilters = ["Approved", "Pending", "Liquidated"];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-400";
      case "Liquidated":
        return "bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-400";
      case "Awaiting Approval":
        return "bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-400";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400";
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-emerald-500";
      case "Liquidated":
        return "bg-amber-500";
      case "Awaiting Approval":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white transition-colors duration-200 dark:border-gray-800 dark:bg-gray-900">
      {/* Header / Filters */}
      <div className="border-b border-gray-200 p-4 dark:border-gray-800 sm:p-5">
        <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Transaction History</h2>

        <div className="flex flex-wrap items-center gap-2">
          {/* Time Filters */}
          <div className="flex space-x-1.5">
            {timeFilters.map((filter) => (
              <motion.button
                key={filter}
                className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                  timeFilter === filter
                    ? "border-gray-900 bg-gray-900 font-medium text-white dark:border-gray-100 dark:bg-gray-100 dark:text-gray-900"
                    : "border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                }`}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTimeFilter(filter as any)}
              >
                {filter}
              </motion.button>
            ))}
          </div>

          <div className="mx-1 hidden h-5 w-px bg-gray-200 dark:bg-gray-700 sm:block" />

          {/* Status Filters */}
          <div className="flex space-x-1.5">
            {statusFilters.map((filter) => (
              <motion.button
                key={filter}
                className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                  statusFilter === filter.toLowerCase()
                    ? "border-indigo-500 bg-indigo-50 font-medium text-indigo-700 dark:border-indigo-400 dark:bg-indigo-950/50 dark:text-indigo-300"
                    : "border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                }`}
                whileTap={{ scale: 0.95 }}
                onClick={() => setStatusFilter(filter.toLowerCase() as any)}
              >
                {filter}
              </motion.button>
            ))}
          </div>

          {/* Filter Dropdown */}
          <div className="relative ml-auto">
            <motion.button
              className="flex items-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-500 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilterDropdown((prev) => !prev)}
            >
              Filter by
              <ChevronDown size={14} className="ml-1" />
            </motion.button>

            <AnimatePresence>
              {showFilterDropdown && (
                <motion.div
                  className="absolute right-0 z-50 mt-2 w-48 rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900 dark:shadow-none"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="py-1">
                    <div className="border-b border-gray-100 px-4 py-2 text-xs font-medium text-gray-500 dark:border-gray-800 dark:text-gray-400">
                      Sort by
                    </div>
                    {["Date (Newest first)", "Date (Oldest first)", "Amount (High to low)", "Amount (Low to high)"].map(
                      (opt) => (
                        <button
                          key={opt}
                          className="w-full px-4 py-2 text-left text-xs text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                          onClick={() => setShowFilterDropdown(false)}
                        >
                          {opt}
                        </button>
                      ),
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
              <th className="whitespace-nowrap px-4 py-3 text-left text-[10px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 sm:text-xs">
                Transaction ID
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-[10px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 sm:text-xs">
                Type
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-[10px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 sm:text-xs">
                Amount
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-[10px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 sm:text-xs">
                Status
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-[10px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 sm:text-xs">
                Date
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-[10px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 sm:text-xs">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction: any, index: number) => (
              <motion.tr
                key={transaction.id + index}
                className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03, duration: 0.25 }}
              >
                <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-gray-700 dark:text-gray-300">
                  {transaction.id}
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 text-xs text-gray-700 dark:text-gray-300">
                  {transaction.type}
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 text-xs font-medium text-gray-900 dark:text-white">
                  {transaction.amount}
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className={`h-1.5 w-1.5 rounded-full ${getStatusDot(transaction.status)}`} />
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${getStatusColor(transaction.status)}`}
                    >
                      {transaction.status}
                    </span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 text-xs text-gray-500 dark:text-gray-400">
                  {transaction.date
                    ? new Date(transaction.date).toLocaleDateString("en-GB", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })
                    : ""}
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 text-xs">
                  <motion.button
                    className="rounded-lg border border-gray-200 px-3 py-1 text-xs text-indigo-600 transition-colors hover:text-indigo-800 dark:border-gray-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                    whileTap={{ scale: 0.95 }}
                  >
                    View
                  </motion.button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-gray-800 sm:px-5">
        <p className="text-[10px] text-gray-500 dark:text-gray-400 sm:text-xs">
          Page {currentPage} of {totalPages}
        </p>

        <div className="flex items-center space-x-1">
          <motion.button
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-white transition-colors dark:border-gray-700 dark:bg-gray-900"
            whileTap={{ scale: 0.9 }}
            onClick={() => setPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft
              size={14}
              className={currentPage === 1 ? "text-gray-300 dark:text-gray-600" : "text-gray-600 dark:text-gray-300"}
            />
          </motion.button>

          {pageNumbers.map((pg: number) => (
            <motion.button
              key={pg}
              className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs transition-colors ${
                currentPage === pg
                  ? "bg-indigo-600 text-white dark:bg-indigo-500"
                  : "border border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              }`}
              whileTap={{ scale: 0.9 }}
              onClick={() => setPage(pg)}
            >
              {pg}
            </motion.button>
          ))}

          <motion.button
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-white transition-colors dark:border-gray-700 dark:bg-gray-900"
            whileTap={{ scale: 0.9 }}
            onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight
              size={14}
              className={
                currentPage === totalPages ? "text-gray-300 dark:text-gray-600" : "text-gray-600 dark:text-gray-300"
              }
            />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;
