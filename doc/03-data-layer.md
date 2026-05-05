# Nordi Remittance — Data Layer

## Overview

The data layer is built on MongoDB 7 with Mongoose ODM. The design follows principles from ISO 20022 financial messaging standards: immutable transaction records, complete audit trails, and double-entry balance tracking.

There are 18 Mongoose models organized into 5 domain groups.

---

## Domain Model Groups

### 1. Core Financial Models

#### Wallets (`AccountsModel.ts → Wallets`)

A Wallet is the primary financial account entity. Each user can hold multiple wallets (personal and business). Balances are expressed as a currency map.

```
Collection: Wallets
Key Fields:
  user           : ObjectId → Users (required, unique per user)
  walletNumber   : String (unique) — format: W{timestamp8}{random4}HEX
  balances       : Map<String, Number> — { "USD": 1500.00, "NGN": 250000 }
  status         : "active" | "suspended" | "closed"
  walletType     : "personal" | "business"
  isPrimary      : Boolean
  limits         : { daily, monthly, perTransaction }
  transactionHistory : ObjectId[] → Transactions
  lastTransactionAt  : Date

Indexes:
  { status: 1 }
  { user: 1, status: 1 }
  { user: 1, isPrimary: 1 }
```

#### AccountBalances

Tracks per-currency balance state with fine-grained balance types:

```
Collection: AccountBalances
Key Fields:
  wallet          : ObjectId → Wallets
  currency        : String (e.g., "USD")
  availableBalance: Number  — spendable balance
  ledgerBalance   : Number  — posted/settled balance
  pendingBalance  : Number  — in-flight transactions
  reservedBalance : Number  — held for authorizations

Unique Index: { wallet: 1, currency: 1 }
```

The distinction between `availableBalance` and `ledgerBalance` mirrors banking industry conventions: `availableBalance = ledgerBalance - pendingBalance - reservedBalance`. Consumers should read `availableBalance` for spend checks.

#### Transactions

Immutable record of every financial event. Once `status: completed`, the record is never modified.

```
Collection: Transactions
Key Fields:
  wallet          : ObjectId → Wallets
  type            : "deposit" | "withdrawal" | "transfer" | "payment"
                  | "refund" | "fee" | "reversal" | "exchange"
  category        : "cards" | "bankAccounts" | "cryptoWallets" | "loans" | "investments"
  amount          : Number (required)
  currency        : String
  status          : "pending" | "completed" | "failed" | "cancelled" | "reversed"
  referenceNumber : String (unique) — format: TXN-{base36ts}-{random4hex}
  initiatedBy     : String → Users
  recipientWallet : ObjectId → Wallets (for internal transfers)
  exchangeRate    : Number (for cross-currency)
  fee             : Number
  isInternational : Boolean
  channel         : "web" | "mobile" | "api" | "branch" | "atm"
  ipAddress       : String
  scheduledFor    : Date (for scheduled transfers)
  meta            : Mixed (extensible metadata)

Key Indexes:
  { initiatedBy: 1, createdAt: -1 }   — user transaction history
  { wallet: 1, createdAt: -1 }         — wallet statement
  { referenceNumber: "text" }          — full-text search
  { status: 1, createdAt: -1 }         — admin pending queue
```

#### LedgerEntries

The source of truth for all balance changes. Immutable after creation. Every balance update generates exactly two entries: one debit, one credit.

```
Collection: LedgerEntries
Key Fields:
  transaction   : ObjectId → Transactions
  wallet        : ObjectId → Wallets
  entryType     : "debit" | "credit"
  amount        : Number
  currency      : String
  balance       : Number  — running balance AFTER this entry
  description   : String
  accountingDate: Date    — effective date (not necessarily createdAt)
  isReversed    : Boolean (default: false)
  reversalEntry : ObjectId → LedgerEntries (reversal pointer)
  createdAt     : Date (IMMUTABLE — no updatedAt)

Indexes:
  { wallet: 1, createdAt: -1 }
  { transaction: 1 }
  { wallet: 1, entryType: 1, createdAt: -1 }
```

