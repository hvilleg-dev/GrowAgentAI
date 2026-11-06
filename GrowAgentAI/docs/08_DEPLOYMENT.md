# Deployment Guide

Deploy GrowAgentAI to production across multiple cloud providers.

## Pre-Deployment Checklist

- [ ] Tests passing (80%+ coverage)
- [ ] Linting clean (`npm run lint`)
- [ ] Environment variables configured
- [ ] Database backups enabled
- [ ] SSL/TLS certificates ready
- [ ] API keys securely stored
- [ ] Monitoring set up (Sentry, DataDog)
- [ ] HTTPS enforced
- [ ] CORS configured correctly
- [ ] Rate limiting enabled

## Option 1: AWS Deployment

### Using AWS Elastic Container Service (ECS)

#### 1. Create ECR Repository

```bash
# Login to AWS ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin [account-id].dkr.ecr.us-east-1.amazonaws.com

# Create repository
aws ecr create-repository --repository-name growagentai-api
aws ecr create-repository --repository-name growagentai-web
```

#### 2. Build & Push Docker Images

```bash
# Backend
docker build -t growagentai-api:latest backend/
docker tag growagentai-api:latest [account-id].dkr.ecr.us-east-1.amazonaws.com/growagentai-api:latest
docker push [account-id].dkr.ecr.us-east-1.amazonaws.com/growagentai-api:latest

# Frontend
docker build -t growagentai-web:latest frontend/web/
docker tag growagentai-web:latest [account-id].dkr.ecr.us-east-1.amazonaws.com/growagentai-web:latest
docker push [account-id].dkr.ecr.us-east-1.amazonaws.com/growagentai-web:latest
```

#### 3. Create RDS Database

```bash
aws rds create-db-instance \
  --db-instance-identifier growagentai-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username admin \
  --master-user-password [secure-password] \
  --allocated-storage 20 \
  --publicly-accessible false \
  --backup-retention-period 30
```

#### 4. Deploy to ECS

```bash
# Create ECS cluster
aws ecs create-cluster --cluster-name growagentai

# Create task definition (use growagentai-task-definition.json)
aws ecs register-task-definition --cli-input-json file://task-definition.json

# Create service
aws ecs create-service \
  --cluster growagentai \
  --service-name growagentai-api \
  --task-definition growagentai-api:1 \
  --desired-count 2 \
  --launch-type FARGATE
```

### Alternative: AWS Elastic Beanstalk

```bash
# Install EB CLI
pip install awsebcli

# Initialize
eb init -p node.js-18 growagentai-api

# Create environment
eb create growagentai-prod

# Deploy
eb deploy

# View logs
eb logs
```

## Option 2: Azure Deployment

### Using Azure Container Instances

#### 1. Create Resource Group

```bash
az group create \
  --name growagentai-rg \
  --location eastus
```

#### 2. Create Container Registry

```bash
az acr create \
  --resource-group growagentai-rg \
  --name growagentairegistry \
  --sku Basic

# Build and push image
az acr build \
  --registry growagentairegistry \
  --image growagentai-api:latest \
  backend/
```

#### 3. Deploy Container

```bash
az container create \
  --resource-group growagentai-rg \
  --name growagentai-api \
  --image growagentairegistry.azurecr.io/growagentai-api:latest \
  --cpu 1 \
  --memory 1 \
  --environment-variables \
    DATABASE_URL="postgresql://..." \
    ANTHROPIC_API_KEY="sk-ant-..." \
  --ports 3001
```

## Option 3: Google Cloud Platform (GCP)

### Using Cloud Run

#### 1. Build Image

```bash
gcloud builds submit \
  --tag gcr.io/[project-id]/growagentai-api:latest \
  backend/
```

#### 2. Deploy to Cloud Run

```bash
gcloud run deploy growagentai-api \
  --image gcr.io/[project-id]/growagentai-api:latest \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars DATABASE_URL="postgresql://..."
```

## Option 4: Self-Hosted VPS

