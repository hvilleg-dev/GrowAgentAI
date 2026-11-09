#!/bin/bash

# Deploy GrowAgentAI Frontend to Vercel
# Usage: ./deploy-to-vercel.sh [--prod] [--preview]

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  GrowAgentAI Frontend - Vercel Deployment                 ║"
echo "╚════════════════════════════════════════════════════════════╝"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI not found${NC}"
    echo "Install with: npm install -g vercel"
    exit 1
fi

# Check if git is clean
if [[ -n $(git status -s) ]]; then
    echo -e "${YELLOW}⚠️  Uncommitted changes detected${NC}"
    echo "Please commit your changes before deploying"
    exit 1
fi

# Navigate to project root
cd "$(dirname "$0")"

echo -e "${GREEN}✅ Environment checks passed${NC}"
echo ""

# Determine deployment type
PROD_FLAG=""
if [[ "$1" == "--prod" ]]; then
    PROD_FLAG="--prod"
    echo "📦 Deploying to PRODUCTION"
else
    echo "📦 Deploying to PREVIEW"
fi

echo ""
echo "🏗️  Building frontend..."
cd frontend/packages/web
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build successful${NC}"
echo ""

# Deploy
echo "🚀 Deploying to Vercel..."
vercel deploy $PROD_FLAG --token=$VERCEL_TOKEN

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Check deployment URL in output above"
    echo "   2. Visit https://growagentai.vercel.app"
    echo "   3. Test login and chat functionality"
    echo ""
    vercel list --token=$VERCEL_TOKEN
else
    echo -e "${RED}❌ Deployment failed${NC}"
    exit 1
fi
