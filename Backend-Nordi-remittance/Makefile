# ============================================================================
#  Nordi Remittance Backend — Makefile
#  Runtime: Node.js | DB: MongoDB 7.x (Mongoose) | Cache: Redis | Queue: BullMQ
#  Streaming: Kafka (KRaft) | K8s: kubectl | IaC: Terraform
# ============================================================================

.PHONY: help dev start clean install lint lint-fix typecheck validate \
        test test-run test-watch test-coverage test-ui \
        db-seed db-indexes db-status db-shell \
        docker-up docker-down docker-rebuild docker-logs docker-ps \
        docker-up-infra docker-clean docker-shell \
        redis-cli redis-flush redis-monitor redis-info redis-keys \
        mongo-shell mongo-status mongo-dump mongo-restore \
        kafka-init kafka-start kafka-stop kafka-restart kafka-status kafka-logs \
        kafka-topics kafka-create-topics kafka-describe kafka-console kafka-clean kafka-setup \
        queue-status queue-flush \
        k8s-apply k8s-delete k8s-status k8s-logs k8s-port-forward \
        k8s-restart k8s-rollout-status k8s-describe k8s-exec \
        tf-init tf-plan tf-apply tf-destroy tf-output tf-fmt tf-validate \
        build build-no-cache docker-tag docker-push \
        health health-ready health-detailed metrics api-info \
        check-env gen-env logs-tail

# ─────────────── CONFIG ───────────────

APP_NAME   := nordi-remittance
PORT       := 3000
API_URL    := http://localhost:$(PORT)
K8S_NS     := nordi
MONGO_CONTAINER := remit-mongo
MONGO_DB        := remit

