# Nordi Remittance — Engineering Notes & Design Rationale

This document explains *why* key architectural decisions were made, compares them against alternatives, and surfaces the tradeoffs. It is written for senior engineers and for anyone preparing to discuss this system at a technical depth.

---

## 1. Modular Monolith vs. Microservices

**Decision**: The system is a modular monolith — one deployable unit with clear internal module boundaries.

**Why not microservices?**

Microservices are the right choice when teams, deployment frequency, and scaling requirements genuinely differ between services. For a system at this stage, microservices would introduce:
- Network latency between services that currently communicate in-process
- Distributed transaction complexity (2PC or saga pattern) for operations that currently use MongoDB sessions
- Operational overhead (service discovery, inter-service auth, distributed tracing) before the product has validated its domain model

The system *is* structured for extraction. Each domain (ledger, fraud, ai-agent, integrations) is internally cohesive and externally decoupled via Kafka messages or defined interfaces. The ML service is already extracted because it has a genuine runtime boundary (Python vs Node.js).

**Extraction criteria**: A module should be extracted into a microservice when it has different scaling requirements, deployment cadence, or team ownership — not simply because it's large.

---

## 2. MongoDB vs PostgreSQL for Financial Data

**Decision**: MongoDB with Mongoose, with explicit double-entry ledger pattern.

**The common objection**: "Banking needs ACID transactions — use Postgres."

**The actual situation**:
MongoDB 4.0+ supports multi-document ACID transactions. The ledger engine uses `mongoose.startSession()` + `session.startTransaction()` for all balance mutations. The ACID guarantee is real.

**Why MongoDB wins here**:
- The compliance schema evolves rapidly (new KYC fields, new fraud signal types, new integration metadata). MongoDB's flexible schema avoids migrations for every iteration.
- The behavior profile and fraud signal schemas are naturally document-shaped — nested objects, arrays of events, variable metadata.
- MongoDB Atlas provides built-in sharding, geo-distribution, and point-in-time recovery — enterprise features without DBA overhead.

**What you lose vs PostgreSQL**:
- JOIN operations require `$lookup` aggregations (less ergonomic than SQL JOINs)
- No built-in ENUM constraints — enforced at application layer via Mongoose
- No foreign key constraints at DB level — enforced via application logic

**Mitigation**: All relationships are defined at the Mongoose schema level with explicit ref fields. The test suite validates referential integrity.

---

## 3. Double-Entry Accounting Architecture

**Decision**: All balance mutations go through `LedgerEngine.post()` only — no direct balance field updates anywhere else in the codebase.

**Why this matters**: In a naive implementation, a transfer might look like:

```typescript
sender.balance -= amount;
recipient.balance += amount;
await Promise.all([sender.save(), recipient.save()]);
```

This has three failure modes:
1. The server crashes after the first save but before the second — funds disappear
2. Two concurrent transfers from the same wallet create a race condition — negative balance possible
3. There is no audit trail — you cannot reconstruct the balance history from the data

The double-entry ledger solves all three:
1. Both entries and the transaction record are written in a single MongoDB ACID transaction
2. A Redis distributed lock prevents concurrent postings to the same wallet pair
3. LedgerEntries are immutable and ordered — the complete balance history is recoverable at any point in time

**Cost**: Every transfer writes 2 LedgerEntries + 1 Transaction + 2 AccountBalances updates. This is 5 writes per transfer. In a high-volume system, this is acceptable — the alternative (balance inconsistency) is catastrophic.

---

## 4. Kafka vs BullMQ

**Decision**: Both are used, for different purposes.

| Kafka (KafkaJS) | BullMQ |
|-----------------|--------|
| Durable, replayable event log | Job queue with retry/backoff |
| Multiple independent consumers | Single logical processor per queue |
| Transaction lifecycle events | Email, notifications, cleanup |
| Data pipeline / analytics feed | Scheduled tasks |
| Cannot query job status | Can inspect job status, progress |

**The rule**: If a consumer needs to replay events (e.g., analytics pipeline, audit system), use Kafka. If a job needs retry with backoff and status visibility, use BullMQ.

