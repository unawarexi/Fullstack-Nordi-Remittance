import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight, ChevronLeft } from "lucide-react";

interface Transaction {
  id: string;
  type: string;
  amount: string;
  status: "Approved" | "Liquidated" | "Awaiting Approval";
  date: string;
}

const TransactionHistory = () => {
  const [activeFilter, setActiveFilter] = useState("3 years");
  const [statusFilter, setStatusFilter] = useState("Approved");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const transactions: Transaction[] = [
    { id: "TXN0012345", type: "Liquidation", amount: "₦200,000.00", status: "Approved", date: "2024-09-12" },
    { id: "TXN0012346", type: "Awaiting Approval", amount: "₦200,000.00", status: "Liquidated", date: "2024-09-12" },
    { id: "TXN0012347", type: "Withdrawal", amount: "₦200,000.00", status: "Approved", date: "2024-09-12" },
    { id: "TXN0012348", type: "Collateral", amount: "₦200,000.00", status: "Approved", date: "2024-09-12" },
    { id: "TXN0012349", type: "Collateral", amount: "₦200,000.00", status: "Approved", date: "2024-09-12" },
    { id: "TXN0012350", type: "Deposit", amount: "₦200,000.00", status: "Approved", date: "2024-09-12" },
    { id: "TXN0012351", type: "Collateral", amount: "₦200,000.00", status: "Approved", date: "2024-09-12" },
    { id: "TXN0012352", type: "Stock Investment", amount: "₦200,000.00", status: "Approved", date: "2024-09-12" },
    { id: "TXN0012353", type: "Collateral", amount: "₦200,000.00", status: "Awaiting Approval", date: "2024-09-12" },
    { id: "TXN0012354", type: "Transfer", amount: "₦200,000.00", status: "Approved", date: "2024-09-12" },
  ];

  const totalPages = 30;
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
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden transition-colors duration-200">
      {/* Header / Filters */}
      <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Transaction History</h2>

        <div className="flex flex-wrap gap-2 items-center">
          {/* Time Filters */}
          <div className="flex space-x-1.5">
            {timeFilters.map((filter) => (
              <motion.button
                key={filter}
                className={`px-3 py-1.5 rounded-lg border text-xs transition-colors ${
                  activeFilter === filter
                    ? "border-gray-900 dark:border-gray-100 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-medium"
                    : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </motion.button>
            ))}
          </div>

          <div className="hidden sm:block w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />

          {/* Status Filters */}
          <div className="flex space-x-1.5">
            {statusFilters.map((filter) => (
              <motion.button
                key={filter}
                className={`px-3 py-1.5 rounded-lg border text-xs transition-colors ${
                  statusFilter === filter
                    ? "border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-medium"
                    : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                whileTap={{ scale: 0.95 }}
                onClick={() => setStatusFilter(filter)}
              >
                {filter}
              </motion.button>
            ))}
          </div>

          {/* Filter Dropdown */}
          <div className="relative ml-auto">
            <motion.button
              className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 flex items-center text-xs hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilterDropdown((prev) => !prev)}
            >
              Filter by
              <ChevronDown size={14} className="ml-1" />
            </motion.button>

            <AnimatePresence>
              {showFilterDropdown && (
                <motion.div
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg dark:shadow-none z-50"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="py-1">
                    <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 font-medium border-b border-gray-100 dark:border-gray-800">Sort by</div>
                    {["Date (Newest first)", "Date (Oldest first)", "Amount (High to low)", "Amount (Low to high)"].map((opt) => (
                      <button
                        key={opt}
                        className="px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 w-full text-left transition-colors"
                        onClick={() => setShowFilterDropdown(false)}
                      >
                        {opt}
                      </button>
                    ))}
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
            <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <th className="px-4 py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Transaction ID</th>
              <th className="px-4 py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Type</th>
              <th className="px-4 py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Amount</th>
              <th className="px-4 py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Status</th>
              <th className="px-4 py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Date</th>
              <th className="px-4 py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Action</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction, index) => (
              <motion.tr
                key={transaction.id + index}
                className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03, duration: 0.25 }}
              >
                <td className="px-4 py-2.5 text-xs font-mono text-gray-700 dark:text-gray-300 whitespace-nowrap">{transaction.id}</td>
                <td className="px-4 py-2.5 text-xs text-gray-700 dark:text-gray-300 whitespace-nowrap">{transaction.type}</td>
                <td className="px-4 py-2.5 text-xs font-medium text-gray-900 dark:text-white whitespace-nowrap">{transaction.amount}</td>
                <td className="px-4 py-2.5 text-xs whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${getStatusDot(transaction.status)}`} />
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-2.5 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{transaction.date}</td>
                <td className="px-4 py-2.5 text-xs whitespace-nowrap">
                  <motion.button
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1 text-xs transition-colors"
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
      <div className="flex justify-between items-center px-4 sm:px-5 py-3 border-t border-gray-200 dark:border-gray-800">
        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
          Page {currentPage} of {totalPages}
        </p>

        <div className="flex items-center space-x-1">
          <motion.button
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 transition-colors"
            whileTap={{ scale: 0.9 }}
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={14} className={currentPage === 1 ? "text-gray-300 dark:text-gray-600" : "text-gray-600 dark:text-gray-300"} />
          </motion.button>

          {[1, 2, 3, 4, 5].map((page) => (
            <motion.button
              key={page}
              className={`w-7 h-7 flex text-xs items-center justify-center rounded-lg transition-colors ${
                currentPage === page
                  ? "bg-indigo-600 dark:bg-indigo-500 text-white"
                  : "border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
              whileTap={{ scale: 0.9 }}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </motion.button>
          ))}

          <motion.button
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 transition-colors"
            whileTap={{ scale: 0.9 }}
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight size={14} className={currentPage === totalPages ? "text-gray-300 dark:text-gray-600" : "text-gray-600 dark:text-gray-300"} />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;