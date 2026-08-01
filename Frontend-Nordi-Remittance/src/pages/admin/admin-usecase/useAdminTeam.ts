import { useState, useMemo, useCallback } from "react";
import { useAdminUsersList, useCreateAdminUser } from "@hooks/api-queries";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ============================================================================
// useAdminTeam — Aggregates admin team listing + creation
// ============================================================================

export function useAdminTeam() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const queryParams = useMemo(() => {
    const params: Record<string, any> = { page, limit: 10 };
    if (search) params.search = search;
    return params;
  }, [page, search]);

  const { data: adminsRaw, isLoading, refetch } = useAdminUsersList(queryParams);
  const createAdmin = useCreateAdminUser();

  const admins = useMemo(() => {
    const outer: any = adminsRaw || {};
    const raw: any[] = Array.isArray(outer)
      ? outer
      : Array.isArray(outer?.data?.data)
        ? outer.data.data
        : Array.isArray(outer?.data)
          ? outer.data
          : outer?.admins || [];
    return raw.map((a: any) => ({
      id: a._id || a.id,
      firstName: a.firstName || "",
      lastName: a.lastName || "",
      email: a.email || "",
      role: a.role || "admin",
      status: a.status || "active",
      lastLogin: a.lastLogin || null,
      createdAt: a.createdAt || "",
      permissions: a.permissions || [],
    }));
  }, [adminsRaw]);

  const pagination = useMemo(() => {
    const raw: any = adminsRaw || {};
    const pag = raw?.data?.pagination || raw?.pagination || raw?.meta?.pagination || {};
    const total = pag.total || raw.total || raw.totalCount || admins.length;
    return {
      page,
      total,
      totalPages: pag.totalPages || Math.max(1, Math.ceil(total / 10)),
    };
  }, [adminsRaw, admins.length, page]);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  return {
    admins,
    pagination,
    search,
    isLoading,
    setPage,
    setSearch: handleSearch,
    refetch,
    createAdmin,
    isCreating: createAdmin.isPending,
  };
}