### Using DigitalOcean / Linode / Vultr

#### 1. Setup Server

```bash
# SSH into server
ssh root@[server-ip]

# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

#### 2. Configure Application

```bash
# Clone repository
git clone https://github.com/[usuario]/growagentai.git
cd growagentai

# Setup environment
cp .env.example .env
nano .env  # Edit with production values

# Setup SSL (Let's Encrypt)
apt install certbot python3-certbot-nginx -y
certbot certonly --standalone -d growagentai.com

# Start services
docker compose -f docker-compose.prod.yml up -d

# Verify
docker compose ps
```

#### 3. Setup Nginx Reverse Proxy

```bash
# Install Nginx
apt install nginx -y

# Create config
cat > /etc/nginx/sites-available/growagentai << 'EOF'
upstream backend {
  server localhost:3001;
}

upstream frontend {
  server localhost:3000;
}

server {
  listen 443 ssl http2;
  server_name growagentai.com;

  ssl_certificate /etc/letsencrypt/live/growagentai.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/growagentai.com/privkey.pem;

  # API proxy
  location /api {
    proxy_pass http://backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }

  # Frontend
  location / {
    proxy_pass http://frontend;
  }
}

# Redirect HTTP to HTTPS
server {
  listen 80;
  server_name growagentai.com;
  return 301 https://$server_name$request_uri;
}
EOF

# Enable site
ln -s /etc/nginx/sites-available/growagentai /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

## Database Migration

```bash
# Backup local database
pg_dump growagentai > backup.sql

# Upload to production server
scp backup.sql root@[server-ip]:/tmp/

# Restore on production
ssh root@[server-ip]
psql growagentai < /tmp/backup.sql

# Or run migrations
docker compose exec backend npm run migrate
```

## Monitoring & Logging

### Sentry Setup

```typescript
// backend/src/server.ts
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

### DataDog Agent

```yaml
# docker-compose.prod.yml
services:
  datadog-agent:
    image: gcr.io/datadoghq/agent:latest
    environment:
      DD_API_KEY: ${DATADOG_API_KEY}
      DD_SITE: datadoghq.com
```

## Health Checks

```bash
# Test API health
curl https://growagentai.com/health

# Expected response
{
  "status": "ok",
  "database": "connected",
  "uptime": 3600
}
```

## Scaling Strategies

### Horizontal Scaling

```bash
# Load balancer with multiple instances
# AWS ALB, Azure LB, or Nginx upstream

upstream backend {
  server api-1:3001;
  server api-2:3001;
  server api-3:3001;
}
```

### Database Optimization

- Read replicas for heavy queries
- Connection pooling (PgBouncer)
- Query optimization & indexing
- Archive old data

## Backup Strategy

### Automated Daily Backups

```bash
# Backup script
#!/bin/bash
BACKUP_DIR="/backups"
DB_NAME="growagentai"
DATE=$(date +%Y-%m-%d)

pg_dump $DB_NAME | gzip > $BACKUP_DIR/backup-$DATE.sql.gz

# Upload to S3
aws s3 cp $BACKUP_DIR/backup-$DATE.sql.gz s3://growagentai-backups/

# Keep only last 30 days
find $BACKUP_DIR -mtime +30 -delete
```

### Add to Crontab

```bash
crontab -e
# Add: 0 2 * * * /scripts/backup.sh  (Daily at 2 AM)
```

## Rollback Procedure

```bash
# Keep previous version tags
docker tag growagentai-api:v1.0.0 growagentai-api:latest
docker push growagentai-api:latest

# Restart with previous version
docker compose pull
docker compose up -d
```

## References

- [AWS Documentation](https://aws.amazon.com/documentation/)
- [Azure Documentation](https://docs.microsoft.com/azure/)
- [GCP Documentation](https://cloud.google.com/docs)
- [Docker Docs](https://docs.docker.com/)
- [Nginx Docs](https://nginx.org/en/docs/)

---

[Back to Docs](00_START_HERE.md)
