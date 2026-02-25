// ============================================================================
// BENEFICIARY SUB-PAGES — All, Add, Categories, Recent Recipients
// Dark mode + DashboardPrimitives + grey borders + responsive typography
// ============================================================================

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Users, UserPlus, FolderOpen, Search, Trash2, Star,
  Building2, User, Globe, Phone,
} from "@constants/icons";
import PageHeader from "@components/shared/PageHeader";
import { EmptyState } from "@components/shared/EmptyState";
import {
  PageContainer, DashCard,
} from "@components/shared/DashboardPrimitives";
import { AccountListSkeleton, FormSkeleton } from "@components/skeletons";
import { dashboardItemVariants } from "@core/animation/Animation";
import { useBeneficiaries, useAddBeneficiary, useRemoveBeneficiary } from "@hooks/queries/useAccounts";
import { useToastStore } from "@store/toast.store";

const safeArray = (d: unknown): any[] => Array.isArray(d) ? d : Array.isArray((d as any)?.data) ? (d as any).data : [];

/* ═══════ ALL BENEFICIARIES ═══════ */
export const AllBeneficiaries: React.FC = () => {
  const [search, setSearch] = useState("");
  const { data: bData, isLoading } = useBeneficiaries();
  const beneficiaries = safeArray(bData);
  const removeMutation = useRemoveBeneficiary();
  const { showToast } = useToastStore();

  const filtered = beneficiaries.filter(
    (b: any) =>
      !search ||
      (b.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (b.accountNumber || "").includes(search) ||
      (b.bankName || "").toLowerCase().includes(search.toLowerCase())
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
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">Beneficiaries</h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">{filtered.length} total</span>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {filtered.map((b: any, i: number) => (
              <div key={b._id || b.id || i} className="flex items-center justify-between p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                    {(b.name || "?")[0].toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{b.name}</h4>
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                      {b.bankName || "Bank"} • {b.accountNumber ? `•••• ${b.accountNumber.slice(-4)}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {b.isFavorite && <Star size={14} className="text-amber-500 fill-amber-500" />}
                  <button
                    onClick={() => handleRemove(b._id || b.id)}
                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 text-gray-400 hover:text-red-500 transition-colors"
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

/* ═══════ ADD BENEFICIARY ═══════ */
export const AddBeneficiary: React.FC = () => {
  const addMutation = useAddBeneficiary();
  const { showToast } = useToastStore();
  const [form, setForm] = useState({ name: "", accountNumber: "", bankName: "", ifsc: "", type: "individual" });

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.accountNumber) {
      showToast("Name and account number are required", "error");
      return;
    }
    try {
      await addMutation.mutateAsync(form);
      showToast("Beneficiary added successfully", "success");
      setForm({ name: "", accountNumber: "", bankName: "", ifsc: "", type: "individual" });
    } catch {
      showToast("Failed to add beneficiary", "error");
    }
  };

  const inputCls =
    "w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors";
  const labelCls = "block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";

  return (
    <PageContainer>
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Add Beneficiary"
          subtitle="Add a new beneficiary for quick transfers"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Beneficiaries", href: "/customer/beneficiaries" },
            { label: "Add New" },
          ]}
        />
      </motion.div>

      <div className="max-w-2xl">
        <DashCard>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={labelCls}>Beneficiary Type</label>
              <div className="flex gap-3">
                {[
                  { v: "individual", icon: User, label: "Individual" },
                  { v: "business", icon: Building2, label: "Business" },
                  { v: "international", icon: Globe, label: "International" },
                ].map((opt) => (
                  <button
                    key={opt.v}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, type: opt.v }))}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                      form.type === opt.v
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <opt.icon size={14} /> {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelCls}>Full Name</label>
              <input type="text" value={form.name} onChange={set("name")} placeholder="John Doe" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Account Number</label>
              <input type="text" value={form.accountNumber} onChange={set("accountNumber")} placeholder="Enter account number" className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Bank Name</label>
                <input type="text" value={form.bankName} onChange={set("bankName")} placeholder="Bank name" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>IFSC / SWIFT Code</label>
                <input type="text" value={form.ifsc} onChange={set("ifsc")} placeholder="Code" className={inputCls} />
              </div>
            </div>
            <motion.button
              type="submit"
              disabled={addMutation.isPending}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-xs sm:text-sm font-medium disabled:opacity-50 mt-2"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {addMutation.isPending ? "Adding…" : <><UserPlus size={16} /> Add Beneficiary</>}
            </motion.button>
          </form>
        </DashCard>
      </div>
    </PageContainer>
  );
};

/* ═══════ BENEFICIARY CATEGORIES ═══════ */
export const BeneficiaryCategories: React.FC = () => {
  const { data: bData, isLoading } = useBeneficiaries();
  const beneficiaries = safeArray(bData);

  const categories = [
    { name: "Family", icon: Users, color: "from-pink-500 to-rose-500", count: beneficiaries.filter((b: any) => (b.category || "").toLowerCase() === "family").length },
    { name: "Friends", icon: User, color: "from-indigo-500 to-purple-500", count: beneficiaries.filter((b: any) => (b.category || "").toLowerCase() === "friends").length },
    { name: "Business", icon: Building2, color: "from-emerald-500 to-teal-500", count: beneficiaries.filter((b: any) => (b.category || "").toLowerCase() === "business").length },
    { name: "International", icon: Globe, color: "from-amber-500 to-orange-500", count: beneficiaries.filter((b: any) => (b.category || "").toLowerCase() === "international").length },
    { name: "Utilities", icon: Phone, color: "from-cyan-500 to-blue-500", count: beneficiaries.filter((b: any) => (b.category || "").toLowerCase() === "utilities").length },
    { name: "Other", icon: FolderOpen, color: "from-gray-500 to-gray-600", count: beneficiaries.filter((b: any) => !b.category || !["family","friends","business","international","utilities"].includes(b.category.toLowerCase())).length },
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <motion.div key={cat.name} variants={dashboardItemVariants}>
              <DashCard className="cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${cat.color} rounded-2xl flex items-center justify-center text-white`}>
                    <cat.icon size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">{cat.name}</h3>
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

/* ═══════ RECENT RECIPIENTS ═══════ */
export const RecentRecipients: React.FC = () => {
  const { data: bData, isLoading } = useBeneficiaries();
  const beneficiaries = safeArray(bData);
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
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">Recently Sent To</h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {recent.map((b: any, i: number) => (
              <div key={b._id || b.id || i} className="flex items-center justify-between p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                    {(b.name || "?")[0].toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{b.name}</h4>
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                      {b.bankName || "Bank"} • {b.accountNumber ? `•••• ${b.accountNumber.slice(-4)}` : ""}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                    {b.lastTransferDate
                      ? new Date(b.lastTransferDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                      : "—"}
                  </p>
                  <motion.button
                    className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
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
