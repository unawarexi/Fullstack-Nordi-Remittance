import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  CreditCard,
  CheckCircle,
  AlertTriangle,
  Bell,
  Lightbulb,
  TrendingUp,
  TrendingDown,
  DollarSign,
  MapPin,
  ChevronRight,
  Upload,
  Shield,
  Target,
  Lock,
  Unlock,
} from "lucide-react";
import { useInView } from "@hooks/useInView";
import {
  useCards,
  useSavingsGoals,
  useKycStatus,
  useUnreadNotifications,
  useUnreadNotificationsCount,
  useFinancialInsights,
  useTwoFactorStatus,
} from "@hooks/queries";
import { CreditCardSkeleton, SkeletonBlock } from "@components/skeletons/Skeletons";

/* eslint-disable @typescript-eslint/no-explicit-any */

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

// ========================
// CARDS PREVIEW (always visible — first sidebar section)
// ========================
const CardsPreviewSection: React.FC = () => {
  const navigate = useNavigate();
  const { data: cardsRes, isLoading } = useCards();
  const cards: any[] = (cardsRes as any)?.data || (cardsRes as any) || [];

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-3">
        <SkeletonBlock className="h-5 w-24 mb-3" />
        <CreditCardSkeleton />
      </div>
    );
  }

  const activeCards = cards
    .filter((c: any) => c.status === "active" || !c.status)
    .slice(0, 2);

  return (
    <motion.div
      className="bg-white rounded-xl shadow-sm p-3"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-base font-semibold text-indigo-900">Your Cards</h2>
        <CreditCard size={16} className="text-purple-500" />
      </div>

      {activeCards.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">
          No cards found
        </p>
      ) : (
        <div className="space-y-3">
          {activeCards.map((card: any) => {
            const gradient = card.isVirtual
              ? "bg-gradient-to-r from-purple-500 to-pink-500"
              : "bg-gradient-to-r from-indigo-600 to-purple-600";
            const last4 =
              card.lastFour || card.cardNumber?.slice(-4) || "••••";
            const limit = card.spendLimit || card.limit || 0;
            const used = card.usedAmount || card.currentSpend || 0;
            const usagePct = limit > 0 ? (used / limit) * 100 : 0;

            return (
              <motion.div
                key={card._id || card.id}
                className="rounded-xl overflow-hidden cursor-pointer"
                variants={itemVariants}
                whileHover={{ y: -3 }}
                onClick={() => navigate("/customer/cards")}
              >
                <div
                  className={`${gradient} p-3 text-white relative h-32`}
                >
                  <div className="flex justify-between">
                    <div>
                      <p className="text-[10px] opacity-80">
                        {card.isVirtual ? "Virtual" : "Physical"}
                      </p>
                      <h3 className="text-sm font-semibold">
                        {card.name || card.cardName || "Card"}
                      </h3>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <div className="w-4 h-4 bg-red-500 rounded-full opacity-80" />
                      <div className="w-4 h-4 bg-amber-400 rounded-full opacity-80 -ml-1.5" />
                    </div>
                  </div>
                  <p className="text-sm font-mono tracking-wider mt-4">
                    •••• •••• •••• {last4}
                  </p>
                  <div className="flex justify-between mt-1.5 text-[10px] opacity-80">
                    <p>Exp: {card.expiryDate || card.expiry || "••/••"}</p>
                    <p>
                      {card.status === "active" || !card.status
                        ? "Active"
                        : card.status}
                    </p>
                  </div>
                </div>

                {limit > 0 && (
                  <div className="bg-indigo-50 p-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-indigo-700">Usage</span>
                      <span className="font-medium text-indigo-900">
                        ${used.toLocaleString()} / ${limit.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-white rounded-full h-1 mt-1">
                      <motion.div
                        className="h-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.min(usagePct, 100)}%`,
                        }}
                        transition={{ duration: 0.8 }}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      <div className="mt-2">
        <motion.button
          className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center"
          whileHover={{ x: 2 }}
          onClick={() => navigate("/customer/cards")}
        >
          Manage Cards <ChevronRight size={14} />
        </motion.button>
      </div>
    </motion.div>
  );
};

// ========================
// SAVINGS GOALS (lazy child — NEW)
// ========================
const SavingsGoalsSection: React.FC = () => {
  const navigate = useNavigate();
  const { data: goalsRes, isLoading } = useSavingsGoals();
  const goals: any[] = (goalsRes as any) || [];

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-3">
        <SkeletonBlock className="h-5 w-28 mb-3" />
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <SkeletonBlock key={i} className="h-14 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (goals.length === 0) return null;

  return (
    <motion.div
      className="bg-white rounded-xl shadow-sm p-3"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-base font-semibold text-indigo-900">
          Savings Goals
        </h2>
        <Target size={16} className="text-purple-500" />
      </div>

      <div className="space-y-2.5">
        {goals.slice(0, 3).map((goal: any, i: number) => {
          const current = goal.currentAmount || goal.saved || 0;
          const target = goal.targetAmount || goal.target || 1;
          const pct = Math.min((current / target) * 100, 100);

          return (
            <motion.div
              key={goal._id || i}
              className="p-2.5 bg-indigo-50 rounded-lg cursor-pointer hover:bg-indigo-100 transition"
              variants={itemVariants}
              whileHover={{ x: 2 }}
              onClick={() => navigate("/customer/savings")}
            >
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-sm font-medium text-indigo-900">
                  {goal.name || goal.title || "Goal"}
                </h3>
                <span className="text-xs font-semibold text-purple-700">
                  {pct.toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-white rounded-full h-1.5">
                <motion.div
                  className="h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                />
              </div>
              <div className="flex justify-between mt-1 text-[10px] text-gray-500">
                <span>${current.toLocaleString()} saved</span>
                <span>${target.toLocaleString()} goal</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.button
        className="w-full mt-2 text-center text-xs text-purple-600 hover:text-purple-800 flex items-center justify-center"
        whileHover={{ x: 2 }}
        onClick={() => navigate("/customer/savings")}
      >
        View All Goals <ChevronRight size={14} />
      </motion.button>
    </motion.div>
  );
};

// ========================
// SECURITY & VERIFICATION STATUS (lazy child)
// ========================
const VerificationStatusSection: React.FC = () => {
  const navigate = useNavigate();
  const { data: kycRes, isLoading: kycLoading } = useKycStatus();
  const { data: tfaRes, isLoading: tfaLoading } = useTwoFactorStatus();

  const kyc: any = (kycRes as any) || {};
  const tfa: any = tfaRes?.data || tfaRes || {};

  if (kycLoading && tfaLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-3">
        <SkeletonBlock className="h-5 w-36 mb-3" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <SkeletonBlock key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const kycStatus = kyc?.status || kyc?.kycStatus || "pending";
  const kycVerified = kycStatus === "verified" || kycStatus === "approved";
  const twoFaEnabled = tfa?.enabled || tfa?.isEnabled || false;

  const items = [
    {
      label: "KYC Status",
      ok: kycVerified,
      text: kycVerified ? "Verified" : "Pending",
      icon: kycVerified ? (
        <CheckCircle size={16} />
      ) : (
        <AlertTriangle size={16} />
      ),
      bg: kycVerified ? "bg-green-50" : "bg-amber-50",
      fg: kycVerified ? "text-green-700" : "text-amber-700",
      ic: kycVerified ? "text-green-600" : "text-amber-600",
      route: "/customer/profile/documents",
    },
    {
      label: "Two-Factor Auth",
      ok: twoFaEnabled,
      text: twoFaEnabled ? "Enabled" : "Disabled",
      icon: twoFaEnabled ? <Lock size={16} /> : <Unlock size={16} />,
      bg: twoFaEnabled ? "bg-green-50" : "bg-rose-50",
      fg: twoFaEnabled ? "text-green-700" : "text-rose-700",
      ic: twoFaEnabled ? "text-green-600" : "text-rose-600",
      route: "/customer/security/2fa",
    },
  ];

  return (
    <motion.div
      className="bg-white rounded-xl shadow-sm p-3"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-base font-semibold text-indigo-900">
          Security & Verification
        </h2>
        <Shield size={16} className="text-purple-500" />
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <motion.div
            key={item.label}
            className={`flex items-center justify-between p-2.5 ${item.bg} rounded-lg cursor-pointer`}
            variants={itemVariants}
            whileHover={{ x: 2 }}
            onClick={() => navigate(item.route)}
          >
            <div className="flex items-center gap-2">
              <span className={item.ic}>{item.icon}</span>
              <span className={`text-sm font-medium ${item.fg}`}>
                {item.label}
              </span>
            </div>
            <span className={`text-xs ${item.ic}`}>{item.text}</span>
          </motion.div>
        ))}

        <motion.div
          className="flex items-center justify-between p-2.5 bg-indigo-50 rounded-lg cursor-pointer"
          variants={itemVariants}
          whileHover={{ x: 2 }}
          onClick={() => navigate("/customer/profile/documents")}
        >
          <div className="flex items-center gap-2">
            <Upload size={16} className="text-indigo-600" />
            <span className="text-sm font-medium text-indigo-800">
              Upload Documents
            </span>
          </div>
          <ChevronRight size={14} className="text-indigo-600" />
        </motion.div>
      </div>
    </motion.div>
  );
};

// ========================
// NOTIFICATIONS (lazy child)
// ========================
const NotificationsSection: React.FC = () => {
  const navigate = useNavigate();
  const { data: countRes } = useUnreadNotificationsCount();
  const { data: notifsRes, isLoading } = useUnreadNotifications(5);

  const count = (countRes as any)?.count || 0;
  const notifs: any[] = (notifsRes as any) || [];

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-3">
        <SkeletonBlock className="h-5 w-28 mb-3" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <SkeletonBlock key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="bg-white rounded-xl shadow-sm p-3"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-indigo-900">
            Notifications
          </h2>
          {typeof count === "number" && count > 0 && (
            <span className="bg-indigo-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
              {count}
            </span>
          )}
        </div>
        <Bell size={16} className="text-purple-500" />
      </div>

      {notifs.length === 0 ? (
        <p className="text-xs text-gray-500 text-center py-3">
          All caught up!
        </p>
      ) : (
        <div className="space-y-1.5">
          {notifs.slice(0, 5).map((n: any, i: number) => {
            const typeColor: Record<string, string> = {
              warning: "bg-amber-100 text-amber-600",
              error: "bg-rose-100 text-rose-600",
              success: "bg-emerald-100 text-emerald-600",
              info: "bg-indigo-100 text-indigo-600",
            };
            const color = typeColor[n.type || "info"] || typeColor.info;

            return (
              <motion.div
                key={n._id || i}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-indigo-50 cursor-pointer"
                variants={itemVariants}
                whileHover={{ x: 2 }}
                onClick={() => navigate("/customer/mobile/notifications")}
              >
                <div className={`p-1 rounded-full ${color}`}>
                  <Bell size={12} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-indigo-900 truncate">
                    {n.title || n.message || "Notification"}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    {n.createdAt
                      ? new Date(n.createdAt).toLocaleDateString()
                      : "Just now"}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <motion.button
        className="w-full mt-2 text-center text-xs text-purple-600 hover:text-purple-800"
        whileHover={{ x: 2 }}
        onClick={() => navigate("/customer/mobile/notifications")}
      >
        View All Notifications
      </motion.button>
    </motion.div>
  );
};

// ========================
// SMART INSIGHTS (lazy child)
// ========================
const SmartInsightsSection: React.FC = () => {
  const { data: insightsRes, isLoading } = useFinancialInsights();
  const insights: any[] = insightsRes?.data || insightsRes || [];

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-3">
        <SkeletonBlock className="h-5 w-28 mb-3" />
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <SkeletonBlock key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (insights.length === 0) return null;

  const insightIcons: Record<
    string,
    { icon: React.ReactNode; color: string }
  > = {
    positive: {
      icon: <TrendingUp size={14} />,
      color: "text-emerald-600 bg-emerald-100",
    },
    negative: {
      icon: <TrendingDown size={14} />,
      color: "text-rose-600 bg-rose-100",
    },
    tip: {
      icon: <Lightbulb size={14} />,
      color: "text-amber-600 bg-amber-100",
    },
    info: {
      icon: <Lightbulb size={14} />,
      color: "text-blue-600 bg-blue-100",
    },
  };

  return (
    <motion.div
      className="bg-white rounded-xl shadow-sm p-3"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-base font-semibold text-indigo-900">
          Smart Insights
        </h2>
        <Lightbulb size={16} className="text-purple-500" />
      </div>

      <div className="space-y-2">
        {insights.slice(0, 3).map((ins: any, i: number) => {
          const iconInfo =
            insightIcons[ins.type || ins.sentiment || "info"] ||
            insightIcons.info;
          return (
            <motion.div
              key={ins._id || i}
              className="border border-indigo-100 rounded-lg p-2.5 hover:shadow-sm transition"
              variants={itemVariants}
            >
              <div className="flex gap-2">
                <div className={`p-1.5 rounded-lg ${iconInfo.color} h-min`}>
                  {iconInfo.icon}
                </div>
                <div>
                  <h3 className="text-xs font-medium text-indigo-900">
                    {ins.title || ins.message || "Insight"}
                  </h3>
                  {ins.description && (
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      {ins.description}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

// ========================
// MAIN SIDEBAR COMPONENT
// ========================
const DashboardSidebar: React.FC = () => {
  const navigate = useNavigate();
  const [goalsRef, goalsInView] = useInView();
  const [verifyRef, verifyInView] = useInView();
  const [notifsRef, notifsInView] = useInView();
  const [insightsRef, insightsInView] = useInView();

  const sidebarSkeleton = (
    <div className="bg-white rounded-xl shadow-sm p-3">
      <SkeletonBlock className="h-5 w-28 mb-3" />
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <SkeletonBlock key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full lg:w-80 flex flex-col gap-4">
      {/* Cards — always visible */}
      <CardsPreviewSection />

      {/* Savings Goals — lazy */}
      <div ref={goalsRef}>
        {goalsInView ? <SavingsGoalsSection /> : sidebarSkeleton}
      </div>

      {/* Verification Status — lazy */}
      <div ref={verifyRef}>
        {verifyInView ? <VerificationStatusSection /> : sidebarSkeleton}
      </div>

      {/* Notifications — lazy */}
      <div ref={notifsRef}>
        {notifsInView ? <NotificationsSection /> : sidebarSkeleton}
      </div>

      {/* Smart Insights — lazy */}
      <div ref={insightsRef}>
        {insightsInView ? <SmartInsightsSection /> : sidebarSkeleton}
      </div>

      {/* Quick Tools — always visible */}
      <motion.div
        className="bg-white rounded-xl shadow-sm p-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-base font-semibold text-indigo-900 mb-2">Tools</h2>
        <div className="grid grid-cols-3 gap-2">
          <motion.div
            className="p-2.5 bg-indigo-50 rounded-lg flex flex-col items-center justify-center cursor-pointer"
            whileHover={{ y: -2, backgroundColor: "#e0e7ff" }}
            onClick={() => navigate("/customer/forex/rates")}
          >
            <DollarSign size={16} className="text-indigo-600 mb-0.5" />
            <span className="text-[10px] font-medium text-indigo-800">
              Forex
            </span>
          </motion.div>
          <motion.div
            className="p-2.5 bg-purple-50 rounded-lg flex flex-col items-center justify-center cursor-pointer"
            whileHover={{ y: -2, backgroundColor: "#ede9fe" }}
            onClick={() => navigate("/customer/support")}
          >
            <MapPin size={16} className="text-purple-600 mb-0.5" />
            <span className="text-[10px] font-medium text-purple-800">
              Support
            </span>
          </motion.div>
          <motion.div
            className="p-2.5 bg-pink-50 rounded-lg flex flex-col items-center justify-center cursor-pointer"
            whileHover={{ y: -2, backgroundColor: "#fce7f3" }}
            onClick={() => navigate("/customer/profile/documents")}
          >
            <Upload size={16} className="text-pink-600 mb-0.5" />
            <span className="text-[10px] font-medium text-pink-800">Docs</span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardSidebar;