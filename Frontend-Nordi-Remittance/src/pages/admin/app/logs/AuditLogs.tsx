import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Shield,
  UserCog,
  Settings,
  Database,
  Key,
  Download,
  RefreshCw,
  ChevronDown,
  Clock,
  Search,
  Filter,
  Calendar,
} from "lucide-react";
import {
  PageContainer,
  DashCard,
  StatCard,
  StatsGrid,
  FilterBar,
  FilterSelect,
  FilterPill,
  ActionButton,
  StatusBadge,
} from "@components/shared/DashboardPrimitives";
import { PageHeader } from "@components/shared/PageHeader";

const actionTypeIcons: Record<string, React.ReactNode> = {
  user: <UserCog size={14} />,
  security: <Shield size={14} />,
  settings: <Settings size={14} />,
  data: <Database size={14} />,
  auth: <Key size={14} />,
};

const actionColors: Record<string, string> = {
  create: "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400",
  update: "bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400",
  delete: "bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400",
  login: "bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400",
  export: "bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400",
  approve: "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400",
  reject: "bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400",
};

const filterCategories = ["All", "User", "Security", "Settings", "Data", "Auth"];

const sampleLogs = [
  { id: "LOG-001", admin: "Admin SuperUser", adminEmail: "admin@nordi.com", action: "approve", category: "user", resource: "KYC Application #KYC-2847", details: "Approved KYC application for Erik Lundgren - document verified", ipAddress: "192.168.1.100", userAgent: "Chrome/120 (macOS)", timestamp: "2026-03-22T14:30:00" },
  { id: "LOG-002", admin: "Admin SuperUser", adminEmail: "admin@nordi.com", action: "update", category: "settings", resource: "System Settings - Security", details: "Updated max login attempts from 5 to 3", ipAddress: "192.168.1.100", userAgent: "Chrome/120 (macOS)", timestamp: "2026-03-22T13:15:00" },
  { id: "LOG-003", admin: "Manager Ola", adminEmail: "ola@nordi.com", action: "reject", category: "user", resource: "Loan Application #LOAN-1432", details: "Rejected loan for insufficient credit score (480/700 required)", ipAddress: "10.0.0.55", userAgent: "Firefox/121 (Windows)", timestamp: "2026-03-22T12:00:00" },
  { id: "LOG-004", admin: "Admin SuperUser", adminEmail: "admin@nordi.com", action: "create", category: "user", resource: "Admin User", details: "Created new admin user 'Maria Svensson' with role 'KYC Manager'", ipAddress: "192.168.1.100", userAgent: "Chrome/120 (macOS)", timestamp: "2026-03-22T10:45:00" },
  { id: "LOG-005", admin: "Manager Ola", adminEmail: "ola@nordi.com", action: "export", category: "data", resource: "Transaction Report", details: "Exported Q1 2026 transaction report (14,328 records)", ipAddress: "10.0.0.55", userAgent: "Firefox/121 (Windows)", timestamp: "2026-03-22T09:30:00" },
  { id: "LOG-006", admin: "Admin SuperUser", adminEmail: "admin@nordi.com", action: "login", category: "auth", resource: "Admin Portal", details: "Successful login with 2FA verification", ipAddress: "192.168.1.100", userAgent: "Chrome/120 (macOS)", timestamp: "2026-03-22T08:00:00" },
  { id: "LOG-007", admin: "Security Bot", adminEmail: "system@nordi.com", action: "update", category: "security", resource: "User Account #USR-3821", details: "Account locked after 3 failed login attempts - automated action", ipAddress: "0.0.0.0", userAgent: "System/Automated", timestamp: "2026-03-21T23:45:00" },
  { id: "LOG-008", admin: "Manager Ola", adminEmail: "ola@nordi.com", action: "approve", category: "user", resource: "Investment #INV-0912", details: "Approved fixed deposit investment of €25,000 for Sofia Bergman", ipAddress: "10.0.0.55", userAgent: "Firefox/121 (Windows)", timestamp: "2026-03-21T16:20:00" },
  { id: "LOG-009", admin: "Admin SuperUser", adminEmail: "admin@nordi.com", action: "delete", category: "user", resource: "Dormant Account #ACC-1102", details: "Deactivated dormant savings account (inactive >365 days)", ipAddress: "192.168.1.100", userAgent: "Chrome/120 (macOS)", timestamp: "2026-03-21T14:00:00" },
  { id: "LOG-010", admin: "Admin SuperUser", adminEmail: "admin@nordi.com", action: "update", category: "settings", resource: "Payment Gateway Config", details: "Updated Stripe API keys for production environment", ipAddress: "192.168.1.100", userAgent: "Chrome/120 (macOS)", timestamp: "2026-03-21T11:30:00" },
];

