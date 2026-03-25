# ============================================================
#  Nordi Machine Learning Service — Makefile
# ============================================================

PYTHON   ?= python3
PIP      ?= pip3
VENV_DIR ?= venv
PORT     ?= 8000
HOST     ?= 0.0.0.0

# ---- Environment ------------------------------------------

.PHONY: venv install env

## Create virtual environment
venv:
	$(PYTHON) -m venv $(VENV_DIR)
	@echo "✔ venv created. Activate it:  source $(VENV_DIR)/bin/activate"

## Install all dependencies (run inside venv)
install:
	$(PIP) install --upgrade pip
	$(PIP) install -r requirements.txt

## Copy .env.example → .env (won't overwrite existing)
env:
	@[ -f .env ] && echo ".env already exists — skipping" || (cp .env.example .env && echo "✔ .env created from .env.example — edit it with real values")

## Full first-time setup: venv + install + env
setup: venv
	$(VENV_DIR)/bin/pip install --upgrade pip
	$(VENV_DIR)/bin/pip install -r requirements.txt
	@[ -f .env ] || cp .env.example .env
	@echo "\n✔ Setup complete. Run:  source $(VENV_DIR)/bin/activate && make dev"

# ---- Run --------------------------------------------------

.PHONY: dev start

## Run with auto-reload (development)
dev:
	uvicorn main:app --reload --host $(HOST) --port $(PORT)

## Run without reload (production-like)
start:
	uvicorn main:app --host $(HOST) --port $(PORT) --workers 4

# ---- Code Quality -----------------------------------------

.PHONY: lint format typecheck

## Lint with ruff (install: pip install ruff)
lint:
	ruff check .

## Auto-format with ruff
format:
	ruff format .

## Type-check with mypy (install: pip install mypy)
typecheck:
	mypy app/ main.py --ignore-missing-imports

# ---- Testing ----------------------------------------------

.PHONY: test test-cov

## Run tests
test:
	pytest tests/ -v

## Run tests with coverage
test-cov:
	pytest tests/ -v --cov=app --cov-report=term-missing

# ---- Utilities --------------------------------------------

.PHONY: clean freeze check-env

## Remove caches and build artifacts
clean:
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".mypy_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -name "*.pyc" -delete 2>/dev/null || true
	@echo "✔ Cleaned"

## Freeze current deps to requirements.lock
freeze:
	$(PIP) freeze > requirements.lock
	@echo "✔ requirements.lock updated"

## Verify .env has all required vars
check-env:
	@$(PYTHON) -c "\
	from dotenv import dotenv_values; \
	required = ['MONGODB_URI','REDIS_URL','JWT_SECRET']; \
	env = dotenv_values('.env'); \
	missing = [k for k in required if not env.get(k)]; \
	print('✔ All required env vars set') if not missing else print('✘ Missing:', ', '.join(missing))"

# ---- Help -------------------------------------------------

.PHONY: help
help:
	@echo ""
	@echo "  Nordi ML Service"
	@echo "  ──────────────────────────────────────────"
	@echo "  make setup       Full first-time setup (venv + deps + .env)"
	@echo "  make install     Install dependencies"
	@echo "  make dev         Run dev server (auto-reload)"
	@echo "  make start       Run production server (4 workers)"
	@echo "  make test        Run tests"
	@echo "  make test-cov    Run tests with coverage"
	@echo "  make lint        Lint with ruff"
	@echo "  make format      Auto-format with ruff"
	@echo "  make typecheck   Type-check with mypy"
	@echo "  make clean       Remove caches"
	@echo "  make freeze      Freeze deps to requirements.lock"
	@echo "  make check-env   Verify .env has required vars"
	@echo "  make env         Create .env from .env.example"
	@echo "  make help        Show this help"
	@echo ""
