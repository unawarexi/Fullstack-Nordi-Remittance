# Nordi Remittance — API Reference

## Base URL

```
Development : http://localhost:3000/api/v1
Production  : https://api.nordi-remittance.com/api/v1
```

## Authentication

All protected endpoints require a JWT access token in one of two places:
- `Authorization: Bearer <token>` header
- `access_token` httpOnly cookie

Refresh tokens are accepted at `POST /auth/refresh` to obtain a new access token.

## Standard Response Envelope

**Success:**
```json
{
  "success": true,
  "message": "Optional message",
  "data": { ... },
  "meta": { "page": 1, "limit": 20, "total": 150 }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "E4001",
    "message": "Insufficient balance",
    "details": {}
  },
  "requestId": "uuid-v4"
}
```

---

## Route Groups

### `/auth` — Authentication

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | No | Create user account |
| POST | `/auth/login` | No | Login, returns access + refresh tokens |
| POST | `/auth/refresh` | No | Refresh access token using refresh token |
| POST | `/auth/logout` | Yes | Invalidate current session |
| POST | `/auth/verify-email` | No | Verify email with token |
| POST | `/auth/forgot-password` | No | Send password reset email |
| POST | `/auth/reset-password` | No | Reset password with token |
| POST | `/auth/change-password` | Yes | Change password (authenticated) |
| POST | `/auth/2fa/verify` | Partial | Complete 2FA login step |

**Registration body:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "password": "string",
  "mobileNumber": "string",
  "country": "string"
}
```

**Login response (with 2FA disabled):**
```json
{
  "accessToken": "jwt",
  "refreshToken": "jwt",
  "user": { "userId", "email", "role", "kycStatus" }
}
```

**Login response (with 2FA enabled):**
```json
{
  "requires2FA": true,
  "tempToken": "short-lived-jwt"
}
```

---

### `/users` — User Profiles

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/users/profile` | Yes | Get current user profile |
| PATCH | `/users/profile` | Yes | Update profile (name, DOB, nationality) |
| PATCH | `/users/avatar` | Yes | Upload profile picture |
| GET | `/users/address` | Yes | Get address details |
| PATCH | `/users/address` | Yes | Update address |
| GET | `/users/employment` | Yes | Get employment info |
| PATCH | `/users/employment` | Yes | Update employment |
| GET | `/users/bank-accounts` | Yes | List linked bank accounts |
| POST | `/users/bank-accounts` | Yes | Add external bank account |
| PATCH | `/users/bank-accounts/:id` | Yes | Update bank account |
| POST | `/users/bank-accounts/:id/primary` | Yes | Set as primary |
| GET | `/users/preferences` | Yes | Notification preferences |
| PATCH | `/users/preferences` | Yes | Update preferences |
| GET | `/users/referrals` | Yes | Referral stats and referred users |
| DELETE | `/users/account` | Yes | Soft delete account |

---

