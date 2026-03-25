import React, { useState } from "react";
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

const sectionTabs = [
  { id: "users", label: "Admin Users", icon: <Users size={16} /> },
  { id: "roles", label: "Roles & Permissions", icon: <Shield size={16} /> },
  { id: "activity", label: "Activity Log", icon: <Activity size={16} /> },
];

const roleColors: Record<string, string> = {
  "super-admin": "bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400",
  admin: "bg-indigo-100 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400",
  manager: "bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400",
  analyst: "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400",
  support: "bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400",
};

const adminUsers = [
  { id: "ADM-001", name: "Admin SuperUser", email: "admin@nordi.com", role: "super-admin", status: "active", lastLogin: "2026-03-22T14:30:00", twoFactor: true, createdAt: "2025-01-01" },
  { id: "ADM-002", name: "Ola Nordström", email: "ola@nordi.com", role: "admin", status: "active", lastLogin: "2026-03-22T10:00:00", twoFactor: true, createdAt: "2025-03-15" },
  { id: "ADM-003", name: "Maria Svensson", email: "maria@nordi.com", role: "manager", status: "active", lastLogin: "2026-03-21T16:45:00", twoFactor: true, createdAt: "2026-03-22" },
  { id: "ADM-004", name: "Erik Lindqvist", email: "erik.l@nordi.com", role: "analyst", status: "active", lastLogin: "2026-03-22T08:30:00", twoFactor: false, createdAt: "2025-09-01" },
  { id: "ADM-005", name: "Sanna Eriksson", email: "sanna@nordi.com", role: "support", status: "active", lastLogin: "2026-03-20T14:00:00", twoFactor: true, createdAt: "2025-06-20" },
  { id: "ADM-006", name: "Johan Berg", email: "johan@nordi.com", role: "manager", status: "suspended", lastLogin: "2026-02-15T09:00:00", twoFactor: false, createdAt: "2025-04-10" },
];

const roles = [
  { id: "R-001", name: "Super Administrator", slug: "super-admin", description: "Full unrestricted access to all platform features", usersCount: 1, permissions: ["all"], color: "from-red-500 to-red-600" },
  { id: "R-002", name: "Administrator", slug: "admin", description: "Full access except system settings and admin management", usersCount: 1, permissions: ["users", "transactions", "kyc", "loans", "investments", "fraud", "reports", "communications"], color: "from-indigo-500 to-indigo-600" },
  { id: "R-003", name: "Manager", slug: "manager", description: "Manage users, transactions, KYC, and loans with approval rights", usersCount: 2, permissions: ["users", "transactions", "kyc", "loans"], color: "from-blue-500 to-blue-600" },
  { id: "R-004", name: "Analyst", slug: "analyst", description: "Read-only access to reports, analytics, and audit logs", usersCount: 1, permissions: ["reports", "analytics", "audit-logs"], color: "from-emerald-500 to-emerald-600" },
  { id: "R-005", name: "Support Agent", slug: "support", description: "Handle user inquiries, view accounts, manage basic KYC", usersCount: 1, permissions: ["users:read", "accounts:read", "kyc:basic"], color: "from-amber-500 to-amber-600" },
];

const activityLogs = [
  { admin: "Admin SuperUser", action: "Created admin user", target: "Maria Svensson", time: "5 hours ago" },
  { admin: "Admin SuperUser", action: "Updated role permissions", target: "Manager role", time: "5 hours ago" },
  { admin: "Ola Nordström", action: "Suspended admin", target: "Johan Berg", time: "1 day ago" },
  { admin: "Admin SuperUser", action: "Enabled 2FA requirement", target: "Security Settings", time: "2 days ago" },
  { admin: "Ola Nordström", action: "Reset password", target: "Sanna Eriksson", time: "3 days ago" },
  { admin: "Admin SuperUser", action: "Created role", target: "Analyst", time: "1 week ago" },
  { admin: "Maria Svensson", action: "Logged in", target: "Admin Portal", time: "1 week ago" },
  { admin: "Admin SuperUser", action: "Revoked API key", target: "Legacy Integration Key", time: "2 weeks ago" },
];

