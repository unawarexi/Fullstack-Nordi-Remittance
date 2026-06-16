# ============================================================================
# NORDI REMITTANCE — ROOT MAKEFILE
# Master entry point for the entire monorepo
# Usage: make help | make up | make dev | make prod | make down
# ============================================================================

.PHONY: help up down dev prod build logs health status clean \
        kafka-ui mongo-ui kafka-topics kafka-create-topics \
        ml-up ml-logs ml-health backend-shell ml-shell \
        tf-plan tf-apply deploy-k8s install

# ── Config ────────────────────────────────────────────────────────────────────
COMPOSE_DEV  := docker compose -f docker-compose.yml
COMPOSE_PROD := docker compose -f docker-compose.prod.yml

CYAN    := \033[36m
GREEN   := \033[32m
YELLOW  := \033[33m
RED     := \033[31m
RESET   := \033[0m
BOLD    := \033[1m

.DEFAULT_GOAL := help

# ── Help ─────────────────────────────────────────────────────────────────────

help: ## Show all available commands
	@echo ""
	@echo "$(BOLD)$(CYAN)  Nordi Remittance — Monorepo Command Reference$(RESET)"
	@echo "$(CYAN)  ─────────────────────────────────────────────$(RESET)"
	@echo ""
	@echo "$(BOLD)  🚀 Quick Start:$(RESET)"
	@echo "  $(GREEN)make up$(RESET)              Start all services (dev)"
	@echo "  $(GREEN)make prod$(RESET)            Start all services (production)"
	@echo "  $(GREEN)make down$(RESET)            Stop all services"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-22s$(RESET) %s\n", $$1, $$2}'
	@echo ""

# ── Development Stack ─────────────────────────────────────────────────────────

up: ## Start full dev stack (API + Frontend + ML + Kafka + DB)
	@echo "$(CYAN)Starting Nordi Remittance development stack...$(RESET)"
	$(COMPOSE_DEV) up -d --build
	@echo ""
	@echo "$(GREEN)✓ Stack is up!$(RESET)"
	@echo "  API:       http://localhost:3000"
	@echo "  Frontend:  http://localhost:5173"
	@echo "  ML:        http://localhost:8000"
	@echo "  Kafka UI:  http://localhost:8090"
	@echo "  Mongo UI:  http://localhost:8081"

up-infra: ## Start only infrastructure (MongoDB, Redis, Kafka) — no app
	@echo "$(CYAN)Starting infrastructure services...$(RESET)"
	$(COMPOSE_DEV) up -d mongo redis kafka kafka-ui
	@echo "$(GREEN)✓ Infrastructure ready$(RESET)"

up-api: ## Start API + infrastructure (no frontend/ML)
	$(COMPOSE_DEV) up -d mongo redis kafka api
	@echo "$(GREEN)✓ API stack ready$(RESET)"

down: ## Stop all dev services
	$(COMPOSE_DEV) down
	@echo "$(GREEN)✓ All services stopped$(RESET)"

down-v: ## Stop all dev services and remove volumes (destructive)
	$(COMPOSE_DEV) down -v --remove-orphans
	@echo "$(YELLOW)⚠ Volumes removed — all data lost$(RESET)"

dev: up ## Alias for 'make up'

restart: down up ## Restart all dev services


rebuild: ## Rebuild all images and restart
	$(COMPOSE_DEV) up -d --build --force-recreate
	@echo "$(GREEN)✓ All containers rebuilt$(RESET)"

# ── Production Stack ──────────────────────────────────────────────────────────

prod: ## Start full production stack (with resource limits + auth)
	@echo "$(CYAN)Starting Nordi Remittance PRODUCTION stack...$(RESET)"
	@test -f .env.prod || (echo "$(RED)✗ .env.prod not found — copy .env.prod.example and fill in values$(RESET)" && exit 1)
	$(COMPOSE_PROD) up -d --build
	@echo ""
	@echo "$(GREEN)✓ Production stack is up!$(RESET)"
	@echo "  API:       http://localhost:3000"
	@echo "  Kafka UI:  http://localhost:8090  (auth required)"

prod-down: ## Stop production stack
	$(COMPOSE_PROD) down

prod-logs: ## Tail logs from production stack
	$(COMPOSE_PROD) logs -f --tail=100

# ── Build ─────────────────────────────────────────────────────────────────────

build: ## Build all Docker images
	@echo "$(CYAN)Building all images...$(RESET)"
	$(COMPOSE_DEV) build --parallel
	@echo "$(GREEN)✓ All images built$(RESET)"

build-backend: ## Build backend image only
	cd Backend-Nordi-remittance && $(MAKE) docker-image

build-ml: ## Build ML service image only
	cd Nordi-Machine-Learning && docker build -t nordi-ml:latest .

# ── Logs ─────────────────────────────────────────────────────────────────────

logs: ## Tail logs from all containers
	$(COMPOSE_DEV) logs -f --tail=100

logs-api: ## Tail API logs
	$(COMPOSE_DEV) logs -f --tail=100 api

logs-ml: ## Tail ML service logs
	$(COMPOSE_DEV) logs -f --tail=100 ml

logs-kafka: ## Tail Kafka logs
	$(COMPOSE_DEV) logs -f --tail=50 kafka

logs-db: ## Tail MongoDB logs
	$(COMPOSE_DEV) logs -f --tail=50 mongo

# ── Health & Status ───────────────────────────────────────────────────────────

health: ## Check health of all services
	@echo "$(CYAN)Checking service health...$(RESET)"
	@curl -sf http://localhost:3000/health | python3 -m json.tool 2>/dev/null \
		&& echo "$(GREEN)✓ API$(RESET)" || echo "$(RED)✗ API not reachable$(RESET)"
	@curl -sf http://localhost:8000/health | python3 -m json.tool 2>/dev/null \
		&& echo "$(GREEN)✓ ML Service$(RESET)" || echo "$(RED)✗ ML not reachable$(RESET)"
	@curl -sf http://localhost:8090/actuator/health 2>/dev/null | grep -q "UP" \
		&& echo "$(GREEN)✓ Kafka UI$(RESET)" || echo "$(YELLOW)⚠ Kafka UI pending$(RESET)"

status: ## Show all running containers
	$(COMPOSE_DEV) ps

ports: ## Check all service ports
	@echo "$(CYAN)Port status:$(RESET)"
	@lsof -i :3000 -sTCP:LISTEN -t >/dev/null 2>&1 && echo "$(GREEN)✓ 3000 (API): running$(RESET)"      || echo "$(YELLOW)· 3000 (API): not running$(RESET)"
	@lsof -i :5173 -sTCP:LISTEN -t >/dev/null 2>&1 && echo "$(GREEN)✓ 5173 (Frontend): running$(RESET)" || echo "$(YELLOW)· 5173 (Frontend): not running$(RESET)"
	@lsof -i :8000 -sTCP:LISTEN -t >/dev/null 2>&1 && echo "$(GREEN)✓ 8000 (ML): running$(RESET)"       || echo "$(YELLOW)· 8000 (ML): not running$(RESET)"
	@lsof -i :9092 -sTCP:LISTEN -t >/dev/null 2>&1 && echo "$(GREEN)✓ 9092 (Kafka): running$(RESET)"    || echo "$(YELLOW)· 9092 (Kafka): not running$(RESET)"
	@lsof -i :8090 -sTCP:LISTEN -t >/dev/null 2>&1 && echo "$(GREEN)✓ 8090 (Kafka UI): running$(RESET)" || echo "$(YELLOW)· 8090 (Kafka UI): not running$(RESET)"
	@lsof -i :27017 -sTCP:LISTEN -t >/dev/null 2>&1 && echo "$(GREEN)✓ 27017 (MongoDB): running$(RESET)" || echo "$(YELLOW)· 27017 (MongoDB): not running$(RESET)"
	@lsof -i :6379 -sTCP:LISTEN -t >/dev/null 2>&1 && echo "$(GREEN)✓ 6379 (Redis): running$(RESET)"    || echo "$(YELLOW)· 6379 (Redis): not running$(RESET)"

# ── UIs ───────────────────────────────────────────────────────────────────────

kafka-ui: ## Open Kafka UI in browser
	@echo "$(CYAN)Opening Kafka UI at http://localhost:8090$(RESET)"
	@open http://localhost:8090 2>/dev/null || xdg-open http://localhost:8090 2>/dev/null || echo "Visit http://localhost:8090"

mongo-ui: ## Open MongoDB Express in browser
	@echo "$(CYAN)Opening MongoDB Express at http://localhost:8081$(RESET)"
	@open http://localhost:8081 2>/dev/null || xdg-open http://localhost:8081 2>/dev/null || echo "Visit http://localhost:8081"

# ── Kafka ─────────────────────────────────────────────────────────────────────

kafka-topics: ## List all Kafka topics (via Docker)
	$(COMPOSE_DEV) exec kafka /opt/kafka/bin/kafka-topics.sh \
		--bootstrap-server localhost:9092 --list

kafka-create-topics: ## Create all Nordi Kafka topics in Docker
	@for topic in \
		nordi.transaction.initiated nordi.transaction.processed \
		nordi.transaction.completed nordi.transaction.failed \
		nordi.kyc.submitted nordi.kyc.verified nordi.kyc.rejected \
		nordi.security.fraud_alert \
		nordi.user.registered nordi.user.login nordi.user.deleted \
		nordi.notifications.push nordi.notifications.email nordi.notifications.sms \
		nordi.dlq; do \
		$(COMPOSE_DEV) exec kafka /opt/kafka/bin/kafka-topics.sh \
			--bootstrap-server localhost:9092 \
			--create --topic $$topic --partitions 3 --replication-factor 1 --if-not-exists; \
	done
	@echo "$(GREEN)✓ All Nordi topics created$(RESET)"

kafka-status: ## Check Kafka broker status
	@$(COMPOSE_DEV) exec kafka /opt/kafka/bin/kafka-broker-api-versions.sh \
		--bootstrap-server localhost:9092 >/dev/null 2>&1 \
		&& echo "$(GREEN)✓ Kafka is running$(RESET)" \
		|| echo "$(RED)✗ Kafka not reachable$(RESET)"

# ── Shells ────────────────────────────────────────────────────────────────────

backend-shell: ## Open shell inside the API container
	$(COMPOSE_DEV) exec api sh

ml-shell: ## Open shell inside the ML container
	$(COMPOSE_DEV) exec ml bash

mongo-shell: ## Open mongosh shell
	$(COMPOSE_DEV) exec mongo mongosh remit

redis-cli: ## Open Redis CLI
	$(COMPOSE_DEV) exec redis redis-cli

# ── Env Setup ─────────────────────────────────────────────────────────────────

gen-env: ## Generate backend .env from .env.example
	cd Backend-Nordi-remittance && $(MAKE) gen-env

gen-env-ml: ## Generate ML .env from .env.example
	cd Nordi-Machine-Learning && $(MAKE) env

gen-env-prod: ## Copy .env.prod.example → .env.prod
	@test -f .env.prod \
		&& echo "$(YELLOW)⚠ .env.prod already exists — skipping$(RESET)" \
		|| (cp .env.prod.example .env.prod && echo "$(GREEN)✓ .env.prod created — fill in production values$(RESET)")

# ── Install ────────────────────────────────────────────────────────────────────

install: ## Install all dependencies (backend + frontend)
	@echo "$(CYAN)Installing backend dependencies...$(RESET)"
	cd Backend-Nordi-remittance && npm ci
	@echo "$(CYAN)Installing frontend dependencies...$(RESET)"
	cd Frontend-Nordi-Remittance && npm ci
	@echo "$(GREEN)✓ All dependencies installed$(RESET)"

install-ml: ## Install ML Python dependencies
	cd Nordi-Machine-Learning && $(MAKE) setup

# ── Kubernetes ────────────────────────────────────────────────────────────────

k8s-apply: ## Apply all k8s manifests (backend + ML)
	@echo "$(CYAN)Applying backend k8s manifests...$(RESET)"
	cd Backend-Nordi-remittance && $(MAKE) k8s-apply
	@echo "$(CYAN)Applying ML k8s manifests...$(RESET)"
	cd Nordi-Machine-Learning && $(MAKE) k8s-apply
	@echo "$(GREEN)✓ All k8s manifests applied$(RESET)"

k8s-status: ## Show k8s status for all services
	cd Backend-Nordi-remittance && $(MAKE) k8s-status

k8s-delete: ## Delete all k8s resources
	cd Backend-Nordi-remittance && $(MAKE) k8s-delete
	cd Nordi-Machine-Learning && $(MAKE) k8s-delete

# ── Terraform ─────────────────────────────────────────────────────────────────

tf-init: ## Initialize Terraform
	cd Backend-Nordi-remittance && $(MAKE) tf-init

tf-plan: ## Preview infrastructure changes
	cd Backend-Nordi-remittance && $(MAKE) tf-plan

tf-apply: ## Apply infrastructure to AWS
	cd Backend-Nordi-remittance && $(MAKE) tf-apply

# ── CI / Quality ──────────────────────────────────────────────────────────────

lint: ## Lint backend + frontend
	npm run lint

test: ## Run all tests (backend + frontend)
	npm run test

validate: ## Full validation: typecheck + lint + test
	npm run validate

ci: lint test ## Run CI checks

# ── Cleanup ───────────────────────────────────────────────────────────────────

clean: ## Remove build artifacts (no volumes)
	$(COMPOSE_DEV) down --remove-orphans
	cd Backend-Nordi-remittance && rm -rf dist coverage node_modules/.cache
	cd Frontend-Nordi-Remittance && rm -rf dist
	@echo "$(GREEN)✓ Cleaned$(RESET)"

nuke: ## Nuclear option — remove EVERYTHING including volumes
	$(COMPOSE_DEV) down -v --remove-orphans
	cd Backend-Nordi-remittance && rm -rf dist coverage node_modules
	cd Frontend-Nordi-Remittance && rm -rf dist node_modules
	@echo "$(RED)✗ Everything destroyed. Run 'make install && make up' to rebuild.$(RESET)"

# ── Full Setup (First-time) ───────────────────────────────────────────────────

setup: install up kafka-create-topics ## First-time setup: install → start → create Kafka topics
	@echo ""
	@echo "$(GREEN)$(BOLD)✓ Nordi Remittance is ready!$(RESET)"
	@echo ""
	@echo "  API:       $(CYAN)http://localhost:3000$(RESET)"
	@echo "  Frontend:  $(CYAN)http://localhost:5173$(RESET)"
	@echo "  ML:        $(CYAN)http://localhost:8000$(RESET)"
	@echo "  Kafka UI:  $(CYAN)http://localhost:8090$(RESET)"
	@echo "  Mongo UI:  $(CYAN)http://localhost:8081$(RESET)"
	@echo ""
