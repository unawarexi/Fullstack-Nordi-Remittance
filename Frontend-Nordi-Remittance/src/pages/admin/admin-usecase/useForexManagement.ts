import { useState, useMemo, useCallback } from "react";
import { useRemittanceStats, useRemittanceByCountry, useTransactionVolumeChart } from "@hooks/api-queries";
import { useTransactions } from "@hooks/api-queries";
import { applyFilterPipeline, textSearchFilter, enumFilter } from "@core/algo/filter";
import { multiKeySort } from "@core/algo/sort";
import { paginate, getPageNumbers } from "@core/algo/pagination";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ============================================================================
// useForexManagement — Forex rates, remittance transactions & stats
// ============================================================================

export type ForexStatusFilter = "all" | "completed" | "pending" | "failed" | "processing";

const PAGE_SIZE = 20;

export function useForexManagement() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ForexStatusFilter>("all");
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<"rates" | "transactions" | "remittances">("rates");

  const { data: remittanceStatsRaw } = useRemittanceStats();
  const { data: countryDataRaw } = useRemittanceByCountry();
  const { data: volumeRaw } = useTransactionVolumeChart({ groupBy: "month" });
  const { data: transactionsRaw, isLoading, refetch } = useTransactions({ type: "remittance", limit: 500 } as any);

  // --- Remittance Stats ---
  const remittanceStats = useMemo(() => {
    const s: any = remittanceStatsRaw || {};
    return {
      totalVolume: s.totalVolume ?? s.total ?? 0,
      totalCount: s.totalCount ?? s.count ?? 0,
      avgAmount: s.averageAmount ?? s.avgAmount ?? 0,
      successRate: s.successRate ?? 0,
      topCorridor: s.topCorridor || "—",
      pendingCount: s.pendingCount ?? 0,
    };
  }, [remittanceStatsRaw]);

  // --- Country data for rates display ---
  const exchangeRates = useMemo(() => {
    const raw: any[] = Array.isArray(countryDataRaw)
      ? countryDataRaw
      : Array.isArray((countryDataRaw as any)?.data)
        ? (countryDataRaw as any).data
        : [];
    if (raw.length === 0) {
      // Provide common currency pairs as fallback
      return [
        { pair: "EUR/USD", rate: 1.0856, change: 0.23, volume: 0 },
        { pair: "EUR/GBP", rate: 0.8534, change: -0.12, volume: 0 },
        { pair: "EUR/NGN", rate: 1650.0, change: 0.45, volume: 0 },
        { pair: "EUR/INR", rate: 90.25, change: 0.31, volume: 0 },
        { pair: "EUR/CAD", rate: 1.4721, change: -0.08, volume: 0 },
        { pair: "EUR/AUD", rate: 1.6532, change: 0.15, volume: 0 },
        { pair: "USD/GBP", rate: 0.7862, change: -0.35, volume: 0 },
        { pair: "USD/NGN", rate: 1520.0, change: 0.67, volume: 0 },
      ];
    }
    return raw.map((c: any) => ({
      pair: c.corridor || c.pair || `EUR/${c.country || c.currency || "USD"}`,
      rate: c.rate ?? c.exchangeRate ?? 1,
      change: c.change ?? c.percentChange ?? 0,
      volume: c.volume ?? c.totalVolume ?? 0,
    }));
  }, [countryDataRaw]);

  // --- Volume chart data (rate history) ---
  const rateHistory = useMemo(() => {
    const raw: any[] = Array.isArray(volumeRaw)
      ? volumeRaw
      : Array.isArray((volumeRaw as any)?.data)
        ? (volumeRaw as any).data
        : [];
    return raw.map((item: any) => ({
      date: item.period || item.month || item.label || "",
      volume: item.amount || item.total || item.volume || 0,
    }));
  }, [volumeRaw]);

  // --- Remittance Transactions ---
  const rawTransactions = useMemo(() => {
    const outer: any = transactionsRaw || {};
    const raw: any[] = Array.isArray(outer)
      ? outer
      : Array.isArray(outer?.data?.data)
        ? outer.data.data
        : Array.isArray(outer?.data)
          ? outer.data
          : outer?.results || [];
    return raw
      .filter((tx: any) => tx.type === "remittance" || tx.type === "international")
      .map((tx: any) => ({
        id: tx._id || tx.id || "",
        sender: tx.senderName || tx.userName || tx.user?.name || "User",
        recipient: tx.recipientName || tx.beneficiary?.name || "Recipient",
        fromCurrency: tx.sourceCurrency || tx.currency || "EUR",
        toCurrency: tx.targetCurrency || tx.destinationCurrency || "USD",
        sentAmount: tx.amount ?? 0,
        receivedAmount: tx.convertedAmount ?? tx.amount ?? 0,
        rate: tx.exchangeRate ?? 1,
        fee: tx.fee ?? 0,
        status: tx.status || "pending",
        date: tx.createdAt || tx.date || "",
        reference: tx.reference || tx.referenceNumber || "",
        country: tx.destinationCountry || tx.recipientCountry || "",
      }));
  }, [transactionsRaw]);

  // --- Filter Pipeline ---
  const filtered = useMemo(() => {
    const predicates: ((item: any) => boolean)[] = [];
    if (search) {
      predicates.push(
        textSearchFilter(search, [
          (tx) => tx.sender ?? "",
          (tx) => tx.recipient ?? "",
          (tx) => tx.reference ?? "",
          (tx) => tx.country ?? "",
        ]),
      );
    }
    if (statusFilter !== "all") {
      predicates.push(enumFilter((tx) => tx.status ?? "", [statusFilter]));
    }
    const result = applyFilterPipeline(rawTransactions, predicates);
    return multiKeySort(result, [{ getter: (tx: any) => new Date(tx.date || 0), direction: "desc" }]);
  }, [rawTransactions, search, statusFilter]);

  // --- Pagination ---
  const paginatedResult = useMemo(() => paginate(filtered, page, PAGE_SIZE), [filtered, page]);
  const pageNumbers = useMemo(
    () => getPageNumbers(paginatedResult.page, paginatedResult.totalPages),
    [paginatedResult.page, paginatedResult.totalPages],
  );

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  return {
    transactions: paginatedResult.items,
    allTransactions: filtered,
    rawTransactions,
    exchangeRates,
    rateHistory,
    remittanceStats,
    search,
    statusFilter,
    activeTab,
    page,
    isLoading,
    pagination: paginatedResult,
    pageNumbers,
    setSearch: handleSearch,
    setStatusFilter: useCallback((v: ForexStatusFilter) => {
      setStatusFilter(v);
      setPage(1);
    }, []),
    setActiveTab,
    setPage,
    refetch,
  };
}
