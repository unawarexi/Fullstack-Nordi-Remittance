import { useState, useMemo, useCallback } from "react";
import {
  useAdminPendingReviews,
  useAdminKycStats,
  useAdminReviewKyc,
} from "@hooks/queries";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ============================================================================
// useKycPendingUsers — Aggregates pending KYC reviews + stats + review actions
// ============================================================================

export function useKycPendingUsers() {
  const [page, setPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const { data: pendingRaw, isLoading, refetch } = useAdminPendingReviews({ page, limit: 10, status: "all" });
  const { data: statsRaw, isLoading: statsLoading } = useAdminKycStats();
  const reviewMutation = useAdminReviewKyc();

  const pendingUsers = useMemo(() => {
    const outer: any = pendingRaw || {};
    const raw: any[] = Array.isArray(outer)
      ? outer
      : Array.isArray(outer?.data?.data)
        ? outer.data.data
        : Array.isArray(outer?.data)
          ? outer.data
          : outer?.users || [];
    return raw.map((u: any) => ({
      id: u._id || u.userId || u.id,
      firstName: u.firstName || u.user?.firstName || "",
      lastName: u.lastName || u.user?.lastName || "",
      email: u.email || u.user?.email || "",
      kycStatus: u.kycStatus || "pending",
      submittedAt: u.submittedAt || u.createdAt || "",
      documentsCount: u.documentsCount || u.documents?.length || [u.hasGovernmentId, u.hasProofOfAddress, u.hasSelfie, u.hasSignature].filter(Boolean).length,
      level: u.level || u.kycLevel || "basic",
      nationality: u.nationality || u.user?.nationality || "",
    }));
  }, [pendingRaw]);

  const pagination = useMemo(() => {
    const raw: any = pendingRaw || {};
    const pag = raw?.data?.pagination || raw?.pagination || raw?.meta?.pagination || {};
    const total = pag.total || raw.total || raw.totalCount || pendingUsers.length;
    return {
      page,
      total,
      totalPages: pag.totalPages || Math.max(1, Math.ceil(total / 10)),
    };
  }, [pendingRaw, pendingUsers.length, page]);

  const stats = useMemo(() => {
    const s: any = statsRaw?.data || statsRaw || {};
    return {
      totalPending: s.totalPending ?? s.pending ?? pendingUsers.length,
      approvedToday: s.approvedToday ?? 0,
      rejectedToday: s.rejectedToday ?? 0,
      avgReviewTime: s.avgReviewTime ?? "—",
    };
  }, [statsRaw, pendingUsers.length]);

  const approveUser = useCallback(
    (userId: string) => {
      reviewMutation.mutate(
        { userId, data: { status: "approved" } },
        { onSuccess: () => refetch() },
      );
    },
    [reviewMutation, refetch],
  );

  const rejectUser = useCallback(
    (userId: string, reason: string) => {
      reviewMutation.mutate(
        { userId, data: { status: "rejected", notes: reason } },
        { onSuccess: () => refetch() },
      );
    },
    [reviewMutation, refetch],
  );

  return {
    pendingUsers,
    pagination,
    stats,
    isLoading,
    statsLoading,
    selectedUserId,
    setSelectedUserId,
    setPage,
    refetch,
    approveUser,
    rejectUser,
    isReviewing: reviewMutation.isPending,
  };
}
