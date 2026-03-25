import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  ShieldQuestion,
  Eye,
  CheckCircle,
  XCircle,
  Download,
  RefreshCw,
  FileText,
  User,
  Calendar,
  ChevronDown,
  ChevronUp,
  Image,
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
  ProgressBar,
} from "@components/shared/DashboardPrimitives";
import { PageHeader } from "@components/shared/PageHeader";
import { useToast } from "@store/toast.store";

const kycStatuses = ["All", "Pending", "Under Review", "Verified", "Rejected"];

const sampleKycApplications = [
  { id: "KYC-001", user: "Anna Johansson", email: "anna@example.com", level: "Enhanced", status: "pending", submittedAt: "2026-03-22T09:00:00", documents: ["passport", "utility_bill", "selfie"], completeness: 85, riskScore: "low", nationality: "Swedish" },
  { id: "KYC-002", user: "Erik Lundgren", email: "erik@example.com", level: "Basic", status: "under_review", submittedAt: "2026-03-21T14:30:00", documents: ["national_id", "bank_statement"], completeness: 60, riskScore: "medium", nationality: "Norwegian" },
  { id: "KYC-003", user: "Sofia Bergman", email: "sofia@example.com", level: "Enhanced", status: "verified", submittedAt: "2026-03-20T11:15:00", documents: ["passport", "utility_bill", "selfie", "proof_of_income"], completeness: 100, riskScore: "low", nationality: "Finnish" },
  { id: "KYC-004", user: "Lars Nilsson", email: "lars@example.com", level: "Basic", status: "rejected", submittedAt: "2026-03-19T16:45:00", documents: ["drivers_license"], completeness: 30, riskScore: "high", rejectionReason: "Document quality too low", nationality: "Danish" },
  { id: "KYC-005", user: "Maria Svensson", email: "maria@example.com", level: "Enhanced", status: "pending", submittedAt: "2026-03-22T08:00:00", documents: ["passport", "utility_bill"], completeness: 70, riskScore: "low", nationality: "Swedish" },
  { id: "KYC-006", user: "Olof Andersson", email: "olof@example.com", level: "Basic", status: "under_review", submittedAt: "2026-03-21T10:20:00", documents: ["national_id", "selfie"], completeness: 55, riskScore: "medium", nationality: "Icelandic" },
];

const riskColors: Record<string, string> = {
  low: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50",
  medium: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50",
  high: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50",
};

