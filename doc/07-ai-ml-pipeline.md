# Nordi Remittance — AI/ML Pipeline

## Overview

The platform integrates two distinct AI/ML components:

1. **AI Banking Agent** (`ai-agent/`) — A stateful conversational assistant powered by LangGraph, capable of executing banking operations on behalf of users through a guarded tool-calling architecture.

2. **ML Microservice** (`Nordi-Machine-Learning/`) — A Python FastAPI service providing fraud prediction, risk scoring, and anomaly detection via trained statistical/ML models.

These two components are intentionally separate: the AI agent handles *intent* (natural language understanding + decision routing), while the ML service handles *inference* (probabilistic pattern recognition on transaction data).

---

## AI Agent Architecture (LangGraph)

### Graph Topology

The agent is implemented as a **stateful directed graph** using LangGraph (`@langchain/langgraph`):

```
START
  │
  ▼
[input_guard]
  │ (blocked if PII leakage, jailbreak attempt, or high-risk intent)
  ▼
[route_intent]
  │
  ├──→ [tool_execution]    ← for quantitative queries (balance, transactions)
  │         │
  │         ▼
  │    [output_guard]
  │         │
  │         ▼
  │        END
  │
  └──→ [direct_response]  ← for informational queries
            │
            ▼
       [output_guard]
            │
            ▼
           END

(any node) → [escalate] → END  ← if guardrails trigger at any point
```

### State Schema

Each graph execution maintains typed state via `Annotation.Root`:

```typescript
{
  messages       : AgentMessage[]   — conversation history
  toolCalls      : ToolCall[]       — pending tool executions
  toolResults    : ToolResult[]     — tool execution outputs
  currentProvider: LLMProvider      — active LLM backend
  retryCount     : number           — fallback retry counter
  userId         : string           — user context
  sessionId      : string           — conversation session
  context        : Record<string, unknown> — arbitrary context bag
  guardrailFlags : string[]         — triggered guardrail identifiers
  decision       : AgentDecision    — routing decision
  output         : string           — final response text
  status         : "running" | "completed" | "escalated" | "error"
}
```

### LLM Provider Management

The agent supports multi-provider failover via `providers/manager.ts`:

| Provider | Model | Priority |
|----------|-------|----------|
| OpenAI | GPT-4o | Primary |
| Anthropic | Claude 3.5 Sonnet | Fallback 1 |
| Google | Gemini 1.5 Pro | Fallback 2 |
| HuggingFace | Custom fine-tuned | Fallback 3 |

If the primary provider times out or returns an error, the manager automatically routes to the next in the fallback chain. This ensures availability even during LLM provider outages.

### Tool Registry (`tools/registry.ts`)

Banking tools available to the agent:

```typescript
Available tools (selected):
  get_account_balance    — fetch current wallet balances
  get_transaction_history — paginated transaction list
  get_account_statement   — ledger statement for a period
  assess_transaction_risk — run risk scoring engine
  get_user_info          — non-sensitive user profile data
  check_fraud_signals    — retrieve fraud signals for user
  get_exchange_rates     — current FX rates
  explain_fee_structure  — fee calculation for a transaction
  get_kyc_status         — user KYC status
  get_loan_details       — loan summary and schedule
```

Sensitive tools (e.g., execute_transfer, modify_wallet) require `requiresApproval: true` — the agent must present the action for user confirmation before execution.

### Guardrails System (`guardrails/`)

Dual guardrail pattern: input validation before LLM call, output validation after.

**Input Validator (`input-validator.ts`):**
- Detects PII in user messages (credit card numbers, SSNs, passwords)
- Detects prompt injection attempts
- Detects jailbreak patterns
- Validates against a financial compliance allowlist

**Output Validator (`output-validator.ts`):**
- Strips PII from LLM responses
- Validates that tool calls reference only allowed tools
- Checks that financial figures are reasonable (no hallucinated amounts)
- Ensures compliance-sensitive topics are flagged for human review

**Guardrail actions:**
- Violations route to the `escalate` node
- Escalated sessions are logged and optionally notified to the compliance team

### Agent Memory (`memory/agent-memory.ts`)

Session-scoped memory using a sliding window approach:
- Last N messages retained in context (configurable window size)
- User preferences and context persisted per `sessionId`
- Memory is purged after session TTL expires

### System Prompt (Hardcoded Rules)

Key agent behavioral constraints:

```
NEVER reveal full card numbers, SSNs, or raw passwords
NEVER approve transactions over $10,000 without flagging for human review
NEVER modify ledger entries directly — always use the ledger engine
NEVER provide specific investment/financial advice — only factual information
If uncertain about a transaction's legitimacy, ALWAYS escalate to human review
Always confirm transaction details with the user before executing
Respect KYC status — restrict operations for unverified users
```

