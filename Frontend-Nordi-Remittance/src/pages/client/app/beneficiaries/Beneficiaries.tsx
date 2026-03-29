// ============================================================================
// BENEFICIARIES — Beneficiary management dashboard (Dark mode + Shared Primitives)
// ============================================================================

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Plus,
  Search,
  Star,
  Trash2,
  Send,
  Edit3,
  ChevronRight,
  Globe,
  Building2,
  Mail,
  MoreVertical,
  UserPlus,
  Clock,
  Tag,
} from "lucide-react";
import PageHeader from "@components/shared/PageHeader";
import { EmptyState } from "@components/shared/EmptyState";
import { AccountListSkeleton, StatsGridSkeleton } from "@components/skeletons";
import {
  useClientBeneficiaries,
  useRemoveBeneficiary,
} from "../../domain/useAccountsDomain";
import {
  PageContainer,
  StatCard,
  StatsGrid,
  DashCard,
  FilterBar,
  FilterPill,
  ActionButton,
  QuickLinkCard,
  QuickLinksGrid,
} from "@components/shared/DashboardPrimitives";
import { dashboardItemVariants, cardRevealVariants } from "@core/animation/Animation";

/* eslint-disable @typescript-eslint/no-explicit-any */

const Beneficiaries: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { beneficiaries, isLoading } = useClientBeneficiaries();
  const removeBeneficiary = useRemoveBeneficiary();

  const stats = useMemo(() => {
    const total = beneficiaries.length;
    const favorites = beneficiaries.filter((b: any) => b.isFavorite).length;
    const international = beneficiaries.filter((b: any) => b.type === "international" || b.country !== "US").length;
    const recent = beneficiaries.filter((b: any) => {
      const date = new Date(b.lastUsed || b.createdAt);
      return (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24) <= 30;
    }).length;
    return { total, favorites, international, recent };
  }, [beneficiaries]);

  const filteredBeneficiaries = useMemo(() => {
    return beneficiaries.filter((b: any) => {
      const matchSearch = !searchQuery || b.name?.toLowerCase().includes(searchQuery.toLowerCase()) || b.accountNumber?.includes(searchQuery) || b.email?.toLowerCase().includes(searchQuery.toLowerCase()) || b.bankName?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = selectedCategory === "all" || b.category === selectedCategory || (selectedCategory === "favorites" && b.isFavorite);
      return matchSearch && matchCategory;
    });
  }, [beneficiaries, searchQuery, selectedCategory]);

  const categories = ["all", "favorites", "family", "business", "international"];

  const handleRemove = (id: string) => {
    if (window.confirm("Remove this beneficiary?")) {
      removeBeneficiary.mutate(id);
    }
  };

  return (
    <PageContainer>
      {/* Header */}
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Beneficiaries"
          subtitle="Manage your saved recipients for quick transfers"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Beneficiaries" },
          ]}
          actions={
            <ActionButton label="Add Beneficiary" icon={<UserPlus size={16} />} onClick={() => navigate("/customer/beneficiaries/add")} />
          }
        />
      </motion.div>

      {/* Stats */}
      {isLoading ? (
        <StatsGridSkeleton count={4} />
      ) : (
        <StatsGrid cols={4}>
          <StatCard label="Total" value={stats.total} icon={<Users size={20} />} iconColor="from-indigo-500 to-purple-500" index={0} />
          <StatCard label="Favorites" value={stats.favorites} icon={<Star size={20} />} iconColor="from-amber-500 to-orange-500" index={1} />
          <StatCard label="International" value={stats.international} icon={<Globe size={20} />} iconColor="from-blue-500 to-cyan-500" index={2} />
          <StatCard label="Recent" value={stats.recent} icon={<Clock size={20} />} iconColor="from-emerald-500 to-teal-500" index={3} />
        </StatsGrid>
      )}

      {/* Filters */}
      <FilterBar searchValue={searchQuery} onSearchChange={setSearchQuery} searchPlaceholder="Search beneficiaries...">
        <div className="flex gap-1.5 sm:gap-2 flex-wrap">
          {categories.map((cat) => (
            <FilterPill
              key={cat}
              label={cat.charAt(0).toUpperCase() + cat.slice(1)}
              active={selectedCategory === cat}
              onClick={() => setSelectedCategory(cat)}
            />
          ))}
        </div>
      </FilterBar>

      {/* Beneficiary List */}
      {isLoading ? (
        <AccountListSkeleton count={6} />
      ) : filteredBeneficiaries.length === 0 ? (
        <EmptyState
          title="No Beneficiaries Found"
          description={searchQuery ? "No beneficiaries match your search." : "Add your first beneficiary to start making quick transfers."}
          variant={searchQuery ? "search" : "default"}
          action={{ label: "Add Beneficiary", onClick: () => navigate("/customer/beneficiaries/add") }}
        />
      ) : (
        <motion.div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {filteredBeneficiaries.map((b: any, index: number) => (
            <motion.div
              key={b._id || b.id || index}
              custom={index}
              variants={cardRevealVariants}
              initial="hidden"
              animate="visible"
            >
              <DashCard className="hover:border-indigo-300 dark:hover:border-indigo-700 transition-all" hover>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                      {(b.name || "U").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                        {b.name || "Unknown"}
                      </h4>
                      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                        {b.bankName || b.bank || "Bank"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {b.isFavorite && <Star size={14} className="text-amber-500 fill-amber-500" />}
                    <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      <MoreVertical size={14} className="text-gray-400 dark:text-gray-500" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1 sm:space-y-1.5 mb-3 sm:mb-4">
                  {b.accountNumber && (
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                      <Building2 size={12} />
                      •••• {b.accountNumber.slice(-4)}
                    </p>
                  )}
                  {b.email && (
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                      <Mail size={12} />
                      {b.email}
                    </p>
                  )}
                  {b.country && b.country !== "US" && (
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                      <Globe size={12} />
                      {b.country}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <motion.button
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 sm:py-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-[10px] sm:text-xs font-medium hover:bg-indigo-100 dark:hover:bg-indigo-950/80 transition-colors"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/customer/send/domestic")}
                  >
                    <Send size={12} /> Send
                  </motion.button>
                  <motion.button
                    className="flex items-center justify-center gap-1.5 py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-[10px] sm:text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    whileTap={{ scale: 0.95 }}
                  >
                    <Edit3 size={12} />
                  </motion.button>
                  <motion.button
                    className="flex items-center justify-center gap-1.5 py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 text-[10px] sm:text-xs font-medium hover:bg-rose-100 dark:hover:bg-rose-950/80 transition-colors"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleRemove(b._id || b.id)}
                  >
                    <Trash2 size={12} />
                  </motion.button>
                </div>
              </DashCard>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Quick Links */}
      <QuickLinksGrid>
        <QuickLinkCard label="All Beneficiaries" icon={<Users size={20} />} route="/customer/beneficiaries/all" iconColor="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50" />
        <QuickLinkCard label="Add New" icon={<UserPlus size={20} />} route="/customer/beneficiaries/add" iconColor="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50" />
        <QuickLinkCard label="Categories" icon={<Tag size={20} />} route="/customer/beneficiaries/categories" iconColor="text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50" />
        <QuickLinkCard label="Recent" icon={<Clock size={20} />} route="/customer/beneficiaries/recent" iconColor="text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50" />
      </QuickLinksGrid>
    </PageContainer>
  );
};

export default Beneficiaries;
