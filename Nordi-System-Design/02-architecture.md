# Nordi Remittance — Architecture

## Application Layer Structure

The backend follows a layered architecture with strict separation between transport, domain, and persistence concerns:

```
index.ts                    ← Server bootstrap, DI wiring, graceful shutdown
├── middleware/             ← Cross-cutting concerns (security, auth, logging)
├── routes/                 ← HTTP routing only — no business logic
├── controllers/            ← Request parsing, orchestration, response shaping
├── services/               ← Infrastructure integrations (Redis, Kafka, Websocket)
├── core/                   ← Domain logic — algorithms, helpers, errors
├── models/                 ← Mongoose schemas and data access
├── ledger/                 ← Double-entry accounting engine
├── ai-agent/               ← LangGraph AI assistant
└── config/                 ← Environment, DB, constants
```

---

## Middleware Execution Pipeline

Every HTTP request traverses the following middleware chain in order. Each layer is a gate — failure at any stage terminates the request with a structured error response.

```
Request
  │
  ▼
[1] security.middleware
    ├── helmetMiddleware     — Security headers (CSP, HSTS, X-Frame-Options)
    ├── corsMiddleware       — Origin validation against CORS_ORIGINS config
    └── ipBlockingMiddleware — Blocked IP list check

  ▼
[2] core.middleware
    ├── requestIdMiddleware  — Assign UUID to every request (X-Request-ID)
    ├── clientIpMiddleware   — Resolve real IP behind proxies
    ├── deviceInfoMiddleware — Parse device metadata (user-agent, platform)
    ├── compression          — gzip/br response compression
    ├── cookieParser         — Cookie extraction
    └── requestLoggingMiddleware — Structured request/response logging

  ▼
[3] Route-level middleware (per route group)
    ├── authenticate()       — JWT verification, user/admin resolution
    ├── authorize(roles)     — Role-based access gate
    ├── requireKyc()         — KYC status enforcement
    ├── rateLimiter(preset)  — Per-endpoint rate limiting (Redis-backed)
    └── validateTransaction  — Amount/currency boundary checks

  ▼
[4] Controller
    └── Business logic, DB queries, service calls, response dispatch

  ▼
[5] error.middleware
    └── AppError → structured JSON error response
        notFoundHandler → 404 for unmatched routes
```

---

## Controller Layer

Controllers are thin orchestration layers. They:
1. Extract and validate input from `req.body`, `req.params`, `req.query`
2. Call model queries or service methods
3. Emit WebSocket events where state changes affect connected clients
4. Publish Kafka messages for async downstream processing
5. Return a structured response via `response.helper.ts`

Controllers do not contain raw MongoDB queries — those are in models or inline aggregation pipelines. They do not contain business rule logic — that lives in `core/`.

**Controller inventory:**

| Controller | Domain |
|------------|--------|
| `Auth.controller.ts` | Registration, login, token refresh, 2FA setup/verify |
| `Users.controller.ts` | Profile, address, employment, bank accounts |
| `Accounts.controller.ts` | Wallets, balances, beneficiaries, limits |
| `Transaction.controller.ts` | Deposits, withdrawals, transfers, history |
| `TransferVerification.controller.ts` | 3-step secure transfer (initiate → OTP → confirm) |
| `Card.controller.ts` | Card issuance, activation, limits, controls |
| `Loans.controller.ts` | Applications, amortization, disbursement, repayment |
| `Investment.controller.ts` | Savings goals, portfolios, asset operations |
| `Kyc.controller.ts` | Document upload, status, admin review |
| `Admin.controller.ts` | User management, dashboard stats |
| `AdminOperations.controller.ts` | Wallet credits/debits, transaction approval |
| `Fraud.controller.ts` | Signal management, case workflow, rule engine |
| `Security.controller.ts` | 2FA, sessions, trusted devices |
| `Notification.controller.ts` | Preferences, notification history |
| `Permission.controller.ts` | RBAC management |
| `Statistics.controller.ts` | Analytics, reports |
| `Legal.controller.ts` | Terms, consent records, disputes |
| `Integration.controller.ts` | Bank integrations, payment gateways, webhooks |
| `Attachment.controller.ts` | File uploads via Cloudinary |
| `AiAgent.controller.ts` | LangGraph agent chat interface |

---

## Transaction Request Lifecycle

This is the most critical path in the system. It illustrates how all layers interact.