The `createdAt` field is marked immutable — Mongoose prevents updates to this field. This is critical for audit integrity.

#### AccountLimits

Enforces KYC-tiered transaction limits. Limits reset on a rolling basis.

```
Collection: AccountLimits
Key Fields:
  wallet     : ObjectId → Wallets
  limitType  : "daily" | "monthly" | "yearly" | "per_transaction"
  category   : "withdrawal" | "transfer" | "payment" | "all"
  amount     : Number  — limit ceiling
  usedAmount : Number  — consumed amount in current window
  resetDate  : Date
  isActive   : Boolean

KYC-Based Limit Tiers:
  pending:  dailyTransfer: $500,   perTransaction: $200
  approved: dailyTransfer: $50,000, perTransaction: $25,000
```

#### AccountStatusHistories

Audit trail for every wallet status change (active → suspended, etc.):

```
Collection: AccountStatusHistories
Key Fields:
  wallet         : ObjectId → Wallets
  previousStatus : String
  newStatus      : String
  reason         : String
  changedBy      : String (userId or "system")
  effectiveDate  : Date
  createdAt      : Date (IMMUTABLE)
```

---

### 2. Financial Products

#### Cards (`CardsModel.ts`)

Manages virtual and physical card lifecycles, spending categories, and transaction controls.

```
Collection: Cards
Key Fields:
  user          : ObjectId → Users
  wallet        : ObjectId → Wallets
  cardNumber    : String (tokenized — last 4 stored)
  cardType      : "debit" | "credit" | "virtual" | "prepaid"
  network       : "visa" | "mastercard" | "verve"
  status        : "active" | "blocked" | "expired" | "cancelled"
  spendingLimits: { daily, monthly, perTransaction, perCategory }
  controls      : { onlinePayments, internationalPayments, atm, pos }
  expiryDate    : Date
  cvvHash       : String (hashed — never stored in plain text)
```

#### Loans (`LoansModel.ts`)

Full loan lifecycle from application through amortization schedule and final settlement.

```
Collection: Loans
Key Fields:
  user              : ObjectId → Users
  wallet            : ObjectId → Wallets
  loanType          : "personal" | "business" | "mortgage" | "auto"
  principalAmount   : Number
  interestRate      : Number (annual %)
  termMonths        : Number
  status            : "pending" | "approved" | "active" | "completed" | "defaulted" | "rejected"
  amortizationSchedule : Array<{ month, payment, principal, interest, balance }>
  disbursedAt       : Date
  nextPaymentDate   : Date
  outstandingBalance: Number
  creditScore       : Number
```

The `amortizationSchedule` is computed at approval time using the standard loan payment formula and stored. This prevents recalculation and provides a deterministic schedule the user can audit.

#### Investments (`InvestmentsModel.ts`)

Savings goals and investment portfolio management.

```
Collection: Investments
Key Fields:
  user           : ObjectId → Users
  wallet         : ObjectId → Wallets
  type           : "savings_goal" | "fixed_deposit" | "mutual_fund" | "stock"
  status         : "active" | "matured" | "withdrawn" | "cancelled"
  principal      : Number
  currentValue   : Number
  targetAmount   : Number (for savings goals)
  targetDate     : Date
  interestRate   : Number
  returns        : Number (accrued)
  maturityDate   : Date
```

---

### 3. Security & Fraud Models (`FraudSecurityModel.ts`)

#### FraudSignals

Real-time fraud detection alerts. Created by the fraud detection engine.

```
Collection: FraudSignals
Key Fields:
  user         : ObjectId → Users
  transaction  : ObjectId → Transactions (optional)
  signalType   : "velocity" | "location" | "device" | "behavior" | "amount" | "pattern" | "blacklist"
  severity     : "low" | "medium" | "high" | "critical"
  riskScore    : Number (0–100)
  status       : "open" | "investigating" | "resolved" | "false_positive"
  description  : String
  metadata     : Mixed (signal-specific context)
```

