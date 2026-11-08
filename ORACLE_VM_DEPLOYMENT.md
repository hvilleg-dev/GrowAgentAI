# 🚀 Oracle VM Deployment Guide

**Your VM IP**: `129.158.255.62`  
**Backend will run on**: `http://129.158.255.62:3001`

---

## Step 1: SSH into Your Oracle VM

```bash
ssh ubuntu@129.158.255.62
# Enter your password or use SSH key
```

## Step 2: Install Docker

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install -y docker.io docker-compose

# Add your user to docker group (so you don't need sudo)
sudo usermod -aG docker ubuntu
newgrp docker

# Verify Docker
docker --version
docker-compose --version
```

## Step 3: Clone Repository

```bash
# Clone from GitHub
git clone https://github.com/hvilleg-dev/GrowAgentAI.git
cd GrowAgentAI

# Verify files
ls -la backend/Dockerfile
ls -la docker-compose.yml
```

## Step 4: Create .env File

```bash
# Create .env in repository root
cat > .env << 'EOF'
# GitHub OAuth
GITHUB_CLIENT_ID=Iv1.xxxxxxxxxxxxx
GITHUB_CLIENT_SECRET=xxxxxxxxxxxxxxxx
GITHUB_REDIRECT_URI=http://129.158.255.62:3001/auth/github/callback

# Database (from Neon)
DATABASE_URL=postgresql://neondb_owner:npg_LO1Hp6zaASDF@ep-broad-grass-beyn3aro-pooler.c-9.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# API Keys
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxx

# Frontend
FRONTEND_URL=https://growagentai.vercel.app
CORS_ORIGIN=https://growagentai.vercel.app

# App
NODE_ENV=production
PORT=3001
LOG_LEVEL=info
EOF
```

**⚠️ Replace with YOUR actual values:**
- `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` from GitHub OAuth app
- `DATABASE_URL` from Neon
- `OPENAI_API_KEY` from OpenAI

## Step 5: Build Docker Image

```bash
# Build the backend Docker image
docker build -t growagentai-backend backend/

# This will take 2-3 minutes
# Wait for: "Successfully tagged growagentai-backend:latest"
```

## Step 6: Start Backend Container

```bash
# Run with docker-compose (manages all environment variables)
docker-compose up -d

# Check if running
docker ps

# You should see: growagentai-backend (STATUS: Up)
```

## Step 7: Verify Backend is Healthy

```bash
# Check logs
docker logs growagentai-backend

# Test health endpoint
curl http://localhost:3001/api/health

# Expected response:
# {"status":"ok"}

# Test database connection
curl http://localhost:3001/api/health/db

# Expected response:
# {"status":"connected"}
```

## Step 8: Check Logs

```bash
# View real-time logs
docker logs -f growagentai-backend

# View last 100 lines
docker logs --tail 100 growagentai-backend
```

## 🔧 Useful Docker Commands

```bash
# Stop container
docker-compose down

# Start again
docker-compose up -d

# Rebuild after code changes
docker-compose up -d --build

# Remove everything and start fresh
docker-compose down -v
docker-compose up -d --build

# SSH into container
docker exec -it growagentai-backend sh

# View all containers
docker ps -a

# Remove image
docker rmi growagentai-backend
```

---

## 🎯 Next Steps

1. ✅ Backend running on `http://129.158.255.62:3001`
2. ⏳ Deploy frontend to Vercel (see VERCEL_DEPLOYMENT.md)
3. ⏳ Setup Neon pgvector extension (see NEON_SETUP.md)
4. ⏳ Test end-to-end

---

## ⚠️ Troubleshooting

### "Connection refused"
```
The backend isn't running.
docker-compose up -d --build
```

### "Database connection error"
```
Check DATABASE_URL is correct
docker logs growagentai-backend
```

### "Port 3001 already in use"
```
Kill existing process:
sudo lsof -i :3001
sudo kill -9 <PID>

Or change port in docker-compose.yml
```

### "Out of memory"
```
Increase VM RAM or adjust resource limits in docker-compose.yml
```

---

**Status**: ✅ Backend ready  
**Next**: Deploy frontend to Vercel + setup Neon
