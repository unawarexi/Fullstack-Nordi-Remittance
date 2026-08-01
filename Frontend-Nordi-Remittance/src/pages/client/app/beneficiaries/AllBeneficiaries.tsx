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
import { useClientBeneficiaries, useRemoveBeneficiary } from "../../client-usecase/useaccounts-client-usecase";
import { useToastStore } from "@store/toast.store";

const AllBeneficiaries: React.FC = () => {
  const [search, setSearch] = useState("");
  const { beneficiaries, isLoading } = useClientBeneficiaries();
  const removeMutation = useRemoveBeneficiary();
  const { showToast } = useToastStore();

  const filtered = beneficiaries.filter(
    (b: any) =>
      !search ||
      (b.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (b.accountNumber || "").includes(search) ||
      (b.bankName || "").toLowerCase().includes(search.toLowerCase()),
  );

  const handleRemove = async (id: string) => {
    try {
      await removeMutation.mutateAsync(id);
      showToast("Beneficiary removed", "success");
    } catch {
      showToast("Failed to remove beneficiary", "error");
    }
  };

  const inputCls =
    "w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors";

  return (
    <PageContainer>
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="All Beneficiaries"
          subtitle="View and manage your saved beneficiaries"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Beneficiaries", href: "/customer/beneficiaries" },
            { label: "All" },
          ]}
        />
      </motion.div>

      <DashCard className="mb-6">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, account or bank…"
            className={`${inputCls} pl-10`}
          />
        </div>
      </DashCard>

      {isLoading ? (
        <AccountListSkeleton count={5} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={search ? "No Results" : "No Beneficiaries"}
          description={search ? "Try a different search term." : "Add a beneficiary to send money quickly."}
        />
      ) : (
        <DashCard padding="none">
          <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white sm:text-base">Beneficiaries</h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">{filtered.length} total</span>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {filtered.map((b: any, i: number) => (
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
                <div className="flex items-center gap-2">
                  {b.isFavorite && <Star size={14} className="fill-amber-500 text-amber-500" />}
                  <button
                    onClick={() => handleRemove(b._id || b.id)}
                    className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/50"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </DashCard>
      )}
    </PageContainer>
  );
};

export default AllBeneficiaries;
