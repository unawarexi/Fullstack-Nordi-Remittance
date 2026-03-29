import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  AlertTriangle,
  Bell,
  Lightbulb,
  ChevronRight,
  Upload,
  Shield,
  Target,
  Lock,
  Unlock,
} from "lucide-react";
import { useInView } from "@hooks/useInView";
import {
  SkeletonBlock,
} from "@components/skeletons/Skeletons";
import {
  DashCard,
  SectionHeader,
  ProgressBar,
} from "@components/shared/DashboardPrimitives";
import {
  sidebarItemVariants,
} from "@core/animation/Animation";
import { formatCurrency } from "@core/algo";
import {
  SIDEBAR_TOOLS,
  NOTIFICATION_TYPE_COLORS,
  INSIGHT_CONFIG,
} from "../../domain/constants/dashboard.constants";

// ========================
// PROPS INTERFACE
// ========================
interface DashboardSidebarProps {
  savingsGoals: SavingsGoalItem[];
  isSavingsLoading: boolean;
  security: SecurityStatus;
  isSecurityLoading: boolean;
  notifications: NotificationItem[];
  unreadCount: number;
  isNotificationsLoading: boolean;
  insights: InsightItem[];
  isInsightsLoading: boolean;
}

// ========================
// SAVINGS GOALS
// ========================
const SavingsGoalsSection: React.FC<{
  goals: SavingsGoalItem[];
  isLoading: boolean;
}> = React.memo(({ goals, isLoading }) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <DashCard>
        <SkeletonBlock className="h-5 w-28 mb-3" />
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <SkeletonBlock key={i} className="h-14 w-full" />
          ))}
        </div>
      </DashCard>
    );
  }
  if (goals.length === 0) return null;

  return (
    <DashCard>
      <SectionHeader title="Savings Goals" icon={<Target size={16} />} />
      <div className="space-y-2.5">
        {goals.map((goal, i) => (
          <motion.div
            key={goal.id || i}
            className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            variants={sidebarItemVariants}
            whileHover={{ x: 2 }}
            onClick={() => navigate("/customer/savings")}
          >
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                {goal.name}
              </h3>
              <span className="text-[10px] sm:text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                {goal.percentage.toFixed(0)}%
              </span>
            </div>
            <ProgressBar value={goal.percentage} delay={i * 0.1} />
            <div className="flex justify-between mt-1 text-[10px] text-gray-500 dark:text-gray-400">
              <span>{formatCurrency(goal.currentAmount)} saved</span>
              <span>{formatCurrency(goal.targetAmount)} goal</span>
            </div>
          </motion.div>
        ))}
      </div>
      <motion.button
        className="w-full mt-2 text-center text-[10px] sm:text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center justify-center"
        whileHover={{ x: 2 }}
        onClick={() => navigate("/customer/savings")}
      >
        View All Goals <ChevronRight size={14} />
      </motion.button>
    </DashCard>
  );
});

