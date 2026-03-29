import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight, ChevronLeft, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "@core/algo";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ============================================================================
// STATUS HELPERS
// ============================================================================
const getStatusColor = (status: string) => {
  const s = (status || "").toLowerCase();
  if (s === "completed" || s === "approved" || s === "success")
    return "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-400";
  if (s === "pending" || s === "awaiting approval" || s === "processing")
    return "bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-400";
  if (s === "failed" || s === "rejected" || s === "cancelled")
    return "bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-400";
  return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400";
};

const getStatusDot = (status: string) => {
  const s = (status || "").toLowerCase();
  if (s === "completed" || s === "approved" || s === "success") return "bg-emerald-500";
  if (s === "pending" || s === "awaiting approval" || s === "processing") return "bg-amber-500";
  if (s === "failed" || s === "rejected" || s === "cancelled") return "bg-rose-500";
  return "bg-gray-500";
};

const capitalize = (s: string) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ") : "";

const formatDate = (d: string) => {
  try {
    return new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return d;
  }
};

// ============================================================================
// PROPS
// ============================================================================
interface ClientTransferHistoryProps {
  transactions: TransactionItem[];
  isLoading: boolean;
}

// ============================================================================
// SKELETON
// ============================================================================
const TableSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
    <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-800">
      <div className="h-5 w-40 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-4" />
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-7 w-16 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
    <div className="p-4 space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-10 w-full bg-gray-100 dark:bg-gray-800/50 rounded animate-pulse" />
      ))}
    </div>
  </div>
);

// ============================================================================
// COMPONENT
// ============================================================================
const ClientTransferHistory: React.FC<ClientTransferHistoryProps> = ({
  transactions,
  isLoading,
}) => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  if (isLoading) return <TableSkeleton />;

  const typeFilters = ["All", "credit", "debit", "transfer"];
  const statusFilters = ["All", "completed", "pending", "failed"];

  // Filter transactions
  const filtered = transactions.filter((tx) => {
    const typeMatch = activeFilter === "All" || tx.type === activeFilter;
    const statusMatch =
      statusFilter === "All" || tx.status.toLowerCase() === statusFilter;
    return typeMatch && statusMatch;
  });

  const PAGE_SIZE = 8;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  // Page buttons
  const maxVisible = 5;
  const startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  const endPage = Math.min(totalPages, startPage + maxVisible - 1);
  const pageNumbers = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i,
  );

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden transition-colors duration-200">
      {/* Header / Filters */}
      <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
          Transaction History
        </h2>

        <div className="flex flex-wrap gap-2 items-center">
          {/* Type Filters */}
          <div className="flex space-x-1.5">
            {typeFilters.map((filter) => (
              <motion.button
                key={filter}
                className={`px-3 py-1.5 rounded-lg border text-xs transition-colors ${
                  activeFilter === filter
                    ? "border-gray-900 dark:border-gray-100 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-medium"
                    : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setActiveFilter(filter);
                  setCurrentPage(1);
                }}
              >
                {capitalize(filter)}
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
                onClick={() => {
                  setStatusFilter(filter);
                  setCurrentPage(1);
                }}
              >
                {capitalize(filter)}
              </motion.button>
            ))}
          </div>

          {/* Sort Dropdown */}
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
                    <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 font-medium border-b border-gray-100 dark:border-gray-800">
                      Sort by
                    </div>
                    {[
                      "Date (Newest first)",
                      "Date (Oldest first)",
                      "Amount (High to low)",
                      "Amount (Low to high)",
                    ].map((opt) => (
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
      {paged.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No transactions match your filters
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <th className="px-4 py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  Transaction
                </th>
                <th className="px-4 py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {paged.map((tx, index) => (
                <motion.tr
                  key={tx.id || index}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03, duration: 0.25 }}
                >
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <div>
                      <p className="text-xs font-medium text-gray-900 dark:text-white truncate max-w-[160px]">
                        {tx.title}
                      </p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate max-w-[160px]">
                        {tx.description}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium ${
                        tx.type === "credit"
                          ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400"
                          : tx.type === "debit"
                            ? "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400"
                            : "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400"
                      }`}
                    >
                      {capitalize(tx.type)}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-xs font-medium whitespace-nowrap">
                    <span
                      className={
                        tx.type === "credit"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-gray-900 dark:text-white"
                      }
                    >
                      {tx.type === "credit" ? "+" : tx.type === "debit" ? "-" : ""}
                      {formatCurrency(Math.abs(tx.amount), tx.currency)}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-xs whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${getStatusDot(tx.status)}`}
                      />
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(tx.status)}`}
                      >
                        {capitalize(tx.status)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {formatDate(tx.date)}
                  </td>
                  <td className="px-4 py-2.5 text-xs whitespace-nowrap">
                    <motion.button
                      className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1 text-xs transition-colors"
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate("/customer/transactions")}
                    >
                      <Eye size={12} />
                      View
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {filtered.length > PAGE_SIZE && (
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
              <ChevronLeft
                size={14}
                className={
                  currentPage === 1
                    ? "text-gray-300 dark:text-gray-600"
                    : "text-gray-600 dark:text-gray-300"
                }
              />
            </motion.button>

            {pageNumbers.map((page) => (
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
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
            >
              <ChevronRight
                size={14}
                className={
                  currentPage === totalPages
                    ? "text-gray-300 dark:text-gray-600"
                    : "text-gray-600 dark:text-gray-300"
                }
              />
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientTransferHistory;
