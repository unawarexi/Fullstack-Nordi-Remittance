# Nordi Remittance — Infrastructure & Deployment

## Containerization

### Docker Setup

The project provides two Docker Compose configurations:

**Development (`docker-compose.dev.yml`)**
```yaml
Services:
  api       : Node.js with hot reload (ts-node-dev / tsx watch)
  mongodb   : MongoDB 7 with persistent volume
  redis     : Redis with Commander UI
  mongo-express : MongoDB web UI

Access:
  API            : http://localhost:3000
  MongoDB Express: http://localhost:8081
  Redis Commander: http://localhost:8082
```

**Production (`docker-compose.yml`)**
```yaml
Services:
  api     : Built TypeScript image
  nginx   : Reverse proxy + TLS termination
  mongodb : MongoDB 7
  redis   : Redis (no UI)
  kafka   : Kafka broker
  zookeeper: Kafka dependency
```

### Dockerfile

Multi-stage build pattern:

```dockerfile
Stage 1 (builder):
  - node:20-alpine
  - npm ci --only=production
  - tsc (TypeScript compilation)
  - Output: /dist

Stage 2 (production):
  - node:20-alpine (slim)
  - Copy /dist + node_modules from builder
  - Non-root user (UID 1001)
  - CMD: node dist/index.js
```

Security hardening in production image:
- No dev dependencies
- Non-root user execution
- Read-only filesystem where possible
- No shell access

---

## Kubernetes Deployment

Kubernetes manifests in `k8s/`:

### Namespace
```yaml
# k8s/namespace.yaml
namespace: remit
```

All resources are scoped to the `remit` namespace for isolation.

### Deployment Configuration

```yaml
# k8s/deployment.yaml
replicas: 3
strategy:
  type: RollingUpdate
  maxSurge: 1
  maxUnavailable: 0   # Zero-downtime deployments

Security context:
  runAsNonRoot: true
  runAsUser: 1001
  runAsGroup: 1001

Resource limits:
  requests: { cpu: 500m, memory: 512Mi }
  limits:   { cpu: 1000m, memory: 1Gi }

Health probes:
  livenessProbe:  GET /health (30s initial, 30s period)
  readinessProbe: GET /health (10s initial, 10s period)
```

The `maxUnavailable: 0` ensures zero-downtime deployments — new pods must be healthy before old pods terminate.

### Service

```yaml
# k8s/service.yaml
type: LoadBalancer
port: 80 → containerPort: 3000
annotations: cloud-provider load balancer annotations
```

### Secrets & Config

```yaml
# k8s/secrets.yaml
MONGODB_URI, REDIS_URL, JWT_SECRET, JWT_REFRESH_SECRET,
ENCRYPTION_KEY, CLOUDINARY_*, SMTP_*, KAFKA_SASL_*

# k8s/configmap.yaml
NODE_ENV, PORT, API_VERSION, CORS_ORIGINS,
BCRYPT_ROUNDS, ENABLE_2FA, ENABLE_KYC_VERIFICATION
```

Secrets are injected as environment variables — never baked into the image. In production, these should be managed by a secrets manager (AWS Secrets Manager, HashiCorp Vault, or Kubernetes Sealed Secrets).

### Deploy sequence

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml

# Verify
kubectl get pods -n remit
kubectl get svc -n remit
kubectl logs -f deployment/remit-api -n remit
```

---

## Nginx (Reverse Proxy)

Nginx sits in front of the Node.js application and handles:

### TLS Termination
```nginx
server {
  listen 443 ssl http2;
  ssl_certificate     /etc/ssl/certs/fullchain.pem;
  ssl_certificate_key /etc/ssl/private/privkey.pem;
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:...;
}

# HTTP → HTTPS redirect
server {
  listen 80;
  return 301 https://$host$request_uri;
}
```

### Rate Limiting (Network Layer)
```nginx
limit_req_zone $binary_remote_addr zone=api_limit:10m  rate=10r/s;
limit_req_zone $binary_remote_addr zone=auth_limit:10m rate=2r/s;

location /api/v1/auth {
    limit_req zone=auth_limit burst=5 nodelay;
}
location /api/ {
    limit_req zone=api_limit burst=20 nodelay;
}
```

This provides a first line of defense before requests reach the Node.js application layer.

### Upstream Configuration
```nginx
upstream remit_api {
    least_conn;
    server api:3000 weight=1 max_fails=3 fail_timeout=30s;
    keepalive 32;
}
```

`least_conn` load balancing distributes to the node with the fewest active connections — appropriate for financial API requests which have variable processing times.

### WebSocket Proxying
```nginx
location /socket.io/ {
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_read_timeout 86400;  # 24h for long-lived connections
}
```

### Static Security Headers
```nginx
add_header X-Frame-Options "DENY";
add_header X-Content-Type-Options "nosniff";
add_header X-XSS-Protection "1; mode=block";
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload";
add_header Content-Security-Policy "default-src 'self'";
```

---

## CI/CD

GitHub Actions pipeline in `.github/workflows/`:

### Pipeline Stages

```
Trigger: Push to main / PR to main