```
POST /api/v1/transactions/transfer
│
├── [Auth] JWT → extract userId, role, sessionId
├── [Auth] Verify account not suspended/frozen
├── [KYC] kycStatus === 'approved' || reject with E3005
├── [RateLimit] PAYMENT preset: 5 requests / 10 min
│
├── Controller: TransactionController.createTransfer()
│   ├── Parse: amount, currency, recipientWalletNumber
│   ├── Validate: isValidAmount(), isValidCurrency()
│   │
│   ├── [Fraud Pre-check] FraudDetectionEngine.evaluate(context)
│   │   ├── Check velocity rules (sliding window)
│   │   ├── Check behavior profile deviation
│   │   ├── Check amount anomaly (Z-score)
│   │   ├── Check jurisdiction risk (FATF country list)
│   │   └── riskScore > 70 → block; 50–70 → challenge; < 50 → allow
│   │
│   ├── [ML Pre-check] MLServiceClient.predictFraud() (async, timeout 10s)
│   │   └── Returns fraud_probability, risk_factors (fallback: skip)
│   │
│   ├── LedgerEngine.post(debitCreditPair)
│   │   ├── Idempotency key check (duplicate reference → skip)
│   │   ├── Acquire distributed Redis lock (key: ledger:{debitWallet}:{creditWallet})
│   │   ├── MongoDB session START (ACID transaction)
│   │   │   ├── Verify sender wallet exists, active, correct currency
│   │   │   ├── Check AccountLimits (daily/monthly/perTransaction)
│   │   │   ├── Verify sufficient availableBalance
│   │   │   ├── Debit sender: availableBalance -= amount, create LedgerEntry(debit)
│   │   │   ├── Credit recipient: availableBalance += amount, create LedgerEntry(credit)
│   │   │   ├── Create Transaction record (status: completed)
│   │   │   └── Update AccountLimits.usedAmount
│   │   ├── MongoDB session COMMIT
│   │   └── Release Redis lock
│   │
│   ├── Kafka.publish('nordi.transaction.completed', event envelope)
│   │
│   ├── WebSocket.emit(userId, 'transaction:completed', payload)
│   ├── WebSocket.emit(recipientId, 'transaction:received', payload)
│   │
│   ├── Redis: invalidateTransactionCache(userId)
│   │
│   └── BullMQ.email: enqueue transaction receipt email
│
└── Response 200: { success: true, data: { transactionId, referenceNumber } }
```

---

## Secure Transfer Verification (3-Step Flow)

For high-value transfers above the risk threshold, the system implements a 3-step verification flow:

```
Step 1: POST /transactions/secure-transfer/initiate
  → Validate amount, recipient
  → Store transfer intent in Redis (TTL: 10 min)
  → Generate OTP, email/SMS to user
  → Return: { sessionToken, expiresAt }

Step 2: POST /transactions/secure-transfer/verify
  → Validate OTP against stored intent
  → Mark session as verified in Redis
  → Return: { confirmed: true, transferToken }

Step 3: POST /transactions/secure-transfer/confirm
  → Validate transferToken (single-use)
  → Execute LedgerEngine.post()
  → Clear intent from Redis
  → Emit events, enqueue notifications
```

This mirrors the 3DS (3-D Secure) authorization model used in card payments.

---

## Real-Time Layer (WebSocket)

Socket.IO manages bidirectional real-time communication. The authentication flow for WebSocket connections:

```
Client connects → io.use(authMiddleware)
  → Extract JWT from handshake.auth.token
  → Verify token → attach userId to socket
  → socket.join(`user:${userId}`)

Server emits events to user room:
  WebSocketService.emitToUser(userId, event, payload)
  → io.to(`user:${userId}`).emit(event, payload)
```

**Event categories and triggers:**

| Category | Events | Trigger |
|----------|--------|---------|
| AUTH | login_success, session_revoked, account_locked | Auth operations |
| ACCOUNT | wallet_created, balance_updated, beneficiary_added | Wallet mutations |
| TRANSACTION | created, completed, failed, reversed, received | Transaction state changes |
| CARD | created, activated, blocked, limits_updated | Card operations |
| KYC | document_uploaded, status_updated, document_reviewed | KYC workflow |
| FRAUD | signal_updated, case_created, case_updated | Fraud detection |
| LOANS | application_submitted, approved, disbursed | Loan lifecycle |
| INVESTMENTS | purchased, sold, returns_added, goal_reached | Investment operations |