### `/accounts` — Wallets & Balances

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/accounts/wallets` | Yes | List user wallets |
| GET | `/accounts/wallets/:id` | Yes | Get wallet detail |
| POST | `/accounts/wallets` | Yes | Create additional wallet |
| PATCH | `/accounts/wallets/:id` | Yes | Update wallet settings |
| POST | `/accounts/wallets/:id/close` | Yes | Close wallet |
| GET | `/accounts/wallets/:id/history` | Yes | Paginated ledger history |
| GET | `/accounts/limits` | Yes | KYC-based transaction limits |
| GET | `/accounts/summary` | Yes | Dashboard summary (balances, recent tx) |
| GET | `/accounts/beneficiaries` | Yes | List saved beneficiaries |
| POST | `/accounts/beneficiaries` | Yes | Add beneficiary |
| DELETE | `/accounts/beneficiaries/:id` | Yes | Remove beneficiary |
| GET | `/accounts/admin/wallets` | Admin | All wallets (paginated) |
| PATCH | `/accounts/admin/wallets/:id/status` | Admin | Freeze/unfreeze wallet |

**GET /accounts/summary response:**
```json
{
  "wallets": [...],
  "totalBalance": { "USD": 1500.00 },
  "recentTransactions": [...],
  "pendingTransactions": 2,
  "limits": { "daily": { "used": 200, "limit": 500 } }
}
```

---

### `/transactions` — Transactions

| Method | Path | Auth | KYC | Description |
|--------|------|------|-----|-------------|
| GET | `/transactions` | Yes | — | Transaction history (paginated) |
| GET | `/transactions/:id` | Yes | — | Transaction detail |
| POST | `/transactions/deposit` | Yes | Pending OK | Fund wallet from external source |
| POST | `/transactions/withdraw` | Yes | Approved | Withdraw to bank account |
| POST | `/transactions/transfer` | Yes | Approved | Internal wallet-to-wallet transfer |
| POST | `/transactions/payment` | Yes | Approved | Payment to merchant/service |
| PATCH | `/transactions/:id/cancel` | Yes | — | Cancel pending transaction |
| GET | `/transactions/admin/pending` | Admin | — | Pending transactions for approval |
| PATCH | `/transactions/admin/:id/approve` | Admin | — | Approve flagged transaction |
| PATCH | `/transactions/admin/:id/reject` | Admin | — | Reject flagged transaction |

**POST /transactions/transfer body:**
```json
{
  "recipientWalletNumber": "W123456789ABCD",
  "amount": 100.00,
  "currency": "USD",
  "description": "Optional note",
  "idempotencyKey": "optional-unique-key"
}
```

---

### `/transactions/secure-transfer` — Verified Transfers

3-step flow for high-value or risk-flagged transfers.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/transactions/secure-transfer/initiate` | Yes | Start transfer, send OTP |
| POST | `/transactions/secure-transfer/verify` | Yes | Verify OTP |
| POST | `/transactions/secure-transfer/confirm` | Yes | Execute verified transfer |

---

### `/cards` — Card Management

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/cards` | Yes | List user cards |
| GET | `/cards/:id` | Yes | Card detail |
| POST | `/cards` | Yes | Issue virtual card |
| POST | `/cards/:id/activate` | Yes | Activate physical card |
| PATCH | `/cards/:id/block` | Yes | Block card |
| PATCH | `/cards/:id/unblock` | Yes | Unblock card |
| PATCH | `/cards/:id/limits` | Yes | Update spending limits |
| PATCH | `/cards/:id/controls` | Yes | Toggle card controls |
| DELETE | `/cards/:id` | Yes | Cancel card |

**Card controls payload:**
```json
{
  "onlinePayments": true,
  "internationalPayments": false,
  "atm": true,
  "pos": true
}
```

---

### `/loans` — Loan Management

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/loans` | Yes | User loan list |
| GET | `/loans/:id` | Yes | Loan detail with amortization schedule |
| POST | `/loans/apply` | Yes | Submit loan application |
| POST | `/loans/:id/payment` | Yes | Make a loan repayment |
| GET | `/loans/admin/pending` | Admin | Pending loan applications |
| PATCH | `/loans/admin/:id/approve` | Admin | Approve and disburse loan |
| PATCH | `/loans/admin/:id/reject` | Admin | Reject application |

**Loan application body:**
```json
{
  "loanType": "personal",
  "amount": 5000,
  "currency": "USD",
  "termMonths": 24,
  "purpose": "Home improvement"
}
```

---

### `/investments` — Investment & Savings

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/investments` | Yes | List investment accounts |
| GET | `/investments/:id` | Yes | Investment detail |
| POST | `/investments/savings-goal` | Yes | Create savings goal |
| POST | `/investments/fixed-deposit` | Yes | Open fixed deposit |
| POST | `/investments/:id/deposit` | Yes | Add funds to investment |
| POST | `/investments/:id/withdraw` | Yes | Withdraw from investment |

---

### `/kyc` — KYC Verification

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/kyc/status` | Yes | Current KYC status |
| GET | `/kyc/requirements` | Yes | Required documents by KYC tier |
| GET | `/kyc/documents` | Yes | Uploaded documents |
| POST | `/kyc/documents` | Yes | Upload KYC document |
| DELETE | `/kyc/documents/:id` | Yes | Delete unreviewed document |
| GET | `/kyc/admin/pending` | Admin | Pending KYC reviews (paginated) |
| GET | `/kyc/admin/users/:userId` | Admin | Full KYC data for a user |
| PATCH | `/kyc/admin/users/:userId/review` | Admin | Approve or reject KYC |
| GET | `/kyc/admin/stats` | Admin | KYC statistics |

