# ============================================================================
# REMIT REMITTANCE BACKEND - DOCKERFILE
# Multi-stage build for optimized production images
# ============================================================================

# ============================================================================
# STAGE 1: Dependencies
# ============================================================================
FROM node:25-alpine AS deps

# Install build dependencies for native modules
RUN apk add --no-cache libc6-compat python3 make g++

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install all dependencies (including devDependencies for building)
RUN npm ci --include=dev

# ============================================================================
# STAGE 2: Builder
# ============================================================================
FROM node:25-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the TypeScript application
RUN npm run build

# Remove devDependencies
RUN npm prune --production

# ============================================================================
# STAGE 3: Production Runner
# ============================================================================
FROM node:25-alpine AS runner

# Security: Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 remit

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

# Copy necessary files from builder
COPY --from=builder --chown=remit:nodejs /app/dist ./dist
COPY --from=builder --chown=remit:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=remit:nodejs /app/package.json ./package.json

# Create logs directory
RUN mkdir -p /app/logs && chown -R remit:nodejs /app/logs

# Switch to non-root user
USER remit

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

# Start the application
CMD ["node", "dist/index.js"]