---

## Event-Driven Architecture (Kafka)

Kafka serves as the system's event backbone for operations that must be decoupled from the request lifecycle.

**Topic structure:**

```
nordi.transaction.initiated    → Transaction created, pending processing
nordi.transaction.processed    → Processing started
nordi.transaction.completed    → Successfully posted to ledger
nordi.transaction.failed       → Failed at any stage
nordi.kyc.submitted            → New KYC documents uploaded
nordi.kyc.approved             → KYC approved by admin
nordi.kyc.rejected             → KYC rejected
nordi.security.fraud_alert     → High-risk signal detected
nordi.user.created             → New user registration
nordi.user.updated             → Profile changes
nordi.notifications.email      → Email dispatch requests
nordi.notifications.push       → Push notification dispatch
nordi.notifications.sms        → SMS dispatch requests
nordi.dlq                      → Dead letter queue (failed processing)
```

**Event envelope structure:**

```typescript
{
  eventId: string,          // UUID — deduplication key
  topic: KafkaTopic,
  timestamp: number,        // Unix ms
  source: string,           // service identifier
  payload: T,
  metadata?: Record<string, string>,
  retryCount?: number
}
```

All consumers perform idempotency checks against `eventId` before processing.

---

## Job Queue Layer (BullMQ)

BullMQ handles work that requires scheduling, retries, or decoupling from the request cycle but does not need the full Kafka durability model.

**Queues:**

| Queue | Jobs | Retry Policy |
|-------|------|--------------|
| `nordi-email` | Transaction receipts, KYC notifications, security alerts | 3 attempts, exponential backoff |
| `nordi-notification` | Push notifications | 3 attempts |
| `nordi-transaction` | Async transaction post-processing | 3 attempts |
| `nordi-kyc` | KYC document processing, OCR triggers | 3 attempts |
| `nordi-fraud` | Batch fraud analysis, rule evaluation | 3 attempts |
| `nordi-audit` | Audit log writes | 3 attempts |
| `nordi-cleanup` | Expired session cleanup, Redis key purging | 1 attempt |

Default job options: `removeOnComplete: { age: 3600, count: 1000 }`, `removeOnFail: { age: 86400, count: 5000 }`.

---

## Caching Strategy

The system uses a **cache-aside** pattern. Cache is populated on read, invalidated on write.

**Redis key patterns:**

| Key | TTL | Invalidation |
|-----|-----|--------------|
| `remit:user:wallets:{userId}` | 60s | On wallet mutation |
| `remit:transaction:{txId}` | 300s | On status change |
| `remit:user:transactions:{userId}` | 60s | On any transaction write |
| `remit:wallet:balance:{walletId}` | 60s | On balance update |
| `remit:account:{accountId}` | 120s | On account mutation |

**Distributed locking:**
Before any ledger posting, a Redis-backed distributed lock is acquired on the key `ledger:{debitWalletId}:{creditWalletId}`. This prevents race conditions in concurrent transfer scenarios. Lock TTL: 15s. Retries: 3 with 200ms delay.

---

## Error Handling Architecture

All errors are instances of `AppError` — a custom class hierarchy:

```
AppError (base)
├── Auth Errors
│   ├── UnauthorizedError        E1001
│   ├── InvalidCredentialsError  E1002
│   ├── TokenExpiredError        E1003
│   └── TokenInvalidError        E1004
├── Account Errors
│   ├── AccountLockedError       E1006
│   └── AccountSuspendedError    E1007
├── Validation Errors
│   ├── ValidationError          E2001
│   └── NotFoundError            E2003
├── User Errors
│   ├── UserAlreadyExistsError   E3002
│   └── KycNotVerifiedError      E3005
├── Financial Errors
│   ├── InsufficientBalanceError E4001
│   ├── TransactionLimitExceeded E4003
│   └── DuplicateTransactionError E4004
└── Wallet Errors
    ├── WalletNotFoundError      E5001
    ├── WalletSuspendedError     E5002
    └── WalletFrozenError        E5003
```

The global `errorHandler` middleware catches all `AppError` instances and shapes them into:

```json
{
  "success": false,
  "error": {
    "code": "E4001",
    "message": "Insufficient balance",
    "details": {}
  },
  "requestId": "uuid"
}
```

Non-AppError exceptions are logged as internal errors (E9001) and a generic 500 is returned — no stack traces leak to clients.
