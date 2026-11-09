# 🚀 Vercel Frontend Deployment - GrowAgentAI

**Frontend URL**: `https://growagentai.vercel.app`

---

## 📋 Quick Start (5 minutos)

### Step 1: Conectar a Vercel

1. Ir a https://vercel.com/dashboard
2. Click **"Add New"** → **"Project"**
3. Click **"Import Git Repository"**
4. Seleccionar repo: `GrowAgentAI`
5. Vercel detectará automáticamente desde `vercel.json`

### Step 2: Configuración

Vercel auto-detecta:
```
Root Directory: frontend/packages/web
Build Command: npm run build
Output Directory: dist
```

### Step 3: Environment Variables

En Vercel Dashboard → Project Settings → Environment Variables:

```env
VITE_API_URL=http://129.158.255.62:3001
VITE_APP_NAME=GrowAgentAI
VITE_APP_VERSION=2.0.0
VITE_SENTRY_DSN=
```

### Step 4: Deploy

Click **"Deploy"** y esperar ~2-3 minutos

Tu app estará en: **https://growagentai.vercel.app**

---

## 🔧 Configuración Detallada

### vercel.json (ya configurado)

```json
{
  "version": 2,
  "buildCommand": "cd frontend/packages/web && npm run build",
  "outputDirectory": "frontend/packages/web/dist",
  "installCommand": "npm install -g pnpm && pnpm install",
  "env": {
    "VITE_API_URL": "@vite_api_url",
    "VITE_SENTRY_DSN": "@vite_sentry_dsn",
    "VITE_APP_NAME": "GrowAgentAI",
    "VITE_APP_VERSION": "2.0.0"
  }
}
```

### Variables de Entorno Necesarias

| Variable | Valor | Ejemplo |
|----------|-------|---------|
| VITE_API_URL | URL del backend | `http://129.158.255.62:3001` |
| VITE_APP_NAME | Nombre de app | `GrowAgentAI` |
| VITE_APP_VERSION | Versión actual | `2.0.0` |
| VITE_SENTRY_DSN | (Opcional) | `https://...` |

---

## 🚀 CI/CD Automático

Para deployar automáticamente en cada push a main:

### GitHub Actions Workflow

Crea `.github/workflows/deploy-frontend.yml`:

```yaml
name: Deploy Frontend to Vercel

on:
  push:
    branches: [main]
    paths:
      - 'frontend/packages/web/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install Vercel CLI
        run: npm install -g vercel
      
      - name: Deploy to Vercel
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
        run: vercel deploy --prod --token=$VERCEL_TOKEN
```

### Configurar Secrets en GitHub

1. GitHub → Settings → Secrets and variables
2. Agregar:
   - `VERCEL_TOKEN`: Token de https://vercel.com/account/tokens
   - `VERCEL_ORG_ID`: ID de tu org (en Vercel settings)
   - `VERCEL_PROJECT_ID`: ID del proyecto (en Vercel settings)

---

## 🧪 Testing Después del Deploy

### 1. Health Check
```bash
curl https://growagentai.vercel.app
# Debe devolver HTML de la app
```

### 2. Verificar Endpoints
```bash
# Frontend debe poder conectar con backend
curl -H "Origin: https://growagentai.vercel.app" \
  http://129.158.255.62:3001/health
```

### 3. Test Funcional

1. Abrir https://growagentai.vercel.app
2. Click **"Login with GitHub"**
3. Autorizar app
4. Crear nueva sesión
5. Enviar mensaje
6. Backend debe responder ✅

---

## 🐛 Troubleshooting

### Error: "DEPLOYMENT_NOT_FOUND"
```
Causa: Proyecto no conectado a Vercel
Solución:
1. Ir a Vercel dashboard
2. Click "Import Project"
3. Seleccionar repo
4. Configurar y deployar
```

### Error: "Build failed"
```
Causas comunes:
- pnpm not installed
- npm ci falló
- Root directory incorrecto

Solución:
1. Ver logs en Vercel dashboard
2. Revisar path: frontend/packages/web
3. Correr localmente: npm run build
```

### Error: "Cannot reach API"
```
Causa: VITE_API_URL incorrecto o backend down

Solución:
1. Verificar backend está running: 
   docker ps | grep growagentai
   
2. Verificar CORS en backend:
   CORS_ORIGIN debe incluir https://growagentai.vercel.app
   
3. Actualizar VITE_API_URL en Vercel si cambió IP
```

### Error: "Login loop o redirects"
```
Causa: GITHUB_REDIRECT_URI incorrecto en backend

Solución:
1. Backend .env:
   GITHUB_REDIRECT_URI=http://129.158.255.62:3001/auth/github/callback

2. GitHub OAuth App settings:
   Authorization callback URL = Backend URL + /auth/github/callback
```

### Error: "Página en blanco"
```
Causa: Build no completó o vite.config.ts issue

Solución:
1. Revisar Vercel logs
2. Ejecutar localmente:
   cd frontend/packages/web
   npm install
   npm run build
3. Ver si hay errores en console del browser
```

---

## 📊 Monitoreo

### Ver Logs en Vivo
```bash
vercel logs --follow
```

### Chequear Deployments
```bash
vercel list
```

### Promover a Production
```bash
vercel promote <deployment-id>
```

### Rollback
```bash
git revert <commit>
git push origin main
# Vercel automáticamente re-deploya
```

---

## 🔐 Security Checklist

- [ ] Nunca poner secrets en VITE_ variables (públicas)
- [ ] Backend solo accesible desde IP específica
- [ ] CORS configurado correctamente
- [ ] GitHub OAuth secret no expuesto
- [ ] .env.local en .gitignore
- [ ] VERCEL_TOKEN solo en GitHub Secrets

---

## 📝 Checklist Pre-Deploy

- [ ] Tests pasan: `npm test`
- [ ] Build local exitoso: `npm run build:frontend`
- [ ] No hay console errors
- [ ] Backend running y healthy
- [ ] Env vars configuradas en Vercel
- [ ] CORS habilitado en backend
- [ ] GitHub OAuth configurado

---

## 🔗 URLs Útiles

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Project Settings:** https://vercel.com/settings
- **Tokens:** https://vercel.com/account/tokens
- **Build Logs:** https://vercel.com/dashboard/[project]/deployments

---

## 📞 Si Algo Falla

1. Revisar logs en Vercel dashboard
2. Verificar backend está running
3. Chequear environment variables
4. Revisar browser console (F12)
5. Correr `npm run build:frontend` localmente
6. Ver si funciona en localhost primero

---

**Última actualización:** 2026-11-09  
**Status:** 🟡 Setup Needed (Vercel deployment not active yet)
