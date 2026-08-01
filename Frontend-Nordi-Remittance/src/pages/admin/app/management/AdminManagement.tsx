import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  UserPlus,
  Shield,
  Activity,
  Crown,
  Key,
  Mail,
  Phone,
  Clock,
  MoreHorizontal,
  Search,
  Edit3,
  Trash2,
  Lock,
  Unlock,
  Eye,
  ChevronDown,
} from "lucide-react";
import {
  PageContainer,
  DashCard,
  StatCard,
  StatsGrid,
  SectionHeader,
  FilterBar,
  FilterSelect,
  FilterPill,
  ActionButton,
  StatusBadge,
} from "@components/shared/DashboardPrimitives";
import { PageHeader } from "@components/shared/PageHeader";
import { useToast } from "@store/toast.store";
import { useAdminManagement } from "../../admin-usecase/useAdminManagement";

const sectionTabs = [
  { id: "users", label: "Admin Users", icon: <Users size={16} /> },
  { id: "roles", label: "Roles & Permissions", icon: <Shield size={16} /> },
  { id: "activity", label: "Activity Log", icon: <Activity size={16} /> },
];

const roleColors: Record<string, string> = {
  "super-admin": "bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400",
  super_admin: "bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400",
  admin: "bg-indigo-100 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400",
  manager: "bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400",
  moderator: "bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400",
  analyst: "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400",
  viewer: "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400",
  support: "bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400",
};

const ROLE_GRADIENT: Record<string, string> = {
  "super-admin": "from-red-500 to-red-600",
  super_admin: "from-red-500 to-red-600",
  admin: "from-indigo-500 to-indigo-600",
  manager: "from-blue-500 to-blue-600",
  moderator: "from-blue-500 to-blue-600",
  analyst: "from-emerald-500 to-emerald-600",
  viewer: "from-emerald-500 to-emerald-600",
  support: "from-amber-500 to-amber-600",
};