# Colors
CYAN    := \033[36m
GREEN   := \033[32m
YELLOW  := \033[33m
RED     := \033[31m
RESET   := \033[0m
BOLD    := \033[1m

# ============================================================================
#  HELP
# ============================================================================

help: ## Show all available commands
	@echo ""
	@echo "$(BOLD)$(CYAN)  Nordi Remittance Backend — Command Reference$(RESET)"
	@echo "$(CYAN)  ──────────────────────────────────────────────$(RESET)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-22s$(RESET) %s\n", $$1, $$2}'
	@echo ""

.DEFAULT_GOAL := help

# ============================================================================
#  DEVELOPMENT
# ============================================================================

install: ## Install all dependencies with npm
	npm install

dev: kafka-start ## Start dev server with hot-reload (tsx + nodemon) + Kafka
	npm run dev

start: ## Start production server
	npm run start

start-dev: ## Start dev server without nodemon
	npm run start:dev

watch: ## Start dev server in watch mode
	npm run dev:hot

clean: ## Remove build artifacts and caches
	rm -rf dist coverage node_modules/.cache
	@echo "$(GREEN)✓ Cleaned$(RESET)"

reinstall: clean install ## Clean install

# ============================================================================
#  CODE QUALITY
# ============================================================================

lint: ## Run ESLint on all files
	npm run lint

lint-fix: ## Run ESLint with auto-fix
	npm run lint:fix

typecheck: ## Run TypeScript type checking
	npm run typecheck

validate: ## Run typecheck + lint + tests
	npm run validate

# ============================================================================
#  TESTING
# ============================================================================

test: ## Run tests once and exit
	npm run test

test-watch: ## Run tests in watch mode
	npm run test:watch

test-coverage: ## Run tests with coverage report
	npm run test:coverage

test-ui: ## Open Vitest UI
	npm run test:ui

test-quick: ## Run tests without coverage (faster)
	NODE_ENV=test npx vitest run --no-coverage

# ============================================================================
#  DATABASE (MongoDB 7.x — Mongoose)
# ============================================================================

db-seed: ## Seed database (creates super admin + defaults)
	npm run db:seed

db-indexes: ## Create all MongoDB indexes
	npm run db:create-indexes

db-verify: ## Verify query performance and index coverage
	npm run db:verify-performance

db-status: ## Ping MongoDB and print connection info
	@docker compose exec $(MONGO_CONTAINER) mongosh --eval \
		"db.adminCommand('ping')" --quiet $(MONGO_DB) 2>/dev/null \
		&& echo "$(GREEN)✓ MongoDB is up$(RESET)" \
		|| echo "$(RED)✗ MongoDB not reachable$(RESET)"

db-shell: ## Open a mongosh shell in the running container
	docker compose exec $(MONGO_CONTAINER) mongosh $(MONGO_DB)

mongo-shell: db-shell ## Alias for db-shell

mongo-status: db-status ## Alias for db-status

mongo-dump: ## Dump the database to ./backups/
	@mkdir -p backups
	docker compose exec $(MONGO_CONTAINER) mongodump \
		--db $(MONGO_DB) --out /tmp/dump
	docker cp $$(docker compose ps -q $(MONGO_CONTAINER)):/tmp/dump ./backups/dump-$$(date +%Y%m%d-%H%M%S)
	@echo "$(GREEN)✓ Dump saved to ./backups/$(RESET)"

mongo-restore: ## Restore latest dump (usage: make mongo-restore dump=backups/dump-20260101-120000)
	docker compose exec $(MONGO_CONTAINER) mongorestore \
		--db $(MONGO_DB) --drop /tmp/restore
	@echo "$(YELLOW)⚠ Restore requires: docker cp <dump> container:/tmp/restore first$(RESET)"

# ============================================================================
#  DOCKER COMPOSE
# ============================================================================

docker-up: ## Start all services (app + infra) in detached mode
	docker compose up -d

docker-up-infra: ## Start only Docker infrastructure (mongo, redis)
	docker compose up -d mongo redis

docker-down: ## Stop all running services
	docker compose down

docker-rebuild: ## Rebuild and restart app container
	docker compose up -d --build app

docker-logs: ## Tail logs from all containers
	docker compose logs -f --tail=100

docker-logs-app: ## Tail logs from app container only
	docker compose logs -f --tail=100 app

docker-logs-db: ## Tail logs from MongoDB container
	docker compose logs -f --tail=50 mongo

docker-ps: ## List running containers with status
	docker compose ps

docker-shell: ## Open a shell inside the running app container
	docker compose exec app sh

docker-clean: ## Stop everything, remove volumes (destructive)
	docker compose down -v --remove-orphans
	@echo "$(YELLOW)⚠ Volumes removed — data is gone$(RESET)"

docker-restart: docker-down docker-up ## Restart all services

# ============================================================================
#  REDIS
# ============================================================================

redis-cli: ## Open Redis CLI connected to local instance
	docker compose exec redis redis-cli

redis-flush: ## Flush all Redis data (destructive)
	docker compose exec redis redis-cli FLUSHALL
	@echo "$(YELLOW)⚠ Redis flushed$(RESET)"

redis-monitor: ## Watch all Redis commands in real time
	docker compose exec redis redis-cli MONITOR

redis-info: ## Show Redis server info and memory usage
	docker compose exec redis redis-cli INFO memory | head -20

redis-keys: ## List all keys in Redis (dev only)
	docker compose exec redis redis-cli KEYS '*'

# ============================================================================
#  KAFKA (4.2.0 KRaft — no Zookeeper)
#  Local: Kafka installed at /usr/local/kafka (on PATH via .zshrc)
#  Production: Set KAFKA_BROKERS, KAFKA_SSL, KAFKA_SASL_* in .env
# ============================================================================

KAFKA_CONFIG     := /usr/local/kafka/config/server.properties
KAFKA_LOG_DIR    := /tmp/kraft-combined-logs
KAFKA_STORAGE    := kafka-storage.sh
KAFKA_SERVER     := kafka-server-start.sh
KAFKA_SERVER_STOP:= kafka-server-stop.sh
KAFKA_TOPICS_CMD := kafka-topics.sh
KAFKA_CONSOLE_CMD:= kafka-console-consumer.sh
KAFKA_BOOTSTRAP  := localhost:9092

NORDI_TOPICS := nordi.transaction.initiated nordi.transaction.processed \
	nordi.transaction.completed nordi.transaction.failed \
	nordi.kyc.submitted nordi.kyc.verified nordi.kyc.rejected \
	nordi.security.fraud_alert \
	nordi.user.registered nordi.user.login nordi.user.deleted \
	nordi.notifications.push nordi.notifications.email nordi.notifications.sms \
	nordi.dlq

kafka-init: ## Format KRaft storage (run once on first setup)
	@echo "$(CYAN)Generating cluster UUID and formatting KRaft storage...$(RESET)"
	$(eval CLUSTER_ID := $(shell $(KAFKA_STORAGE) random-uuid))
	$(KAFKA_STORAGE) format -t $(CLUSTER_ID) --standalone -c $(KAFKA_CONFIG)
	@echo "$(GREEN)✓ KRaft storage formatted with cluster ID: $(CLUSTER_ID)$(RESET)"

kafka-start: ## Start Kafka broker (KRaft mode, background)
	@if lsof -i :9092 -sTCP:LISTEN -t >/dev/null 2>&1; then \
		echo "$(YELLOW)⚠ Kafka already running on port 9092$(RESET)"; \
	else \
		echo "$(CYAN)Starting Kafka (KRaft mode)...$(RESET)"; \
		$(KAFKA_SERVER) -daemon $(KAFKA_CONFIG); \
		TRIES=0; \
		while [ $$TRIES -lt 12 ]; do \
			sleep 2; \
			TRIES=$$((TRIES + 1)); \
			if lsof -i :9092 -sTCP:LISTEN -t >/dev/null 2>&1; then \
				echo "$(GREEN)✓ Kafka running on $(KAFKA_BOOTSTRAP) (took $$((TRIES * 2))s)$(RESET)"; \
				break; \
			fi; \
			echo "$(YELLOW)  waiting for Kafka... ($$((TRIES * 2))s)$(RESET)"; \
		done; \
		if ! lsof -i :9092 -sTCP:LISTEN -t >/dev/null 2>&1; then \
			echo "$(RED)✗ Kafka failed to start after 24s — check logs: $(KAFKA_LOG_DIR)/server.log$(RESET)"; \
		fi \
	fi

kafka-stop: ## Stop Kafka broker
	@echo "$(CYAN)Stopping Kafka...$(RESET)"
	$(KAFKA_SERVER_STOP) || true
	@echo "$(GREEN)✓ Kafka stopped$(RESET)"

kafka-restart: kafka-stop kafka-start ## Restart Kafka broker

kafka-status: ## Check if Kafka is running
	@if lsof -i :9092 -sTCP:LISTEN -t >/dev/null 2>&1; then \
		echo "$(GREEN)✓ Kafka is running on port 9092$(RESET)"; \
	else \
		echo "$(RED)✗ Kafka is not running$(RESET)"; \
	fi

kafka-logs: ## Tail Kafka server logs
	tail -f $(KAFKA_LOG_DIR)/server.log

kafka-topics: ## List all Kafka topics
	$(KAFKA_TOPICS_CMD) --bootstrap-server $(KAFKA_BOOTSTRAP) --list

kafka-create-topics: ## Create all Nordi Kafka topics
	@for topic in $(NORDI_TOPICS); do \
		$(KAFKA_TOPICS_CMD) --bootstrap-server $(KAFKA_BOOTSTRAP) \
			--create --topic $$topic --partitions 3 --replication-factor 1 --if-not-exists; \
	done
	@echo "$(GREEN)✓ All Nordi topics created$(RESET)"

kafka-describe: ## Describe a Kafka topic (usage: make kafka-describe topic=nordi.user.registered)
	$(KAFKA_TOPICS_CMD) --bootstrap-server $(KAFKA_BOOTSTRAP) --describe --topic $(topic)

kafka-console: ## Consume messages from a topic (usage: make kafka-console topic=nordi.transaction.initiated)
	$(KAFKA_CONSOLE_CMD) --bootstrap-server $(KAFKA_BOOTSTRAP) --topic $(topic) --from-beginning

kafka-clean: ## Delete KRaft storage and logs (destructive — requires kafka-init again)
	@echo "$(YELLOW)⚠ Removing Kafka storage at $(KAFKA_LOG_DIR)$(RESET)"
	rm -rf $(KAFKA_LOG_DIR)
	@echo "$(GREEN)✓ Kafka storage cleaned — run 'make kafka-init' before next start$(RESET)"

kafka-setup: kafka-init kafka-start kafka-create-topics ## One-liner: init + start + create topics (first time)

# ============================================================================
#  KUBERNETES
# ============================================================================

k8s-apply: ## Apply all K8s manifests to cluster
	kubectl apply -f k8s/namespace.yaml
	kubectl apply -f k8s/configmap.yaml
	kubectl apply -f k8s/secrets.yaml
	kubectl apply -f k8s/deployment.yaml
	kubectl apply -f k8s/service.yaml

k8s-delete: ## Delete all K8s resources in the namespace
	kubectl delete -f k8s/ --ignore-not-found

k8s-status: ## Show pods, services, and deployments in namespace
	@echo "$(CYAN)── Pods ──$(RESET)"
	kubectl get pods -n $(K8S_NS)
	@echo "\n$(CYAN)── Services ──$(RESET)"
	kubectl get svc -n $(K8S_NS)
	@echo "\n$(CYAN)── Deployments ──$(RESET)"
	kubectl get deploy -n $(K8S_NS)

k8s-logs: ## Tail logs from the app deployment
	kubectl logs -f -n $(K8S_NS) -l app=$(APP_NAME) --tail=100

k8s-port-forward: ## Forward local port to K8s service (localhost:5000)
	kubectl port-forward -n $(K8S_NS) svc/$(APP_NAME) $(PORT):$(PORT)

k8s-restart: ## Restart the deployment (rolling)
	kubectl rollout restart deployment/$(APP_NAME) -n $(K8S_NS)

k8s-rollout-status: ## Watch rollout status
	kubectl rollout status deployment/$(APP_NAME) -n $(K8S_NS)

k8s-describe: ## Describe pods for debugging
	kubectl describe pods -n $(K8S_NS) -l app=$(APP_NAME)

k8s-exec: ## Open a shell in the running K8s pod
	kubectl exec -it -n $(K8S_NS) $$(kubectl get pod -n $(K8S_NS) -l app=$(APP_NAME) -o jsonpath='{.items[0].metadata.name}') -- sh

# ============================================================================
#  TERRAFORM
# ============================================================================

tf-init: ## Initialize Terraform working directory
	cd terraform && terraform init

tf-plan: ## Preview infrastructure changes
	cd terraform && terraform plan

tf-apply: ## Apply infrastructure changes
	cd terraform && terraform apply

tf-destroy: ## Destroy all managed infrastructure (destructive)
	cd terraform && terraform destroy

tf-output: ## Show Terraform outputs
	cd terraform && terraform output

tf-fmt: ## Format Terraform files
	cd terraform && terraform fmt -recursive

tf-validate: ## Validate Terraform configuration
	cd terraform && terraform validate

# ============================================================================
#  HEALTH & DIAGNOSTICS
# ============================================================================

health: ## Hit the health endpoint
	@curl -sf $(API_URL)/health | node -e "process.stdin.on('data',d=>console.log(JSON.stringify(JSON.parse(d),null,2)))" 2>/dev/null || echo "$(RED)✗ Server not reachable at $(API_URL)$(RESET)"

health-ready: ## Check readiness probe
	@curl -sf $(API_URL)/health/ready | node -e "process.stdin.on('data',d=>console.log(JSON.stringify(JSON.parse(d),null,2)))" 2>/dev/null || echo "$(RED)✗ Not ready$(RESET)"

health-detailed: ## Full health check with all service statuses
	@curl -sf $(API_URL)/health/detailed | node -e "process.stdin.on('data',d=>console.log(JSON.stringify(JSON.parse(d),null,2)))" 2>/dev/null || echo "$(RED)✗ Not reachable$(RESET)"

metrics: ## Fetch Prometheus metrics
	@curl -sf $(API_URL)/metrics | head -40

api-info: ## Show API version and available endpoints
	@curl -sf $(API_URL)/api/v1 | node -e "process.stdin.on('data',d=>console.log(JSON.stringify(JSON.parse(d),null,2)))" 2>/dev/null || echo "$(RED)✗ Not reachable$(RESET)"

# ============================================================================
#  ENVIRONMENT
# ============================================================================

check-env: ## Validate required environment variables are set
	@echo "$(CYAN)Checking environment variables...$(RESET)"
	@test -f .env && echo "$(GREEN)✓ .env file found$(RESET)" || echo "$(RED)✗ .env file missing$(RESET)"
	@grep -q MONGODB_URI .env 2>/dev/null && echo "$(GREEN)✓ MONGODB_URI (in .env)$(RESET)" || echo "$(YELLOW)⚠ MONGODB_URI not set$(RESET)"
	@grep -q REDIS_HOST .env 2>/dev/null && echo "$(GREEN)✓ REDIS_HOST (in .env)$(RESET)" || echo "$(YELLOW)⚠ REDIS_HOST not set$(RESET)"
	@grep -q JWT_SECRET .env 2>/dev/null && echo "$(GREEN)✓ JWT_SECRET (in .env)$(RESET)" || echo "$(YELLOW)⚠ JWT_SECRET not set$(RESET)"
	@grep -q KAFKA_BROKERS .env 2>/dev/null && echo "$(GREEN)✓ KAFKA_BROKERS (in .env)$(RESET)" || echo "$(YELLOW)⚠ KAFKA_BROKERS not set — Kafka will be skipped$(RESET)"
	@grep -q SMTP_HOST .env 2>/dev/null && echo "$(GREEN)✓ SMTP_HOST (in .env)$(RESET)" || echo "$(YELLOW)⚠ SMTP_HOST not set$(RESET)"

gen-env: ## Generate .env from .env.example (won't overwrite existing)
	@test -f .env && echo "$(YELLOW)⚠ .env already exists — skipping$(RESET)" || (cp .env.example .env && echo "$(GREEN)✓ .env created from .env.example$(RESET)")

# ============================================================================
#  BUILD & DEPLOY
# ============================================================================

build: ## Build TypeScript to dist/
	npm run build

build-check: typecheck lint test ## Full build check (typecheck + lint + test)
	@echo "$(GREEN)✓ Build check passed$(RESET)"

docker-image: ## Build production Docker image
	docker build -t $(APP_NAME)-api:latest .

docker-image-nc: ## Build Docker image without cache
	docker build --no-cache -t $(APP_NAME)-api:latest .

docker-tag: ## Tag image for registry (usage: make docker-tag registry=ghcr.io/org)
	docker tag $(APP_NAME)-api:latest $(registry)/$(APP_NAME)-api:latest

docker-push: ## Push image to registry (usage: make docker-push registry=ghcr.io/org)
	docker push $(registry)/$(APP_NAME)-api:latest

# ============================================================================
#  LOGS & MONITORING
# ============================================================================

logs-tail: ## Tail application logs in dev
	@tail -f logs/*.log 2>/dev/null || echo "$(YELLOW)No log files found — start the server first$(RESET)"

ports: ## Check what's running on key ports
	@echo "$(CYAN)Checking ports...$(RESET)"
	@lsof -i :$(PORT) -sTCP:LISTEN -t >/dev/null 2>&1 && echo "$(RED)Port $(PORT) (API): IN USE$(RESET)" || echo "Port $(PORT) (API): $(GREEN)available$(RESET)"
	@lsof -i :27017 -sTCP:LISTEN -t >/dev/null 2>&1 && echo "$(GREEN)\u2713 Port 27017 (MongoDB): running$(RESET)" || echo "Port 27017 (MongoDB): $(YELLOW)not running$(RESET)"
	@lsof -i :6379 -sTCP:LISTEN -t >/dev/null 2>&1 && echo "$(GREEN)\u2713 Port 6379 (Redis): running$(RESET)" || echo "Port 6379 (Redis): $(YELLOW)not running$(RESET)"
	@lsof -i :9092 -sTCP:LISTEN -t >/dev/null 2>&1 && echo "$(GREEN)\u2713 Port 9092 (Kafka): running$(RESET)" || echo "Port 9092 (Kafka): $(YELLOW)not running$(RESET)"

kill-port: ## Kill process on the API port
	@lsof -ti:$(PORT) | xargs kill -9 2>/dev/null && echo "$(GREEN)\u2713 Killed process on port $(PORT)$(RESET)" || echo "$(GREEN)No process on port $(PORT)$(RESET)"

# ============================================================================
#  BULLMQ / QUEUE
# ============================================================================

queue-status: ## List active BullMQ queue keys in Redis
	@echo "$(CYAN)BullMQ queue keys:$(RESET)"
	@docker compose exec redis redis-cli KEYS "nordi-*" 2>/dev/null | sort || echo "$(YELLOW)Redis not accessible$(RESET)"

queue-flush: ## Flush all BullMQ queues — DESTRUCTIVE
	@echo "$(RED)\u26a0 This will delete all pending/failed BullMQ jobs.$(RESET)"
	@read -p "Continue? [y/N] " c && [ "$$c" = "y" ] || exit 0
	@docker compose exec redis redis-cli --scan --pattern "nordi-*" | xargs -r docker compose exec redis redis-cli DEL
	@echo "$(GREEN)\u2713 Queues flushed$(RESET)"

# ============================================================================
#  COMPOUND / WORKFLOW COMMANDS
# ============================================================================

setup: install db-indexes ## First-time project setup (install + create indexes)
	@echo "$(GREEN)✓ Setup complete. Run 'make dev' to start.$(RESET)"

infra: docker-up-infra kafka-start ## Start all infrastructure (MongoDB + Redis + Kafka)
	@echo "$(GREEN)✓ Infrastructure ready (mongo, redis, kafka)$(RESET)"

fresh: docker-up-infra kafka-start db-seed db-indexes ## Fresh start: infra + Kafka + seed + indexes
	@echo "$(GREEN)✓ Fresh environment ready$(RESET)"

deploy-k8s: build docker-image k8s-apply ## Build and deploy to Kubernetes
	@echo "$(GREEN)✓ Deployed to Kubernetes$(RESET)"

ci: lint typecheck test ## CI pipeline: lint + typecheck + test
	@echo "$(GREEN)✓ CI checks passed$(RESET)"

precommit: lint-fix typecheck test-quick ## Pre-commit checks
	@echo "$(GREEN)✓ Pre-commit checks passed$(RESET)"

nuke: docker-clean clean ## Nuclear option: remove everything (containers, volumes, node_modules)
	rm -rf node_modules
	@echo "$(RED)✗ Everything destroyed. Run 'make setup' to rebuild.$(RESET)"