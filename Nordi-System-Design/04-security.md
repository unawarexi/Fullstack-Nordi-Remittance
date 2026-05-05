# Nordi Remittance — Security Model

## Security Architecture Philosophy

The security model follows a defense-in-depth approach. No single control is load-bearing — each layer assumes the previous one may fail. This is especially important in a financial system where the cost of a breach is not just data loss but regulatory penalties, financial fraud, and reputational damage.

---

## Authentication

### Token Strategy

The system uses a dual-token pattern:

| Token | Expiry | Storage | Purpose |
|-------|--------|---------|---------|
| Access Token (JWT) | 15 minutes | Memory (Authorization header) or httpOnly cookie | Request authentication |
| Refresh Token (JWT) | 7 days | httpOnly cookie or secure storage | Access token renewal |
| Verification Token | 1 hour | Redis (single-use) | Email verification, password reset |

**Access token payload:**
```typescript
{
  userId: string,
  email: string,
  role: UserRole,
  sessionId: string,
  deviceId: string,
  iat: number,
  exp: number,
  iss: string  // JWT_ISSUER from config
}
```

The `sessionId` is critical — it allows server-side session invalidation even before the JWT expires. If a session is revoked (device stolen, admin action), the next request with that `sessionId` fails.

### Multi-Factor Authentication (2FA)

TOTP-based 2FA compatible with Google Authenticator, Authy, and any RFC 6238 compliant app:

```
Setup flow:
  1. POST /security/2fa/setup → generate secret, return QR code (base64 PNG)
  2. User scans QR code in authenticator app
  3. POST /security/2fa/verify → submit 6-digit TOTP to confirm setup
  4. Server: speakeasy.verify(token, secret, window=1)
  5. Generate 8 backup codes (stored as bcrypt hashes)
  6. 2FA marked active on user record

Login flow (when 2FA enabled):
  1. POST /auth/login → valid credentials → return { requires2FA: true, tempToken }
  2. POST /auth/2fa/verify → TOTP code + tempToken → full access token
```

### Session Management

Each authentication event creates a session record on the User document:

```typescript
activeSessions: [{
  sessionId: string,   // UUID
  deviceId: string,    // derived from user-agent hash
  deviceName: string,
  ipAddress: string,
  userAgent: string,
  createdAt: Date,
  lastActiveAt: Date,
  isActive: boolean
}]
```

Features:
- **Multi-device support**: Sessions are per-device, not per-user
- **Session listing**: Users can view all active sessions
- **Remote revocation**: Users and admins can terminate any specific session
- **Trusted devices**: Devices can be marked trusted to skip 2FA

### Login Protection

```
Max failed attempts: 5
Lockout duration: 30 minutes
Post-lockout: SecurityEvent logged, email alert sent
Admin unlock: Available via admin panel
```

---

## Authorization

### Role-Based Access Control (RBAC)

Six roles with escalating privileges:

| Role | Description |
|------|-------------|
| `user` | Standard platform user |
| `admin` | Platform administrator |
| `super_admin` | Full system access |
| `compliance_officer` | KYC/AML review, report access |
| `support_agent` | Read-only user data, basic actions |
| `analyst` | Statistics and reporting only |

### Middleware Enforcement

```typescript
// Route-level authorization
router.get('/admin/users', authenticate, authorize(['admin', 'super_admin']), handler)

// KYC enforcement
router.post('/transactions/transfer', authenticate, requireKyc('approved'), handler)
```

The `authorize()` middleware checks `req.user.role` against the allowed roles array. The `requireKyc()` middleware fetches the user's current KYC status from the database (not the token — to capture real-time status changes).

### Admin Permission System

Beyond role, admins can have granular permissions (`AdminPermissions` collection):

```
Format: resource:action
Examples:
  transactions:approve
  wallets:freeze
  kyc:review
  loans:approve
  users:read
```

This allows creating restricted admin accounts (e.g., a `support_agent` with `users:read` but not `users:write`).

---

## KYC/AML System

### KYC Lifecycle

```
User registers → kycStatus: "pending"
  ↓
User uploads documents (government ID, proof of address)
  ↓
kycStatus: "in_review"
  ↓
Compliance officer reviews
  ├── Approve → kycStatus: "approved", kycApprovedAt: Date
  └── Reject  → kycStatus: "rejected", kycRejectionReason: String
                 Email notification sent to user
  ↓
User may resubmit → back to "in_review"
```

### KYC-Gated Operations

```
Unverified users (pending/rejected):
  - dailyTransfer: $500
  - perTransaction: $200
  - monthlyWithdrawal: $1,000

Verified users (approved):
  - dailyTransfer: $50,000
  - perTransaction: $25,000
  - monthlyWithdrawal: $50,000
```

The `requireKyc()` middleware enforces these gates at the route level before any controller logic runs.

### AML Screening

AML screening operates at two points:
1. **Pre-transaction**: FraudDetectionEngine evaluates transaction risk before `LedgerEngine.post()`
2. **Jurisdiction check**: High-risk countries (FATF grey/blacklist) trigger automatic escalation

High-risk jurisdictions include: Iran, North Korea, Myanmar, Syria, Yemen, Afghanistan, Pakistan, Libya, Iraq, Venezuela, Sudan, Somalia (and others per FATF list).

---

## Fraud Detection System

### Detection Engine (`core/algo/fraud-detection.ts`)

The fraud detection engine runs synchronously before every transaction posting. It evaluates 7 signal types and returns a composite risk score (0–100).

**Signal weights:**

| Signal | Weight |
|--------|--------|
| Blacklist | 30 |
| Velocity | 20 |
| Amount | 20 |
| Behavior | 15 |
| Location | 15 |
| Device | 12 |
| Pattern | 10 |