export default function AuditLogs() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [actionFilter, setActionFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = sampleLogs.filter((log) => {
    const matchesSearch = !search || log.admin.toLowerCase().includes(search.toLowerCase()) || log.resource.toLowerCase().includes(search.toLowerCase()) || log.details.toLowerCase().includes(search.toLowerCase()) || log.id.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || log.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    return matchesSearch && matchesCategory && matchesAction;
  });

  const todayCount = sampleLogs.filter((l) => new Date(l.timestamp).toDateString() === new Date().toDateString()).length;
  const uniqueAdmins = new Set(sampleLogs.map((l) => l.admin)).size;
  const securityActions = sampleLogs.filter((l) => l.category === "security" || l.action === "delete").length;

  return (
    <PageContainer>
      <PageHeader
        title="Audit Logs"
        subtitle="Complete audit trail of all administrative actions and system events"
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Audit Logs" },
        ]}
        actions={
          <div className="flex gap-2">
            <ActionButton label="Export CSV" icon={<Download size={14} />} onClick={() => {}} variant="secondary" />
            <ActionButton label="Refresh" icon={<RefreshCw size={14} />} onClick={() => {}} />
          </div>
        }
      />

      <StatsGrid>
        <StatCard label="Total Logs" value={sampleLogs.length.toLocaleString()} icon={<FileText size={18} />} iconColor="from-blue-500 to-blue-600" index={0} />
        <StatCard label="Today's Activity" value={todayCount} icon={<Calendar size={18} />} iconColor="from-emerald-500 to-emerald-600" index={1} />
        <StatCard label="Active Admins" value={uniqueAdmins} icon={<UserCog size={18} />} iconColor="from-violet-500 to-violet-600" index={2} />
        <StatCard label="Security Events" value={securityActions} icon={<Shield size={18} />} iconColor="from-rose-500 to-rose-600" index={3} />
      </StatsGrid>

      {/* Category Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {filterCategories.map((c) => (
          <FilterPill key={c} label={c} active={activeCategory === c} onClick={() => setActiveCategory(c)} />
        ))}
      </div>

      <FilterBar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search logs by admin, resource, or action...">
        <FilterSelect
          value={actionFilter}
          onChange={setActionFilter}
          options={[
            { value: "all", label: "All Actions" },
            { value: "create", label: "Create" },
            { value: "update", label: "Update" },
            { value: "delete", label: "Delete" },
            { value: "approve", label: "Approve" },
            { value: "reject", label: "Reject" },
            { value: "login", label: "Login" },
            { value: "export", label: "Export" },
          ]}
        />
      </FilterBar>

      {/* Log Entries */}
      <DashCard>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          <AnimatePresence mode="popLayout">
            {filtered.map((log, i) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { delay: i * 0.03 } }}
                exit={{ opacity: 0 }}
                layout
                className="py-3 first:pt-0 last:pb-0 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-800/30 -mx-4 px-4 transition-colors"
                onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  {/* Category Icon */}
                  <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 flex-shrink-0">
                    {actionTypeIcons[log.category] || <FileText size={14} />}
                  </div>

                  {/* Log Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${actionColors[log.action] || "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"}`}>
                        {log.action}
                      </span>
                      <p className="text-sm text-gray-900 dark:text-white truncate">{log.resource}</p>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5">{log.admin} · {log.id}</p>
                  </div>

                  {/* Timestamp */}
                  <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
                    <Clock size={12} />
                    {new Date(log.timestamp).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </div>

                  <motion.div animate={{ rotate: expandedId === log.id ? 180 : 0 }} className="flex-shrink-0">
                    <ChevronDown size={14} className="text-gray-400" />
                  </motion.div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {expandedId === log.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                        <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">{log.details}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                          <div>
                            <span className="text-gray-400">IP Address:</span>
                            <span className="ml-1 text-gray-600 dark:text-gray-300 font-mono">{log.ipAddress}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">User Agent:</span>
                            <span className="ml-1 text-gray-600 dark:text-gray-300">{log.userAgent}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Email:</span>
                            <span className="ml-1 text-gray-600 dark:text-gray-300">{log.adminEmail}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </DashCard>

      {filtered.length === 0 && (
        <DashCard className="text-center py-12">
          <Search size={32} className="mx-auto mb-2 text-gray-300 dark:text-gray-600" />
          <p className="text-sm text-gray-500 dark:text-gray-400">No audit logs match your filters</p>
        </DashCard>
      )}
    </PageContainer>
  );
}
