// ============================================================================
// BENEFICIARY SUB-PAGES — All, Add, Categories, Recent Recipients
// Dark mode + DashboardPrimitives + grey borders + responsive typography
// ============================================================================

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Users, UserPlus, FolderOpen, Search, Trash2, Star, Building2, User, Globe, Phone } from "@constants/icons";
import PageHeader from "@components/shared/PageHeader";
import { EmptyState } from "@components/shared/EmptyState";
import { PageContainer, DashCard } from "@components/shared/DashboardPrimitives";
import { AccountListSkeleton, FormSkeleton } from "@components/skeletons";
import { dashboardItemVariants } from "@core/animation/Animation";
import { useClientBeneficiaries } from "../../client-usecase/useaccounts-client-usecase";
import { useToastStore } from "@store/toast.store";

const RecentRecipients: React.FC = () => {
  const { beneficiaries, isLoading } = useClientBeneficiaries();
  const recent = [...beneficiaries]
    .sort((a: any, b: any) => new Date(b.lastTransferDate || 0).getTime() - new Date(a.lastTransferDate || 0).getTime())
    .slice(0, 10);

  return (
    <PageContainer>
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Recent Recipients"
          subtitle="People and businesses you've recently sent money to"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Beneficiaries", href: "/customer/beneficiaries" },
            { label: "Recent" },
          ]}
        />
      </motion.div>

      {isLoading ? (
        <AccountListSkeleton count={5} />
      ) : recent.length === 0 ? (
        <EmptyState title="No Recent Recipients" description="Your recent transfer recipients will appear here." />
      ) : (
        <DashCard padding="none">
          <div className="border-b border-gray-200 p-4 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white sm:text-base">Recently Sent To</h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {recent.map((b: any, i: number) => (
              <div
                key={b._id || b.id || i}
                className="flex items-center justify-between p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 sm:p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-sm font-bold text-white">
                    {(b.name || "?")[0].toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-gray-900 dark:text-white sm:text-sm">{b.name}</h4>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 sm:text-xs">
                      {b.bankName || "Bank"} • {b.accountNumber ? `•••• ${b.accountNumber.slice(-4)}` : ""}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 sm:text-xs">
                    {b.lastTransferDate
                      ? new Date(b.lastTransferDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                      : "—"}
                  </p>
                  <motion.button
                    className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                    whileHover={{ scale: 1.05 }}
                  >
                    Send Again
                  </motion.button>
                </div>
              </div>
            ))}
          </div>
        </DashCard>
      )}
    </PageContainer>
  );
};

export default RecentRecipients;
