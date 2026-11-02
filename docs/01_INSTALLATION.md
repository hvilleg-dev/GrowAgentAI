# GrowAgentAI - Installation Guide

Complete step-by-step installation for all platforms.

## Prerequisites

### For Docker (Recommended)
- Docker 20.10+
- Docker Compose 2.0+
- 4GB RAM minimum
- 10GB disk space

**Install Docker:**
- [macOS/Windows/Linux](https://docs.docker.com/get-docker/)

### For Manual Setup
- Node.js 18+ ([download](https://nodejs.org/))
- PostgreSQL 14+ ([download](https://www.postgresql.org/download/)) OR Oracle Database
- npm or yarn package manager
- 2GB RAM

## Option 1: Docker Setup (Recommended)

### Step 1: Clone Repository

```bash
git clone https://github.com/[usuario]/growagentai.git
cd growagentai
```

### Step 2: Create Environment File

```bash
# Copy template
cp .env.example .env

# Edit with your values
nano .env              # Linux/macOS
# or
notepad .env           # Windows
```

**Required variables:**
```env
# API Keys
ANTHROPIC_API_KEY=your_key_here           # From https://console.anthropic.com/
OPENAI_API_KEY=your_key_here              # For embeddings (optional)

# Database (PostgreSQL - default)
DATABASE_URL=postgresql://user:password@localhost:5432/growagentai

# OR Oracle Database
DATABASE_URL=oracle://user:password@localhost:1521/XE

# Application
PORT=3000
NODE_ENV=development
JWT_SECRET=generate_random_string_here

# Database Admin (for initialization)
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_ROOT_PASSWORD=root_password
```

### Step 3: Start Services

```bash
# Start all services (database, backend, frontend)
docker compose up -d

# Watch logs
docker compose logs -f

# Wait for "Server running on http://localhost:3000"
```

### Step 4: Initialize Database

```bash
# Run migrations
docker compose exec backend npm run migrate

# Seed demo data (optional)
docker compose exec backend npm run seed
```

### Step 5: Access Application

- **Web UI:** http://localhost:3000
- **API:** http://localhost:3001
- **Database UI (pgAdmin):** http://localhost:5050

**Login (if seed ran):**
- Email: demo@growagentai.com
- Password: demo123456

## Option 2: Manual Setup

### Step 1: Clone & Install Backend

```bash
git clone https://github.com/[usuario]/growagentai.git
cd growagentai/backend

# Install dependencies
npm install

# Create database
createdb growagentai

# Setup environment
cp .env.example .env
# Edit .env with your database URL

# Run migrations
npm run migrate

# Seed demo data
npm run seed

# Start backend server
npm run dev
# Backend will run on http://localhost:3001
```

### Step 2: Install Frontend

```bash
cd ../frontend/web

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with API URL: http://localhost:3001

# Start development server
npm run dev
# Frontend will run on http://localhost:3000
```

### Step 3: Verify Setup

```bash
# Check backend health
curl http://localhost:3001/health

# Check frontend
open http://localhost:3000
```

## Database Configuration

### PostgreSQL (Default)

```bash
# If using manual setup, create database
createdb growagentai

# Connect and verify
psql growagentai -c "SELECT version();"

# Run migrations
npm run migrate

# Seed data
npm run seed
```

### Oracle Database

```bash
# Update .env
DATABASE_URL=oracle://user:password@localhost:1521/XE

# Install Oracle client (if needed)
npm install oracledb

# Run migrations
npm run migrate
```

## Environment Variables Reference

```env
# === API Keys ===
ANTHROPIC_API_KEY=sk-ant-xxxxx              # Required - Claude API
OPENAI_API_KEY=sk-xxxxx                     # Optional - Embeddings

# === Database ===
DATABASE_URL=postgresql://...               # Required
DB_USER=postgres                            # For Docker setup
DB_PASSWORD=secure_password                 # For Docker setup
DB_ROOT_PASSWORD=root_password              # For Docker setup

# === Application ===
PORT=3000                                   # Web port
API_PORT=3001                               # API port
NODE_ENV=development|production             # Environment
JWT_SECRET=your_secret_key_here             # Must be 32+ chars

# === Features ===
ENABLE_OAUTH=true                           # Google/GitHub login
ENABLE_WEBHOOKS=true                        # External integrations
ENABLE_ANALYTICS=true                       # Usage tracking

# === Email (Optional) ===
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=noreply@growagentai.com

# === Monitoring (Optional) ===
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
DATADOG_API_KEY=xxxxx
```

## Troubleshooting Installation

### "Port already in use"
```bash
# Change port in .env
PORT=3001
docker compose up -d
```

### "Database connection failed"
```bash
# Check database is running
docker compose logs database

# Wait 30 seconds and retry
sleep 30
docker compose exec backend npm run migrate
```

### "Cannot connect to Docker daemon"
```bash
# Ensure Docker is running
# Restart Docker Desktop on macOS/Windows
# Or: systemctl restart docker (Linux)
```

### "Module not found errors"
```bash
# Reinstall dependencies
cd backend
rm -rf node_modules package-lock.json
npm install

cd ../frontend/web
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

- [Quick Start](02_QUICK_START.md) - Get running in 60 seconds
- [Architecture](03_ARCHITECTURE.md) - Understand the system
- [Configuration](ARCHITECTURE.md) - Advanced setup
- [Deployment](08_DEPLOYMENT.md) - Deploy to production

## Getting Help

- **Issues?** Check [Troubleshooting](12_TROUBLESHOOTING.md)
- **Questions?** See [FAQ](11_FAQ.md)
- **Need support?** Join [Discord](https://discord.gg/growagentai)

---

[Back to Docs](00_START_HERE.md)
