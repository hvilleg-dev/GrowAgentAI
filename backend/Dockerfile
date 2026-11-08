# Multi-stage build - optimized for production
# Stage 1: Builder
FROM node:18-alpine AS builder

WORKDIR /build

# Copy package files from backend
COPY backend/package.json ./

# Install ALL dependencies (including dev for build)
RUN npm install && npm cache clean --force

# Copy source code
COPY backend/src ./src
COPY backend/tsconfig.json ./
COPY backend/knowledgeBase.sql ./

# Build TypeScript
RUN npm run build

# Stage 2: Runtime - minimal image
FROM node:18-alpine

WORKDIR /app

# Install only dumb-init for signal handling
RUN apk add --no-cache dumb-init

# Copy from builder - only what's needed
COPY --from=builder /build/node_modules ./node_modules
COPY --from=builder /build/dist ./dist
COPY --from=builder /build/package.json ./package.json
COPY backend/knowledgeBase.sql ./

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || exit 1

# Expose API port
EXPOSE 3001

# Use dumb-init to handle signals properly
ENTRYPOINT ["/sbin/dumb-init", "--"]

# Start application
CMD ["node", "dist/index.js"]
