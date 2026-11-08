# 🆓 DEPLOYMENT FREE TIER - 100% Gratuito para Pruebas

**Objetivo**: Deployar GrowAgentAI sin costo usando tier free de cada plataforma.

---

## 📋 OPCIONES FREE (Comparativa)

| Platform | Frontend | Backend | Database | Costo | Límites |
|----------|----------|---------|----------|-------|---------|
| **Railway** | ❌ | ✅ FREE | ✅ FREE | $0 | 500MB RAM |
| **Vercel** | ✅ FREE | ❌ | N/A | $0 | Unlimited |
| **Render** | ✅ | ✅ FREE | ✅ FREE | $0 | Sleep after 15min |
| **Netlify** | ✅ FREE | ❌ | N/A | $0 | Unlimited |
| **Neon** | ❌ | ❌ | ✅ FREE | $0 | PostgreSQL serverless |
| **Supabase** | ❌ | ❌ | ✅ FREE | $0 | PostgreSQL + pgvector |
| **Fly.io** | ✅ | ✅ FREE | ❌ | $0 | 3 shared-cpu-1x VM |

---

## ✅ RECOMENDACIÓN: OPCIÓN MÁS SIMPLE

### **Combinación: Vercel + Railway + Neon**

```
Frontend (Vercel - FREE)
        ↓
Backend (Railway - FREE 500MB RAM)
        ↓
Database (Neon - FREE PostgreSQL)
```

**Por qué esta combinación:**
- ✅ Vercel: Mejor tier free para React SPA (unlimited)
- ✅ Railway: Simplemente conectas GitHub, auto-deploys (ya lo tienes)
- ✅ Neon: PostgreSQL + pgvector sin pagar (mejor que Railway para DB)

---

## 🚀 SETUP FREE TIER (Step-by-Step)

### PASO 1: Vercel Frontend (FREE - Unlimited)

```bash
# Vercel es GRATIS para SPA estáticas
# Límites: Unlimited deployments, analytics, etc.

1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Import GrowAgentAI repository
4. Root Directory: frontend/packages/web
5. Environment Variables:
   - VITE_API_URL=https://railway-backend-url/api
   - VITE_APP_VERSION=2.0.0
6. Click Deploy → ✅ DONE
```

**Límites**: Ninguno realmente. Vercel es muy generoso con SPA.

---

### PASO 2: Neon Database (FREE - PostgreSQL Serverless)

```bash
# Neon = PostgreSQL serverless GRATIS
# Límites: 0.5 compute units free (plenty for testing)

1. Go to https://console.neon.tech
2. Click "Create Project"
3. Select PostgreSQL version (latest)
4. Copy connection string:
   postgresql://user:password@host/dbname

5. Initialize schema:
   # Run knowledgeBase.sql in Neon console
   # Or via psql: psql "postgresql://..." -f backend/knowledgeBase.sql

6. Save as DATABASE_URL for Railway
```

**Ventajas sobre Railway DB**:
- No consume tu Railway free credits
- PostgreSQL nativo + pgvector
- Perfect para testing

**Crear pgvector extension:**
```sql
-- En Neon console, run:
CREATE EXTENSION IF NOT EXISTS vector;
```

---

### PASO 3: Railway Backend (FREE - 500MB RAM)

```bash
# Railway FREE tier: $5 free credit/month
# 500MB RAM = Suficiente para testing

1. Go to https://railway.app/dashboard
2. Create NEW PROJECT (separate from DB)
3. Add Service → GitHub Repository → GrowAgentAI
4. Root Directory: backend/
5. Environment Variables:
   - DATABASE_URL=postgresql://neon-connection-string
   - OPENAI_API_KEY=sk-proj-... (tu key)
   - ANTHROPIC_API_KEY=sk-ant-... (tu key)
   - GITHUB_CLIENT_ID=...
   - GITHUB_CLIENT_SECRET=...
   - GITHUB_REDIRECT_URI=https://railway-backend-url/auth/github/callback
   - FRONTEND_URL=https://growagentai.vercel.app
   - CORS_ORIGIN=https://growagentai.vercel.app
   - NODE_ENV=production

6. Deploy → Wait for ✅ "Deployment successful"
```

**Nota**: Railway FREE tier tiene $5 de crédito/mes (suficiente para testing).

---

## 💰 COSTO TOTAL: $0

| Component | Platform | Tier | Costo | Duración |
|-----------|----------|------|-------|----------|
| Frontend | Vercel | FREE | $0 | ∞ |
| Backend | Railway | FREE | $0 | 1 mes ($5 credit) |
| Database | Neon | FREE | $0 | ∞ |
| OpenAI Embeddings | OpenAI | Pay-as-you-go | $0.002 | One-time (ya pagaste) |
| **TOTAL** | | | **$0** | |

*Después de 1 mes: Solo gastos de OpenAI/Anthropic API calls (coaches use-per-message)*

---

## ⚡ ALTERNATIVA: Render (TODO EN UNO)

Si prefieres una sola plataforma (Render):

```
Frontend + Backend + Database → Render FREE

Límites:
- Free web service = sleeps after 15 min inactivity
- Free PostgreSQL = 100MB, sleeps after 15 min
- Acceptable for TESTING, no para production
```

**Setup:**
```bash
1. Go to https://render.com
2. Create 3 services:
   - Web Service (frontend) → npm run build → dist
   - Web Service (backend) → npm run start
   - PostgreSQL Database → 100MB free

3. Connect via DATABASE_URL in backend service
```

