import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FileCheck, Clock, CheckCircle, XCircle, Eye, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
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
import { useKycPendingUsers } from "../../admin-usecase/useKycPendingUsers";

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
          <ActionButton label="Refresh" icon={<RefreshCw size={14} />} onClick={() => refetch()} variant="secondary" />
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
                          className="whitespace-nowrap px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 sm:text-xs"
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
                          className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03, duration: 0.25 }}
                        >
                          <td className="whitespace-nowrap px-4 py-3">
                            <p className="text-xs font-medium text-gray-900 dark:text-white sm:text-sm">
                              {user.firstName} {user.lastName}
                            </p>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
                            {user.email}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
                            {user.nationality || "—"}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <StatusBadge status={user.level} />
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
                            {user.documentsCount} doc{user.documentsCount !== 1 ? "s" : ""}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                            {user.submittedAt ? new Date(user.submittedAt).toLocaleDateString() : "—"}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <div className="flex items-center gap-1">
                              <motion.button
                                className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-indigo-400"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => navigate(`/admin/users/${user.id}`)}
                                title="View Details"
                              >
                                <Eye size={15} />
                              </motion.button>
                              <motion.button
                                className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-emerald-600 disabled:opacity-40 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-emerald-400"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => approveUser(user.id)}
                                disabled={isReviewing}
                                title="Approve"
                              >
                                <CheckCircle size={15} />
                              </motion.button>
                              <motion.button
                                className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-rose-600 disabled:opacity-40 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-rose-400"
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
                          <p className="text-sm text-gray-500 dark:text-gray-400">No pending KYC reviews.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-gray-800">
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 sm:text-xs">
                    Page {pagination.page} of {pagination.totalPages}
                  </p>
                  <div className="flex items-center gap-1">
                    <motion.button
                      className="rounded-lg border border-gray-200 p-1.5 text-gray-500 disabled:opacity-40 dark:border-gray-700 dark:text-gray-400"
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
                          className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-medium transition-colors sm:h-8 sm:w-8 ${
                            pagination.page === pageNum
                              ? "bg-indigo-600 text-white dark:bg-indigo-500"
                              : "border border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
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
                      className="rounded-lg border border-gray-200 p-1.5 text-gray-500 disabled:opacity-40 dark:border-gray-700 dark:text-gray-400"
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
              className="mx-4 w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="mb-1 text-base font-semibold text-gray-900 dark:text-white">Reject KYC Verification</h3>
              <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
                Please provide a reason for rejection. The user will be notified.
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Reason for rejection..."
                rows={3}
                className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
              />
              <div className="mt-4 flex justify-end gap-2">
                <ActionButton
                  label="Cancel"
                  onClick={() => {
                    setRejectModal(null);
                    setRejectReason("");
                  }}
                  variant="secondary"
                />
                <motion.button
                  className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-700 disabled:opacity-40"
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
