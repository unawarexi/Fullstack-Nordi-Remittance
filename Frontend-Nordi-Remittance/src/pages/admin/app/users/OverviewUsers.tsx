import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Plus,
  Eye,
  Edit,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Ban,
  ShieldOff,
  Trash2,
} from "lucide-react";
import {
  PageContainer,
  StatsGrid,
  StatCard,
  DashCard,
  SectionHeader,
  FilterBar,
  FilterSelect,
  StatusBadge,
  ActionButton,
} from "@components/shared/DashboardPrimitives";
import { PageHeader } from "@components/shared/PageHeader";
import { TableSkeleton } from "@components/skeletons/Skeletons";
import { dashboardItemVariants } from "@core/animation/Animation";
import { useAllUsers } from "../../domain/useAllUsers";
import type { UserStatusFilter, KycStatusFilter } from "../../domain/useAllUsers";

const statusFilterOptions = [
  { value: "all", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspended" },
  { value: "banned", label: "Banned" },
];

const kycFilterOptions = [
  { value: "all", label: "All KYC" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const OverviewUsers: React.FC = () => {
  const navigate = useNavigate();
  const {
    users,
    pagination,
    stats,
    filters,
    isLoading,
    setSearch,
    setStatusFilter,
    setKycFilter,
    setPage,
    resetFilters,
    refetch,
    updateStatus,
    deleteUser,
  } = useAllUsers();
  const [confirmModal, setConfirmModal] = React.useState<{
    userId: string;
    userName: string;
    action: "block" | "restrict" | "delete";
  } | null>(null);

  const handleConfirmAction = () => {
    if (!confirmModal) return;
    const { userId, action } = confirmModal;
    if (action === "block") {
      updateStatus.mutate(
        { userId: userId as any, data: { status: "banned" as any, reason: "Blocked by admin" } },
        { onSuccess: () => { setConfirmModal(null); refetch(); } },
      );
    } else if (action === "restrict") {
      updateStatus.mutate(
        { userId: userId as any, data: { status: "suspended" as any, reason: "Restricted by admin" } },
        { onSuccess: () => { setConfirmModal(null); refetch(); } },
      );
    } else if (action === "delete") {
      deleteUser.mutate(userId as any, {
        onSuccess: () => { setConfirmModal(null); refetch(); },
      });
    }
  };

  return (
    <PageContainer className="[&>div]:max-w-full">
      {/* Header */}
      <PageHeader
        title="User Management"
        subtitle={`${pagination.total} total users`}
        size="sm"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Users" },
        ]}
        actions={
          <div className="flex gap-2">
            <ActionButton
              label="Refresh"
              icon={<RefreshCw size={14} />}
              onClick={() => refetch()}
              variant="secondary"
            />
            <ActionButton
              label="Create User"
              icon={<Plus size={14} />}
              onClick={() => navigate("/admin/users/create")}
            />
          </div>
        }
      />

      {/* Stats */}
      <StatsGrid cols={4}>
        <StatCard
          label="Total Users"
          value={stats.totalUsers}
          icon={<Users size={18} />}
          iconColor="from-indigo-500 to-indigo-600"
          index={0}
        />
        <StatCard
          label="Active Users"
          value={stats.activeUsers}
          icon={<UserCheck size={18} />}
          iconColor="from-emerald-500 to-emerald-600"
          index={1}
        />
        <StatCard
          label="Pending KYC"
          value={stats.pendingKyc}
          icon={<Clock size={18} />}
          iconColor="from-amber-500 to-amber-600"
          index={2}
          onClick={() => navigate("/admin/users/kyc-pending")}
        />
        <StatCard
          label="Blocked Users"
          value={stats.blockedUsers}
          icon={<UserX size={18} />}
          iconColor="from-rose-500 to-rose-600"
          index={3}
          onClick={() => navigate("/admin/users/blocked")}
        />
      </StatsGrid>

      {/* Filters */}
      <FilterBar
        searchValue={filters.search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, email, account number..."
      >
        <FilterSelect
          value={filters.status}
          onChange={(v) => setStatusFilter(v as UserStatusFilter)}
          options={statusFilterOptions}
        />
        <FilterSelect
          value={filters.kycStatus}
          onChange={(v) => setKycFilter(v as KycStatusFilter)}
          options={kycFilterOptions}
        />
        {(filters.status !== "all" || filters.kycStatus !== "all" || filters.search) && (
          <ActionButton label="Reset" onClick={resetFilters} variant="secondary" />
        )}
      </FilterBar>

      {/* Table */}
      <motion.div variants={dashboardItemVariants}>
        <DashCard padding="none">
          {isLoading ? (
            <div className="p-4">
              <TableSkeleton rows={6} cols={7} />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800">
                      {["Name", "Email", "Account Type", "KYC", "Status", "Last Login", "Actions"].map((h) => (
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
                          <td className="px-4 py-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400 capitalize whitespace-nowrap">
                            {user.accountType}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <StatusBadge status={user.kycStatus === "approved" ? "approved" : user.kycStatus} />
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <StatusBadge status={user.status} />
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {user.lastLogin
                              ? new Date(user.lastLogin).toLocaleDateString()
                              : "Never"}
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
                                className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => navigate(`/admin/users/${user.id}/edit`)}
                                title="Edit"
                              >
                                <Edit size={15} />
                              </motion.button>
                              <motion.button
                                className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setConfirmModal({ userId: user.id, userName: `${user.firstName} ${user.lastName}`, action: "restrict" })}
                                title="Restrict User"
                              >
                                <ShieldOff size={15} />
                              </motion.button>
                              <motion.button
                                className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setConfirmModal({ userId: user.id, userName: `${user.firstName} ${user.lastName}`, action: "block" })}
                                title="Block User"
                              >
                                <Ban size={15} />
                              </motion.button>
                              <motion.button
                                className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setConfirmModal({ userId: user.id, userName: `${user.firstName} ${user.lastName}`, action: "delete" })}
                                title="Delete User"
                              >
                                <Trash2 size={15} />
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center">
                          <Users size={32} className="mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            No users found. Try adjusting your filters.
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
                    Page {pagination.page} of {pagination.totalPages} · {pagination.total} users
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
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }
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
      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 max-w-md w-full mx-4 border border-gray-200 dark:border-gray-700"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              {confirmModal.action === "block" && "Block User"}
              {confirmModal.action === "restrict" && "Restrict User"}
              {confirmModal.action === "delete" && "Delete User"}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              {confirmModal.action === "block" &&
                `Are you sure you want to block ${confirmModal.userName}? They will be banned from the platform.`}
              {confirmModal.action === "restrict" &&
                `Are you sure you want to restrict ${confirmModal.userName}? Their account will be suspended.`}
              {confirmModal.action === "delete" &&
                `Are you sure you want to permanently delete ${confirmModal.userName}'s account? This action cannot be undone.`}
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => setConfirmModal(null)}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium rounded-lg text-white ${
                  confirmModal.action === "delete"
                    ? "bg-red-600 hover:bg-red-700"
                    : confirmModal.action === "block"
                      ? "bg-rose-600 hover:bg-rose-700"
                      : "bg-orange-600 hover:bg-orange-700"
                }`}
                onClick={handleConfirmAction}
              >
                {confirmModal.action === "block" && "Block"}
                {confirmModal.action === "restrict" && "Restrict"}
                {confirmModal.action === "delete" && "Delete"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </PageContainer>
  );
};

export default OverviewUsers;