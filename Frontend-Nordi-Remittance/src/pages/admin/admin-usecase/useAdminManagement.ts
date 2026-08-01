import { useState, useMemo, useCallback } from "react";
import { useAdminUsersList, useCreateAdminUser, useAuditLogs } from "@hooks/api-queries";
import { applyFilterPipeline, textSearchFilter, enumFilter } from "@core/algo/filter";
import { multiKeySort } from "@core/algo/sort";
import { paginate, getPageNumbers } from "@core/algo/pagination";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ============================================================================
// useAdminManagement — Admin users, roles & activity logs
// ============================================================================

export type AdminRoleFilter = "all" | "super_admin" | "admin" | "moderator" | "viewer";

const PAGE_SIZE = 20;

export function useAdminManagement() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<AdminRoleFilter>("all");
  const [activeTab, setActiveTab] = useState<"users" | "roles" | "activity">("users");
  const [page, setPage] = useState(1);

  const {
    data: adminsRaw,
    isLoading: adminsLoading,
    refetch: refetchAdmins,
  } = useAdminUsersList({ page: 1, limit: 500 });
  const { data: logsRaw, isLoading: logsLoading, refetch: refetchLogs } = useAuditLogs({ page: 1, limit: 200 });
  const createAdmin = useCreateAdminUser();

  // --- Normalize admin users ---
  const rawAdmins = useMemo(() => {
    const outer: any = adminsRaw || {};
    const raw: any[] = Array.isArray(outer)
      ? outer
      : Array.isArray(outer?.data?.data)
        ? outer.data.data
        : Array.isArray(outer?.data)
          ? outer.data
          : outer?.admins || [];
    return raw.map((a: any) => ({
      id: a._id || a.id || "",
      firstName: a.firstName || "",
      lastName: a.lastName || "",
      email: a.email || "",
      role: a.role || "admin",
      status: a.status || "active",
      lastLogin: a.lastLogin || null,
      createdAt: a.createdAt || "",
      permissions: a.permissions || [],
      department: a.department || "",
    }));
  }, [adminsRaw]);

  // --- Normalize audit/activity logs ---
  const rawLogs = useMemo(() => {
    const outer: any = logsRaw || {};
    const raw: any[] = Array.isArray(outer)
      ? outer
      : Array.isArray(outer?.data?.data)
        ? outer.data.data
        : Array.isArray(outer?.data)
          ? outer.data
          : outer?.logs || [];
    return raw.map((l: any) => ({
      id: l._id || l.id || "",
      action: l.action || l.type || "unknown",
      admin: l.adminName || l.userName || l.user?.name || "Admin",
      adminEmail: l.adminEmail || l.user?.email || "",
      target: l.target || l.entityType || "",
      details: l.details || l.description || "",
      ipAddress: l.ipAddress || l.ip || "",
      timestamp: l.createdAt || l.timestamp || "",
      status: l.status || "success",
    }));
  }, [logsRaw]);

  // --- Derive roles from admin users ---
  const roles = useMemo(() => {
    const roleMap = new Map<string, { count: number; permissions: string[] }>();
    for (const admin of rawAdmins) {
      const existing = roleMap.get(admin.role);
      if (existing) {
        existing.count++;
      } else {
        roleMap.set(admin.role, { count: 1, permissions: admin.permissions });
      }
    }
    return Array.from(roleMap.entries()).map(([role, data]) => ({
      id: role,
      name: role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      role,
      count: data.count,
      permissions: data.permissions,
    }));
  }, [rawAdmins]);

  // --- Active tab data ---
  const activeData = activeTab === "users" ? rawAdmins : activeTab === "activity" ? rawLogs : roles;

  // --- Filter Pipeline ---
  const filtered = useMemo(() => {
    const predicates: ((item: any) => boolean)[] = [];
    if (search) {
      predicates.push(
        textSearchFilter(search, [
          (i) => (i.firstName ? `${i.firstName} ${i.lastName}` : i.admin || i.name || ""),
          (i) => i.email || i.adminEmail || "",
          (i) => i.action || i.role || "",
          (i) => i.details || "",
        ]),
      );
    }
    if (roleFilter !== "all" && activeTab === "users") {
      predicates.push(enumFilter((i) => i.role ?? "", [roleFilter]));
    }
    const result = applyFilterPipeline(activeData as any[], predicates);
    return multiKeySort(result, [{ getter: (i: any) => new Date(i.createdAt || i.timestamp || 0), direction: "desc" }]);
  }, [activeData, search, roleFilter, activeTab]);

  // --- Pagination ---
  const paginatedResult = useMemo(() => paginate(filtered, page, PAGE_SIZE), [filtered, page]);
  const pageNumbers = useMemo(
    () => getPageNumbers(paginatedResult.page, paginatedResult.totalPages),
    [paginatedResult.page, paginatedResult.totalPages],
  );

  // --- Stats ---
  const stats = useMemo(
    () => ({
      totalAdmins: rawAdmins.length,
      activeAdmins: rawAdmins.filter((a) => a.status === "active").length,
      totalRoles: roles.length,
      recentActivity: rawLogs.length,
    }),
    [rawAdmins, roles, rawLogs],
  );

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleCreateAdmin = useCallback(
    (data: any, callbacks?: { onSuccess?: () => void; onError?: (err: any) => void }) => {
      createAdmin.mutate(data, {
        onSuccess: () => {
          refetchAdmins();
          callbacks?.onSuccess?.();
        },
        onError: (err) => callbacks?.onError?.(err),
      });
    },
    [createAdmin, refetchAdmins],
  );

  const refetch = useCallback(() => {
    refetchAdmins();
    refetchLogs();
  }, [refetchAdmins, refetchLogs]);

  return {
    items: paginatedResult.items,
    allItems: filtered,
    admins: rawAdmins,
    roles,
    logs: rawLogs,
    stats,
    search,
    roleFilter,
    activeTab,
    page,
    isLoading: adminsLoading || logsLoading,
    isCreating: createAdmin.isPending,
    pagination: paginatedResult,
    pageNumbers,
    setSearch: handleSearch,
    setRoleFilter: useCallback((v: AdminRoleFilter) => {
      setRoleFilter(v);
      setPage(1);
    }, []),
    setActiveTab,
    setPage,
    handleCreateAdmin,
    refetch,
  };
}
