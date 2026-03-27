/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useCallback, useState } from "react";
import { useAdminUserFinancialData } from "@hooks/queries";

// ============================================================================
// Types — match backend schema field names to UI display shape
// ============================================================================

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: "credit" | "debit";
  description: string;
  status: "completed" | "pending" | "failed";
  reference: string;
}

export interface CardDetails {
  id: string;
  cardNumber: string;
  cardName: string;
  expiryDate: string;
  cvv: string;
  cardType: string;
  issueDate: string;
  balance: number;
  limit: number;
  status: "active" | "blocked" | "expired";
  transactions: Transaction[];
}

export interface BankAccount {
  id: string;
  accountNumber: string;
  accountName: string;
  bankName: string;
  accountType: string;
  balance: number;
  status: "active" | "blocked" | "suspended";
  transactions: Transaction[];
}

export interface Loan {
  id: string;
  loanType: string;
  amount: number;
  interestRate: number;
  term: number;
  startDate: string;
  endDate: string;
  monthlyPayment: number;
  remainingAmount: number;
  status: "active" | "paid" | "defaulted" | "paused";
  collateral?: string;
}

export interface Investment {
  id: string;
  investmentType: string;
  amount: number;
  startDate: string;
  endDate: string;
  interestRate: number;
  expectedReturn: number;
  currentValue: number;
  status: "active" | "matured" | "withdrawn";
}

export interface CryptoWallet {
  id: string;
  walletAddress: string;
  currency: string;
  balance: number;
  dollarValue: number;
  status: "active" | "blocked";
}

export interface UserFinancialData {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture: string;
  cards: CardDetails[];
  bankAccounts: BankAccount[];
  loans: Loan[];
  investments: Investment[];
  cryptoWallets: CryptoWallet[];
}

// ============================================================================
// Mappers — transform backend response to UI types
// ============================================================================

function mapTransaction(t: any): Transaction {
  const isCredit = t.type === "deposit" || t.type === "refund" || t.type === "credit";
  return {
    id: t._id || t.referenceNumber || String(Math.random()),
    date: t.createdAt || t.completedAt || "",
    amount: t.amount ?? 0,
    type: isCredit ? "credit" : "debit",
    description: t.description || t.type || "Transaction",
    status: (t.status === "completed" || t.status === "pending" || t.status === "failed")
      ? t.status
      : "completed",
    reference: t.referenceNumber || "",
  };
}

function mapCard(c: any, transactions: any[]): CardDetails {
  const cardTransactions = transactions
    .filter((t: any) => t.category === "cards")
    .map(mapTransaction);

  const expiryDate = c.expiryMonth && c.expiryYear
    ? `${String(c.expiryMonth).padStart(2, "0")}/${String(c.expiryYear).slice(-2)}`
    : "";

  return {
    id: c.cardId || c._id || "",
    cardNumber: c.cardNumber || "****",
    cardName: c.cardholderName || `${c.cardBrand || ""} ${c.cardType || ""}`.trim(),
    expiryDate,
    cvv: "***",
    cardType: c.cardType || "debit",
    issueDate: c.issueDate || c.createdAt || "",
    balance: c.balance ?? 0,
    limit: c.creditLimit ?? 0,
    status: mapCardStatus(c.status),
    transactions: cardTransactions,
  };
}

function mapCardStatus(status: string): "active" | "blocked" | "expired" {
  switch (status) {
    case "active": return "active";
    case "expired": return "expired";
    case "blocked": case "stolen": case "lost": case "pending_activation":
      return "blocked";
    default: return "active";
  }
}

function mapWallet(w: any, transactions: any[]): BankAccount {
  const walletTransactions = transactions
    .filter((t: any) => t.category === "bankAccounts" || !t.category)
    .map(mapTransaction);

  const balancesMap: Record<string, number> = w.balances instanceof Map
    ? Object.fromEntries(w.balances)
    : (w.balances || {});
  const totalBalance = Object.values(balancesMap).reduce((sum: number, v: any) => sum + (Number(v) || 0), 0);

  return {
    id: w._id || w.walletNumber || "",
    accountNumber: w.walletNumber || "",
    accountName: w.isPrimary ? "Primary Wallet" : "Wallet",
    bankName: "Nordi",
    accountType: w.walletType || "personal",
    balance: totalBalance,
    status: mapWalletStatus(w.status),
    transactions: walletTransactions,
  };
}

