# 🆓 FREE TIER - QUICK START

## 3 OPCIONES (Pick one)

### ✅ RECOMENDADO: Vercel + Railway + Neon

**Cost**: $0 primer mes, ~$3-5/mes después  
**Time**: 20 min  
**Quality**: ⭐⭐⭐⭐⭐ Production-ready

```
Vercel (Frontend) → Railway (Backend) → Neon (Database)
```

**Setup**:
```bash
1. Neon: https://console.neon.tech
   - Create project
   - Copy connection string
   - CREATE EXTENSION vector;

2. Railway: https://railway.app
   - New Service from GitHub
   - Root: backend/
   - Set DATABASE_URL + API keys

3. Vercel: https://vercel.com
   - Import repo
   - Set VITE_API_URL=railway-url/api
   - Deploy

4. GitHub OAuth: Update callback URL
```

---

### 🟡 ALTERNATIVA: Render (Everything in One)

**Cost**: $0 forever  
**Time**: 15 min  
**Quality**: ⭐⭐⭐ (sleeps after 15 min)

```
Render (Frontend + Backend + Database)
```

**Issue**: Sleeps after 15 min inactivity = slow for testing

---

### 🟡 ALTERNATIVA 2: Fly.io + Neon

**Cost**: $0 if within limits  
**Time**: 25 min  
**Quality**: ⭐⭐⭐⭐ (good)

```
Fly.io (Frontend + Backend) → Neon (Database)
```

---

## 🚀 FASTEST SETUP: Vercel + Railway + Neon

### PASO 1: Create Neon Database (5 min)

```
1. Go to https://console.neon.tech
2. Sign up
3. Create new project
4. Copy connection string
5. Save as DATABASE_URL
6. Run in Neon console:
   CREATE EXTENSION IF NOT EXISTS vector;
```

### PASO 2: Deploy Backend to Railway (5 min)

```
1. Go to https://railway.app
2. New Project
3. Add Service → GitHub → GrowAgentAI
4. Root Directory: backend/
5. Environment Variables:
   - DATABASE_URL=neon-string
   - OPENAI_API_KEY=sk-proj-...
   - ANTHROPIC_API_KEY=sk-ant-...
   - GITHUB_CLIENT_ID=...
   - GITHUB_CLIENT_SECRET=...
   - NODE_ENV=production
6. Deploy ✅
7. Copy backend URL
```

### PASO 3: Deploy Frontend to Vercel (5 min)

```
1. Go to https://vercel.com
2. Add New → Import Git
3. Select GrowAgentAI
4. Root: frontend/packages/web
5. Environment:
   - VITE_API_URL=railway-url/api
6. Deploy ✅
7. Copy frontend URL
```

### PASO 4: Update GitHub OAuth (2 min)

```
1. GitHub Settings → Developer Settings → OAuth Apps
2. Update Authorization callback:
   https://railway-backend-url/auth/github/callback
```

### PASO 5: Test (3 min)

```
1. Visit Vercel frontend URL
2. Login with GitHub
3. Create session
4. Send message
5. Bot responds ✅
```

**Total: 20 minutes | Cost: $0**

---

## 📊 COMPARISON TABLE

| Feature | Vercel+Railway+Neon | Render | Fly.io+Neon |
|---------|---|---|---|
| Frontend | ✅ Vercel | ✅ Render | ✅ Fly.io |
| Backend | ✅ Railway | ✅ Render | ✅ Fly.io |
| Database | ✅ Neon | ⚠️ 100MB | ✅ Neon |
| Cold starts | None | Every 15min | None |
| Cost/month | $0-5 | $0 | $0 |
| Setup time | 20 min | 15 min | 25 min |
| Quality | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Recommendation** | ✅ BEST | ⚠️ Quick | 🟡 Good |

---

## 🎯 PICK YOUR OPTION

### If you want: Production quality, no sleeps
→ **Use Vercel + Railway + Neon**

### If you want: Simplest setup, don't mind sleeps
→ **Use Render (all-in-one)**

### If you want: Good balance, no database limits
→ **Use Fly.io + Neon**

---

## 💡 COST BREAKDOWN

### Vercel + Railway + Neon

**Month 1**: Railway $5 free credit
- Total: **$0**

**Month 2+**: Railway $3-5 actual usage
- Total: **~$4/month**

*Vercel + Neon always free*

### Render

**Every month**: Everything free but sleeps
- Total: **$0**

### Fly.io + Neon

**Month 1**: Free tier (3 shared VMs)
- Total: **$0**

**Month 2+**: If over limits, start paying
- Total: **$0-5/month** (depends on usage)

---

## ✅ RECOMMENDED: Vercel + Railway + Neon

**Why this combo?**
- ✅ Vercel = best free tier for React SPA (truly unlimited)
- ✅ Railway = simple GitHub integration, auto-deploys
- ✅ Neon = free PostgreSQL with pgvector support
- ✅ All components are production-ready
- ✅ $0 first month with $5 Railway credit

**Setup time**: 20 minutes  
**Cost**: $0 now, ~$4/mo realistic  
**Quality**: Production-grade

---

## 🚀 RUN DEPLOY SCRIPT

```bash
./DEPLOY_FREE.sh
```

This will guide you through all 5 steps interactively.

---

**Status**: ✅ Free tier ready  
**Recommendation**: Vercel + Railway + Neon  
**Next**: Execute setup above
