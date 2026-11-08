# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY backend/package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps 2>&1 || npm install

# Copy source code and config
COPY backend/src ./src
COPY backend/tsconfig.json ./
COPY backend/tsconfig.dev.json ./

# Build TypeScript
RUN npm run build

# Runtime stage
FROM node:18-alpine

WORKDIR /app

# Install dumb-init (process manager) and curl (for health checks)
RUN apk add --no-cache dumb-init curl

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy built application from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY backend/package*.json ./
COPY backend/tsconfig.json ./
COPY backend/tsconfig.dev.json ./
COPY backend/src ./src
COPY base_conocimientos ./base_conocimientos

# Change ownership to nodejs user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Run application with dumb-init as PID 1
# Use ts-node to handle path mapping correctly
ENTRYPOINT ["dumb-init", "--"]
CMD ["npx", "ts-node", "-P", "tsconfig.json", "-r", "tsconfig-paths/register", "src/app.ts"]
