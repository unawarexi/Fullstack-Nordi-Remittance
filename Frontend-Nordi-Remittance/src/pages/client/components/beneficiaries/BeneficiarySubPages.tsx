// ============================================================================
// BENEFICIARY SUB-PAGES — All, Add, Categories, Recent
// ============================================================================

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Users, UserPlus, Search, Star, Send, Edit3, Trash2,
  Tag, Clock, Globe, Building2, Mail, Phone,
  ChevronRight, Plus, MoreVertical, CheckCircle2,
} from "lucide-react";
import PageHeader from "@components/shared/PageHeader";
import { EmptyState } from "@components/shared/EmptyState";
import { AccountListSkeleton, FormSkeleton } from "@components/skeletons";
import { useBeneficiaries, useAddBeneficiary, useRemoveBeneficiary } from "@hooks/queries/useAccounts";
import { useToastStore } from "@store/toast.store";

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

// ========================
// ALL BENEFICIARIES
// ========================
export const AllBeneficiaries: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { data, isLoading } = useBeneficiaries();
  const removeBeneficiary = useRemoveBeneficiary();
  const beneficiaries = (data as any)?.data ? (data as any).data : data || [];

  const filtered = useMemo(() => {
    if (!search) return beneficiaries;
    return beneficiaries.filter((b: any) =>
      b.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.bankName?.toLowerCase().includes(search.toLowerCase()) ||
      b.email?.toLowerCase().includes(search.toLowerCase())
    );
  }, [beneficiaries, search]);

  return (
    <motion.div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-full" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <PageHeader title="All Beneficiaries" subtitle="Complete list of your saved recipients"
          breadcrumbs={[{ label: "Dashboard", href: "/customer/dashboard" }, { label: "Beneficiaries", href: "/customer/beneficiaries" }, { label: "All" }]}
          actions={
            <motion.button onClick={() => navigate("/customer/beneficiaries/add")} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-sm text-sm font-medium" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <UserPlus size={16} /> Add New
            </motion.button>
          } />
      </motion.div>

      <motion.div className="bg-white rounded-xl shadow-sm p-4 mb-6" variants={itemVariants}>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search beneficiaries..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
      </motion.div>

      {isLoading ? <AccountListSkeleton count={6} /> : filtered.length === 0 ? (
        <EmptyState title="No Beneficiaries" description={search ? "No results match your search." : "Add your first beneficiary."} variant={search ? "search" : "default"}
          action={{ label: "Add Beneficiary", onClick: () => navigate("/customer/beneficiaries/add") }} />
      ) : (
        <motion.div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" variants={containerVariants}>
          {filtered.map((b: any, i: number) => (
            <motion.div key={b._id || i} className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-all" variants={itemVariants} whileHover={{ y: -3 }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                  {(b.name || "U").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 text-sm">{b.name || "Unknown"}</h4>
                  <p className="text-xs text-gray-500">{b.bankName || "Bank"} {b.accountNumber ? `• •••${b.accountNumber.slice(-4)}` : ""}</p>
                </div>
                {b.isFavorite && <Star size={14} className="text-amber-500 fill-amber-500" />}
              </div>
              <div className="flex gap-2">
                <motion.button className="flex-1 py-2 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-medium hover:bg-indigo-100" whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/customer/send/domestic")}>
                  <Send size={12} className="inline mr-1" /> Send
                </motion.button>
                <motion.button className="py-2 px-3 rounded-lg bg-rose-50 text-rose-600 text-xs font-medium hover:bg-rose-100" whileTap={{ scale: 0.95 }}
                  onClick={() => { if (window.confirm("Remove?")) removeBeneficiary.mutate(b._id || b.id); }}>
                  <Trash2 size={12} />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

// ========================
// ADD BENEFICIARY
// ========================
export const AddBeneficiary: React.FC = () => {
  const navigate = useNavigate();
  const addBeneficiary = useAddBeneficiary();
  const { showToast } = useToastStore();
  const [form, setForm] = useState({ name: "", bankName: "", accountNumber: "", email: "", phone: "", type: "domestic", category: "personal" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addBeneficiary.mutate(form, {
      onSuccess: () => {
        showToast("Beneficiary added successfully!", "success");
        navigate("/customer/beneficiaries/all");
      },
    });
  };

  return (
    <motion.div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-full" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <PageHeader title="Add Beneficiary" subtitle="Add a new recipient for quick transfers"
          breadcrumbs={[{ label: "Dashboard", href: "/customer/dashboard" }, { label: "Beneficiaries", href: "/customer/beneficiaries" }, { label: "Add New" }]} />
      </motion.div>

      <motion.div className="max-w-2xl" variants={itemVariants}>
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h3 className="text-lg font-semibold text-indigo-900 mb-2">Recipient Details</h3>

          <div><label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input type="text" required value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="John Doe" /></div>

          <div><label className="block text-sm font-medium text-gray-700 mb-1">Bank Name *</label>
            <input type="text" required value={form.bankName} onChange={(e) => setForm(p => ({ ...p, bankName: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Bank of America" /></div>

          <div><label className="block text-sm font-medium text-gray-700 mb-1">Account Number *</label>
            <input type="text" required value={form.accountNumber} onChange={(e) => setForm(p => ({ ...p, accountNumber: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="1234567890" /></div>

          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="john@example.com" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="+1 234 567 890" /></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Transfer Type</label>
              <select value={form.type} onChange={(e) => setForm(p => ({ ...p, type: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="domestic">Domestic</option><option value="international">International</option>
              </select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select value={form.category} onChange={(e) => setForm(p => ({ ...p, category: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="personal">Personal</option><option value="family">Family</option><option value="business">Business</option>
              </select></div>
          </div>

          <motion.button type="submit" disabled={addBeneficiary.isPending}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-medium disabled:opacity-50"
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            {addBeneficiary.isPending ? "Adding..." : "Add Beneficiary"}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
};

// ========================
// CATEGORIES
// ========================
export const BeneficiaryCategories: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useBeneficiaries();
  const beneficiaries = (data as any)?.data ? (data as any).data : data || [];

  const categories = useMemo(() => {
    const cats: Record<string, number> = {};
    beneficiaries.forEach((b: any) => { const c = b.category || "uncategorized"; cats[c] = (cats[c] || 0) + 1; });
    return Object.entries(cats).map(([name, count]) => ({ name, count }));
  }, [beneficiaries]);

  const catIcons: Record<string, React.ReactNode> = {
    personal: <Users size={18} />, family: <Users size={18} />, business: <Building2 size={18} />, international: <Globe size={18} />, uncategorized: <Tag size={18} />,
  };
  const catColors: Record<string, string> = {
    personal: "bg-indigo-50 text-indigo-600", family: "bg-pink-50 text-pink-600", business: "bg-amber-50 text-amber-600", international: "bg-blue-50 text-blue-600", uncategorized: "bg-gray-50 text-gray-600",
  };

  return (
    <motion.div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-full" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <PageHeader title="Beneficiary Categories" subtitle="Organize your recipients by category"
          breadcrumbs={[{ label: "Dashboard", href: "/customer/dashboard" }, { label: "Beneficiaries", href: "/customer/beneficiaries" }, { label: "Categories" }]} />
      </motion.div>

      {isLoading ? <AccountListSkeleton count={4} /> : categories.length === 0 ? (
        <EmptyState title="No Categories" description="Categories will appear as you add beneficiaries." />
      ) : (
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" variants={containerVariants}>
          {categories.map((cat) => (
            <motion.div key={cat.name} className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md cursor-pointer" variants={itemVariants} whileHover={{ y: -3 }}
              onClick={() => navigate("/customer/beneficiaries/all")}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2.5 rounded-xl ${catColors[cat.name] || catColors.uncategorized}`}>
                  {catIcons[cat.name] || catIcons.uncategorized}
                </div>
                <div><h3 className="font-semibold text-gray-900 capitalize">{cat.name}</h3><p className="text-xs text-gray-500">{cat.count} beneficiaries</p></div>
              </div>
              <div className="flex items-center gap-1 text-sm text-indigo-600 font-medium"><span>View</span><ChevronRight size={14} /></div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

// ========================
// RECENT RECIPIENTS
// ========================
export const RecentRecipients: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useBeneficiaries();
  const beneficiaries = (data as any)?.data ? (data as any).data : data || [];

  const recentBeneficiaries = useMemo(() => {
    return [...beneficiaries]
      .sort((a: any, b: any) => new Date(b.lastUsed || b.updatedAt || b.createdAt).getTime() - new Date(a.lastUsed || a.updatedAt || a.createdAt).getTime())
      .slice(0, 10);
  }, [beneficiaries]);

  return (
    <motion.div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-full" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <PageHeader title="Recent Recipients" subtitle="Your most recently used beneficiaries"
          breadcrumbs={[{ label: "Dashboard", href: "/customer/dashboard" }, { label: "Beneficiaries", href: "/customer/beneficiaries" }, { label: "Recent" }]} />
      </motion.div>

      {isLoading ? <AccountListSkeleton count={5} /> : recentBeneficiaries.length === 0 ? (
        <EmptyState title="No Recent Recipients" description="Recipients will appear here after you make transfers."
          action={{ label: "Make a Transfer", onClick: () => navigate("/customer/send/domestic") }} />
      ) : (
        <motion.div className="bg-white rounded-xl shadow-sm overflow-hidden" variants={itemVariants}>
          <div className="p-4 border-b border-gray-100"><h3 className="font-semibold text-indigo-900">Recent Recipients</h3></div>
          <div className="divide-y divide-gray-50">
            {recentBeneficiaries.map((b: any, i: number) => (
              <motion.div key={b._id || i} className="flex items-center gap-4 px-4 py-3.5 hover:bg-indigo-50/30 cursor-pointer" whileHover={{ x: 3 }}>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                  {(b.name || "U").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{b.name}</p>
                  <p className="text-xs text-gray-500">{b.bankName} {b.accountNumber ? `• •••${b.accountNumber.slice(-4)}` : ""}</p>
                </div>
                <motion.button className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-medium hover:bg-indigo-100" whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/customer/send/domestic")}>
                  <Send size={12} className="inline mr-1" /> Send
                </motion.button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
