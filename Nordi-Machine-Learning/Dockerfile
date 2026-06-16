# ============================================================================
# NORDI ML SERVICE — DOCKERFILE
# Multi-stage build: builder installs deps, runner is slim production image
# ============================================================================

# ── Stage 1: Builder ──────────────────────────────────────────────────────
FROM python:3.11-slim AS builder

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    libffi-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy and install Python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir --user -r requirements.txt

# ── Stage 2: Production Runner ────────────────────────────────────────────
FROM python:3.11-slim AS runner

# Security: create non-root user
RUN groupadd --system --gid 1001 nordiml && \
    useradd --system --uid 1001 --gid nordiml nordiml

WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /root/.local /home/nordiml/.local

# Copy application source
COPY --chown=nordiml:nordiml . .

# Create model directory
RUN mkdir -p /app/models/saved && chown -R nordiml:nordiml /app/models

# Environment
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PATH=/home/nordiml/.local/bin:$PATH \
    ML_SERVICE_HOST=0.0.0.0 \
    ML_SERVICE_PORT=8000

# Switch to non-root user
USER nordiml

EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

# Start the application (4 workers for production)
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
