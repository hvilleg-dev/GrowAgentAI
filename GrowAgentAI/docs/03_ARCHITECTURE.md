# GrowAgentAI - Architecture

System design and technical architecture.

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Web App    │  │  Desktop     │  │   Mobile     │  │
│  │  (React)     │  │  (Electron)  │  │  (React Native)│  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└────────────────────────────────────────────────────────┬┘
                            ↓ HTTPS/WSS
┌────────────────────────────────────────────────────────┬┘
│                    API GATEWAY                         │
│                  (Express Router)                      │
└────────────────────────────────────────────────────────┬┘
                            ↓
┌────────────────────────────────────────────────────────┬┘
│                   APPLICATION LAYER                   │
│  ┌──────────────────────────────────────────────────┐  │
│  │         GrowAgentAI Backend (Node.js)            │  │
│  │                                                  │  │
│  │  ┌────────────┐  ┌────────────┐  ┌──────────┐  │  │
│  │  │ Coaching   │  │  Goal      │  │ Analytics│  │  │
│  │  │ Service    │  │  Tracking  │  │ Engine   │  │  │
│  │  └────────────┘  └────────────┘  └──────────┘  │  │
│  │                                                  │  │
│  │  ┌────────────┐  ┌────────────┐  ┌──────────┐  │  │
│  │  │   Auth     │  │  RAG       │  │ Webhooks │  │  │
│  │  │  Service   │  │  Engine    │  │          │  │  │
│  │  └────────────┘  └────────────┘  └──────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┬┘
                            ↓
┌────────────────────────────────────────────────────────┬┘
│                    DATA LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐   │
│  │  PostgreSQL  │  │    Redis     │  │  S3      │   │
│  │  / Oracle    │  │   Cache      │  │ Storage  │   │
│  └──────────────┘  └──────────────┘  └──────────┘   │
└────────────────────────────────────────────────────────┬┘
                            ↓
┌────────────────────────────────────────────────────────┬┘
│                 EXTERNAL SERVICES                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐   │
│  │  Claude AI   │  │ OpenAI       │  │ Sentry   │   │
│  │  (Anthropic) │  │ Embeddings   │  │Monitoring│   │
│  └──────────────┘  └──────────────┘  └──────────┘   │
└────────────────────────────────────────────────────────┘
```

## Core Components

### Frontend Layer

#### Web Application (React 18)
- **Framework:** React 18 + Vite
- **Styling:** TailwindCSS
- **State:** Redux + Redux Thunk
- **API Client:** React Query + Axios
- **UI Components:** Headless UI, Radix UI
- **Features:**
  - Coaching chat interface
  - Goal tracking dashboard
  - Progress analytics
  - User settings

#### Desktop Application (Electron)
- **Base:** Chromium-based Electron
- **Bundler:** Webpack/Rollup
- **Code:** Shared React components with custom desktop UX
- **Platforms:** Windows, macOS (Linux coming soon)
- **Features:**
  - Native menu & shortcuts
  - Local file storage
  - Offline-first support

#### Mobile Application (React Native)
- **Framework:** React Native + Expo
- **Platforms:** iOS (via TestFlight), Android (Google Play)
- **Storage:** AsyncStorage + SQLite
- **Features:**
  - Push notifications
  - Biometric auth
  - Offline coaching

### Backend Layer

#### Node.js Backend (Express)
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** TypeScript
- **Port:** 3001 (configurable)

**Core Services:**

1. **Coaching Service**
   - Processes user input through Claude AI
   - 7-stage GROW methodology tracking
   - Question suggestion engine
   - Session history management

2. **Goal Tracking Service**
   - CRUD operations for goals
   - Milestone tracking
   - Progress calculation
   - Commitment management

3. **RAG Engine**
   - Vector embeddings (OpenAI)
   - Semantic search across knowledge base
   - Context retrieval for Claude
   - Dynamic prompt engineering

4. **Authentication Service**
   - JWT token generation
   - OAuth 2.0 integration (Google, GitHub)
   - Session management
   - Refresh token handling

5. **Analytics Engine**
   - Session statistics
   - Goal completion rates
   - User engagement metrics
   - Export to Sentry/DataDog

### Data Layer

#### Primary Database
**PostgreSQL (default)** or **Oracle Database**

**Prisma ORM** provides:
- Database-agnostic schema
- Type-safe queries
- Automatic migrations
- Query optimization

**Key Tables:**
- `users` - User accounts & profiles
- `sessions` - Chat sessions
- `goals` - User goals
- `messages` - Chat messages
- `milestones` - Goal milestones
- `knowledge_base_vectors` - Embeddings cache

#### Cache Layer (Redis)
- Session storage
- Rate limiting
- Query caching
- Real-time notifications

#### File Storage
- User documents
- Export files
- Session transcripts
- Optional: S3/CloudFront

### Integration Services

#### Claude AI API
- Conversational responses
- Coaching logic
- Dynamic prompt injection
- Token counting

#### OpenAI Embeddings
- Knowledge base vectorization
- Semantic search
- Context retrieval

#### Monitoring & Analytics
- **Sentry:** Error tracking
- **DataDog:** Performance monitoring
- Custom analytics dashboard

## Data Flow

### User Coaching Session

```
1. User sends message via Web/Desktop/Mobile
                    ↓
