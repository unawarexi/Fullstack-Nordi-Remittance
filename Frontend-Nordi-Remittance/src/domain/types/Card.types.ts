// ============================================================================
// CARDS MODULE — Shared client-side types
// Mirrors CardsModel.ts schemas + Card_controller.ts response shapes exactly,
// so every page in the Cards module shares one source of truth instead of `any`.
// ============================================================================

export type CardType = "debit" | "credit" | "prepaid" | "virtual";
export type CardBrand = "visa" | "mastercard" | "amex" | "discover";
export type CardStatus = "active" | "blocked" | "expired" | "stolen" | "lost" | "pending_activation";

export type CardTransactionType = "purchase" | "refund" | "withdrawal" | "cash_advance" | "fee" | "interest";

export type CardTransactionStatus = "pending" | "completed" | "declined" | "reversed";

export interface BillingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

/** Normalized card shape produced by useClientCards() in useCardsDomain.ts */
export interface ClientCard {
  id: string;
  cardId?: string;
  cardNumber: string; // already masked server-side + client-side
  last4: string;
  cardholderName: string;
  cardType: CardType;
  cardBrand: CardBrand;
  status: CardStatus;
  isPhysical: boolean;
  balance: number;
  creditLimit: number;
  availableCredit: number;
  expiryMonth?: number;
  expiryYear?: number;
  expiryDate: string; // "MM/YYYY" formatted
  currency: string;
  isInternationalEnabled: boolean;
  isOnlineEnabled: boolean;
  isContactlessEnabled: boolean;
  isAtmEnabled: boolean;
  blockedReason?: string | null;
  blockedAt?: string | null;
  billingAddress?: BillingAddress | null;
  createdAt?: string;
  /** Untouched API payload, for anything a page needs that isn't normalized above */
  _raw: Record<string, unknown>;
}

export interface CardLimits {
  dailyLimit: number;
  monthlyLimit: number;
  perTransactionLimit: number;
  atmDailyLimit: number;
  atmMonthlyLimit: number;
  internationalLimit?: number;
  onlineLimit?: number;
  dailySpent: number;
  monthlySpent: number;
  atmDailySpent: number;
  atmMonthlySpent: number;
  resetDate: string;
  currency: string;
}

export interface CardControlsState {
  isOnlineEnabled: boolean;
  isInternationalEnabled: boolean;
  isContactlessEnabled: boolean;
  isAtmEnabled: boolean;
}

/** Shape returned by getCardTransactions — select() only projects these fields */
export interface ClientCardTransaction {
  _id: string;
  transactionType: CardTransactionType;
  amount: number;
  currency: string;
  merchantName: string;
  merchantCategory?: string;
  status: CardTransactionStatus;
  authorizationCode?: string;
  createdAt: string;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface ActiveWallet {
  id: string;
  balance: number;
  currency: string;
}

export const CARD_BRANDS: { id: CardBrand; name: string; icon: string }[] = [
  { id: "visa", name: "Visa", icon: "https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png" },
  {
    id: "mastercard",
    name: "Mastercard",
    icon: "https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg",
  },
  {
    id: "amex",
    name: "American Express",
    icon: "https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg",
  },
  {
    id: "discover",
    name: "Discover",
    icon: "https://upload.wikimedia.org/wikipedia/commons/5/57/Discover_Card_logo.svg",
  },
];

/** Card issuance is instant for both types — no under-review step exists server-side today */
export const PHYSICAL_CARD_ISSUANCE_FEE = 10;
export const MAX_CARDS_PER_USER = 5;
