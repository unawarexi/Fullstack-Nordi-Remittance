# Nordi Machine Learning Service

> Real-time fraud detection, risk scoring, and anomaly detection microservice for the Nordi Remittance platform.

---

## Table of Contents

- [What Is This?](#what-is-this)
- [Why Does It Exist?](#why-does-it-exist)
- [Architecture Overview](#architecture-overview)
- [How It Fits Into the Full Stack](#how-it-fits-into-the-full-stack)
- [ML Models](#ml-models)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Makefile Commands](#makefile-commands)
- [Training Models](#training-models)
- [Monitoring & Logs](#monitoring--logs)
- [Contributing](#contributing)

---

## What Is This?

A **FastAPI** microservice that provides three core machine-learning capabilities for the Nordi Remittance fintech platform:

| Capability | What It Does | When It Runs |
|---|---|---|
| **Fraud Detection** | Scores every transaction for fraud probability (0 – 1) and returns human-readable risk factors. | Before a transaction is approved |
| **Risk Scoring** | Calculates a composite risk score (0 – 100) across 9 weighted factors and assigns a tier (minimal → severe). | During transaction processing and periodic user assessments |
| **Anomaly Detection** | Compares a transaction against a user's historical patterns to flag behavioral deviations. | On every incoming transaction |

Each model ships with a **trained-model path** (Gradient Boosting / Isolation Forest via scikit-learn) and a **rule-based / statistical fallback** so the service works out of the box—even before any model has been trained.

---

## Why Does It Exist?

Nordi Remittance handles cross-border money transfers. Regulatory compliance (AML/CFT) and user trust demand **real-time financial intelligence**:

- **Fraud Prevention** — Flag or block suspicious transfers before money leaves the platform. Uses FATF high-risk jurisdiction lists, amount deviation analysis, temporal patterns, and device/channel signals.
- **Risk-Based Decision Making** — Assign risk tiers to drive automated workflows: approve, escalate to enhanced monitoring, send to manual review, or block.
- **Behavioral Anomaly Detection** — Detect account takeover, money mule activity, or unusual spending by comparing each transaction to the user's established patterns.
- **Regulatory Compliance** — FATF, AML/CFT regulations require risk-based transaction monitoring. This service provides the scoring engine that feeds into the backend's compliance workflows.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Nordi Platform                            │
│                                                             │
│  ┌──────────────┐    HTTP/JSON     ┌─────────────────────┐  │
│  │   Backend     │ ──────────────► │  ML Service (this)  │  │
│  │   (Node.js)   │ ◄────────────── │  FastAPI · Python   │  │
│  │   Port 3000   │                 │  Port 8000          │  │
│  └──────┬───────┘                  └──────┬──────────────┘  │
│         │                                  │                │
│         │        ┌────────────┐           │                │
│         └───────►│  MongoDB   │◄──────────┘                │
│                  │  Atlas     │                             │
│                  └────────────┘                             │
│                                                             │
│  ┌──────────────┐                  ┌─────────────────────┐  │
│  │  Frontend     │                 │  Redis (caching)    │  │
│  │  (React)      │                 │                     │  │
│  │  Port 5173    │                 └─────────────────────┘  │
│  └──────────────┘                                           │
└─────────────────────────────────────────────────────────────┘
```

**Request flow:**

1. User initiates a transfer on the **React frontend**.
2. **Backend (Node.js)** receives the request and calls this ML service over HTTP.
3. ML service runs fraud detection → risk scoring → anomaly detection.
4. Results are returned to the backend, which decides: approve, flag, review, or block.
5. Both services share the same **MongoDB Atlas** cluster.

---

## How It Fits Into the Full Stack

| Service | Tech | Port | Role |
|---|---|---|---|
| **Frontend** | React · TypeScript · Vite · TailwindCSS | 5173 | User interface — transfers, admin dashboard, KYC |
| **Backend** | Node.js · Express · TypeScript | 3000 | REST API, auth, ledger, business logic |
| **ML Service** *(this)* | Python · FastAPI · scikit-learn | 8000 | Real-time ML scoring |
| **Database** | MongoDB Atlas | — | Shared data store |
| **Cache** | Redis | — | Session caching, rate limiting |

The backend's `env.config.ts` holds the `ML_SERVICE_URL` that points to this service. The backend's AI Agent orchestrator can also call ML endpoints for intelligent transaction analysis.

---

## ML Models

### 1. Fraud Detection (`fraud_model.py`)

| Aspect | Detail |
|---|---|
| **Algorithm** | Gradient Boosting Classifier (200 estimators, max_depth=6) |
| **Fallback** | Rule-based scoring engine |
| **Features (11)** | amount, hour_of_day, day_of_week, is_international, account_age_days, transaction_count_30d, avg_transaction_amount, amount_deviation_ratio, country_risk_score, channel_encoded, transaction_type_encoded |
| **Output** | `fraud_probability` (0–1), `is_fraudulent` (≥ 0.7), `risk_factors[]`, `confidence` |
| **Country Lists** | FATF high-risk (IR, KP, MM, SY, YE, AF, LY, SO, SD), medium-risk (PK, NG, VN, BD, KH, LA, ML, SN, TZ) |

**Rule-based fallback triggers:**
- Amount > 5× user average → +0.30
- Amount > 3× user average → +0.15
- New account (< 30 days) + amount > $1,000 → +0.20
- High-risk destination country → +0.25
- Midnight – 5 AM transaction → +0.10

### 2. Risk Scoring (`risk_model.py`)

| Factor | Weight | Scoring Logic |
|---|---|---|
| Amount Deviation | 18% | `(amount / avg) × 20`, capped at 100 |
| Recipient Risk | 15% | FATF high-risk = 95, international = 30, domestic = 10 |
| Fraud History | 13% | `signals × 25`, capped at 100 |
| KYC Level | 12% | approved=5, in_review=40, pending=80, rejected=100 |
| Velocity Risk | 12% | `velocity_score × 100` |
| Account Maturity | 10% | <7d=95, <30d=70, <90d=40, <1yr=15, >1yr=5 |
| Channel Risk | 10% | branch=5, web=25, mobile=30, atm=40, api=50 |
| Temporal Risk | 5% | midnight–5 AM = 60, otherwise 10 |
| International Risk | 5% | international = 50, domestic = 5 |

**Risk tiers → actions:**

| Score Range | Tier | Action |
|---|---|---|
| 0 – 14 | Minimal | `approve` |
| 15 – 34 | Low | `approve` |
| 35 – 59 | Elevated | `enhanced_monitoring` |
| 60 – 79 | High | `manual_review` |
| 80 – 100 | Severe | `block` |

### 3. Anomaly Detection (`anomaly_model.py`)

| Aspect | Detail |
|---|---|
| **Algorithm** | Isolation Forest (200 estimators, 5% contamination) |
| **Fallback** | Modified Z-score with time-based analysis |
| **Features (5)** | amount, hour_of_day, day_of_week, is_international, channel |
| **Threshold** | `anomaly_score ≥ 0.6` = anomalous |
| **Anomaly Types** | `amount_spike`, `unusual_time`, `new_international`, `behavioral_deviation` |
| **Minimum History** | 10 transactions for ML mode, 3 for statistical mode |

---

## API Reference

Base URL: `http://localhost:8000`

### Health

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Service status and loaded models |

### Fraud Detection

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/ml/fraud/predict` | Score a single transaction |
| POST | `/api/v1/ml/fraud/batch-predict` | Score multiple transactions |

<details>
<summary><strong>POST /api/v1/ml/fraud/predict</strong> — Example</summary>

**Request:**
```json
{
  "transaction_id": "txn_abc123",
  "user_id": "usr_456",
  "amount": 5000.00,
  "currency": "USD",
  "transaction_type": "transfer",
  "recipient_country": "KP",
  "channel": "web",
  "is_international": true,
  "hour_of_day": 3,
  "day_of_week": 1,
  "user_account_age_days": 15,
  "user_transaction_count_30d": 2,
  "user_avg_transaction_amount": 200.00
}
```

**Response:**
```json
{
  "transaction_id": "txn_abc123",
  "fraud_probability": 0.85,
  "is_fraudulent": true,
  "risk_factors": [
    "Amount significantly above user average",
    "New account (< 30 days)",
    "High-risk destination country: KP",
    "Unusual transaction hour (midnight–5AM)",
    "International transaction"
  ],
  "model_version": "1.0.0",
  "confidence": 0.6
}
```
</details>

### Risk Scoring

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/ml/risk/score` | Calculate composite risk score |

<details>
<summary><strong>POST /api/v1/ml/risk/score</strong> — Example</summary>

**Request:**
```json
{
  "user_id": "usr_456",
  "amount": 5000.00,
  "currency": "USD",
  "recipient_country": "NG",
  "transaction_type": "transfer",
  "kyc_level": "pending",
  "account_age_days": 15,
  "historical_fraud_signals": 1,
  "velocity_score": 0.4
}
```

**Response:**
```json
{
  "user_id": "usr_456",
  "risk_score": 67.35,
  "risk_tier": "high",
  "recommended_action": "manual_review",
  "factor_breakdown": {
    "account_maturity": 70,
    "kyc_level": 80,
    "amount_deviation": 100,
    "recipient_risk": 30,
    "channel_risk": 25,
    "velocity_risk": 40,
    "fraud_history": 25,
    "temporal_risk": 10,
    "international_risk": 5
  },
  "model_version": "1.0.0"
}
```
</details>

### Anomaly Detection

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/ml/anomaly/detect` | Detect behavioral anomalies |

<details>
<summary><strong>POST /api/v1/ml/anomaly/detect</strong> — Example</summary>

**Request:**
```json
{
  "user_id": "usr_456",
  "transactions": [
    {"amount": 100, "hour_of_day": 14, "day_of_week": 2, "is_international": false, "channel": "mobile"},
    {"amount": 150, "hour_of_day": 10, "day_of_week": 4, "is_international": false, "channel": "mobile"},
    {"amount": 80, "hour_of_day": 16, "day_of_week": 1, "is_international": false, "channel": "web"}
  ],
  "current_transaction": {
    "amount": 8500,
    "hour_of_day": 2,
    "day_of_week": 6,
    "is_international": true,
    "channel": "api"
  }
}
```

**Response:**
```json
{
  "user_id": "usr_456",
  "anomaly_score": 0.82,
  "is_anomalous": true,
  "anomaly_type": "amount_spike",
  "explanation": "Anomaly detected: Amount (8500) is 77.3x the user average; Transaction at unusual hour (midnight-6AM)",
  "model_version": "1.0.0-statistical"
}
```
</details>

---

## Project Structure

```
Nordi-Machine-Learning/
├── main.py                         # FastAPI app entrypoint
├── Makefile                        # Dev/build/test commands
├── requirements.txt                # Python dependencies
├── .env                            # Local env vars (git-ignored)
├── .env.example                    # Config template for new devs
│
├── app/
│   ├── __init__.py
│   ├── config.py                   # Pydantic settings (reads .env)
│   │
│   ├── schemas/
│   │   └── __init__.py             # Request/response Pydantic models
│   │
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── health.py               # GET  /health
│   │   ├── fraud.py                # POST /api/v1/ml/fraud/*
│   │   ├── risk.py                 # POST /api/v1/ml/risk/*
│   │   └── anomaly.py              # POST /api/v1/ml/anomaly/*
│   │
│   ├── ml_models/
│   │   ├── __init__.py
│   │   ├── fraud_model.py          # Gradient Boosting + rule fallback
│   │   ├── risk_model.py           # Weighted multi-factor scoring
│   │   └── anomaly_model.py        # Isolation Forest + Z-score fallback
│   │
│   └── services/
│       ├── __init__.py
│       ├── database.py             # MongoDB async connection (Motor)
│       └── model_loader.py         # Load/save .joblib models at startup
│
└── models/
    └── saved/                      # Trained model files (.joblib)
```

---

## Prerequisites

| Requirement | Version | Why |
|---|---|---|
| **Python** | 3.10+ | Language runtime |
| **pip** | Latest | Package manager |
| **MongoDB** | Atlas or local | Shared database with backend |
| **Redis** | 5+ | Caching layer |
| **Backend service** | Running on :3000 | Required for full integration |

---

## Getting Started

### 1. Clone and navigate

```bash
git clone https://github.com/unawarexi/Fullstack-Nordi-Remittance.git
cd Fullstack-Nordi-Remittance/Nordi-Machine-Learning
```

### 2. One-command setup

```bash
make setup
```

This creates a virtual environment, installs all dependencies, and copies `.env.example` → `.env`.

### 3. Configure environment

Edit `.env` with your real credentials:

```bash
# Required — service will not start without these
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/<db>?retryWrites=true&w=majority
REDIS_URL=redis://:<password>@<host>:<port>/0
JWT_SECRET=<min-32-character-secret-matching-backend>
```

Verify your config:

```bash
make check-env
```

### 4. Activate venv and run

```bash
source venv/bin/activate
make dev
```

The service starts at **http://localhost:8000**. Interactive API docs are at **http://localhost:8000/docs**.

### Alternative: Run directly

```bash
source venv/bin/activate
python3 main.py
```

---

## Configuration

All config is loaded from `.env` via Pydantic Settings. **Sensitive values have no defaults** — the service fails fast if they're missing.

| Variable | Required | Default | Description |
|---|---|---|---|
| `MONGODB_URI` | **Yes** | — | MongoDB connection string (must match backend) |
| `REDIS_URL` | **Yes** | — | Redis connection string |
| `JWT_SECRET` | **Yes** | — | JWT signing key (must match backend) |
| `ML_SERVICE_PORT` | No | `8000` | Service port |
| `ML_SERVICE_HOST` | No | `0.0.0.0` | Bind address |
| `BACKEND_API_URL` | No | `http://localhost:3000/api/v1` | Backend API base URL |
| `MODEL_DIR` | No | `./models/saved` | Directory for trained `.joblib` model files |
| `LOG_LEVEL` | No | `INFO` | Logging level |

---

## Makefile Commands

| Command | Description |
|---|---|
| `make setup` | Full first-time setup (venv + deps + .env) |
| `make dev` | Run dev server with hot reload |
| `make start` | Run production server (4 Uvicorn workers) |
| `make install` | Install/update dependencies |
| `make test` | Run test suite |
| `make test-cov` | Tests with coverage report |
| `make lint` | Lint with ruff |
| `make format` | Auto-format with ruff |
| `make typecheck` | Type-check with mypy |
| `make clean` | Remove `__pycache__`, `.pytest_cache`, `.mypy_cache` |
| `make freeze` | Snapshot deps to `requirements.lock` |
| `make check-env` | Verify `.env` has all required variables |
| `make help` | Show all available commands |

---

## Training Models

The service works **out of the box** with rule-based and statistical fallbacks. To improve accuracy, train and save models:

```python
# Example: train and save a fraud detection model
from app.ml_models.fraud_model import build_training_pipeline
from app.services.model_loader import ModelLoader

pipeline = build_training_pipeline()
pipeline.fit(X_train, y_train)

ModelLoader.save("fraud_detector_v1", pipeline)
```

Trained models are saved as `.joblib` files in `models/saved/` and automatically loaded on next startup.

| Model File | Used By |
|---|---|
| `fraud_detector_v1.joblib` | Fraud detection |
| `risk_scorer_v1.joblib` | Risk scoring |
| `anomaly_detector_v1.joblib` | Anomaly detection |

---

## Monitoring & Logs

- **Structured logging** via `structlog` — JSON-formatted logs in production.
- **Prometheus metrics** — `prometheus-client` is included for scraping.
- **Health endpoint** — `GET /health` returns service status and loaded model names.

---

## Contributing

1. Create a feature branch from `master`.
2. Activate the venv: `source venv/bin/activate`
3. Make your changes.
4. Lint and format: `make lint && make format`
5. Run tests: `make test`
6. Submit a pull request.

---

## License

Part of the Nordi Remittance platform. See the root [README](../README.md) for license details.