**Risk thresholds and actions:**

| Score Range | Action |
|-------------|--------|
| 0–49 | Allow |
| 50–69 | Challenge (require OTP) |
| 70–89 | Review (flag for human review) |
| 90–100 | Block |

### Velocity Engine (`core/algo/velocity-engine.ts`)

Sliding window rate checks implemented with in-memory storage (Redis-backed in multi-instance mode). Each velocity rule defines:
- `key`: unique rule identifier
- `maxCount`: maximum transaction count in window
- `maxAmount`: maximum aggregate amount in window
- `windowSeconds`: window duration

Example rules: max 10 transactions in 1 hour, max $5,000 in 24 hours.

### Risk Scoring Engine (`core/algo/risk-scoring.ts`)

Multi-factor risk scoring with weighted factors (must sum to 1.0):

| Factor | Weight | What It Measures |
|--------|--------|------------------|
| amountDeviation | 0.18 | How far amount deviates from user's mean |
| recipientRisk | 0.15 | New recipient, high-risk jurisdiction |
| kycLevel | 0.12 | Verification status |
| velocityRisk | 0.12 | Transaction rate against history |
| accountMaturity | 0.10 | Age of account (new accounts = higher risk) |
| channelRisk | 0.10 | API/branch vs web/mobile risk |
| deviceRisk | 0.10 | New/unknown device |
| internationalRisk | 0.08 | Cross-border flag |
| temporalRisk | 0.05 | Unusual hour of day |

**Output tiers:**

| Tier | Score | Required Action |
|------|-------|-----------------|
| minimal | 0–20 | none |
| low | 21–40 | monitor |
| elevated | 41–60 | challenge |
| high | 61–80 | manual_review |
| severe | 81–100 | block |

### Anomaly Detection (`core/algo/anomaly-detection.ts`)

Statistical anomaly detection using **Modified Z-Score** (more robust than standard Z-score against outliers):

```
Modified Z-Score = 0.6745 × |value - median| / MAD

Where MAD = Median Absolute Deviation of the population.
Threshold: 3.5 (configurable)
Minimum population: 5 data points before flagging
```

Also implements time-series deviation detection for identifying unusual temporal patterns.

### ML-Assisted Fraud (`services/ml.service.ts`)

The `MLServiceClient` connects to the Python FastAPI ML microservice for probabilistic fraud prediction:

```
MLServiceClient.predictFraud({
  transaction_id, user_id, amount, currency,
  transaction_type, is_international,
  hour_of_day, day_of_week,
  user_account_age_days,
  user_transaction_count_30d,
  user_avg_transaction_amount
})

Returns:
  fraud_probability : number (0–1)
  is_fraudulent     : boolean
  risk_factors      : string[]
  confidence        : number
  model_version     : string
```

If the ML service is unavailable (timeout: 10s), the system falls back to the rule-based engine without blocking the transaction. The ML signal augments but does not replace the deterministic rule engine.

### Fraud Case Management

When signals are elevated, a `FraudCase` is created:

```
FraudCase:
  signals    : FraudSignal[] (linked evidence)
  status     : "open" | "investigating" | "escalated" | "resolved" | "closed"
  assignedTo : ObjectId → AdminUsers
  notes      : Array<{ author, content, timestamp }>
  timeline   : Array<{ action, actor, timestamp }>
  resolution : "confirmed_fraud" | "false_positive" | "inconclusive"
```

---

## Data Protection

### Encryption

| Data | Method |
|------|--------|
| Passwords | bcrypt with configurable rounds (default: 12) |
| 2FA secrets | AES-256-GCM, stored encrypted |
| API credentials | AES-256-GCM |
| Card CVV | bcrypt (one-way) |
| PII at rest | AES-256-GCM via `crypto.helper.ts` |

AES-256-GCM provides authenticated encryption — tampering with the ciphertext will cause decryption to fail rather than silently returning corrupted plaintext.

### Transport Security

- All HTTP traffic redirected to HTTPS at Nginx level
- TLS 1.2 minimum, TLS 1.3 preferred
- HSTS header enforced via Helmet middleware
- WebSocket connections over WSS only

### Security Headers (Helmet)

```
Content-Security-Policy: default-src 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-XSS-Protection: 1; mode=block
```

### Input Validation

- Request body validation at controller entry points
- `validateTransactionData()` enforces MIN/MAX amount bounds ($0.01 – $1,000,000)
- `isValidCurrency()` checks against the supported currency allowlist (9 currencies)
- SQL/NoSQL injection prevention via Mongoose schema typing
- XSS prevention via response sanitization

---

## Rate Limiting

Redis-backed rate limiting with per-endpoint presets:

| Preset | Window | Max Requests | Applies To |
|--------|--------|--------------|------------|
| API | 15 min | 100 | General API |
| AUTH | 60 min | 20 | Auth endpoints |
| LOGIN | 15 min | 5 | Login specifically |
| PAYMENT | 10 min | 5 | Payment endpoints |
| UPLOAD | 30 min | 10 | File uploads |

When exceeded, returns `429 Too Many Requests` with `Retry-After` header.

---

## Audit Trail

Every significant operation produces an audit record. There are two audit systems:

**1. AuditModels (system-wide)**
Covers all model mutations — who changed what, when, from what IP.

**2. AdminActionLogs (admin-specific)**
Covers every admin operation with full before/after state snapshots. This is a regulatory requirement — a compliance officer must be able to reconstruct any admin action.

**3. SecurityEvents (auth-specific)**
Covers every authentication event — login success/failure, 2FA events, device trust, session revocation, account lockout.

All three collections use immutable `createdAt` timestamps (no `updatedAt`). Records in these collections are never updated or deleted through application code.