#### VelocityRules

Configurable rules engine for transaction velocity thresholds:

```
Collection: VelocityRules
Key Fields:
  name          : String
  ruleType      : "transaction_count" | "amount" | "login_attempt"
  timeWindowMs  : Number  — window size in milliseconds
  threshold     : Number  — max allowed in window
  severity      : "low" | "medium" | "high" | "critical"
  action        : "flag" | "block" | "challenge"
  isActive      : Boolean
```

#### BehaviorProfiles

User behavior baseline for anomaly detection. Updated continuously on new activity.

```
Collection: BehaviorProfiles
Key Fields:
  user                   : ObjectId → Users (unique)
  avgTransactionAmount   : Number
  typicalTransactionHours: Number[] (e.g., [9, 10, 11, 14, 15])
  typicalDaysOfWeek      : Number[] (e.g., [1, 2, 3, 4, 5])
  commonMerchants        : String[]
  commonIpRanges         : String[]
  knownDeviceIds         : String[]
  transactionCount30d    : Number
  lastUpdated            : Date
```

#### SecurityEvents

Audit log for authentication and security-relevant events:

```
Collection: SecurityEvents
Key Fields:
  user        : ObjectId → Users
  eventType   : "login_success" | "login_failed" | "password_changed"
               | "2fa_enabled" | "2fa_disabled" | "device_trusted"
               | "session_revoked" | "account_locked"
  ipAddress   : String
  deviceId    : String
  userAgent   : String
  metadata    : Mixed
  createdAt   : Date (immutable)
```

---

### 4. Administration Models (`AdminModel.ts`)

#### AdminUsers

Separate collection for platform staff — not the `Users` collection.

```
Collection: AdminUsers
Key Fields:
  email      : String (unique)
  password   : String (bcrypt hashed)
  role       : "admin" | "super_admin" | "compliance_officer" | "support_agent" | "analyst"
  permissions: ObjectId[] → AdminPermissions
  isActive   : Boolean
  lastLogin  : Date
```

#### AdminPermissions

Granular permission matrix beyond role:

```
Collection: AdminPermissions
Key Fields:
  name        : String (unique) — e.g., "transactions:approve"
  resource    : String
  action      : "read" | "write" | "delete" | "approve"
  description : String
```

#### AdminActionLogs

Complete audit trail of every admin operation with before/after state:

```
Collection: AdminActionLogs
Key Fields:
  admin      : ObjectId → AdminUsers
  action     : String  — e.g., "kyc.approve", "wallet.freeze"
  targetUser : ObjectId → Users
  targetModel: String
  targetId   : ObjectId
  before     : Mixed  — snapshot before change
  after      : Mixed  — snapshot after change
  ipAddress  : String
  createdAt  : Date (immutable)
```

---

### 5. Integration Models (`IntergrationsModel.ts`)

#### BankIntegrations

```
Collection: BankIntegrations
Key Fields:
  name          : String
  type          : "core_banking" | "sponsor_bank" | "partner_bank" | "correspondent"
  apiBaseUrl    : String
  credentials   : Mixed (encrypted at rest)
  status        : "active" | "inactive" | "suspended"
  supportedCurrencies : String[]
  webhookUrl    : String
```

#### PaymentGateways

```
Collection: PaymentGateways
Key Fields:
  name      : String  — e.g., "Stripe", "Flutterwave", "Paystack"
  type      : "card" | "bank_transfer" | "mobile_money" | "crypto"
  apiKey    : String (encrypted)
  status    : "active" | "inactive"
  supportedCountries : String[]
  feeStructure : { percentage, fixed, currency }
```

#### WebhookSubscriptions

```
Collection: WebhookSubscriptions
Key Fields:
  url          : String
  events       : String[]  — subscribed event types
  secret       : String    — HMAC signing secret
  isActive     : Boolean
  failureCount : Number
  lastDelivery : Date
```

