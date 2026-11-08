# 🚀 DEPLOYMENT VERCEL + RAILWAY

## FASE 3: Production Deployment
- **Frontend**: Vercel (Web React SPA)
- **Backend**: Railway (Node.js + PostgreSQL)
- **Database**: Railway PostgreSQL (managed)
- **Authentication**: GitHub OAuth (configured)

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### ✅ Completed
- [x] RAG Fase 2 complete (10/10 embeddings real)
- [x] Backend v2.0.0 (54 tests passing)
- [x] Frontend v2.0.0 (Settings + Auth + Chat)
- [x] All 4 bug fixes (session, logout, login, errors)
- [x] GitHub repos created
- [x] GitHub OAuth app configured
- [x] Vercel account created
- [x] Railway account created

### ⚠️ To Do
- [ ] Push `main` branch to GitHub
- [ ] Create Railway PostgreSQL database
- [ ] Deploy backend to Railway
- [ ] Configure Railway environment variables
- [ ] Deploy frontend to Vercel
- [ ] Configure Vercel environment variables
- [ ] Test end-to-end (web → API → DB)
- [ ] Configure domain + SSL

---

## 🟢 STEP 1: PUSH TO GITHUB

```bash
# Verify all commits are on main
git log --oneline -10

# Push to GitHub
git push -u origin main

# Verify remote is up to date
git branch -vv
```

**Expected**: `main` → `origin/main` (up to date)

---

## 🟢 STEP 2: RAILWAY - DATABASE SETUP

### 2.1 Create PostgreSQL Database
1. Go to https://railway.app/dashboard
2. Click **"New Project"**
3. Select **"Database"** → **"PostgreSQL"**
4. Railway creates auto-generated credentials
5. Copy connection string from "Connect" tab

### 2.2 Database Variables
Railway provides (copy from dashboard):
```
DATABASE_URL=postgresql://user:password@host:port/dbname
```

### 2.3 Initialize Schema
Run in Railway Database Terminal or via CLI:
```sql
-- Run knowledgeBase.sql
-- Migrations will auto-run on app startup
```

---

## 🟢 STEP 3: RAILWAY - BACKEND DEPLOYMENT

### 3.1 Create Backend Service
1. Go to Railway project (same as DB)
2. Click **"New Service"** → **"GitHub Repo"**
3. Select **GrowAgentAI** repo
4. Set **Root Directory**: `backend/`
5. Select branch: `main`

### 3.2 Configure Environment Variables

In Railway dashboard, set for backend service:

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/dbname

# API Keys
OPENAI_API_KEY=sk-proj-...
ANTHROPIC_API_KEY=sk-ant-...

# Auth (from GitHub OAuth app)
GITHUB_CLIENT_ID=<from .env.local>
GITHUB_CLIENT_SECRET=<from .env.local>
GITHUB_REDIRECT_URI=https://backend-railway.railway.app/auth/github/callback

# Frontend
FRONTEND_URL=https://growagentai.vercel.app
CORS_ORIGIN=https://growagentai.vercel.app

# App
NODE_ENV=production
PORT=3001
LOG_LEVEL=info

# Sentry (optional)
SENTRY_DSN=https://key@sentry.io/project
```

### 3.3 Deploy Backend

Railway auto-deploys when:
- Environment variables are set
- Service is connected to GitHub repo
- `main` branch has valid `backend/package.json`

Monitor deployment:
- Railway → "Deployments" tab
- Check logs in "Logs" tab
- Wait for ✅ "Deployment successful"

**Expected backend URL**: `https://growagentai.railway.app`

---

## 🟢 STEP 4: VERCEL - FRONTEND DEPLOYMENT

### 4.1 Import Project
1. Go to https://vercel.com/dashboard
2. Click **"Add New"** → **"Project"**
3. Click **"Import Git Repository"**
4. Select **GrowAgentAI** (GitHub)
5. Click **"Import"**

### 4.2 Configure Build Settings

Vercel auto-detects from `vercel.json`:
- **Build Command**: `cd frontend/packages/web && npm run build`
- **Output Directory**: `frontend/packages/web/dist`
- **Install Command**: `npm install -g pnpm && pnpm install`

### 4.3 Configure Environment Variables

In Vercel dashboard → Settings → Environment Variables:

```env
# API
VITE_API_URL=https://growagentai.railway.app/api

# Sentry
VITE_SENTRY_DSN=https://key@sentry.io/project

# App
VITE_APP_NAME=GrowAgentAI
VITE_APP_VERSION=2.0.0
```

### 4.4 Deploy Frontend

Click **"Deploy"** in Vercel dashboard.

Monitor deployment:
- Vercel → "Deployments" tab
- Check logs
- Wait for ✅ "Ready"

**Expected frontend URL**: `https://growagentai.vercel.app`

---

## 🟢 STEP 5: POST-DEPLOYMENT VERIFICATION

### 5.1 Frontend
```bash
# Visit https://growagentai.vercel.app
# Should load React app
# Login with GitHub → should redirect to GitHub
```

### 5.2 Backend Health
```bash
curl https://growagentai.railway.app/api/health
# Expected: {"status": "ok"}
```

### 5.3 Database Connection
```bash
curl https://growagentai.railway.app/api/health/db
# Expected: {"status": "connected"}
```

### 5.4 End-to-End Test
1. Go to https://growagentai.vercel.app
2. Login with GitHub
3. Create new session
4. Send message
5. Bot responds with RAG context
6. Verify in Railway logs: no errors

---

