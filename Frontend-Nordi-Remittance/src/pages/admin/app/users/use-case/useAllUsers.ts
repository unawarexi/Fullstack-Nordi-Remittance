import { useState, useMemo, useCallback } from "react";
import {
  useSearchUsers,
  useUpdateUserStatus,
  useAdminDashboardStats,
} from "@hooks/queries";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ============================================================================
// useAllUsers — Aggregates user listing, filters, pagination & stats
// ============================================================================

export type UserStatusFilter = "all" | "active" | "inactive" | "suspended" | "banned";
export type KycStatusFilter = "all" | "pending" | "approved" | "rejected" | "expired";

interface Filters {
  search: string;
  status: UserStatusFilter;
  kycStatus: KycStatusFilter;
  page: number;
  limit: number;
}

export function useAllUsers() {
  const [filters, setFilters] = useState<Filters>({
    search: "",
    status: "all",
    kycStatus: "all",
    page: 1,
    limit: 10,
  });

  const queryParams = useMemo(() => {
    const params: Record<string, any> = {
      page: filters.page,
      limit: filters.limit,
    };
    if (filters.search) params.query = filters.search;
    if (filters.status !== "all") params.status = filters.status;
    if (filters.kycStatus !== "all") params.kycStatus = filters.kycStatus;
    return params;
  }, [filters]);

  const { data: usersRaw, isLoading, refetch } = useSearchUsers(queryParams);
  const { data: statsRaw } = useAdminDashboardStats();
  const updateStatus = useUpdateUserStatus();

  const users = useMemo(() => {
    const outer: any = usersRaw || {};
    const raw: any[] = Array.isArray(outer)
      ? outer
      : Array.isArray(outer?.data?.data)
        ? outer.data.data
        : Array.isArray(outer?.data)
          ? outer.data
          : outer?.users || [];
    return raw.map((u: any) => ({
      id: u._id || u.id,
      firstName: u.firstName || "",
      lastName: u.lastName || "",
      email: u.email || "",
      accountNumber: u.accountNumber || "",
      accountType: u.accountType || "personal",
      status: u.status || (u.isActive ? "active" : "inactive"),
      kycStatus: u.kycStatus || "pending",
      lastLogin: u.lastLogin || null,
      currency: u.currency || "EUR",
      createdAt: u.createdAt || "",
    }));
  }, [usersRaw]);

  const pagination = useMemo(() => {
    const raw: any = usersRaw || {};
    const pag = raw?.data?.pagination || raw?.pagination || raw?.meta?.pagination || {};
    const total = pag.total || raw.total || raw.totalCount || users.length;
    return {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: pag.totalPages || Math.max(1, Math.ceil(total / filters.limit)),
    };
  }, [usersRaw, users.length, filters.page, filters.limit]);

  const stats = useMemo(() => {
    const s: any = statsRaw || {};
    return {
      totalUsers: s.totalUsers ?? 0,
      activeUsers: s.activeUsers ?? 0,
      pendingKyc: s.pendingKyc ?? 0,
      blockedUsers: s.blockedUsers ?? 0,
    };
  }, [statsRaw]);

  const setSearch = useCallback((search: string) => {
    setFilters((f) => ({ ...f, search, page: 1 }));
  }, []);

  const setStatusFilter = useCallback((status: UserStatusFilter) => {
    setFilters((f) => ({ ...f, status, page: 1 }));
  }, []);

  const setKycFilter = useCallback((kycStatus: KycStatusFilter) => {
    setFilters((f) => ({ ...f, kycStatus, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setFilters((f) => ({ ...f, page }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ search: "", status: "all", kycStatus: "all", page: 1, limit: 10 });
  }, []);

  return {
    users,
    pagination,
    stats,
    filters,
    isLoading,
    setSearch,
    setStatusFilter,
    setKycFilter,
    setPage,
    resetFilters,
    refetch,
    updateStatus,
  };
}
