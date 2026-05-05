# Nordi Remittance — Documentation Index

This documentation covers the full Nordi Remittance platform at production engineering depth. Each file is scoped to a specific concern for efficient reading and reference.

---

## Document Map

| File | Scope |
|------|-------|
| [01-system-overview.md](./01-system-overview.md) | Project purpose, industry context, system goals, high-level architecture |
| [02-architecture.md](./02-architecture.md) | Detailed layer-by-layer architecture, component interactions, data flow |
| [03-data-layer.md](./03-data-layer.md) | MongoDB schemas, ledger engine, caching strategy, Kafka event streaming |
| [04-security.md](./04-security.md) | Auth model, fraud detection, risk scoring, compliance, threat model |
| [05-api-reference.md](./05-api-reference.md) | All 20 route groups, endpoint details, request/response contracts |
| [06-infrastructure.md](./06-infrastructure.md) | Docker, Kubernetes, Nginx, CI/CD, observability stack |
| [07-ai-ml-pipeline.md](./07-ai-ml-pipeline.md) | AI agent (LangGraph), ML microservice, fraud/risk/anomaly engines |
| [08-engineering-notes.md](./08-engineering-notes.md) | Design rationale, tradeoffs, architectural decisions, interview-level depth |

---

## Quick Navigation by Topic

**Authentication & Sessions** → [04-security.md §Auth Model](./04-security.md)

**Transaction Lifecycle** → [02-architecture.md §Request Lifecycle](./02-architecture.md)

**Double-Entry Accounting** → [03-data-layer.md §Ledger Engine](./03-data-layer.md)

**Fraud & AML** → [04-security.md §Fraud Detection](./04-security.md) + [07-ai-ml-pipeline.md](./07-ai-ml-pipeline.md)

**WebSocket Events** → [02-architecture.md §Real-Time Layer](./02-architecture.md)

**Deployment** → [06-infrastructure.md](./06-infrastructure.md)

**Why we chose X over Y** → [08-engineering-notes.md](./08-engineering-notes.md)
