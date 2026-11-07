# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy all package files first
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY frontend/packages/web/package*.json ./frontend/packages/web/

# Install dependencies at root level
RUN npm install --legacy-peer-deps 2>&1 || npm install

# Copy source code
COPY frontend/packages/web ./frontend/packages/web

# Build the app
WORKDIR /app/frontend/packages/web
RUN npm run build

# Runtime stage
FROM node:18-alpine

WORKDIR /app

# Install serve to run the app
RUN npm install -g serve

# Copy built application
COPY --from=builder /app/frontend/packages/web/dist ./dist

# Expose port
EXPOSE 5173

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget -q -O- http://localhost:5173 || exit 1

# Run application
CMD ["serve", "-s", "dist", "-l", "5173"]
