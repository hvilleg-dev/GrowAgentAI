# GrowAgentAI - Quick Start (60 seconds)
## v2.0.0: Complete Multi-Provider Backend

**Version:** 2.0.0 | **Release:** Nov 5, 2026 | **Tag:** `v2.0.0`

Get GrowAgentAI with full backend running in under a minute.

## Prerequisites Check

```bash
docker --version       # Must show v20.10+
docker compose version # Must show v2.0+
node --version         # Must show v18+ (for local development)
```

If missing, [install Docker](https://docs.docker.com/get-docker/).

## What's New in v2.0

✨ **Major Updates:**
- ✅ Multi-provider LLM support (Claude + OpenAI)
- ✅ Flexible configuration (1+ providers)
- ✅ 3-layer crisis detection
- ✅ Complete TypeORM backend
- ✅ PostgreSQL + pgvector support
- ✅ 85%+ test coverage
- ✅ Production-ready deployment

## Start (3 commands)

```bash
# 1. Clone
git clone https://github.com/[usuario]/growagentai.git
cd growagentai

# 2. Setup environment
cp .env.example .env

# 3. Edit .env with your API keys
# At least ONE provider required:
#   - ANTHROPIC_API_KEY=sk_ant_... (for Claude)
#   - OPENAI_API_KEY=sk-...         (for OpenAI)
#   - Both recommended for redundancy

# Edit with your favorite editor:
# nano .env   (Linux/Mac)
# code .env   (VS Code)
# notepad .env (Windows)
```

## Run Backend (One Command)

```bash
# Start all services (PostgreSQL + Redis + Backend)
docker compose up -d

# Wait for initialization (~30 seconds)
sleep 30

# Verify services are running
docker compose ps

# You should see:
# database    PostgreSQL 16 ✓
# redis       Redis 7    ✓
# backend     Node.js    ✓
```

## Access API (Ready to use)

**Backend API:** http://localhost:3000

Test the health endpoint:
```bash
curl http://localhost:3000/health

# Response:
# {
#   "status": "ok",
#   "providers": ["claude", "openai"],
#   "redundancy": true,
#   "uptime": 15.234
# }
```

## API Endpoints

**Chat Endpoint (POST)**
```bash
# First, create a user and session
# Then use this endpoint

curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "550e8400-e29b-41d4-a716-446655440001",
    "userId": "550e8400-e29b-41d4-a716-446655440002",
    "message": "How can I achieve my goals?"
  }'

# Response includes:
# {
#   "response": "AI coach response here...",
#   "provider": "claude",
#   "model": "claude-3-5-sonnet-20241022",
#   "cost": 0.0045,
#   "latency": 1234,
#   "sessionId": "550e8400-e29b-41d4-a716-446655440001"
# }
```

**Create Session (POST)**
```bash
curl -X POST http://localhost:3000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "usuarioId": "550e8400-e29b-41d4-a716-446655440002",
    "objetivo": "Mejorar mi liderazgo y comunicación"
  }'
```

**Health Check (GET)**
```bash
curl http://localhost:3000/health
```

## Configuration Options

### Single Provider (99% uptime)
```bash
# Option 1: Only Claude
ANTHROPIC_API_KEY=sk_ant_...

# Option 2: Only OpenAI
OPENAI_API_KEY=sk-...
```

### Dual Provider (99.9% uptime, RECOMMENDED)
```bash
ANTHROPIC_API_KEY=sk_ant_...
OPENAI_API_KEY=sk-...
# Automatic fallback if one provider fails
```

## Docker Compose Services

**What's running:**
- **backend** - Node.js API server (port 3000)
- **database** - PostgreSQL 16 (port 5432)
- **redis** - Redis cache (port 6379)

**View logs:**
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
```

## Common Issues

**Error: Port 3000 already in use?**
```bash
# Change port in .env
PORT=3001
docker compose up -d
```

**Error: "No providers available"**
```bash
# You must set at least ONE of:
# ANTHROPIC_API_KEY or OPENAI_API_KEY
# Check your .env file
```

**Error: Database connection failed?**
```bash
# Wait 30 seconds for PostgreSQL to start
sleep 30
docker compose logs database
```

**Provider not responding?**
```bash
# If one provider fails, system automatically fails over to the other
# If using single provider, manual intervention needed
docker compose logs backend | grep "error"
```

## Next Steps

1. **Read Architecture**: [docs/03_ARCHITECTURE.md](docs/03_ARCHITECTURE.md)
2. **API Reference**: [docs/04_API_REFERENCE.md](docs/04_API_REFERENCE.md)
3. **Deployment**: [docs/08_DEPLOYMENT.md](docs/08_DEPLOYMENT.md)
4. **Security**: [docs/09_SECURITY.md](docs/09_SECURITY.md)

## Development Setup

If you want to work on the backend code:

```bash
# Install dependencies
cd backend
npm install

# Run TypeScript compiler
npm run build

# Run tests (85%+ coverage)
npm run test

# Run in development mode
npm run dev

# Lint code
npm run lint
```

## v2.0 Backend Documentation

Complete implementation guides available:
- **PASO_2_SETUP_REPO.md** - Repository structure
- **PASO_3A_TYPES_CONSTANTS.md** - TypeScript types
- **PASO_3B_ERRORS_UTILS.md** - Error handling
- **PASO_3C_DATABASE.md** - Database models
- **PASO_3D_PROVIDERS_COMPLETE.md** - Provider implementation
- **PASO_4_DEPLOYMENT.md** - Deployment guide
- **SECURITY_FINAL_CHECK.md** - Security validation
- **RESUMEN_EJECUTIVO_COMPLETO.md** - Executive summary

## Support

- **Issues?** Check [Troubleshooting](docs/12_TROUBLESHOOTING.md)
- **Questions?** See [FAQ](docs/11_FAQ.md)
- **Discord:** [Join Community](https://discord.gg/growagentai)
- **Docs:** [Full Documentation](docs/)

---

**v2.0 Ready** | [Back to README](README.md) | [Full Docs](docs/) | [GitHub](https://github.com/[usuario]/growagentai)
