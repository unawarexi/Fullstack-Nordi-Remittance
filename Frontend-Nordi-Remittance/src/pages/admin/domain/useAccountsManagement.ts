import { useState, useMemo, useCallback } from "react";
import {
  useAdminWallets,
  useAdminUpdateWalletStatus,
  useAdminDashboardStats,
} from "@hooks/queries";
import {
  applyFilterPipeline,
  textSearchFilter,
  enumFilter,
} from "@core/algo/filter";
import { multiKeySort } from "@core/algo/sort";
import { paginate, getPageNumbers } from "@core/algo/pagination";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ============================================================================
// useAccountsManagement — Aggregates admin account listing, filters & actions
// ============================================================================

export type AccountStatusFilter = "All" | "Active" | "Dormant" | "Frozen" | "Closed";
export type AccountTypeFilter = "all" | "savings" | "current" | "fixed-deposit" | "wallet";

const PAGE_SIZE = 20;

export function useAccountsManagement() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<AccountStatusFilter>("All");
  const [typeFilter, setTypeFilter] = useState<AccountTypeFilter>("all");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: walletsRaw, isLoading, refetch } = useAdminWallets({ page: 1, limit: 500 });
  const { data: statsRaw } = useAdminDashboardStats();
  const updateWalletStatus = useAdminUpdateWalletStatus();

  // --- Normalize raw wallet data into account shape ---
  const rawAccounts = useMemo(() => {
    const outer: any = walletsRaw || {};
    const raw: any[] = Array.isArray(outer)
      ? outer
      : Array.isArray(outer?.data?.data)
        ? outer.data.data
        : Array.isArray(outer?.data)
          ? outer.data
          : outer?.wallets || [];
    return raw.map((w: any) => {
      const balancesMap: Record<string, number> =
        w.balances instanceof Map
          ? Object.fromEntries(w.balances)
          : w.balances || {};
      const totalBalance = Object.values(balancesMap).reduce(
        (sum: number, v: any) => sum + (Number(v) || 0),
        0,
      );
      return {
        id: w._id || w.walletNumber || w.id || "",
        owner:
          w.user?.firstName && w.user?.lastName
            ? `${w.user.firstName} ${w.user.lastName}`
            : w.userName || "Unknown",
        email: w.user?.email || w.email || "",
        type: w.walletType || w.accountType || "wallet",
        accountNumber: w.walletNumber || w.accountNumber || "",
        balance: totalBalance,
        currency: w.currency || "EUR",
        status: w.status || "active",
        interestRate: w.interestRate ?? 0,
        opened: w.createdAt || "",
        lastActivity: w.updatedAt || w.lastTransactionAt || "",
      };
    });
  }, [walletsRaw]);

  // --- Filter Pipeline ---
  const filtered = useMemo(() => {
    const predicates: ((item: any) => boolean)[] = [];
    if (search) {
      predicates.push(
        textSearchFilter(search, [
          (a) => a.owner ?? "",
          (a) => a.accountNumber ?? "",
          (a) => a.email ?? "",
        ]),
      );
    }
    if (statusFilter !== "All") {
      predicates.push(
        enumFilter((a) => a.status ?? "", [statusFilter.toLowerCase()]),
      );
    }
    if (typeFilter !== "all") {
      predicates.push(enumFilter((a) => a.type ?? "", [typeFilter]));
    }
    const result = applyFilterPipeline(rawAccounts, predicates);
    return multiKeySort(result, [
      { getter: (a: any) => new Date(a.lastActivity || a.opened || 0), direction: "desc" },
    ]);
  }, [rawAccounts, search, statusFilter, typeFilter]);

  // --- Pagination ---
  const paginatedResult = useMemo(
    () => paginate(filtered, page, PAGE_SIZE),
    [filtered, page],
  );
  const pageNumbers = useMemo(
    () => getPageNumbers(paginatedResult.page, paginatedResult.totalPages),
    [paginatedResult.page, paginatedResult.totalPages],
  );

  // --- Stats ---
  const stats = useMemo(() => {
    const totalBalance = rawAccounts.reduce((sum: number, a: any) => sum + a.balance, 0);
    const activeCount = rawAccounts.filter((a: any) => a.status === "active").length;
    const dormantCount = rawAccounts.filter((a: any) => a.status === "dormant").length;
    const s: any = statsRaw || {};
    return {
      totalBalance,
      activeAccounts: activeCount || s.activeAccounts || 0,
      dormantAccounts: dormantCount,
      totalAccounts: rawAccounts.length || s.totalAccounts || 0,
    };
  }, [rawAccounts, statsRaw]);

  // --- Actions ---
  const freezeAccount = useCallback(
    (walletId: string) => {
      updateWalletStatus.mutate(
        { walletId: walletId as any, data: { status: "frozen" as any, reason: "Frozen by admin" } },
        { onSuccess: () => refetch() },
      );
    },
    [updateWalletStatus, refetch],
  );

  const unfreezeAccount = useCallback(
    (walletId: string) => {
      updateWalletStatus.mutate(
        { walletId: walletId as any, data: { status: "active" as any, reason: "Unfrozen by admin" } },
        { onSuccess: () => refetch() },
      );
    },
    [updateWalletStatus, refetch],
  );

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleStatusFilter = useCallback((value: AccountStatusFilter) => {
    setStatusFilter(value);
    setPage(1);
  }, []);

  const handleTypeFilter = useCallback((value: AccountTypeFilter) => {
    setTypeFilter(value);
    setPage(1);
  }, []);

  return {
    accounts: paginatedResult.items,
    allAccounts: filtered,
    rawAccounts,
    stats,
    search,
    statusFilter,
    typeFilter,
    page,
    expandedId,
    isLoading,
    isMutating: updateWalletStatus.isPending,
    pagination: paginatedResult,
    pageNumbers,
    setSearch: handleSearch,
    setStatusFilter: handleStatusFilter,
    setTypeFilter: handleTypeFilter,
    setPage,
    setExpandedId,
    freezeAccount,
    unfreezeAccount,
    refetch,
  };
}
