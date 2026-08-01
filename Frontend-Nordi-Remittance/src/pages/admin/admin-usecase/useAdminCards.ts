// ============================================================================
// useAdminCards — Domain use-case hook for Admin Cards console
//
// Wraps query & mutation hooks with state management and action handlers
// UI components import strictly from here without calling direct APIs or raw mutations.
// ============================================================================

import { useState, useMemo } from "react";
import { useAdminAllCards, useAdminCardApplications, useAdminCardAction } from "@hooks/api-queries/useCards";

/* eslint-disable @typescript-eslint/no-explicit-any */

export function useAdminCards() {
  const [activeTab, setActiveTab] = useState<"cards" | "applications">("cards");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal operational state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<"fund" | "withdraw" | "upgrade" | "approve" | "reject" | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [amountInput, setAmountInput] = useState("");
  const [reasonInput, setReasonInput] = useState("");

  // Data fetching via query hooks
  const { data: cardsRes, isLoading: cardsLoading } = useAdminAllCards();
  const { data: appsRes, isLoading: appsLoading } = useAdminCardApplications();
  const actionMutation = useAdminCardAction();

  const cardsList: any[] = useMemo(() => {
    const raw: any = cardsRes;
    return Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : Array.isArray(raw?.cards) ? raw.cards : [];
  }, [cardsRes]);

  const applicationsList: any[] = useMemo(() => {
    const raw: any = appsRes;
    return Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.data)
        ? raw.data
        : Array.isArray(raw?.applications)
          ? raw.applications
          : [];
  }, [appsRes]);

  // Financial total computations
  const totalBalance = useMemo(
    () => cardsList.reduce((acc: number, c: any) => acc + (Number(c.balance) || 0), 0),
    [cardsList],
  );

  const activeCardsCount = useMemo(
    () => cardsList.filter((c: any) => c.status === "active").length || cardsList.length,
    [cardsList],
  );

  const pendingAppsCount = useMemo(
    () =>
      applicationsList.filter((a: any) => a.status === "pending" || a.status === "under_review" || !a.status).length,
    [applicationsList],
  );

  // Filtered lists for rendering
  const filteredCards = useMemo(() => {
    return cardsList.filter((c: any) => {
      const matchesSearch =
        c.cardholderName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.cardNumber?.includes(searchTerm) ||
        c.cardType?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [cardsList, searchTerm, statusFilter]);

  // Modal open helpers
  const handleOpenModal = (action: "fund" | "withdraw" | "upgrade" | "approve" | "reject", item: any) => {
    setModalAction(action);
    setSelectedItem(item);
    setAmountInput("");
    setReasonInput("");
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setAmountInput("");
    setReasonInput("");
    setSelectedItem(null);
    setModalAction(null);
  };

  // Submission handling
  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !modalAction) return;
    const id = selectedItem._id || selectedItem.id || selectedItem.cardId;

    if (modalAction === "fund" || modalAction === "withdraw" || modalAction === "upgrade") {
      const numAmount = parseFloat(amountInput);
      if (!numAmount || numAmount <= 0) return;
      actionMutation.mutate(
        {
          type: modalAction,
          id,
          data: {
            amount: numAmount,
            creditLimit: numAmount,
            notes: reasonInput || `Admin ${modalAction}`,
          },
        },
        { onSuccess: handleCloseModal },
      );
    } else if (modalAction === "approve") {
      const numLimit = parseFloat(amountInput);
      actionMutation.mutate(
        {
          type: "approve",
          id,
          data: { creditLimit: numLimit || 5000, notes: reasonInput },
        },
        { onSuccess: handleCloseModal },
      );
    } else if (modalAction === "reject") {
      actionMutation.mutate(
        {
          type: "reject",
          id,
          data: { reason: reasonInput || "Did not meet underwriting criteria" },
        },
        { onSuccess: handleCloseModal },
      );
    }
  };

  const handleStatusChange = (item: any, newStatus: string) => {
    const id = item._id || item.id || item.cardId;
    actionMutation.mutate({
      type: "status",
      id,
      data: { status: newStatus },
    });
  };

  const formatCurrency = (amount: number, currency = "USD") =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(amount || 0);

  return {
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    modalOpen,
    modalAction,
    selectedItem,
    amountInput,
    setAmountInput,
    reasonInput,
    setReasonInput,
    cardsList,
    filteredCards,
    applicationsList,
    cardsLoading,
    appsLoading,
    isActionPending: actionMutation.isPending,
    totalBalance,
    activeCardsCount,
    pendingAppsCount,
    formatCurrency,
    handleOpenModal,
    handleCloseModal,
    handleModalSubmit,
    handleStatusChange,
  };
}
