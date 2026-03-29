// ============================================================================
// SECURITY SUB-PAGES — Settings, 2FA, Biometric, Activity, Alerts
// Dark mode + DashboardPrimitives + grey borders + responsive typography
// ============================================================================

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield, Lock, Fingerprint, Eye, EyeOff, Clock,
  Smartphone, AlertTriangle, CheckCircle2, XCircle,
  Key, RefreshCw, MonitorSmartphone, Mail, Bell,
} from "@constants/icons";
import PageHeader from "@components/shared/PageHeader";
import { EmptyState } from "@components/shared/EmptyState";
import {
  PageContainer, DashCard, StatCard, StatsGrid, StatusBadge,
} from "@components/shared/DashboardPrimitives";
import { StatsGridSkeleton, TableSkeleton } from "@components/skeletons";
import { dashboardItemVariants } from "@core/animation/Animation";
import { useClientSecuritySettings } from "../../domain/useSecurityDomain";
import { useToastStore } from "@store/toast.store";


const BiometricAccess: React.FC = () => {
  const [bio, setBio] = useState({ faceId: true, fingerprint: false });
  const toggle = (key: keyof typeof bio) => setBio((p) => ({ ...p, [key]: !p[key] }));

  const options = [
    { key: "faceId" as const, icon: Eye, label: "Face ID", desc: "Unlock with facial recognition" },
    { key: "fingerprint" as const, icon: Fingerprint, label: "Fingerprint", desc: "Unlock with your fingerprint" },
  ];

  return (
    <PageContainer>
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Biometric Access"
          subtitle="Use biometrics for faster, secure login"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Security", href: "/customer/security" },
            { label: "Biometric" },
          ]}
        />
      </motion.div>

      <div className="max-w-2xl space-y-3">
        {options.map((opt) => (
          <motion.div key={opt.key} variants={dashboardItemVariants}>
            <DashCard>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${bio[opt.key] ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400" : "bg-gray-100 dark:bg-gray-800 text-gray-400"}`}>
                    <opt.icon size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{opt.label}</h4>
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">{opt.desc}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggle(opt.key)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${bio[opt.key] ? "bg-indigo-600" : "bg-gray-300 dark:bg-gray-600"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${bio[opt.key] ? "translate-x-5" : ""}`} />
                </button>
              </div>
            </DashCard>
          </motion.div>
        ))}

        <DashCard className="mt-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 mt-0.5">
              <AlertTriangle size={16} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">Important</h4>
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                Biometric data is stored securely on your device and never shared with our servers.
                You can always use your password as a fallback.
              </p>
            </div>
          </div>
        </DashCard>
      </div>
    </PageContainer>
  );
};

export default BiometricAccess;