// ========================
// SECURITY & VERIFICATION
// ========================
const VerificationStatusSection: React.FC<{
  security: SecurityStatus;
  isLoading: boolean;
}> = React.memo(({ security, isLoading }) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <DashCard>
        <SkeletonBlock className="h-5 w-36 mb-3" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <SkeletonBlock key={i} className="h-10 w-full" />
          ))}
        </div>
      </DashCard>
    );
  }

  const items = [
    {
      label: "KYC Status",
      ok: security.kycVerified,
      text: security.kycVerified ? "Verified" : "Pending",
      icon: security.kycVerified ? (
        <CheckCircle size={16} />
      ) : (
        <AlertTriangle size={16} />
      ),
      bg: security.kycVerified
        ? "bg-green-50 dark:bg-green-950/30"
        : "bg-amber-50 dark:bg-amber-950/30",
      fg: security.kycVerified
        ? "text-green-700 dark:text-green-400"
        : "text-amber-700 dark:text-amber-400",
      ic: security.kycVerified
        ? "text-green-600 dark:text-green-400"
        : "text-amber-600 dark:text-amber-400",
      route: "/customer/profile/documents",
    },
    {
      label: "Two-Factor Auth",
      ok: security.twoFaEnabled,
      text: security.twoFaEnabled ? "Enabled" : "Disabled",
      icon: security.twoFaEnabled ? (
        <Lock size={16} />
      ) : (
        <Unlock size={16} />
      ),
      bg: security.twoFaEnabled
        ? "bg-green-50 dark:bg-green-950/30"
        : "bg-rose-50 dark:bg-rose-950/30",
      fg: security.twoFaEnabled
        ? "text-green-700 dark:text-green-400"
        : "text-rose-700 dark:text-rose-400",
      ic: security.twoFaEnabled
        ? "text-green-600 dark:text-green-400"
        : "text-rose-600 dark:text-rose-400",
      route: "/customer/security/2fa",
    },
  ];

  return (
    <DashCard>
      <SectionHeader
        title="Security & Verification"
        icon={<Shield size={16} />}
      />
      <div className="space-y-2">
        {items.map((item) => (
          <motion.div
            key={item.label}
            className={`flex items-center justify-between p-2.5 ${item.bg} rounded-lg cursor-pointer`}
            variants={sidebarItemVariants}
            whileHover={{ x: 2 }}
            onClick={() => navigate(item.route)}
          >
            <div className="flex items-center gap-2">
              <span className={item.ic}>{item.icon}</span>
              <span
                className={`text-xs sm:text-sm font-medium ${item.fg}`}
              >
                {item.label}
              </span>
            </div>
            <span className={`text-[10px] sm:text-xs ${item.ic}`}>
              {item.text}
            </span>
          </motion.div>
        ))}
        <motion.div
          className="flex items-center justify-between p-2.5 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg cursor-pointer"
          variants={sidebarItemVariants}
          whileHover={{ x: 2 }}
          onClick={() => navigate("/customer/profile/documents")}
        >
          <div className="flex items-center gap-2">
            <Upload
              size={16}
              className="text-indigo-600 dark:text-indigo-400"
            />
            <span className="text-xs sm:text-sm font-medium text-indigo-800 dark:text-indigo-300">
              Upload Documents
            </span>
          </div>
          <ChevronRight
            size={14}
            className="text-indigo-600 dark:text-indigo-400"
          />
        </motion.div>
      </div>
    </DashCard>
  );
});

