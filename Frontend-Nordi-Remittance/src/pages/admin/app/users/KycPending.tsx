import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FileCheck,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import {
  PageContainer,
  StatsGrid,
  StatCard,
  DashCard,
  FilterBar,
  StatusBadge,
  ActionButton,
} from "@components/shared/DashboardPrimitives";
import { PageHeader } from "@components/shared/PageHeader";
import { TableSkeleton } from "@components/skeletons/Skeletons";
import { dashboardItemVariants } from "@core/animation/Animation";
import { useKycPendingUsers } from "./use-case/useKycPendingUsers";

const KycPending: React.FC = () => {
  const navigate = useNavigate();
  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const {
    pendingUsers,
    pagination,
    stats,
    isLoading,
    statsLoading,
    setPage,
    refetch,
    approveUser,
    rejectUser,
    isReviewing,
  } = useKycPendingUsers();

  const handleReject = () => {
    if (rejectModal && rejectReason.trim()) {
      rejectUser(rejectModal, rejectReason.trim());
      setRejectModal(null);
      setRejectReason("");
    }
  };

  return (
    <PageContainer className="[&>div]:max-w-full">
      <PageHeader
        title="KYC Pending Reviews"
        subtitle="Review and approve user verification requests"
        size="sm"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Users", href: "/admin/users/all" },
          { label: "KYC Pending" },
        ]}
        actions={
          <ActionButton
            label="Refresh"
            icon={<RefreshCw size={14} />}
            onClick={() => refetch()}
            variant="secondary"
          />
        }
      />

      {/* Stats */}
      <StatsGrid cols={4}>
        <StatCard
          label="Pending Reviews"
          value={stats.totalPending}
          icon={<Clock size={18} />}
          iconColor="from-amber-500 to-amber-600"
          index={0}
        />
        <StatCard
          label="Approved Today"
          value={stats.approvedToday}
          icon={<CheckCircle size={18} />}
          iconColor="from-emerald-500 to-emerald-600"
          index={1}
        />
        <StatCard
          label="Rejected Today"
          value={stats.rejectedToday}
          icon={<XCircle size={18} />}
          iconColor="from-rose-500 to-rose-600"
          index={2}
        />
        <StatCard
          label="Avg Review Time"
          value={stats.avgReviewTime}
          icon={<FileCheck size={18} />}
          iconColor="from-indigo-500 to-indigo-600"
          index={3}
        />
      </StatsGrid>

      {/* Table */}
      <motion.div variants={dashboardItemVariants}>
        <DashCard padding="none">
          {isLoading ? (
            <div className="p-4">
              <TableSkeleton rows={5} cols={7} />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800">
                      {["Name", "Email", "Nationality", "Level", "Documents", "Submitted", "Actions"].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {pendingUsers.length > 0 ? (
                      pendingUsers.map((user, i) => (
                        <motion.tr
                          key={user.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03, duration: 0.25 }}
                        >
                          <td className="px-4 py-3 whitespace-nowrap">
                            <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                              {user.firstName} {user.lastName}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                            {user.email}
                          </td>
                          <td className="px-4 py-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                            {user.nationality || "—"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <StatusBadge status={user.level} />
                          </td>
                          <td className="px-4 py-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                            {user.documentsCount} doc{user.documentsCount !== 1 ? "s" : ""}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {user.submittedAt
                              ? new Date(user.submittedAt).toLocaleDateString()
                              : "—"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <motion.button
                                className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => navigate(`/admin/users/${user.id}`)}
                                title="View Details"
                              >
                                <Eye size={15} />
                              </motion.button>
                              <motion.button
                                className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => approveUser(user.id)}
                                disabled={isReviewing}
                                title="Approve"
                              >
                                <CheckCircle size={15} />
                              </motion.button>
                              <motion.button
                                className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setRejectModal(user.id)}
                                disabled={isReviewing}
                                title="Reject"
                              >
                                <XCircle size={15} />
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center">
                          <FileCheck size={32} className="mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            No pending KYC reviews.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-800">
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                    Page {pagination.page} of {pagination.totalPages}
                  </p>
                  <div className="flex items-center gap-1">
                    <motion.button
                      className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 disabled:opacity-40"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setPage(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                    >
                      <ChevronLeft size={14} />
                    </motion.button>
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum: number;
                      if (pagination.totalPages <= 5) pageNum = i + 1;
                      else if (pagination.page <= 3) pageNum = i + 1;
                      else if (pagination.page >= pagination.totalPages - 2) pageNum = pagination.totalPages - 4 + i;
                      else pageNum = pagination.page - 2 + i;
                      return (
                        <motion.button
                          key={pageNum}
                          className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                            pagination.page === pageNum
                              ? "bg-indigo-600 dark:bg-indigo-500 text-white"
                              : "border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setPage(pageNum)}
                        >
                          {pageNum}
                        </motion.button>
                      );
                    })}
                    <motion.button
                      className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 disabled:opacity-40"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setPage(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages}
                    >
                      <ChevronRight size={14} />
                    </motion.button>
                  </div>
                </div>
              )}
            </>
          )}
        </DashCard>
      </motion.div>

      {/* Reject Modal */}
      <AnimatePresence>
        {rejectModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setRejectModal(null)}
          >
            <motion.div
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 w-full max-w-md mx-4"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                Reject KYC Verification
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Please provide a reason for rejection. The user will be notified.
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Reason for rejection..."
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none"
              />
              <div className="flex justify-end gap-2 mt-4">
                <ActionButton
                  label="Cancel"
                  onClick={() => {
                    setRejectModal(null);
                    setRejectReason("");
                  }}
                  variant="secondary"
                />
                <motion.button
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-40 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleReject}
                  disabled={!rejectReason.trim() || isReviewing}
                >
                  <XCircle size={14} />
                  Reject
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageContainer>
  );
};

export default KycPending;
