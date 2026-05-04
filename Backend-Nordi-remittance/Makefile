# ============================================================================
# REMIT BACKEND - MAKEFILE
# ============================================================================
# Usage: make <target>
# Run 'make help' for available commands
# ============================================================================

.PHONY: help install dev start build test lint clean docker db all kafka queue

# Colors for terminal output
CYAN := \033[36m
GREEN := \033[32m
YELLOW := \033[33m
RED := \033[31m
RESET := \033[0m

# ============================================================================
# HELP
# ============================================================================

help: ## Show this help message
	@echo "$(CYAN)╔════════════════════════════════════════════════════════════╗$(RESET)"
	@echo "$(CYAN)║         REMIT BACKEND - AVAILABLE COMMANDS                 ║$(RESET)"
	@echo "$(CYAN)╚════════════════════════════════════════════════════════════╝$(RESET)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-20s$(RESET) %s\n", $$1, $$2}'
	@echo ""

# ============================================================================
# INSTALLATION & SETUP
# ============================================================================

install: ## Install dependencies
	@echo "$(CYAN)📦 Installing dependencies...$(RESET)"
	npm install

install-clean: ## Clean install (remove node_modules and reinstall)
	@echo "$(YELLOW)🧹 Clean installing dependencies...$(RESET)"
	npm run clean-install

setup: install ## Initial project setup
	@echo "$(GREEN)✅ Project setup complete!$(RESET)"

# ============================================================================
# DEVELOPMENT
# ============================================================================

dev: ## Start development server with hot reload
	@echo "$(CYAN)🚀 Starting development server...$(RESET)"
	npm run dev

start: ## Start production server
	@echo "$(CYAN)🚀 Starting production server...$(RESET)"
	npm run start

start-dev: ## Start dev server (without nodemon)
	@echo "$(CYAN)🚀 Starting dev server...$(RESET)"
	npm run start:dev

watch: ## Start development server in watch mode
	@echo "$(CYAN)👀 Starting in watch mode...$(RESET)"
	npm run dev:hot

# ============================================================================
# BUILD
# ============================================================================

build: ## Build the project for production
	@echo "$(CYAN)🔨 Building project...$(RESET)"
	npm run build

build-check: lint typecheck test ## Full build check (lint, typecheck, test)
	@echo "$(GREEN)✅ Build check passed!$(RESET)"

# ============================================================================
# TESTING
# ============================================================================

test: ## Run all tests
	@echo "$(CYAN)🧪 Running tests...$(RESET)"
	npm run test

test-watch: ## Run tests in watch mode
	@echo "$(CYAN)👀 Running tests in watch mode...$(RESET)"
	npm run test:watch

test-coverage: ## Run tests with coverage report
	@echo "$(CYAN)📊 Running tests with coverage...$(RESET)"
	npm run test:coverage

test-ui: ## Open Vitest UI
	@echo "$(CYAN)🖥️  Opening Vitest UI...$(RESET)"
	npm run test:ui

test-quick: ## Run tests without coverage (faster)
	@echo "$(CYAN)⚡ Running quick tests...$(RESET)"
	NODE_ENV=test npx vitest run --no-coverage

# ============================================================================
# CODE QUALITY
# ============================================================================

lint: ## Run ESLint
	@echo "$(CYAN)🔍 Running linter...$(RESET)"
	npm run lint

lint-fix: ## Run ESLint and fix issues
	@echo "$(CYAN)🔧 Fixing lint issues...$(RESET)"
	npm run lint:fix

typecheck: ## Run TypeScript type checking
	@echo "$(CYAN)📝 Running type check...$(RESET)"
	npm run typecheck

validate: ## Run all validations (typecheck, lint, test)
	@echo "$(CYAN)✅ Running full validation...$(RESET)"
	npm run validate

format: lint-fix ## Format code (alias for lint-fix)

# ============================================================================
# DATABASE
# ============================================================================

db-seed: ## Seed the database
	@echo "$(CYAN)🌱 Seeding database...$(RESET)"
	npm run db:seed

db-migrate: ## Run database migrations
	@echo "$(CYAN)📦 Running migrations...$(RESET)"
	npm run db:migrate

db-reset: ## Reset and reseed database
	@echo "$(YELLOW)⚠️  Resetting database...$(RESET)"
	npm run db:migrate
	npm run db:seed
	@echo "$(GREEN)✅ Database reset complete!$(RESET)"

# ============================================================================
# DOCKER
# ============================================================================

docker-build: ## Build Docker image
	@echo "$(CYAN)🐳 Building Docker image...$(RESET)"
	npm run docker:build

docker-dev: ## Start Docker development environment
	@echo "$(CYAN)🐳 Starting Docker dev environment...$(RESET)"
	npm run docker:dev

docker-prod: ## Start Docker production environment
	@echo "$(CYAN)🐳 Starting Docker production...$(RESET)"
	npm run docker:prod

docker-down: ## Stop Docker containers
	@echo "$(YELLOW)🛑 Stopping Docker containers...$(RESET)"
	npm run docker:down

docker-logs: ## View Docker logs
	@echo "$(CYAN)📋 Docker logs...$(RESET)"
	docker-compose logs -f

docker-restart: docker-down docker-dev ## Restart Docker dev environment

docker-clean: ## Remove all Docker containers and images
	@echo "$(RED)🧹 Cleaning Docker...$(RESET)"
	docker-compose down -v --rmi all --remove-orphans

# ============================================================================
# DEPLOYMENT
# ============================================================================

deploy-check: validate build ## Pre-deployment checks
	@echo "$(GREEN)✅ Ready for deployment!$(RESET)"

deploy-staging: deploy-check ## Deploy to staging
	@echo "$(YELLOW)🚀 Deploying to staging...$(RESET)"
	@echo "$(YELLOW)⚠️  Add your staging deployment command here$(RESET)"

deploy-prod: deploy-check ## Deploy to production
	@echo "$(RED)🚀 Deploying to production...$(RESET)"
	@echo "$(RED)⚠️  Add your production deployment command here$(RESET)"

# ============================================================================
# UTILITIES
# ============================================================================

clean: ## Clean build artifacts and caches
	@echo "$(YELLOW)🧹 Cleaning...$(RESET)"
	rm -rf dist
	rm -rf coverage
	rm -rf .vitest
	rm -rf node_modules/.cache
	@echo "$(GREEN)✅ Clean complete!$(RESET)"

clean-all: clean ## Deep clean (including node_modules)
	@echo "$(RED)🧹 Deep cleaning...$(RESET)"
	rm -rf node_modules
	rm -f package-lock.json
	@echo "$(GREEN)✅ Deep clean complete!$(RESET)"

logs: ## View application logs (if using PM2)
	pm2 logs remit-api

status: ## Check service status
	@echo "$(CYAN)📊 Checking status...$(RESET)"
	@curl -s http://localhost:3000/health || echo "$(RED)❌ Server not running$(RESET)"

ports: ## Check what's running on common ports
	@echo "$(CYAN)🔌 Checking ports...$(RESET)"
	@lsof -i :3000 2>/dev/null || echo "Port 3000: $(GREEN)Available$(RESET)"
	@lsof -i :27017 2>/dev/null || echo "Port 27017 (MongoDB): $(GREEN)Available$(RESET)"
	@lsof -i :6379 2>/dev/null || echo "Port 6379 (Redis): $(GREEN)Available$(RESET)"

kill-port: ## Kill process on port 3000
	@echo "$(YELLOW)🔪 Killing process on port 3000...$(RESET)"
	@lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "$(GREEN)No process on port 3000$(RESET)"

env-check: ## Check if .env file exists
	@if [ -f .env ]; then echo "$(GREEN)✅ .env file exists$(RESET)"; else echo "$(RED)❌ .env file missing$(RESET)"; fi

# ============================================================================
# COMBINED COMMANDS
# ============================================================================

all: install lint typecheck test build ## Run everything (install, lint, typecheck, test, build)
	@echo "$(GREEN)✅ All tasks completed!$(RESET)"

fresh: clean-all install db-migrate db-seed ## Fresh start (clean, install, migrate, seed)
	@echo "$(GREEN)✅ Fresh start complete!$(RESET)"

ci: ## CI pipeline simulation
	@echo "$(CYAN)🤖 Running CI pipeline...$(RESET)"
	npm ci
	npm run typecheck
	npm run lint
	npm run test:coverage
	npm run build
	@echo "$(GREEN)✅ CI pipeline passed!$(RESET)"

precommit: lint-fix typecheck test-quick ## Pre-commit checks
	@echo "$(GREEN)✅ Pre-commit checks passed!$(RESET)"

prepush: validate ## Pre-push checks (full validation)
	@echo "$(GREEN)✅ Pre-push checks passed!$(RESET)"

# ============================================================================
# KAFKA
# ============================================================================

KAFKA_CONTAINER ?= nordi-kafka

kafka-start: ## Start Kafka broker via docker-compose
	@echo "$(CYAN)🚀 Starting Kafka broker...$(RESET)"
	docker-compose up -d kafka zookeeper
	@echo "$(GREEN)✅ Kafka started$(RESET)"

kafka-stop: ## Stop Kafka broker
	@echo "$(YELLOW)🛑 Stopping Kafka broker...$(RESET)"
	docker-compose stop kafka zookeeper

kafka-status: ## Check Kafka broker status
	@echo "$(CYAN)📊 Kafka status:$(RESET)"
	@docker-compose ps kafka zookeeper 2>/dev/null || echo "$(YELLOW)Kafka not running$(RESET)"

kafka-topics: ## List all Kafka topics
	@echo "$(CYAN)📋 Kafka topics:$(RESET)"
	docker exec $(KAFKA_CONTAINER) kafka-topics.sh --bootstrap-server localhost:9092 --list 2>/dev/null || \
		echo "$(RED)❌ Kafka not accessible$(RESET)"

kafka-init: ## Create all application Kafka topics
	@echo "$(CYAN)🔧 Creating Kafka topics...$(RESET)"
	@for topic in \
		nordi.transaction.initiated nordi.transaction.processed nordi.transaction.completed nordi.transaction.failed \
		nordi.kyc.submitted nordi.kyc.verified nordi.kyc.rejected \
		nordi.security.fraud_alert \
		nordi.user.registered nordi.user.login nordi.user.deleted \
		nordi.notifications.push nordi.notifications.email nordi.notifications.sms \
		nordi.dlq; do \
		docker exec $(KAFKA_CONTAINER) kafka-topics.sh \
			--bootstrap-server localhost:9092 \
			--create --if-not-exists --topic $$topic \
			--replication-factor 1 --partitions 3 2>/dev/null && echo "  ✓ $$topic"; \
	done
	@echo "$(GREEN)✅ Kafka topics created$(RESET)"

kafka-console: ## Open Kafka consumer console (usage: make kafka-console TOPIC=nordi.user.registered)
	@echo "$(CYAN)📡 Listening on topic: $(TOPIC)$(RESET)"
	docker exec -it $(KAFKA_CONTAINER) kafka-console-consumer.sh \
		--bootstrap-server localhost:9092 \
		--topic $(TOPIC) --from-beginning

kafka-logs: ## Tail Kafka broker logs
	@docker-compose logs -f kafka 2>/dev/null

# ============================================================================
# BULLMQ / QUEUE
# ============================================================================

queue-status: ## Check BullMQ queue status (requires Redis)
	@echo "$(CYAN)📊 BullMQ queue counts:$(RESET)"
	@redis-cli -u $${REDIS_URL:-redis://localhost:6379} keys "nordi-*" 2>/dev/null | sort || \
		echo "$(YELLOW)Redis not accessible$(RESET)"

queue-flush: ## Flush all BullMQ queues (CAUTION: deletes jobs)
	@echo "$(RED)⚠️  Flushing BullMQ queues...$(RESET)"
	@read -p "Are you sure? [y/N] " confirm && [ "$$confirm" = "y" ] || exit 0
	@redis-cli -u $${REDIS_URL:-redis://localhost:6379} keys "nordi-*" | xargs -r redis-cli del
	@echo "$(GREEN)✅ Queues flushed$(RESET)"

# ============================================================================
# QUICK SHORTCUTS
# ============================================================================

d: dev ## Shortcut for dev
t: test ## Shortcut for test
b: build ## Shortcut for build
l: lint ## Shortcut for lint
v: validate ## Shortcut for validate
c: clean ## Shortcut for clean
h: help ## Shortcut for help

# Default target
.DEFAULT_GOAL := help