**Admin KYC review body:**
```json
{
  "decision": "approved" | "rejected",
  "reason": "Optional rejection reason"
}
```

---

### `/admin` — Admin Operations

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/admin/dashboard` | Admin | Dashboard statistics |
| GET | `/admin/analytics` | Admin | Platform analytics |
| GET | `/admin/users/search` | Admin | Search users (paginated, filterable) |
| GET | `/admin/users/:userId` | Admin | Full user detail |
| PATCH | `/admin/users/:userId/status` | Admin | Change user status |
| POST | `/admin/users/:userId/reset-password` | Admin | Force password reset |
| GET | `/admin/users/admins` | SuperAdmin | List admin users |
| POST | `/admin/users/admins` | SuperAdmin | Create admin user |
| PATCH | `/admin/users/admins/:adminId` | SuperAdmin | Update admin user |
| DELETE | `/admin/users/admins/:adminId` | SuperAdmin | Deactivate admin |

---

### `/admin/operations` — Financial Operations

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/admin/operations/credit` | Admin | Credit user wallet |
| POST | `/admin/operations/debit` | Admin | Debit user wallet |
| POST | `/admin/operations/transfer` | Admin | Admin-initiated transfer |
| GET | `/admin/operations/pending-transactions` | Admin | Pending transaction queue |
| PATCH | `/admin/operations/transactions/:id/approve` | Admin | Approve transaction |
| PATCH | `/admin/operations/transactions/:id/reject` | Admin | Reject transaction |
| GET | `/admin/operations/loans/pending` | Admin | Pending loan applications |
| PATCH | `/admin/operations/loans/:id/approve` | Admin | Approve + disburse loan |
| PATCH | `/admin/operations/loans/:id/reject` | Admin | Reject loan |

---

### `/fraud` — Fraud Management

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/fraud/signals` | Admin | All fraud signals (filterable) |
| GET | `/fraud/signals/:id` | Admin | Signal detail |
| PATCH | `/fraud/signals/:id/status` | Admin | Update signal status |
| GET | `/fraud/cases` | Admin | Fraud investigation cases |
| GET | `/fraud/cases/:id` | Admin | Case detail with timeline |
| POST | `/fraud/cases` | Admin | Open new case |
| PATCH | `/fraud/cases/:id` | Admin | Update case status/notes |
| GET | `/fraud/rules` | Admin | Velocity rules |
| POST | `/fraud/rules` | SuperAdmin | Create rule |
| PATCH | `/fraud/rules/:id` | SuperAdmin | Update rule |
| DELETE | `/fraud/rules/:id` | SuperAdmin | Delete rule |

---

### `/security` — Security Settings

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/security/sessions` | Yes | Active sessions list |
| DELETE | `/security/sessions/:sessionId` | Yes | Revoke specific session |
| DELETE | `/security/sessions` | Yes | Revoke all sessions (except current) |
| GET | `/security/devices` | Yes | Trusted devices |
| POST | `/security/devices/:deviceId/trust` | Yes | Add trusted device |
| DELETE | `/security/devices/:deviceId` | Yes | Remove trusted device |
| POST | `/security/2fa/setup` | Yes | Begin 2FA setup, get QR code |
| POST | `/security/2fa/verify` | Yes | Confirm 2FA setup |
| DELETE | `/security/2fa` | Yes | Disable 2FA |
| GET | `/security/events` | Yes | Security event log |

---

