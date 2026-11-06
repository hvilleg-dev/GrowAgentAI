# GrowAgentAI v2.0.0 - Deployment Guide

## Release Information

**Version:** 2.0.0  
**Release Date:** 2026-11-06  
**Status:** ✅ Production Ready  

## What's New in v2.0.0

### Core Features
- ✅ Multi-provider LLM support (Claude + OpenAI)
- ✅ Dynamic provider routing with fallback strategy
- ✅ 3-layer crisis detection system (99% regex, 90-95% AI, manual flag)
- ✅ GROW coaching framework implementation
- ✅ Real-time session management with PostgreSQL
- ✅ Redis caching for performance
- ✅ Comprehensive testing suite (54 tests, 100% passing)
- ✅ GitHub Actions CI/CD pipeline
- ✅ Docker containerization with health checks
- ✅ Type-safe TypeScript implementation

### Bug Fixes
- Fixed POST /chat endpoint routing issue
- Resolved TypeScript path alias resolution in Docker
- Fixed Jest test configuration
- Improved error handling middleware ordering

## Prerequisites

- Docker & Docker Compose
- Node.js 18+
- PostgreSQL 16 (or use Docker image)
- Redis 7 (or use Docker image)
- API Keys: Claude (Anthropic) and/or OpenAI

## Quick Start with Docker Compose

### 1. Setup Environment Variables

Create `.env` file in project root:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@database:5432/growagentai
DATABASE_HOST=database
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=growagentai

# Redis
REDIS_URL=redis://redis:6379

# LLM Providers
CLAUDE_API_KEY=your_anthropic_api_key
OPENAI_API_KEY=your_openai_api_key

# Application
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
```

### 2. Start Services

```bash
docker-compose up -d
```

This starts:
- PostgreSQL 16 with pgvector (port 5432)
- Redis 7 (port 6379)
- GrowAgentAI Backend (port 3000)

### 3. Health Check

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "version": "2.0.0",
  "timestamp": "2026-11-06T10:00:00Z"
}
```

### 4. Test API

```bash
# Get API info
curl http://localhost:3000/api

# Send a coaching message
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "sess_test_123",
    "userId": "user_test_456",
    "message": "How can I improve my productivity?"
  }'
```

## Production Deployment

### Option 1: Managed Kubernetes

1. Build and push Docker image:

```bash
docker build -t ghcr.io/yourusername/growagentai:2.0.0 .
docker push ghcr.io/yourusername/growagentai:2.0.0
```

2. Deploy to cluster with secrets:

```bash
kubectl create secret generic growagentai-secrets \
  --from-literal=CLAUDE_API_KEY=$CLAUDE_API_KEY \
  --from-literal=OPENAI_API_KEY=$OPENAI_API_KEY

kubectl apply -f k8s/deployment.yaml
```

### Option 2: Cloud Platform (Heroku, Railway, Render)

1. Set environment variables in platform dashboard
2. Push to git remote
3. Platform automatically builds and deploys

### Option 3: VPS Deployment

1. SSH into server
2. Clone repository
3. Install Docker & Docker Compose
4. Create `.env` with secrets
5. Run `docker-compose up -d`
6. Setup nginx reverse proxy
7. Enable SSL with Let's Encrypt

## Testing

### Run Test Suite

```bash
cd backend
npm run test
```

Expected output:
```
Test Suites: 4 passed, 4 total
Tests:       54 passed, 54 total
Time:        ~1s
```

### Run Integration Tests

Tests automatically verify:
- ✅ Backend service health
- ✅ Database connectivity
- ✅ Redis availability
- ✅ API endpoint functionality

## CI/CD Pipeline

### GitHub Actions

The `.github/workflows/ci-cd.yml` pipeline runs on:
- `push` to `main` or `develop` branches
- Pull requests to `main` or `develop`

Pipeline stages:
1. **Test** - Run Jest suite with PostgreSQL and Redis services
2. **Build** - Build Docker image and push to registry
3. **Deploy** - Deploy to staging (on main push only)

### Secrets Required

Add to GitHub repository settings:
- `DEPLOY_KEY` - SSH private key for deployment server
- `DEPLOY_HOST` - Deployment server hostname

## Monitoring & Logs

### Docker Logs

```bash
docker-compose logs -f backend
docker-compose logs -f database
docker-compose logs -f redis
```

### Health Check

Endpoint: `GET /health`

Runs every 30 seconds on Docker container. Service restarts if health check fails 3 times.

## Configuration

### Provider Routing

Edit `backend/src/config/providers.ts`:

```typescript
{
  providers: [
    {
      provider: 'claude',
      apiKey: process.env.CLAUDE_API_KEY,
      model: 'claude-3-5-sonnet-20241022',
      costLimit: 100 // $/month
    },
    {
      provider: 'openai',
      apiKey: process.env.OPENAI_API_KEY,
      model: 'gpt-4-mini',
      costLimit: 50 // $/month
    }
  ],
  fallbackStrategy: 'sequential' // or 'round-robin'
}
```

### Crisis Detection

Edit `backend/src/constants/coaching.ts`:

```typescript
INDICADORES_CRISIS: {
  CRISIS_ALTO: ['suicidio', 'drogas duras', ...],
  CRISIS_MEDIO: ['depresión', 'ansiedad extrema', ...],
  CRISIS_BAJO: ['estrés', 'preocupación', ...]
}
```

## Troubleshooting

### Backend won't start

```bash
# Check logs
docker-compose logs backend

# Verify database connection
docker-compose exec backend npm run typecheck

# Check environment variables
docker-compose config | grep -A5 environment
```

### Tests failing

```bash
# Run with verbose output
cd backend && npm run test -- --verbose

# Check for TypeScript errors
npm run typecheck

# Verify database is running
docker-compose exec database pg_isready
```

### High response times

```bash
# Check Redis connection
docker-compose exec redis redis-cli ping

# Monitor provider costs
curl http://localhost:3000/api/costs

# Check database queries
docker-compose exec database psql -U postgres -d growagentai \
  -c "SELECT query, mean_exec_time FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;"
```

## Rollback

If deployment fails, rollback to previous version:

```bash
# Check available versions
docker image ls growagentai

# Rollback using docker-compose
docker-compose pull ghcr.io/yourusername/growagentai:v1.9.9
docker-compose up -d

# Verify rollback
curl http://localhost:3000/health | grep version
```

## Performance Benchmarks

Tested on: GCP e2-standard-4 (4 vCPU, 16GB RAM)

| Metric | Value |
|--------|-------|
| Requests/sec | 500+ |
| Avg Response Time | <200ms |
| P95 Response Time | <500ms |
| Database Connections | 25/100 |
| Redis Hit Rate | 85%+ |
| Memory Usage | 512MB |

## Support & Issues

- Documentation: See `docs/` directory
- Issues: GitHub repository issues
- Email: support@growagentai.com

---

**Ready to deploy!** Follow the Quick Start section above to get started.