Stage 1: Validate
  ├── npm run lint         (ESLint)
  ├── npm run typecheck    (TypeScript)
  └── npm test             (Vitest unit tests)

Stage 2: Security Scan
  └── Trivy vulnerability scanner (image + deps)

Stage 3: Build
  └── docker build + push to GHCR (ghcr.io/org/remit-api:sha)

Stage 4: Deploy (main branch only)
  ├── Staging: kubectl set image deployment/remit-api
  └── Production: Manual approval gate → kubectl apply
```

### Version Tagging
```
Development builds: ghcr.io/org/remit-api:commit-sha
Release builds:     ghcr.io/org/remit-api:v1.2.3
Latest:             ghcr.io/org/remit-api:latest (main only)
```

---

## Observability Stack

### Logging (Winston)

Winston logger with environment-aware levels:

```
Development: debug (all logs)
Production:  warn (warn + error only)

Transports:
  - Console (colorized in dev)
  - logs/error.log (errors only)
  - logs/all.log (all levels)
```

**Context logger pattern:**
```typescript
const log = createLogger("BullMQ");
log.info("Queue initialized", { queues: [...] });
// Output: 2026-05-05 14:32:01 INFO [BullMQ]: Queue initialized
```

Every log entry includes the service name prefix, enabling log aggregation filtering.

### Prometheus Metrics (`logs/prometheus.logs.ts`)

Business and infrastructure metrics exposed at `GET /metrics`:

**HTTP Metrics:**
```
nordi_http_request_duration_seconds  — Histogram (latency by route/method/status)
nordi_http_requests_total            — Counter (request volume)
nordi_http_active_requests           — Gauge (concurrency)
```

**Business Metrics:**
```
nordi_transactions_total             — Counter by type/status/currency
nordi_transaction_amount_total       — Histogram of transaction amounts
nordi_kyc_submissions_total          — KYC submission counts by status
nordi_fraud_signals_total            — Fraud signals by severity/type
nordi_active_users                   — Gauge of active users
```

**System Metrics (auto-collected):**
```
nordi_nodejs_heap_size_used_bytes
nordi_nodejs_event_loop_lag_seconds
nordi_nodejs_gc_duration_seconds
nordi_process_cpu_seconds_total
```

Prometheus scrapes `/metrics` every 15s (configured via `prometheus.io/scrape` pod annotation).

### ELK Stack Integration (`logs/elkstack.logs.ts`)

Structured JSON logs shipped to Elasticsearch via Logstash:
- Kibana dashboards for request tracing, error rates, latency percentiles
- Log correlation via `requestId` (X-Request-ID header)

### Grafana Dashboards (`logs/grafana.logs.ts`)

Pre-built dashboards for:
- API performance (p50/p95/p99 latency, error rate)
- Transaction volume and value
- KYC pipeline throughput
- Fraud signal distribution
- Infrastructure health (CPU, memory, event loop)

### Sentry Error Tracking (`logs/sentry.logs.ts`)

Automatic exception capture with:
- Stack trace capture for unhandled errors
- User context attachment (userId, role)
- Release tracking per deployment
- Performance transaction tracing

---

## Terraform (`terraform/`)

Infrastructure-as-code for cloud resource provisioning:
- MongoDB Atlas cluster
- Redis Cloud instance
- Kafka cluster (Confluent or MSK)
- Container registry
- Load balancer

---

## Environment Configuration Reference

All environment variables are typed and validated in `config/env.config.ts`. The application will not start if required variables are missing.

```
Required for all environments:
  NODE_ENV, PORT, MONGODB_URI, JWT_SECRET, ENCRYPTION_KEY

Required for production:
  REDIS_HOST/REDIS_PASSWORD
  CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET
  SMTP_HOST/PORT/USER/PASSWORD
  KAFKA_BROKERS
  SENTRY_DSN

Feature flags:
  ENABLE_2FA=true
  ENABLE_KYC_VERIFICATION=true
  ENABLE_FRAUD_DETECTION=true
  ML_SERVICE_URL=http://ml-service:8000
```

---

## Makefile Operations

```bash
make dev          # Start development environment
make build        # TypeScript compile
make test         # Run test suite
make lint         # ESLint check
make typecheck    # TypeScript type check
make docker:dev   # Docker development environment
make docker:prod  # Docker production build
make db:seed      # Seed admin user
make db:indexes   # Create MongoDB indexes
```
