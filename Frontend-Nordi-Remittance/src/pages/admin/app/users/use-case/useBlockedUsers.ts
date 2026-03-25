import { useState, useMemo, useCallback } from "react";
import { useSearchUsers, useUpdateUserStatus } from "@hooks/queries";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ============================================================================
// useBlockedUsers — Lists suspended/banned users with unblock capability
// ============================================================================

interface Filters {
  search: string;
  status: "suspended" | "banned" | "all";
  page: number;
  limit: number;
}

export function useBlockedUsers() {
  const [filters, setFilters] = useState<Filters>({
    search: "",
    status: "all",
    page: 1,
    limit: 10,
  });

  const queryParams = useMemo(() => {
    const params: Record<string, any> = {
      page: filters.page,
      limit: filters.limit,
    };
    if (filters.search) params.query = filters.search;
    // Always filter for blocked statuses
    if (filters.status === "all") {
      params.status = "suspended,banned";
    } else {
      params.status = filters.status;
    }
    return params;
  }, [filters]);

  const { data: usersRaw, isLoading, refetch } = useSearchUsers(queryParams);
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
      status: u.status || "suspended",
      kycStatus: u.kycStatus || "pending",
      blockedAt: u.updatedAt || u.blockedAt || "",
      reason: u.statusReason || u.reason || "No reason provided",
      lastLogin: u.lastLogin || null,
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

  const setSearch = useCallback((search: string) => {
    setFilters((f) => ({ ...f, search, page: 1 }));
  }, []);

  const setStatusFilter = useCallback((status: "suspended" | "banned" | "all") => {
    setFilters((f) => ({ ...f, status, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setFilters((f) => ({ ...f, page }));
  }, []);

  const unblockUser = useCallback(
    (userId: string) => {
      updateStatus.mutate({ userId, data: { status: "active" as any, reason: "Unblocked by admin" } });
    },
    [updateStatus],
  );

  return {
    users,
    pagination,
    filters,
    isLoading,
    setSearch,
    setStatusFilter,
    setPage,
    refetch,
    unblockUser,
    isUnblocking: updateStatus.isPending,
  };
}
