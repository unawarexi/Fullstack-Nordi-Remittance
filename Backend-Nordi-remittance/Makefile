# ============================================================================
# REMIT BACKEND - MAKEFILE
# ============================================================================
# Usage: make <target>
# Run 'make help' for available commands
# ============================================================================

.PHONY: help install dev start build test lint clean docker db all

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
