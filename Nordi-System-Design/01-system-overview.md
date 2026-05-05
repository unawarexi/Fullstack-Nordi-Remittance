# Nordi Remittance — System Overview

## Problem Statement

International remittance is a $700B+ annual market dominated by legacy intermediaries — SWIFT-reliant correspondent banking chains that impose 3–7% fees, 2–5 day settlement windows, and opaque FX conversion spreads. The unbanked population across Sub-Saharan Africa, South Asia, and Southeast Asia bears a disproportionate cost: migrant workers sending money home lose 10–15% per transfer when corridor fees, FX margins, and receiving costs are combined.

Nordi Remittance is a financial technology platform designed to operate within this market as a first-party payment infrastructure. It does not aggregate third-party rails — it implements a complete vertical stack from user onboarding through ledger posting, compliance screening, and settlement.

---

## System Goals & Design Principles

**1. Financial Integrity First**
Every balance mutation is expressed as a double-entry ledger posting. No direct balance field updates exist in the system. The ledger is the source of truth; the balance fields are materialized views derived from it.

**2. Compliance by Architecture**
KYC enforcement is structural, not advisory. The middleware pipeline rejects requests from unverified users at the route layer before they reach controllers. AML screening runs before transaction posting, not after.

**3. Operational Auditability**
Every state change — user status, account status, KYC decision, admin action — produces an immutable audit record. This is not a logging courtesy; it satisfies regulatory requirements in most operating jurisdictions.

**4. Defense in Depth**
Security is layered. JWT authentication, rate limiting, IP blocking, 2FA enforcement, behavioral fraud detection, and ML-assisted risk scoring operate independently. Failure of any one layer does not compromise the others.

**5. Horizontal Scalability**
All session and cache state lives in Redis, not in application memory. All inter-service communication that can be made async is routed through Kafka or BullMQ. The application tier is stateless and can scale horizontally without coordination.

---

## Industry Context

Nordi operates at the intersection of three regulated domains:

**Retail Banking Infrastructure**: Core wallet, account, and transaction management follows the same ledger primitives used in ISO 20022 compliant banking systems — debit/credit pairs, reference numbers, settlement dates, and reversal chains.

**Payments & Remittance**: Cross-border transfers involve FX rate application, international routing flags, correspondent account mapping, and regulatory reporting thresholds (e.g., CTR equivalents above $10,000).

**Financial Crime Prevention**: The platform implements a layered AML/CFT posture — KYC document collection, velocity rule engines, behavioral profiling, FATF jurisdiction risk mapping, and ML-assisted fraud scoring.

---

## High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        CLIENT TIER                               │
│  React/TypeScript SPA  ←→  WebSocket (Socket.IO)                │
└────────────────────────────┬─────────────────────────────────────┘
                             │ HTTPS / WSS
┌────────────────────────────▼─────────────────────────────────────┐
│                       EDGE / GATEWAY TIER                        │
│  Nginx (TLS termination, rate limiting, proxy)                   │
└────────────────────────────┬─────────────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────────────┐
│                     APPLICATION TIER                             │
│                                                                  │
│  Express 5.x (Node.js 20)  ─── TypeScript 5.x                   │
│                                                                  │
│  Middleware Stack:                                               │
│  security → core → auth → kyc → rate-limit → route handlers     │
│                                                                  │
│  Route Groups (20):                                              │
│  auth / users / accounts / transactions / cards / loans /        │
│  investments / admin / fraud / statistics / kyc /               │
│  notifications / attachments / legal / integrations /            │
│  security / permissions / transfer-verification / ai-agent       │
└──────┬─────────────┬──────────────┬───────────────┬─────────────┘
       │             │              │               │
┌──────▼──────┐ ┌────▼──────┐ ┌────▼──────┐ ┌─────▼──────┐
│   MongoDB   │ │   Redis   │ │   Kafka   │ │  BullMQ    │
│  (Primary   │ │  (Cache + │ │  (Event   │ │  (Job      │
│  Data Store)│ │  Sessions)│ │  Bus)     │ │  Queues)   │
└─────────────┘ └───────────┘ └───────────┘ └────────────┘
                                                    │
                                            ┌───────▼────────┐
                                            │ Python ML      │
                                            │ FastAPI Service │
                                            │ (fraud/risk)   │
                                            └────────────────┘
```

---

## Component Responsibilities

| Component | Responsibility |
|-----------|----------------|
| **Express Application** | HTTP routing, middleware execution, request/response lifecycle |
| **MongoDB** | Durable storage — all domain models, ledger, audit trails |
| **Redis** | Cache (user profiles, wallets, permissions), distributed locks, session tokens, rate limit counters |
| **Kafka** | Async event delivery — transaction lifecycle, KYC updates, fraud alerts, notification dispatch |
| **BullMQ** | Scheduled and retry-capable job execution — emails, audits, cleanup, fraud processing |
| **Socket.IO** | Real-time bidirectional events per authenticated user room |
| **Cloudinary** | KYC document and profile image storage |
| **Python ML Service** | Fraud prediction, risk scoring, anomaly detection via trained models |
| **AI Agent (LangGraph)** | Stateful conversational banking assistant with tool-calling capability |

---

## Technology Selection Summary

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Language | TypeScript 5.x | Type safety at scale; catches financial calculation errors at compile time |
| Framework | Express 5.x | Minimal overhead; full control over middleware; async/await native |
| Database | MongoDB 7 | Flexible schema for evolving compliance requirements; Atlas-ready |
| Cache | Redis Cloud | Sub-millisecond reads for hot paths (wallet balances, permissions) |
| Message Bus | Kafka (KafkaJS) | Durable, replayable event log; supports multiple independent consumers |
| Job Queue | BullMQ | Redis-backed reliable job execution with retries and backoff |
| Real-time | Socket.IO | Rooms abstraction maps cleanly to per-user event scoping |
| AI Orchestration | LangGraph | Stateful graph-based agent execution with guardrail integration |
| ML Runtime | Python FastAPI | Scikit-learn / model serving; separate runtime from Node.js |

---

## Domain Boundaries

The system is structured as a **modular monolith** — not microservices. All domain logic runs in a single deployable unit with clear internal module boundaries. The ML service is the one genuine service extraction, justified by the Python runtime requirement for model inference.

This is a deliberate architectural choice. See [08-engineering-notes.md](./08-engineering-notes.md) for the tradeoff analysis.