**Why not just Kafka for everything?** Kafka's consumer group model makes it awkward for scheduled jobs and job status inspection. BullMQ provides a job queue API (pause, resume, retry, inspect) that Kafka doesn't.

**Why not just BullMQ for everything?** BullMQ does not provide event replay. If the analytics consumer goes down for 6 hours, it can't recover missed events from BullMQ (jobs are removed on completion). Kafka retains messages for the configured retention period (default: 7 days).

---

## 5. JWT with Session Management

**Decision**: JWT access tokens (15 min) + server-side session records.

**The tension**: JWTs are designed to be stateless — the server doesn't need to check a database for every request. But stateless JWTs cannot be revoked before expiry.

**The resolution**: The JWT carries a `sessionId`. The session record in MongoDB (embedded in the User document) can be marked `isActive: false`. The auth middleware validates the JWT signature AND verifies the sessionId is still active.

This means one additional DB read per request (or Redis cache hit). The cost is justified because:
- Users can revoke specific devices (stolen phone)
- Admins can force-logout any user
- Account lockout takes effect immediately, not after token expiry

**Alternative considered**: Refresh token blocklist in Redis. Rejected because it requires a Redis lookup anyway, and the session-based approach provides more metadata (device info, last active time) that is useful for the security UI.

---

## 6. Redis Distributed Locking for Ledger

**Decision**: `RedisService.withLock()` wraps every `LedgerEngine.executePosting()`.

**The problem it solves**: Without locking, two concurrent requests from the same user could both read the wallet balance (1000), both calculate that the balance is sufficient (1000 ≥ 600), and both debit 600 — resulting in a balance of -200.

MongoDB `findOneAndUpdate` with conditional operators can prevent this atomically. But the ledger engine needs to perform multiple reads and writes across multiple collections in sequence. A single atomic MongoDB operation cannot span that.

**The Redis lock**: `SET lock:ledger:{debitWalletId}:{creditWalletId} "locked" NX EX 15`
- `NX`: only set if not exists (atomic test-and-set)
- `EX 15`: auto-expire after 15 seconds (prevents deadlock if the process dies)
- Retries: 3 attempts with 200ms delay

**Limitation**: In-memory sliding window velocity engine (`velocity-engine.ts`) is only lock-safe within a single process. In multi-instance deployments, this should be swapped to Redis atomic increments (`INCR` + `EXPIRE` with MULTI/EXEC).

---

## 7. KYC as a Structural Gate

**Decision**: KYC enforcement is middleware-level, not controller-level.

**Why this matters**: If KYC checks are done inside each controller, there is risk of a new endpoint being added without the check. When KYC is enforced at the middleware layer via `requireKyc()`, it is impossible to add a route that bypasses it without explicitly opting out.

```typescript
// Every transaction route group:
router.use(authenticate, requireKyc('approved'));
// All routes below this line are KYC-gated
```

**KYC-tiered limits**: Rather than binary on/off, limits scale with KYC level. Unverified users can deposit and make small transfers — enough to demonstrate the product — but cannot access full capabilities until verified. This reduces friction in onboarding while maintaining compliance posture.

---

## 8. AI Agent Design Decisions

**Decision**: LangGraph over raw LLM API calls.

**What LangGraph provides**:
- Typed state machine — the agent's execution path is explicit and traceable
- The graph topology enforces guardrail checkpoints (input validation cannot be skipped)
- Tool call loop is built-in — no manual parsing of LLM function call responses
- State reducers enable controlled context accumulation

**Guardrail placement**: Both input and output guardrails run regardless of which LLM provider is active. A provider switch during fallback does not bypass security checks.

**The `requiresHumanReview` flag**: Any `AgentDecision` with `requiresHumanReview: true` or `riskLevel: 'critical'` routes to the `escalate` node. This ensures that the AI agent can never autonomously approve a high-risk operation — it can only recommend.

**Tool trust model**: Tools run with the authenticated user's permissions. The agent cannot call tools that the user themselves cannot call. The session context (`userId`) is threaded through every tool execution.

---

## 9. Risk Scoring Factor Weights

