import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Shield,
  ShieldAlert,
  Eye,
  XCircle,
  CheckCircle,
  AlertOctagon,
  Activity,
  Lock,
  Fingerprint,
  Globe,
  TrendingUp,
  Download,
  RefreshCw,
  ChevronDown,
  Clock,
  MapPin,
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

const severityColors: Record<string, string> = {
  critical: "from-red-600 to-red-700",
  high: "from-rose-500 to-rose-600",
  medium: "from-amber-500 to-amber-600",
  low: "from-blue-500 to-blue-600",
};

const severityBadge: Record<string, string> = {
  critical: "bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400",
  high: "bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400",
  medium: "bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400",
  low: "bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400",
};

const filterStatuses = ["All", "Open", "Investigating", "Resolved", "Dismissed"];

const sampleAlerts = [
  { id: "FRD-001", type: "Unusual Transaction Pattern", user: "Erik Lundgren", email: "erik@example.com", severity: "critical", status: "open", description: "Multiple high-value international transfers to previously unknown recipients within 24 hours", amount: 45000, currency: "EUR", location: "Stockholm, SE", detectedAt: "2026-03-22T10:15:00", transactionCount: 8 },
  { id: "FRD-002", type: "Account Takeover Attempt", user: "Anna Johansson", email: "anna@example.com", severity: "high", status: "investigating", description: "Multiple failed login attempts from different IP addresses, followed by a successful login from unusual location", amount: 0, currency: "EUR", location: "Lagos, NG", detectedAt: "2026-03-22T08:30:00", transactionCount: 0 },
  { id: "FRD-003", type: "Velocity Rule Breach", user: "Lars Nilsson", email: "lars@example.com", severity: "medium", status: "open", description: "Exceeded maximum daily transaction count limit (15 transactions in 2 hours)", amount: 12300, currency: "EUR", location: "Helsinki, FI", detectedAt: "2026-03-21T16:45:00", transactionCount: 15 },
  { id: "FRD-004", type: "AML Flag", user: "Sofia Bergman", email: "sofia@example.com", severity: "high", status: "investigating", description: "Transaction pattern matches structuring behavior - multiple transfers just below reporting threshold", amount: 29900, currency: "EUR", location: "Copenhagen, DK", detectedAt: "2026-03-21T14:20:00", transactionCount: 6 },
  { id: "FRD-005", type: "Suspicious Device", user: "Henrik Berg", email: "henrik@example.com", severity: "low", status: "resolved", description: "Login from new device that doesn't match user's typical device fingerprint", amount: 0, currency: "EUR", location: "Oslo, NO", detectedAt: "2026-03-20T11:00:00", transactionCount: 0 },
  { id: "FRD-006", type: "Geographic Anomaly", user: "Maria Svensson", email: "maria@example.com", severity: "medium", status: "dismissed", description: "Transaction initiated from a country the user has never transacted from before", amount: 5000, currency: "EUR", location: "Nairobi, KE", detectedAt: "2026-03-20T09:15:00", transactionCount: 1 },
];

