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

const BeneficiaryCategories: React.FC = () => {
  const { beneficiaries, isLoading } = useClientBeneficiaries();

  const categories = [
    {
      name: "Family",
      icon: Users,
      color: "from-pink-500 to-rose-500",
      count: beneficiaries.filter((b: any) => (b.category || "").toLowerCase() === "family").length,
    },
    {
      name: "Friends",
      icon: User,
      color: "from-indigo-500 to-purple-500",
      count: beneficiaries.filter((b: any) => (b.category || "").toLowerCase() === "friends").length,
    },
    {
      name: "Business",
      icon: Building2,
      color: "from-emerald-500 to-teal-500",
      count: beneficiaries.filter((b: any) => (b.category || "").toLowerCase() === "business").length,
    },
    {
      name: "International",
      icon: Globe,
      color: "from-amber-500 to-orange-500",
      count: beneficiaries.filter((b: any) => (b.category || "").toLowerCase() === "international").length,
    },
    {
      name: "Utilities",
      icon: Phone,
      color: "from-cyan-500 to-blue-500",
      count: beneficiaries.filter((b: any) => (b.category || "").toLowerCase() === "utilities").length,
    },
    {
      name: "Other",
      icon: FolderOpen,
      color: "from-gray-500 to-gray-600",
      count: beneficiaries.filter(
        (b: any) =>
          !b.category ||
          !["family", "friends", "business", "international", "utilities"].includes(b.category.toLowerCase()),
      ).length,
    },
  ];

  return (
    <PageContainer>
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Beneficiary Categories"
          subtitle="Organize your beneficiaries by category"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Beneficiaries", href: "/customer/beneficiaries" },
            { label: "Categories" },
          ]}
        />
      </motion.div>

      {isLoading ? (
        <AccountListSkeleton count={6} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <motion.div key={cat.name} variants={dashboardItemVariants}>
              <DashCard className="cursor-pointer transition-colors hover:border-indigo-300 dark:hover:border-indigo-700">
                <div className="flex items-center gap-4">
                  <div
                    className={`h-12 w-12 bg-gradient-to-br ${cat.color} flex items-center justify-center rounded-2xl text-white`}
                  >
                    <cat.icon size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white sm:text-base">{cat.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{cat.count} beneficiaries</p>
                  </div>
                </div>
              </DashCard>
            </motion.div>
          ))}
        </div>
      )}
    </PageContainer>
  );
};

export default BeneficiaryCategories;