---

## Ledger Engine

The `LedgerEngine` class (`ledger/ledger-engine.ts`) is the single point of entry for all balance mutations. No code outside this class should modify wallet balances directly.

### Double-Entry Posting

```typescript
LedgerEngine.post(pair: DebitCreditPair): Promise<PostingResult>
```

Execution flow:
1. **Idempotency check** — if `idempotencyKey` matches an existing `referenceNumber`, return the existing result
2. **Distributed lock** — acquire Redis lock on `ledger:{debitWalletId}:{creditWalletId}`
3. **MongoDB session** — `startSession()`, `startTransaction()` for ACID guarantees
4. Verify both wallets exist, are active, hold the requested currency
5. Check `AccountLimits` for all applicable limit types
6. Verify `availableBalance >= amount` on debit wallet
7. Create `LedgerEntry(debit)` with running balance
8. Create `LedgerEntry(credit)` with running balance
9. Update `AccountBalances.availableBalance` on both wallets
10. Create `Transaction` record
11. Update `AccountLimits.usedAmount`
12. `commitTransaction()` — all-or-nothing
13. Release Redis lock
14. Publish `nordi.transaction.completed` to Kafka

### Journal Service

`ledger/journal.ts` provides accounting reports without modifying data:

- `Journal.dailySummary(date)` — verifies debits == credits for the day (trial balance check)
- `Journal.trialBalance(asOf)` — cumulative balance per wallet/currency
- `Journal.accountStatement(walletId, currency, from, to)` — bank statement format with running balance

### Reconciliation

`ledger/reconciliation.ts` handles:
- Cross-checking `AccountBalances.ledgerBalance` against sum of `LedgerEntries`
- Detecting orphaned entries (entries without matching transactions)
- Generating reconciliation reports for compliance

---

## Financial Algorithms (`core/algo/financial/`)

| Function | Formula | Use |
|----------|---------|-----|
| `compoundInterest(P, r, n, t)` | A = P(1 + r/n)^(nt) | Savings goal projections |
| `loanPayment(P, r, n)` | M = P[r(1+r)^n]/[(1+r)^n-1] | Monthly payment calculation |
| `amortizationSchedule(P, r, n)` | Per-period breakdown | Loan approval schedule |
| `tieredFee(amount, tiers)` | Progressive bracketing | Transaction fee calculation |
| `presentValue(FV, r, n)` | PV = FV/(1+r)^n | Discounted cash flow |
| `irr(cashFlows)` | Newton-Raphson iteration | Internal rate of return |

Currency conversion utilities are in `core/algo/financial/currency.ts`.

---

## Data Structures (`core/algo/structures/`)

Custom data structures implemented for performance-critical paths:

| Structure | File | Use Case |
|-----------|------|----------|
| `BloomFilter` | `bloom-filter.ts` | AML blacklist lookup, duplicate detection |
| `LRUCache` | `lru-cache.ts` | In-process hot data cache |
| `PriorityQueue` | `priority-queue.ts` | Fraud signal prioritization |
| `SlidingWindow` | `sliding-window.ts` | Rate limit counters |
| `Trie` | `trie.ts` | Currency code / country code prefix search |

The `BloomFilter` uses FNV-1a double hashing with configurable false positive rate (default 1%). It is used to check whether a wallet number or account number is in a known-bad set before executing a more expensive database query.

---

## Query Performance

MongoDB indexes are managed via `scripts/create-indexes.ts` and verified via `scripts/verify-query-performance.ts`. Key index patterns:

- Text search on Users (email, firstName, lastName, mobileNumber) for admin search
- Compound index on Transactions (initiatedBy + createdAt) for paginated history
- Compound index on LedgerEntries (wallet + createdAt) for account statements
- Unique index on referenceNumber for idempotency enforcement

`MAX_PAGE_SIZE: 100` is a hard limit enforced at the controller layer — no unbounded queries are permitted.
