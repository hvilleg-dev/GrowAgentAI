# ✅ Pre-Deployment Checklist

Before deploying to Vercel + Railway, verify all items below are complete.

## 🔧 LOCAL VERIFICATION

- [ ] **Git is clean**
  ```bash
  git status
  # Should show: "nothing to commit, working tree clean"
  ```

- [ ] **Main branch is up to date**
  ```bash
  git log --oneline main | head -5
  # Should show recent commits
  ```

- [ ] **Backend builds successfully**
  ```bash
  cd backend
  npm run build
  # No errors or warnings
  ```

- [ ] **Frontend builds successfully**
  ```bash
  cd frontend/packages/web
  npm run build
  # Vite bundle analysis shows no issues
  ```

- [ ] **Tests pass**
  ```bash
  cd backend
  npm test
  # All 54+ tests pass
  ```

---

## 🔐 CREDENTIALS & SECRETS

- [ ] **GitHub OAuth App Created**
  - Go to: GitHub → Settings → Developer settings → OAuth Apps
  - Create app if not exists
  - Save: `GITHUB_CLIENT_ID`
  - Save: `GITHUB_CLIENT_SECRET`
  - Set Callback URL: (will update after Railway domain is ready)

- [ ] **OpenAI API Key**
  - Go to: https://platform.openai.com/api-keys
  - Create key or use existing
  - Save: `OPENAI_API_KEY`
  - ⚠️ NEVER commit to git

- [ ] **Anthropic API Key**
  - Go to: https://console.anthropic.com/
  - Create key or use existing
  - Save: `ANTHROPIC_API_KEY`
  - ⚠️ NEVER commit to git

---

## ☁️ PLATFORM ACCOUNTS

- [ ] **Railway Account**
  - [ ] Created and logged in
  - [ ] GitHub connected for deployments
  - [ ] Verified email

- [ ] **Vercel Account**
  - [ ] Created and logged in
  - [ ] GitHub connected for deployments
  - [ ] Verified email

---

## 📦 CODE QUALITY

- [ ] **No hardcoded secrets in code**
  ```bash
  grep -r "sk-" backend/src frontend/packages/web | grep -v "sk-" || echo "✅ No hardcoded keys"
  ```

- [ ] **Environment variables use .env.example**
  - [ ] backend/.env.example exists
  - [ ] frontend/.env.example exists (if needed)
  - [ ] gitignore has .env.local and .env

- [ ] **Error handling implemented**
  - [ ] Try-catch in all async functions
  - [ ] Meaningful error messages
  - [ ] No 500 errors on invalid input

- [ ] **CORS configured correctly**
  - [ ] Backend allows Vercel domain
  - [ ] Frontend points to Railway backend

---

## 📝 DEPLOYMENT FILES

- [ ] **vercel.json exists and is valid**
  ```bash
  cat vercel.json | jq .
  # Should show build command, output dir, env vars
  ```

