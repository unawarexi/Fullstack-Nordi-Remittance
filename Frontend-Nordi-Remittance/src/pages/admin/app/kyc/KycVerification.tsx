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
import { useKycManagement } from "../../admin-usecase/useKycManagement";

const kycStatuses = ["All", "Pending", "Under Review", "Verified", "Rejected"];

const riskColors: Record<string, string> = {
  low: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50",
  medium: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50",
  high: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50",
};

export default function KycVerification() {
  const toast = useToast();
  const {
    applications: filtered,
    stats,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    approveUser,
    rejectUser,
    refetch,
    isLoading,
  } = useKycManagement();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const activeStatus = statusFilter === "all" ? "All" : statusFilter;

  return (
    <PageContainer>
      <PageHeader
        title="KYC Verification"
        subtitle="Review and manage identity verification applications"
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "KYC Verification" }]}
        actions={
          <div className="flex gap-2">
            <ActionButton label="Export Report" icon={<Download size={14} />} onClick={() => {}} variant="secondary" />
            <ActionButton label="Refresh" icon={<RefreshCw size={14} />} onClick={() => refetch()} variant="primary" />
          </div>
        }
      />

      <StatsGrid>
        <StatCard
          label="Total Applications"
          value={stats.totalPending + stats.totalApproved + stats.totalRejected}
          icon={<ShieldQuestion size={18} />}
          iconColor="from-blue-500 to-blue-600"
          index={0}
        />
        <StatCard
          label="Pending Review"
          value={stats.totalPending}
          icon={<ShieldAlert size={18} />}
          iconColor="from-amber-500 to-amber-600"
          change={`${stats.totalPending} awaiting`}
          index={1}
        />
        <StatCard
          label="Verified"
          value={stats.totalApproved}
          icon={<ShieldCheck size={18} />}
          iconColor="from-emerald-500 to-emerald-600"
          positive
          index={2}
        />
        <StatCard
          label="Rejected"
          value={stats.totalRejected}
          icon={<ShieldX size={18} />}
          iconColor="from-rose-500 to-rose-600"
          index={3}
        />
      </StatsGrid>

      {/* Status Filter Pills */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {kycStatuses.map((s) => (
          <FilterPill
            key={s}
            label={s}
            active={activeStatus === s}
            onClick={() => setStatusFilter(s === "All" ? "all" : (s.toLowerCase().replace(" ", "_") as any))}
          />
        ))}
      </div>

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, email, or KYC ID..."
      />

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
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  {/* User Info */}
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-sm font-semibold text-white">
                      {`${kyc.firstName} ${kyc.lastName}`
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                        {kyc.firstName} {kyc.lastName}
                      </p>
                      <p className="text-[10px] text-gray-400 sm:text-xs">
                        {kyc.email} · {kyc.id}
                      </p>
                    </div>
                  </div>

                  {/* Level & Nationality */}
                  <div className="flex flex-shrink-0 items-center gap-3">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{kyc.nationality}</span>
                    <span className="rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400">
                      {kyc.level}
                    </span>
                  </div>

                  {/* Risk Score */}
                  <span
                    className={`flex-shrink-0 rounded px-2 py-0.5 text-[10px] font-medium capitalize ${riskColors[kyc.riskLevel] || riskColors.low}`}
                  >
                    {kyc.riskLevel} risk
                  </span>

                  {/* Status */}
                  <StatusBadge status={kyc.kycStatus.replace("_", " ")} />

                  {/* Completeness */}
                  <div className="hidden w-20 flex-shrink-0 lg:block">
                    <p className="mb-1 text-[10px] text-gray-400">{kyc.documentsCount} docs</p>
                    <ProgressBar
                      value={kyc.documentsCount >= 4 ? 100 : kyc.documentsCount * 25}
                      color={
                        kyc.documentsCount >= 4
                          ? "bg-emerald-500"
                          : kyc.documentsCount >= 2
                            ? "bg-blue-500"
                            : "bg-amber-500"
                      }
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
                      <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-800">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                          {/* Submitted Date */}
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-gray-400" />
                            <div>
                              <p className="text-[10px] text-gray-400">Submitted</p>
                              <p className="text-xs text-gray-700 dark:text-gray-300">
                                {new Date(kyc.submittedAt).toLocaleDateString("en-GB", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </p>
                            </div>
                          </div>

                          {/* Documents */}
                          <div className="flex items-center gap-2">
                            <FileText size={14} className="text-gray-400" />
                            <div>
                              <p className="text-[10px] text-gray-400">Documents ({kyc.documentsCount})</p>
                              <p className="text-xs capitalize text-gray-700 dark:text-gray-300">
                                {kyc.idType ? kyc.idType.replace("_", " ") : "ID document"}
                              </p>
                            </div>
                          </div>

                          {/* Completeness */}
                          <div>
                            <p className="mb-1 text-[10px] text-gray-400">Verification Progress</p>
                            <ProgressBar value={kyc.documentsCount >= 4 ? 100 : kyc.documentsCount * 25} height="md" />
                            <p className="mt-1 text-[10px] text-gray-400">{kyc.documentsCount} document(s) submitted</p>
                          </div>

                          {/* Rejection Reason */}
                          {kyc.kycStatus === "rejected" && (
                            <div className="rounded-lg border border-rose-200 bg-rose-50 p-2 dark:border-rose-900 dark:bg-rose-950/30">
                              <p className="text-[10px] font-medium text-rose-600 dark:text-rose-400">
                                Rejection Reason
                              </p>
                              <p className="text-xs text-rose-700 dark:text-rose-300">{(kyc as any).rejectionReason}</p>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        {(kyc.kycStatus === "pending" || kyc.kycStatus === "under_review") && (
                          <div className="mt-4 flex gap-2">
                            <ActionButton
                              label="View Documents"
                              icon={<Eye size={14} />}
                              onClick={() => {}}
                              variant="secondary"
                            />
                            <ActionButton
                              label="Approve"
                              icon={<CheckCircle size={14} />}
                              onClick={() =>
                                approveUser(kyc.id, {
                                  onSuccess: () => toast.success(`${kyc.firstName} ${kyc.lastName} verified`),
                                })
                              }
                              variant="primary"
                            />
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() =>
                                rejectUser(kyc.id, "Insufficient documents", {
                                  onSuccess: () => toast.error(`${kyc.firstName} ${kyc.lastName} rejected`),
                                })
                              }
                              className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-rose-700"
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
        <DashCard className="py-12 text-center">
          <ShieldQuestion size={32} className="mx-auto mb-2 text-gray-300 dark:text-gray-600" />
          <p className="text-sm text-gray-500 dark:text-gray-400">No KYC applications found</p>
        </DashCard>
      )}
    </PageContainer>
  );
}
