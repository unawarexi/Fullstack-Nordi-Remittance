import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ShieldOff,
  ShieldCheck,
  Eye,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import {
  PageContainer,
  DashCard,
  FilterBar,
  FilterPill,
  StatusBadge,
  ActionButton,
} from "@components/shared/DashboardPrimitives";
import { PageHeader } from "@components/shared/PageHeader";
import { TableSkeleton } from "@components/skeletons/Skeletons";
import { dashboardItemVariants } from "@core/animation/Animation";
import { useBlockedUsers } from "./use-case/useBlockedUsers";

const BlockedUsers: React.FC = () => {
  const navigate = useNavigate();
  const {
    users,
    pagination,
    filters,
    isLoading,
    setSearch,
    setStatusFilter,
    setPage,
    refetch,
    unblockUser,
    isUnblocking,
  } = useBlockedUsers();

  return (
    <PageContainer className="[&>div]:max-w-full">
      <PageHeader
        title="Blocked Users"
        subtitle={`${pagination.total} blocked accounts`}
        size="sm"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Users", href: "/admin/users/all" },
          { label: "Blocked" },
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

      {/* Status Filter Pills */}
      <FilterBar
        searchValue={filters.search}
        onSearchChange={setSearch}
        searchPlaceholder="Search blocked users..."
      >
        <div className="flex gap-2">
          {(["all", "suspended", "banned"] as const).map((s) => (
            <FilterPill
              key={s}
              label={s === "all" ? "All Blocked" : s.charAt(0).toUpperCase() + s.slice(1)}
              active={filters.status === s}
              onClick={() => setStatusFilter(s)}
            />
          ))}
        </div>
      </FilterBar>

      {/* Table */}
      <motion.div variants={dashboardItemVariants}>
        <DashCard padding="none">
          {isLoading ? (
            <div className="p-4">
              <TableSkeleton rows={5} cols={6} />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800">
                      {["Name", "Email", "Status", "KYC", "Reason", "Blocked Date", "Actions"].map((h) => (
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
                    {users.length > 0 ? (
                      users.map((user, i) => (
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
                          <td className="px-4 py-3 whitespace-nowrap">
                            <StatusBadge status={user.status} />
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <StatusBadge status={user.kycStatus} />
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 max-w-[200px] truncate">
                            {user.reason}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {user.blockedAt
                              ? new Date(user.blockedAt).toLocaleDateString()
                              : "—"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <motion.button
                                className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => navigate(`/admin/users/${user.id}`)}
                                title="View"
                              >
                                <Eye size={15} />
                              </motion.button>
                              <motion.button
                                className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => unblockUser(user.id)}
                                disabled={isUnblocking}
                                title="Unblock"
                              >
                                <ShieldCheck size={15} />
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center">
                          <ShieldOff size={32} className="mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            No blocked users found.
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
    </PageContainer>
  );
};

export default BlockedUsers;