These are not soft suggestions — they are hardcoded in the system prompt and enforced by the output guardrail layer.

---

## ML Microservice (Python FastAPI)

### Service Boundary

The ML service is a completely separate Python process (`Nordi-Machine-Learning/`), exposing a REST API at `ML_SERVICE_URL`. The Node.js backend communicates with it via `services/ml.service.ts`.

This separation exists because:
1. Python has a richer ML ecosystem (scikit-learn, PyTorch, pandas)
2. ML workloads benefit from independent horizontal scaling
3. Model updates can be deployed independently without touching the API

### Inference Endpoints

```
POST /api/v1/ml/fraud/predict
POST /api/v1/ml/risk/score
POST /api/v1/ml/anomaly/detect
GET  /api/v1/ml/health
```

### Fraud Prediction Pipeline

```
Input (from Node.js backend):
  transaction_id, user_id, amount, currency, type,
  is_international, hour_of_day, day_of_week,
  user_account_age_days, tx_count_30d, avg_amount_30d

  ↓
Feature Engineering:
  - Normalize amount by user's historical average
  - Encode transaction type (one-hot)
  - Temporal features (hour sin/cos, day sin/cos)
  - Derive velocity ratio

  ↓
Model Inference:
  - Primary: Gradient Boosting (XGBoost/LightGBM)
  - Secondary: Isolation Forest for anomaly score
  - Ensemble: weighted average

  ↓
Output:
  fraud_probability: 0.0–1.0
  is_fraudulent: boolean (threshold: 0.7)
  risk_factors: ["high_amount", "new_device", "unusual_hour"]
  confidence: 0.0–1.0
  model_version: "v1.2.3"
```

### Risk Scoring Pipeline

```
Input:
  user_id, amount, account_age, kyc_level,
  tx_count, avg_amount, is_international,
  recipient_country, is_new_device, is_new_ip,
  hour_of_day, failed_tx_24h

  ↓
Multi-factor weighted scoring (same factors as Node.js engine,
but implemented via trained regression model for accuracy)

  ↓
Output:
  risk_score: 0–100
  risk_tier: "minimal" | "low" | "elevated" | "high" | "severe"
  recommended_action: string
  factor_breakdown: { amount_deviation: 0.23, velocity: 0.15, ... }
```

### Anomaly Detection Pipeline

```
Input:
  user_id + recent transaction time series

  ↓
Isolation Forest: assigns anomaly score (0–1)
Statistical: Modified Z-score on amount series

  ↓
Output:
  anomaly_score: 0.0–1.0
  is_anomalous: boolean
  anomaly_type: "amount_spike" | "velocity_spike" | "temporal" | null
  explanation: string
```

### Fallback Behavior

If the ML service is unreachable (timeout: 10s), `MLServiceClient` returns `null` and the Node.js backend falls back to the deterministic rule-based engines (`fraud-detection.ts`, `risk-scoring.ts`). The system never blocks on ML availability — it degrades gracefully.

This is a critical design decision: ML inference augments but never gatekeeps. A temporary ML service outage should not prevent legitimate transactions.

---

## Rule-Based Engines (Node.js)

The Node.js backend implements its own fraud/risk engines that run regardless of ML service availability:

### Fraud Detection Engine Execution Order

```
1. Blacklist check (BloomFilter — sub-millisecond)
2. Velocity check (SlidingWindow — Redis or in-memory)
3. Amount anomaly (Modified Z-score against user history)
4. Behavior deviation (vs. BehaviorProfile baseline)
5. Location risk (FATF jurisdiction list)
6. Device risk (new/unknown deviceId)
7. Pattern analysis (unusual time, rapid sequence)
8. ML signal (if available) → weighted into final score
```

### BloomFilter for Blacklist Checking

```typescript
// AML blacklist lookup — O(k) where k = number of hash functions (~7)
// False positive rate: 1% (configurable)
// False negative rate: 0% (guaranteed)
const blacklisted = blacklistFilter.test(walletNumber);
```

The BloomFilter provides a high-performance first-pass check before more expensive database lookups. A negative result (not in filter) guarantees the address is clean. A positive result triggers a precise database confirmation query.

### Velocity Engine Sliding Window

```typescript
// Check: max 5 transactions in 1 hour, max $1,000 in 24 hours
VelocityEngine.check(userId, amount, [
  { key: 'hourly_count', maxCount: 5,    windowSeconds: 3600 },
  { key: 'daily_amount', maxAmount: 1000, windowSeconds: 86400 },
])
```

Implemented as an in-memory sliding window with Redis export for multi-instance deployments.