### `/notifications` — Notifications

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/notifications` | Yes | Notification history (paginated) |
| GET | `/notifications/unread-count` | Yes | Count of unread notifications |
| PATCH | `/notifications/:id/read` | Yes | Mark as read |
| PATCH | `/notifications/read-all` | Yes | Mark all as read |
| GET | `/notifications/preferences` | Yes | Notification preferences |
| PATCH | `/notifications/preferences` | Yes | Update preferences |

---

### `/statistics` — Analytics

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/statistics/dashboard` | Admin | Platform KPIs |
| GET | `/statistics/transactions` | Admin | Transaction analytics |
| GET | `/statistics/users` | Admin | User growth metrics |
| GET | `/statistics/revenue` | Admin | Fee/revenue reports |

---

### `/integrations` — External Integrations

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/integrations/banks` | Admin | Bank integrations |
| POST | `/integrations/banks` | SuperAdmin | Add bank integration |
| GET | `/integrations/gateways` | Admin | Payment gateways |
| POST | `/integrations/gateways` | SuperAdmin | Add payment gateway |
| GET | `/integrations/webhooks` | Admin | Webhook subscriptions |
| POST | `/integrations/webhooks` | Admin | Create webhook subscription |
| DELETE | `/integrations/webhooks/:id` | Admin | Remove webhook |
| GET | `/integrations/api-keys` | Admin | API key management |
| POST | `/integrations/api-keys` | Admin | Generate API key |
| DELETE | `/integrations/api-keys/:id` | Admin | Revoke API key |

---

### `/legal` — Legal & Compliance

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/legal/terms` | No | Current terms of service |
| POST | `/legal/consent` | Yes | Record user consent |
| GET | `/legal/disputes` | Yes | User disputes |
| POST | `/legal/disputes` | Yes | Open dispute |
| GET | `/legal/reports` | Admin | Compliance reports |

---

### `/attachments` — File Management

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/attachments/upload` | Yes | Upload file to Cloudinary |
| GET | `/attachments/:id` | Yes | Get attachment metadata |
| DELETE | `/attachments/:id` | Yes | Delete attachment |

Files are stored in Cloudinary. Only metadata (URL, type, status, reviewStatus) is stored in MongoDB.

---

### `/ai-agent` — AI Banking Assistant

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/ai-agent/chat` | Yes | Send message to Nordi AI agent |
| GET | `/ai-agent/history` | Yes | Conversation history for session |
| DELETE | `/ai-agent/history` | Yes | Clear conversation context |

**Chat request:**
```json
{
  "message": "What is my current USD balance?",
  "sessionId": "optional-session-id"
}
```

**Chat response:**
```json
{
  "response": "Your current USD balance is $1,250.00. You have one pending transaction of $50.00.",
  "sessionId": "session-id",
  "decision": {
    "action": "approve",
    "confidence": 0.95,
    "riskLevel": "low"
  },
  "toolsUsed": ["get_account_balance"]
}
```

---

## Health Checks

```
GET /health
Response: { "status": "ok", "timestamp": "...", "uptime": 3600 }

GET /health/detailed
Response: {
  "status": "ok",
  "services": {
    "database": "connected",
    "redis": "connected",
    "kafka": "connected"
  },
  "version": "1.0.0"
}
```

---

## Error Codes Reference

| Code | HTTP | Meaning |
|------|------|---------|
| E1001 | 401 | Unauthorized |
| E1002 | 401 | Token expired |
| E1003 | 401 | Token invalid |
| E1006 | 403 | Account locked |
| E1007 | 403 | Account suspended |
| E2001 | 422 | Validation error |
| E2003 | 404 | Not found |
| E3002 | 409 | User already exists |
| E3005 | 403 | KYC not verified |
| E4001 | 402 | Insufficient balance |
| E4003 | 422 | Transaction limit exceeded |
| E4004 | 409 | Duplicate transaction |
| E5001 | 404 | Wallet not found |
| E5002 | 403 | Wallet suspended |
| E5003 | 403 | Wallet frozen |
| E8001 | 429 | Rate limit exceeded |
| E9001 | 500 | Internal server error |
| E9004 | 503 | Service unavailable |