**Decision**: The risk scoring engine uses fixed weights that sum to 1.0.

The weights are:
```
amountDeviation: 0.18  — largest single factor
recipientRisk:   0.15  — new recipient / bad jurisdiction
kycLevel:        0.12  — verification status
velocityRisk:    0.12  — rate of recent activity
```

**Why amount deviation is highest**: Fraud studies consistently show that deviating from a user's typical transaction amount is the single strongest predictor of fraud. A user who typically sends $50 trying to send $5,000 deserves high scrutiny regardless of other factors.

**Why this isn't ML-only**: The deterministic engine is auditable. A compliance officer can trace exactly why a transaction was flagged: "amountDeviation score was 0.85 because amount was 40x the user's average." ML models provide probabilistic augmentation but the primary decision logic is explainable.

---

## 10. Anomaly Detection: Modified Z-Score vs. Standard Z-Score

**Decision**: Modified Z-score using Median Absolute Deviation (MAD).

**Standard Z-score**: `(value - mean) / stddev`

**The problem**: Standard Z-score is sensitive to outliers in the population. If a user has 19 transactions of $50 and 1 transaction of $5,000, the mean and standard deviation are both distorted — making subsequent $50 transactions look anomalous.

**Modified Z-score**: `0.6745 × |value - median| / MAD`

The median and MAD are robust to outliers. The population's anomalies don't distort the baseline. This is why Modified Z-score is recommended over standard Z-score for fraud detection applications.

**Threshold**: 3.5 (configurable). Population minimum: 5 data points. Below 5 data points, the system returns `isAnomaly: false` — insufficient history to make a reliable determination.

---

## 11. Scalability Considerations

**Horizontal scaling bottlenecks**:

1. **Ledger distributed lock**: The Redis lock key is per wallet pair, so two different wallet pairs can be processed in parallel. Only concurrent operations on the *same pair* are serialized. This is the correct granularity.

2. **WebSocket sticky sessions**: Socket.IO rooms require that a user's socket reconnects to the same server instance (or uses Redis adapter for cross-instance pub/sub). The production configuration should use `@socket.io/redis-adapter` with Redis pub/sub for multi-instance deployments.

3. **Velocity engine**: In-memory sliding windows must be migrated to Redis INCR operations for multi-instance accuracy.

4. **MongoDB connection pool**: Configured in `dbconfig.ts` with pool sizing appropriate for expected concurrency. Atlas connection pooling is enabled.

**Throughput expectations**:
- The Nginx upstream `least_conn` load balancing + 3 Kubernetes replicas can handle ~1,500 concurrent API requests
- MongoDB Atlas M30+ tier handles ~5,000 read IOPS + 1,000 write IOPS
- Redis Cloud handles ~100,000 operations/second for cache and lock operations

---

## 12. Idempotency in Financial Operations

**Decision**: Every transaction creation accepts an optional `idempotencyKey`.

In distributed systems, a client may retry a request if it doesn't receive a response (network timeout). Without idempotency, this creates duplicate charges.

The LedgerEngine checks: `Transactions.findOne({ referenceNumber: idempotencyKey })`. If found, it returns the existing transaction instead of creating a new one. The idempotency key should be set by the client (a UUID generated before the first attempt) and reused on retries.

This is the same pattern used by Stripe's idempotency keys and is required for any production payment system.

---

## 13. What Was Intentionally Left Simple

**No CQRS (Command Query Responsibility Segregation)**: The read and write models use the same MongoDB collections. CQRS would require maintaining a separate read store (e.g., Elasticsearch for complex queries). This is appropriate at scale but adds significant operational complexity for the current stage. The query cache service (Redis) provides read optimization without full CQRS.

**No event sourcing**: Transactions are stored as final state, not as an event log. The LedgerEntries provide event-level granularity for financial data, which is sufficient.

**No saga pattern**: The system uses MongoDB ACID transactions for multi-step operations. Sagas (distributed compensation logic) would be needed if these steps were split across microservices.

**No GraphQL**: REST is simpler to cache, rate-limit, and reason about for a financial API. GraphQL's flexibility offers no benefit here since the client is a first-party application with known data requirements.