export default function KycVerification() {
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [activeStatus, setActiveStatus] = useState("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = sampleKycApplications.filter((kyc) => {
    const matchesSearch =
      !search ||
      kyc.user.toLowerCase().includes(search.toLowerCase()) ||
      kyc.email.toLowerCase().includes(search.toLowerCase()) ||
      kyc.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      activeStatus === "All" ||
      kyc.status.replace("_", " ").toLowerCase() === activeStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: sampleKycApplications.length,
    pending: sampleKycApplications.filter((k) => k.status === "pending").length,
    verified: sampleKycApplications.filter((k) => k.status === "verified").length,
    rejected: sampleKycApplications.filter((k) => k.status === "rejected").length,
  };

  return (
    <PageContainer>
      <PageHeader
        title="KYC Verification"
        subtitle="Review and manage identity verification applications"
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "KYC Verification" },
        ]}
        actions={
          <div className="flex gap-2">
            <ActionButton label="Export Report" icon={<Download size={14} />} onClick={() => {}} variant="secondary" />
            <ActionButton label="Refresh" icon={<RefreshCw size={14} />} onClick={() => {}} variant="primary" />
          </div>
        }
      />

      <StatsGrid>
        <StatCard label="Total Applications" value={stats.total} icon={<ShieldQuestion size={18} />} iconColor="from-blue-500 to-blue-600" index={0} />
        <StatCard label="Pending Review" value={stats.pending} icon={<ShieldAlert size={18} />} iconColor="from-amber-500 to-amber-600" change={`${stats.pending} awaiting`} index={1} />
        <StatCard label="Verified" value={stats.verified} icon={<ShieldCheck size={18} />} iconColor="from-emerald-500 to-emerald-600" change="+15%" positive index={2} />
        <StatCard label="Rejected" value={stats.rejected} icon={<ShieldX size={18} />} iconColor="from-rose-500 to-rose-600" index={3} />
      </StatsGrid>

      {/* Status Filter Pills */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {kycStatuses.map((s) => (
          <FilterPill key={s} label={s} active={activeStatus === s} onClick={() => setActiveStatus(s)} />
        ))}
      </div>

      <FilterBar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search by name, email, or KYC ID..." />

      {/* KYC Applications List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((kyc, i) => (
            <motion.div
              key={kyc.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }}
              exit={{ opacity: 0, x: -20 }}
              layout
            >
              <DashCard hover onClick={() => setExpandedId(expandedId === kyc.id ? null : kyc.id)}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  {/* User Info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                      {kyc.user.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{kyc.user}</p>
                      <p className="text-[10px] sm:text-xs text-gray-400">{kyc.email} · {kyc.id}</p>
                    </div>
                  </div>

                  {/* Level & Nationality */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{kyc.nationality}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400">{kyc.level}</span>
                  </div>

                  {/* Risk Score */}
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium capitalize flex-shrink-0 ${riskColors[kyc.riskScore]}`}>
                    {kyc.riskScore} risk
                  </span>

                  {/* Status */}
                  <StatusBadge status={kyc.status.replace("_", " ")} />

                  {/* Completeness */}
                  <div className="w-20 flex-shrink-0 hidden lg:block">
                    <p className="text-[10px] text-gray-400 mb-1">{kyc.completeness}%</p>
                    <ProgressBar
                      value={kyc.completeness}
                      color={kyc.completeness === 100 ? "bg-emerald-500" : kyc.completeness > 60 ? "bg-blue-500" : "bg-amber-500"}
                    />
                  </div>

                  {/* Expand */}
                  <motion.div animate={{ rotate: expandedId === kyc.id ? 180 : 0 }}>
                    <ChevronDown size={16} className="text-gray-400" />
                  </motion.div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {expandedId === kyc.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          {/* Submitted Date */}
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-gray-400" />
                            <div>
                              <p className="text-[10px] text-gray-400">Submitted</p>
                              <p className="text-xs text-gray-700 dark:text-gray-300">
                                {new Date(kyc.submittedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                              </p>
                            </div>
                          </div>

                          {/* Documents */}
                          <div className="flex items-center gap-2">
                            <FileText size={14} className="text-gray-400" />
                            <div>
                              <p className="text-[10px] text-gray-400">Documents ({kyc.documents.length})</p>
                              <p className="text-xs text-gray-700 dark:text-gray-300 capitalize">
                                {kyc.documents.map((d) => d.replace("_", " ")).join(", ")}
                              </p>
                            </div>
                          </div>

                          {/* Completeness */}
                          <div>
                            <p className="text-[10px] text-gray-400 mb-1">Verification Progress</p>
                            <ProgressBar value={kyc.completeness} height="md" />
                            <p className="text-[10px] text-gray-400 mt-1">{kyc.completeness}% complete</p>
                          </div>

                          {/* Rejection Reason */}
                          {kyc.status === "rejected" && "rejectionReason" in kyc && (
                            <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900">
                              <p className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">Rejection Reason</p>
                              <p className="text-xs text-rose-700 dark:text-rose-300">{(kyc as any).rejectionReason}</p>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        {(kyc.status === "pending" || kyc.status === "under_review") && (
                          <div className="flex gap-2 mt-4">
                            <ActionButton label="View Documents" icon={<Eye size={14} />} onClick={() => {}} variant="secondary" />
                            <ActionButton label="Approve" icon={<CheckCircle size={14} />} onClick={() => toast.success(`${kyc.user} verified`)} variant="primary" />
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => toast.error(`${kyc.user} rejected`)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-rose-600 text-white hover:bg-rose-700 transition-colors"
                            >
                              <XCircle size={14} /> Reject
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
          <ShieldQuestion size={32} className="mx-auto mb-2 text-gray-300 dark:text-gray-600" />
          <p className="text-sm text-gray-500 dark:text-gray-400">No KYC applications found</p>
        </DashCard>
      )}
    </PageContainer>
  );
}
