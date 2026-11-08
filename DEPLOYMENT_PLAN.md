# Deployment Plan - Vercel + Railway

**Fecha:** 2026-11-07  
**Status:** Starting

## 1. Prerequisites

- [ ] GitHub account with repo pushed (✅ DONE)
- [ ] Vercel account (crear si no tienes)
- [ ] Railway account (crear si no tienes)
- [ ] JWT_SECRET generado

## 2. Step-by-Step Deployment

### STEP 1: Generate JWT_SECRET

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Save this value - needed for backend
```

### STEP 2: Deploy Backend to Railway

**Via Railway Dashboard:**
1. Login a https://railway.app
2. Create New Project → GitHub
3. Select: hvilleg-dev/GrowAgentAI
4. Choose: backend directory
5. Auto-detect: Node.js
6. Add Variables:
   ```
   JWT_SECRET=<your-generated-secret>
   DATABASE_URL=postgresql://...  (Railway auto-creates)
   ANTHROPIC_API_KEY=<your-key>
   OPENAI_API_KEY=<your-key>
   ```
7. Deploy

**Result:** Backend URL: https://growagentai-backend-prod.railway.app

### STEP 3: Deploy Frontend to Vercel

**Via Vercel Dashboard:**
1. Login a https://vercel.com
2. Add New Project → Import Git Repository
3. Select: hvilleg-dev/GrowAgentAI
4. Framework: Vite
5. Root Directory: frontend
6. Build Command: `cd packages/web && npm run build`
7. Output Directory: `frontend/packages/web/dist`
8. Environment Variables:
   ```
   VITE_API_URL=https://growagentai-backend-prod.railway.app
   ```
9. Deploy

**Result:** Frontend URL: https://growagentai.vercel.app

### STEP 4: Verify Everything Works

```bash
# Test backend health
curl https://growagentai-backend-prod.railway.app/health

# Test register (frontend will test)
# 1. Visit https://growagentai.vercel.app
# 2. Register user
# 3. Check Settings (should NOT logout)
# 4. Check Chat
```

## 3. Commands for Automation

If you want me to handle the setup:

```bash
# Generate JWT_SECRET
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
echo "JWT_SECRET: $JWT_SECRET"

# Deploy to Railway (via CLI)
railway login
railway up

# Deploy to Vercel (via CLI)
vercel deploy
```

## 4. Architecture After Deploy

```
Internet User
    ↓
Vercel Frontend (https://growagentai.vercel.app)
    ↓ (sends JWT in Authorization header)
Railway Backend (https://growagentai-backend-prod.railway.app)
    ↓
Railway PostgreSQL Database
```

## 5. Monitoring

- Vercel Dashboard: https://vercel.com/dashboard
- Railway Dashboard: https://railway.app/dashboard
- Logs: Both platforms have real-time logs

## 6. Next Steps After Deploy

- [ ] Test production environment
- [ ] Monitor errors (Sentry optional)
- [ ] Get feedback from users
- [ ] When ready: migrate to Oracle/AWS

---

**Expected Timeline:**
- Backend deploy: 5-10 minutes
- Frontend deploy: 3-5 minutes
- Testing: 5 minutes
- **Total: ~20 minutes**

