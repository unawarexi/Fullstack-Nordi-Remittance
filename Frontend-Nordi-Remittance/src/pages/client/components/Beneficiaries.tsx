// ============================================================================
// BENEFICIARIES — Beneficiary management dashboard
// ============================================================================

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Plus,
  Search,
  Star,
  StarOff,
  Trash2,
  Send,
  Edit3,
  ChevronRight,
  Globe,
  Building2,
  User,
  Phone,
  Mail,
  MoreVertical,
  Filter,
  UserPlus,
  Clock,
  Tag,
} from "lucide-react";
import PageHeader from "@components/shared/PageHeader";
import { EmptyState } from "@components/shared/EmptyState";
import { AccountListSkeleton, StatsGridSkeleton } from "@components/skeletons";
import {
  useBeneficiaries,
  useRemoveBeneficiary,
} from "@hooks/queries/useAccounts";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const Beneficiaries: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: beneficiariesData, isLoading } = useBeneficiaries();
  const removeBeneficiary = useRemoveBeneficiary();

  const beneficiaries = (beneficiariesData as any)?.data ? (beneficiariesData as any).data : beneficiariesData || [];

  // Computed stats
  const stats = useMemo(() => {
    const total = beneficiaries.length;
    const favorites = beneficiaries.filter((b: any) => b.isFavorite).length;
    const international = beneficiaries.filter(
      (b: any) => b.type === "international" || b.country !== "US"
    ).length;
    const recent = beneficiaries.filter((b: any) => {
      const date = new Date(b.lastUsed || b.createdAt);
      const daysDiff = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 30;
    }).length;
    return { total, favorites, international, recent };
  }, [beneficiaries]);

  // Filter
  const filteredBeneficiaries = useMemo(() => {
    return beneficiaries.filter((b: any) => {
      const matchSearch =
        !searchQuery ||
        b.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.accountNumber?.includes(searchQuery) ||
        b.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.bankName?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory =
        selectedCategory === "all" ||
        b.category === selectedCategory ||
        (selectedCategory === "favorites" && b.isFavorite);
      return matchSearch && matchCategory;
    });
  }, [beneficiaries, searchQuery, selectedCategory]);

  const categories = [
    "all",
    "favorites",
    "family",
    "business",
    "international",
  ];

  const handleRemove = (id: string) => {
    if (window.confirm("Remove this beneficiary?")) {
      removeBeneficiary.mutate(id);
    }
  };

  return (
    <motion.div
      className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <PageHeader
          title="Beneficiaries"
          subtitle="Manage your saved recipients for quick transfers"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Beneficiaries" },
          ]}
          actions={
            <motion.button
              onClick={() => navigate("/customer/beneficiaries/add")}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-sm text-sm font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <UserPlus size={16} />
              Add Beneficiary
            </motion.button>
          }
        />
      </motion.div>

      {/* Stats */}
      {isLoading ? (
        <StatsGridSkeleton count={4} />
      ) : (
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
          variants={itemVariants}
        >
          {[
            { label: "Total", value: stats.total, icon: <Users size={20} />, color: "from-indigo-500 to-purple-500" },
            { label: "Favorites", value: stats.favorites, icon: <Star size={20} />, color: "from-amber-500 to-orange-500" },
            { label: "International", value: stats.international, icon: <Globe size={20} />, color: "from-blue-500 to-cyan-500" },
            { label: "Recent", value: stats.recent, icon: <Clock size={20} />, color: "from-emerald-500 to-teal-500" },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow"
              whileHover={{ y: -2 }}
            >
              <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} text-white w-fit mb-2`}>
                {stat.icon}
              </div>
              <p className="text-xl font-bold text-indigo-900">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Filters */}
      <motion.div
        className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap gap-3 items-center"
        variants={itemVariants}
      >
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search beneficiaries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                selectedCategory === cat
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Beneficiary List */}
      {isLoading ? (
        <AccountListSkeleton count={6} />
      ) : filteredBeneficiaries.length === 0 ? (
        <EmptyState
          title="No Beneficiaries Found"
          description={
            searchQuery
              ? "No beneficiaries match your search."
              : "Add your first beneficiary to start making quick transfers."
          }
          variant={searchQuery ? "search" : "default"}
          action={{
            label: "Add Beneficiary",
            onClick: () => navigate("/customer/beneficiaries/add"),
          }}
        />
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
          variants={containerVariants}
        >
          {filteredBeneficiaries.map((b: any, index: number) => (
            <motion.div
              key={b._id || b.id || index}
              className="bg-white rounded-xl shadow-sm border border-neutral-100 p-5 hover:shadow-md transition-all"
              variants={itemVariants}
              whileHover={{ y: -3 }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                    {(b.name || "U").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">
                      {b.name || "Unknown"}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {b.bankName || b.bank || "Bank"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {b.isFavorite && (
                    <Star size={14} className="text-amber-500 fill-amber-500" />
                  )}
                  <button className="p-1 rounded hover:bg-gray-100">
                    <MoreVertical size={14} className="text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 mb-4">
                {b.accountNumber && (
                  <p className="text-xs text-gray-500 flex items-center gap-2">
                    <Building2 size={12} />
                    •••• {b.accountNumber.slice(-4)}
                  </p>
                )}
                {b.email && (
                  <p className="text-xs text-gray-500 flex items-center gap-2">
                    <Mail size={12} />
                    {b.email}
                  </p>
                )}
                {b.country && b.country !== "US" && (
                  <p className="text-xs text-gray-500 flex items-center gap-2">
                    <Globe size={12} />
                    {b.country}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <motion.button
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-medium hover:bg-indigo-100"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/customer/send/domestic")}
                >
                  <Send size={12} />
                  Send
                </motion.button>
                <motion.button
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-gray-50 text-gray-600 text-xs font-medium hover:bg-gray-100"
                  whileTap={{ scale: 0.95 }}
                >
                  <Edit3 size={12} />
                </motion.button>
                <motion.button
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-rose-50 text-rose-600 text-xs font-medium hover:bg-rose-100"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleRemove(b._id || b.id)}
                >
                  <Trash2 size={12} />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Quick Links */}
      <motion.div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4" variants={itemVariants}>
        {[
          { label: "All Beneficiaries", icon: <Users size={20} />, route: "/customer/beneficiaries/all", color: "text-indigo-600 bg-indigo-50" },
          { label: "Add New", icon: <UserPlus size={20} />, route: "/customer/beneficiaries/add", color: "text-emerald-600 bg-emerald-50" },
          { label: "Categories", icon: <Tag size={20} />, route: "/customer/beneficiaries/categories", color: "text-purple-600 bg-purple-50" },
          { label: "Recent", icon: <Clock size={20} />, route: "/customer/beneficiaries/recent", color: "text-amber-600 bg-amber-50" },
        ].map((link) => (
          <motion.button
            key={link.label}
            onClick={() => navigate(link.route)}
            className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md text-left"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className={`p-2 rounded-lg ${link.color}`}>{link.icon}</div>
            <div>
              <p className="text-sm font-medium text-indigo-900">{link.label}</p>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                View <ChevronRight size={12} />
              </p>
            </div>
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default Beneficiaries;