**Desventaja**: Sleeps after 15 min = slow for testing, no bueno para demostración real.

---

## 🎯 RECOMENDACIÓN FINAL

**Para PRUEBAS SERIAS (recomendado):**
```
✅ Vercel (Frontend)
✅ Railway (Backend)
✅ Neon (Database)

Total: $0 | Performances: 9/10
```

**Para PRUEBAS RÁPIDAS (prototype):**
```
✅ Render (Todo integrado)

Total: $0 | Performance: 6/10 (sleeps)
```

---

## 📋 QUICK START: Vercel + Railway + Neon

### 1. Create Neon Database
```bash
# Go to https://console.neon.tech
# Create project
# Copy connection string as DATABASE_URL
# Run: psql "postgresql://..." -f backend/knowledgeBase.sql
```

### 2. Deploy to Vercel (Frontend)
```bash
# Go to https://vercel.com
# Import repo
# Set VITE_API_URL=https://your-railway-backend/api
# Deploy ✅
```

### 3. Deploy to Railway (Backend)
```bash
# Go to https://railway.app
# New service from GitHub
# Root: backend/
# Set DATABASE_URL from Neon
# Set API keys (OPENAI, ANTHROPIC, GITHUB)
# Deploy ✅
```

### 4. Test
```bash
# Visit https://your-vercel-domain.vercel.app
# Login with GitHub
# Create session
# Send message
# ✅ Done!
```

**Total Time**: 20 minutes  
**Total Cost**: $0

---

## ⚠️ LIMITACIONES FREE TIER

| Limitation | Vercel | Railway | Neon |
|-----------|--------|---------|------|
| Compute | Unlimited | 500MB RAM | Limited to 0.5 CU |
| Bandwidth | Generous | Included | Included |
| Database size | N/A | 100MB (OK) | 3GB (plenty) |
| Sleep timeout | Never | Never | Auto-suspend if idle |
| Cost overage | N/A | Pay after $5 credit | N/A |

**Para GrowAgentAI testing**: Todas las limitaciones son FINE.

---

## 🆚 COMPARATIVA FINAL

### Option A: Vercel + Railway + Neon (RECOMENDADO)
```
✅ Production-ready quality
✅ No sleep/cold starts
✅ Unlimited scalability path
✅ $0 for testing
⏱️ 20 min setup
```

### Option B: Render (TODO EN UNO)
```
✅ Simplest setup
✅ $0 for testing
❌ Sleeps after 15 min (slow)
⏱️ 15 min setup
```

### Option C: Heroku (NO - DEPRECATED)
```
❌ Heroku killed free tier (Nov 2022)
⏳ No longer an option
```

---

## 📝 SETUP SCRIPT (Vercel + Railway + Neon)

```bash
#!/bin/bash

echo "🚀 GrowAgentAI Free Tier Deployment"
echo ""

# Step 1: Neon
echo "1️⃣ Go to https://console.neon.tech"
echo "   - Create project"
echo "   - Copy connection string"
echo "   - Run: psql CONNECTION_STRING < backend/knowledgeBase.sql"
read -p "   Press ENTER when DATABASE_URL is ready..."

# Step 2: Vercel
echo ""
echo "2️⃣ Go to https://vercel.com"
echo "   - Import repository"
echo "   - Root: frontend/packages/web"
echo "   - Set VITE_API_URL environment variable"
read -p "   Press ENTER when Vercel is deployed..."

# Step 3: Railway
echo ""
echo "3️⃣ Go to https://railway.app"
echo "   - New service from GitHub"
echo "   - Root: backend/"
echo "   - Set DATABASE_URL from Neon"
echo "   - Set API keys (OPENAI, ANTHROPIC, GITHUB)"
read -p "   Press ENTER when Railway is deployed..."

# Step 4: Test
echo ""
echo "4️⃣ Testing deployment..."
echo "   - Visit your Vercel domain"
echo "   - Login with GitHub"
echo "   - Create session & send message"
echo ""
echo "✅ Deployment complete!"
```

---

## 🎉 RESULTADO

Después de seguir estos pasos tendrás:

- ✅ Frontend en Vercel (producción, 0 costo)
- ✅ Backend en Railway (testing, $0 con crédito free)
- ✅ Database en Neon (0 costo indefinido)
- ✅ Todo conectado y funcionando
- ✅ RAG con embeddings reales
- ✅ GitHub OAuth
- ✅ Multi-idioma (ES/EN)

**Costo total: $0**  
**Tiempo: ~30 min**  
**Calidad: Production-ready**

---

## ❓ FAQ

**¿Qué pasa después de 1 mes con Railway?**
- Railway te da $5 free/mes. Después pagas por uso real (probablemente $5-10/mes para testing).

**¿Puedo cambiar a paid tier después?**
- Sí, solo cambiar env vars. Neon → Neon paid, Railway → Railway paid, etc.

**¿Es production-ready?**
- Vercel + Neon: Sí (ambos tier free son production-ready)
- Railway: Para testing sí, para production scale → pagar

**¿Qué pasa si me quedo sin crédito Railway?**
- Backend se va offline. Costo es mínimo (~$2-3/mes realista).

---

**Status**: ✅ FREE TIER LISTO  
**Recomendación**: Vercel + Railway + Neon  
**Costo**: $0 (por ahora)  
**Próximo**: Ejecutar los 3 pasos arriba

