# ============================================================================
# NORDI REMITTANCE FRONTEND — DOCKERFILE
# Multi-stage build: Node (build) → Nginx (serve)
# Optimized for production fintech deployment
# ============================================================================

# ============================================================================
# STAGE 1: Dependencies
# ============================================================================
FROM node:20-alpine AS deps

WORKDIR /app

# Copy package files for layer caching
COPY package.json package-lock.json* ./

# Install all dependencies (including devDependencies for building)
RUN npm ci --include=dev

# ============================================================================
# STAGE 2: Builder
# ============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build arguments for environment configuration
ARG VITE_API_URL
ARG VITE_CLERK_PUBLISHABLE_KEY
ARG VITE_APP_ENV=production

# Set build-time environment variables
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_CLERK_PUBLISHABLE_KEY=${VITE_CLERK_PUBLISHABLE_KEY}
ENV VITE_APP_ENV=${VITE_APP_ENV}

# Build the application
RUN npm run build

# ============================================================================
# STAGE 3: Production Runner (Nginx)
# ============================================================================
FROM nginx:1.31-alpine AS runner

# Install curl for health checks
RUN apk add --no-cache curl

# Security: Remove default nginx config
RUN rm -rf /etc/nginx/conf.d/default.conf /usr/share/nginx/html/*

# Copy custom nginx configuration
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Security: Set proper permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# Switch to non-root user
USER nginx

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:80/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