// ========================
// NOTIFICATIONS
// ========================
const NotificationsSection: React.FC<{
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
}> = React.memo(({ notifications, unreadCount, isLoading }) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <DashCard>
        <SkeletonBlock className="h-5 w-28 mb-3" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <SkeletonBlock key={i} className="h-10 w-full" />
          ))}
        </div>
      </DashCard>
    );
  }

  return (
    <DashCard>
      <SectionHeader
        title="Notifications"
        icon={<Bell size={16} />}
        action={
          typeof unreadCount === "number" && unreadCount > 0 ? (
            <span className="bg-indigo-600 dark:bg-indigo-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
              {unreadCount}
            </span>
          ) : undefined
        }
      />
      {notifications.length === 0 ? (
        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 text-center py-3">
          All caught up!
        </p>
      ) : (
        <div className="space-y-1.5">
          {notifications.map((n, i) => {
            const color =
              NOTIFICATION_TYPE_COLORS[n.type] ||
              NOTIFICATION_TYPE_COLORS.info;
            return (
              <motion.div
                key={n.id || i}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                variants={sidebarItemVariants}
                whileHover={{ x: 2 }}
                onClick={() =>
                  navigate("/customer/mobile/notifications")
                }
              >
                <div className={`p-1 rounded-full ${color}`}>
                  <Bell size={12} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-xs font-medium text-gray-900 dark:text-white truncate">
                    {n.title}
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">
                    {n.date}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
      <motion.button
        className="w-full mt-2 text-center text-[10px] sm:text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
        whileHover={{ x: 2 }}
        onClick={() => navigate("/customer/mobile/notifications")}
      >
        View All Notifications
      </motion.button>
    </DashCard>
  );
});

// ========================
// SMART INSIGHTS
// ========================
const SmartInsightsSection: React.FC<{
  insights: InsightItem[];
  isLoading: boolean;
}> = React.memo(({ insights, isLoading }) => {
  if (isLoading) {
    return (
      <DashCard>
        <SkeletonBlock className="h-5 w-28 mb-3" />
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <SkeletonBlock key={i} className="h-16 w-full" />
          ))}
        </div>
      </DashCard>
    );
  }
  if (insights.length === 0) return null;

  return (
    <DashCard>
      <SectionHeader title="Smart Insights" icon={<Lightbulb size={16} />} />
      <div className="space-y-2">
        {insights.map((ins, i) => {
          const iconInfo =
            INSIGHT_CONFIG[ins.sentiment] || INSIGHT_CONFIG.info;
          return (
            <motion.div
              key={ins.id || i}
              className="border border-gray-100 dark:border-gray-800 rounded-lg p-2.5 hover:border-gray-200 dark:hover:border-gray-700 transition-colors"
              variants={sidebarItemVariants}
            >
              <div className="flex gap-2">
                <div className={`p-1.5 rounded-lg ${iconInfo.color} h-min`}>
                  {iconInfo.icon}
                </div>
                <div>
                  <h3 className="text-[10px] sm:text-xs font-medium text-gray-900 dark:text-white">
                    {ins.title}
                  </h3>
                  {ins.description && (
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                      {ins.description}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </DashCard>
  );
});

// ========================
// MAIN SIDEBAR
// ========================
const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  savingsGoals,
  isSavingsLoading,
  security,
  isSecurityLoading,
  notifications,
  unreadCount,
  isNotificationsLoading,
  insights,
  isInsightsLoading,
}) => {
  const navigate = useNavigate();
  const [goalsRef, goalsInView] = useInView();
  const [verifyRef, verifyInView] = useInView();
  const [notifsRef, notifsInView] = useInView();
  const [insightsRef, insightsInView] = useInView();

  const sidebarSkeleton = (
    <DashCard>
      <SkeletonBlock className="h-5 w-28 mb-3" />
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <SkeletonBlock key={i} className="h-12 w-full" />
        ))}
      </div>
    </DashCard>
  );

  return (
    <div className="w-full lg:w-80 flex flex-col gap-5">
      <div ref={goalsRef}>
        {goalsInView ? (
          <SavingsGoalsSection
            goals={savingsGoals}
            isLoading={isSavingsLoading}
          />
        ) : (
          sidebarSkeleton
        )}
      </div>

      <div ref={verifyRef}>
        {verifyInView ? (
          <VerificationStatusSection
            security={security}
            isLoading={isSecurityLoading}
          />
        ) : (
          sidebarSkeleton
        )}
      </div>

      <div ref={notifsRef}>
        {notifsInView ? (
          <NotificationsSection
            notifications={notifications}
            unreadCount={unreadCount}
            isLoading={isNotificationsLoading}
          />
        ) : (
          sidebarSkeleton
        )}
      </div>

      <div ref={insightsRef}>
        {insightsInView ? (
          <SmartInsightsSection
            insights={insights}
            isLoading={isInsightsLoading}
          />
        ) : (
          sidebarSkeleton
        )}
      </div>

      {/* Quick Tools */}
      <DashCard>
        <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-2">
          Tools
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {SIDEBAR_TOOLS.map((tool) => (
            <motion.div
              key={tool.label}
              className={`p-2.5 ${tool.color} ${tool.hover} rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors`}
              whileHover={{ y: -2 }}
              onClick={() => navigate(tool.route)}
            >
              {tool.icon}
              <span className="text-[10px] font-medium mt-0.5">
                {tool.label}
              </span>
            </motion.div>
          ))}
        </div>
      </DashCard>
    </div>
  );
};

export default DashboardSidebar;