2. Frontend sends to Backend API (/api/sessions/:id/messages)
                    ↓
3. Backend validates user & session
                    ↓
4. RAG Engine queries knowledge base (semantic search)
                    ↓
5. Backend builds prompt with:
   - User message
   - Session context
   - Relevant knowledge
   - GROW stage indicator
                    ↓
6. Call Claude API with prompt
                    ↓
7. Stream response back to frontend
                    ↓
8. Save message to database
                    ↓
9. Update analytics
                    ↓
10. Frontend displays response in chat UI
```

### Goal Creation & Tracking

```
1. User creates goal via UI
                    ↓
2. Frontend POST /api/goals
                    ↓
3. Backend validates goal data
                    ↓
4. Save to database
                    ↓
5. Initialize GROW stages (G→R→O→W)
                    ↓
6. Create milestones
                    ↓
7. Return goal with ID
                    ↓
8. Frontend updates dashboard
```

## Technology Decisions

### Why Node.js + Express?
- Fast development cycle
- Large ecosystem
- Easy scaling
- JavaScript across stack

### Why Prisma?
- Database-agnostic (PostgreSQL, Oracle, MySQL)
- Type-safe
- Automated migrations
- Excellent developer experience

### Why Claude API?
- Best-in-class reasoning
- Long context window (100K tokens)
- Cost-effective
- Excellent for coaching conversations

### Why PostgreSQL default + Oracle support?
- PostgreSQL: Free, powerful, perfect for development
- Oracle: Enterprise support, free tier available

### Why React across platforms?
- Code reuse (70%+ shared components)
- Smaller learning curve
- Faster development
- React Native maturity

## Deployment Architecture

### Development
- Docker Compose local stack
- Hot reload for code changes
- Full stack in containers

### Staging
- Cloud VM (AWS/Azure/GCP)
- Managed PostgreSQL
- CDN for static assets
- SSL/TLS termination

### Production
- Kubernetes cluster (optional)
- Managed database (RDS, Oracle Cloud)
- Load balancer
- CloudFront CDN
- Backup strategy

## Security Architecture

```
┌─────────────┐
│   Client    │
└─────────────┘
      ↓ HTTPS/WSS (TLS 1.3)
┌─────────────┐
│  API Layer  │ ← CORS validation
├─────────────┤
│Auth Middleware│ ← JWT validation
├─────────────┤
│Rate Limiter │ ← Token bucket
├─────────────┤
│   Routes    │
├─────────────┤
│Input Validation│ ← Sanitization
└─────────────┘
      ↓ Encrypted connection
┌─────────────┐
│  Database   │ ← Connection pooling
│ Encrypted   │ ← At-rest encryption
└─────────────┘
```

## Performance Optimization

### Frontend
- Code splitting via Vite
- Lazy loading routes
- Image optimization
- Caching strategies

### Backend
- Query optimization (Prisma select)
- N+1 query prevention
- Connection pooling (5 min idle)
- Response compression (gzip)

### Database
- Indexed frequently queried fields
- Pagination for large result sets
- Archive old sessions
- Vacuum/maintenance schedule

## Scalability Plan

### Phase 1 (Current)
- Single Node.js instance
- Managed PostgreSQL
- Redis for caching

### Phase 2 (2M+ users)
- Horizontal scaling (multiple Node instances)
- Load balancer (AWS ALB)
- Auto-scaling groups

### Phase 3 (5M+ users)
- Microservices split
- Message queue (Bull)
- Separate read replicas

## References

- [Database Schema](06_DATABASE.md)
- [API Reference](04_API_REFERENCE.md)
- [Frontend Components](05_FRONTEND.md)
- [Deployment Options](08_DEPLOYMENT.md)

---

[Back to Docs](00_START_HERE.md)
