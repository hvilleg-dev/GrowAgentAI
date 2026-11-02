# GrowAgentAI - Architecture Overview

Quick reference to the system architecture. For detailed architecture, see [docs/03_ARCHITECTURE.md](docs/03_ARCHITECTURE.md).

## System Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐  │
│  │ Web App  │  │ Desktop  │  │ Mobile App           │  │
│  │(React)   │  │(Electron)│  │(React Native + Expo) │  │
│  └──────────┘  └──────────┘  └──────────────────────┘  │
└────────────────────────────────────────────────────────┬┘
                            ↓ HTTPS/WSS
┌────────────────────────────────────────────────────────┬┘
│                    API GATEWAY                         │
│              (Express.js on Node.js)                   │
│                                                        │
│  - Authentication (JWT)                              │
│  - Rate Limiting                                      │
│  - Input Validation                                   │
│  - CORS                                               │
└────────────────────────────────────────────────────────┬┘
                            ↓
┌────────────────────────────────────────────────────────┬┘
│                   BUSINESS LOGIC                       │
│                                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐   │
│  │ Coaching     │  │ Goal         │  │ Analytics│   │
│  │ Service      │  │ Tracking     │  │ Engine   │   │
│  │              │  │              │  │          │   │
│  │ - Claude AI  │  │ - CRUD Ops   │  │ - Stats  │   │
│  │ - Prompting  │  │ - GROW Stages│  │ - Export │   │
│  │ - Streaming  │  │ - Milestones │  │ - Charts │   │
│  └──────────────┘  └──────────────┘  └──────────┘   │
│                                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐   │
│  │ RAG Engine   │  │ Auth Service │  │ Webhooks │   │
│  │              │  │              │  │          │   │
│  │ - Vector DB  │  │ - JWT Tokens │  │ - Events │   │
│  │ - Embeddings │  │ - OAuth 2.0  │  │ - Async  │   │
│  │ - Search     │  │ - Sessions   │  │ - Pub/Sub│   │
│  └──────────────┘  └──────────────┘  └──────────┘   │
└────────────────────────────────────────────────────────┬┘
                            ↓
┌────────────────────────────────────────────────────────┬┘
│                    DATA LAYER                          │
│                                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐   │
│  │ PostgreSQL   │  │ Redis        │  │ S3       │   │
│  │ / Oracle     │  │ Cache        │  │ Storage  │   │
│  │              │  │              │  │          │   │
│  │ - Users      │  │ - Sessions   │  │ - Files  │   │
│  │ - Goals      │  │ - Cache      │  │ - Exports│   │
│  │ - Sessions   │  │ - Rate Limit │  │ - Backups│   │
│  │ - Messages   │  │ - Pub/Sub    │  │          │   │
│  │ - Vectors    │  │              │  │          │   │
│  └──────────────┘  └──────────────┘  └──────────┘   │
└────────────────────────────────────────────────────────┬┘
                            ↓
┌────────────────────────────────────────────────────────┬┘
│                 EXTERNAL SERVICES                      │
│                                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐   │
│  │ Claude AI    │  │ OpenAI       │  │ Sentry   │   │
│  │ (Anthropic)  │  │ Embeddings   │  │ Monitoring   │
│  └──────────────┘  └──────────────┘  └──────────┘   │
└────────────────────────────────────────────────────────┘
```

## Key Features

### Coaching Engine
- Claude AI-powered conversational responses
- 7-stage GROW methodology tracking
- Real-time message streaming
- Context awareness from session history

### Knowledge Base (RAG)
- 20 coaching frameworks (Spanish + English)
- Vector embeddings for semantic search
- Retrieval Augmented Generation
- Dynamic prompt injection

### Goal Tracking
- Create, read, update, delete goals
- Track progress with milestone management
- Visualize GROW stages
- Historical tracking

### Multi-Platform
- Web: React 18 with Vite
- Desktop: Electron (Windows/Mac)
- Mobile: React Native + Expo (iOS/Android)

## Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, TailwindCSS |
| **Desktop** | Electron |
| **Mobile** | React Native, Expo |
| **Backend** | Node.js 18+, Express.js, TypeScript |
| **Database** | PostgreSQL (default), Oracle, MySQL via Prisma |
| **Cache** | Redis |
| **AI/ML** | Claude API, OpenAI Embeddings |
| **Container** | Docker, Docker Compose |
| **CI/CD** | GitHub Actions |
| **Monitoring** | Sentry, DataDog |

## Deployment Options

- Docker Compose (development/small)
- AWS ECS/Elastic Beanstalk/EC2
- Azure ACI/App Service
- Google Cloud Run
- Self-hosted VPS (DigitalOcean, Linode)
- Kubernetes (optional)

## Security

- TLS/SSL encryption (HTTPS)
- JWT authentication
- bcrypt password hashing
- SQL injection prevention (ORM)
- CORS protection
- Rate limiting
- Input validation
- Security headers
- GDPR/CCPA compliant

## Scalability

**Phase 1 (Current):** Single instance + RDS
**Phase 2 (2M+ users):** Load balancer + auto-scaling
**Phase 3 (5M+ users):** Microservices + distributed cache

## Performance Targets

- API response time: < 2 seconds
- Chat response latency: 2-5 seconds (Claude)
- Database query: < 100ms
- Frontend load: < 3 seconds
- 99.9% uptime SLA

---

For detailed architecture, see: [docs/03_ARCHITECTURE.md](docs/03_ARCHITECTURE.md)