export default function AdminManagement() {
  const toast = useToast();
  const {
    items,
    admins,
    roles,
    logs,
    stats,
    search,
    roleFilter,
    activeTab,
    isLoading,
    isCreating,
    setSearch,
    setRoleFilter,
    setActiveTab,
    handleCreateAdmin,
    refetch,
  } = useAdminManagement();

  return (
    <PageContainer>
      <PageHeader
        title="Admin Management"
        subtitle="Manage admin users, roles, permissions, and monitor admin activity"
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Admin Management" }]}
        actions={
          <ActionButton
            label="Create Admin"
            icon={<UserPlus size={14} />}
            onClick={() =>
              handleCreateAdmin(
                {},
                {
                  onSuccess: () => toast.success("Admin created"),
                  onError: () => toast.error("Failed to create admin"),
                },
              )
            }
          />
        }
      />

      <StatsGrid>
        <StatCard
          label="Total Admins"
          value={stats.totalAdmins}
          icon={<Users size={18} />}
          iconColor="from-indigo-500 to-indigo-600"
          index={0}
        />
        <StatCard
          label="Active Admins"
          value={stats.activeAdmins}
          icon={<Activity size={18} />}
          iconColor="from-emerald-500 to-emerald-600"
          index={1}
        />
        <StatCard
          label="Roles Defined"
          value={stats.totalRoles}
          icon={<Shield size={18} />}
          iconColor="from-blue-500 to-blue-600"
          index={2}
        />
        <StatCard
          label="Activity Logs"
          value={stats.recentActivity}
          icon={<Key size={18} />}
          iconColor="from-violet-500 to-violet-600"
          index={3}
        />
      </StatsGrid>

      {/* Section Tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {sectionTabs.map((tab) => (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-medium transition-all ${
              activeTab === tab.id
                ? "bg-gray-900 text-white shadow-lg dark:bg-white dark:text-gray-900"
                : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-400 dark:hover:bg-gray-800"
            }`}
          >
            {tab.icon}
            {tab.label}
          </motion.button>
        ))}
      </div>

      {/* Admin Users Tab */}
      {activeTab === "users" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <FilterBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search admins by name or email..."
          >
            <FilterSelect
              value={roleFilter}
              onChange={(v: any) => setRoleFilter(v)}
              options={[
                { value: "all", label: "All Roles" },
                { value: "super_admin", label: "Super Admin" },
                { value: "admin", label: "Admin" },
                { value: "moderator", label: "Moderator" },
                { value: "viewer", label: "Viewer" },
              ]}
            />
          </FilterBar>
          <DashCard>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    {["Admin", "Role", "2FA", "Status", "Last Login", "Created", "Actions"].map((h) => (
                      <th
                        key={h}
                        className="px-2 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {items.map((user: any, i: number) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, transition: { delay: i * 0.04 } }}
                        exit={{ opacity: 0 }}
                        className="border-b border-gray-50 transition-colors hover:bg-gray-50/50 dark:border-gray-800/50 dark:hover:bg-gray-800/30"
                      >
                        <td className="px-2 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-[10px] font-bold text-white">
                              {`${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || "A"}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {user.firstName} {user.lastName}
                              </p>
                              <p className="text-[10px] text-gray-400">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-3">
                          <span
                            className={`rounded-lg px-2 py-0.5 text-[10px] font-medium capitalize ${roleColors[user.role] || "bg-gray-100 text-gray-600 dark:bg-gray-800"}`}
                          >
                            {user.role === "super-admin" || user.role === "super_admin" ? (
                              <Crown size={10} className="mr-1 inline" />
                            ) : null}
                            {user.role.replace(/[_-]/g, " ")}
                          </span>
                        </td>
                        <td className="px-2 py-3">
                          {user.twoFactor ? (
                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                              <Lock size={12} /> On
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                              <Unlock size={12} /> Off
                            </span>
                          )}
                        </td>
                        <td className="px-2 py-3">
                          <StatusBadge status={user.status} />
                        </td>
                        <td className="px-2 py-3 text-gray-400">
                          {new Date(user.lastLogin).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-2 py-3 text-gray-400">
                          {new Date(user.createdAt).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-2 py-3">
                          <div className="flex items-center gap-1">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                              <Edit3 size={14} />
                            </motion.button>
                            {user.role !== "super-admin" && user.role !== "super_admin" && (
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => toast.warning(`${user.firstName} ${user.lastName}'s status toggled`)}
                                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                              >
                                {user.status === "active" ? <Lock size={14} /> : <Unlock size={14} />}
                              </motion.button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </DashCard>
        </motion.div>
      )}

      {/* Roles & Permissions Tab */}
      {activeTab === "roles" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <SectionHeader title="Roles & Permissions" subtitle="Define access levels and permission groups" />
          {roles.map((role: any, i: number) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }}
            >
              <DashCard hover>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                  <div
                    className={`h-10 w-10 rounded-xl bg-gradient-to-br ${ROLE_GRADIENT[role.role] || "from-gray-500 to-gray-600"} flex flex-shrink-0 items-center justify-center text-white`}
                  >
                    <Shield size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{role.name}</h4>
                      <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-400 dark:bg-gray-800">
                        {role.count} user{role.count !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {(role.permissions || []).map((perm: string) => (
                        <span
                          key={perm}
                          className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                        >
                          {perm}
                        </span>
                      ))}
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-shrink-0 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <Edit3 size={14} />
                  </motion.button>
                </div>
              </DashCard>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Activity Log Tab */}
      {activeTab === "activity" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <DashCard>
            <SectionHeader title="Admin Activity Log" subtitle="Recent actions performed by admin users" />
            <div className="mt-3 space-y-0">
              {logs.map((log: any, i: number) => (
                <motion.div
                  key={log.id || i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { delay: i * 0.04 } }}
                  className="flex items-center gap-3 border-b border-gray-50 py-3 last:border-0 dark:border-gray-800/50"
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                    <Activity size={14} className="text-gray-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      <span className="font-medium text-gray-900 dark:text-white">{log.admin}</span> {log.action}
                      {log.target ? ` — ` : ""}
                      {log.target && <span className="text-indigo-600 dark:text-indigo-400">{log.target}</span>}
                    </p>
                  </div>
                  <span className="flex-shrink-0 text-[10px] text-gray-400">
                    {log.timestamp
                      ? new Date(log.timestamp).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })
                      : ""}
                  </span>
                </motion.div>
              ))}
            </div>
          </DashCard>
        </motion.div>
      )}
    </PageContainer>
  );
}