export default function FraudMonitoring() {
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [activeStatus, setActiveStatus] = useState("All");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = sampleAlerts.filter((a) => {
    const matchesSearch = !search || a.user.toLowerCase().includes(search.toLowerCase()) || a.type.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = activeStatus === "All" || a.status.toLowerCase() === activeStatus.toLowerCase();
    const matchesSeverity = severityFilter === "all" || a.severity === severityFilter;
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  const openAlerts = sampleAlerts.filter((a) => a.status === "open").length;
  const criticalAlerts = sampleAlerts.filter((a) => a.severity === "critical" || a.severity === "high").length;
  const investigating = sampleAlerts.filter((a) => a.status === "investigating").length;
  const resolved = sampleAlerts.filter((a) => a.status === "resolved").length;

  return (
    <PageContainer>
      <PageHeader
        title="Fraud Monitoring"
        subtitle="Real-time fraud detection, alerts, and AML compliance monitoring"
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Fraud Monitoring" },
        ]}
        actions={
          <div className="flex gap-2">
            <ActionButton label="Export" icon={<Download size={14} />} onClick={() => {}} variant="secondary" />
            <ActionButton label="Refresh" icon={<RefreshCw size={14} />} onClick={() => {}} />
          </div>
        }
      />

      <StatsGrid>
        <StatCard label="Open Alerts" value={openAlerts} icon={<AlertTriangle size={18} />} iconColor="from-amber-500 to-amber-600" change="Needs attention" positive={false} index={0} />
        <StatCard label="Critical/High" value={criticalAlerts} icon={<ShieldAlert size={18} />} iconColor="from-rose-500 to-rose-600" index={1} />
        <StatCard label="Investigating" value={investigating} icon={<Activity size={18} />} iconColor="from-blue-500 to-blue-600" index={2} />
        <StatCard label="Resolved (30d)" value={resolved} icon={<Shield size={18} />} iconColor="from-emerald-500 to-emerald-600" change="+92% detection" positive index={3} />
      </StatsGrid>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {filterStatuses.map((s) => (
          <FilterPill key={s} label={s} active={activeStatus === s} onClick={() => setActiveStatus(s)} />
        ))}
      </div>

      <FilterBar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search alerts by user, type, or ID...">
        <FilterSelect
          value={severityFilter}
          onChange={setSeverityFilter}
          options={[
            { value: "all", label: "All Severity" },
            { value: "critical", label: "Critical" },
            { value: "high", label: "High" },
            { value: "medium", label: "Medium" },
            { value: "low", label: "Low" },
          ]}
        />
      </FilterBar>

      {/* Alerts List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((alert, i) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0, transition: { delay: i * 0.04 } }}
              exit={{ opacity: 0, x: -20 }}
              layout
            >
              <DashCard hover onClick={() => setExpandedId(expandedId === alert.id ? null : alert.id)}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  {/* Severity Indicator */}
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${severityColors[alert.severity]} flex items-center justify-center text-white flex-shrink-0`}>
                    {alert.severity === "critical" ? <AlertOctagon size={18} /> : <AlertTriangle size={18} />}
                  </div>

                  {/* Alert Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{alert.type}</p>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${severityBadge[alert.severity]}`}>{alert.severity}</span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">{alert.user} · {alert.email} · {alert.id}</p>
                  </div>

                  {/* Amount */}
                  {alert.amount > 0 && (
                    <div className="flex-shrink-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">€{alert.amount.toLocaleString()}</p>
                      <p className="text-[10px] text-gray-400">{alert.transactionCount} txns</p>
                    </div>
                  )}

                  {/* Status */}
                  <StatusBadge status={alert.status} />

                  {/* Time */}
                  <div className="flex items-center gap-1 text-[10px] text-gray-400 flex-shrink-0">
                    <Clock size={12} />
                    {new Date(alert.detectedAt).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </div>

                  <motion.div animate={{ rotate: expandedId === alert.id ? 180 : 0 }}>
                    <ChevronDown size={16} className="text-gray-400" />
                  </motion.div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {expandedId === alert.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                        <p className="text-xs text-gray-600 dark:text-gray-300 mb-4">{alert.description}</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                          <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-gray-400" />
                            <span className="text-xs text-gray-600 dark:text-gray-300">{alert.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Globe size={14} className="text-gray-400" />
                            <span className="text-xs text-gray-600 dark:text-gray-300">{alert.transactionCount} transactions</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock size={14} className="text-gray-400" />
                            <span className="text-xs text-gray-600 dark:text-gray-300">{new Date(alert.detectedAt).toLocaleString()}</span>
                          </div>
                        </div>
                        {(alert.status === "open" || alert.status === "investigating") && (
                          <div className="flex gap-2">
                            <ActionButton label="Investigate" icon={<Eye size={14} />} onClick={() => toast.info(`Investigating ${alert.id}`)} variant="secondary" />
                            <ActionButton label="Escalate" icon={<ShieldAlert size={14} />} onClick={() => toast.warning(`${alert.id} escalated`)} />
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => toast.success(`${alert.id} resolved`)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">
                              <CheckCircle size={14} /> Resolve
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => toast.info(`${alert.id} dismissed`)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                              <XCircle size={14} /> Dismiss
                            </motion.button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </DashCard>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <DashCard className="text-center py-12">
          <Shield size={32} className="mx-auto mb-2 text-gray-300 dark:text-gray-600" />
          <p className="text-sm text-gray-500 dark:text-gray-400">No fraud alerts found</p>
        </DashCard>
      )}
    </PageContainer>
  );
}