- [ ] **knowledgeBase.sql exists in backend/**
  ```bash
  ls -la backend/knowledgeBase.sql
  ```

- [ ] **Dockerfile exists (for Railway)**
  ```bash
  ls -la backend/Dockerfile
  cat backend/Dockerfile | head -20
  ```

- [ ] **package.json has correct scripts**
  ```bash
  grep -A 5 '"scripts"' backend/package.json
  # Should have: build, start, test, dev
  ```

---

## 🚀 PRE-FLIGHT TEST

Run this in Docker locally to simulate production:

```bash
cd /d/pruebas

# Start containers
docker-compose up -d

# Wait 10 seconds for DB to initialize
sleep 10

# Test backend health
curl http://localhost:3001/api/health
# Expected: {"status":"ok"}

# Test database
curl http://localhost:3001/api/health/db
# Expected: {"status":"connected"}

# Test RAG
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-session",
    "userId": "test-user",
    "message": "How do I manage stress?"
  }'
# Expected: 200 OK with coaching response + RAG context

# Cleanup
docker-compose down
```

---

## 📋 ENVIRONMENT VARIABLES READY

### Backend (Railway)
- [ ] `DATABASE_URL` - from Railway DB
- [ ] `OPENAI_API_KEY` - from OpenAI
- [ ] `ANTHROPIC_API_KEY` - from Anthropic
- [ ] `GITHUB_CLIENT_ID` - from GitHub OAuth
- [ ] `GITHUB_CLIENT_SECRET` - from GitHub OAuth
- [ ] `GITHUB_REDIRECT_URI` - set after Railway domain ready
- [ ] `FRONTEND_URL` - set after Vercel domain ready
- [ ] `CORS_ORIGIN` - set after Vercel domain ready
- [ ] `NODE_ENV=production`
- [ ] `PORT=3001`

### Frontend (Vercel)
- [ ] `VITE_API_URL` - set after Railway backend deployed
- [ ] `VITE_SENTRY_DSN` - optional
- [ ] `VITE_APP_NAME=GrowAgentAI`
- [ ] `VITE_APP_VERSION=2.0.0`

---

## ✨ FINAL CHECKS

- [ ] **Documentation is up to date**
  - [ ] README.md exists
  - [ ] DEPLOYMENT_VERCEL_RAILWAY.md exists
  - [ ] API docs are accurate

- [ ] **No security issues**
  - [ ] git remote is HTTPS (not SSH exposed)
  - [ ] Secrets never logged
  - [ ] CORS properly configured
  - [ ] Auth tokens handled securely

- [ ] **Monitoring & Logging ready**
  - [ ] Sentry account created (optional but recommended)
  - [ ] Railway logging enabled
  - [ ] Vercel analytics enabled

---

## 📋 DEPLOYMENT CHECKLIST

### When deploying:

1. **Create Railway Database**
   - [ ] PostgreSQL provisioned
   - [ ] CONNECTION_URL saved
   - [ ] pgvector extension enabled

2. **Deploy Backend to Railway**
   - [ ] Service created
   - [ ] Environment variables set
   - [ ] Build succeeds
   - [ ] API is healthy

3. **Update GitHub OAuth URLs**
   - [ ] Set `GITHUB_REDIRECT_URI` in GitHub app settings
   - [ ] Set `GITHUB_REDIRECT_URI` in Railway env vars
   - [ ] Set `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` in Railway

4. **Deploy Frontend to Vercel**
   - [ ] Project imported
   - [ ] Environment variables set
   - [ ] Build succeeds
   - [ ] Domain is accessible

5. **End-to-End Test**
   - [ ] Frontend loads
   - [ ] GitHub OAuth login works
   - [ ] Can create session
   - [ ] Can send message
   - [ ] Bot responds with context
   - [ ] No 500 errors

---

## 🆘 TROUBLESHOOTING

If deployment fails, check:

1. **Backend won't start**
   - [ ] DATABASE_URL is correct
   - [ ] All API keys are set
   - [ ] Node version matches (18+)
   - [ ] Check Railway logs

2. **Frontend shows "Cannot reach API"**
   - [ ] VITE_API_URL points to Railway backend
   - [ ] CORS_ORIGIN is set correctly in backend
   - [ ] Backend is deployed and healthy

3. **GitHub OAuth fails**
   - [ ] GITHUB_REDIRECT_URI matches exactly
   - [ ] Client ID/Secret are correct
   - [ ] Callback URL is HTTPS in production

4. **Database migrations fail**
   - [ ] PostgreSQL is running
   - [ ] knowledgeBase.sql exists
   - [ ] pgvector extension is enabled

---

## ✅ READY TO DEPLOY?

If all items are checked, you're ready to deploy!

```bash
./DEPLOY.sh
```

Then follow the instructions in **DEPLOYMENT_VERCEL_RAILWAY.md**

**Estimated deployment time**: 15-30 minutes

---

**Last Updated**: Nov 8, 2026  
**Status**: 🟡 Ready for deployment  
**Next Step**: Follow DEPLOYMENT_VERCEL_RAILWAY.md