## 🟢 STEP 6: CONFIGURE CUSTOM DOMAIN (OPTIONAL)

### Vercel
1. Dashboard → Project → Settings → Domains
2. Add custom domain (e.g., `app.growagentai.com`)
3. Update DNS records
4. Vercel auto-provisions SSL

### Railway
1. Dashboard → Backend Service → Settings → Public Networking
2. Generate Railway domain
3. Use as `RAILWAY_URL` or custom domain via DNS

---

## ⚙️ ENVIRONMENT VARIABLES REFERENCE

### Backend (Railway)
```env
DATABASE_URL                    # PostgreSQL connection string
OPENAI_API_KEY                  # For embeddings, LLM calls
ANTHROPIC_API_KEY               # For coaching model
GITHUB_CLIENT_ID                # OAuth
GITHUB_CLIENT_SECRET            # OAuth
GITHUB_REDIRECT_URI             # Must match GitHub app settings
FRONTEND_URL                    # For CORS, redirects
CORS_ORIGIN                     # Allowed origins
NODE_ENV                        # production
PORT                            # 3001 (default)
LOG_LEVEL                       # info
SENTRY_DSN                      # Error tracking (optional)
```

### Frontend (Vercel)
```env
VITE_API_URL                    # Backend API base URL
VITE_SENTRY_DSN                 # Error tracking (optional)
VITE_APP_NAME                   # GrowAgentAI
VITE_APP_VERSION                # 2.0.0
```

---

## 🔐 SECRETS MANAGEMENT

### GitHub OAuth App
1. Go to GitHub → Settings → Developer settings → OAuth Apps
2. Create app if not exists:
   - **Application name**: GrowAgentAI
   - **Homepage URL**: https://growagentai.vercel.app
   - **Authorization callback URL**: https://growagentai.railway.app/auth/github/callback
3. Copy:
   - Client ID → `GITHUB_CLIENT_ID`
   - Client Secret → `GITHUB_CLIENT_SECRET` (never commit!)

### .env.local (LOCAL ONLY, NEVER COMMIT)
```env
GITHUB_CLIENT_ID=your_id
GITHUB_CLIENT_SECRET=your_secret
OPENAI_API_KEY=sk-proj-...
ANTHROPIC_API_KEY=sk-ant-...
```

### Railway Secrets
- Set via Railway dashboard (UI or CLI)
- Never commit to GitHub
- Each deploy pulls latest from Railway

### Vercel Secrets
- Set via Vercel dashboard
- Never commit to GitHub
- Built into deployment

---

## 🔍 TROUBLESHOOTING

### Frontend shows "Cannot reach API"
- [ ] Verify `VITE_API_URL` is set correctly in Vercel
- [ ] Check backend is deployed and healthy
- [ ] Check CORS headers in backend

### Backend won't start
- [ ] Check PostgreSQL connection: `DATABASE_URL` correct?
- [ ] Check all required env vars are set in Railway
- [ ] View Railway logs for errors

### Database migrations fail
- [ ] Ensure `knowledgeBase.sql` is in backend root
- [ ] Check PostgreSQL is accessible from Railway
- [ ] Run migrations manually if needed

### GitHub OAuth not working
- [ ] Verify `GITHUB_REDIRECT_URI` matches exactly in GitHub app settings
- [ ] Check OAuth credentials are correct
- [ ] Verify frontend redirects to backend `/auth/github`

---

## 📊 DEPLOYMENT ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                       USER BROWSER                              │
│                  https://growagentai.vercel.app                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
        ┌────────────────┴────────────────┐
        │                                 │
   [Vercel]                          [GitHub OAuth]
   Frontend (React)                  User Login
   - Settings                        
   - Chat                            
   - Goals                           
        │                                 │
        └────────────────┬────────────────┘
                         │
                         ▼
        ┌──────────────────────────────────┐
        │         RAILWAY                  │
        │  Backend: Node.js + Express      │
        │  /api/chat                       │
        │  /api/sessions                   │
        │  /api/users                      │
        │  /auth/github                    │
        └─────────────┬────────────────────┘
                      │
                      ▼
        ┌──────────────────────────────────┐
        │         RAILWAY                  │
        │    PostgreSQL Database           │
        │  - usuarios                      │
        │  - sesiones                      │
        │  - mensajes                      │
        │  - goals                         │
        │  - knowledge_chunks (RAG)        │
        └──────────────────────────────────┘
                      │
        ┌─────────────┴──────────────────────┐
        │                                    │
    [OpenAI]                         [Anthropic]
    text-embedding-3-small           claude-opus-5-5
    (RAG embeddings)                 (Coaching model)
```

---

## ✅ SUCCESS CRITERIA

1. ✅ Frontend loads without errors
2. ✅ GitHub OAuth login works
3. ✅ Can create new sessions
4. ✅ Can send messages
5. ✅ Bot responds with coaching + RAG context
6. ✅ Database persists data
7. ✅ No 500 errors in logs
8. ✅ Latency < 5 seconds per message

---

## 📝 POST-DEPLOYMENT TASKS

- [ ] Test with real users
- [ ] Monitor Railway logs for errors
- [ ] Check Vercel analytics
- [ ] Set up Sentry error tracking
- [ ] Configure CloudFlare (optional)
- [ ] Set up monitoring/alerting
- [ ] Document API endpoints
- [ ] Create runbook for support

---

**Status**: 🟡 Ready for deployment  
**Next**: Execute steps 1-5 above  
**ETA**: ~30 mins (most time is Railway DB provisioning)
