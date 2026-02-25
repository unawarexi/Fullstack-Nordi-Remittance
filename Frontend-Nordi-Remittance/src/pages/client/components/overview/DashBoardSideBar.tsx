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
import {
  DashCard,
  SectionHeader,
  ProgressBar,
} from "@components/shared/DashboardPrimitives";
import {
  sidebarContainerVariants,
  sidebarItemVariants,
} from "@core/animation/Animation";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ========================
// CARDS PREVIEW
// ========================
const CardsPreviewSection: React.FC = () => {
  const navigate = useNavigate();
  const { data: cardsRes, isLoading } = useCards();
  const cards: any[] = Array.isArray(cardsRes)
    ? cardsRes
    : Array.isArray((cardsRes as any)?.data) ? (cardsRes as any).data : [];

  if (isLoading) {
    return (<DashCard><SkeletonBlock className="h-5 w-24 mb-3" /><CreditCardSkeleton /></DashCard>);
  }

  const activeCards = cards.filter((c: any) => c.status === "active" || !c.status).slice(0, 2);

  return (
    <DashCard>
      <SectionHeader title="Your Cards" icon={<CreditCard size={16} />} />
      {activeCards.length === 0 ? (
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center py-4">No cards found</p>
      ) : (
        <div className="space-y-3">
          {activeCards.map((card: any) => {
            const gradient = card.isVirtual
              ? "bg-gradient-to-r from-purple-500 to-pink-500"
              : "bg-gradient-to-r from-indigo-600 to-purple-600";
            const last4 = card.lastFour || card.cardNumber?.slice(-4) || "••••";
            const limit = card.spendLimit || card.limit || 0;
            const used = card.usedAmount || card.currentSpend || 0;
            const usagePct = limit > 0 ? (used / limit) * 100 : 0;

            return (
              <motion.div
                key={card._id || card.id}
                className="rounded-xl overflow-hidden cursor-pointer"
                variants={sidebarItemVariants}
                whileHover={{ y: -3 }}
                onClick={() => navigate("/customer/cards")}
              >
                <div className={`${gradient} p-3 text-white relative h-32`}>
                  <div className="flex justify-between">
                    <div>
                      <p className="text-[10px] opacity-80">{card.isVirtual ? "Virtual" : "Physical"}</p>
                      <h3 className="text-xs sm:text-sm font-semibold">{card.name || card.cardName || "Card"}</h3>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <div className="w-4 h-4 bg-red-500 rounded-full opacity-80" />
                      <div className="w-4 h-4 bg-amber-400 rounded-full opacity-80 -ml-1.5" />
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm font-mono tracking-wider mt-4">•••• •••• •••• {last4}</p>
                  <div className="flex justify-between mt-1.5 text-[10px] opacity-80">
                    <p>Exp: {card.expiryDate || card.expiry || "••/••"}</p>
                    <p>{card.status === "active" || !card.status ? "Active" : card.status}</p>
                  </div>
                </div>
                {limit > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-800 p-2">
                    <div className="flex justify-between text-[10px] sm:text-xs">
                      <span className="text-gray-600 dark:text-gray-400">Usage</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        ${used.toLocaleString()} / ${limit.toLocaleString()}
                      </span>
                    </div>
                    <ProgressBar value={usagePct} height="sm" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
      <div className="mt-2">
        <motion.button
          className="text-[10px] sm:text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center"
          whileHover={{ x: 2 }}
          onClick={() => navigate("/customer/cards")}
        >
          Manage Cards <ChevronRight size={14} />
        </motion.button>
      </div>
    </DashCard>
  );
};

// ========================
// SAVINGS GOALS
// ========================
const SavingsGoalsSection: React.FC = () => {
  const navigate = useNavigate();
  const { data: goalsRes, isLoading } = useSavingsGoals();
  const goals: any[] = Array.isArray(goalsRes) ? goalsRes : Array.isArray((goalsRes as any)?.data) ? (goalsRes as any).data : [];

  if (isLoading) {
    return (<DashCard><SkeletonBlock className="h-5 w-28 mb-3" /><div className="space-y-2">{[1, 2].map((i) => (<SkeletonBlock key={i} className="h-14 w-full" />))}</div></DashCard>);
  }
  if (goals.length === 0) return null;

  return (
    <DashCard>
      <SectionHeader title="Savings Goals" icon={<Target size={16} />} />
      <div className="space-y-2.5">
        {goals.slice(0, 3).map((goal: any, i: number) => {
          const current = goal.currentAmount || goal.saved || 0;
          const target = goal.targetAmount || goal.target || 1;
          const pct = Math.min((current / target) * 100, 100);
          return (
            <motion.div
              key={goal._id || i}
              className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              variants={sidebarItemVariants}
              whileHover={{ x: 2 }}
              onClick={() => navigate("/customer/savings")}
            >
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{goal.name || goal.title || "Goal"}</h3>
                <span className="text-[10px] sm:text-xs font-semibold text-indigo-600 dark:text-indigo-400">{pct.toFixed(0)}%</span>
              </div>
              <ProgressBar value={pct} delay={i * 0.1} />
              <div className="flex justify-between mt-1 text-[10px] text-gray-500 dark:text-gray-400">
                <span>${current.toLocaleString()} saved</span>
                <span>${target.toLocaleString()} goal</span>
              </div>
            </motion.div>
          );
        })}
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
};

// ========================
// SECURITY & VERIFICATION
// ========================
const VerificationStatusSection: React.FC = () => {
  const navigate = useNavigate();
  const { data: kycRes, isLoading: kycLoading } = useKycStatus();
  const { data: tfaRes, isLoading: tfaLoading } = useTwoFactorStatus();
  const kyc: any = (kycRes as any) || {};
  const tfa: any = (tfaRes as any) || {};

  if (kycLoading && tfaLoading) {
    return (<DashCard><SkeletonBlock className="h-5 w-36 mb-3" /><div className="space-y-2">{[1, 2, 3].map((i) => (<SkeletonBlock key={i} className="h-10 w-full" />))}</div></DashCard>);
  }

  const kycStatus = kyc?.status || kyc?.kycStatus || "pending";
  const kycVerified = kycStatus === "verified" || kycStatus === "approved";
  const twoFaEnabled = tfa?.enabled || tfa?.isEnabled || false;

  const items = [
    {
      label: "KYC Status", ok: kycVerified, text: kycVerified ? "Verified" : "Pending",
      icon: kycVerified ? <CheckCircle size={16} /> : <AlertTriangle size={16} />,
      bg: kycVerified ? "bg-green-50 dark:bg-green-950/30" : "bg-amber-50 dark:bg-amber-950/30",
      fg: kycVerified ? "text-green-700 dark:text-green-400" : "text-amber-700 dark:text-amber-400",
      ic: kycVerified ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400",
      route: "/customer/profile/documents",
    },
    {
      label: "Two-Factor Auth", ok: twoFaEnabled, text: twoFaEnabled ? "Enabled" : "Disabled",
      icon: twoFaEnabled ? <Lock size={16} /> : <Unlock size={16} />,
      bg: twoFaEnabled ? "bg-green-50 dark:bg-green-950/30" : "bg-rose-50 dark:bg-rose-950/30",
      fg: twoFaEnabled ? "text-green-700 dark:text-green-400" : "text-rose-700 dark:text-rose-400",
      ic: twoFaEnabled ? "text-green-600 dark:text-green-400" : "text-rose-600 dark:text-rose-400",
      route: "/customer/security/2fa",
    },
  ];

  return (
    <DashCard>
      <SectionHeader title="Security & Verification" icon={<Shield size={16} />} />
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
              <span className={`text-xs sm:text-sm font-medium ${item.fg}`}>{item.label}</span>
            </div>
            <span className={`text-[10px] sm:text-xs ${item.ic}`}>{item.text}</span>
          </motion.div>
        ))}
        <motion.div
          className="flex items-center justify-between p-2.5 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg cursor-pointer"
          variants={sidebarItemVariants}
          whileHover={{ x: 2 }}
          onClick={() => navigate("/customer/profile/documents")}
        >
          <div className="flex items-center gap-2">
            <Upload size={16} className="text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs sm:text-sm font-medium text-indigo-800 dark:text-indigo-300">Upload Documents</span>
          </div>
          <ChevronRight size={14} className="text-indigo-600 dark:text-indigo-400" />
        </motion.div>
      </div>
    </DashCard>
  );
};

// ========================
// NOTIFICATIONS
// ========================
const NotificationsSection: React.FC = () => {
  const navigate = useNavigate();
  const { data: countRes } = useUnreadNotificationsCount();
  const { data: notifsRes, isLoading } = useUnreadNotifications(5);
  const count = (countRes as any)?.count || 0;
  const notifs: any[] = Array.isArray(notifsRes) ? notifsRes : Array.isArray((notifsRes as any)?.data) ? (notifsRes as any).data : [];

  if (isLoading) {
    return (<DashCard><SkeletonBlock className="h-5 w-28 mb-3" /><div className="space-y-2">{[1, 2, 3].map((i) => (<SkeletonBlock key={i} className="h-10 w-full" />))}</div></DashCard>);
  }

  return (
    <DashCard>
      <SectionHeader
        title="Notifications"
        icon={<Bell size={16} />}
        action={
          typeof count === "number" && count > 0 ? (
            <span className="bg-indigo-600 dark:bg-indigo-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{count}</span>
          ) : undefined
        }
      />
      {notifs.length === 0 ? (
        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 text-center py-3">All caught up!</p>
      ) : (
        <div className="space-y-1.5">
          {notifs.slice(0, 5).map((n: any, i: number) => {
            const typeColor: Record<string, string> = {
              warning: "bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400",
              error: "bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400",
              success: "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400",
              info: "bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400",
            };
            const color = typeColor[n.type || "info"] || typeColor.info;
            return (
              <motion.div
                key={n._id || i}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                variants={sidebarItemVariants}
                whileHover={{ x: 2 }}
                onClick={() => navigate("/customer/mobile/notifications")}
              >
                <div className={`p-1 rounded-full ${color}`}><Bell size={12} /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-xs font-medium text-gray-900 dark:text-white truncate">{n.title || n.message || "Notification"}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">{n.createdAt ? new Date(n.createdAt).toLocaleDateString() : "Just now"}</p>
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
};

// ========================
// SMART INSIGHTS
// ========================
const SmartInsightsSection: React.FC = () => {
  const { data: insightsRes, isLoading } = useFinancialInsights();
  const insights: any[] = insightsRes?.data || insightsRes || [];

  if (isLoading) {
    return (<DashCard><SkeletonBlock className="h-5 w-28 mb-3" /><div className="space-y-2">{[1, 2].map((i) => (<SkeletonBlock key={i} className="h-16 w-full" />))}</div></DashCard>);
  }
  if (insights.length === 0) return null;

  const insightIcons: Record<string, { icon: React.ReactNode; color: string }> = {
    positive: { icon: <TrendingUp size={14} />, color: "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/50" },
    negative: { icon: <TrendingDown size={14} />, color: "text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/50" },
    tip: { icon: <Lightbulb size={14} />, color: "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/50" },
    info: { icon: <Lightbulb size={14} />, color: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/50" },
  };

  return (
    <DashCard>
      <SectionHeader title="Smart Insights" icon={<Lightbulb size={16} />} />
      <div className="space-y-2">
        {insights.slice(0, 3).map((ins: any, i: number) => {
          const iconInfo = insightIcons[ins.type || ins.sentiment || "info"] || insightIcons.info;
          return (
            <motion.div
              key={ins._id || i}
              className="border border-gray-100 dark:border-gray-800 rounded-lg p-2.5 hover:border-gray-200 dark:hover:border-gray-700 transition-colors"
              variants={sidebarItemVariants}
            >
              <div className="flex gap-2">
                <div className={`p-1.5 rounded-lg ${iconInfo.color} h-min`}>{iconInfo.icon}</div>
                <div>
                  <h3 className="text-[10px] sm:text-xs font-medium text-gray-900 dark:text-white">{ins.title || ins.message || "Insight"}</h3>
                  {ins.description && (<p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{ins.description}</p>)}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </DashCard>
  );
};

// ========================
// MAIN SIDEBAR
// ========================
const DashboardSidebar: React.FC = () => {
  const navigate = useNavigate();
  const [goalsRef, goalsInView] = useInView();
  const [verifyRef, verifyInView] = useInView();
  const [notifsRef, notifsInView] = useInView();
  const [insightsRef, insightsInView] = useInView();

  const sidebarSkeleton = (
    <DashCard>
      <SkeletonBlock className="h-5 w-28 mb-3" />
      <div className="space-y-2">{[1, 2].map((i) => (<SkeletonBlock key={i} className="h-12 w-full" />))}</div>
    </DashCard>
  );

  return (
    <div className="w-full lg:w-80 flex flex-col gap-4">
      <CardsPreviewSection />
      <div ref={goalsRef}>{goalsInView ? <SavingsGoalsSection /> : sidebarSkeleton}</div>
      <div ref={verifyRef}>{verifyInView ? <VerificationStatusSection /> : sidebarSkeleton}</div>
      <div ref={notifsRef}>{notifsInView ? <NotificationsSection /> : sidebarSkeleton}</div>
      <div ref={insightsRef}>{insightsInView ? <SmartInsightsSection /> : sidebarSkeleton}</div>

      {/* Quick Tools */}
      <DashCard>
        <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-2">Tools</h2>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Forex", icon: <DollarSign size={16} />, color: "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400", hover: "hover:bg-indigo-100 dark:hover:bg-indigo-950/80", route: "/customer/forex/rates" },
            { label: "Support", icon: <MapPin size={16} />, color: "bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400", hover: "hover:bg-purple-100 dark:hover:bg-purple-950/80", route: "/customer/support" },
            { label: "Docs", icon: <Upload size={16} />, color: "bg-pink-50 dark:bg-pink-950/50 text-pink-600 dark:text-pink-400", hover: "hover:bg-pink-100 dark:hover:bg-pink-950/80", route: "/customer/profile/documents" },
          ].map((tool) => (
            <motion.div
              key={tool.label}
              className={`p-2.5 ${tool.color} ${tool.hover} rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors`}
              whileHover={{ y: -2 }}
              onClick={() => navigate(tool.route)}
            >
              {tool.icon}
              <span className="text-[10px] font-medium mt-0.5">{tool.label}</span>
            </motion.div>
          ))}
        </div>
      </DashCard>
    </div>
  );
};


export default DashboardSidebar;
