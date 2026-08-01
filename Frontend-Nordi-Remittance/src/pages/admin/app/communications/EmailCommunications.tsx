import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  MessageSquare,
  Bell,
  Megaphone,
  Plus,
  Send,
  Edit3,
  Trash2,
  Eye,
  Copy,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  Search,
  ChevronDown,
} from "lucide-react";
import {
  PageContainer,
  DashCard,
  StatCard,
  StatsGrid,
  SectionHeader,
  FilterPill,
  ActionButton,
  StatusBadge,
} from "@components/shared/DashboardPrimitives";
import { PageHeader } from "@components/shared/PageHeader";
import { useToast } from "@store/toast.store";
import { useCommunications } from "../../admin-usecase/useCommunications";

const sections = [
  { id: "email", label: "Email Templates", icon: <Mail size={16} /> },
  { id: "sms", label: "SMS Templates", icon: <MessageSquare size={16} /> },
  { id: "push", label: "Push Notifications", icon: <Bell size={16} /> },
  { id: "campaigns", label: "Campaigns", icon: <Megaphone size={16} /> },
];

export default function EmailCommunications() {
  const toast = useToast();
  const {
    emailTemplates,
    smsTemplates,
    pushTemplates,
    campaigns,
    stats,
    search,
    categoryFilter,
    activeSection,
    isLoading,
    setSearch,
    setCategoryFilter,
    setActiveSection,
    refetch,
  } = useCommunications();

  return (
    <PageContainer>
      <PageHeader
        title="Communications"
        subtitle="Manage email templates, SMS, push notifications, and marketing campaigns"
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Communications" }]}
        actions={
          <ActionButton
            label="Create Template"
            icon={<Plus size={14} />}
            onClick={() => toast.info("Opening template editor...")}
          />
        }
      />

      <StatsGrid>
        <StatCard
          label="Email Templates"
          value={stats.emailCount}
          icon={<Mail size={18} />}
          iconColor="from-blue-500 to-blue-600"
          index={0}
        />
        <StatCard
          label="SMS Templates"
          value={stats.smsCount}
          icon={<MessageSquare size={18} />}
          iconColor="from-emerald-500 to-emerald-600"
          index={1}
        />
        <StatCard
          label="Push Templates"
          value={stats.pushCount}
          icon={<Bell size={18} />}
          iconColor="from-violet-500 to-violet-600"
          index={2}
        />
        <StatCard
          label="Active Campaigns"
          value={stats.activeCampaigns}
          icon={<Megaphone size={18} />}
          iconColor="from-amber-500 to-amber-600"
          index={3}
        />
      </StatsGrid>

      {/* Section Tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {sections.map((s) => (
          <motion.button
            key={s.id}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setActiveSection(s.id as any)}
            className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-medium transition-all ${
              activeSection === s.id
                ? "bg-gray-900 text-white shadow-lg dark:bg-white dark:text-gray-900"
                : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-400 dark:hover:bg-gray-800"
            }`}
          >
            {s.icon}
            {s.label}
          </motion.button>
        ))}
      </div>

      {/* Email Templates */}
      {activeSection === "email" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <SectionHeader title="Email Templates" subtitle="Manage transactional and marketing email templates" />
          {emailTemplates.map((tmpl: any, i: number) => (
            <motion.div
              key={tmpl.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, transition: { delay: i * 0.04 } }}
            >
              <DashCard hover>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/30">
                    <Mail size={16} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{tmpl.name}</p>
                      <StatusBadge status={tmpl.status} />
                    </div>
                    <p className="mt-0.5 truncate text-[11px] text-gray-400">{tmpl.subject}</p>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-4 text-[11px] text-gray-400">
                    {tmpl.sentCount > 0 && (
                      <>
                        <span className="flex items-center gap-1">
                          <Send size={10} />
                          {tmpl.sentCount.toLocaleString()} sent
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye size={10} />
                          {tmpl.openRate}% opened
                        </span>
                      </>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock size={10} />
                      {tmpl.lastEdited}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                    >
                      <Eye size={14} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                    >
                      <Edit3 size={14} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                    >
                      <Copy size={14} />
                    </motion.button>
                  </div>
                </div>
              </DashCard>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* SMS Templates */}
      {activeSection === "sms" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <SectionHeader title="SMS Templates" subtitle="Short message templates for OTP, alerts, and notifications" />
          {smsTemplates.map((tmpl: any, i: number) => (
            <motion.div
              key={tmpl.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, transition: { delay: i * 0.04 } }}
            >
              <DashCard hover>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/30">
                    <MessageSquare size={16} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{tmpl.name}</p>
                      <StatusBadge status={tmpl.status} />
                    </div>
                    <p className="mt-0.5 truncate font-mono text-[11px] text-gray-400">{tmpl.message}</p>
                  </div>
                  <span className="flex flex-shrink-0 items-center gap-1 text-[11px] text-gray-400">
                    <Send size={10} />
                    {tmpl.sentCount.toLocaleString()} sent
                  </span>
                  <div className="flex items-center gap-1">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                    >
                      <Edit3 size={14} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                    >
                      <Copy size={14} />
                    </motion.button>
                  </div>
                </div>
              </DashCard>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Push Notifications */}
      {activeSection === "push" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <SectionHeader
            title="Push Notification Templates"
            subtitle="In-app and browser push notification templates"
          />
          {pushTemplates.map((tmpl: any, i: number) => (
            <motion.div
              key={tmpl.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, transition: { delay: i * 0.04 } }}
            >
              <DashCard hover>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-950/30">
                    <Bell size={16} className="text-violet-600 dark:text-violet-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{tmpl.title}</p>
                      <StatusBadge status={tmpl.status} />
                    </div>
                    <p className="mt-0.5 truncate text-[11px] text-gray-400">{tmpl.body}</p>
                  </div>
                  {tmpl.sentCount > 0 && (
                    <span className="flex flex-shrink-0 items-center gap-1 text-[11px] text-gray-400">
                      <Send size={10} />
                      {tmpl.sentCount.toLocaleString()} sent
                    </span>
                  )}
                  <div className="flex items-center gap-1">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                    >
                      <Edit3 size={14} />
                    </motion.button>
                  </div>
                </div>
              </DashCard>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Campaigns */}
      {activeSection === "campaigns" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <SectionHeader
            title="Marketing Campaigns"
            subtitle="Multi-channel marketing campaigns and performance tracking"
          />
          <DashCard className="mt-3">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    {["Campaign", "Type", "Status", "Recipients", "Opened", "Clicked", "CTR", "Date"].map((h) => (
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
                  {campaigns.map((cmp: any, i: number) => (
                    <motion.tr
                      key={cmp.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1, transition: { delay: i * 0.05 } }}
                      className="border-b border-gray-50 transition-colors hover:bg-gray-50/50 dark:border-gray-800/50 dark:hover:bg-gray-800/30"
                    >
                      <td className="px-2 py-3 font-medium text-gray-900 dark:text-white">{cmp.name}</td>
                      <td className="px-2 py-3">
                        <span className="rounded-lg bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                          {cmp.type}
                        </span>
                      </td>
                      <td className="px-2 py-3">
                        <StatusBadge status={cmp.status} />
                      </td>
                      <td className="px-2 py-3 text-gray-600 dark:text-gray-300">{cmp.recipients.toLocaleString()}</td>
                      <td className="px-2 py-3 text-gray-600 dark:text-gray-300">{cmp.opened.toLocaleString()}</td>
                      <td className="px-2 py-3 text-gray-600 dark:text-gray-300">{cmp.clicked.toLocaleString()}</td>
                      <td className="px-2 py-3 font-medium text-gray-900 dark:text-white">
                        {cmp.recipients > 0 ? `${((cmp.clicked / cmp.recipients) * 100).toFixed(1)}%` : "—"}
                      </td>
                      <td className="px-2 py-3 text-gray-400">{cmp.sentDate || "—"}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DashCard>
        </motion.div>
      )}
    </PageContainer>
  );
}
