# 🔐 GitHub OAuth Setup

## Step 1: Create OAuth App

1. Go to: https://github.com/settings/developers
2. Click **"OAuth Apps"** (left sidebar)
3. Click **"New OAuth App"**

## Step 2: Fill in OAuth App Details

| Field | Value |
|-------|-------|
| **Application name** | GrowAgentAI |
| **Homepage URL** | https://growagentai.vercel.app |
| **Application description** | AI coaching platform with RAG |
| **Authorization callback URL** | http://129.158.255.62:3001/auth/github/callback |

⚠️ **IMPORTANT**: Use your Oracle VM IP exactly: `129.158.255.62`

## Step 3: Save Credentials

After creating the app, you'll see:
- **Client ID**: `Iv1.xxxxxxxxxxxxx`
- **Client Secret**: `xxxxxxxxxxxxxxxx` (click "Generate a new client secret")

Copy both values and save them.

## Step 4: Update Your .env File

Create `.env` file in repository root:

```env
# GitHub OAuth
GITHUB_CLIENT_ID=Iv1.xxxxxxxxxxxxx
GITHUB_CLIENT_SECRET=xxxxxxxxxxxxxxxx
GITHUB_REDIRECT_URI=http://129.158.255.62:3001/auth/github/callback

# Database
DATABASE_URL=postgresql://neondb_owner:npg_LO1Hp6zaASDF@ep-broad-grass-beyn3aro-pooler.c-9.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# API Keys
OPENAI_API_KEY=sk-proj-...
ANTHROPIC_API_KEY=sk-ant-... (optional, add later)

# Frontend
FRONTEND_URL=https://growagentai.vercel.app
CORS_ORIGIN=https://growagentai.vercel.app
```

## ✅ Done!

Your OAuth app is ready. The credentials will be used when you deploy to your Oracle VM.
