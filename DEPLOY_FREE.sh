#!/bin/bash
set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Functions
print_header() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_step() {
    echo -e "${YELLOW}$1${NC}"
}

print_done() {
    echo -e "${GREEN}✅ $1${NC}"
}

main() {
    print_header "🆓 GrowAgentAI Free Tier Deployment"

    echo ""
    echo "This will deploy to: Vercel (frontend) + Railway (backend) + Neon (database)"
    echo "Cost: $0 per month (using free tiers)"
    echo ""

    # Step 1: Git
    print_header "STEP 1: Prepare Git"

    if ! git diff-index --quiet HEAD --; then
        echo "❌ You have uncommitted changes"
        git status
        exit 1
    fi

    print_done "Git is clean"

    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    if [[ "$CURRENT_BRANCH" != "main" ]]; then
        echo "⚠️ You are on branch: $CURRENT_BRANCH"
        read -p "   Continue anyway? (y/n): " response
        if [[ ! "$response" =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi

    print_step "Pushing to GitHub..."
    git push -u origin "$CURRENT_BRANCH" || true
    print_done "Code pushed to GitHub"

    # Step 2: Neon
    print_header "STEP 2: Create Neon Database (FREE)"

    echo ""
    echo "🔗 Go to: https://console.neon.tech"
    echo ""
    echo "Instructions:"
    echo "  1. Sign up or login"
    echo "  2. Create new project"
    echo "  3. Select PostgreSQL (latest version)"
    echo "  4. Copy connection string from \"Connection string\" section"
    echo "  5. Paste it below"
    echo ""

    read -p "📋 Neon DATABASE_URL (postgresql://...): " NEON_CONNECTION
    if [[ -z "$NEON_CONNECTION" ]]; then
        echo "❌ DATABASE_URL cannot be empty"
        exit 1
    fi
    print_done "Neon database URL saved"

    # Initialize schema
    echo ""
    print_step "Initializing database schema..."
    echo "📋 Run this command in Neon console:"
    echo "   CREATE EXTENSION IF NOT EXISTS vector;"
    echo ""
    read -p "   Press ENTER after running the command in Neon..."

    # Step 3: Railway
    print_header "STEP 3: Deploy Backend to Railway (FREE)"

    echo ""
    echo "🔗 Go to: https://railway.app/dashboard"
    echo ""
    echo "Instructions:"
    echo "  1. Click \"New Project\""
    echo "  2. Click \"Add Service\" → \"GitHub Repository\""
    echo "  3. Select GrowAgentAI repository"
    echo "  4. Set ROOT DIRECTORY: backend/"
    echo "  5. Add Environment Variables:"
    echo ""
    echo "    • DATABASE_URL=$NEON_CONNECTION"
    echo "    • OPENAI_API_KEY=(your key)"
    echo "    • ANTHROPIC_API_KEY=(your key)"
    echo "    • GITHUB_CLIENT_ID=(from GitHub OAuth app)"
    echo "    • GITHUB_CLIENT_SECRET=(from GitHub OAuth app)"
    echo "    • NODE_ENV=production"
    echo ""

    read -p "📋 Railway backend URL (https://...railway.app): " RAILWAY_URL
    if [[ -z "$RAILWAY_URL" ]]; then
        echo "❌ Railway URL cannot be empty"
        exit 1
    fi
    print_done "Railway backend deployed"

    # Step 4: Vercel
    print_header "STEP 4: Deploy Frontend to Vercel (FREE)"

    echo ""
    echo "🔗 Go to: https://vercel.com/dashboard"
    echo ""
    echo "Instructions:"
    echo "  1. Click \"Add New\" → \"Project\""
    echo "  2. Click \"Import Git Repository\""
    echo "  3. Select GrowAgentAI repository"
    echo "  4. Set ROOT DIRECTORY: frontend/packages/web"
    echo "  5. Add Environment Variable:"
    echo ""
    echo "    • VITE_API_URL=${RAILWAY_URL}/api"
    echo "    • VITE_APP_VERSION=2.0.0"
    echo ""

    read -p "📋 Vercel frontend URL (https://...vercel.app): " VERCEL_URL
    if [[ -z "$VERCEL_URL" ]]; then
        echo "❌ Vercel URL cannot be empty"
        exit 1
    fi
    print_done "Vercel frontend deployed"

    # Step 5: Update GitHub OAuth
    print_header "STEP 5: Update GitHub OAuth Settings"

    echo ""
    echo "🔗 Go to: GitHub Settings → Developer settings → OAuth Apps"
    echo ""
    echo "Update Authorization callback URL to:"
    echo "   ${RAILWAY_URL}/auth/github/callback"
    echo ""
    read -p "   Press ENTER after updating GitHub OAuth..."

    # Summary
    print_header "✅ DEPLOYMENT COMPLETE!"

    echo ""
    echo "📱 Frontend URL: ${VERCEL_URL}"
    echo "🔧 Backend URL: ${RAILWAY_URL}"
    echo "🗄️  Database: Neon PostgreSQL"
    echo ""
    echo "💰 Cost: $0/month (using free tiers)"
    echo ""
    echo "🚀 Next steps:"
    echo "   1. Visit: ${VERCEL_URL}"
    echo "   2. Login with GitHub"
    echo "   3. Create a new session"
    echo "   4. Send a message"
    echo "   5. Bot should respond with coaching + RAG context"
    echo ""
    echo "❓ Need help? Check DEPLOYMENT_FREE_TIER.md"
    echo ""
}

main "$@"
