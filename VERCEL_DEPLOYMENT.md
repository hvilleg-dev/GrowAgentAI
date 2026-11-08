# 🚀 Vercel Frontend Deployment

**Frontend will run on**: `https://growagentai.vercel.app` (or your custom domain)

---

## Step 1: Go to Vercel

https://vercel.com/dashboard

## Step 2: Import Repository

1. Click **"Add New"** → **"Project"**
2. Click **"Import Git Repository"**
3. Select **GrowAgentAI** repo
4. Click **"Import"**

## Step 3: Configure Project

Vercel will detect settings from `vercel.json`:

| Field | Value |
|-------|-------|
| **Project name** | growagentai (or your choice) |
| **Framework** | Vite |
| **Root Directory** | `frontend/packages/web` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

✅ Should be auto-detected from vercel.json

## Step 4: Add Environment Variables

Click **"Environment Variables"** and add:

```env
VITE_API_URL=http://129.158.255.62:3001/api
VITE_APP_NAME=GrowAgentAI
VITE_APP_VERSION=2.0.0
```

⚠️ Use your Oracle VM IP: `129.158.255.62`

## Step 5: Deploy

Click **"Deploy"**

Wait for:
- ✅ "Analyzing project"
- ✅ "Building"
- ✅ "Ready"

Your frontend is live at: `https://growagentai.vercel.app`

---

## 🎯 Test Frontend

1. Visit: https://growagentai.vercel.app
2. Click **"Login with GitHub"**
3. Authorize the GrowAgentAI app
4. You should be redirected back to the app
5. Create a new session
6. Send a message
7. Bot responds ✅

---

## ⚠️ Troubleshooting

### "Cannot reach API"
```
Check VITE_API_URL is correct:
  http://129.158.255.62:3001/api

Verify backend is running:
  curl http://129.158.255.62:3001/api/health
```

### "Login redirects to GitHub but doesn't come back"
```
Check GITHUB_REDIRECT_URI in backend .env:
  http://129.158.255.62:3001/auth/github/callback

Make sure it matches GitHub OAuth app settings
```

### "Blank page or 404"
```
Check build logs in Vercel dashboard
Root Directory should be: frontend/packages/web
```

---

## 📝 Custom Domain (Optional)

1. In Vercel dashboard → Settings → Domains
2. Add your custom domain
3. Update DNS records (Vercel will provide)
4. Update GitHub OAuth callback URL if using domain

---

**Status**: ✅ Frontend deployed  
**Next**: Setup Neon pgvector + test end-to-end
