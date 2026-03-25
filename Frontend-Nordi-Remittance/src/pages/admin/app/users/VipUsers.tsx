import React from "react";
import { motion } from "framer-motion";
import {
  Shield,
  UserPlus,
  Eye,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import {
  PageContainer,
  DashCard,
  FilterBar,
  StatusBadge,
  ActionButton,
} from "@components/shared/DashboardPrimitives";
import { PageHeader } from "@components/shared/PageHeader";
import { TableSkeleton } from "@components/skeletons/Skeletons";
import { dashboardItemVariants } from "@core/animation/Animation";
import { useAdminTeam } from "./use-case/useAdminTeam";

const AdminUsers: React.FC = () => {
  const {
    admins,
    pagination,
    search,
    isLoading,
    setPage,
    setSearch,
    refetch,
  } = useAdminTeam();

  return (
    <PageContainer className="[&>div]:max-w-full">
      <PageHeader
        title="Admin Team"
        subtitle={`${pagination.total} admin accounts`}
        size="sm"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Users", href: "/admin/users/all" },
          { label: "Admin Team" },
        ]}
        actions={
          <div className="flex gap-2">
            <ActionButton
              label="Refresh"
              icon={<RefreshCw size={14} />}
              onClick={() => refetch()}
              variant="secondary"
            />
          </div>
        }
      />

      {/* Filters */}
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search admin users..."
      />

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
                      {["Name", "Email", "Role", "Status", "Last Login", "Created"].map((h) => (
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
                    {admins.length > 0 ? (
                      admins.map((admin, i) => (
                        <motion.tr
                          key={admin.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03, duration: 0.25 }}
                        >
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold">
                                {admin.firstName?.[0]}{admin.lastName?.[0]}
                              </div>
                              <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                                {admin.firstName} {admin.lastName}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                            {admin.email}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 capitalize">
                              <Shield size={10} />
                              {admin.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <StatusBadge status={admin.status} />
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {admin.lastLogin
                              ? new Date(admin.lastLogin).toLocaleDateString()
                              : "Never"}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {admin.createdAt
                              ? new Date(admin.createdAt).toLocaleDateString()
                              : "—"}
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center">
                          <Shield size={32} className="mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            No admin users found.
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

export default AdminUsers;