function mapWalletStatus(status: string): "active" | "blocked" | "suspended" {
  switch (status) {
    case "active": return "active";
    case "suspended": return "suspended";
    case "closed": return "blocked";
    default: return "active";
  }
}

function mapLoan(l: any): Loan {
  return {
    id: l.loanId || l._id || "",
    loanType: l.loanType || "personal",
    amount: l.principalAmount ?? 0,
    interestRate: l.interestRate ?? 0,
    term: l.term ?? 0,
    startDate: l.startDate || l.createdAt || "",
    endDate: l.maturityDate || "",
    monthlyPayment: l.monthlyPayment ?? 0,
    remainingAmount: l.outstandingBalance ?? l.principalAmount ?? 0,
    status: mapLoanStatus(l.status),
    collateral: l.collateral || undefined,
  };
}

function mapLoanStatus(status: string): "active" | "paid" | "defaulted" | "paused" {
  switch (status) {
    case "active": return "active";
    case "paid": return "paid";
    case "defaulted": case "written_off": return "defaulted";
    case "paused": case "pending": return "paused";
    default: return "active";
  }
}

function mapInvestment(inv: any): Investment {
  return {
    id: inv.accountId || inv._id || "",
    investmentType: inv.accountType || "stocks",
    amount: inv.totalInvested ?? 0,
    startDate: inv.createdAt || "",
    endDate: "",
    interestRate: inv.returnPercentage ?? 0,
    expectedReturn: inv.totalReturns ?? 0,
    currentValue: inv.currentValue ?? 0,
    status: mapInvestmentStatus(inv.status),
  };
}

function mapInvestmentStatus(status: string): "active" | "matured" | "withdrawn" {
  switch (status) {
    case "active": return "active";
    case "closed": return "withdrawn";
    case "suspended": return "matured";
    default: return "active";
  }
}

function mapCryptoFromInvestment(inv: any): CryptoWallet | null {
  if (inv.accountType !== "crypto") return null;
  return {
    id: inv.accountId || inv._id || "",
    walletAddress: inv.accountId || "",
    currency: inv.currency || "BTC",
    balance: inv.currentValue ?? 0,
    dollarValue: inv.currentValue ?? 0,
    status: inv.status === "active" ? "active" : "blocked",
  };
}

// ============================================================================
// useUserFinancialData — Use-case hook for user financial data
// ============================================================================

export function useUserFinancialData(userId: string) {
  const { data: rawData, isLoading, error, refetch } = useAdminUserFinancialData(userId);
  const [localOverrides, setLocalOverrides] = useState<UserFinancialData | null>(null);

  const userData = useMemo<UserFinancialData | null>(() => {
    if (localOverrides) return localOverrides;
    if (!rawData) return null;

    const user = rawData.user || rawData;
    const wallets: any[] = rawData.wallets || [];
    const transactions: any[] = rawData.recentTransactions || [];
    const loans: any[] = rawData.loans || [];
    const cards: any[] = rawData.cards || [];
    const investments: any[] = rawData.investments || [];

    const mappedCards = cards.map((c: any) => mapCard(c, transactions));
    const mappedWallets = wallets.map((w: any) => mapWallet(w, transactions));
    const allInvestments = investments.filter((i: any) => i.accountType !== "crypto");
    const cryptoInvestments = investments.filter((i: any) => i.accountType === "crypto");

    return {
      _id: user._id || user.id || "",
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      profilePicture: user.profilePicture || "",
      cards: mappedCards,
      bankAccounts: mappedWallets,
      loans: loans.map(mapLoan),
      investments: allInvestments.map(mapInvestment),
      cryptoWallets: cryptoInvestments.map(mapCryptoFromInvestment).filter(Boolean) as CryptoWallet[],
    };
  }, [rawData, localOverrides]);

  const updateFinancialData = useCallback(
    (updater: (prev: UserFinancialData) => UserFinancialData) => {
      const current = localOverrides || userData;
      if (current) {
        setLocalOverrides(updater(current));
      }
    },
    [localOverrides, userData],
  );

  return {
    userData,
    loading: isLoading,
    error: error ? (error as Error).message || "Failed to load financial data" : null,
    refetch,
    updateFinancialData,
  };
}
