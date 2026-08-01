import { useState, useMemo, useCallback } from "react";
import { useAdminPendingReviews, useAdminKycStats, useAdminReviewKyc, useSearchUsers } from "@hooks/api-queries";
import { applyFilterPipeline, textSearchFilter, enumFilter } from "@core/algo/filter";
import { multiKeySort } from "@core/algo/sort";
import { paginate, getPageNumbers } from "@core/algo/pagination";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ============================================================================
// useKycManagement — Full KYC verification workflow for admin
// ============================================================================

export type KycStatusFilter = "all" | "pending" | "approved" | "rejected" | "expired";

const PAGE_SIZE = 20;

export function useKycManagement() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<KycStatusFilter>("all");
  const [page, setPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [reviewModal, setReviewModal] = useState<{
    userId: string;
    action: "approve" | "reject";
  } | null>(null);

  const queryParams = useMemo(() => {
    const params: Record<string, any> = { page: 1, limit: 500 };
    if (statusFilter !== "all") params.status = statusFilter;
    return params;
  }, [statusFilter]);

  const { data: pendingRaw, isLoading, refetch } = useAdminPendingReviews(queryParams);
  const { data: statsRaw, isLoading: statsLoading } = useAdminKycStats();
  const { data: usersRaw } = useSearchUsers({
    limit: 500,
    kycStatus: statusFilter !== "all" ? statusFilter : undefined,
  });
  const reviewMutation = useAdminReviewKyc();

  // --- Normalize ---
  const rawApplications = useMemo(() => {
    // Prefer pending reviews endpoint, fallback to user search
    const outer: any = pendingRaw || usersRaw || {};
    const raw: any[] = Array.isArray(outer)
      ? outer
      : Array.isArray(outer?.data?.data)
        ? outer.data.data
        : Array.isArray(outer?.data)
          ? outer.data
          : outer?.users || [];
    return raw.map((u: any) => ({
      id: u._id || u.userId || u.id || "",
      firstName: u.firstName || u.user?.firstName || "",
      lastName: u.lastName || u.user?.lastName || "",
      email: u.email || u.user?.email || "",
      kycStatus: u.kycStatus || "pending",
      submittedAt: u.submittedAt || u.createdAt || "",
      level: u.level || u.kycLevel || "basic",
      nationality: u.nationality || u.user?.nationality || "",
      documentsCount:
        u.documentsCount ||
        u.documents?.length ||
        [u.hasGovernmentId, u.hasProofOfAddress, u.hasSelfie, u.hasSignature].filter(Boolean).length,
      riskLevel: u.riskLevel || "low",
      idType: u.idType || "",
      idNumber: u.idNumber || "",
    }));
  }, [pendingRaw, usersRaw]);

  // --- Filter Pipeline ---
  const filtered = useMemo(() => {
    const predicates: ((item: any) => boolean)[] = [];
    if (search) {
      predicates.push(
        textSearchFilter(search, [
          (u) => `${u.firstName} ${u.lastName}`,
          (u) => u.email ?? "",
          (u) => u.idNumber ?? "",
          (u) => u.nationality ?? "",
        ]),
      );
    }
    if (statusFilter !== "all") {
      predicates.push(enumFilter((u) => u.kycStatus ?? "", [statusFilter]));
    }
    const result = applyFilterPipeline(rawApplications, predicates);
    return multiKeySort(result, [{ getter: (u: any) => new Date(u.submittedAt || 0), direction: "desc" }]);
  }, [rawApplications, search, statusFilter]);

  // --- Pagination ---
  const paginatedResult = useMemo(() => paginate(filtered, page, PAGE_SIZE), [filtered, page]);
  const pageNumbers = useMemo(
    () => getPageNumbers(paginatedResult.page, paginatedResult.totalPages),
    [paginatedResult.page, paginatedResult.totalPages],
  );

  // --- Stats ---
  const stats = useMemo(() => {
    const s: any = statsRaw?.data || statsRaw || {};
    return {
      totalPending: s.totalPending ?? s.pending ?? rawApplications.filter((u: any) => u.kycStatus === "pending").length,
      totalApproved:
        s.totalApproved ?? s.approved ?? rawApplications.filter((u: any) => u.kycStatus === "approved").length,
      totalRejected:
        s.totalRejected ?? s.rejected ?? rawApplications.filter((u: any) => u.kycStatus === "rejected").length,
      approvedToday: s.approvedToday ?? 0,
      rejectedToday: s.rejectedToday ?? 0,
      avgReviewTime: s.avgReviewTime ?? "—",
      total: rawApplications.length,
    };
  }, [statsRaw, rawApplications]);

  // --- Actions ---
  const approveUser = useCallback(
    (userId: string, callbacks?: { onSuccess?: () => void }) => {
      reviewMutation.mutate(
        { userId, data: { status: "approved" } },
        {
          onSuccess: () => {
            refetch();
            callbacks?.onSuccess?.();
            setReviewModal(null);
          },
        },
      );
    },
    [reviewMutation, refetch],
  );

  const rejectUser = useCallback(
    (userId: string, reason: string, callbacks?: { onSuccess?: () => void }) => {
      reviewMutation.mutate(
        { userId, data: { status: "rejected", notes: reason } },
        {
          onSuccess: () => {
            refetch();
            callbacks?.onSuccess?.();
            setReviewModal(null);
          },
        },
      );
    },
    [reviewMutation, refetch],
  );

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  return {
    applications: paginatedResult.items,
    allApplications: filtered,
    rawApplications,
    stats,
    search,
    statusFilter,
    page,
    selectedUserId,
    reviewModal,
    isLoading,
    statsLoading,
    isReviewing: reviewMutation.isPending,
    pagination: paginatedResult,
    pageNumbers,
    setSearch: handleSearch,
    setStatusFilter: useCallback((v: KycStatusFilter) => {
      setStatusFilter(v);
      setPage(1);
    }, []),
    setPage,
    setSelectedUserId,
    setReviewModal,
    approveUser,
    rejectUser,
    refetch,
  };
}