export default function AdminManagement() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("users");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredUsers = adminUsers.filter((u) => {
    const matchesSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <PageContainer>
      <PageHeader
        title="Admin Management"
        subtitle="Manage admin users, roles, permissions, and monitor admin activity"
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Admin Management" },
        ]}
        actions={<ActionButton label="Create Admin" icon={<UserPlus size={14} />} onClick={() => toast.info("Opening admin creation form...")} />}
      />

      <StatsGrid>
        <StatCard label="Total Admins" value={adminUsers.length} icon={<Users size={18} />} iconColor="from-indigo-500 to-indigo-600" index={0} />
        <StatCard label="Active Admins" value={adminUsers.filter((u) => u.status === "active").length} icon={<Activity size={18} />} iconColor="from-emerald-500 to-emerald-600" index={1} />
        <StatCard label="Roles Defined" value={roles.length} icon={<Shield size={18} />} iconColor="from-blue-500 to-blue-600" index={2} />
        <StatCard label="2FA Enabled" value={`${adminUsers.filter((u) => u.twoFactor).length}/${adminUsers.length}`} icon={<Key size={18} />} iconColor="from-violet-500 to-violet-600" index={3} />
      </StatsGrid>

      {/* Section Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {sectionTabs.map((tab) => (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-lg"
                : "bg-white dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
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
          <FilterBar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search admins by name or email...">
            <FilterSelect
              value={roleFilter}
              onChange={setRoleFilter}
              options={[
                { value: "all", label: "All Roles" },
                { value: "super-admin", label: "Super Admin" },
                { value: "admin", label: "Admin" },
                { value: "manager", label: "Manager" },
                { value: "analyst", label: "Analyst" },
                { value: "support", label: "Support" },
              ]}
            />
          </FilterBar>
          <DashCard>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    {["Admin", "Role", "2FA", "Status", "Last Login", "Created", "Actions"].map((h) => (
                      <th key={h} className="text-left py-3 px-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredUsers.map((user, i) => (
                      <motion.tr key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: i * 0.04 } }} exit={{ opacity: 0 }} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-[10px] font-bold">
                              {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                              <p className="text-[10px] text-gray-400">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-medium capitalize ${roleColors[user.role]}`}>
                            {user.role === "super-admin" && <Crown size={10} className="inline mr-1" />}
                            {user.role.replace("-", " ")}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          {user.twoFactor ? (
                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400"><Lock size={12} /> On</span>
                          ) : (
                            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400"><Unlock size={12} /> Off</span>
                          )}
                        </td>
                        <td className="py-3 px-2"><StatusBadge status={user.status} /></td>
                        <td className="py-3 px-2 text-gray-400">
                          {new Date(user.lastLogin).toLocaleDateString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td className="py-3 px-2 text-gray-400">{new Date(user.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-1">
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors"><Edit3 size={14} /></motion.button>
                            {user.role !== "super-admin" && (
                              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => toast.warning(`${user.name}'s status toggled`)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors">
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
          {roles.map((role, i) => (
            <motion.div key={role.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }}>
              <DashCard hover>
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center text-white flex-shrink-0`}>
                    <Shield size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{role.name}</h4>
                      <span className="text-[10px] text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">{role.usersCount} user{role.usersCount !== 1 ? "s" : ""}</span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">{role.description}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {role.permissions.map((perm) => (
                        <span key={perm} className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-[10px] text-gray-600 dark:text-gray-300 font-medium">{perm}</span>
                      ))}
                    </div>
                  </div>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors flex-shrink-0">
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
            <div className="space-y-0 mt-3">
              {activityLogs.map((log, i) => (
                <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: i * 0.04 } }} className="flex items-center gap-3 py-3 border-b border-gray-50 dark:border-gray-800/50 last:border-0">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                    <Activity size={14} className="text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      <span className="font-medium text-gray-900 dark:text-white">{log.admin}</span>
                      {" "}{log.action}{" — "}
                      <span className="text-indigo-600 dark:text-indigo-400">{log.target}</span>
                    </p>
                  </div>
                  <span className="text-[10px] text-gray-400 flex-shrink-0">{log.time}</span>
                </motion.div>
              ))}
            </div>
          </DashCard>
        </motion.div>
      )}
    </PageContainer>
  );
}
