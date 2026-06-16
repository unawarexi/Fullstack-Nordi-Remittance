# ============================================================================
#  Nordi Machine Learning Service — Makefile
#  Runtime: Python 3.11 | FastAPI | Uvicorn | Docker | Kubernetes
# ============================================================================

PYTHON   ?= python3
PIP      ?= pip3
VENV_DIR ?= venv
PORT     ?= 8000
HOST     ?= 0.0.0.0

# Colors
CYAN    := \033[36m
GREEN   := \033[32m
YELLOW  := \033[33m
RED     := \033[31m
RESET   := \033[0m
BOLD    := \033[1m

K8S_NS    := nordi
APP_NAME  := nordi-ml
IMAGE_TAG ?= latest
REGISTRY  ?= ghcr.io/your-org

.PHONY: help venv install env setup dev start \
        lint format typecheck test test-cov \
        docker-build docker-build-dev docker-up docker-up-infra \
        docker-down docker-logs docker-shell docker-rebuild \
        k8s-apply k8s-delete k8s-status k8s-logs k8s-port-forward k8s-restart \
        clean freeze check-env

.DEFAULT_GOAL := help

# ── Help ──────────────────────────────────────────────────────────────────────

help:
	@echo ""
	@echo "$(BOLD)$(CYAN)  Nordi ML Service — Command Reference$(RESET)"
	@echo "$(CYAN)  ──────────────────────────────────────────$(RESET)"
	@echo ""
	@echo "$(BOLD)  🚀 Quick Start:$(RESET)"
	@echo "  $(GREEN)make setup$(RESET)        First-time setup (venv + deps + .env)"
	@echo "  $(GREEN)make dev$(RESET)          Run dev server (auto-reload)"
	@echo "  $(GREEN)make docker-up$(RESET)    Run full Docker stack"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-22s$(RESET) %s\n", $$1, $$2}'
	@echo ""

# ── Environment ───────────────────────────────────────────────────────────────

venv: ## Create Python virtual environment
	$(PYTHON) -m venv $(VENV_DIR)
	@echo "$(GREEN)✓ venv created. Activate: source $(VENV_DIR)/bin/activate$(RESET)"

install: ## Install all dependencies (run inside venv)
	$(PIP) install --upgrade pip
	$(PIP) install -r requirements.txt
	@echo "$(GREEN)✓ Dependencies installed$(RESET)"

env: ## Copy .env.example → .env (won't overwrite existing)
	@[ -f .env ] \
		&& echo "$(YELLOW)⚠ .env already exists — skipping$(RESET)" \
		|| (cp .env.example .env && echo "$(GREEN)✓ .env created from .env.example — edit it with real values$(RESET)")

setup: venv ## Full first-time setup (venv + deps + .env)
	$(VENV_DIR)/bin/pip install --upgrade pip
	$(VENV_DIR)/bin/pip install -r requirements.txt
	@[ -f .env ] || cp .env.example .env
	@echo ""
	@echo "$(GREEN)✓ Setup complete. Run:$(RESET)"
	@echo "  source $(VENV_DIR)/bin/activate"
	@echo "  make dev"

# ── Run ───────────────────────────────────────────────────────────────────────

dev: ## Run with auto-reload (development)
	uvicorn main:app --reload --host $(HOST) --port $(PORT)

start: ## Run production server (4 workers)
	uvicorn main:app --host $(HOST) --port $(PORT) --workers 4

# ── Code Quality ──────────────────────────────────────────────────────────────

lint: ## Lint with ruff
	ruff check .

lint-fix: ## Auto-fix lint issues with ruff
	ruff check . --fix

format: ## Auto-format with ruff
	ruff format .

format-check: ## Check formatting without modifying
	ruff format --check .

typecheck: ## Type-check with mypy
	mypy app/ main.py --ignore-missing-imports

# ── Testing ───────────────────────────────────────────────────────────────────

test: ## Run tests
	pytest tests/ -v

test-cov: ## Run tests with coverage
	pytest tests/ -v --cov=app --cov-report=term-missing --cov-report=html

test-quick: ## Run tests without coverage (faster)
	pytest tests/ -v --no-cov

# ── Docker ────────────────────────────────────────────────────────────────────

docker-build: ## Build production Docker image
	@echo "$(CYAN)Building production ML image...$(RESET)"
	docker build -t $(APP_NAME):$(IMAGE_TAG) --target runner .
	@echo "$(GREEN)✓ Image built: $(APP_NAME):$(IMAGE_TAG)$(RESET)"

docker-build-dev: ## Build dev Docker image
	docker build -t $(APP_NAME):dev -f Dockerfile.dev .
	@echo "$(GREEN)✓ Dev image built$(RESET)"

docker-build-nc: ## Build production image (no cache)
	docker build --no-cache -t $(APP_NAME):$(IMAGE_TAG) --target runner .

docker-tag: ## Tag image for registry
	docker tag $(APP_NAME):$(IMAGE_TAG) $(REGISTRY)/$(APP_NAME):$(IMAGE_TAG)
	@echo "$(GREEN)✓ Tagged: $(REGISTRY)/$(APP_NAME):$(IMAGE_TAG)$(RESET)"

docker-push: ## Push image to registry
	docker push $(REGISTRY)/$(APP_NAME):$(IMAGE_TAG)
	@echo "$(GREEN)✓ Pushed$(RESET)"

docker-up: ## Start ML Docker stack (ml + mongo + redis)
	@echo "$(CYAN)Starting ML Docker stack...$(RESET)"
	docker compose up -d --build
	@echo "$(GREEN)✓ ML stack up$(RESET)"
	@echo "  ML API:    http://localhost:$(PORT)"
	@echo "  ML Docs:   http://localhost:$(PORT)/docs"

docker-up-infra: ## Start only infrastructure (mongo + redis)
	docker compose up -d mongo redis
	@echo "$(GREEN)✓ Infrastructure ready$(RESET)"

docker-down: ## Stop ML Docker stack
	docker compose down
	@echo "$(GREEN)✓ Stack stopped$(RESET)"

docker-down-v: ## Stop ML Docker stack and remove volumes
	docker compose down -v --remove-orphans
	@echo "$(YELLOW)⚠ Volumes removed$(RESET)"

docker-rebuild: ## Rebuild and restart ML container
	docker compose up -d --build --force-recreate ml
	@echo "$(GREEN)✓ ML container rebuilt$(RESET)"

docker-logs: ## Tail ML container logs
	docker compose logs -f --tail=100 ml

docker-shell: ## Open shell inside ML container
	docker compose exec ml bash

docker-ps: ## List running containers
	docker compose ps

# ── Health ────────────────────────────────────────────────────────────────────

health: ## Check ML service health
	@curl -sf http://localhost:$(PORT)/health | python3 -m json.tool 2>/dev/null \
		&& echo "$(GREEN)✓ ML service healthy$(RESET)" \
		|| echo "$(RED)✗ ML service not reachable at :$(PORT)$(RESET)"

docs: ## Open FastAPI auto-docs in browser
	@open http://localhost:$(PORT)/docs 2>/dev/null \
		|| xdg-open http://localhost:$(PORT)/docs 2>/dev/null \
		|| echo "Visit http://localhost:$(PORT)/docs"

# ── Kubernetes ────────────────────────────────────────────────────────────────

k8s-apply: ## Apply all ML k8s manifests to cluster
	@echo "$(CYAN)Applying ML Kubernetes manifests...$(RESET)"
	kubectl apply -f k8s/namespace.yaml
	kubectl apply -f k8s/configmap.yaml
	kubectl apply -f k8s/secrets.yaml
	kubectl apply -f k8s/deployment.yaml
	kubectl apply -f k8s/service.yaml
	@echo "$(GREEN)✓ ML k8s manifests applied$(RESET)"

k8s-delete: ## Delete all ML k8s resources
	kubectl delete -f k8s/ --ignore-not-found
	@echo "$(YELLOW)⚠ ML k8s resources deleted$(RESET)"

k8s-status: ## Show ML pods, services in namespace
	@echo "$(CYAN)── Pods ──$(RESET)"
	kubectl get pods -n $(K8S_NS) -l app=$(APP_NAME)
	@echo "\n$(CYAN)── Services ──$(RESET)"
	kubectl get svc -n $(K8S_NS) -l app=$(APP_NAME)
	@echo "\n$(CYAN)── HPA ──$(RESET)"
	kubectl get hpa -n $(K8S_NS) -l app=$(APP_NAME)

k8s-logs: ## Tail logs from ML deployment
	kubectl logs -f -n $(K8S_NS) -l app=$(APP_NAME) --tail=100

k8s-port-forward: ## Forward local 8000 → ML k8s service
	kubectl port-forward -n $(K8S_NS) svc/$(APP_NAME) $(PORT):8000

k8s-restart: ## Rolling restart of ML deployment
	kubectl rollout restart deployment/$(APP_NAME) -n $(K8S_NS)

k8s-rollout-status: ## Watch ML rollout status
	kubectl rollout status deployment/$(APP_NAME) -n $(K8S_NS)

k8s-exec: ## Open shell in running ML pod
	kubectl exec -it -n $(K8S_NS) \
		$$(kubectl get pod -n $(K8S_NS) -l app=$(APP_NAME) -o jsonpath='{.items[0].metadata.name}') \
		-- bash

k8s-describe: ## Describe ML pods for debugging
	kubectl describe pods -n $(K8S_NS) -l app=$(APP_NAME)

# ── Utilities ─────────────────────────────────────────────────────────────────

clean: ## Remove caches and build artifacts
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".mypy_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name "htmlcov" -exec rm -rf {} + 2>/dev/null || true
	find . -name "*.pyc" -delete 2>/dev/null || true
	find . -name ".coverage" -delete 2>/dev/null || true
	@echo "$(GREEN)✓ Cleaned$(RESET)"

freeze: ## Freeze current deps to requirements.lock
	$(PIP) freeze > requirements.lock
	@echo "$(GREEN)✓ requirements.lock updated$(RESET)"

check-env: ## Verify .env has all required variables
	@$(PYTHON) -c "\
	from dotenv import dotenv_values; \
	required = ['MONGODB_URI', 'REDIS_URL', 'JWT_SECRET', 'BACKEND_API_URL']; \
	env = dotenv_values('.env'); \
	missing = [k for k in required if not env.get(k)]; \
	print('$(GREEN)✓ All required env vars set$(RESET)') if not missing else print('$(RED)✗ Missing: ' + ', '.join(missing) + '$(RESET)')"

ports: ## Check what's running on key ports
	@lsof -i :$(PORT) -sTCP:LISTEN -t >/dev/null 2>&1 \
		&& echo "$(GREEN)✓ Port $(PORT) (ML API): running$(RESET)" \
		|| echo "$(YELLOW)· Port $(PORT) (ML API): not running$(RESET)"

# ── Compound / Workflow ───────────────────────────────────────────────────────

ci: lint typecheck test ## CI pipeline: lint + typecheck + test
	@echo "$(GREEN)✓ ML CI checks passed$(RESET)"

deploy-k8s: docker-build docker-tag docker-push k8s-apply ## Build, push and deploy to Kubernetes
	@echo "$(GREEN)✓ ML service deployed to Kubernetes$(RESET)"
